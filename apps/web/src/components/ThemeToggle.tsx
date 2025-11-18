import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

/**
 * Premium theme toggle component
 * Supports light, dark, and system preferences
 */
export default function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  const themes = [
    { value: 'light' as const, icon: FiSun, label: 'Light' },
    { value: 'dark' as const, icon: FiMoon, label: 'Dark' },
    { value: 'system' as const, icon: FiMonitor, label: 'System' },
  ];

  return (
    <div className="relative inline-flex items-center gap-1 p-1 bg-surface-hover rounded-xl border border-border">
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;

        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              relative px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${isActive
                ? 'text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
              }
            `}
            aria-label={`Switch to ${label} mode`}
            title={label}
          >
            {isActive && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 bg-surface border border-border rounded-lg shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="relative w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Simple icon-only theme toggle (for compact spaces)
 */
export function ThemeToggleSimple() {
  const { isDark, setTheme, theme } = useTheme();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-surface border border-border hover:bg-surface-hover transition-all duration-200"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDark ? (
          <FiMoon className="w-5 h-5 text-text-primary" />
        ) : (
          <FiSun className="w-5 h-5 text-text-primary" />
        )}
      </motion.div>
    </motion.button>
  );
}
