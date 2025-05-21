'use client';

import { useState, useEffect } from 'react';
import { stockService } from '@/services/api';
import { IndexData, MarketIndex, asIndexData } from '@/types/market';

// Custom function to safely convert any market index type to our IndexData format
function convertToIndexData(item: any): IndexData {
  console.log('Raw market data item:', item);
  
  // Parse value, removing any commas or currency symbols if it's a string
  let value = item.value || 0;
  if (typeof value === 'string') {
    value = parseFloat(value.replace(/[^\d.-]/g, ''));
  }
  
  // Parse change values
  let change = item.change || 0;
  if (typeof change === 'string') {
    change = parseFloat(change.replace(/[^\d.-]/g, ''));
  }
  
  // Parse percent change, removing % if present
  let percentChange = item.changePercent || item.change_percent || item.percent_change || 0;
  if (typeof percentChange === 'string') {
    percentChange = parseFloat(percentChange.replace(/[^\d.-]/g, ''));
  }
  
  const result = {
    name: item.name || '',
    symbol: item.symbol || item.name || '',
    value: value,
    change: change,
    changePercent: percentChange
  };
  
  console.log('Converted index data:', result);
  return result;
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch market data from the API
        const data = await stockService.getMarketOverview();
        console.log('Raw market data response:', data);
        
        if (data && data.indices) {
          // Handle array format
          if (Array.isArray(data.indices)) {
            console.log('Processing array format indices:', data.indices);
            const indexData = data.indices.map(item => convertToIndexData(item));
            setIndices(indexData);
          } 
          // Handle object format with named indices
          else if (typeof data.indices === 'object') {
            console.log('Processing object format indices:', data.indices);
            const indexArray = Object.entries(data.indices).map(([name, details]) => {
              const indexDetails = details as any;
              return convertToIndexData({
                name: name,
                symbol: name,
                value: indexDetails.value || 0,
                change: indexDetails.change || 0,
                changePercent: indexDetails.percentChange || indexDetails.change_percent || indexDetails.percent_change || 0
              });
            });
            setIndices(indexArray);
          } else {
            console.error('Invalid market data format:', data.indices);
            setError('Invalid market data format');
          }
        } else if (data && Array.isArray(data)) {
          // Direct array of indices
          console.log('Processing direct array format:', data);
          const indexData = data.map(item => convertToIndexData(item));
          setIndices(indexData);
        } else {
          console.error('No market data available:', data);
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

  // If we're still loading, show a loading skeleton
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

  // If there was an error, show an error message
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  // If no indices were found, show a message
  if (indices.length === 0) {
    // Fallback hardcoded indices for development/testing
    console.log('No indices found, using fallback data');
    const fallbackIndices: IndexData[] = [
      { 
        name: 'NIFTY 50',
        symbol: 'NIFTY',
        value: 22654.5, 
        change: 127.45, 
        changePercent: 0.57
      },
      { 
        name: 'BSE SENSEX',
        symbol: 'SENSEX',
        value: 74683.7, 
        change: 260.30, 
        changePercent: 0.35
      },
      { 
        name: 'NIFTY BANK',
        symbol: 'BANKNIFTY',
        value: 48521.6, 
        change: -73.25, 
        changePercent: -0.15
      },
      {
        name: 'NIFTY IT',
        symbol: 'NIFTYIT',
        value: 34892.8,
        change: 412.95,
        changePercent: 1.20
      }
    ];
    
    setIndices(fallbackIndices);
    return null; // This will re-render once we set the indices
  }

  console.log('Rendering indices:', indices);

  // Helper function to safely format numbers
  const formatNumber = (value: number | string | undefined, decimals = 2) => {
    if (value === undefined) {
      return '0.00';
    }
    
    let numValue: number;
    if (typeof value === 'string') {
      numValue = parseFloat(value);
    } else {
      numValue = value;
    }
    
    if (isNaN(numValue)) {
      return '0.00';
    }
    
    return numValue.toFixed(decimals);
  };

  // Helper function to check if a value is positive
  const isPositive = (value: number | string | undefined): boolean => {
    if (value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return parseFloat(value) >= 0;
    }
    return value >= 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full overflow-x-visible">
      {indices.map((index, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 min-w-[100%]">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-2">{index.name}</h3>
          <div className="text-2xl font-bold mb-1">
            {typeof index.value === 'number' 
              ? index.value.toLocaleString('en-IN')
              : parseFloat(String(index.value)).toLocaleString('en-IN') || '0'}
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
              {isPositive(index.changePercent) ? '+' : ''}{formatNumber(index.changePercent)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 