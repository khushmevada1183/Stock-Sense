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
  private baseURL: string;

  constructor() {
    // API Configuration
    const API_KEY = process.env.NEXT_PUBLIC_INDIAN_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
    this.baseURL = process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in';

    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
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
            console.log(`Found stock details with direct API call for ${cleanStockName}:`, result);
            
            // Ensure price fields are properly set
            this.normalizeStockPrices(result);
            
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
            console.log(`Found stock details with query params for ${cleanStockName}:`, result);
            
            // Ensure price fields are properly set
            this.normalizeStockPrices(result);
            
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
            console.log(`Found stock details with uppercase name for ${cleanStockName}:`, result);
            
            // Ensure price fields are properly set
            this.normalizeStockPrices(result);
            
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
              console.log(`Found stock details with symbol endpoint for ${cleanStockName}:`, result);
              
              // Ensure price fields are properly set
              this.normalizeStockPrices(result);
              
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
            console.log(`Found stock details with NSE prefix for ${cleanStockName}:`, result);
            
            // Ensure price fields are properly set
            this.normalizeStockPrices(result);
            
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
            console.log(`Found stock details with BSE prefix for ${cleanStockName}:`, result);
            
            // Ensure price fields are properly set
            this.normalizeStockPrices(result);
            
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
            
            // Ensure price fields are properly set
            this.normalizeStockPrices(firstResult);
            
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
   * Normalizes stock price fields to ensure current_price is set
   * @param {StockDetails} stock - Stock details object to normalize
   */
  private normalizeStockPrices(stock: StockDetails): void {
    // Check for price in various fields and ensure current_price is set
    if (!stock.current_price) {
      // Check various price fields that might be present
      const priceValue = stock.price || 
                        stock.lastPrice || 
                        stock.last_price || 
                        stock.close || 
                        stock.close_price || 
                        stock.closePrice ||
                        stock.nse_price ||
                        stock.bse_price;
      
      if (priceValue) {
        console.log(`Normalizing price for ${stock.symbol}: setting current_price to ${priceValue}`);
        stock.current_price = priceValue;
      }
    }
    
    // Log the final price
    console.log(`Final price for ${stock.symbol}: ${stock.current_price}`);
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
      console.log(`Fetching historical data for ${stockName} with period ${period}`);
      
      // Map our UI period values to API expected values if needed
      const apiPeriod = period === '1yr' ? '1y' : 
                       period === '3yr' ? '3y' : 
                       period === '5yr' ? '5y' : period;
      
      // Direct API call to ensure fresh data
      const response = await fetch(`https://stock.indianapi.in/historical_data?stock_name=${encodeURIComponent(stockName)}&period=${apiPeriod}&filter=${filter}`, {
        headers: {
          'X-Api-Key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Historical data response for ${period}:`, data);
      
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
          date: item.date || item.timestamp,
          price: item.price || item.close || item.value || 0,
          volume: item.volume
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${stockName}:`, error);
      
      // Try cached data as fallback
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
            date: item.date || item.timestamp,
            price: item.price || item.close || item.value || 0,
            volume: item.volume
          }));
        }
      } catch (cacheErr) {
        console.error(`Error fetching cached historical data:`, cacheErr);
      }
      
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
      
      // Normalize prices in search results
      if (data && data.results && Array.isArray(data.results)) {
        data.results.forEach(stock => this.normalizeStockPrices(stock));
      }
      
      return data;
    } catch (error) {
      console.error(`Error searching stocks for "${query}":`, error);
      return { results: [] };
    }
  }

  /**
   * Get market overview data including indices, sectors, breadth
   */
  async getMarketOverview() {
    try {
      // Use cache helper to fetch and normalize response
      const data = await this.getWithCache<any>('/api/market/overview');
      return data;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return this.getMockMarketData();
    }
  }
  
  /**
   * Get mock market data for fallback
   */
  private getMockMarketData() {
    return {
      indices: [
        { name: "NIFTY 50", current: 22356.30, change: 203.25, percentChange: 0.92, color: "#22c55e" },
        { name: "SENSEX", current: 73667.76, change: 612.21, percentChange: 0.84, color: "#22c55e" },
        { name: "NIFTY BANK", current: 47892.35, change: 522.60, percentChange: 1.10, color: "#22c55e" },
        { name: "NIFTY IT", current: 34562.15, change: -126.45, percentChange: -0.36, color: "#ef4444" },
        { name: "NIFTY METAL", current: 8654.20, change: 98.70, percentChange: 1.15, color: "#22c55e" },
        { name: "NIFTY PHARMA", current: 18642.80, change: -75.30, percentChange: -0.40, color: "#ef4444" }
      ],
      
      breadth: {
        advances: 1845,
        declines: 1623,
        unchanged: 176
      },
      
      sectors: [
        { name: "Metal", change: 2.14 },
        { name: "Realty", change: 1.76 },
        { name: "PSU Bank", change: 1.62 },
        { name: "Auto", change: 1.35 },
        { name: "Bank", change: 1.10 },
        { name: "Finance", change: 0.87 },
        { name: "FMCG", change: 0.32 },
        { name: "Media", change: -0.11 },
        { name: "Pharma", change: -0.40 },
        { name: "IT", change: -0.36 }
      ],
      
      topGainers: [
        { symbol: "TATASTEEL", name: "Tata Steel Ltd.", price: 145.30, change: 9.25, percentChange: 6.8 },
        { symbol: "HINDPETRO", name: "Hindustan Petroleum Corporation Ltd.", price: 478.55, change: 26.30, percentChange: 5.81 },
        { symbol: "M&M", name: "Mahindra & Mahindra Ltd.", price: 2132.85, change: 99.65, percentChange: 4.9 },
        { symbol: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd.", price: 1290.60, change: 53.20, percentChange: 4.3 },
        { symbol: "SBIN", name: "State Bank of India", price: 782.40, change: 26.80, percentChange: 3.55 }
      ],
      
      topLosers: [
        { symbol: "WIPRO", name: "Wipro Ltd.", price: 452.65, change: -22.30, percentChange: -4.69 },
        { symbol: "HCLTECH", name: "HCL Technologies Ltd.", price: 1342.10, change: -48.75, percentChange: -3.51 },
        { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd.", price: 1187.45, change: -36.30, percentChange: -2.97 },
        { symbol: "TCS", name: "Tata Consultancy Services Ltd.", price: 3679.90, change: -94.20, percentChange: -2.5 },
        { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd.", price: 5642.35, change: -135.65, percentChange: -2.35 }
      ],
      
      mostActive: [
        { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2853.75, change: 32.45, percentChange: 1.15, volume: 15890000 },
        { symbol: "HDFC", name: "Housing Development Finance Corporation Ltd.", price: 3126.90, change: 18.20, percentChange: 0.59, volume: 9540000 },
        { symbol: "TATASTEEL", name: "Tata Steel Ltd.", price: 145.30, change: 9.25, percentChange: 6.8, volume: 8760000 },
        { symbol: "SBIN", name: "State Bank of India", price: 782.40, change: 26.80, percentChange: 3.55, volume: 7230000 },
        { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 1085.70, change: 12.35, percentChange: 1.15, volume: 6850000 }
      ],
      
      heatMap: [
        {
          sector: "Banking & Finance",
          stocks: [
            { symbol: "HDFC", name: "Housing Development Finance Corporation Ltd.", change: 0.59, marketCap: 125000 },
            { symbol: "SBIN", name: "State Bank of India", change: 3.55, marketCap: 85000 },
            { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", change: 1.15, marketCap: 95000 },
            { symbol: "AXISBANK", name: "Axis Bank Ltd.", change: 1.82, marketCap: 65000 },
            { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", change: -0.72, marketCap: 45000 },
            { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", change: 0.85, marketCap: 115000 }
          ]
        },
        {
          sector: "IT & Technology",
          stocks: [
            { symbol: "TCS", name: "Tata Consultancy Services Ltd.", change: -2.5, marketCap: 105000 },
            { symbol: "INFY", name: "Infosys Ltd.", change: -1.8, marketCap: 89000 },
            { symbol: "WIPRO", name: "Wipro Ltd.", change: -4.69, marketCap: 42000 },
            { symbol: "HCLTECH", name: "HCL Technologies Ltd.", change: -3.51, marketCap: 38000 },
            { symbol: "TECHM", name: "Tech Mahindra Ltd.", change: -1.2, marketCap: 25000 }
          ]
        },
        {
          sector: "Energy & Metals",
          stocks: [
            { symbol: "RELIANCE", name: "Reliance Industries Ltd.", change: 1.15, marketCap: 145000 },
            { symbol: "ONGC", name: "Oil and Natural Gas Corporation Ltd.", change: 2.3, marketCap: 35000 },
            { symbol: "TATASTEEL", name: "Tata Steel Ltd.", change: 6.8, marketCap: 28000 },
            { symbol: "HINDPETRO", name: "Hindustan Petroleum Corporation Ltd.", change: 5.81, marketCap: 18000 },
            { symbol: "COALINDIA", name: "Coal India Ltd.", change: 3.2, marketCap: 22000 },
            { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", change: 4.1, marketCap: 19000 }
          ]
        }
      ]
    };
  }
}

// Export a singleton instance
const indianApiService = new IndianApiService();
export default indianApiService;