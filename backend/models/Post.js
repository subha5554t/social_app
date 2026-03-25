// ==========================================
// models/Post.js - Post Schema
// ==========================================

const mongoose = require('mongoose');

// ---- Comment sub-schema (embedded in Post) ----
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// ---- Main Post schema ----
const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true, // Denormalized for fast feed rendering
    },
    avatar: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      maxlength: [1000, 'Post text cannot exceed 1000 characters'],
      default: '',
    },
    image: {
      type: String, // base64 string or URL
      default: '',
    },
    // Array of user IDs who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Embedded comments array
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// ---- Validation: at least one of text or image required ----
postSchema.pre('validate', function (next) {
  if (!this.text && !this.image) {
    return next(new Error('Post must have either text or an image'));
  }
  next();
});

// ---- Virtual: likes count ----
postSchema.virtual('likesCount').get(function () {
  return this.likes.length;
});

// ---- Virtual: comments count ----
postSchema.virtual('commentsCount').get(function () {
  return this.comments.length;
});

module.exports = mongoose.model('Post', postSchema);

/*
  Example Post document:
  {
    "_id": "64f3b2c1e4b0f2a3c4d5e6f8",
    "author": "64f3b2c1e4b0f2a3c4d5e6f7",
    "username": "ramswaroop",
    "avatar": "https://example.com/avatar.jpg",
    "text": "🏆 LEADERBOARD ACHIEVEMENT! I secured rank in TaskPlanet Leaderboard!",
    "image": "data:image/png;base64,...",
    "likes": ["64f3b2c1...", "64f3b2c2..."],
    "comments": [
      {
        "_id": "64f3b2c1e4b0f2a3c4d5e6f9",
        "user": "64f3b2c1e4b0f2a3c4d5e6fa",
        "username": "tejas9v7i",
        "text": "Congratulations! 🎉",
        "createdAt": "2026-03-24T06:45:00.000Z"
      }
    ],
    "createdAt": "2026-03-24T06:39:00.000Z",
    "updatedAt": "2026-03-24T06:40:00.000Z"
  }
*/
