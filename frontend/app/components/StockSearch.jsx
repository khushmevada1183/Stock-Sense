'use client';

import React, { useState, useEffect } from 'react';
import stockApiService from '../../services/stockApiService'; // Corrected import path

/**
 * Stock search component that uses the updated API endpoint
 */
const StockSearch = () => {
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
      
      setResults(Array.isArray(data) ? data : [data]);
      
      // Check if we're using mock data
      if (data.length > 0 && data[0]._isMockData) {
        setUsingMockData(true);
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
            <div key={index} className="border rounded-md p-4 hover:bg-gray-50">
              <div className="flex justify-between">
                <h3 className="font-semibold text-lg">
                  {stock.symbol || stock.ticker || 'N/A'}
                </h3>
                <span className="text-green-600 font-medium">
                  ₹{stock.price || stock.lastPrice || stock.last_price || 'N/A'}
                </span>
              </div>
              <p className="text-gray-700">{stock.name || stock.companyName || stock.company_name || 'N/A'}</p>
              {stock.change !== undefined && (
                <p className={`text-sm mt-1 ${parseFloat(stock.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(stock.change) >= 0 ? '+' : ''}{stock.change}% today
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
