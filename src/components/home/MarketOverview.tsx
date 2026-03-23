'use client';

import { useState, useEffect } from 'react';
import * as stockApi from '@/api/api';
import { IndexData } from '@/types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await stockApi.getBSEMostActive();
        
        if (response && response.success && response.data) {
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

  // Loading skeleton with shimmer
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <div className="h-4 bg-gray-800/60 rounded-lg w-3/4 mb-3 shimmer" />
            <div className="h-7 bg-gray-800/60 rounded-lg w-1/2 mb-3 shimmer" />
            <div className="h-4 bg-gray-800/60 rounded-lg w-1/3 shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-4 border-red-500/20 text-red-400">
        {error}
      </div>
    );
  }

  if (indices.length === 0) {
    const fallbackIndices: IndexData[] = [
      { name: 'NIFTY 50', symbol: 'NIFTY', value: 22654.5, change: 127.45, changePercent: 0.57 },
      { name: 'BSE SENSEX', symbol: 'SENSEX', value: 74683.7, change: 260.30, changePercent: 0.35 },
      { name: 'NIFTY BANK', symbol: 'BANKNIFTY', value: 48521.6, change: -73.25, changePercent: -0.15 },
      { name: 'NIFTY IT', symbol: 'NIFTYIT', value: 34892.8, change: 412.95, changePercent: 1.20 }
    ];
    
    setIndices(fallbackIndices);
    return null;
  }

  const formatNumber = (value: number | string | undefined, decimals = 2) => {
    if (value === undefined) return '0.00';
    let numValue: number;
    if (typeof value === 'string') {
      numValue = parseFloat(value);
    } else {
      numValue = value;
    }
    if (isNaN(numValue)) return '0.00';
    return numValue.toFixed(decimals);
  };

  const isPositive = (value: number | string | undefined): boolean => {
    if (value === undefined) return false;
    if (typeof value === 'string') return parseFloat(value) >= 0;
    return value >= 0;
  };

  // Mini sparkline data for visual interest
  const sparklinePoints = [
    "0,8 3,6 6,7 9,4 12,5 15,3 18,6 21,2 24,4 27,3",
    "0,5 3,7 6,4 9,6 12,3 15,5 18,2 21,4 24,6 27,5",
    "0,3 3,5 6,7 9,4 12,6 15,8 18,5 21,7 24,6 27,7",
    "0,7 3,4 6,5 9,3 12,2 15,4 18,3 21,1 24,3 27,2",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full overflow-x-visible">
      {indices.map((index, i) => {
        const positive = isPositive(index.change);
        return (
          <div 
            key={i} 
            className="glass-card card-shine rounded-xl p-6 group"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider">{index.name}</h3>
              {/* Mini sparkline */}
              <svg width="30" height="10" className="text-gray-600 opacity-40 group-hover:opacity-70 transition-opacity">
                <polyline 
                  fill="none" 
                  stroke={positive ? '#39FF14' : '#EF4444'} 
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints[i] || sparklinePoints[0]} 
                />
              </svg>
            </div>
            
            {/* Value */}
            <div className="text-2xl font-bold mb-2 text-white">
              {typeof index.value === 'number' 
                ? index.value.toLocaleString('en-IN')
                : parseFloat(String(index.value)).toLocaleString('en-IN') || '0'}
            </div>
            
            {/* Change indicator */}
            <div className={`flex items-center text-sm font-medium ${
              positive ? 'text-green-400' : 'text-red-400'
            }`}>
              {positive ? (
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
              )}
              <span>
                {positive ? '+' : ''}{formatNumber(index.change)}
              </span>
              <span className="mx-1.5 text-gray-700">|</span>
              <span>
                {positive ? '+' : ''}{formatNumber(index.changePercent)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}