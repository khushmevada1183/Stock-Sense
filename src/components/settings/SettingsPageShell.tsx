'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import SettingsSidebar from './SettingsSidebar';
import { defaultSettingsTab, isSettingsTabId, type SettingsTabId } from './settings-config';

const SectionSkeleton = () => (
  <div className="space-y-3 rounded-[22px] border border-slate-200 bg-white p-4 shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
    <LoadingSkeleton className="h-5 w-36" />
    <LoadingSkeleton className="h-3.5 w-60" />
    <div className="grid gap-3 lg:grid-cols-2">
      <LoadingSkeleton className="h-36 w-full rounded-[18px]" />
      <LoadingSkeleton className="h-36 w-full rounded-[18px]" />
    </div>
  </div>
);

const BasicDetails = dynamic(() => import('./BasicDetails'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const Reports = dynamic(() => import('./Reports'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const ActiveDevices = dynamic(() => import('./ActiveDevices'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const ChangePassword = dynamic(() => import('./ChangePassword'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const TradingDetails = dynamic(() => import('./TradingDetails'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const SuspiciousActivity = dynamic(() => import('./SuspiciousActivity'), {
  ssr: false,
  loading: () => <SectionSkeleton />,
});

const sectionMap: Record<SettingsTabId, ComponentType> = {
  basic: BasicDetails,
  reports: Reports,
  devices: ActiveDevices,
  password: ChangePassword,
  trading: TradingDetails,
  suspicious: SuspiciousActivity,
};

export default function SettingsPageShell() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTab = useMemo<SettingsTabId>(() => {
    const tab = searchParams.get('tab');
    return isSettingsTabId(tab) ? tab : defaultSettingsTab;
  }, [searchParams]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (!tab || isSettingsTabId(tab)) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', defaultSettingsTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const handleTabChange = (tab: SettingsTabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setMobileOpen(false);
  };

  if (authLoading) {
    return (
      <div className="settings-solid-surface relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-[#07111a] dark:text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.06),transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_36%),linear-gradient(180deg,#07111a_0%,#0c1520_100%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-start gap-4 px-3 py-4 lg:px-4 lg:py-5">
          <div className="hidden w-[340px] shrink-0 lg:block">
            <SectionSkeleton />
          </div>
          <div className="flex-1 space-y-4">
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="settings-solid-surface relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 text-slate-950 transition-colors duration-300 lg:px-6 dark:bg-[#07111a] dark:text-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.06),transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_36%),linear-gradient(180deg,#07111a_0%,#0c1520_100%)]" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center">
          <div className="w-full rounded-[24px] border border-slate-200 bg-white p-6 shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
            <h1 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Sign in to manage your settings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              The settings dashboard keeps profile details, security controls, and device management in one place.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                Go to login
              </Link>
              <Link href="/signup" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-slate-700 dark:hover:bg-slate-800">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ActiveSection = sectionMap[activeTab] || BasicDetails;

  return (
    <div className="settings-solid-surface relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 transition-colors duration-300 dark:bg-[#07111a] dark:text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.06),transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_36%),linear-gradient(180deg,#07111a_0%,#0c1520_100%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] gap-4 px-3 py-4 lg:px-4 lg:py-5">
        <SettingsSidebar activeTab={activeTab} onSelect={handleTabChange} />
        <SettingsSidebar activeTab={activeTab} onSelect={handleTabChange} mobile open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <main className="min-w-0 flex-1 space-y-4">
          <header className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-none transition-colors duration-300 lg:px-5 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl lg:text-[28px]">Settings</h1>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-950 transition hover:border-slate-300 hover:bg-slate-100 lg:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:border-slate-700 dark:hover:bg-slate-800"
              >
                <Menu className="h-4 w-4" />
                Open menu
              </button>
            </div>
          </header>

          <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-none transition-colors duration-300 lg:p-4 dark:border-slate-800 dark:bg-slate-950">
            <ActiveSection />
          </div>
        </main>
      </div>
    </div>
  );
}
