import type { ReactNode } from 'react';
import { panelShellClass, sectionTitleClass } from '@/styles/design-tokens';

type AuthPageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function AuthPageLayout({ title, description, children }: AuthPageLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 text-slate-950 dark:text-white">
      <div className={`${panelShellClass} w-full max-w-md p-8 sm:p-10`}>
        <h1 className={sectionTitleClass}>{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
