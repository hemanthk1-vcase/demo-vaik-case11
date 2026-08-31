import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const ThemeContext = createContext({ theme: 'light', toggle: () => {}, setTheme: () => {} });

function applyThemeClass(t) {
  const root = document.documentElement;
  if (t === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('vakilcase-theme') || 'light';
    setThemeState(stored);
    applyThemeClass(stored);
  }, []);

  // After auth loads, sync to the user's saved preference (if any).
  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        const pref = me?.data?.theme;
        if (pref && (pref === 'light' || pref === 'dark')) {
          setThemeState(pref);
          applyThemeClass(pref);
          localStorage.setItem('vakilcase-theme', pref);
        }
      } catch (e) { /* not logged in yet — ignore */ }
    })();
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    localStorage.setItem('vakilcase-theme', t);
    applyThemeClass(t);
    try { base44.auth.updateMe({ theme: t }); } catch (e) { /* best-effort */ }
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}