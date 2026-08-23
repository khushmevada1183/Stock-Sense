'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as stockApi from '@/api/api';
import { logger } from '@/lib/logger';
import {
  fieldClass,
  panelShellClass,
  primaryButtonClass,
  sectionEyebrowClass,
  sectionTitleClass,
} from '@/styles/design-tokens';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const SectorNews = dynamic(() => import('@/components/News/SectorNews'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });

interface NewsArticle {
  id: string | number;
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
  url: string;
  imageUrl: string | null;
}

type NewsPayload = Record<string, unknown>;

type FearGreedSnapshot = {
  value: number | null;
  label: string;
  updatedAt: string;
};

const asNewsArray = (value: unknown): NewsPayload[] => {
  return Array.isArray(value) ? (value as NewsPayload[]) : [];
};

const toText = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
};

const normalizeNewsItem = (value: unknown, index: number): NewsArticle | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const row = value as NewsPayload;
  const id = row.id ?? `news-${index}`;
  const title = toText(row.title, row.headline);
  const url = toText(row.url, row.link) || '#';

  if (!title) {
    return null;
  }

  const date =
    toText(row.publishedAt, row.pub_date, row.date, row.createdAt) ||
    new Date().toISOString();

  return {
    id: typeof id === 'string' || typeof id === 'number' ? id : `news-${index}`,
    title,
    summary: toText(row.summary, row.description, row.content),
    category: toText(row.category) || 'markets',
    date,
    source: toText(row.source, row.sourceName) || 'Unknown source',
    url,
    imageUrl: toText(row.imageUrl, row.image_url) || null,
  };
};

const extractNewsArticles = (payload: unknown): NewsArticle[] => {
  const data = payload && typeof payload === 'object' ? (payload as NewsPayload) : null;
  const candidates = [
    payload,
    data?.articles,
    data?.news,
    data?.rows,
    data?.results,
    data?.items,
  ];

  for (const candidate of candidates) {
    const rows = asNewsArray(candidate)
      .map((item, index) => normalizeNewsItem(item, index))
      .filter((item): item is NewsArticle => Boolean(item));

    if (rows.length > 0) {
      return rows;
    }
  }

  return [];
};

const parseFearGreed = (payload: unknown): FearGreedSnapshot => {
  if (!payload || typeof payload !== 'object') {
    return { value: null, label: 'Unavailable', updatedAt: '' };
  }

  const data = payload as Record<string, unknown>;
  const latest = data.latest && typeof data.latest === 'object'
    ? (data.latest as Record<string, unknown>)
    : Array.isArray(data.rows) && data.rows[0] && typeof data.rows[0] === 'object'
      ? (data.rows[0] as Record<string, unknown>)
      : data;

  const rawValue = latest.value ?? latest.index ?? latest.score ?? latest.fearGreedIndex;
  const numericValue = Number(rawValue);
  const label = String(latest.label || latest.sentiment || latest.classification || 'Unavailable');
  const updatedAt = String(
    latest.updatedAt || latest.lastUpdated || latest.capturedAt || latest.snapshotDate || latest.createdAt || ''
  );

  return {
    value: Number.isFinite(numericValue) ? numericValue : null,
    label,
    updatedAt,
  };
};

export default function NewsPageClient() {
  const [newsData, setNewsData] = useState<NewsArticle[]>([]);
  const [fearGreed, setFearGreed] = useState<FearGreedSnapshot>({ value: null, label: 'Loading', updatedAt: '' });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        const [newsResponse, fearGreedResponse] = await Promise.allSettled([
          stockApi.getLatestNews(),
          stockApi.getFearGreedIndex(),
        ]);

        // API shape: { success, data: [...] } or { success, data: { news: [...] } }
        let articles: NewsArticle[] = [];
        if (newsResponse.status === 'fulfilled' && newsResponse.value?.success) {
          const responseData = newsResponse.value.data as unknown;
          articles = extractNewsArticles(responseData);
        }

        if (fearGreedResponse.status === 'fulfilled') {
          const fearGreedPayload = (fearGreedResponse.value?.data ?? fearGreedResponse.value) as unknown;
          setFearGreed(parseFearGreed(fearGreedPayload));
        } else {
          setFearGreed({ value: null, label: 'Unavailable', updatedAt: '' });
        }

        setNewsData(articles);
        setError(articles.length > 0 ? '' : 'No news articles are currently available.');
      } catch (err) {
        logger.error('Error fetching news', err);
        setNewsData([]);
        setFearGreed({ value: null, label: 'Unavailable', updatedAt: '' });
        setError('Failed to load news data. Please retry shortly.');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  const handleSyncNews = async () => {
    try {
      setSyncing(true);
      await stockApi.syncNews();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger news sync');
    } finally {
      setSyncing(false);
    }
  };


  return (
    <div className="relative min-h-screen text-slate-950 dark:text-white">
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <header>
          <p className={sectionEyebrowClass}>Markets</p>
          <h1 className={`mt-2 ${sectionTitleClass}`}>Market News</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Stay updated with the latest market news, sector updates, and financial insights.
          </p>
          <button
            type="button"
            onClick={() => void handleSyncNews()}
            disabled={syncing}
            className={`${primaryButtonClass} mt-4 disabled:opacity-60`}
          >
            {syncing ? 'Syncing News…' : 'Trigger News Sync'}
          </button>
        </header>

        <NewsCategoryTabs />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-8 lg:col-span-3">
            <section className={`${panelShellClass} p-5 sm:p-6`}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Featured News</h2>
              <FeaturedNews newsData={newsData} loading={loading} error={error} />
            </section>

            <section className={`${panelShellClass} p-5 sm:p-6`}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Latest Market Updates</h2>
              <MarketNews newsData={newsData} loading={loading} error={error} />
            </section>

            <section className={`${panelShellClass} p-5 sm:p-6`}>
              <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">Sector News</h2>
              <SectorNews newsData={newsData} loading={loading} error={error} />
            </section>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className={`${panelShellClass} p-4`}>
              <h3 className="mb-3 text-lg font-semibold text-slate-950 dark:text-white">Fear & Greed Index</h3>
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {fearGreed.value === null ? '--' : fearGreed.value}
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{fearGreed.label}</p>
              {fearGreed.updatedAt ? (
                <p className="mt-1 text-xs text-slate-500">Updated: {fearGreed.updatedAt}</p>
              ) : null}
            </div>

            <div className={`${panelShellClass} p-4`}>
              <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-white">Trending Topics</h3>
              <TrendingTopics />
            </div>

            <div className={`${panelShellClass} p-4`}>
              <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-white">Market Calendar</h3>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>RBI Policy Meeting</span>
                  <span className="text-xs text-slate-500">Jun 5-7</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Q1 Results Season</span>
                  <span className="text-xs text-slate-500">Jul 15-Aug 15</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Budget Session</span>
                  <span className="text-xs text-slate-500">Jul 1</span>
                </div>
              </div>
            </div>

            <div className={`${panelShellClass} p-4`}>
              <h3 className="mb-2 text-lg font-semibold text-slate-950 dark:text-white">Daily Market Digest</h3>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Get the day&apos;s top financial stories delivered to your inbox
              </p>
              <div className="space-y-2">
                <input type="email" placeholder="Your email address" className={`${fieldClass} w-full`} />
                <button type="button" className={`${primaryButtonClass} w-full`}>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}