// ==========================================
// src/components/Toast.js
// Lightweight toast notification system.
//
// USAGE:
//   1. Wrap your app with <ToastProvider>
//   2. Call useToast() in any component:
//        const toast = useToast();
//        toast.show('Post liked! ❤️');
//        toast.show('Error!', 'error');
// ==========================================

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 2.8s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const colors = {
    info:    { bg: '#1e293b', text: '#fff' },
    success: { bg: '#15803d', text: '#fff' },
    error:   { bg: '#b91c1c', text: '#fff' },
    warning: { bg: '#92400e', text: '#fff' },
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Toast container — fixed bottom-center */}
      <div style={{
        position: 'fixed', bottom: 24, left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', gap: 8,
        zIndex: 9999, alignItems: 'center',
      }}>
        {toasts.map(toast => {
          const c = colors[toast.type] || colors.info;
          return (
            <div
              key={toast.id}
              onClick={() => remove(toast.id)}
              style={{
                background: c.bg, color: c.text,
                padding: '10px 20px', borderRadius: '100px',
                fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                animation: 'toastIn 0.3s ease',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {toast.message}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

// Custom hook
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
