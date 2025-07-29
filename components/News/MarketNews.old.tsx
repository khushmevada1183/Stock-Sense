'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

// Define the NewsItem interface locally to avoid import issues
interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  imageUrl?: string;
  image_url?: string;
  description?: string;
  summary?: string;
  publishedAt?: string;
  pub_date?: string;
}

interface MarketNewsProps {
  newsData: NewsItem[];
  loading: boolean;
  error: string;
}

const MarketNews = ({ newsData, loading, error }: MarketNewsProps) => {
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market News</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No market news available at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <div key={item.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
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
                    <span>{formatDate(item.publishedAt || item.date)}</span>
                  </div>
                  {item.imageUrl && (
                    <div className="mt-2 mb-3">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.summary || item.description}
                  </p>
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketNews; 