'use client';

import { useEffect, useState } from 'react';
import { getNewsByCategory } from '@/api/api';
import { NewsCategoryPageLayout } from '@/components/News/NewsCategoryPageLayout';
import { insetPanelClass } from '@/styles/design-tokens';

type NewsItem = { id?: string | number; title?: string; summary?: string; source?: string; publishedAt?: string };

const toNews = (payload: unknown): NewsItem[] => {
  if (Array.isArray(payload)) return payload as NewsItem[];
  if (payload && typeof payload === 'object') {
    const map = payload as Record<string, unknown>;
    if (Array.isArray(map.articles)) return map.articles as NewsItem[];
    if (Array.isArray(map.news)) return map.news as NewsItem[];
    if (Array.isArray(map.items)) return map.items as NewsItem[];
  }
  return [];
};

function NewsFeedList({ items, loading, emptyLabel }: { items: NewsItem[]; loading: boolean; emptyLabel: string }) {
  if (loading) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>;
  if (items.length === 0) return <p className="text-sm text-slate-500 dark:text-slate-400">{emptyLabel}</p>;
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <article key={String(item.id || index)} className={`${insetPanelClass} p-4`}>
          <h2 className="font-semibold text-slate-950 dark:text-white">{item.title || 'Untitled story'}</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.summary || 'No summary available.'}</p>
          <p className="mt-3 text-xs text-slate-500">{item.source || 'Unknown source'} • {item.publishedAt || ''}</p>
        </article>
      ))}
    </div>
  );
}

export default function EconomyNewsPageClient() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const response = await getNewsByCategory('economy', { limit: 30 });
        setItems(toNews(response?.data || response));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load economy news');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <NewsCategoryPageLayout title="Economy News" description="Macro and policy stories from the economy feed.">
      {error ? <div className="mb-4 rounded-2xl border border-rose-200/80 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">{error}</div> : null}
      <NewsFeedList items={items} loading={loading} emptyLabel="No economy news found." />
    </NewsCategoryPageLayout>
  );
}
