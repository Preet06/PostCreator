const Post = require('../models/Post');
const generationService = require('../services/generationService');

// @desc    Generate post variations using AI
// @route   POST /api/posts/generate
// @access  Private
exports.generateVariations = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Input content is required' });
        }

        if (content.length > 500) {
            return res.status(400).json({ message: 'Input content too long (max 500 chars for generation)' });
        }

        const variations = await generationService.generatePostVariations(content);

        res.status(200).json({
            success: true,
            data: variations
        });
    } catch (error) {
        console.error('generateVariations error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
    try {
        const { content, scheduledAt, status } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Post content is required' });
        }

        // Validation for scheduled posts
        if (status === 'scheduled') {
            if (!scheduledAt) {
                return res.status(400).json({ message: 'Scheduled time is required for scheduled posts' });
            }
            if (new Date(scheduledAt) <= new Date()) {
                return res.status(400).json({ message: 'Scheduled time must be in the future' });
            }
        }

        const post = await Post.create({
            userId: req.user._id,
            content,
            scheduledAt: scheduledAt || null,
            status: status || 'draft'
        });

        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('createPost error:', error.message);
        res.status(500).json({ message: 'Server error while creating post' });
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
    try {
        const { content, scheduledAt, status } = req.body;
        let post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Make sure user owns the post
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Validation for scheduled posts
        if (status === 'scheduled' || (post.status === 'scheduled' && scheduledAt)) {
            const timeToCheck = scheduledAt || post.scheduledAt;
            if (new Date(timeToCheck) <= new Date()) {
                return res.status(400).json({ message: 'Scheduled time must be in the future' });
            }
        }

        post = await Post.findByIdAndUpdate(
            req.params.id,
            { content, scheduledAt, status },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('updatePost error:', error.message);
        res.status(500).json({ message: 'Server error while updating post' });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Make sure user owns the post
        if (post.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await post.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('deletePost error:', error.message);
        res.status(500).json({ message: 'Server error while deleting post' });
    }
};

// @desc    Get all posts for current user
// @route   GET /api/posts
// @access  Private
exports.getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user._id }).sort('-createdAt');
        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });
    } catch (error) {
        console.error('getMyPosts error:', error.message);
        res.status(500).json({ message: 'Server error while fetching posts' });
    }
};
