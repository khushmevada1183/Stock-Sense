"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, BarChart2, TrendingUp, Briefcase, Newspaper, Home } from 'lucide-react';
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
    { name: 'Home', href: '/', icon: Home },
    { name: 'Stocks', href: '/stocks', icon: BarChart2 },
    { name: 'Market', href: '/market', icon: TrendingUp },
    { name: 'IPOs', href: '/ipo', icon: TrendingUp },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase }
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
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-baseline">
              <span className="font-mono text-2xl font-bold text-blue-400 dark:text-blue-400">
                Stock
              </span>
              <span className="font-flex text-2xl font-light text-blue-300 dark:text-blue-300 ml-1">
                Sense
            </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex space-x-1 bg-gray-800/50 backdrop-blur-sm rounded-lg p-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
              <Link
                key={item.name}
                href={item.href}
                    className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
                      item.name === 'Home' ? 'font-mono font-medium text-sm' : 
                      item.name === 'Stocks' ? 'font-serif italic text-sm tracking-wide' : 
                      item.name === 'Market' ? 'font-serif uppercase text-xs tracking-wider' : 
                      item.name === 'IPOs' ? 'font-mono text-sm font-bold' : 
                      item.name === 'News' ? 'font-flex text-sm tracking-tight' : 
                      'font-flex font-medium text-sm'
                    } ${
                      active
                        ? 'bg-blue-600/90 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={16} className={`mr-1.5 ${active ? 'text-blue-200' : 'text-gray-400'}`} />
                {item.name}
              </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block relative w-64 lg:w-80">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks (e.g., RELIANCE)"
                className="w-full py-2 pl-10 pr-4 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-200 placeholder-gray-400"
                aria-label="Search stocks"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
              </div>
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-400 hover:text-blue-300 font-mono"
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
                className="text-gray-400 hover:text-blue-400"
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
          <div className="lg:hidden py-4 border-t border-gray-700 bg-gray-800/95 backdrop-blur-sm rounded-b-lg shadow-lg">
            <nav className="flex flex-col space-y-1 px-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                <Link
                  key={item.name}
                  href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      item.name === 'Home' ? 'font-mono font-medium text-sm' : 
                      item.name === 'Stocks' ? 'font-serif italic text-sm tracking-wide' : 
                      item.name === 'Market' ? 'font-serif uppercase text-xs tracking-wider' : 
                      item.name === 'IPOs' ? 'font-mono text-sm font-bold' : 
                      item.name === 'News' ? 'font-flex text-sm tracking-tight' : 
                      'font-flex font-medium text-sm'
                    } ${
                      active
                        ? 'bg-blue-600/80 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                    <Icon size={16} className={`mr-2 ${active ? 'text-blue-200' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
                );
              })}
            </nav>
            
            {/* Search Bar (Mobile) */}
            <div className="mt-4 px-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks (e.g., RELIANCE)"
                  className="w-full py-2 pl-10 pr-4 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-200 placeholder-gray-400"
                  aria-label="Search stocks"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
                </div>
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-400 hover:text-blue-300 font-mono"
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