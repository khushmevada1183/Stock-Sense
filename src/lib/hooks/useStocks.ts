import { useState, useEffect, useCallback, useRef } from 'react';
import { apiHelpers } from '../../utils/api';

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

interface PriceShockerData {
  symbol?: string;
  tickerId?: string;
  company_name?: string;
  companyName?: string;
  displayName?: string;
  current_price?: number;
  price?: number;
  change_percent?: string | number;
  sector?: string;
}

interface MarketDataState {
  topGainers: StockData[];
  topLosers: StockData[];
  indices: StockData[];
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
      const response = await apiHelpers.searchStocks(query);
      const stockData = response;
      
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
      const details = await apiHelpers.getStockDetails(symbol);
      
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
      const data = await apiHelpers.getHistoricalPrices(symbol, period);
      
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
  const [marketData, setMarketData] = useState<MarketDataState>({
    topGainers: [],
    topLosers: [],
    indices: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Record<string, CacheItem<MarketDataState>>>({});

  const toStockData = useCallback((stock: PriceShockerData): StockData => {
    const changePercent = stock.change_percent !== undefined
      ? parseFloat(stock.change_percent.toString())
      : undefined;

    return {
      symbol: stock.symbol || stock.tickerId || 'N/A',
      companyName: stock.company_name || stock.companyName || stock.displayName || stock.symbol || 'Unknown Company',
      latestPrice: stock.current_price ?? stock.price,
      changePercent,
      sector: stock.sector
    };
  }, []);
  
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
      // Fetch market data using documented endpoints
      // Price shockers can be used for both gainers and losers
      const rawPriceShockers = await apiHelpers.getPriceShockers();
      const priceShockers: PriceShockerData[] = Array.isArray(rawPriceShockers) ? rawPriceShockers : [];
      const topGainers = priceShockers.filter((stock) => {
        if (stock.change_percent === undefined) return false;
        return parseFloat(stock.change_percent.toString()) > 0;
      });
      const topLosers = priceShockers.filter((stock) => {
        if (stock.change_percent === undefined) return false;
        return parseFloat(stock.change_percent.toString()) < 0;
      });

      const topGainersData = topGainers.map(toStockData);
      const topLosersData = topLosers.map(toStockData);

      // Use trending data instead of indices since getMarketIndices is not available
      const rawMarketOverview = await apiHelpers.getMarketOverview();
      const marketOverviewPayload =
        rawMarketOverview && typeof rawMarketOverview === 'object' && 'data' in rawMarketOverview
          ? (rawMarketOverview as { data?: unknown }).data
          : rawMarketOverview;
      const trendingRows =
        marketOverviewPayload &&
        typeof marketOverviewPayload === 'object' &&
        'trending' in marketOverviewPayload &&
        Array.isArray((marketOverviewPayload as { trending?: unknown }).trending)
          ? ((marketOverviewPayload as { trending: PriceShockerData[] }).trending)
          : [];
      const indexData = trendingRows.map(toStockData);

      const data: MarketDataState = {
        topGainers: topGainersData,
        topLosers: topLosersData,
        indices: indexData
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
  }, [toStockData]);
  
  // Fetch data on initial render
  useEffect(() => {
    fetchMarketData();
    
    // Set up auto-refresh every minute for market data
    const intervalId = setInterval(fetchMarketData, 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [fetchMarketData]);
  
  return { ...marketData, isLoading, error, refreshData: fetchMarketData };
} 