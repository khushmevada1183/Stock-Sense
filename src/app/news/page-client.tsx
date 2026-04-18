'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as stockApi from '@/api/api';
import { logger } from '@/lib/logger';

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
    <div className="min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
      <div className="flex flex-col space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-white">Market News</h1>
          <p className="text-gray-300">
          Stay updated with the latest market news, sector updates, and financial insights.
        </p>
        <div>
          <button
            type="button"
            onClick={() => void handleSyncNews()}
            disabled={syncing}
            className="mt-2 px-3 py-1.5 min-h-[44px] rounded-md text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white"
          >
            {syncing ? 'Syncing News...' : 'Trigger News Sync'}
          </button>
        </div>
      </div>
      
      {/* News Category Tabs */}
      <div className="mb-8">
        <NewsCategoryTabs />
      </div>
      
      {/* Main content and sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-8">
          {/* Featured News Section */}
          <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-neon-400 rounded-sm mr-2"></span>
              Featured News
            </h2>
            <FeaturedNews newsData={newsData} loading={loading} error={error} />
          </section>
          
          {/* Market News Section */}
          <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-neon-400 rounded-sm mr-2"></span>
              Latest Market Updates
            </h2>
            <MarketNews newsData={newsData} loading={loading} error={error} />
          </section>
          
          {/* Sector News Section */}
          <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-cyan-500 rounded-sm mr-2"></span>
              Sector News
            </h2>
            <SectorNews newsData={newsData} loading={loading} error={error} />
          </section>
        </div>
        
        {/* Sidebar - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 glass">
            <h3 className="text-lg font-bold mb-3 text-white">Fear & Greed Index</h3>
            <div className="text-3xl font-bold text-neon-400">
              {fearGreed.value === null ? '--' : fearGreed.value}
            </div>
            <p className="text-sm text-gray-300 mt-1">{fearGreed.label}</p>
            {fearGreed.updatedAt ? <p className="text-xs text-gray-500 mt-1">Updated: {fearGreed.updatedAt}</p> : null}
          </div>

          {/* Trending Topics */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 glass">
              <h3 className="text-lg font-bold mb-4 text-white">Trending Topics</h3>
            <TrendingTopics />
          </div>
          
          {/* Market Calendar */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 glass">
              <h3 className="text-lg font-bold mb-4 text-white">Market Calendar</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">RBI Policy Meeting</span>
                <span className="text-xs text-gray-400">Jun 5-7</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Q1 Results Season</span>
                <span className="text-xs text-gray-400">Jul 15-Aug 15</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Budget Session</span>
                <span className="text-xs text-gray-400">Jul 1</span>
              </div>
            </div>
          </div>
          
          {/* Newsletter Signup */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-neon-400/20 p-4 glass-premium">
              <h3 className="text-lg font-bold mb-2 text-white">Daily Market Digest</h3>
            <p className="text-sm text-gray-300 mb-4">Get the day's top financial stories delivered to your inbox</p>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                  className="w-full px-3 py-2 min-h-[44px] bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-neon-400 focus:border-neon-400"
              />
                <button className="w-full bg-neon-400 hover:bg-neon-300 text-black py-2 min-h-[44px] rounded-lg text-sm transition-colors hover:shadow-neon-sm">
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