'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart2, TrendingUp, Briefcase, Newspaper, Home, LogOut, Eye, Bell } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import SearchBar from '../../app/components/SearchBar';
import { getNotifications } from '@/api/api';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const Header = () => {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUI();
  const { isAuthenticated, user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Stocks', href: '/stocks', icon: BarChart2 },
    { name: 'Market', href: '/market', icon: TrendingUp },
    { name: 'IPOs', href: '/ipo', icon: TrendingUp },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Watchlists', href: '/watchlists', icon: Eye },
    { name: 'Alerts', href: '/alerts', icon: TrendingUp }
  ];
  
  const isActive = (path: string) => pathname === path;
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      if (!isAuthenticated) {
        if (active) {
          setUnreadCount(0);
        }
        return;
      }

      try {
        const response = await getNotifications({ limit: 50 });
        const notifications = Array.isArray(response?.data?.notifications)
          ? response.data.notifications
          : [];

        const unread = notifications.filter((item: { read?: boolean; isRead?: boolean }) => !item.read && !item.isRead).length;
        if (active) {
          setUnreadCount(unread);
        }
      } catch {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [isAuthenticated]);
  
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto w-[98%] sm:w-[95%] px-1 sm:px-2 pt-2 sm:pt-4">
        <div className="header-pill rounded-full shadow-lg border backdrop-blur-xl transition-all duration-300">
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
                          ? 'bg-neon-400/10 text-neon-400 shadow-neon-sm neon-glow-text'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/40'
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
              <SearchBar compact={true} showDetailsInline={false} onSearchComplete={() => {}} />
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isAuthenticated ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Link href="/notifications" className="relative p-1.5 rounded-full border border-gray-700/40 text-gray-300 hover:text-white transition-all duration-300">
                    <Bell size={14} />
                    {unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    ) : null}
                  </Link>
                  <span className="text-xs text-gray-400 max-w-[130px] truncate" title={user?.email || ''}>
                    {user?.fullName || user?.email}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs border border-gray-700/40 text-gray-300 hover:text-white hover:border-neon-400/40 transition-all duration-300"
                  >
                    <LogOut size={12} className="mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    href="/auth/login"
                    className="px-3 py-1.5 rounded-full text-xs text-gray-300 hover:text-white border border-gray-700/40 hover:border-neon-400/40 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-1.5 rounded-full text-xs text-black bg-neon-400 hover:bg-neon-300 transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

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
            <div className="absolute inset-x-4 top-16 lg:hidden header-pill backdrop-blur-2xl rounded-2xl shadow-glass-hover px-4 py-4 border animate-scale-in">
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
                          ? 'bg-neon-400/10 text-neon-400 shadow-neon-sm neon-glow-text'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/40'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon size={16} className={`mr-2.5 ${active ? 'text-neon-400' : 'text-gray-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}

                {isAuthenticated ? (
                  <>
                    <Link
                      href="/notifications"
                      className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Bell size={16} className="mr-2.5" />
                      Notifications ({unreadCount})
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 transition-all duration-300"
                    >
                      <LogOut size={16} className="mr-2.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Link
                      href="/auth/login"
                      className="text-center px-3 py-2 rounded-lg text-xs border border-gray-700/40 text-gray-300 hover:text-white transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/auth/register"
                      className="text-center px-3 py-2 rounded-lg text-xs bg-neon-400 text-black hover:bg-neon-300 transition-all duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
              
              {/* Search Bar (Mobile) */}
              <div className="mt-4 px-1">
                <SearchBar compact={true} isMobile={true} showDetailsInline={false} onSearchComplete={() => {}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;