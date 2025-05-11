'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { stockService } from '@/services/api';

interface Stock {
  id: number;
  symbol: string;
  company_name: string;
  sector_name: string;
  current_price: number;
  price_change_percentage: number;
}

export default function StocksIndexPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await stockService.getFeaturedStocks();
        
        // Normalize the data structure with proper type checking
        let stocksArr: Stock[] = [];
        
        if (data && data.stocks && Array.isArray(data.stocks)) {
          // Use type-safe mapping to ensure all required fields are present
          stocksArr = data.stocks.map(stock => ({
            id: stock.id ?? Math.random(), // Fallback ID if missing
            symbol: stock.symbol ?? 'UNKNOWN',
            company_name: stock.company_name ?? 'Unknown Company',
            sector_name: stock.sector_name ?? 'Uncategorized',
            current_price: typeof stock.current_price === 'number' ? stock.current_price : 0,
            price_change_percentage: typeof stock.price_change_percentage === 'number' ? stock.price_change_percentage : 0
          }));
        } else if (Array.isArray(data)) {
          // Handle case where data is directly an array
          stocksArr = data.map(stock => ({
            id: stock.id ?? Math.random(),
            symbol: stock.symbol ?? 'UNKNOWN',
            company_name: stock.company_name ?? 'Unknown Company',
            sector_name: stock.sector_name ?? 'Uncategorized',
            current_price: typeof stock.current_price === 'number' ? stock.current_price : 0,
            price_change_percentage: typeof stock.price_change_percentage === 'number' ? stock.price_change_percentage : 0
          }));
        }
        
        setStocks(stocksArr);
      } catch (err: any) {
        console.error('Error loading stocks:', err);
        setError('Failed to load stocks data');
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Stocks</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 h-12"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="border-t border-gray-200 dark:border-gray-700 h-16 flex items-center p-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mr-8"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mr-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mr-8"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Stocks</h1>
        
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold">All Stocks</h1>
        
        <div className="mt-4 md:mt-0">
          <Link 
            href="/stocks/search"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search Stocks
          </Link>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Symbol
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Company Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sector
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(Array.isArray(stocks) ? stocks : []).map((stock) => (
              <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    href={`/stocks/${stock.symbol}`} 
                    className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {stock.symbol}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  {stock.company_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {stock.sector_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                  ₹{stock.current_price.toLocaleString()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                  stock.price_change_percentage >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stock.price_change_percentage >= 0 ? '+' : ''}
                  {stock.price_change_percentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-800 dark:text-blue-300">
        <p className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Note: All data shown is for demonstration purposes only. In a real application, this would display real-time market data.
        </p>
      </div>
    </div>
  );
} 