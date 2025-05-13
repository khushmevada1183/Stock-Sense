'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import stockApiService from '../../services/stockApiService'; // Corrected import path

/**
 * Stock search component that uses the updated API endpoint
 */
const StockSearch = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    if (!query) {
      setResults([]);
      setUsingMockData(false);
      return;
    }

    const timer = setTimeout(() => {
      searchStocks();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  /**
   * Search for stocks using the updated API endpoint
   */
  const searchStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingMockData(false);
      
      // Using the updated API service that integrates with PostgreSQL
      const data = await stockApiService.searchStocks(query);
      
      // Handle different response formats
      let searchResults = [];
      
      if (data && data.results && Array.isArray(data.results)) {
        // Standard API response format
        searchResults = data.results;
      } else if (Array.isArray(data)) {
        // Direct array format
        searchResults = data;
      } else if (data && typeof data === 'object') {
        // Single stock format
        searchResults = [data];
      }
      
      console.log('Search results:', searchResults);
      setResults(searchResults);
      
      // Check if we're using mock data
      if (searchResults.length > 0 && searchResults[0]._isMockData) {
        setUsingMockData(true);
      }
      
      // If no results found, show a message
      if (searchResults.length === 0) {
        setError(`No results found for "${query}"`);
      }
    } catch (err) {
      console.error('Error searching stocks:', err);
      setError(err.message || 'Failed to search stocks');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  /**
   * Handle stock selection
   */
  const handleStockClick = (stock) => {
    // Navigate to the stock details page
    const symbol = stock.symbol || stock.ticker || query;
    console.log(`Navigating to stock details for: ${symbol}`);
    router.push(`/stocks/${symbol}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <label htmlFor="search" className="block text-sm font-medium mb-2">
          Search Indian Stocks
        </label>
        <div className="relative">
          <input
            type="text"
            id="search"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter stock symbol or company name"
            value={query}
            onChange={handleInputChange}
          />
          {loading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      {usingMockData && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md text-sm">
          ⚠️ Showing mock data. Connect to the API or PostgreSQL for real-time data.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((stock, index) => (
            <div 
              key={index} 
              className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => handleStockClick(stock)}
            >
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">
                  {stock.symbol || stock.ticker || 'N/A'}
                </h3>
                <span className="text-green-600 font-medium">
                  ₹{stock.latestPrice || 
                     stock.price || 
                     stock.last_price || 
                     (stock.fullData && stock.fullData.currentPrice && 
                      (stock.fullData.currentPrice.BSE || stock.fullData.currentPrice.NSE)) || 
                     'N/A'}
                </span>
              </div>
              <p className="text-gray-700">
                {stock.companyName || stock.name || stock.company_name || 'N/A'}
              </p>
              {(stock.change !== undefined || stock.changePercent !== undefined || stock.percent_change !== undefined) && (
                <p className={`text-sm mt-1 ${
                  parseFloat(stock.change || stock.changePercent || stock.percent_change) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
                }`}>
                  {parseFloat(stock.change || stock.changePercent || stock.percent_change) >= 0 ? '+' : ''}
                  {(stock.changePercent || stock.percent_change || stock.change || 0).toString()}% today
                </p>
              )}
              {stock.sector && (
                <p className="text-xs text-gray-500 mt-1">
                  {stock.sector}
                </p>
              )}
            </div>
          ))
        ) : query && !loading ? (
          <p className="text-center text-gray-500">No stocks found</p>
        ) : null}
      </div>
    </div>
  );
};

export default StockSearch;
