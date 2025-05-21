/**
 * Type definitions for stock-related interfaces
 */

// Base stock interface with common properties
export interface BaseStock {
  symbol: string;
  name?: string;
  company_name?: string;
}

// Complete stock interface with all possible properties
export interface Stock extends BaseStock {
  id: string | number;
  sector_name: string;
  price_change_percentage: number | string;
  current_price?: number | string;
  price?: number | string;
  change?: number | string;
  change_percent?: number | string;
  volume?: number | string;
  market_cap?: number | string;
  pe_ratio?: number | string;
  eps?: number | string;
  dividend_yield?: number | string;
  high_52_week?: number | string;
  low_52_week?: number | string;
  open?: number | string;
  previous_close?: number | string;
  day_high?: number | string;
  day_low?: number | string;
  exchange?: string;
  industry?: string;
}

// Search result interface from the API
export interface SearchResult extends BaseStock {
  // Minimal version of stock data returned from search
  exchange?: string;
  type?: string;
  matchScore?: number;
}

// Type assertion function to safely convert SearchResult to Stock
export function asStock(searchResult: SearchResult): Stock {
  return {
    ...searchResult,
    id: searchResult.symbol || '',
    sector_name: searchResult.industry || '',
    price_change_percentage: 0,
  };
} 