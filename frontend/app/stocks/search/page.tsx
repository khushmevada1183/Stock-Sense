'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { stockService } from '@/services/api';
import { Stock } from '@/types/stocks';

export default function StockSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [featuredStocks, setFeaturedStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load featured stocks on initial page load
  useEffect(() => {
    const loadFeaturedStocks = async () => {
      try {
        const data = await stockService.getFeaturedStocks();
        setFeaturedStocks(data.stocks);
      } catch (err: any) {
        console.error('Error loading featured stocks:', err);
        setError('Failed to load featured stocks');
      } finally {
        setInitialLoad(false);
      }
    };

    loadFeaturedStocks();
  }, []);

  // Handle search submission
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await stockService.searchStocks(searchQuery);
      // Set the results directly
      setSearchResults(data.results as unknown as Stock[]);
      
      if (data.results.length === 0) {
        setError('No stocks found matching your search criteria');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Stock card component
  const StockCard = ({ stock }: { stock: Stock }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">
            <Link href={`/stocks/${stock.symbol}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {stock.symbol}
            </Link>
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{stock.company_name}</p>
        </div>
        <span className={`text-sm font-semibold rounded-full px-2 py-1 ${
          Number(stock.price_change_percentage) >= 0 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {Number(stock.price_change_percentage) >= 0 ? '+' : ''}
          {typeof stock.price_change_percentage === 'number' 
            ? stock.price_change_percentage.toFixed(2) 
            : stock.price_change_percentage}%
        </span>
      </div>
      
      <div className="text-2xl font-bold mb-2">
        ₹{typeof stock.current_price === 'number' 
            ? stock.current_price.toLocaleString() 
            : stock.current_price || 'N/A'}
      </div>
      
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
        {stock.sector_name}
      </p>
      
      <Link 
        href={`/stocks/${stock.symbol}`}
        className="block text-center w-full py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white rounded-md transition-colors"
      >
        View Details
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Stocks</h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name or symbol..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 mb-6">
          {error}
        </div>
      )}
      
      {/* Search results */}
      {searchQuery && !loading && searchResults.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((stock) => (
              <StockCard key={stock.id} stock={stock} />
            ))}
          </div>
        </div>
      )}
      
      {/* Featured stocks */}
      {!searchQuery && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Featured Stocks</h2>
          {initialLoad ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredStocks.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* No search results but there was a query */}
      {searchQuery && !loading && searchResults.length === 0 && !error && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">No Results Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            We couldn't find any stocks matching "{searchQuery}". Please try a different search term.
          </p>
        </div>
      )}
    </div>
  );
} 