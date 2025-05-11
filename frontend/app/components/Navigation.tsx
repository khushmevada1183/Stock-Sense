'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Moon, Sun, Menu, X, Bug } from 'lucide-react';
import { useTheme } from 'next-themes';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, className = '' }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={`px-3 py-2 rounded-md text-sm transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-gray-700 hover:text-primary hover:bg-primary/5 dark:text-gray-300 dark:hover:text-primary'
      } ${className}`}
    >
      {children}
    </Link>
  );
};

// Custom icon component to fix hydration issues
const HydrationSafeIcon = ({ icon: IconComponent, className }: { icon: React.ElementType, className?: string }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <span suppressHydrationWarning>
      {mounted ? <IconComponent className={className} /> : null}
    </span>
  );
};

const Navigation: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Use a static default icon initially and only show the theme-dependent one after mounting
  const ThemeIcon = mounted ? (theme === 'dark' ? Sun : Moon) : null;
  
  return (
    <>
      <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Indian Stock Analyzer</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <div className="flex space-x-1">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/stocks">Stocks</NavLink>
                <NavLink href="/search">Advanced Search</NavLink>
                <NavLink href="/mutual-funds">Mutual Funds</NavLink>
                <NavLink href="/commodities">Commodities</NavLink>
                <NavLink href="/ipo">IPO</NavLink>
                <NavLink href="/api/documentation">API Docs</NavLink>
                <NavLink href="/api-debug" className="text-amber-600 dark:text-amber-500 font-medium">
                  <span suppressHydrationWarning>
                    {mounted && <Bug className="inline-block w-4 h-4 mr-1" />} Debug
                  </span>
                </NavLink>
              </div>
              <div className="ml-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  suppressHydrationWarning
                >
                  {mounted && ThemeIcon && <ThemeIcon className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="mr-2"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {mounted && ThemeIcon && <ThemeIcon className="h-5 w-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                aria-label="Open menu"
                suppressHydrationWarning
              >
                {mounted ? (
                  isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />
                ) : null}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink href="/dashboard" className="block">Dashboard</NavLink>
              <NavLink href="/stocks" className="block">Stocks</NavLink>
              <NavLink href="/search" className="block">Advanced Search</NavLink>
              <NavLink href="/mutual-funds" className="block">Mutual Funds</NavLink>
              <NavLink href="/commodities" className="block">Commodities</NavLink>
              <NavLink href="/ipo" className="block">IPO</NavLink>
              <NavLink href="/api/documentation" className="block">API Docs</NavLink>
              <NavLink href="/api-debug" className="block text-amber-600 dark:text-amber-500 font-medium">
                <span suppressHydrationWarning>
                  {mounted && <Bug className="inline-block w-4 h-4 mr-1" />} Debug
                </span>
              </NavLink>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation; 