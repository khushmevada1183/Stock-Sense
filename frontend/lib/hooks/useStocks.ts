import { useState, useEffect, useCallback, useRef } from 'react';
import apiService from '../../services/apiService';

// Types for stock data
export interface StockData {
  symbol: string;
  companyName: string;
  latestPrice?: number;
  change?: number;
  changePercent?: number;
  sector?: string;
}

export interface StockDetailsData {
  symbol: string;
  company_name: string;
  current_price: number;
  percent_change?: number;
  sector?: string;
  industry?: string;
  market_cap?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  year_high?: number;
  year_low?: number;
  volume?: number;
  average_volume?: number;
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
}

// Type for the caching logic
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Hook to fetch search results
export function useStockSearch() {
  const [results, setResults] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, CacheItem<StockData[]>>>({});
  
  const searchStocks = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    
    // Check cache first (with 2 minute expiry)
    const cacheKey = `search:${query}`;
    const cachedItem = cache.current[cacheKey];
    const now = Date.now();
    
    if (cachedItem && now - cachedItem.timestamp < 2 * 60 * 1000) {
      setResults(cachedItem.data);
      return;
    }
    
    // Fetch from API if not in cache
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.searchStocks(query);
      const stockData = response.results;
      
      // Update state and cache
      setResults(stockData);
      cache.current[cacheKey] = {
        data: stockData,
        timestamp: now
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { results, isLoading, error, searchStocks };
}

// Hook to fetch stock details
export function useStockDetails(symbol: string) {
  const [stockDetails, setStockDetails] = useState<StockDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, CacheItem<StockDetailsData>>>({});
  
  const fetchStockDetails = useCallback(async () => {
    if (!symbol) {
      return;
    }
    
    // Check cache first (with 5 minute expiry)
    const cacheKey = `details:${symbol}`;
    const cachedItem = cache.current[cacheKey];
    const now = Date.now();
    
    if (cachedItem && now - cachedItem.timestamp < 5 * 60 * 1000) {
      setStockDetails(cachedItem.data);
      return;
    }
    
    // Fetch from API if not in cache
    setIsLoading(true);
    setError(null);
    
    try {
      const details = await apiService.getStockDetails(symbol);
      
      // Update state and cache
      setStockDetails(details);
      cache.current[cacheKey] = {
        data: details,
        timestamp: now
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching stock details');
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);
  
  // Fetch data on initial render or when symbol changes
  useEffect(() => {
    if (symbol) {
      fetchStockDetails();
    }
  }, [symbol, fetchStockDetails]);
  
  return { stockDetails, isLoading, error, refreshData: fetchStockDetails };
}

// Hook to fetch historical data
export function useHistoricalData(symbol: string, period: string = '1yr') {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, CacheItem<HistoricalDataPoint[]>>>({});
  
  const fetchHistoricalData = useCallback(async () => {
    if (!symbol) {
      return;
    }
    
    // Check cache first (with 1 hour expiry)
    const cacheKey = `historical:${symbol}:${period}`;
    const cachedItem = cache.current[cacheKey];
    const now = Date.now();
    
    if (cachedItem && now - cachedItem.timestamp < 60 * 60 * 1000) {
      setHistoricalData(cachedItem.data);
      return;
    }
    
    // Fetch from API if not in cache
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getHistoricalData(symbol, period);
      
      // Update state and cache
      setHistoricalData(data);
      cache.current[cacheKey] = {
        data,
        timestamp: now
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching historical data');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, period]);
  
  // Fetch data on initial render or when dependencies change
  useEffect(() => {
    if (symbol) {
      fetchHistoricalData();
    }
  }, [symbol, period, fetchHistoricalData]);
  
  return { historicalData, isLoading, error, refreshData: fetchHistoricalData };
}

// Hook to fetch market data (top gainers, losers, etc.)
export function useMarketData() {
  const [marketData, setMarketData] = useState<{
    topGainers: StockData[];
    topLosers: StockData[];
    indices: any[];
  }>({
    topGainers: [],
    topLosers: [],
    indices: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, CacheItem<any>>>({});
  
  const fetchMarketData = useCallback(async () => {
    // Check cache first (with 1 minute expiry for market data)
    const cacheKey = 'market-data';
    const cachedItem = cache.current[cacheKey];
    const now = Date.now();
    
    if (cachedItem && now - cachedItem.timestamp < 60 * 1000) {
      setMarketData(cachedItem.data);
      return;
    }
    
    // Fetch from API if not in cache
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch all market data in parallel
      const [topGainers, topLosers, indices] = await Promise.all([
        apiService.getTopGainers(),
        apiService.getTopLosers(),
        apiService.getMarketIndices()
      ]);
      
      const data = {
        topGainers: topGainers as StockData[],
        topLosers: topLosers as StockData[],
        indices
      };
      
      // Update state and cache
      setMarketData(data);
      cache.current[cacheKey] = {
        data,
        timestamp: now
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching market data');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch data on initial render
  useEffect(() => {
    fetchMarketData();
    
    // Set up auto-refresh every minute for market data
    const intervalId = setInterval(fetchMarketData, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchMarketData]);
  
  return { ...marketData, isLoading, error, refreshData: fetchMarketData };
} 