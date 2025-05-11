import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

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
  tickerId?: string;
  company_name: string;
  companyName?: string;
  industry?: string;
  sector?: string;
  current_price: number;
  bse_price?: number;
  nse_price?: number;
  percent_change?: number;
  market_cap?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  volume?: number;
  average_volume?: number;
  year_high?: number;
  year_low?: number;
  [key: string]: any; // For any other fields that might be in the API response
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

// Create API Service class
class ApiService {
  private api: AxiosInstance;
  private cacheData: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes default TTL

  constructor() {
    // Get API URL from environment variables or localStorage
    let apiUrl = '';
    
    if (typeof window !== 'undefined') {
      apiUrl = localStorage.getItem('api_url') || 
              process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
    } else {
      apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
    }

    // Create axios instance
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000 // 10 seconds timeout
    });

    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Check if we're using a temporary API URL from session storage
        if (typeof window !== 'undefined') {
          const tempApiUrl = sessionStorage.getItem('temp_api_url');
          if (tempApiUrl) {
            config.baseURL = tempApiUrl;
          }
        }
        
        // Add authentication token if available
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
        
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Handle API errors
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('API Request Error:', error.message);
    }
  }

  // Get cached data or fetch from API
  private async getWithCache<T>(endpoint: string, ttl?: number): Promise<T> {
    const cacheKey = endpoint;
    const now = Date.now();
    const cachedItem = this.cacheData.get(cacheKey);
    
    // Return cached data if still valid
    if (cachedItem && now - cachedItem.timestamp < (ttl || this.cacheTTL)) {
      console.log(`Cache hit for ${endpoint}`);
      return cachedItem.data as T;
    }
    
    // Otherwise fetch fresh data
    console.log(`Fetching fresh data for ${endpoint}`);
    
    try {
      const response = await this.api.get<T>(endpoint);
      const data = this.extractData<T>(response);
      
      // Cache the result
      this.cacheData.set(cacheKey, { data, timestamp: now });
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Extract data from response based on API response structure
  private extractData<T>(response: AxiosResponse): T {
    if (response.data.data) {
      return response.data.data as T;
    }
    return response.data as T;
  }

  // Search stocks by query
  async searchStocks(query: string): Promise<{ results: SearchResult[] }> {
    if (!query || query.length < 2) {
      return { results: [] };
    }
    
    try {
      // Use short TTL for search results
      return await this.getWithCache<{ results: SearchResult[] }>(
        `/stocks/search?query=${encodeURIComponent(query)}`,
        60 * 1000 // 1 minute cache for search results
      );
    } catch (error) {
      console.error(`Error searching stocks for "${query}":`, error);
      
      // Fallback for common Indian stocks
      if (['ITC', 'RELIANCE', 'TCS', 'HDFC', 'INFY', 'SBIN'].includes(query.toUpperCase())) {
        return {
          results: [{
            symbol: query.toUpperCase(),
            companyName: this.getMockCompanyName(query.toUpperCase()),
            latestPrice: this.getMockPrice(query.toUpperCase()),
            change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
            changePercent: parseFloat((Math.random() * 2 - 1).toFixed(2)),
            sector: this.getMockSector(query.toUpperCase())
          }]
        };
      }
      
      return { results: [] };
    }
  }

  // Get details for a specific stock
  async getStockDetails(symbol: string): Promise<StockDetails> {
    try {
      return await this.getWithCache<StockDetails>(`/stocks/${symbol}`);
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
      const data = await this.getWithCache<any>(
        `/stocks/${symbol}/historical?period=${period}&filter=${filter}`
      );
      
      // Transform API data to our expected format
      if (data.datasets) {
        const priceDataset = data.datasets.find((d: any) => d.metric === 'Price');
        if (priceDataset && priceDataset.values) {
          return priceDataset.values.map((point: [string, number]) => ({
            date: point[0],
            price: point[1]
          }));
        }
      } else if (data.dates && data.prices) {
        return data.dates.map((date: string, index: number) => ({
          date,
          price: data.prices[index],
          volume: data.volumes ? data.volumes[index] : undefined
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  }

  // Get IPO data
  async getIpoData(): Promise<IpoItem[]> {
    try {
      return await this.getWithCache<IpoItem[]>('/ipo');
    } catch (error) {
      console.error('Error fetching IPO data:', error);
      throw error;
    }
  }

  // Get market news
  async getMarketNews(): Promise<NewsItem[]> {
    try {
      return await this.getWithCache<NewsItem[]>('/news');
    } catch (error) {
      console.error('Error fetching market news:', error);
      throw error;
    }
  }

  // Get top gainers
  async getTopGainers(): Promise<StockDetails[]> {
    try {
      const data = await this.getWithCache<any>('/stocks');
      return data.top_gainers || [];
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      throw error;
    }
  }

  // Get top losers
  async getTopLosers(): Promise<StockDetails[]> {
    try {
      const data = await this.getWithCache<any>('/stocks');
      return data.top_losers || [];
    } catch (error) {
      console.error('Error fetching top losers:', error);
      throw error;
    }
  }

  // Get featured stocks (combination of top gainers and losers)
  async getFeaturedStocks(): Promise<StockDetails[]> {
    try {
      const data = await this.getWithCache<any>('/stocks');
      
      // Combine top gainers and losers
      let featuredStocks: StockDetails[] = [];
      
      if (data.top_gainers && Array.isArray(data.top_gainers)) {
        featuredStocks.push(...data.top_gainers);
      }
      
      if (data.top_losers && Array.isArray(data.top_losers)) {
        featuredStocks.push(...data.top_losers);
      }
      
      // Limit to a reasonable number of stocks
      return featuredStocks.slice(0, 10);
    } catch (error) {
      console.error('Error fetching featured stocks:', error);
      return [];
    }
  }

  // Get market indices
  async getMarketIndices(): Promise<any> {
    try {
      return await this.getWithCache<any>('/market/indices');
    } catch (error) {
      console.error('Error fetching market indices:', error);
      throw error;
    }
  }

  // Helper methods for fallback data
  private getMockCompanyName(symbol: string): string {
    const mockNames: Record<string, string> = {
      'ITC': 'ITC Ltd',
      'RELIANCE': 'Reliance Industries Ltd',
      'TCS': 'Tata Consultancy Services Ltd',
      'HDFC': 'HDFC Bank Ltd',
      'INFY': 'Infosys Ltd',
      'SBIN': 'State Bank of India'
    };
    
    return mockNames[symbol] || `${symbol} Corporation`;
  }

  private getMockPrice(symbol: string): number {
    const mockPrices: Record<string, number> = {
      'ITC': 425.8,
      'RELIANCE': 2842.4,
      'TCS': 3567.8,
      'HDFC': 1625.6,
      'INFY': 1452.8,
      'SBIN': 754.2
    };
    
    return mockPrices[symbol] || parseFloat((Math.random() * 1000 + 500).toFixed(2));
  }

  private getMockSector(symbol: string): string {
    const mockSectors: Record<string, string> = {
      'ITC': 'FMCG',
      'RELIANCE': 'Energy',
      'TCS': 'Technology',
      'HDFC': 'Financial Services',
      'INFY': 'Technology',
      'SBIN': 'Financial Services'
    };
    
    return mockSectors[symbol] || 'Miscellaneous';
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService; 