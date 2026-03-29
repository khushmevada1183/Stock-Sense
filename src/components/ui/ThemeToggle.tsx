"use client";

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-2 rounded-full transition-all duration-300 ${
        isDark
          ? 'bg-gray-900/90 backdrop-blur-lg text-gray-300 hover:text-white hover:bg-gray-700/90'
          : 'bg-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-300'
      }`}
    >
      {isDark ? (
        <Sun size={20} className="transition-transform hover:scale-110" />
      ) : (
        <Moon size={20} className="transition-transform hover:scale-110" />
      )}
    </button>
  );
};

export default ThemeToggle; 