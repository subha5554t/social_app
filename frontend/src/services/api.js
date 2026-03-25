// ==========================================
// src/services/api.js - Centralized API calls
// ==========================================

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Helper: Get the stored JWT token
 */
const getToken = () => localStorage.getItem('token');

/**
 * Helper: Build headers with Authorization token
 */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Helper: Handle API responses uniformly
 */
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ---- Auth API ----

export const authAPI = {
  signup: (userData) =>
    fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }).then(handleResponse),

  login: (credentials) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  getMe: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: authHeaders(),
    }).then(handleResponse),
};

// ---- Posts API ----

export const postsAPI = {
  /**
   * Get paginated feed
   * @param {number} page - page number
   * @param {number} limit - posts per page
   */
  getFeed: (page = 1, limit = 10) =>
    fetch(`${BASE_URL}/posts?page=${page}&limit=${limit}`).then(handleResponse),

  /**
   * Create a new post
   * @param {{ text?: string, image?: string }} postData
   */
  createPost: (postData) =>
    fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(postData),
    }).then(handleResponse),

  /**
   * Toggle like on a post
   * @param {string} postId
   */
  toggleLike: (postId) =>
    fetch(`${BASE_URL}/posts/${postId}/like`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handleResponse),

  /**
   * Add a comment to a post
   * @param {string} postId
   * @param {string} text
   */
  addComment: (postId, text) =>
    fetch(`${BASE_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    }).then(handleResponse),

  /**
   * Delete a post
   * @param {string} postId
   */
  deletePost: (postId) =>
    fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};
