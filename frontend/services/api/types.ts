// Common types for API services

/**
 * Stock search result type
 */
export interface SearchResult {
  symbol: string;
  companyName: string;
  company_name?: string; // For API compatibility
  latestPrice?: number;
  current_price?: number; // For API compatibility
  price?: number; // For API compatibility
  change?: number;
  changePercent?: number;
  percent_change?: number; // For API compatibility
  sector?: string;
  industry?: string;
  tickerId?: string;
  bse_price?: number;
  nse_price?: number;
  [key: string]: any; // For any other fields
}

/**
 * Comprehensive stock details type, merging all properties
 */
export interface StockDetails {
  symbol: string;
  name?: string;
  companyName?: string;
  company_name?: string;
  tickerId?: string;
  current_price?: number;
  price?: number;
  lastPrice?: number;
  last_price?: number;
  change?: number;
  percent_change?: number;
  changePercent?: number;
  market_cap?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  volume?: number;
  average_volume?: number;
  year_high?: number;
  year_low?: number;
  bse_price?: number;
  nse_price?: number;
  sector?: string;
  industry?: string;
  [key: string]: any; // For any other fields
}

/**
 * Historical price data point
 */
export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
}

/**
 * News item
 */
export interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  url: string;
  date: string;
  source?: string;
  imageUrl?: string;
}

/**
 * IPO item
 */
export interface IpoItem {
  company_name: string;
  symbol: string;
  issue_size?: string;
  issue_price?: string;
  listing_date?: string;
  listing_gain?: string;
  status?: string;
}

/**
 * Mutual Fund
 */
export interface MutualFund {
  name: string;
  nav: number;
  category: string;
  rating?: number;
  aum?: number;
  return_1yr?: number;
  return_3yr?: number;
  return_5yr?: number;
}

/**
 * Market Index
 */
export interface MarketIndex {
  name: string;
  value: number;
  change?: number;
  percent_change?: number;
}

/**
 * Portfolio data
 */
export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  holdings: PortfolioHolding[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Portfolio holding
 */
export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  purchase_price: number;
  purchase_date?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  status?: string;
  data: T;
  message?: string;
  error?: string;
} 