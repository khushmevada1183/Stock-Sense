'use client';

import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettingsBasicDetails } from '@/lib/api';
import { defaultSettingsTab, settingsTabs, type SettingsTabId } from './settings-config';

type SettingsSidebarProps = {
  activeTab: SettingsTabId;
  onSelect: (tab: SettingsTabId) => void;
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
};

const formatInitials = (value: string) => {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0] || '').join('');
  return initials.toUpperCase() || 'SS';
};

function SidebarContent({ activeTab, onSelect, onClose, mobile = false }: SettingsSidebarProps) {
  const profileQuery = useQuery({
    queryKey: ['settings', 'basic-details'],
    queryFn: getSettingsBasicDetails,
  });

  const profile = profileQuery.data?.data;
  const displayName = profile?.fullName || 'Stock Sense Investor';
  const displayEmail = profile?.email || 'investor@stocksense.local';

  return (
    <div className="flex h-full flex-col rounded-[22px] border border-slate-200 bg-white shadow-none transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">Settings</h2>

          {mobile ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close settings navigation"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
          ) : null}
        </div>

          <div className="mt-4 flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-950">
            {profileQuery.isLoading ? 'SS' : formatInitials(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{displayName}</p>
            <p className="truncate text-xs text-slate-600 dark:text-slate-400">{displayEmail}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-3">
        <nav className="space-y-1.5">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onSelect(tab.id);
                  if (mobile && onClose) {
                    onClose();
                  }
                }}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-[18px] border px-3.5 py-2.5 text-left transition-all duration-200',
                  active
                    ? 'border-emerald-200 bg-emerald-50 text-slate-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
                    active
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-700 group-hover:border-slate-300 group-hover:bg-slate-100 group-hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:group-hover:border-slate-700 dark:group-hover:bg-slate-800 dark:group-hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{tab.label}</span>
                  </span>
                  <span className="mt-1 block text-[11px] leading-4 text-slate-600 dark:text-slate-400">{tab.description}</span>
                </span>

                <ChevronRight className={cn('mt-1 h-4 w-4 shrink-0 transition-transform duration-200', active ? 'text-emerald-400' : 'text-slate-500 group-hover:translate-x-0.5 group-hover:text-slate-950 dark:group-hover:text-white')} />
              </button>
            );
          })}
        </nav>
      </div>

    </div>
  );
}

export default function SettingsSidebar({ activeTab = defaultSettingsTab, onSelect, mobile = false, open = true, onClose }: SettingsSidebarProps) {
  if (!mobile) {
    return (
      <aside className="hidden lg:block lg:w-[340px] lg:shrink-0">
        <div className="sticky top-6 h-[calc(100vh-3rem)]">
          <SidebarContent activeTab={activeTab} onSelect={onSelect} mobile={false} />
        </div>
      </aside>
    );
  }

  return (
    <div className={cn('fixed inset-0 z-50 lg:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
      <div
        className={cn('absolute inset-0 bg-slate-950 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />

      <div
        className={cn(
          'absolute inset-y-0 left-0 w-[86vw] max-w-[320px] p-2 transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent activeTab={activeTab} onSelect={onSelect} mobile onClose={onClose} />
      </div>
    </div>
  );
}
