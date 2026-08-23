'use client';

import type { ReactNode } from 'react';
import NewsCategoryTabs from './NewsCategoryTabs';
import { panelShellClass, sectionEyebrowClass, sectionTitleClass } from '@/styles/design-tokens';

type NewsCategoryPageLayoutProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function NewsCategoryPageLayout({ title, description, actions, children }: NewsCategoryPageLayoutProps) {
  return (
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={sectionEyebrowClass}>News</p>
            <h1 className={`mt-2 ${sectionTitleClass}`}>{title}</h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            ) : null}
          </div>
          {actions}
        </header>
        <NewsCategoryTabs />
        <div className={`${panelShellClass} p-5 sm:p-6`}>{children}</div>
      </div>
    </div>
  );
}
