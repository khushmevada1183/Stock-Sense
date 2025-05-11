"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Loader2 } from 'lucide-react';
import { useStock } from '../../context/StockContext';
import { useDebounce } from '../../lib/hooks/useDebounce';

interface SearchBarProps {
  onClose?: () => void;
}

const SearchBar = ({ onClose }: SearchBarProps) => {
  const router = useRouter();
  const { searchQuery, searchResults, isSearching, setSearchQuery } = useStock();
  const [query, setQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when mounted
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Update search query when debounced query changes
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleSelectResult = (symbol: string) => {
    router.push(`/stocks/${symbol}`);
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-center border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center pl-3 text-gray-500 dark:text-gray-400">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search stocks by name or symbol"
            className="w-full py-2 px-3 bg-transparent border-none focus:outline-none text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-gray-400"
            data-testid="search-input"
          />
          {isSearching ? (
            <div className="flex items-center pr-3">
              <Loader2 size={18} className="animate-spin text-gray-400" />
            </div>
          ) : query ? (
            <button
              onClick={handleClear}
              className="flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>
        
        {query && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {searchResults.map((result) => (
                <li key={result.symbol}>
                  <button
                    onClick={() => handleSelectResult(result.symbol)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {result.symbol}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.companyName}
                        </p>
                      </div>
                      {result.latestPrice && (
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            ₹{result.latestPrice.toLocaleString()}
                          </p>
                          {result.changePercent && (
                            <p className={`text-sm ${
                              result.changePercent >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {result.changePercent >= 0 ? '+' : ''}
                              {result.changePercent.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 