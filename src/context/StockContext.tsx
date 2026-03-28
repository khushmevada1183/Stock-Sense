"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import * as api from '@/api/api';
import { 
  searchStocks, 
  fetchStockDetails, 
  fetchHistoricalData
} from '@/api/api';

// Simplified unified type, as backend now provides a consistent format
interface StockDetails {
  symbol: string;
  companyName: string;
  latestPrice?: number;
  change?: number;
  changePercent?: number;
  sector?: string;
  industry?: string;
  [key: string]: unknown;
}

// Simplified types, as we have a unified API
type SearchResult = Pick<StockDetails, 'symbol' | 'companyName' | 'latestPrice'>;
type HistoricalDataPoint = { date: string; close: number };
type NewsItem = { title: string; url: string; source: string; summary: string; publishedAt: string };

interface PriceShocker {
  symbol?: string;
  tickerId?: string;
  company_name?: string;
  companyName?: string;
  current_price?: number;
  change_percent?: string | number;
  sector?: string;
}

interface StockContextValue {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
  setSearchQuery: (query: string) => void;
  favoriteStocks: string[];
  addFavorite: (symbol: string) => void;
  removeFavorite: (symbol: string) => void;
  isFavorite: (symbol: string) => boolean;
  topGainers: StockDetails[];
  topLosers: StockDetails[];
  isLoadingMarketData: boolean;
  marketDataError: string | null;
  refreshMarketData: () => Promise<void>;
  marketNews: NewsItem[];
  isLoadingNews: boolean;
  newsError: string | null;
  refreshNews: () => Promise<void>;
  currentStock: StockDetails | null;
  isLoadingStockDetails: boolean;
  stockDetailsError: string | null;
  fetchStockDetails: (symbol: string) => Promise<void>;
  historicalData: HistoricalDataPoint[];
  isLoadingHistoricalData: boolean;
  historicalDataError: string | null;
  fetchHistoricalData: (symbol: string, period?: string) => Promise<void>;
}

const StockContext = createContext<StockContextValue | undefined>(undefined);

export const StockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [favoriteStocks, setFavoriteStocks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favoriteStocks');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [topGainers, setTopGainers] = useState<StockDetails[]>([]);
  const [topLosers, setTopLosers] = useState<StockDetails[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const [marketNews, setMarketNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const [currentStock, setCurrentStock] = useState<StockDetails | null>(null);
  const [isLoadingStockDetails, setIsLoadingStockDetails] = useState(false);
  const [stockDetailsError, setStockDetailsError] = useState<string | null>(null);

  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoadingHistoricalData, setIsLoadingHistoricalData] = useState(false);
  const [historicalDataError, setHistoricalDataError] = useState<string | null>(null);

  const addFavorite = useCallback((symbol: string) => {
    setFavoriteStocks(prev => {
      const newSet = new Set(prev);
      newSet.add(symbol);
      const updated = Array.from(newSet);
      if (typeof window !== 'undefined') {
        localStorage.setItem('favoriteStocks', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((symbol: string) => {
    setFavoriteStocks(prev => {
      const updated = prev.filter(s => s !== symbol);
      if (typeof window !== 'undefined') {
        localStorage.setItem('favoriteStocks', JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback((symbol: string) => favoriteStocks.includes(symbol), [favoriteStocks]);

  const internalFetchStockDetails = useCallback(async (symbol: string) => {
    setIsLoadingStockDetails(true);
    setStockDetailsError(null);
    try {
      const data = await fetchStockDetails(symbol);
      setCurrentStock(data);
    } catch (error) {
      setStockDetailsError(error instanceof Error ? error.message : 'Failed to fetch stock details.');
    } finally {
      setIsLoadingStockDetails(false);
    }
  }, []);
  
  const internalFetchHistoricalData = useCallback(async (symbol: string, period = '1yr') => {
    setIsLoadingHistoricalData(true);
    setHistoricalDataError(null);
    try {
      const data = await fetchHistoricalData(symbol, period);
      setHistoricalData(data);
    } catch (error) {
      setHistoricalDataError(error instanceof Error ? error.message : 'Failed to fetch historical data.');
    } finally {
      setIsLoadingHistoricalData(false);
    }
  }, []);

  const refreshMarketData = useCallback(async () => {
    setIsLoadingMarketData(true);
    setMarketDataError(null);
    try {
      // Use the price shockers API instead since the gainers/losers APIs are not available
      const priceShockersResponse = await api.getPriceShockers();
      const priceShockers: PriceShocker[] = Array.isArray(priceShockersResponse) ? priceShockersResponse : [];
      const toStockDetails = (stock: PriceShocker): StockDetails => ({
        symbol: stock.symbol || stock.tickerId || 'N/A',
        companyName: stock.company_name || stock.companyName || stock.symbol || stock.tickerId || 'Unknown Company',
        latestPrice: stock.current_price,
        changePercent: stock.change_percent !== undefined ? parseFloat(stock.change_percent.toString()) : undefined,
        sector: stock.sector
      });
      
      // Split the price shockers into gainers and losers based on their change
      const gainers = priceShockers
        .filter((stock) => stock.change_percent !== undefined && parseFloat(stock.change_percent.toString()) > 0)
        .map(toStockDetails);
      const losers = priceShockers
        .filter((stock) => stock.change_percent !== undefined && parseFloat(stock.change_percent.toString()) < 0)
        .map(toStockDetails);
      
      setTopGainers(gainers);
      setTopLosers(losers);
    } catch (error) {
      setMarketDataError(error instanceof Error ? error.message : 'Failed to fetch market data.');
    } finally {
      setIsLoadingMarketData(false);
    }
  }, []);

  const refreshNews = useCallback(async () => {
    setIsLoadingNews(true);
    setNewsError(null);
    try {
      // Use the getLatestNews function since it matches the documented API
      const response = await api.getLatestNews();
      setMarketNews(response.news || []);
    } catch (error) {
      setNewsError(error instanceof Error ? error.message : 'Failed to fetch news.');
    } finally {
      setIsLoadingNews(false);
    }
  }, []);
  
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchStocks(searchQuery);
        setSearchResults(results);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : 'An error occurred during search.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchError,
    favoriteStocks,
    addFavorite,
    removeFavorite,
    isFavorite,
    topGainers,
    topLosers,
    isLoadingMarketData,
    marketDataError,
    refreshMarketData,
    marketNews,
    isLoadingNews,
    newsError,
    refreshNews,
    currentStock,
    isLoadingStockDetails,
    stockDetailsError,
    fetchStockDetails: internalFetchStockDetails,
    historicalData,
    isLoadingHistoricalData,
    historicalDataError,
    fetchHistoricalData: internalFetchHistoricalData,
  };

  return <StockContext.Provider value={value}>{children}</StockContext.Provider>;
};

export const useStock = (): StockContextValue => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};