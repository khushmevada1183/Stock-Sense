'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import apiService, { SearchResult } from '../../services/apiService';
import indianApiService, { StockDetails } from '../../services/indianApiService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StockLogo from './StockLogo';
import { useDebounce } from '../../lib/hooks/useDebounce';
import StockDetailsJson from './StockDetailsJson';

// Unified search result type
interface UnifiedSearchResult {
  symbol: string;
  companyName: string;
  latestPrice?: number;
  change?: number;
  changePercent?: number;
  sector?: string;
}

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'global' | 'indian'>('global');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isLoadingStockDetails, setIsLoadingStockDetails] = useState(false);
  const [stockDetailsError, setStockDetailsError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debouncedQuery = useDebounce(query, 500); // 500ms debounce

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsResultsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Convert StockDetails to UnifiedSearchResult
  const mapStockDetailsToUnified = (stocks: StockDetails[]): UnifiedSearchResult[] => {
    return stocks.map(stock => ({
      symbol: stock.symbol,
      companyName: stock.name || stock.company_name || stock.symbol,
      latestPrice: stock.current_price,
      change: stock.change,
      changePercent: stock.percent_change,
      sector: stock.sector
    }));
  };

  // Fetch stock details directly from API
  const fetchStockDetails = async (stockName: string) => {
    setIsLoadingStockDetails(true);
    setStockDetailsError(null);
    
    try {
      // Use Indian API for stock details
      const data = await indianApiService.getStockDetails(stockName);
      setSelectedStock(data);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      setStockDetailsError('Failed to load stock details. Please try again.');
      setSelectedStock(null);
    } finally {
      setIsLoadingStockDetails(false);
    }
  };

  // Fetch search results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        setResults([]);
        setIsResultsVisible(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsResultsVisible(true);

      try {
        let response;
        
        // Determine if we should use Indian API or global API
        // Check if query contains Indian stock patterns (e.g., NSE:, BSE:, or common Indian tickers)
        const isIndianQuery = /^(NSE:|BSE:|RELIANCE|TCS|INFY|SBIN|HDFC|ITC)/i.test(debouncedQuery);
        
        if (isIndianQuery) {
          setSearchMode('indian');
          response = await indianApiService.searchStocks(debouncedQuery);
          if (response && response.results) {
            setResults(mapStockDetailsToUnified(response.results).slice(0, 10));
          }
        } else {
          setSearchMode('global');
          response = await apiService.searchStocks(debouncedQuery);
          if (response && response.results) {
            setResults(response.results.slice(0, 10));
          }
        }
        
        if (!response || !response.results || response.results.length === 0) {
          // If no results from primary API, try the other API as fallback
          if (isIndianQuery) {
            response = await apiService.searchStocks(debouncedQuery);
            if (response && response.results && response.results.length > 0) {
              setResults(response.results.slice(0, 10));
              setSearchMode('global');
            } else {
              setResults([]);
              setError('No results found');
            }
          } else {
            response = await indianApiService.searchStocks(debouncedQuery);
            if (response && response.results && response.results.length > 0) {
              setResults(mapStockDetailsToUnified(response.results).slice(0, 10));
              setSearchMode('indian');
            } else {
              setResults([]);
              setError('No results found');
            }
          }
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
        setError('Error searching stocks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      setIsResultsVisible(false);
      
      // If we have results and the query matches one of them, use that symbol
      const matchingResult = results.find(result => 
        result.symbol.toLowerCase() === query.trim().toLowerCase() || 
        result.companyName.toLowerCase() === query.trim().toLowerCase()
      );
      
      if (matchingResult) {
        router.push(`/stocks/${encodeURIComponent(matchingResult.symbol)}`);
      } else {
        // Otherwise just use the query as is
        router.push(`/stocks/${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleResultClick = (symbol: string, name: string) => {
    setIsResultsVisible(false);
    setQuery(name); // Set the query to the stock name for better UX
    fetchStockDetails(name); // Fetch details for the selected stock
    
    // Navigate to the stock detail page
    router.push(`/stocks/${encodeURIComponent(symbol)}`);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Only show loading if typing actively and length >= 2
    if (value.length >= 2) {
      setIsLoading(true);
    } else {
      setResults([]);
      setIsResultsVisible(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="relative w-full max-w-md" ref={searchRef} suppressHydrationWarning>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for stocks (e.g., RELIANCE, TATASTEEL)"
            className="w-full py-2 pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onFocus={() => query.length >= 2 && setIsResultsVisible(true)}
            aria-label="Search stocks"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" suppressHydrationWarning>
            <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3" suppressHydrationWarning>
              <div 
                className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" 
                suppressHydrationWarning
                aria-hidden="true"
              ></div>
            </div>
          )}
        </form>

        {isResultsVisible && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto" 
            suppressHydrationWarning
            role="listbox"
          >
            {searchMode === 'indian' && (
              <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                Showing results from Indian markets
              </div>
            )}
            
            {results && results.length > 0 ? (
              <ul>
                {results.map((stock, index) => (
                  <li key={`${stock.symbol}-${index}`} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <button
                      onClick={() => handleResultClick(stock.symbol, stock.companyName)}
                      className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                      role="option"
                    >
                      <div className="flex items-center" suppressHydrationWarning>
                        <StockLogo symbol={stock.symbol} size={32} className="mr-3" />
                        <div suppressHydrationWarning>
                          <p className="font-medium">{stock.symbol || 'Unknown'}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {stock.companyName || stock.symbol}
                            {stock.sector && <span className="ml-1 text-xs text-gray-500">({stock.sector})</span>}
                          </p>
                        </div>
                      </div>
                      {stock.latestPrice !== undefined && (
                        <div className="text-right" suppressHydrationWarning>
                          <p className="font-medium">
                            {searchMode === 'indian' ? '₹' : '$'}
                            {typeof stock.latestPrice === 'number' 
                                ? stock.latestPrice.toLocaleString(searchMode === 'indian' ? 'en-IN' : 'en-US', {
                                    maximumFractionDigits: 2,
                                    minimumFractionDigits: 2
                                  })
                                : '0.00'}
                          </p>
                          {stock.changePercent !== undefined && (
                            <p className={`text-xs ${Number(stock.changePercent) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {Number(stock.changePercent) >= 0 ? '+' : ''}
                              {typeof stock.changePercent === 'number' 
                                ? stock.changePercent.toFixed(2)
                                : '0.00'}%
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                {error ? (
                  <p>{error}</p>
                ) : debouncedQuery.length >= 2 && !isLoading ? (
                  <>
                    <p>No stocks found matching "{debouncedQuery}"</p>
                    <p className="mt-1 text-xs">Try a different search term or check your internet connection.</p>
                  </>
                ) : null}
                </div>
            )}
          </div>
        )}
      </div>

      {/* Stock Details JSON Display */}
      <div className="flex-1 min-w-0">
        <StockDetailsJson 
          stock={selectedStock}
          isLoading={isLoadingStockDetails}
          error={stockDetailsError}
        />
      </div>
    </div>
  );
};

export default SearchBar; 