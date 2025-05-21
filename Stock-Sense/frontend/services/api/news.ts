import { ApiClient } from './client';
import { NewsItem } from './types';
import { getMockNewsData } from '../mockHomeData';
import { API_CONFIG } from '../config';

// Get the standard API client
function getApiClient(): ApiClient {
  // Get API URL from environment variables or localStorage
  let apiUrl = '';
  
  if (typeof window !== 'undefined') {
    apiUrl = localStorage.getItem('api_url') || 
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
  } else {
    apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
  }

  return new ApiClient({
    baseURL: apiUrl,
    timeout: 10000,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });
}

// Get the Indian API client
function getIndianApiClient(): ApiClient {
  // Use the API_CONFIG instead of hardcoded values
  const API_KEY = API_CONFIG.API_KEY;
  const BASE_URL = API_CONFIG.BASE_URL || 'https://stock.indianapi.in';
  
  return new ApiClient({
    baseURL: BASE_URL,
    apiKey: API_KEY, // This will use the API key rotation system via client.ts
    timeout: API_CONFIG.TIMEOUT || 10000,
    cacheTTL: API_CONFIG.CACHE_DURATION || 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * News API service functions
 */

/**
 * Get market news articles
 * @param limit Number of news items to return (default: 10)
 * @returns List of news items
 */
export async function getMarketNews(limit: number = 10): Promise<{ news: NewsItem[] }> {
  try {
    // Use mock data first
    const mockData = getMockNewsData();
    if (mockData && mockData.news && mockData.news.length > 0) {
      console.log('Using mock news data');
      // Force type assertion to match API types
      return { news: mockData.news.slice(0, limit) as unknown as NewsItem[] };
    }
    
    // If mock data is empty, try standard API
    const standardClient = getApiClient();
    try {
      const result = await standardClient.get<NewsItem[]>('/news', { limit });
      return { news: result };
    } catch (error) {
      console.error('Error fetching market news from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>('/news');
    
    // Normalize data
    if (Array.isArray(result)) {
      return { news: result.map(item => normalizeNewsItem(item)).slice(0, limit) };
    }
    
    return { news: [] };
  } catch (error) {
    console.error('Error fetching market news:', error);
    return { news: [] };
  }
}

/**
 * Get news for a specific stock
 * @param symbol Stock symbol
 * @param limit Number of news items to return (default: 5)
 * @returns List of news items
 */
export async function getStockNews(symbol: string, limit: number = 5): Promise<{ news: NewsItem[] }> {
  if (!symbol) {
    return { news: [] };
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      const result = await standardClient.get<NewsItem[]>(`/stocks/${symbol}/news`, { limit });
      return { news: result };
    } catch (error) {
      console.error(`Error fetching news for ${symbol} from standard API:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<any>(`/stock/${symbol}/news`);
    
    // Normalize data
    if (Array.isArray(result)) {
      return { news: result.map(item => normalizeNewsItem(item)).slice(0, limit) };
    }
    
    return { news: [] };
  } catch (error) {
    console.error(`Error fetching news for ${symbol}:`, error);
    return { news: [] };
  }
}

/**
 * Get bullish/bearish sentiment news
 * @param sentiment 'bullish' or 'bearish'
 * @param limit Number of news items to return (default: 5)
 * @returns List of news items
 */
export async function getSentimentNews(sentiment: 'bullish' | 'bearish', limit: number = 5): Promise<{ news: NewsItem[] }> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      const result = await standardClient.get<NewsItem[]>(`/news/sentiment/${sentiment}`, { limit });
      return { news: result };
    } catch (error) {
      console.error(`Error fetching ${sentiment} news from standard API:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    try {
      const result = await indianClient.get<any>(`/news/sentiment/${sentiment}`);
      
      // Normalize data
      if (Array.isArray(result)) {
        return { news: result.map(item => normalizeNewsItem(item)).slice(0, limit) };
      }
    } catch (error) {
      console.error(`Error fetching ${sentiment} news from Indian API:`, error);
      
      // If no specific sentiment endpoint, filter market news by keywords
      const allNews = await getMarketNews(50); // Get more news to filter from
      
      const keywords = sentiment === 'bullish' 
        ? ['rise', 'rally', 'gain', 'surge', 'jump', 'positive', 'bullish', 'uptrend']
        : ['fall', 'drop', 'decline', 'plunge', 'slump', 'negative', 'bearish', 'downtrend'];
      
      // Simple sentiment filter based on keywords
      const filteredNews = allNews.news.filter(news => {
        const text = (news.title + ' ' + (news.description || '')).toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
      });
      
      return { news: filteredNews.slice(0, limit) };
    }
    
    return { news: [] };
  } catch (error) {
    console.error(`Error fetching ${sentiment} news:`, error);
    return { news: [] };
  }
}

/**
 * Search news by query
 * @param query Search query
 * @param limit Number of news items to return (default: 10)
 * @returns List of news items
 */
export async function searchNews(query: string, limit: number = 10): Promise<{ news: NewsItem[] }> {
  if (!query || query.length < 2) {
    return { news: [] };
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      const result = await standardClient.get<NewsItem[]>('/news/search', { query, limit });
      return { news: result };
    } catch (error) {
      console.error(`Error searching news for "${query}" from standard API:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    try {
      const result = await indianClient.get<any>('/news/search', { query });
      
      // Normalize data
      if (Array.isArray(result)) {
        return { news: result.map(item => normalizeNewsItem(item)).slice(0, limit) };
      }
    } catch (error) {
      console.error(`Error searching news for "${query}" from Indian API:`, error);
      
      // Simple search through all news if specific endpoint not available
      const allNews = await getMarketNews(50); // Get more news to search through
      
      const filteredNews = allNews.news.filter(news => {
        const text = (news.title + ' ' + (news.description || '')).toLowerCase();
        return text.includes(query.toLowerCase());
      });
      
      return { news: filteredNews.slice(0, limit) };
    }
    
    return { news: [] };
  } catch (error) {
    console.error(`Error searching news for "${query}":`, error);
    return { news: [] };
  }
}

// Helper function to normalize news item
function normalizeNewsItem(item: any): NewsItem {
  if (!item) return {} as NewsItem;
  
  return {
    id: item.id || item._id || Date.now().toString(),
    title: item.title || item.headline || '',
    description: item.description || item.summary || item.content || '',
    url: item.url || item.link || '',
    date: item.date || item.publishedAt || item.published_at || new Date().toISOString(),
    source: item.source || item.publisher || '',
    imageUrl: item.imageUrl || item.image || item.thumbnail || ''
  };
} 