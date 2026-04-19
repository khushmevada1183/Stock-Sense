'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ClientScrollProgressIndicator from './ClientScrollProgressIndicator';

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
    return <main className="flex-grow">{children}</main>;
  }

  return (
    <>
      <ClientScrollProgressIndicator />
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
