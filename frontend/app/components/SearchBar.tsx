'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import apiService, { SearchResult } from '../../services/apiService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StockLogo from './StockLogo';
import { useDebounce } from '../../lib/hooks/useDebounce';

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        const response = await apiService.searchStocks(debouncedQuery);
        if (response && response.results) {
          setResults(response.results.slice(0, 10)); // Limit to top 10 results
          } else {
          setResults([]);
          setError('No results found');
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
      router.push(`/stocks/${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = (symbol: string) => {
    setIsResultsVisible(false);
    setQuery('');
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
          {results && results.length > 0 ? (
            <ul>
              {results.map((stock, index) => (
                <li key={`${stock.symbol}-${index}`} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <Link 
                    href={`/stocks/${encodeURIComponent(stock.symbol)}`}
                    onClick={() => handleResultClick(stock.symbol)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                          ₹{typeof stock.latestPrice === 'number' 
                              ? stock.latestPrice.toLocaleString('en-IN', {
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
                  </Link>
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
  );
};

export default SearchBar; 