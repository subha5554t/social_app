const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

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

export const postsAPI = {
  getFeed: (page = 1, limit = 10) =>
    fetch(`${BASE_URL}/posts?page=${page}&limit=${limit}`).then(handleResponse),

  createPost: (postData) =>
    fetch(`${BASE_URL}/posts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(postData),
    }).then(handleResponse),

  toggleLike: (postId) =>
    fetch(`${BASE_URL}/posts/${postId}/like`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handleResponse),

  addComment: (postId, text) =>
    fetch(`${BASE_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text }),
    }).then(handleResponse),

  deletePost: (postId) =>
    fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),
};