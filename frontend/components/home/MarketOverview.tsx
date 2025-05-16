'use client';

import { useState, useEffect } from 'react';
import { stockService } from '@/services/api';
import { IndexData, MarketIndex, asIndexData } from '@/types/market';

// Custom function to safely convert any market index type to our IndexData format
function convertToIndexData(item: any): IndexData {
  return {
    name: item.name || '',
    symbol: item.symbol || item.name || '',
    value: item.value || 0,
    change: typeof item.change === 'string' ? parseFloat(item.change) : (item.change || 0),
    changePercent: typeof item.changePercent === 'string' ? parseFloat(item.changePercent) : 
      (typeof item.change_percent === 'string' ? parseFloat(item.change_percent) : 
       (typeof item.percent_change === 'string' ? parseFloat(item.percent_change) : 
        (item.changePercent || item.change_percent || item.percent_change || 0)))
  };
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await stockService.getMarketOverview();
        console.log('Market data:', data);
        
        if (data && data.indices) {
          // Handle array format
          if (Array.isArray(data.indices)) {
            // Use our custom converter function instead of asIndexData
            const indexData = data.indices.map(item => convertToIndexData(item));
            setIndices(indexData);
          } 
          // Handle object format with named indices
          else if (typeof data.indices === 'object') {
            const indexArray = Object.entries(data.indices).map(([name, details]) => {
              const indexDetails = details as any;
              return convertToIndexData({
                name: name,
                symbol: name,
                value: indexDetails.value || 0,
                change: indexDetails.change || 0,
                changePercent: indexDetails.percentChange || indexDetails.change_percent || 0
              });
            });
            setIndices(indexArray);
          } else {
            setError('Invalid market data format');
          }
        } else if (data && Array.isArray(data)) {
          // Direct array of indices
          const indexData = data.map(item => convertToIndexData(item));
          setIndices(indexData);
        } else {
          setError('No market data available');
        }
      } catch (err: any) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
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

  if (indices.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-gray-600 dark:text-gray-400 text-center">
        No market data available at this time.
      </div>
    );
  }

  // Helper function to safely format numbers
  const formatNumber = (value: string | number, decimals = 2) => {
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? value : num.toFixed(decimals);
    }
    return value.toFixed(decimals);
  };

  // Helper function to check if a value is positive
  const isPositive = (value: string | number) => {
    if (typeof value === 'string') {
      return parseFloat(value) >= 0;
    }
    return value >= 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {indices.map((index, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">{index.name}</h3>
          <div className="text-2xl font-bold mb-1">
            {typeof index.value === 'number' 
              ? index.value.toLocaleString() 
              : parseFloat(index.value.toString()).toLocaleString() || index.value}
          </div>
          <div className={`flex items-center ${
            isPositive(index.change)
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <span className="font-medium">
              {isPositive(index.change) ? '+' : ''}{formatNumber(index.change)}
            </span>
            <span className="mx-1">|</span>
            <span>
              {isPositive(index.change) ? '+' : ''}{formatNumber(index.changePercent)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 