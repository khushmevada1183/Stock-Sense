"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import ThemeToggle from '../ui/ThemeToggle';

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUI();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ensure component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Stocks', href: '/stocks' },
    { name: 'Market', href: '/market' },
    { name: 'IPOs', href: '/ipo' },
    { name: 'News', href: '/news' },
    { name: 'Dashboard', href: '/dashboard' }
  ];
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/stocks/${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Stock Analyzer
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block relative w-64 lg:w-80">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks (e.g., ITC)"
                className="w-full py-2 pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                aria-label="Search stocks"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </div>
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 hover:text-blue-800"
              >
                Go
              </button>
            </form>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mounted ? (
                  isMobileMenuOpen ? <X size={24} suppressHydrationWarning /> : <Menu size={24} suppressHydrationWarning />
                ) : (
                  <span className="w-6 h-6"></span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2 py-1 rounded-md font-medium ${
                    isActive(item.href)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Search Bar (Mobile) */}
            <div className="mt-4 px-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks (e.g., ITC)"
                  className="w-full py-2 pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="Search stocks"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
                </div>
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-600 hover:text-blue-800"
                >
                  Go
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 