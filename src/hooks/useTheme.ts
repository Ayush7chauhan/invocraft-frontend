import { useState, useEffect } from "react";

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
      
      // Apply immediately to prevent flash
      const html = document.documentElement;
      const body = document.body;
      
      if (shouldBeDark) {
        html.classList.add('dark');
        body.classList.add('dark');
      } else {
        html.classList.remove('dark');
        body.classList.remove('dark');
      }
      
      return shouldBeDark;
    }
    return false;
  });

  useEffect(() => {
    // Sync with actual DOM state on mount
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark !== isDarkMode) {
      setIsDarkMode(isDark);
    }
  }, [isDarkMode]);

  const applyTheme = (dark: boolean) => {
    const html = document.documentElement;
    const body = document.body;
    
    // Apply theme immediately for smooth transition
    if (dark) {
      html.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    applyTheme(newMode);
    
    // Trigger a custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark: newMode } }));
  };

  // Listen for theme changes from other components
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const newMode = e.detail.isDark;
      setIsDarkMode(newMode);
      applyTheme(newMode);
    };
    
    window.addEventListener('themechange', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
    };
  }, []);

  return { isDarkMode, toggleTheme };
}
