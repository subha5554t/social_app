// ==========================================
// src/pages/CreatePost.js
// ==========================================

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';

const MAX_TEXT = 1000;

const CreatePost = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [text, setText] = useState('');
  const [image, setImage] = useState(''); // base64 string
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---- Convert selected file to base64 ----
  const handleFileChange = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);       // Full base64 string for API
      setImagePreview(reader.result); // Preview in UI
    };
    reader.readAsDataURL(file);
  };

  // ---- Drag & Drop handlers ----
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const removeImage = () => {
    setImage('');
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---- Submit post ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!text.trim() && !image) {
      setError('Please write something or upload an image');
      return;
    }

    setLoading(true);

    try {
      await postsAPI.createPost({ text: text.trim(), image });
      navigate('/');  // Go back to feed on success
    } catch (err) {
      setError(err.message || 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_TEXT;

  return (
    <div className="create-post-page">
      <div className="create-post-card">
        <h2>✏️ Create a Post</h2>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Text area */}
          <div className="form-group">
            <label>What's on your mind?</label>
            <textarea
              className="post-textarea"
              placeholder="Share your thoughts, achievements, or anything..."
              value={text}
              onChange={(e) => { setText(e.target.value); setError(''); }}
              maxLength={MAX_TEXT + 50} // Allow typing past limit so they see the error
            />
            <div className={`char-count ${isOverLimit ? 'warn' : ''}`}>
              {charCount}/{MAX_TEXT}
            </div>
          </div>

          {/* Image upload area */}
          {!imagePreview ? (
            <div
              className={`image-upload-area ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
              />
              <div className="image-upload-text">
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📷</div>
                <p>
                  <strong>Click to upload</strong> or drag & drop
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: 4, color: 'var(--text-muted)' }}>
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              </div>
            </div>
          ) : (
            /* Image preview */
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <button
                type="button"
                className="image-remove-btn"
                onClick={removeImage}
                title="Remove image"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action buttons */}
          <div className="create-post-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || isOverLimit || (!text.trim() && !image)}
            >
              {loading ? '⏳ Posting...' : '📤 Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
