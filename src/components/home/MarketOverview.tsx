'use client';

import { useState, useEffect } from 'react';
import * as stockApi from '@/api/api';
import { IndexData } from '@/types/market';

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch market indices from API
        const response = await stockApi.getBSEMostActive();
        
        if (response && response.success && response.data) {
          // Map the API response to our IndexData interface
          const marketIndices: IndexData[] = [
            { 
              name: 'NIFTY 50',
              symbol: 'NIFTY',
              value: parseFloat(response.data.indices?.nifty?.value || '22654.5'), 
              change: parseFloat(response.data.indices?.nifty?.change || '127.45'), 
              changePercent: parseFloat(response.data.indices?.nifty?.percent_change || '0.57')
            },
            { 
              name: 'BSE SENSEX',
              symbol: 'SENSEX',
              value: parseFloat(response.data.indices?.sensex?.value || '74683.7'), 
              change: parseFloat(response.data.indices?.sensex?.change || '260.30'), 
              changePercent: parseFloat(response.data.indices?.sensex?.percent_change || '0.35')
            },
            { 
              name: 'NIFTY BANK',
              symbol: 'BANKNIFTY',
              value: parseFloat(response.data.indices?.bank_nifty?.value || '48521.6'), 
              change: parseFloat(response.data.indices?.bank_nifty?.change || '-73.25'), 
              changePercent: parseFloat(response.data.indices?.bank_nifty?.percent_change || '-0.15')
            },
            {
              name: 'NIFTY IT',
              symbol: 'NIFTYIT',
              value: parseFloat(response.data.indices?.it_nifty?.value || '34892.8'),
              change: parseFloat(response.data.indices?.it_nifty?.change || '412.95'),
              changePercent: parseFloat(response.data.indices?.it_nifty?.percent_change || '1.20')
            }
          ];
          
          setIndices(marketIndices);
        } else {
          // If API returns unexpected structure, fall back to hardcoded data
          console.log('API returned unexpected data structure for indices, using fallback');
        }
      } catch (error) {
        console.error('Failed to fetch market indices:', error);
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
            <div key={i} className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-6 border border-gray-700/50">
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
        <div key={i} className="bg-gray-900/90 backdrop-blur-lg dark:bg-gray-900/90 backdrop-blur-lg rounded-lg shadow p-6 min-w-[100%]">
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