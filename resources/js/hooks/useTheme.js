import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';

// Shared listeners for cross-component synchronization
let listeners = [];
function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}
function notifyAll() {
  listeners.forEach(l => l());
}
function getSnapshot() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('theme') || 'dark';
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setTheme = useCallback((value) => {
    const newTheme = typeof value === 'function' ? value(getSnapshot()) : value;
    localStorage.setItem('theme', newTheme);
    notifyAll();
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getSnapshot();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    notifyAll();
  }, []);

  return { theme, setTheme, toggleTheme };
}
