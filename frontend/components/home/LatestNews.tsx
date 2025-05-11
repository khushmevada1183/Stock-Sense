'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { stockService } from '@/services/api';

interface NewsItem {
  id: number;
  title: string;
  source: string;
  date: string;
  content?: string;
  summary?: string;
  url: string;
  imageUrl?: string;
  image_url?: string;
}

export default function LatestNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // Fetch news from the real API
        const response = await stockService.getMarketNews();
        
        if (response && response.news) {
          // Transform API data to match our component's expected format
          const formattedNews = response.news.map((item: any) => ({
            id: item.id,
            title: item.title,
            source: item.source,
            date: item.date,
            summary: item.content || item.summary,
            url: item.url || '#',
            imageUrl: item.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80'
          }));
          
          setNews(formattedNews);
        } else {
          setError('Invalid data format received from server');
          setNews([]);
        }
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError('Failed to load latest news');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-gray-600 dark:text-gray-400 text-center">
        No news articles available at this time.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
          <div className="h-48 relative overflow-hidden">
            <img 
              src={item.imageUrl || item.image_url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{item.source}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(item.date)}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              <Link href={item.url} target="_blank" className="hover:text-blue-600 dark:hover:text-blue-400">
                {item.title}
              </Link>
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
              {item.summary}
            </p>
            
            <Link 
              href={item.url}
              target="_blank"
              className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
            >
              Read More
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper function to format dates
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  } catch (e) {
    return dateString;
  }
} 