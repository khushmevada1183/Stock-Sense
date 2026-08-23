'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface AppShellProps {
  children: ReactNode;
}

const isAuthRoute = (pathname: string | null) => {
  if (!pathname) {
    return false;
  }

  return (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/settings' ||
    pathname.startsWith('/settings/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/')
  );
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideChrome = isAuthRoute(pathname);

  if (hideChrome) {
    return (
      <main className="min-h-screen flex-grow bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        {children}
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex-grow bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        {children}
      </main>
      <Footer />
    </>
  );
}
