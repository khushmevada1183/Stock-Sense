'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart2,
  Bell,
  Briefcase,
  Eye,
  Home,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  Settings2,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import SearchBar from '../../app/components/SearchBar';
import { getNotifications } from '@/api/api';

type MenuActionItemProps = {
  href?: string;
  onClick?: () => void;
  icon: typeof Bell;
  label: string;
  badge?: string | number;
  danger?: boolean;
  compact?: boolean;
};

function MenuActionItem({
  href,
  onClick,
  icon: Icon,
  label,
  badge,
  danger = false,
  compact = false,
}: MenuActionItemProps) {
  const baseClass = compact
    ? 'account-menu-item group flex w-full items-center gap-3 rounded-[18px] px-3 py-2.5 text-left transition-all duration-200'
    : 'account-menu-item group flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left transition-all duration-200';

  const toneClass = danger
    ? 'account-menu-item-danger text-rose-700 hover:text-rose-800 dark:text-rose-200 dark:hover:text-rose-100'
    : 'text-slate-700 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white';

  const iconClass = danger
    ? 'account-menu-icon account-menu-icon-danger text-rose-700 dark:text-rose-200'
    : 'account-menu-icon text-slate-700 dark:text-slate-200';

  const badgeClass = danger
    ? 'account-menu-badge account-menu-badge-danger text-rose-700 dark:text-rose-100'
    : 'account-menu-badge text-emerald-700 dark:text-emerald-100';

  const content = (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-2xl transition-colors duration-200 ${
          compact ? 'h-9 w-9' : 'h-10 w-10'
        } ${iconClass}`}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          {badge !== undefined ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${badgeClass}`}>
              {badge}
            </span>
          ) : null}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={`${baseClass} ${toneClass}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseClass} ${toneClass}`}>
      {content}
    </button>
  );
}

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, setMobileMenuOpen } = useUI();
  const { isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Stocks', href: '/stocks', icon: BarChart2 },
    { name: 'Market', href: '/market', icon: TrendingUp },
    { name: 'IPOs', href: '/ipo', icon: TrendingUp },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
    { name: 'Watchlists', href: '/watchlists', icon: Eye },
  ];

  const accountItems = isAuthenticated
    ? [
        {
          href: '/alerts',
          icon: Bell,
          label: 'Alerts',
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
          href: '/auth/profile',
          icon: User,
          label: 'Profile',
        },
        {
          href: '/settings',
          icon: Settings2,
          label: 'Settings',
        },
      ]
    : [
        {
          href: '/alerts',
          icon: Bell,
          label: 'Alerts',
          badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
          href: '/login',
          icon: LogIn,
          label: 'Login',
        },
      ];

  const isActive = (path: string) => pathname === path;

  const toggleMobileMenu = () => {
    setIsAccountMenuOpen(false);
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleAccountMenu = () => {
    setMobileMenuOpen(false);
    setIsAccountMenuOpen((current) => !current);
  };

  const closeMenus = () => {
    setIsAccountMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    router.push('/login');
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
        const notifications = Array.isArray(response?.data?.notifications) ? response.data.notifications : [];
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

  const renderAccountMenuContent = (compact = false) => (
    <div className={`account-menu-list space-y-2 ${compact ? 'px-2 py-2' : 'px-4 py-4'}`}>
      {!compact ? (
        <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Account
        </p>
      ) : null}

      {accountItems.map((item) => (
        <MenuActionItem
          key={item.label}
          href={item.href}
          icon={item.icon}
          label={item.label}
          badge={item.badge}
          onClick={closeMenus}
          compact={compact}
        />
      ))}

      {isAuthenticated ? (
        <MenuActionItem
          icon={LogOut}
          label="Logout"
          danger
          compact={compact}
          onClick={handleLogout}
        />
      ) : null}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto w-[98%] px-1 pt-2 sm:w-[95%] sm:px-2 sm:pt-4">
        <div className="header-pill relative rounded-full border transition-all duration-300">
          <div className="flex h-12 items-center justify-between px-3 sm:h-14 sm:px-6">
            <Link href="/" className="group flex min-h-[44px] items-center">
              <div className="flex items-baseline">
                <span className="font-mono text-lg font-bold text-neon-400 transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(57,255,20,0.5)] sm:text-xl">
                  Stock
                </span>
                <span className="font-flex ml-1 text-lg font-light text-gray-300 sm:text-xl">Sense</span>
              </div>
            </Link>

            <nav className="hidden items-center lg:flex">
              <div className="flex space-x-0.5 rounded-full border border-gray-800/20 bg-gray-900/30 p-1">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                        active
                          ? 'bg-neon-400/10 text-neon-400 shadow-neon-sm neon-glow-text'
                          : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/40 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon size={15} className={`mr-1.5 transition-colors duration-300 ${active ? 'text-neon-400' : 'text-gray-500'}`} />
                      {item.name}
                      {active ? <span className="absolute -bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-neon-400 shadow-neon-sm" /> : null}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="hidden w-72 relative md:block lg:w-80">
              <SearchBar compact={true} showDetailsInline={false} onSearchComplete={() => {}} />
            </div>

            <div className="relative flex items-center gap-2 sm:gap-4" ref={accountMenuRef}>
              <ThemeToggle />

              <div className="hidden md:flex">
                <button
                  type="button"
                  className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border p-1.5 transition-all duration-300 ${
                    isAccountMenuOpen
                      ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.12)]'
                      : 'border-gray-700/40 text-gray-300 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200'
                  }`}
                  onClick={toggleAccountMenu}
                  aria-label={isAccountMenuOpen ? 'Close account menu' : 'Open account menu'}
                  aria-haspopup="menu"
                  aria-expanded={isAccountMenuOpen}
                >
                  {isAccountMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

              <div className="flex md:hidden">
                <button
                  type="button"
                  className="relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-1.5 text-gray-400 transition-all duration-300 hover:bg-gray-800/40 hover:text-neon-400"
                  onClick={toggleMobileMenu}
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>

              {isAccountMenuOpen ? (
                <button
                  type="button"
                  aria-label="Close account menu"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="fixed inset-0 z-[55] cursor-default bg-transparent"
                />
              ) : null}

              {isAccountMenuOpen ? (
                <div className="account-menu-panel absolute right-0 top-[calc(100%+0.75rem)] z-[60] w-[320px] max-w-[calc(100vw-20px)] overflow-hidden rounded-[28px] animate-scale-in">
                  {renderAccountMenuContent(false)}
                </div>
              ) : null}
            </div>
          </div>

          {isMobileMenuOpen ? (
            <div className="header-pill absolute inset-x-2 top-[calc(100%+0.5rem)] z-[60] max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-2xl border px-3 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] md:hidden">
              <div className="space-y-3 pb-2">
                <nav className="flex flex-col space-y-1 px-1">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex min-h-[44px] items-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                          active
                            ? 'bg-neon-400/10 text-neon-400 shadow-neon-sm neon-glow-text'
                            : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800/40 dark:hover:text-gray-200'
                        }`}
                        onClick={closeMenus}
                      >
                        <Icon size={16} className={`mr-2.5 ${active ? 'text-neon-400' : 'text-gray-500'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="account-menu-divider mx-1 h-px" />

                <div className="rounded-2xl border border-gray-200/20 px-1 py-1">
                  {renderAccountMenuContent(true)}
                </div>

                <div className="px-1">
                  <SearchBar compact={true} isMobile={true} showDetailsInline={false} onSearchComplete={() => {}} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;