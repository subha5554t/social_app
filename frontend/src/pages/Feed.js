// ==========================================
// src/pages/Feed.js - Main social feed page
// ==========================================

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 10, width: '25%' }} />
      </div>
    </div>
    <div className="skeleton" style={{ height: 14, marginBottom: 8 }} />
    <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 8 }} />
    <div className="skeleton" style={{ height: 160, borderRadius: 8 }} />
  </div>
);

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial posts on mount
  const loadPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');

    try {
      const data = await postsAPI.getFeed(pageNum, 10);

      if (reset || pageNum === 1) {
        setPosts(data.posts);
      } else {
        // Append to existing posts (infinite scroll / load more)
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // Remove a post from state when deleted
  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  // Load more posts
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1);
    }
  };

  return (
    <div className="feed-page">
      {/* Header */}
      <div className="feed-header">
        <h2>🌐 Social Feed</h2>
        <p>See what's happening in the community</p>
      </div>

      {/* Filter tabs (UI only — extend as needed) */}
      <div className="filter-tabs">
        <button className="filter-tab active">All Posts</button>
        <button className="filter-tab">Most Liked</button>
        <button className="filter-tab">Most Commented</button>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          ⚠️ {error}
          <button
            onClick={() => loadPosts(1)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 600 }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      )}

      {/* Posts list */}
      {!loading && posts.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>No posts yet</h3>
          <p style={{ marginBottom: 20 }}>Be the first to share something!</p>
          <Link to="/create" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '12px 28px' }}>
            ✏️ Create a Post
          </Link>
        </div>
      )}

      {!loading &&
        posts.map((post) => (
          <PostCard key={post._id} post={post} onDelete={handleDelete} />
        ))}

      {/* Load More */}
      {!loading && hasMore && posts.length > 0 && (
        <div className="load-more-container">
          <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? 'Loading...' : 'Load More Posts'}
          </button>
        </div>
      )}

      {/* End of feed */}
      {!loading && !hasMore && posts.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
          🎉 You've seen all posts!
        </p>
      )}
    </div>
  );
};

export default Feed;
