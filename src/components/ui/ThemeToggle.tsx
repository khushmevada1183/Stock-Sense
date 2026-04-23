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
    return <div className="w-11 h-11" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[color:var(--app-border)] bg-[color:var(--app-surface)] p-2 text-[color:var(--app-text-2)] shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:text-[color:var(--app-accent-strong)] ${
        isDark ? 'dark' : ''
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