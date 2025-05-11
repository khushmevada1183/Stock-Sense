import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API response types
export interface StockDetails {
  symbol: string;
  name: string;
  company_name?: string;
  current_price?: number;
  price?: number;          // Add price field
  lastPrice?: number;      // Add lastPrice field
  last_price?: number;     // Add last_price field
  change?: number;
  percent_change?: number;
  market_cap?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  volume?: number;
  sector?: string;
  industry?: string;
  year_high?: number;
  year_low?: number;
  [key: string]: any; // For additional fields
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

// Create Indian API Service class
class IndianApiService {
  private api: AxiosInstance;
  private cacheData: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTTL: number = 5 * 60 * 1000; // 5 minutes default TTL

  constructor() {
    // API Configuration
    const API_KEY = process.env.NEXT_PUBLIC_INDIAN_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
    const BASE_URL = process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in';

    // Create axios instance with default config
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds timeout
    });

    // Global error handler
    this.api.interceptors.response.use(
      response => response,
      error => {
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Handle API errors with detailed logging
  private handleApiError(error: AxiosError): void {
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.response.status, error.response.data);
      
      // Check for specific error types
      switch (error.response.status) {
        case 401:
          console.error('Authentication Error: Invalid or expired API key');
          break;
        case 403:
          console.error('Access Denied: Insufficient permissions');
          break;
        case 404:
          console.error('Resource Not Found: The requested resource does not exist');
          break;
        case 429:
          console.error('Rate Limit Exceeded: Too many requests');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          console.error('Server Error: The API server encountered an error');
          break;
      }
    } else if (error.request) {
      // Request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('API Request Error:', error.message);
    }
  }

  // Get cached data or fetch from API
  private async getWithCache<T>(endpoint: string, params: any = {}, ttl?: number): Promise<T> {
    // Generate cache key from endpoint and params
    const paramString = Object.entries(params)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const cacheKey = `${endpoint}${paramString ? '?' + paramString : ''}`;
    const now = Date.now();
    const cachedItem = this.cacheData.get(cacheKey);
    
    // Return cached data if still valid
    if (cachedItem && now - cachedItem.timestamp < (ttl || this.cacheTTL)) {
      console.log(`Cache hit for ${cacheKey}`);
      return cachedItem.data as T;
    }
    
    // Otherwise fetch fresh data
    console.log(`Fetching fresh data for ${cacheKey}`);
    
    try {
      const response = await this.api.get<T>(endpoint, { params });
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

  /**
   * Fetches the latest IPO data
   * @returns {Promise<IpoItem[]>} IPO data
   */
  async getIPOData(): Promise<IpoItem[]> {
    try {
      const data = await this.getWithCache<any>('/ipo');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching IPO data:', error);
      throw error;
    }
  }

  /**
   * Fetches the latest market news
   * @returns {Promise<NewsItem[]>} News data
   */
  async getNewsData(): Promise<NewsItem[]> {
    try {
      const data = await this.getWithCache<any>('/news');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching news data:', error);
      throw error;
    }
  }

  /**
   * Fetches details for a specific stock
   * @param {string} stockName - Name of the stock (e.g., "Tata Steel")
   * @returns {Promise<StockDetails>} Stock details
   */
  async getStockDetails(stockName: string): Promise<StockDetails> {
    if (!stockName) {
      throw new Error('Stock name is required');
    }
    
    // Clean up the stock name - remove any exchange prefixes
    let cleanStockName = stockName.trim();
    cleanStockName = cleanStockName.replace(/^(NSE:|BSE:)/, '');
    
    console.log(`Fetching stock details for: ${cleanStockName}`);
    
    // Try multiple approaches to get stock details
    const attempts = [
      // Try direct API call with original name
      async () => {
        try {
          const result = await this.getWithCache<StockDetails>(`/stock/${encodeURIComponent(cleanStockName)}`, {});
          if (result && Object.keys(result).length > 0) {
            console.log(`Found stock details with direct API call for ${cleanStockName}`);
            return result;
          }
        } catch (err) {
          console.log(`Direct API call failed for ${cleanStockName}`);
        }
        return null;
      },
      
      // Try with query params
      async () => {
        try {
          const result = await this.getWithCache<StockDetails>('/stock', { name: cleanStockName });
          if (result && Object.keys(result).length > 0) {
            console.log(`Found stock details with query params for ${cleanStockName}`);
            return result;
          }
        } catch (err) {
          console.log(`Query params call failed for ${cleanStockName}`);
        }
        return null;
      },
      
      // Try uppercase version
      async () => {
        try {
          const result = await this.getWithCache<StockDetails>('/stock', { name: cleanStockName.toUpperCase() });
          if (result && Object.keys(result).length > 0) {
            console.log(`Found stock details with uppercase name for ${cleanStockName}`);
            return result;
          }
        } catch (err) {
          console.log(`Uppercase query failed for ${cleanStockName}`);
        }
        return null;
      },
      
      // Try with symbol endpoint if it looks like a symbol
      async () => {
        if (cleanStockName.length < 15) { // Most symbols are short
          try {
            const result = await this.getWithCache<StockDetails>(`/symbol/${encodeURIComponent(cleanStockName)}`, {});
            if (result && Object.keys(result).length > 0) {
              console.log(`Found stock details with symbol endpoint for ${cleanStockName}`);
              return result;
            }
          } catch (err) {
            console.log(`Symbol endpoint failed for ${cleanStockName}`);
          }
        }
        return null;
      },
      
      // Try with NSE prefix
      async () => {
        try {
          const nseSymbol = `NSE:${cleanStockName}`;
          const result = await this.getWithCache<StockDetails>('/stock', { name: nseSymbol });
          if (result && Object.keys(result).length > 0) {
            console.log(`Found stock details with NSE prefix for ${cleanStockName}`);
            return result;
          }
        } catch (err) {
          console.log(`NSE prefix query failed for ${cleanStockName}`);
        }
        return null;
      },
      
      // Try with BSE prefix
      async () => {
        try {
          const bseSymbol = `BSE:${cleanStockName}`;
          const result = await this.getWithCache<StockDetails>('/stock', { name: bseSymbol });
          if (result && Object.keys(result).length > 0) {
            console.log(`Found stock details with BSE prefix for ${cleanStockName}`);
            return result;
          }
        } catch (err) {
          console.log(`BSE prefix query failed for ${cleanStockName}`);
        }
        return null;
      },
      
      // Try search API and use first result
      async () => {
        try {
          const searchResults = await this.searchStocks(cleanStockName);
          if (searchResults && searchResults.results && searchResults.results.length > 0) {
            const firstResult = searchResults.results[0];
            console.log(`Found stock details via search API for ${cleanStockName}:`, firstResult);
            return firstResult;
          }
        } catch (err) {
          console.log(`Search API failed for ${cleanStockName}`);
        }
        return null;
      }
    ];
    
    // Try each method in sequence
    for (const attempt of attempts) {
      const result = await attempt();
      if (result) return result;
    }
    
    // If all attempts fail, throw an error
    throw new Error(`No data found for stock ${stockName} after multiple attempts. Please check the stock symbol and try again.`);
  }

  /**
   * Fetches trending stocks
   * @returns {Promise<StockDetails[]>} Trending stocks data
   */
  async getTrendingStocks(): Promise<StockDetails[]> {
    try {
      const data = await this.getWithCache<any>('/trending');
      // Handle different response formats
      if (data.trending_stocks) {
        return data.trending_stocks;
      }
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
      throw error;
    }
  }

  /**
   * Fetches historical data for a stock
   * @param {string} stockName - Name of the stock
   * @param {string} period - Time period (1m, 6m, 1yr, 3yr, 5yr, 10yr, max)
   * @param {string} filter - Filter type (default, price, pe, sm, evebitda, ptb, mcs)
   * @returns {Promise<HistoricalDataPoint[]>} Historical data
   */
  async getHistoricalData(
    stockName: string, 
    period: string = '1m', 
    filter: string = 'default'
  ): Promise<HistoricalDataPoint[]> {
    try {
      const data = await this.getWithCache<any>('/historical_data', {
        stock_name: stockName,
        period: period,
        filter: filter
      });
      
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
      } else if (Array.isArray(data)) {
        return data.map((item: any) => ({
          date: item.date,
          price: item.price || item.close,
          volume: item.volume
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${stockName}:`, error);
      throw error;
    }
  }

  /**
   * Fetches commodities data
   * @returns {Promise<any>} Commodities data
   */
  async getCommoditiesData(): Promise<any> {
    try {
      return await this.getWithCache<any>('/commodities');
    } catch (error) {
      console.error('Error fetching commodities data:', error);
      throw error;
    }
  }

  /**
   * Fetches mutual funds data
   * @returns {Promise<MutualFund[]>} Mutual funds data
   */
  async getMutualFundsData(): Promise<MutualFund[]> {
    try {
      const data = await this.getWithCache<any>('/mutual_funds');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching mutual funds data:', error);
      throw error;
    }
  }

  /**
   * Fetches BSE most active stocks
   * @returns {Promise<StockDetails[]>} BSE most active stocks data
   */
  async getBSEMostActiveStocks(): Promise<StockDetails[]> {
    try {
      const data = await this.getWithCache<any>('/BSE_most_active');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching BSE most active stocks:', error);
      throw error;
    }
  }

  /**
   * Fetches NSE most active stocks
   * @returns {Promise<StockDetails[]>} NSE most active stocks data
   */
  async getNSEMostActiveStocks(): Promise<StockDetails[]> {
    try {
      const data = await this.getWithCache<any>('/NSE_most_active');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching NSE most active stocks:', error);
      throw error;
    }
  }

  /**
   * Searches for industry data
   * @param {string} query - Search query
   * @returns {Promise<any>} Industry search results
   */
  async searchIndustryData(query: string): Promise<any> {
    try {
      return await this.getWithCache<any>('/industry_search', { query });
    } catch (error) {
      console.error(`Error searching industry data for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Fetches price shockers data
   * @returns {Promise<StockDetails[]>} Price shockers data
   */
  async getPriceShockersData(): Promise<StockDetails[]> {
    try {
      const data = await this.getWithCache<any>('/price_shockers');
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching price shockers data:', error);
      throw error;
    }
  }

  /**
   * Fetches 52-week high/low data
   * @returns {Promise<any>} 52-week high/low data
   */
  async get52WeekHighLowData(): Promise<any> {
    try {
      return await this.getWithCache<any>('/fetch_52_week_high_low_data');
    } catch (error) {
      console.error('Error fetching 52-week high/low data:', error);
      throw error;
    }
  }

  /**
   * Fetches corporate actions for a stock
   * @param {string} stockName - Name of the stock
   * @returns {Promise<any>} Corporate actions
   */
  async getCorporateActions(stockName: string): Promise<any> {
    try {
      return await this.getWithCache<any>('/corporate_actions', { stock_name: stockName });
    } catch (error) {
      console.error(`Error fetching corporate actions for ${stockName}:`, error);
      throw error;
    }
  }

  /**
   * Fetches recent announcements for a stock
   * @param {string} stockName - Name of the stock
   * @returns {Promise<any>} Recent announcements
   */
  async getRecentAnnouncements(stockName: string): Promise<any> {
    try {
      return await this.getWithCache<any>('/recent_announcements', { stock_name: stockName });
    } catch (error) {
      console.error(`Error fetching recent announcements for ${stockName}:`, error);
      throw error;
    }
  }

  /**
   * Fetches target price for a stock
   * @param {string} stockId - Stock ID
   * @returns {Promise<any>} Stock target price
   */
  async getStockTargetPrice(stockId: string): Promise<any> {
    try {
      return await this.getWithCache<any>('/stock_target_price', { stock_id: stockId });
    } catch (error) {
      console.error(`Error fetching target price for ${stockId}:`, error);
      throw error;
    }
  }

  /**
   * Searches for mutual funds
   * @param {string} query - Search query
   * @returns {Promise<MutualFund[]>} Mutual fund search results
   */
  async searchMutualFunds(query: string): Promise<MutualFund[]> {
    try {
      const data = await this.getWithCache<any>('/mutual_fund_search', { query });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error searching mutual funds for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Fetches details for a mutual fund
   * @param {string} fundName - Name of the mutual fund
   * @returns {Promise<MutualFund>} Mutual fund details
   */
  async getMutualFundDetails(fundName: string): Promise<MutualFund> {
    try {
      return await this.getWithCache<MutualFund>('/mutual_funds_details', { stock_name: fundName });
    } catch (error) {
      console.error(`Error fetching mutual fund details for ${fundName}:`, error);
      throw error;
    }
  }

  /**
   * Fetches historical statistics for a stock
   * @param {string} stockName - Name of the stock
   * @param {string} stats - Type of statistics
   * @returns {Promise<any>} Historical statistics
   */
  async getHistoricalStats(stockName: string, stats: string): Promise<any> {
    try {
      return await this.getWithCache<any>('/historical_stats', { stock_name: stockName, stats });
    } catch (error) {
      console.error(`Error fetching historical stats for ${stockName}:`, error);
      throw error;
    }
  }

  /**
   * Formats a number as currency (INR)
   * @param {number} value - Value to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  }

  /**
   * Formats a date string
   * @param {string} dateString - Date string to format
   * @returns {string} Formatted date string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

  /**
   * Calculates percentage change
   * @param {number} oldValue - Old value
   * @param {number} newValue - New value
   * @returns {number} Percentage change
   */
  calculatePercentageChange(oldValue: number, newValue: number): number {
    return ((newValue - oldValue) / oldValue) * 100;
  }

  /**
   * Searches for stocks based on a query
   * @param {string} query - Search query
   * @returns {Promise<{results: StockDetails[]}>} Stock search results
   */
  async searchStocks(query: string): Promise<{results: StockDetails[]}> {
    if (!query || query.length < 2) {
      return { results: [] };
    }
    
    try {
      const data = await this.getWithCache<{results: StockDetails[]}>('/stock-search', { query }, 60 * 1000); // 1 minute cache
      return data;
    } catch (error) {
      console.error(`Error searching stocks for "${query}":`, error);
      return { results: [] };
    }
  }
}

// Export a singleton instance
const indianApiService = new IndianApiService();
export default indianApiService; 