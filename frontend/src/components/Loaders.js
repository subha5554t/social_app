// ==========================================
// src/components/Loaders.js
// Reusable loading components:
//   <Spinner />         — centered full-page spinner
//   <SkeletonCard />    — shimmer placeholder for a post card
//   <SkeletonCards n /> — renders n skeleton cards
// ==========================================

import React from 'react';

// ---- Full-page centered spinner ----
export const Spinner = ({ size = 40 }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', minHeight: '200px',
  }}>
    <div style={{
      width: size, height: size,
      border: '3px solid #e2e8f0',
      borderTopColor: '#2563eb',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ---- Single shimmer skeleton card ----
export const SkeletonCard = () => (
  <div style={{
    background: '#fff', borderRadius: '16px', padding: '20px',
    marginBottom: '12px', border: '1px solid #e2e8f0',
  }}>
    <style>{`
      .sk {
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 200% 100%;
        animation: shimmer 1.4s infinite;
        border-radius: 4px;
      }
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>

    {/* Author row */}
    <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
      <div className="sk" style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="sk" style={{ height: 13, width: '38%' }} />
        <div className="sk" style={{ height: 10, width: '22%' }} />
      </div>
    </div>

    {/* Text lines */}
    <div className="sk" style={{ height: 13, marginBottom: 8 }} />
    <div className="sk" style={{ height: 13, width: '85%', marginBottom: 8 }} />
    <div className="sk" style={{ height: 13, width: '60%', marginBottom: 14 }} />

    {/* Image placeholder */}
    <div className="sk" style={{ height: 160, borderRadius: 8 }} />
  </div>
);

// ---- Render n skeleton cards ----
export const SkeletonCards = ({ n = 3 }) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </>
);
