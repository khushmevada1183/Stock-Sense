'use client';
// SearchBar component for the stock search functionality
import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StockLogo from './StockLogo';
import { useDebounce } from '../../lib/hooks/useDebounce';
import { searchStocks as searchStocksApi } from '@/api/api';
import { logger } from '@/lib/logger';

// Unified search result type
interface UnifiedSearchResult {
  symbol: string;
  companyName: string;
  latestPrice?: number;
  change?: number;
  changePercent?: number;
  sector?: string;
}

interface SearchBarProps {
  compact?: boolean;
  showDetailsInline?: boolean;
  onSearchComplete?: (symbol: string, results?: UnifiedSearchResult[]) => void;
  isMobile?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  compact = false,
  onSearchComplete,
  isMobile = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'indian'>('indian');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const lastFetchedQueryRef = useRef('');
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
    let cancelled = false;

    const fetchResults = async () => {
      if (debouncedQuery.length < 2) {
        lastFetchedQueryRef.current = '';
        setResults([]);
        setIsResultsVisible(false);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (debouncedQuery === lastFetchedQueryRef.current) {
        setIsLoading(false);
        return;
      }

      lastFetchedQueryRef.current = debouncedQuery;

      setIsLoading(true);
      setError(null);
      setIsResultsVisible(true);

      try {
        const response = await searchStocksApi(debouncedQuery, { limit: 10 });

        if (cancelled) {
          return;
        }

        const mappedResults: UnifiedSearchResult[] = response.map((stock) => ({
          symbol: stock.symbol,
          companyName: stock.company_name || stock.name || stock.symbol,
          latestPrice: stock.current_price,
          changePercent: stock.percent_change,
          sector: stock.sector || stock.sector_name,
        }));

        if (mappedResults.length > 0) {
          setResults(mappedResults);
        } else {
          setResults([]);
          setError('No results found');
        }
      } catch (err) {
        logger.error('Search API failed:', err);
        setResults([]);
        setError('Unable to search right now. Please try again.');
      }

      setIsLoading(false);
    };

    void fetchResults();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, onSearchComplete]);

  // Function to handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only process if results are visible
    if (!isResultsVisible || results.length === 0) return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : 0
        );
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          e.preventDefault();
          const selected = results[highlightedIndex];
          handleResultClick(selected.symbol, selected.companyName);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsResultsVisible(false);
        break;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      setIsResultsVisible(false);
      
      // If we have results and the query matches one of them, use that symbol
      const matchingResult = results.find(result => 
        result.symbol.toLowerCase() === query.trim().toLowerCase() || 
        result.companyName.toLowerCase() === query.trim().toLowerCase()
      );
      
      // Use the matching result's symbol if found, otherwise use the query
      const searchTerm = matchingResult ? matchingResult.symbol : query.trim();
      
      // Navigate to stock details page
      router.push(`/stocks/${searchTerm}`);
        
      // Optionally notify parent component when navigating
      if (onSearchComplete) {
        onSearchComplete(searchTerm);
      }

      // Add to search history in localStorage
      try {
        const history = localStorage.getItem('stockSearchHistory');
        const searchHistory = history ? JSON.parse(history) : [];
        const newHistory = [searchTerm, ...searchHistory.filter((h: string) => h !== searchTerm)].slice(0, 10);
        localStorage.setItem('stockSearchHistory', JSON.stringify(newHistory));
      } catch (error) {
        logger.error('Error updating search history:', error);
      }
    }
  };

  const handleResultClick = async (symbol: string, name: string) => {
    setIsResultsVisible(false);
    setQuery(name); // Set the query to the stock name for better UX
    
    // Navigate to stock details page
    router.push(`/stocks/${symbol}`);
    
    // Add to search history in localStorage
    try {
      const history = localStorage.getItem('stockSearchHistory');
      const searchHistory = history ? JSON.parse(history) : [];
      const newHistory = [symbol, ...searchHistory.filter((h: string) => h !== symbol)].slice(0, 10);
      localStorage.setItem('stockSearchHistory', JSON.stringify(newHistory));
    } catch (error) {
      logger.error('Error updating search history:', error);
    }
    
    // Notify parent when navigating away
    if (onSearchComplete) {
      onSearchComplete(symbol);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setHighlightedIndex(-1); // Reset highlighted index
    
    // Only show loading if typing actively and length >= 2
    if (value.length >= 2) {
      setIsLoading(true);
    } else {
      setResults([]);
      setIsResultsVisible(false);
    }
  };

  return (
    <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-6'} w-full`}>
      <div className="relative w-full" ref={searchRef} suppressHydrationWarning>
        <form onSubmit={handleSearch} className="relative" data-testid="search-form">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={compact ? "Search stocks (e.g., RELIANCE)" : "Search for stocks (e.g., RELIANCE, TATASTEEL)"}
            className={`w-full 
              min-h-[44px]
              ${compact && !isMobile ? 'py-1.5 text-sm' : isMobile ? 'py-1.5 sm:py-2 text-sm' : 'py-3'} 
              ${compact && !isMobile ? 'pl-9 pr-4' : isMobile ? 'pl-8 sm:pl-10 pr-4' : 'pl-10 pr-4'} 
              bg-gray-900 border 
              ${compact && !isMobile ? 'border-gray-700/30 rounded-full' : isMobile ? 'border-gray-700/30 rounded-lg' : 'border-gray-800/30 rounded-lg'} 
              focus:outline-none 
              ${compact ? 'focus:ring-1 focus:ring-gray-500' : 'focus:ring-2 focus:ring-blue-500'} 
              focus:border-transparent 
              ${compact ? 'text-gray-200 placeholder-gray-400' : 'text-white'}`}
            onFocus={() => query.length >= 2 && setIsResultsVisible(true)}
            aria-label="Search stocks"
            data-testid="search-input"
            role="combobox"
            aria-expanded={isResultsVisible}
            aria-autocomplete="list"
            aria-owns="search-results-list"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" suppressHydrationWarning>
            <Search className={`${isMobile ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : compact ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-gray-400`} aria-hidden="true" />
          </div>
          <button 
            type="submit" 
            className={`absolute inset-y-0 right-0 flex min-w-[44px] items-center justify-center 
              ${compact ? 'text-gray-300 hover:text-white font-mono' : 'text-cyan-400 hover:text-blue-300'}`}
            data-testid="search-button"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
            ) : (
              <span>Go</span>
            )}
          </button>
        </form>

        {isResultsVisible && (
          <div 
            className="absolute z-50 w-full mt-1 bg-gray-950 rounded-xl shadow-lg border border-gray-800/30 max-h-96 overflow-y-auto" 
            suppressHydrationWarning
            role="listbox"
            id="search-results-list"
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
                  <li 
                    key={`${stock.symbol}-${index}`} 
                    className={`border-b border-gray-100 dark:border-gray-700 last:border-0 ${index === highlightedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <button
                      onClick={() => handleResultClick(stock.symbol, stock.companyName)}
                      className="w-full text-left flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
                      role="option"
                      aria-selected={index === highlightedIndex}
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
                <p>No stocks found matching your search</p>
                <p className="mt-2 text-sm">Try searching for company names like "Reliance" or symbols like "INFY"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;