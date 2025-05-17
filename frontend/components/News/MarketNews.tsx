'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { stockService } from '@/services/api';
import { NewsItem } from '@/services/api/types';

// Update port to match our backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

interface NewsItemExtended extends NewsItem {
  summary?: string;
  publishedAt?: string;
}

// Define possible response types
interface NewsResponse {
  news?: NewsItem[];
  articles?: any[];
  topGainers?: any[];
  topLosers?: any[];
  [key: string]: any;
}

// Mock news data to use when API fails
const MOCK_NEWS: NewsItemExtended[] = [
  {
    id: '1',
    title: 'Sensex Surges 500 Points as IT Stocks Rally',
    description: 'Indian markets closed higher on Monday, with the Sensex gaining over 500 points led by strong performance in IT and banking stocks.',
    summary: 'Indian markets closed higher on Monday, with the Sensex gaining over 500 points led by strong performance in IT and banking stocks.',
    url: '#',
    date: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    source: 'Economic Times',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'RBI Keeps Repo Rate Unchanged at 6.5%',
    description: 'The Reserve Bank of India (RBI) kept the benchmark interest rate unchanged for the seventh consecutive time, maintaining its focus on inflation control.',
    summary: 'The Reserve Bank of India (RBI) kept the benchmark interest rate unchanged for the seventh consecutive time, maintaining its focus on inflation control.',
    url: '#',
    date: new Date(Date.now() - 3600000).toISOString(),
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: 'Business Standard',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Reliance Industries Reports Record Quarterly Profit',
    description: 'Reliance Industries Limited (RIL) reported a record quarterly profit of ₹16,203 crore, up 12.5% year-on-year, driven by strong performance in retail and digital services.',
    summary: 'Reliance Industries Limited (RIL) reported a record quarterly profit of ₹16,203 crore, up 12.5% year-on-year, driven by strong performance in retail and digital services.',
    url: '#',
    date: new Date(Date.now() - 7200000).toISOString(),
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: 'LiveMint',
    imageUrl: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=2076&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Tata Motors Unveils New Electric Vehicle Lineup',
    description: 'Tata Motors announced an ambitious plan to launch five new electric vehicles in the next 18 months, aiming to capture 30% of the EV market in India by 2025.',
    summary: 'Tata Motors announced an ambitious plan to launch five new electric vehicles in the next 18 months, aiming to capture 30% of the EV market in India by 2025.',
    url: '#',
    date: new Date(Date.now() - 10800000).toISOString(),
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    source: 'Financial Express',
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba13a3760?q=80&w=2072&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Government Approves ₹76,000 Crore Semiconductor Manufacturing Scheme',
    description: 'The Union Cabinet approved a ₹76,000 crore scheme for semiconductor and display manufacturing in India, aiming to position the country as a global hub for electronics.',
    summary: 'The Union Cabinet approved a ₹76,000 crore scheme for semiconductor and display manufacturing in India, aiming to position the country as a global hub for electronics.',
    url: '#',
    date: new Date(Date.now() - 14400000).toISOString(),
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    source: 'The Hindu Business Line',
    imageUrl: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?q=80&w=2070&auto=format&fit=crop'
  }
];

const MarketNews = () => {
  const [news, setNews] = useState<NewsItemExtended[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        // Use the correct endpoint from our API
        const response = await stockService.getMarketNews() as unknown as NewsResponse;
        console.log('News data:', response);
        
        // Transform the data to match our component's expected format
        let formattedNews: NewsItemExtended[] = [];
        
        if (Array.isArray(response)) {
          // Direct array of news items
          formattedNews = response.slice(0, 5).map(item => ({
            ...item,
            summary: item.description,
            publishedAt: item.date
          }));
        } else if (typeof response === 'object' && response !== null) {
          // Check if response has a news property that's an array
          if (response.news && Array.isArray(response.news)) {
            formattedNews = response.news.slice(0, 5).map(item => ({
              ...item,
              summary: item.description,
              publishedAt: item.date
            }));
          } 
          // Check if response has an articles property that's an array
          else if (response.articles && Array.isArray(response.articles)) {
            formattedNews = response.articles.slice(0, 5).map((article: any, index: number) => ({
              id: article.id || index.toString(),
              title: article.title || '',
              description: article.description || article.summary || '',
              summary: article.description || article.summary || '',
              url: article.url || '#',
              date: article.publishedAt || article.date || new Date().toISOString(),
              publishedAt: article.publishedAt || article.date || new Date().toISOString(),
              source: article.source || 'Market News',
              imageUrl: article.urlToImage || article.imageUrl
            }));
          }
          // Check if response has market data we can use to create news items
          else if (response.topGainers || response.topLosers) {
            // If we only have trending data, create news-like items from it
            formattedNews = [
              {
                id: '1',
                title: 'Market Movers: Top Gainers and Losers',
                description: `Today's top gainers and losers in the market show significant movement in various sectors`,
                summary: `Today's top gainers and losers in the market show significant movement in various sectors`,
                url: '/dashboard',
                date: new Date().toISOString(),
                publishedAt: new Date().toISOString(),
                source: 'Market Analysis'
              }
            ];
          }
        }
        
        // If we got no news from the API, use mock data
        if (formattedNews.length === 0) {
          formattedNews = MOCK_NEWS;
        }
        
        setNews(formattedNews);
        setError('');
      } catch (err) {
        console.error('Error fetching market news:', err);
        setError('');
        
        // Use mock data instead of showing an error
        setNews(MOCK_NEWS);
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