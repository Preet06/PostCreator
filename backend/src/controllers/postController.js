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

// @desc    Get all posts for current user with filters, search, and pagination
// @route   GET /api/posts
// @access  Private
exports.getMyPosts = async (req, res) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = { userId: req.user._id };

        // Filter by status
        if (status && status !== 'all') {
            query.status = status;
        }

        // Search in content
        if (search) {
            query.content = { $regex: search, $options: 'i' };
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const posts = await Post.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('getMyPosts error:', error.message);
        res.status(500).json({ message: 'Server error while fetching posts' });
    }
};

// @desc    Get posts grouped by date for calendar view
// @route   GET /api/posts/calendar
// @access  Private
exports.getCalendarPosts = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        // Calculate start and end of month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Find posts scheduled in this month
        const posts = await Post.find({
            userId: req.user._id,
            scheduledAt: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort('scheduledAt');

        // Group posts by date
        const groupedPosts = {};
        posts.forEach(post => {
            if (post.scheduledAt) {
                const dateKey = post.scheduledAt.toISOString().split('T')[0];
                if (!groupedPosts[dateKey]) {
                    groupedPosts[dateKey] = [];
                }
                groupedPosts[dateKey].push(post);
            }
        });

        res.status(200).json({
            success: true,
            data: groupedPosts
        });
    } catch (error) {
        console.error('getCalendarPosts error:', error.message);
        res.status(500).json({ message: 'Server error while fetching calendar posts' });
    }
};

// @desc    Delete multiple posts
// @route   DELETE /api/posts/bulk
// @access  Private
exports.bulkDeletePosts = async (req, res) => {
    try {
        const { postIds } = req.body;

        if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
            return res.status(400).json({ message: 'Post IDs array is required' });
        }

        // Delete only posts that belong to the user
        const result = await Post.deleteMany({
            _id: { $in: postIds },
            userId: req.user._id
        });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} post(s) deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('bulkDeletePosts error:', error.message);
        res.status(500).json({ message: 'Server error while deleting posts' });
    }
};
