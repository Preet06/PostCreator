const express = require('express');
const router = express.Router();
const { generateVariations, createPost, getMyPosts, updatePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { aiGenerationLimiter } = require('../middleware/securityMiddleware');
const { generateValidation, createPostValidation } = require('../middleware/validator');

router.use(protect);

router.post('/generate', aiGenerationLimiter, generateValidation, generateVariations);
router.post('/', createPostValidation, createPost);
router.get('/', getMyPosts);
router.put('/:id', createPostValidation, updatePost);
router.delete('/:id', deletePost);

module.exports = router;
