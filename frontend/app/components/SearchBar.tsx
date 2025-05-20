/* eslint-disable jsx-a11y/role-has-required-aria-props */
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
import api, { apiHelpers } from '../../utils/api';

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
    return stocks.map(stock => {
      // Get price from any available price field
      const price = stock.current_price || stock.price || stock.lastPrice || stock.last_price || 0;
      
      console.log(`Mapping stock ${stock.symbol} with price:`, {
        current_price: stock.current_price,
        price: stock.price,
        lastPrice: stock.lastPrice,
        last_price: stock.last_price,
        final_price: price
      });
      
      return {
        symbol: stock.symbol,
        companyName: stock.name || stock.company_name || stock.symbol,
        latestPrice: price,
        change: stock.change,
        changePercent: stock.percent_change,
        sector: stock.sector
      };
    });
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
        // Use apiHelpers to search for stocks
        const stockResults = await apiHelpers.searchStocks(debouncedQuery);
        
        if (stockResults && stockResults.length > 0) {
          // Map results to our unified format
          const mappedResults = stockResults.map(stock => ({
            symbol: stock.symbol,
            companyName: stock.name || stock.company_name || stock.symbol,
            latestPrice: stock.current_price || stock.price || 0,
            changePercent: stock.percent_change,
            sector: stock.sector
          })).slice(0, 10);
          
          setResults(mappedResults);
          setSearchMode('indian');
        } else {
          // If no results, try with the global API as fallback
          try {
            const globalResults = await apiService.searchStocks(debouncedQuery);
            if (globalResults && globalResults.results && globalResults.results.length > 0) {
              setResults(globalResults.results.slice(0, 10));
              setSearchMode('global');
            } else {
              setResults([]);
              setError('No results found');
            }
          } catch {
            setResults([]);
            setError('No results found');
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      setIsResultsVisible(false);
      setIsLoadingStockDetails(true);
      setStockDetailsError(null);
      
      try {
        // If we have results and the query matches one of them, use that symbol
        const matchingResult = results.find(result => 
          result.symbol.toLowerCase() === query.trim().toLowerCase() || 
          result.companyName.toLowerCase() === query.trim().toLowerCase()
        );
        
        // Use the matching result's symbol if found, otherwise use the query
        const searchTerm = matchingResult ? matchingResult.symbol : query.trim();
        console.log(`Searching for stock: ${searchTerm}`);
        
        // Use the apiHelpers utility with improved error handling
        const data = await apiHelpers.getStockDetails(searchTerm);
        
        if (data) {
          console.log('Stock data received:', data);
          setSelectedStock(data);
        } else {
          console.error(`No data found for stock: ${searchTerm}`);
          setStockDetailsError(`No data found for "${searchTerm}". Please check the stock name or symbol and try again.`);
        }
      } catch (error: any) {
        console.error('Error fetching stock:', error);
        setStockDetailsError(
          error.response?.status === 404
            ? `Stock "${query.trim()}" not found. Please check the name or symbol and try again.`
            : `Failed to fetch stock data: ${error.message || 'Unknown error'}. Please try again.`
        );
      } finally {
        setIsLoadingStockDetails(false);
      }
    }
  };

  const handleResultClick = async (symbol: string, name: string) => {
    setIsResultsVisible(false);
    setQuery(name); // Set the query to the stock name for better UX
    setIsLoadingStockDetails(true);
    setStockDetailsError(null);
    
    try {
      console.log(`Fetching stock details for ${symbol} (${name})`);
      
      // Use the apiHelpers utility with improved error handling
      const data = await apiHelpers.getStockDetails(symbol);
      
      if (data) {
        console.log('Stock data received:', data);
        setSelectedStock(data);
      } else {
        console.error(`No data found for stock: ${symbol}`);
        setStockDetailsError(`No data found for "${name}" (${symbol}). Please try another stock.`);
      }
    } catch (error: any) {
      console.error('Error fetching stock:', error);
      setStockDetailsError(
        error.response?.status === 404
          ? `Stock "${name}" (${symbol}) not found. Please try another stock.`
          : `Failed to fetch stock data: ${error.message || 'Unknown error'}. Please try again.`
      );
    } finally {
      setIsLoadingStockDetails(false);
    }
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
    <div className="flex flex-col gap-6 w-full">
      <div className="relative w-full max-w-xl mx-auto" ref={searchRef} suppressHydrationWarning>
        <form onSubmit={handleSearch} className="relative" data-testid="search-form">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for stocks (e.g., RELIANCE, TATASTEEL)"
            className="w-full py-3 pl-10 pr-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onFocus={() => query.length >= 2 && setIsResultsVisible(true)}
            aria-label="Search stocks"
            data-testid="search-input"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" suppressHydrationWarning>
            <Search className="w-5 h-5 text-gray-400" aria-hidden="true" />
          </div>
          <button 
            type="submit" 
            className="absolute inset-y-0 right-0 flex items-center px-4 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-r-lg"
            data-testid="search-button"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
            ) : (
              <span>Search</span>
            )}
          </button>
        </form>

        {isResultsVisible && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto" 
            suppressHydrationWarning
            role="listbox"
            data-testid="search-results"
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
                      data-testid="stock-card"
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
                      {stock.latestPrice && (
                        <div className="text-right">
                          <p className="font-medium">₹{stock.latestPrice}</p>
                          {stock.changePercent && (
                            <p className={`text-xs ${Number(stock.changePercent) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {Number(stock.changePercent) >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : error ? (
              <div className="p-4 text-center text-red-500 dark:text-red-400">
                {error}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400" data-testid="no-results">
                No stocks found matching your search
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stock Details Section */}
      {(selectedStock || isLoadingStockDetails || stockDetailsError) && (
        <div className="mt-6 w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Stock Details</h2>
          <StockDetailsJson 
            stock={selectedStock}
            isLoading={isLoadingStockDetails}
            error={stockDetailsError}
          />
        </div>
      )}
    </div>
  );
};

export default SearchBar;