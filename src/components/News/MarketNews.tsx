'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { contentCardClass, secondaryButtonClass, tabActiveClass } from '@/styles/design-tokens';

interface NewsItem {
  id?: string | number;
  title: string;
  source: string;
  date?: string;
  pub_date?: string;
  url: string;
  imageUrl?: string | null;
  image_url?: string | null;
  description?: string;
  summary?: string;
  publishedAt?: string;
}

interface MarketNewsProps {
  newsData?: NewsItem[];
  loading?: boolean;
  error?: string;
}

const NEWS_PER_PAGE = 4;

const MarketNews = ({ newsData = [], loading = false, error = '' }: MarketNewsProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedNews = useMemo(() => (Array.isArray(newsData) ? newsData : []), [newsData]);

  const totalPages = Math.max(1, Math.ceil(normalizedNews.length / NEWS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * NEWS_PER_PAGE;
  const endIndex = startIndex + NEWS_PER_PAGE;
  const visibleNews = normalizedNews.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className={contentCardClass}>
      <CardHeader>
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
                <div className="mb-4 h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
                <div className="h-24 w-full rounded bg-slate-200 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <p>{error}</p>
          </div>
        ) : normalizedNews.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            No market news available at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleNews.map((item, index) => (
              <div
                key={item.id || index}
                className="border-b border-slate-200 pb-4 last:border-0 last:pb-0 dark:border-white/10"
              >
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="group">
                  <h3 className="flex items-start font-medium text-slate-950 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                    <span>{item.title}</span>
                    <ExternalLink className="ml-1 mt-1 h-3.5 w-3.5 opacity-70" />
                  </h3>
                  <div className="mb-2 mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{item.source}</span>
                    <span>{formatDate(item.pub_date || item.publishedAt || item.date)}</span>
                  </div>
                  {(item.image_url || item.imageUrl) && (
                    <div className="mb-3 mt-2">
                      <img
                        src={item.image_url || item.imageUrl || undefined}
                        alt={item.title}
                        className="h-32 w-full rounded-md object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {item.summary || item.description}
                  </p>
                </a>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-3 pt-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={effectivePage === 1}
                    className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Prev
                  </button>

                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        pageNum === effectivePage ? tabActiveClass : secondaryButtonClass
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={effectivePage === totalPages}
                    className={`${secondaryButtonClass} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    Next
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  Page {effectivePage} of {totalPages} • Showing {startIndex + 1}-
                  {Math.min(endIndex, normalizedNews.length)} of {normalizedNews.length}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketNews;
