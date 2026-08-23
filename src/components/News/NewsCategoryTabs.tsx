'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Newspaper, TrendingUp, Briefcase, BarChart3, Globe, AlertCircle } from 'lucide-react';
import { insetPanelClass } from '@/styles/design-tokens';

const NEWS_CATEGORIES = [
  { id: 'all', name: 'All News', icon: Newspaper, path: '/news' },
  { id: 'markets', name: 'Markets', icon: BarChart3, path: '/news/markets' },
  { id: 'economy', name: 'Economy', icon: Globe, path: '/news/economy' },
  { id: 'companies', name: 'Companies', icon: Briefcase, path: '/news/companies' },
  { id: 'trending', name: 'Trending', icon: TrendingUp, path: '/news/trending' },
  { id: 'alerts', name: 'Alerts', icon: AlertCircle, path: '/news/alerts' },
];

export default function NewsCategoryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const activeCategory = NEWS_CATEGORIES.find((cat) => (pathname || '') === cat.path)?.id || 'all';

  return (
    <div className={`${insetPanelClass} flex flex-wrap gap-2 p-2`}>
      {NEWS_CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => router.push(category.path)}
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-emerald-500 text-slate-950 shadow-[0_8px_24px_rgba(16,185,129,0.25)]'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
            }`}
          >
            <Icon size={16} className="mr-1.5" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
