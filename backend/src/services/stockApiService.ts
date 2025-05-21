import axios from 'axios';
import { cacheService, DEFAULT_TTL } from './cacheService';

// Configure environment variables
const API_KEY = process.env.STOCK_API_KEY || '';
const API_BASE_URL = 'https://stock.indianapi.in';

// Types for API responses
export interface SearchResult {
  symbol: string;
  companyName: string;
  latestPrice?: number;
  change?: number;
  changePercent?: number;
  sector?: string;
}

export interface StockDetails {
  symbol: string;
  company_name: string;
  industry?: string;
  sector?: string;
  current_price: number;
  percent_change?: number;
  market_cap?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  volume?: number;
  average_volume?: number;
  year_high?: number;
  year_low?: number;
  [key: string]: any;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export interface NewsItem {
  id: string | number;
  title: string;
  description: string;
  url: string;
  date: string;
  source?: string;
  imageUrl?: string;
}

export interface IpoItem {
  company_name: string;
  symbol: string;
  issue_size?: string;
  issue_price?: string;
  listing_date?: string;
  listing_gain?: string;
  status?: string;
}

class StockApiService {
  // Create an API client with proper headers
  private createApiClient() {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      timeout: 10000 // 10 second timeout
    });
  }

  // General fetch method with caching
  private async fetchWithCache<T>(endpoint: string, dataType: keyof typeof DEFAULT_TTL): Promise<T> {
    const cacheKey = `api:${endpoint}`;
    
    try {
      // Try to get from cache first
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData as T;
      }
      
      // Fetch fresh data if not in cache
      const apiClient = this.createApiClient();
      const response = await apiClient.get<T>(endpoint);
      const data = response.data;
      
      // Cache the result
      const ttl = DEFAULT_TTL[dataType];
      await cacheService.set(cacheKey, data, ttl);
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Search stocks by query
  async searchStocks(query: string): Promise<{ results: SearchResult[] }> {
    if (!query || query.length < 2) {
      return { results: [] };
    }
    
    try {
      const results = await this.fetchWithCache<any>(
        `/stock?name=${encodeURIComponent(query)}`,
        'STOCK_DATA'
      );
      
      // Transform the API response to our expected format
      if (results && Array.isArray(results.data)) {
        return {
          results: results.data.map((item: any) => ({
            symbol: item.symbol || item.name,
            companyName: item.company_name || item.name,
            latestPrice: item.current_price,
            change: item.change,
            changePercent: item.percent_change,
            sector: item.sector
          }))
        };
      }
      
      return { results: [] };
    } catch (error) {
      console.error(`Error searching stocks for "${query}":`, error);
      return { results: [] };
    }
  }
  
  // Get details for a specific stock
  async getStockBySymbol(symbol: string): Promise<StockDetails | null> {
    try {
      const data = await this.fetchWithCache<any>(
        `/stock?name=${encodeURIComponent(symbol)}`,
        'STOCK_DATA'
      );
      
      if (data && data.data && data.data.length > 0) {
        return data.data[0];
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching stock details for ${symbol}:`, error);
      throw error;
    }
  }
  
  // Get historical data for a stock
  async getHistoricalData(
    symbol: string, 
    period: string = '1yr', 
    filter: string = 'price'
  ): Promise<HistoricalDataPoint[]> {
    try {
      const data = await this.fetchWithCache<any>(
        `/stock/history?name=${encodeURIComponent(symbol)}&period=${period}&filter=${filter}`,
        'HISTORICAL_DATA'
      );
      
      // Transform API data to our expected format
      if (data && data.data && data.data.dates && data.data.prices) {
        return data.data.dates.map((date: string, index: number) => ({
          date,
          price: data.data.prices[index],
          volume: data.data.volumes ? data.data.volumes[index] : undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }
  
  // Get IPO data
  async getIpoData(): Promise<IpoItem[]> {
    try {
      const data = await this.fetchWithCache<any>('/ipo', 'MARKET_DATA');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching IPO data:', error);
      return [];
    }
  }
  
  // Get market news
  async getMarketNews(): Promise<NewsItem[]> {
    try {
      const data = await this.fetchWithCache<any>('/news', 'MARKET_DATA');
      return data.data || [];
    } catch (error) {
      console.error('Error fetching market news:', error);
      return [];
    }
  }
  
  // Get top gainers
  async getTopGainers(): Promise<StockDetails[]> {
    try {
      const data = await this.fetchWithCache<any>('/trending', 'MARKET_DATA');
      return data.data && data.data.top_gainers ? data.data.top_gainers : [];
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      return [];
    }
  }
  
  // Get top losers
  async getTopLosers(): Promise<StockDetails[]> {
    try {
      const data = await this.fetchWithCache<any>('/trending', 'MARKET_DATA');
      return data.data && data.data.top_losers ? data.data.top_losers : [];
    } catch (error) {
      console.error('Error fetching top losers:', error);
      return [];
    }
  }
  
  // Get market indices
  async getMarketIndices(): Promise<any> {
    try {
      const data = await this.fetchWithCache<any>('/indices', 'MARKET_DATA');
      return data.data || {};
    } catch (error) {
      console.error('Error fetching market indices:', error);
      return {};
    }
  }
  
  // Get 52 week high/low stocks
  async get52WeekHighLow(): Promise<any> {
    try {
      const data = await this.fetchWithCache<any>('/52-week', 'MARKET_DATA');
      return data.data || {};
    } catch (error) {
      console.error('Error fetching 52-week high/low data:', error);
      return {};
    }
  }
  
  // Get all stocks data (combined endpoint)
  async getAllStocks(): Promise<any> {
    try {
      const data = await this.fetchWithCache<any>('/trending', 'MARKET_DATA');
      return data.data || {};
    } catch (error) {
      console.error('Error fetching all stocks data:', error);
      return {};
    }
  }
}

// Export a singleton instance
export const stockApiService = new StockApiService(); 