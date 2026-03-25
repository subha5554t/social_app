// ==========================================
// src/hooks/usePosts.js
// Custom hook that encapsulates all feed state logic.
// Keeps Feed.js clean — just call this hook and render.
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { postsAPI } from '../services/api';

const usePosts = () => {
  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]           = useState('');
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);

  // ---- Fetch a page of posts ----
  const fetchPosts = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError('');

    try {
      const data = await postsAPI.getFeed(pageNum, 10);
      setPosts(prev => pageNum === 1 ? data.posts : [...prev, ...data.posts]);
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { fetchPosts(1); }, [fetchPosts]);

  // ---- Add a new post to the top of the feed ----
  const addPost = (post) => {
    setPosts(prev => [post, ...prev]);
  };

  // ---- Remove a deleted post from state ----
  const removePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  // ---- Update a post in-place (e.g. after like/comment) ----
  const updatePost = (postId, updater) => {
    setPosts(prev =>
      prev.map(p => p._id === postId ? { ...p, ...updater(p) } : p)
    );
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) fetchPosts(page + 1);
  };

  const refresh = () => fetchPosts(1);

  return {
    posts, loading, loadingMore, error,
    hasMore, addPost, removePost, updatePost,
    loadMore, refresh,
  };
};

export default usePosts;
