// ==========================================
// src/hooks/useLocalStorage.js
// Wraps useState but syncs value to localStorage.
// Useful for persisting UI preferences (e.g. active feed tab).
// ==========================================

import { useState } from 'react';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (err) {
      console.warn(`useLocalStorage: failed to save key "${key}"`, err);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch { /* silent */ }
  };

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
