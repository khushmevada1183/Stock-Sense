"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import indianApiService from '../../services/indianApiService';
import { StockDetails } from '../../services/indianApiService';

const TrendingStocks: React.FC = () => {
  const [trendingStocks, setTrendingStocks] = useState<StockDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingStocks = async () => {
      try {
        setLoading(true);
        const data = await indianApiService.getTrendingStocks();
        // Take only the first 10 stocks if there are more
        setTrendingStocks(data.slice(0, 10));
        setError(null);
      } catch (err) {
        console.error('Error fetching trending stocks:', err);
        setError('Failed to load trending stocks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingStocks();
  }, []);

  const handleStockClick = (symbol: string) => {
    router.push(`/stocks/${symbol}`);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Trending Stocks</h2>
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Trending Stocks</h2>
        <div className="p-4 text-red-500 dark:text-red-400 text-center">
          <p>{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setLoading(true)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Trending Stocks</h2>
      
      {trendingStocks.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">No trending stocks available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Symbol</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {trendingStocks.map((stock) => (
                <tr 
                  key={stock.symbol} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleStockClick(stock.symbol)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    {stock.symbol}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {stock.name || stock.company_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                    {indianApiService.formatCurrency(stock.current_price || 0)}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                    (stock.percent_change || 0) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {(stock.percent_change || 0) >= 0 ? '+' : ''}
                    {(stock.percent_change || 0).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-4 text-right">
        <button 
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => router.push('/stocks')}
        >
          View All Stocks →
        </button>
      </div>
    </div>
  );
};

export default TrendingStocks; 