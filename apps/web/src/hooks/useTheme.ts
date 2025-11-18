import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Dark mode hook with system preference support
 * Linear/Stripe style theme management
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let applied: 'light' | 'dark' = 'light';

      if (theme === 'dark') {
        applied = 'dark';
      } else if (theme === 'light') {
        applied = 'light';
      } else {
        // system
        applied = mediaQuery.matches ? 'dark' : 'light';
      }

      setResolvedTheme(applied);

      // Apply to DOM
      if (applied === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen to system theme changes
    mediaQuery.addEventListener('change', applyTheme);

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [theme]);

  const setAndSaveTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setAndSaveTheme,
    isDark: resolvedTheme === 'dark',
  };
}
