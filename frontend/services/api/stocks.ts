import { ApiClient } from './client';
import { StockDetails, SearchResult, HistoricalDataPoint } from './types';
import { getEndpointPattern, storeEndpointPattern } from '.';

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
  const API_KEY = process.env.NEXT_PUBLIC_INDIAN_API_KEY || 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq';
  const BASE_URL = process.env.NEXT_PUBLIC_INDIAN_API_URL || 'https://stock.indianapi.in';
  
  return new ApiClient({
    baseURL: BASE_URL,
    apiKey: API_KEY,
    timeout: 10000,
    cacheTTL: 5 * 60 * 1000 // 5 minutes
  });
}

/**
 * Stock API service functions
 */

/**
 * Search stocks by query string
 * @param query Search query
 * @returns Search results
 */
export async function searchStocks(query: string): Promise<{ results: SearchResult[] }> {
  if (!query || query.length < 2) {
    return { results: [] };
  }
  
  try {
    // First try the standard API
    const standardClient = getApiClient();
    try {
      const results = await standardClient.get<{ results: SearchResult[] }>(
        `/stocks/search`, 
        { query },
        {},
        60 * 1000 // 1 minute cache for search results
      );
      
      // If we got results, return them
      if (results?.results?.length > 0) {
        return results;
      }
    } catch (error) {
      console.error('Error searching standard API:', error);
      // Fall through to try Indian API
    }
    
    // If no results from standard API, try Indian API
    const indianClient = getIndianApiClient();
    const indianResults = await indianClient.get<{ results: StockDetails[] }>(
      '/search', 
      { query },
      {},
      60 * 1000 // 1 minute cache
    );
    
    // Format Indian API results to match expected format
    if (indianResults?.results) {
      return {
        results: indianResults.results.map(stock => ({
          symbol: stock.symbol,
          companyName: stock.company_name || stock.name || stock.symbol,
          latestPrice: stock.current_price || stock.price || stock.last_price || stock.lastPrice,
          change: stock.change,
          changePercent: stock.percent_change,
          sector: stock.sector,
          industry: stock.industry,
          tickerId: stock.tickerId
        }))
      };
    }
    
    // If no results from either API
    return { results: [] };
  } catch (error) {
    console.error(`Error searching stocks for "${query}":`, error);
    return { results: [] };
  }
}

/**
 * Get stock details by symbol
 * @param symbol Stock symbol
 * @returns Stock details
 */
export async function getStockDetails(symbol: string): Promise<StockDetails> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails>(`/stocks/${symbol}`);
    } catch (error) {
      console.error(`Error fetching stock details from standard API for ${symbol}:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const formattedSymbol = symbol.replace(/[^\w.-]/g, '').toUpperCase();
    
    // Check if we already know the correct endpoint pattern
    const detailsEndpointKey = 'stock_details_endpoint';
    const knownEndpoint = getEndpointPattern(detailsEndpointKey);
    
    if (knownEndpoint) {
      try {
        const endpoint = knownEndpoint.replace('{symbol}', formattedSymbol);
        console.log(`Using cached stock details endpoint: ${endpoint}`);
        const result = await indianClient.get<StockDetails>(endpoint);
        return normalizeStockDetails(result);
      } catch (error) {
        console.error(`Failed using cached endpoint pattern for ${symbol} details:`, error);
        // Fall through to try all endpoints
      }
    }
    
    // Try different endpoint patterns
    const endpointPatterns = [
      `/stock/${formattedSymbol}`,
      `/stocks/${formattedSymbol}`,
      `/details/${formattedSymbol}`,
      `/quote/${formattedSymbol}`
    ];
    
    for (let i = 0; i < endpointPatterns.length; i++) {
      const endpoint = endpointPatterns[i];
      try {
        console.log(`Trying stock details endpoint: ${endpoint}`);
        const result = await indianClient.get<StockDetails>(endpoint);
        if (result) {
          storeEndpointPattern(detailsEndpointKey, endpoint.replace(formattedSymbol, '{symbol}'));
          console.log(`Found working endpoint pattern: ${endpoint}`);
          return normalizeStockDetails(result);
        }
      } catch (error) {
        console.error(`Attempt ${i+1} failed for endpoint ${endpoint}:`, error);
        // Continue to next endpoint
      }
    }
    
    // If all attempts failed
    throw new Error(`Failed to fetch stock details for ${symbol}`);
    
    // We'll only reach this code if an error was thrown in all the attempts
  } catch (error) {
    console.error(`Error fetching stock details for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get historical price data for a stock
 * @param symbol Stock symbol
 * @param period Time period (e.g., '1d', '1w', '1m', '3m', '1yr')
 * @param filter Data filter (e.g., 'price', 'volume')
 * @returns Historical data points
 */
export async function getHistoricalData(
  symbol: string,
  period: string = '1yr',
  filter: string = 'price'
): Promise<HistoricalDataPoint[]> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      const data = await standardClient.get<any>(
        `/stocks/${symbol}/historical`,
        { period, filter }
      );
      
      // Transform API data to expected format
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
      console.error(`Error fetching historical data from standard API for ${symbol}:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    
    // Convert period to Indian API format
    const indianPeriod = convertPeriodFormat(period);
    
    // Make sure we have a valid symbol format for the Indian API
    const formattedSymbol = symbol.replace(/[^\w.-]/g, '').toUpperCase();
    
    // Check if we already know the correct endpoint pattern
    const historyEndpointKey = 'history_endpoint';
    const knownEndpoint = getEndpointPattern(historyEndpointKey);
    
    if (knownEndpoint) {
      // Use the known working endpoint pattern
      try {
        const endpoint = knownEndpoint.replace('{symbol}', formattedSymbol);
        console.log(`Using cached history endpoint: ${endpoint}`);
        const data = await indianClient.get<any>(
          endpoint,
          { period: indianPeriod, filter }
        );
        
        if (data) return processHistoricalData(data);
      } catch (error) {
        console.error(`Failed using cached endpoint pattern for ${symbol}:`, error);
        // Fall through to try all endpoints
      }
    }
    
    // Different endpoint patterns to try
    const endpointPatterns = [
      `/v2/historical-data/${formattedSymbol}`,  // Try the v2 API first
      `/history/${formattedSymbol}`,
      `/historical-data/${formattedSymbol}`,
      `/stock-history/${formattedSymbol}`, 
      `/stock/${formattedSymbol}/history`,
      `/historical/${formattedSymbol}`,
      `/${formattedSymbol}/history`
    ];
    
    // Try each endpoint pattern until one works
    for (let i = 0; i < endpointPatterns.length; i++) {
      const endpoint = endpointPatterns[i];
      try {
        console.log(`Trying history endpoint: ${endpoint}`);
        const data = await indianClient.get<any>(
          endpoint,
          { period: indianPeriod, filter }
        );
        
        if (data) {
          // Store the successful endpoint pattern for future use
          storeEndpointPattern(historyEndpointKey, endpoint.replace(formattedSymbol, '{symbol}'));
          console.log(`Found working endpoint pattern: ${endpoint}`);
          return processHistoricalData(data);
        }
      } catch (error) {
        console.error(`Attempt ${i+1} failed with endpoint ${endpoint}:`, error);
        // Continue to next endpoint
      }
    }
    
    // If all attempts failed, return empty array
    console.error(`All attempts to fetch historical data failed for ${symbol}`);
    return [];
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get top gaining stocks
 * @returns List of top gainers
 */
export async function getTopGainers(): Promise<StockDetails[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails[]>('/stocks/top-gainers');
    } catch (error) {
      console.error('Error fetching top gainers from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<StockDetails[]>('/top-gainers');
    
    // Normalize results
    return result.map(normalizeStockDetails);
  } catch (error) {
    console.error('Error fetching top gainers:', error);
    return [];
  }
}

/**
 * Get top losing stocks
 * @returns List of top losers
 */
export async function getTopLosers(): Promise<StockDetails[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails[]>('/stocks/top-losers');
    } catch (error) {
      console.error('Error fetching top losers from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<StockDetails[]>('/top-losers');
    
    // Normalize results
    return result.map(normalizeStockDetails);
  } catch (error) {
    console.error('Error fetching top losers:', error);
    return [];
  }
}

/**
 * Get featured stocks 
 * @returns List of featured stocks
 */
export async function getFeaturedStocks(): Promise<StockDetails[]> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<StockDetails[]>('/stocks/featured');
    } catch (error) {
      console.error('Error fetching featured stocks from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try trending stocks from Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<StockDetails[]>('/trending');
    
    // Normalize results
    return result.map(normalizeStockDetails);
  } catch (error) {
    console.error('Error fetching featured stocks:', error);
    return [];
  }
}

/**
 * Get 52-week high and low stocks
 * @returns Object containing high and low stocks
 */
export async function get52WeekHighLow(): Promise<{ high: StockDetails[], low: StockDetails[] }> {
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<{ high: StockDetails[], low: StockDetails[] }>('/stocks/52-week');
    } catch (error) {
      console.error('Error fetching 52-week data from standard API:', error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    const result = await indianClient.get<{ high: StockDetails[], low: StockDetails[] }>('/52-week');
    
    // Normalize results
    return {
      high: result.high.map(normalizeStockDetails),
      low: result.low.map(normalizeStockDetails)
    };
  } catch (error) {
    console.error('Error fetching 52-week high-low data:', error);
    return { high: [], low: [] };
  }
}

/**
 * Get company logo
 * @param symbol Stock symbol
 * @returns Logo URL
 */
export async function getCompanyLogo(symbol: string): Promise<string> {
  if (!symbol) {
    return '';
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      const result = await standardClient.get<{ url: string }>(`/stocks/${symbol}/logo`);
      return result.url;
    } catch (error) {
      console.error(`Error fetching logo from standard API for ${symbol}:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    try {
      const result = await indianClient.get<{ url: string }>(`/stock/${symbol}/logo`);
      return result.url;
    } catch (error) {
      console.error(`Error fetching logo from Indian API for ${symbol}:`, error);
      
      // If both APIs fail, return a placeholder based on the symbol
      const symbol1 = symbol.charAt(0).toUpperCase();
      return `https://ui-avatars.com/api/?name=${symbol1}&background=random&size=150`;
    }
  } catch (error) {
    console.error(`Error fetching logo for ${symbol}:`, error);
    return '';
  }
}

/**
 * Get stock target price analysis
 * @param symbol Stock symbol
 * @returns Target price analysis
 */
export async function getStockTargetPrice(symbol: string): Promise<any> {
  if (!symbol) {
    throw new Error('Symbol is required');
  }
  
  try {
    // First try standard API
    const standardClient = getApiClient();
    try {
      return await standardClient.get<any>(`/stocks/${symbol}/target-price`);
    } catch (error) {
      console.error(`Error fetching target price from standard API for ${symbol}:`, error);
      // Fall through to try Indian API
    }
    
    // If standard API fails, try Indian API
    const indianClient = getIndianApiClient();
    return await indianClient.get<any>(`/stock/${symbol}/target-price`);
  } catch (error) {
    console.error(`Error fetching target price for ${symbol}:`, error);
    throw error;
  }
}

// Helper function to normalize stock details
function normalizeStockDetails(stock: StockDetails): StockDetails {
  if (!stock) return {} as StockDetails;
  
  // Create normalized stock object
  const normalized: StockDetails = {
    symbol: stock.symbol,
    companyName: stock.companyName || stock.company_name || stock.name || stock.symbol,
    company_name: stock.company_name || stock.companyName || stock.name || stock.symbol,
    name: stock.name || stock.company_name || stock.companyName || stock.symbol,
    sector: stock.sector || 'N/A',
    industry: stock.industry || 'N/A',
    current_price: stock.current_price || stock.price || stock.lastPrice || stock.last_price || 0,
    price: stock.price || stock.current_price || stock.lastPrice || stock.last_price || 0,
    lastPrice: stock.lastPrice || stock.last_price || stock.current_price || stock.price || 0,
    last_price: stock.last_price || stock.lastPrice || stock.current_price || stock.price || 0,
    change: stock.change || 0,
    percent_change: stock.percent_change || stock.changePercent || 0,
    changePercent: stock.changePercent || stock.percent_change || 0,
    market_cap: stock.market_cap || 0,
    pe_ratio: stock.pe_ratio || 0,
    eps: stock.eps || 0,
    dividend_yield: stock.dividend_yield || 0,
    volume: stock.volume || 0,
    average_volume: stock.average_volume || 0,
    year_high: stock.year_high || 0,
    year_low: stock.year_low || 0,
  };
  
  // Copy any additional fields
  return { ...stock, ...normalized };
}

// Helper function to convert period format between APIs
function convertPeriodFormat(period: string): string {
  const periodMap: Record<string, string> = {
    '1d': '1day',
    '1w': '1week',
    '1m': '1month',
    '3m': '3months',
    '6m': '6months',
    '1yr': '1year',
    '2yr': '2years',
    '5yr': '5years',
    'ytd': 'ytd',
    'max': 'max'
  };
  
  return periodMap[period] || '1month';
}

/**
 * Process historical data into a consistent format
 * @param data API response data
 * @returns Array of historical data points
 */
function processHistoricalData(data: any): HistoricalDataPoint[] {
  if (!data) return [];
  
  // Case 1: Array of data points
  if (Array.isArray(data)) {
    return data.map(point => ({
      date: point.date || point.timestamp || '',
      price: typeof point.price === 'string' ? parseFloat(point.price) : 
             (point.close || point.closePrice || point.price || 0),
      volume: point.volume ? (typeof point.volume === 'string' ? parseInt(point.volume) : point.volume) : undefined
    }));
  }
  
  // Case 2: Object with dates and prices arrays
  if (data.dates && data.prices) {
    return data.dates.map((date: string, index: number) => ({
      date,
      price: data.prices[index],
      volume: data.volumes ? data.volumes[index] : undefined
    }));
  }
  
  // Case 3: Object with date and price arrays in data.history
  if (data.history && Array.isArray(data.history)) {
    return data.history.map((point: any) => ({
      date: point.date || point.timestamp || '',
      price: typeof point.price === 'string' ? parseFloat(point.price) : 
             (point.close || point.closePrice || point.price || 0),
      volume: point.volume ? (typeof point.volume === 'string' ? parseInt(point.volume) : point.volume) : undefined
    }));
  }
  
  // Case 4: Object with dataset or datasets
  if (data.datasets) {
    const priceDataset = data.datasets.find((d: any) => 
      d.metric === 'Price' || d.label === 'Price' || d.name === 'Price' || d.type === 'price'
    );
    if (priceDataset && priceDataset.values) {
      return priceDataset.values.map((point: [string, number] | any) => {
        // Handle array format [date, price]
        if (Array.isArray(point)) {
          return {
            date: point[0],
            price: point[1]
          };
        }
        // Handle object format {date, value}
        return {
          date: point.date || point.timestamp || point.x || '',
          price: point.price || point.value || point.y || 0
        };
      });
    }
  }
  
  // Case 5: Object with data property containing history
  if (data.data && Array.isArray(data.data)) {
    return data.data.map((point: any) => ({
      date: point.date || point.timestamp || '',
      price: typeof point.price === 'string' ? parseFloat(point.price) : 
             (point.close || point.closePrice || point.price || 0),
      volume: point.volume ? (typeof point.volume === 'string' ? parseInt(point.volume) : point.volume) : undefined
    }));
  }
  
  // Case 6: Direct object with time series data
  if (data.timeSeries || data.time_series) {
    const series = data.timeSeries || data.time_series;
    return Object.keys(series).map(date => ({
      date,
      price: parseFloat(series[date]['4. close'] || series[date].close || '0'),
      volume: parseInt(series[date]['5. volume'] || series[date].volume || '0')
    }));
  }
  
  return [];
} 