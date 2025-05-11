"use client";

import React, { useState, useEffect } from 'react';
import TrendingStocks from '../../components/stocks/TrendingStocks';
import indianApiService from '../../services/indianApiService';

export default function MarketPage() {
  const [marketIndices, setMarketIndices] = useState<any[]>([]);
  const [commodities, setCommodities] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get commodities data
        const commoditiesData = await indianApiService.getCommoditiesData();
        setCommodities(Array.isArray(commoditiesData) ? commoditiesData : []);
        
        // For indices, we'll create a placeholder since we don't have a specific endpoint
        setMarketIndices([
          { name: 'NIFTY 50', value: 22345.67, change: 123.45, changePercent: 0.56 },
          { name: 'SENSEX', value: 73456.78, change: 234.56, changePercent: 0.32 },
          { name: 'NIFTY BANK', value: 48765.43, change: -156.78, changePercent: -0.32 },
          { name: 'NIFTY IT', value: 37654.32, change: 187.65, changePercent: 0.50 }
        ]);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Market Overview</h1>
      
      {/* Market Indices */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Market Indices</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 dark:text-red-400 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {marketIndices.map((index) => (
              <div key={index.name} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">{index.name}</h3>
                <p className="text-2xl font-bold">{indianApiService.formatCurrency(index.value)}</p>
                <p className={`${
                  index.changePercent >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {index.changePercent >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Trending Stocks */}
      <div className="mb-8">
        <TrendingStocks />
      </div>
      
      {/* Commodities */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Commodities</h2>
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="animate-pulse p-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500 dark:text-red-400 text-center">
            <p>{error}</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {commodities.length > 0 ? (
                    commodities.slice(0, 10).map((commodity, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {commodity.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                          {typeof commodity.price === 'number' 
                            ? indianApiService.formatCurrency(commodity.price)
                            : commodity.price}
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right ${
                          (commodity.change_percent || 0) >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {(commodity.change_percent || 0) >= 0 ? '+' : ''}
                          {(commodity.change_percent || 0).toFixed(2)}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        No commodities data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 