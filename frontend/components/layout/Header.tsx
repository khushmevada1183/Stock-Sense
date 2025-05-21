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
    <header className="sticky top-2 sm:top-4 z-50 mx-auto w-[98%] sm:w-[95%] px-1 sm:px-2">
      <div className="bg-gray-950/70 backdrop-blur-xl rounded-full shadow-lg border border-gray-800/30">
        <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="flex items-baseline">
              <span className="font-mono text-lg sm:text-xl font-bold text-neon-400 dark:text-neon-400 neon-glow-text">
                Stock
              </span>
              <span className="font-flex text-lg sm:text-xl font-light text-gray-300 dark:text-gray-300 ml-1">
                Sense
            </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex space-x-1 rounded-full p-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
              <Link
                key={item.name}
                href={item.href}
                    className={`flex items-center px-3 py-1.5 rounded-full transition-all duration-200 ${
                      item.name === 'Home' ? 'font-mono font-medium text-sm' : 
                      item.name === 'Stocks' ? 'font-serif italic text-sm tracking-wide' : 
                      item.name === 'Market' ? 'font-serif uppercase text-xs tracking-wider' : 
                      item.name === 'IPOs' ? 'font-mono text-sm font-bold' : 
                      item.name === 'News' ? 'font-flex text-sm tracking-tight' : 
                      'font-flex font-medium text-sm'
                    } ${
                      active
                        ? 'bg-gray-850 text-neon-400 shadow-neon-sm'
                        : 'text-gray-300 hover:text-neon-400 hover:bg-gray-850/40'
                    }`}
                  >
                    <Icon size={16} className={`mr-1.5 ${active ? 'text-neon-400' : 'text-gray-400'}`} />
                {item.name}
              </Link>
                );
              })}
            </div>
          </nav>
          
          {/* Search Bar (Desktop) */}
          <div className="hidden md:block relative w-72 lg:w-80">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks (e.g., RELIANCE)"
                className="w-full py-1.5 pl-9 pr-4 bg-gray-850/50 backdrop-blur-xl border border-gray-700/30 rounded-full focus:outline-none focus:ring-1 focus:ring-neon-400 focus:border-transparent text-sm text-gray-200 placeholder-gray-400"
                aria-label="Search stocks"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              </div>
              <button 
                type="submit"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neon-400 hover:text-neon-300 font-mono"
              >
                Go
              </button>
            </form>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Mobile Menu Button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="text-gray-400 hover:text-neon-400 p-1 transition-colors"
                onClick={toggleMobileMenu}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mounted ? (
                  isMobileMenuOpen ? <X size={22} suppressHydrationWarning /> : <Menu size={22} suppressHydrationWarning />
                ) : (
                  <span className="w-6 h-6"></span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-x-0 top-[60px] mx-4 lg:hidden py-3 sm:py-4 bg-gray-950/90 backdrop-blur-xl rounded-xl shadow-lg px-3 sm:px-4 border border-gray-800/30 glass">
            <nav className="flex flex-col space-y-1 px-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                <Link
                  key={item.name}
                  href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg ${
                      item.name === 'Home' ? 'font-mono font-medium text-sm' : 
                      item.name === 'Stocks' ? 'font-serif italic text-sm tracking-wide' : 
                      item.name === 'Market' ? 'font-serif uppercase text-xs tracking-wider' : 
                      item.name === 'IPOs' ? 'font-mono text-sm font-bold' : 
                      item.name === 'News' ? 'font-flex text-sm tracking-tight' : 
                      'font-flex font-medium text-sm'
                    } ${
                      active
                        ? 'bg-gray-850 text-neon-400 shadow-neon-sm'
                        : 'text-gray-300 hover:text-neon-400 hover:bg-gray-850/40'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                    <Icon size={16} className={`mr-2 ${active ? 'text-neon-400' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
                );
              })}
            </nav>
            
            {/* Search Bar (Mobile) */}
            <div className="mt-3 sm:mt-4 px-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks (e.g., RELIANCE)"
                  className="w-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-4 bg-gray-850/50 backdrop-blur-xl border border-gray-700/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-neon-400 focus:border-transparent text-sm text-gray-200 placeholder-gray-400"
                  aria-label="Search stocks"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3 pointer-events-none">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" aria-hidden="true" />
                </div>
                <button 
                  type="submit"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-neon-400 hover:text-neon-300 font-mono"
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