"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';

// Import types from the apiService
import type { 
  SearchResult, 
  StockDetails, 
  HistoricalDataPoint, 
  NewsItem
} from '../services/apiService';

// Use the default exported apiService instance

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
  topGainers: StockDetails[];
  topLosers: StockDetails[];
  isLoadingMarketData: boolean;
  marketDataError: string | null;
  refreshMarketData: () => Promise<void>;
  
  // News
  marketNews: NewsItem[];
  isLoadingNews: boolean;
  newsError: string | null;
  refreshNews: () => Promise<void>;
  
  // Current stock details
  currentStock: StockDetails | null;
  isLoadingStockDetails: boolean;
  stockDetailsError: string | null;
  setCurrentStockSymbol: (symbol: string) => void;
  
  // Historical data
  historicalData: HistoricalDataPoint[];
  isLoadingHistoricalData: boolean;
  historicalDataError: string | null;
  refreshHistoricalData: (symbol: string, period?: string) => Promise<void>;
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
  refreshHistoricalData: async () => {}
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
  const [topGainers, setTopGainers] = useState<StockDetails[]>([]);
  const [topLosers, setTopLosers] = useState<StockDetails[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);
  
  // News state
  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  
  // Current stock details state
  const [currentStock, setCurrentStock] = useState<StockDetails | null>(null);
  const [currentStockSymbol, setCurrentStockSymbol] = useState<string>('');
  const [isLoadingStockDetails, setIsLoadingStockDetails] = useState(false);
  const [stockDetailsError, setStockDetailsError] = useState<string | null>(null);
  
  // Historical data state
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [historicalPeriod, setHistoricalPeriod] = useState('1yr');
  const [isLoadingHistoricalData, setIsLoadingHistoricalData] = useState(false);
  const [historicalDataError, setHistoricalDataError] = useState<string | null>(null);
  
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
        const response = await apiService.searchStocks(searchQuery);
        setSearchResults(response.results);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : 'An error occurred during search');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  
  // Fetch market data
  const refreshMarketData = useCallback(async () => {
    setIsLoadingMarketData(true);
    setMarketDataError(null);
    
    try {
      const [gainersData, losersData] = await Promise.all([
        apiService.getTopGainers(),
        apiService.getTopLosers()
      ]);
      
      setTopGainers(gainersData);
      setTopLosers(losersData);
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
      const newsData = await apiService.getMarketNews();
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
        const stockData = await apiService.getStockDetails(currentStockSymbol);
        setCurrentStock(stockData);
      } catch (error) {
        setStockDetailsError(error instanceof Error ? error.message : 'Failed to load stock details');
      } finally {
        setIsLoadingStockDetails(false);
      }
    }
    
    fetchStockDetails();
  }, [currentStockSymbol]);
  
  // Fetch historical data
  const refreshHistoricalData = useCallback(async (symbol: string, period: string = '1yr') => {
    if (!symbol) return;
    
    setIsLoadingHistoricalData(true);
    setHistoricalDataError(null);
    setHistoricalPeriod(period);
    
    try {
      const data = await apiService.getHistoricalData(symbol, period);
      setHistoricalData(data);
    } catch (error) {
      setHistoricalDataError(error instanceof Error ? error.message : 'Failed to load historical data');
    } finally {
      setIsLoadingHistoricalData(false);
    }
  }, []);
  
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
    refreshHistoricalData
  };
  
  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

// Custom hook to use the stock context
export const useStock = () => useContext(StockContext); 