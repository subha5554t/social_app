// ==========================================
// controllers/postController.js
// ==========================================

const Post = require('../models/Post');

/**
 * POST /api/posts
 * Create a new post (protected)
 */
const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    // At least one field is required (validation also in model)
    if (!text && !image) {
      return res.status(400).json({ message: 'Post must have text or an image' });
    }

    const post = await Post.create({
      author: req.user._id,
      username: req.user.username,
      avatar: req.user.avatar,
      text: text || '',
      image: image || '',
    });

    res.status(201).json({
      message: 'Post created successfully',
      post,
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error while creating post' });
  }
};

/**
 * GET /api/posts
 * Get all posts (public feed) with pagination
 * Query params: page (default: 1), limit (default: 10)
 */
const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch posts sorted by newest first
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() returns plain JS objects (faster, no mongoose overhead)

    const total = await Post.countDocuments();
    const hasMore = skip + posts.length < total;

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (err) {
    console.error('Get feed error:', err);
    res.status(500).json({ message: 'Server error while fetching posts' });
  }
};

/**
 * PUT /api/posts/:id/like
 * Toggle like on a post (protected)
 * If user already liked → unlike; else → like
 */
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const alreadyLiked = post.likes.some((id) => id.toString() === userId);

    if (alreadyLiked) {
      // Remove like
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      // Add like
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      liked: !alreadyLiked,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({ message: 'Server error while updating like' });
  }
};

/**
 * POST /api/posts/:id/comment
 * Add a comment to a post (protected)
 */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Build comment object
    const comment = {
      user: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    // Return the newly added comment (last in the array)
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      message: 'Comment added',
      comment: newComment,
      commentsCount: post.comments.length,
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({ message: 'Server error while adding comment' });
  }
};

/**
 * DELETE /api/posts/:id
 * Delete a post (protected, only by author)
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only the author can delete their post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: 'Server error while deleting post' });
  }
};

module.exports = { createPost, getFeed, toggleLike, addComment, deletePost };
