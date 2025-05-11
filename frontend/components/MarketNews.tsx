'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { getMarketNews } from '@/services/stockService';

// Update port to match our backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

const MarketNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        // Use the correct endpoint from our API
        const newsData = await getMarketNews();
        console.log('News data:', newsData);
        
        // Transform the data to match our component's expected format
        let formattedNews = [];
        
        if (Array.isArray(newsData)) {
          formattedNews = newsData.slice(0, 5);
        } else if (newsData && newsData.articles) {
          formattedNews = newsData.articles.slice(0, 5).map((article: any, index: number) => ({
            id: index.toString(),
            title: article.title || '',
            summary: article.description || article.summary || '',
            url: article.url || '#',
            source: article.source || 'Market News',
            publishedAt: article.publishedAt || new Date().toISOString(),
            imageUrl: article.urlToImage || article.imageUrl
          }));
        } else if (newsData && (newsData.topGainers || newsData.topLosers)) {
          // If we only have trending data, create news-like items from it
          formattedNews = [
            {
              id: '1',
              title: 'Market Movers: Top Gainers and Losers',
              summary: `Today's top gainers and losers in the market show significant movement in various sectors`,
              url: '/dashboard',
              source: 'Market Analysis',
              publishedAt: new Date().toISOString()
            }
          ];
        }
        
        setNews(formattedNews);
        setError('');
      } catch (err) {
        console.error('Error fetching market news:', err);
        setError('Failed to load market news. Please try again later.');
        
        // Set fallback news
        setNews([{
          id: '1',
          title: 'Market Update',
          summary: 'Check back later for the latest market news and updates.',
          url: '/dashboard',
          source: 'Market Analysis',
          publishedAt: new Date().toISOString()
        }]);
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
                    <span>{formatDate(item.publishedAt)}</span>
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
                    {item.summary}
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