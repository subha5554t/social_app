// ==========================================
// src/components/PostCard.js
// Displays a single post with like + comment functionality
// ==========================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';

// Format timestamp to readable relative time
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user } = useAuth();

  // ---- Local state ----
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [error, setError] = useState('');

  // Check if current user liked this post
  const isLiked = user && likes.some((id) => id === user._id || id?._id === user._id);

  // ---- Like toggle ----
  const handleLike = async () => {
    if (!user) return;
    if (isLiking) return; // Prevent double-click

    // Optimistic UI update — update immediately, then confirm with server
    setIsLiking(true);
    const wasLiked = isLiked;

    if (wasLiked) {
      setLikes((prev) => prev.filter((id) => id !== user._id && id?._id !== user._id));
    } else {
      setLikes((prev) => [...prev, user._id]);
    }

    try {
      const data = await postsAPI.toggleLike(post._id);
      // Sync with server response
      setLikes(data.likes);
    } catch (err) {
      // Revert on error
      setLikes(post.likes);
      setError('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  // ---- Add comment ----
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    if (isCommenting) return;

    setIsCommenting(true);
    setError('');

    // Optimistic: show comment immediately
    const tempComment = {
      _id: Date.now().toString(), // temp ID
      user: user._id,
      username: user.username,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, tempComment]);
    setCommentText('');

    try {
      const data = await postsAPI.addComment(post._id, tempComment.text);
      // Replace temp comment with server response
      setComments((prev) =>
        prev.map((c) => (c._id === tempComment._id ? data.comment : c))
      );
    } catch (err) {
      // Revert on error
      setComments((prev) => prev.filter((c) => c._id !== tempComment._id));
      setCommentText(tempComment.text);
      setError('Failed to post comment');
    } finally {
      setIsCommenting(false);
    }
  };

  // ---- Delete post ----
  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsAPI.deletePost(post._id);
      onDelete(post._id);
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const isOwnPost = user && post.author === user._id;

  return (
    <div className="post-card">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-info">
          {/* Avatar */}
          <div className="post-avatar">
            {post.avatar ? (
              <img src={post.avatar} alt={post.username} />
            ) : (
              post.username?.[0]?.toUpperCase()
            )}
          </div>

          <div>
            <div className="post-author-name">{post.username}</div>
            <div className="post-author-handle">@{post.username?.toLowerCase()}</div>
            <div className="post-timestamp">{formatDate(post.createdAt)}</div>
          </div>
        </div>

        {/* Delete button (own posts only) */}
        {isOwnPost && (
          <button className="post-delete-btn" onClick={handleDelete} title="Delete post">
            🗑️
          </button>
        )}
      </div>

      {/* Post Text */}
      {post.text && <p className="post-text">{post.text}</p>}

      {/* Post Image */}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="post-image"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}

      {/* Error */}
      {error && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: 8 }}>{error}</p>}

      {/* Action Buttons */}
      <div className="post-actions">
        {/* Like Button */}
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={isLiking || !user}
        >
          {/* Heart icon */}
          <svg viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likes.length}
        </button>

        {/* Comment Button */}
        <button
          className="action-btn"
          onClick={() => setShowComments((prev) => !prev)}
        >
          {/* Comment bubble icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {comments.length}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          {/* Existing Comments */}
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div className="comment-item" key={comment._id}>
                <div className="comment-avatar">
                  {comment.username?.[0]?.toUpperCase()}
                </div>
                <div className="comment-body">
                  <div className="comment-username">@{comment.username}</div>
                  <div className="comment-text">{comment.text}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
              No comments yet. Be the first!
            </p>
          )}

          {/* Add Comment Form */}
          {user && (
            <form className="comment-form" onSubmit={handleComment}>
              <input
                className="comment-input"
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                maxLength={500}
              />
              <button
                type="submit"
                className="comment-submit"
                disabled={!commentText.trim() || isCommenting}
              >
                {isCommenting ? '...' : 'Post'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
