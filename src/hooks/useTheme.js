import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  layout: 'web',
  setLayout: () => {},
  toggleLayout: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => localStorage.getItem('theme') || 'dark');
  const [layout, setLayoutState] = useState(() => localStorage.getItem('layout') || 'web');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    const body = window.document.body;
    body.classList.remove('layout-web', 'layout-print');
    body.classList.add(`layout-${layout}`);
    localStorage.setItem('layout', layout);
  }, [layout]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const setLayout = useCallback((newLayout) => {
    if (newLayout === 'web' || newLayout === 'print') {
      setLayoutState(newLayout);
    }
  }, []);

  const toggleLayout = useCallback(() => {
    setLayoutState(prevLayout => (prevLayout === 'web' ? 'print' : 'web'));
  }, []);

  const value = { theme, setTheme, toggleTheme, layout, setLayout, toggleLayout };

  return (
    React.createElement(ThemeContext.Provider, { value }, children)
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};