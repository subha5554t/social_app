// ==========================================
// routes/posts.js - Post Routes
// ==========================================

const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// GET  /api/posts          → Public feed (no auth needed to view)
router.get('/', getFeed);

// POST /api/posts          → Create post (auth required)
router.post('/', protect, createPost);

// PUT  /api/posts/:id/like → Toggle like (auth required)
router.put('/:id/like', protect, toggleLike);

// POST /api/posts/:id/comment → Add comment (auth required)
router.post('/:id/comment', protect, addComment);

// DELETE /api/posts/:id   → Delete post (auth required, own posts only)
router.delete('/:id', protect, deletePost);

module.exports = router;
