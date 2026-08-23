import Link from 'next/link';
import type { ReactNode } from 'react';
import { panelShellClass, sectionEyebrowClass, sectionTitleClass, fieldClass, primaryButtonClass } from '@/styles/design-tokens';

type ToolPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ToolPageLayout({ eyebrow, title, description, children }: ToolPageLayoutProps) {
  return (
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <header>
          <p className={sectionEyebrowClass}>{eyebrow}</p>
          <h1 className={`mt-2 ${sectionTitleClass}`}>{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
        </header>
        {children}
      </div>
    </div>
  );
}

type ToolAuthGateProps = {
  title: string;
  description: string;
};

export function ToolAuthGate({ title, description }: ToolAuthGateProps) {
  return (
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-[50vh] w-full max-w-[1400px] items-center px-4 py-10 sm:px-6">
        <div className={`${panelShellClass} w-full max-w-2xl p-8 sm:p-10`}>
          <h1 className={sectionTitleClass}>{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
          <Link href="/login" className={`${primaryButtonClass} mt-6 inline-flex`}>
            Go to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ToolPanel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`${panelShellClass} p-5 sm:p-6 ${className}`}>
      {title ? <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2> : null}
      {children}
    </section>
  );
}

export function ToolLoading({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-10 text-slate-500 dark:text-slate-400 sm:px-6">{message}</div>
    </div>
  );
}

export function ToolError({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
      {message}
    </div>
  );
}

export { fieldClass, primaryButtonClass };
