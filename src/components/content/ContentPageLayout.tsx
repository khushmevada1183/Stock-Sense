import type { ReactNode } from 'react';
import { panelShellClass, sectionEyebrowClass, sectionTitleClass } from '@/styles/design-tokens';

type ContentPageLayoutProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function ContentPageLayout({ eyebrow, title, description, children }: ContentPageLayoutProps) {
  return (
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="mx-auto w-full max-w-[1100px] space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <header>
          <p className={sectionEyebrowClass}>{eyebrow}</p>
          <h1 className={`mt-2 ${sectionTitleClass}`}>{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
          ) : null}
        </header>
        <div className={`${panelShellClass} p-6 sm:p-8`}>{children}</div>
      </div>
    </div>
  );
}
