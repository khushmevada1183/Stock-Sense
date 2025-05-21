"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import indianApiService from '../services/indianApiService';

// Import types from the apiService
import type { 
  SearchResult, 
  StockDetails as GlobalStockDetails, 
  HistoricalDataPoint, 
  NewsItem
} from '../services/apiService';

// Import types from indianApiService
import type { StockDetails as IndianStockDetails } from '../services/indianApiService';

// Create a unified type for stock details that can handle both API formats
interface UnifiedStockDetails {
  symbol: string;
  companyName: string;
  company_name?: string;
  current_price?: number;
  latestPrice?: number;
  change?: number;
  changePercent?: number;
  percent_change?: number;
  sector?: string;
  industry?: string;
  isIndianStock?: boolean;
  [key: string]: any; // For any other fields
}

interface StockContextValue {
  // Search
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
  setSearchQuery: (query: string) => void;
  
  // Favorites
  favoriteStocks: string[];
  addFavorite: (symbol: string) => void;
  removeFavorite: (symbol: string) => void;
  isFavorite: (symbol: string) => boolean;
  
  // Market data
  topGainers: UnifiedStockDetails[];
  topLosers: UnifiedStockDetails[];
  isLoadingMarketData: boolean;
  marketDataError: string | null;
  refreshMarketData: () => Promise<void>;
  
  // News
  marketNews: NewsItem[];
  isLoadingNews: boolean;
  newsError: string | null;
  refreshNews: () => Promise<void>;
  
  // Current stock details
  currentStock: UnifiedStockDetails | null;
  isLoadingStockDetails: boolean;
  stockDetailsError: string | null;
  setCurrentStockSymbol: (symbol: string) => void;
  
  // Historical data
  historicalData: HistoricalDataPoint[];
  isLoadingHistoricalData: boolean;
  historicalDataError: string | null;
  refreshHistoricalData: (symbol: string, period?: string) => Promise<void>;
  
  // Indian market specific
  isIndianStock: (symbol: string) => boolean;
}

// Create the context with default values
const StockContext = createContext<StockContextValue>({
  // Search
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  searchError: null,
  setSearchQuery: () => {},
  
  // Favorites
  favoriteStocks: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  
  // Market data
  topGainers: [],
  topLosers: [],
  isLoadingMarketData: false,
  marketDataError: null,
  refreshMarketData: async () => {},
  
  // News
  marketNews: [],
  isLoadingNews: false,
  newsError: null,
  refreshNews: async () => {},
  
  // Current stock details
  currentStock: null,
  isLoadingStockDetails: false,
  stockDetailsError: null,
  setCurrentStockSymbol: () => {},
  
  // Historical data
  historicalData: [],
  isLoadingHistoricalData: false,
  historicalDataError: null,
  refreshHistoricalData: async () => {},
  
  // Indian market specific
  isIndianStock: () => false,
});

// Provider component
export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Favorites state (using localStorage for persistence)
  const [favoriteStocks, setFavoriteStocks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favoriteStocks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  // Market data state
  const [topGainers, setTopGainers] = useState<UnifiedStockDetails[]>([]);
  const [topLosers, setTopLosers] = useState<UnifiedStockDetails[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);
  
  // News state
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  
  // Current stock details state
  const [currentStock, setCurrentStock] = useState<UnifiedStockDetails | null>(null);
  const [currentStockSymbol, setCurrentStockSymbol] = useState<string>('');
  const [isLoadingStockDetails, setIsLoadingStockDetails] = useState(false);
  const [stockDetailsError, setStockDetailsError] = useState<string | null>(null);
  
  // Historical data state
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [historicalPeriod, setHistoricalPeriod] = useState('1yr');
  const [isLoadingHistoricalData, setIsLoadingHistoricalData] = useState(false);
  const [historicalDataError, setHistoricalDataError] = useState<string | null>(null);
  
  // Helper to check if a symbol is an Indian stock
  const isIndianStock = useCallback((symbol: string) => {
    // Check if the symbol matches Indian stock patterns
    return /^(NSE:|BSE:|RELIANCE|TCS|INFY|SBIN|HDFC|ITC)/i.test(symbol);
  }, []);
  
  // Favorites management
  const addFavorite = useCallback((symbol: string) => {
    setFavoriteStocks(prev => {
      const updated = [...prev, symbol];
      localStorage.setItem('favoriteStocks', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  const removeFavorite = useCallback((symbol: string) => {
    setFavoriteStocks(prev => {
      const updated = prev.filter(s => s !== symbol);
      localStorage.setItem('favoriteStocks', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  const isFavorite = useCallback((symbol: string) => {
    return favoriteStocks.includes(symbol);
  }, [favoriteStocks]);
  
  // Search functionality with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      
      try {
        // Determine if we should use Indian API based on the query
        const shouldUseIndianApi = isIndianStock(searchQuery);
        
        let response;
        if (shouldUseIndianApi) {
          const indianResponse = await indianApiService.searchStocks(searchQuery);
          // Convert Indian API response to expected format
          response = {
            results: indianResponse.results.map(stock => ({
              symbol: stock.symbol,
              companyName: stock.name || stock.company_name || stock.symbol,
              latestPrice: stock.current_price,
              change: stock.change,
              changePercent: stock.percent_change,
              sector: stock.sector
            }))
          };
        } else {
          response = await apiService.searchStocks(searchQuery);
        }
        
        setSearchResults(response.results);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : 'An error occurred during search');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isIndianStock]);
  
  // Helper to convert GlobalStockDetails to UnifiedStockDetails
  const convertGlobalToUnified = (stock: GlobalStockDetails): UnifiedStockDetails => {
    return {
      ...stock,
      companyName: stock.companyName || stock.company_name || stock.symbol,
      changePercent: stock.changePercent,
      isIndianStock: false
    };
  };
  
  // Helper to convert IndianStockDetails to UnifiedStockDetails
  const convertIndianToUnified = (stock: IndianStockDetails): UnifiedStockDetails => {
    return {
      symbol: stock.symbol,
      companyName: stock.name || stock.company_name || stock.symbol,
      company_name: stock.company_name,
      latestPrice: stock.current_price,
      current_price: stock.current_price,
      change: stock.change,
      changePercent: stock.percent_change,
      percent_change: stock.percent_change,
      sector: stock.sector,
      industry: stock.industry,
      isIndianStock: true
    };
  };
  
  // Fetch market data
  const refreshMarketData = useCallback(async () => {
    setIsLoadingMarketData(true);
    setMarketDataError(null);
    
    try {
      // Fetch from both APIs and combine results
      const [globalGainers, globalLosers, indianTrending] = await Promise.all([
        apiService.getTopGainers(),
        apiService.getTopLosers(),
        indianApiService.getTrendingStocks().catch(() => [])
      ]);
      
      // Convert to unified format
      const gainersWithSource = globalGainers.map(convertGlobalToUnified);
      const losersWithSource = globalLosers.map(convertGlobalToUnified);
      
      // Process Indian trending stocks into gainers and losers
      const indianGainers = indianTrending
        .filter(stock => stock.percent_change && stock.percent_change > 0)
        .map(convertIndianToUnified);
      
      const indianLosers = indianTrending
        .filter(stock => stock.percent_change && stock.percent_change < 0)
        .map(convertIndianToUnified);
      
      // Combine and sort the results
      const combinedGainers = [...gainersWithSource, ...indianGainers]
        .sort((a, b) => ((b.changePercent || b.percent_change || 0) - (a.changePercent || a.percent_change || 0)));
      
      const combinedLosers = [...losersWithSource, ...indianLosers]
        .sort((a, b) => ((a.changePercent || a.percent_change || 0) - (b.changePercent || b.percent_change || 0)));
      
      setTopGainers(combinedGainers);
      setTopLosers(combinedLosers);
    } catch (error) {
      setMarketDataError(error instanceof Error ? error.message : 'Failed to load market data');
    } finally {
      setIsLoadingMarketData(false);
    }
  }, []);
  
  // Fetch news data
  const refreshNews = useCallback(async () => {
    setIsLoadingNews(true);
    setNewsError(null);
    
    try {
      // Try to get Indian news first, fall back to global news
      let newsData: NewsItem[] = [];
      
      try {
        const indianNews = await indianApiService.getNewsData();
        // Convert to common format if needed
        newsData = indianNews.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          url: item.url,
          date: item.date,
          source: item.source,
          imageUrl: item.imageUrl
        }));
      } catch (err) {
        console.error('Failed to load Indian news, falling back to global news', err);
        newsData = await apiService.getMarketNews();
      }
      
      setMarketNews(newsData);
    } catch (error) {
      setNewsError(error instanceof Error ? error.message : 'Failed to load market news');
    } finally {
      setIsLoadingNews(false);
    }
  }, []);
  
  // Fetch stock details
  useEffect(() => {
    if (!currentStockSymbol) return;
    
    async function fetchStockDetails() {
      setIsLoadingStockDetails(true);
      setStockDetailsError(null);
      
      try {
        // Determine which API to use based on the symbol
        const useIndianApi = isIndianStock(currentStockSymbol);
        
        if (useIndianApi) {
          // Clean the symbol (remove NSE: or BSE: prefix if present)
          const cleanSymbol = currentStockSymbol.replace(/^(NSE:|BSE:)/, '');
          
          try {
            const indianStockData = await indianApiService.getStockDetails(cleanSymbol);
            // Convert to unified format
            setCurrentStock(convertIndianToUnified(indianStockData));
          } catch (err) {
            // If Indian API fails, try global API as fallback
            console.error('Failed to load Indian stock details, trying global API', err);
            const stockData = await apiService.getStockDetails(currentStockSymbol);
            setCurrentStock(convertGlobalToUnified(stockData));
          }
        } else {
          const stockData = await apiService.getStockDetails(currentStockSymbol);
          setCurrentStock(convertGlobalToUnified(stockData));
        }
      } catch (error) {
        setStockDetailsError(error instanceof Error ? error.message : 'Failed to load stock details');
      } finally {
        setIsLoadingStockDetails(false);
      }
    }
    
    fetchStockDetails();
  }, [currentStockSymbol, isIndianStock]);
  
  // Fetch historical data
  const refreshHistoricalData = useCallback(async (symbol: string, period: string = '1yr') => {
    if (!symbol) return;
    
    setIsLoadingHistoricalData(true);
    setHistoricalDataError(null);
    setHistoricalPeriod(period);
    
    try {
      // Determine which API to use
      const useIndianApi = isIndianStock(symbol);
      
      let data: HistoricalDataPoint[] = [];
      
      if (useIndianApi) {
        // Clean the symbol (remove NSE: or BSE: prefix if present)
        const cleanSymbol = symbol.replace(/^(NSE:|BSE:)/, '');
        
        try {
          // Convert period to format expected by Indian API
          const periodMap: Record<string, string> = {
            '1d': '1d',
            '5d': '5d',
            '1m': '1m',
            '3m': '3m',
            '6m': '6m',
            '1yr': '1y',
            '2yr': '2y',
            '5yr': '5y',
            'max': 'max'
          };
          
          const mappedPeriod = periodMap[period] || '1m';
          data = await indianApiService.getHistoricalData(cleanSymbol, mappedPeriod);
        } catch (err) {
          console.error('Failed to load Indian historical data, trying global API', err);
          data = await apiService.getHistoricalData(symbol, period);
        }
      } else {
        data = await apiService.getHistoricalData(symbol, period);
      }
      
      setHistoricalData(data);
    } catch (error) {
      setHistoricalDataError(error instanceof Error ? error.message : 'Failed to load historical data');
    } finally {
      setIsLoadingHistoricalData(false);
    }
  }, [isIndianStock]);
  
  // Initially load market data and news
  useEffect(() => {
    refreshMarketData();
    refreshNews();
    
    // Refresh market data every minute
    const intervalId = setInterval(refreshMarketData, 60000);
    
    return () => clearInterval(intervalId);
  }, [refreshMarketData, refreshNews]);
  
  // Create the context value object
  const value: StockContextValue = {
    // Search
    searchQuery,
    searchResults,
    isSearching,
    searchError,
    setSearchQuery,
    
    // Favorites
    favoriteStocks,
    addFavorite,
    removeFavorite,
    isFavorite,
    
    // Market data
    topGainers,
    topLosers,
    isLoadingMarketData,
    marketDataError,
    refreshMarketData,
    
    // News
    marketNews,
    isLoadingNews,
    newsError,
    refreshNews,
    
    // Current stock details
    currentStock,
    isLoadingStockDetails,
    stockDetailsError,
    setCurrentStockSymbol,
    
    // Historical data
    historicalData,
    isLoadingHistoricalData,
    historicalDataError,
    refreshHistoricalData,
    
    // Indian market specific
    isIndianStock
  };
  
  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

// Custom hook to use the stock context
export const useStock = () => useContext(StockContext); 