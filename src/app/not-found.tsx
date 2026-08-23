import Link from 'next/link';
import { panelShellClass, sectionTitleClass, primaryButtonClass } from '@/styles/design-tokens';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className={`${panelShellClass} max-w-lg p-8 text-center`}>
        <h1 className={sectionTitleClass}>Page not found</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">This route does not exist.</p>
        <Link href="/" className={`${primaryButtonClass} mt-6 inline-flex`}>Back to home</Link>
      </div>
    </div>
  );
}
