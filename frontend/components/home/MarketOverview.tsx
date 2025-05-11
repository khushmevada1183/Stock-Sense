'use client';

import { useState, useEffect } from 'react';
import { stockService } from '@/services/api';

interface IndexData {
  name: string;
  value: number | string;
  change: number;
  changePercent: number;
}

interface IndexDetails {
  value?: number | string;
  change?: string | number;
  percentChange?: string | number;
  [key: string]: any;
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
            setIndices(data.indices);
          } 
          // Handle object format with named indices
          else if (typeof data.indices === 'object') {
            const indexArray = Object.entries(data.indices).map(([name, details]) => {
              // Cast the details to our expected interface
              const indexDetails = details as IndexDetails;
              return {
                name: name,
                value: indexDetails.value || 0,
                change: parseFloat(String(indexDetails.change || '0')),
                changePercent: parseFloat(String(indexDetails.percentChange || '0'))
              };
            });
            setIndices(indexArray);
          } else {
            setError('Invalid market data format');
          }
        } else if (data && Array.isArray(data)) {
          // Direct array of indices
          setIndices(data);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {indices.map((index, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">{index.name}</h3>
          <div className="text-2xl font-bold mb-1">{index.value.toLocaleString()}</div>
          <div className={`flex items-center ${
            index.change >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            <span className="font-medium">
              {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)}
            </span>
            <span className="mx-1">|</span>
            <span>
              {index.change >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 