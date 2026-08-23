'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

interface AppShellProps {
  children: ReactNode;
}

const normalizePath = (pathname: string) => pathname.replace(/\/+$/, '') || '/';

const isAuthRoute = (pathname: string | null) => {
  if (!pathname) {
    return false;
  }

  const path = normalizePath(pathname);

  return (
    path === '/login' ||
    path === '/signup' ||
    path === '/settings' ||
    path.startsWith('/settings/') ||
    path === '/auth' ||
    path.startsWith('/auth/')
  );
};

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideChrome = isAuthRoute(pathname);

  if (hideChrome) {
    return (
      <main className="min-h-screen flex-grow bg-transparent text-[color:var(--app-text-1)]">
        {children}
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex-grow bg-transparent text-[color:var(--app-text-1)]">
        {children}
      </main>
      <Footer />
    </>
  );
}
