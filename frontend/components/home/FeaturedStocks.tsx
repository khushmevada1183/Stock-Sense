'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { stockService } from '@/services/api';
import { Stock } from '@/types/stocks';

// Helper function to normalize stock data across different formats
const normalizeStock = (stock: any): Stock => {
  return {
    id: stock.id || stock.symbol || '',
    symbol: stock.symbol || '',
    company_name: stock.company_name || stock.companyName || '',
    sector_name: stock.sector_name || stock.sector || '',
    price_change_percentage: stock.price_change_percentage || 
                             stock.changePercent || 
                             stock.change_percent || 
                             stock.change || 0,
    current_price: stock.current_price || stock.latestPrice || stock.price || 0
  };
};

export default function FeaturedStocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedStocks = async () => {
      try {
        const data = await stockService.getFeaturedStocks();
        console.log('Featured stocks data:', data);
        
        if (data && Array.isArray(data)) {
          // Direct array of stocks
          setStocks(data.map(normalizeStock));
        } else if (data && data.stocks && Array.isArray(data.stocks)) {
          // Stocks wrapped in a 'stocks' property
          setStocks(data.stocks.map(normalizeStock));
        } else if (data && typeof data === 'object') {
          // No clear array structure, try to extract stocks from the object
          const extractedStocks: any[] = [];
          
          // Handle nested arrays like top_gainers, top_losers, etc.
          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              extractedStocks.push(...value);
            }
          });
          
          if (extractedStocks.length > 0) {
            setStocks(extractedStocks.map(normalizeStock));
          } else {
            setError('No stocks data found');
          }
        } else {
          setError('Invalid stocks data format');
        }
      } catch (err: any) {
        setError('Failed to load featured stocks');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedStocks();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4 mb-6"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-600 dark:text-yellow-400 text-center">
        No featured stocks available at this time.
      </div>
    );
  }

  // Helper function to format a number with 2 decimal places
  const formatNumber = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toFixed(2);
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
    return '0.00';
  };

  // Helper function to check if a value is positive
  const isPositive = (value: string | number): boolean => {
    if (typeof value === 'number') {
      return value >= 0;
    }
    if (typeof value === 'string') {
      return parseFloat(value) >= 0;
    }
    return true;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stocks.map((stock, index) => (
        <div key={stock.id || stock.symbol || index} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  <Link href={`/stocks/${stock.symbol}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {stock.symbol}
                  </Link>
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stock.company_name || 'N/A'}
                </p>
              </div>
              <span className={`text-sm font-semibold rounded-full px-2 py-1 ${
                isPositive(stock.price_change_percentage)
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {isPositive(stock.price_change_percentage) ? '+' : ''}
                {formatNumber(stock.price_change_percentage)}%
              </span>
            </div>
            
            <div className="text-2xl font-bold mb-2">
              ₹{typeof stock.current_price === 'number' 
                 ? stock.current_price.toLocaleString() 
                 : parseFloat(String(stock.current_price || 0)).toLocaleString()}
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {stock.sector_name || 'Various Sectors'}
            </p>
            
            <Link 
              href={`/stocks/${stock.symbol}`}
              className="block text-center w-full py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white rounded-md transition-colors"
            >
              View Analysis
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
} 