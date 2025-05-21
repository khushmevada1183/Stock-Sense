"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10"></div>; // Placeholder to prevent layout shift
  }

  return (
    <button
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-full transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-850/50 text-neon-400 hover:text-neon-300 hover:bg-gray-800/70 hover:shadow-neon-sm' 
          : 'bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-200'
      }`}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="transition-transform hover:scale-110" />
      ) : (
        <Moon size={20} className="transition-transform hover:scale-110" />
      )}
    </button>
  );
};

export default ThemeToggle; 