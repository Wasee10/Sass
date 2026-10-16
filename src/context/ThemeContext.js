'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

const THEME_EVENT = 'saas-theme-change';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

function subscribe(onChange) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function getThemeSnapshot() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}

function getServerThemeSnapshot() {
  return 'light';
}

export function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    const storedTheme = localStorage.getItem('saas_theme');
    const themeToApply = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    document.documentElement.setAttribute('data-theme', themeToApply);
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('saas_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
