// ==========================================
// src/components/Navbar.js
// ==========================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get initial letter for avatar
  const initial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        🌐 <span>Social</span>
      </Link>

      {/* Right side actions */}
      <div className="navbar-actions">
        <Link to="/create" className="nav-btn nav-btn-primary">
          ✏️ Post
        </Link>

        <div className="nav-avatar" title={`@${user?.username}`}>
          {initial}
        </div>

        <button className="nav-btn nav-btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
