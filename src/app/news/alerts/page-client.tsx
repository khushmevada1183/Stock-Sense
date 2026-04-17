'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNewsAlerts } from '@/api/api';

type NewsItem = {
  id?: string | number;
  title?: string;
  summary?: string;
  source?: string;
  publishedAt?: string;
};

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

export default function AlertsNewsPageClient() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getNewsAlerts({ limit: 30 });
        setItems(toNews(response?.data || response));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load news alerts');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">News Alerts</h1>
          <p className="text-gray-400 mt-1">Critical feed from /news/alerts.</p>
        </div>
        <Link href="/alerts" className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
          Manage Price Alerts
        </Link>
      </div>

      {error ? <div className="text-red-300 bg-red-900/20 border border-red-700/50 rounded-lg p-3 text-sm">{error}</div> : null}

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading news alerts...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-400 text-sm">No alert stories found.</p>
        ) : (
          items.map((item, index) => (
            <article key={String(item.id || index)} className="bg-gray-900/90 border border-gray-700/50 rounded-xl p-4">
              <h2 className="text-white font-semibold">{item.title || 'Untitled story'}</h2>
              <p className="text-gray-300 text-sm mt-2">{item.summary || 'No summary available.'}</p>
              <p className="text-xs text-gray-500 mt-3">{item.source || 'Unknown source'} • {item.publishedAt || ''}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
