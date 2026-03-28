'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

// Define the NewsItem interface locally to avoid import issues
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

  const normalizedNews = useMemo(
    () => (Array.isArray(newsData) ? newsData : []),
    [newsData]
  );

  const totalPages = Math.max(1, Math.ceil(normalizedNews.length / NEWS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * NEWS_PER_PAGE;
  const endIndex = startIndex + NEWS_PER_PAGE;
  const visibleNews = normalizedNews.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Card className="bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
      <CardHeader>
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        ) : normalizedNews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No market news available at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {visibleNews.map((item, index) => (
              <div key={item.id || index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-start">
                    <span>{item.title}</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-1 mt-1 opacity-70" />
                  </h3>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                    <span>{item.source}</span>
                    <span>{formatDate(item.pub_date || item.publishedAt || item.date)}</span>
                  </div>
                  {(item.image_url || item.imageUrl) && (
                    <div className="mt-2 mb-3">
                      <img 
                        src={item.image_url || item.imageUrl || undefined} 
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-md"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.summary || item.description}
                  </p>
                </a>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pt-2 flex flex-col items-center gap-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={effectivePage === 1}
                    className="px-3 py-1.5 rounded-lg bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white hover:border-neon-400/40 transition-colors"
                  >
                    Prev
                  </button>

                  {pageNumbers.map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg border transition-colors ${
                        pageNum === effectivePage
                          ? 'bg-neon-400 text-black border-neon-400'
                          : 'bg-gray-900/90 backdrop-blur-lg border-gray-700/50 text-gray-200 hover:text-white hover:border-neon-400/40'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={effectivePage === totalPages}
                    className="px-3 py-1.5 rounded-lg bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white hover:border-neon-400/40 transition-colors"
                  >
                    Next
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Page {effectivePage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, normalizedNews.length)} of {normalizedNews.length}
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
