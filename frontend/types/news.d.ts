/**
 * Type definitions for news-related interfaces
 */

// News item interface
export interface NewsItem {
  id: number | string;
  title: string;
  source: string;
  date: string;
  content?: string;
  summary?: string;
  url: string;
  imageUrl?: string;
  image_url?: string;
  category?: string;
  tags?: string[];
  author?: string;
  published_at?: string;
}

// News response interface
export interface NewsResponse {
  news: NewsItem[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

// News category type
export type NewsCategory = 'markets' | 'stocks' | 'economy' | 'business' | 'ipo' | 'cryptocurrency' | 'commodities' | 'general'; 