"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, BarChart2, TrendingUp, Briefcase, Newspaper, Home } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import ThemeToggle from '../ui/ThemeToggle';
import SearchBar from '../../app/components/SearchBar';

const Header = () => {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUI();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll position for header background intensity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Stocks', href: '/stocks', icon: BarChart2 },
    { name: 'Market', href: '/market', icon: TrendingUp },
    { name: 'IPOs', href: '/ipo', icon: TrendingUp },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase }
  ];
  
  const isActive = (path: string) => pathname === path;
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto w-[98%] sm:w-[95%] px-1 sm:px-2 pt-2 sm:pt-4">
        <div className={`rounded-full shadow-lg border transition-all duration-500 ${
          scrolled 
            ? 'bg-gray-950/70 backdrop-blur-2xl border-gray-800/30 shadow-glass' 
            : 'bg-gray-950/40 backdrop-blur-xl border-gray-800/20'
        }`}>
          <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="flex items-baseline">
                <span className="font-mono text-lg sm:text-xl font-bold text-neon-400 neon-glow-text transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(57,255,20,0.5)]">
                  Stock
                </span>
                <span className="font-flex text-lg sm:text-xl font-light text-gray-300 ml-1">
                  Sense
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <div className="flex space-x-0.5 rounded-full p-1 bg-gray-900/30 border border-gray-800/20">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                        active
                          ? 'bg-neon-400/10 text-neon-400 shadow-neon-sm'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                      }`}
                    >
                      <Icon size={15} className={`mr-1.5 transition-colors duration-300 ${active ? 'text-neon-400' : 'text-gray-500'}`} />
                      {item.name}
                      {active && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-neon-400 rounded-full shadow-neon-sm" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
            
            {/* Search Bar (Desktop) */}
            <div className="hidden md:block relative w-72 lg:w-80">
              <SearchBar compact={true} showDetailsInline={false} onSearchComplete={(symbol) => {}} />
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <ThemeToggle />
              
              {/* Mobile Menu Button */}
              <div className="flex lg:hidden">
                <button
                  type="button"
                  className="relative text-gray-400 hover:text-neon-400 p-1.5 rounded-full transition-all duration-300 hover:bg-gray-800/40"
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
            <div className="absolute inset-x-4 top-16 lg:hidden bg-gray-950/90 backdrop-blur-2xl rounded-2xl shadow-glass-hover px-4 py-4 border border-gray-800/30 animate-scale-in">
              <nav className="flex flex-col space-y-1 px-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        active
                          ? 'bg-neon-400/10 text-neon-400 shadow-neon-sm'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={16} className={`mr-2.5 ${active ? 'text-neon-400' : 'text-gray-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              
              {/* Search Bar (Mobile) */}
              <div className="mt-4 px-1">
                <SearchBar compact={true} isMobile={true} showDetailsInline={false} onSearchComplete={(symbol) => {}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;