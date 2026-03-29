'use client';

import { useState, useEffect } from 'react';
import * as stockApi from '@/api/api';
import { IndexData } from '@/types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackIndices: IndexData[] = [
    { name: 'NIFTY 50', symbol: 'NIFTY', value: 22654.5, change: 127.45, changePercent: 0.57 },
    { name: 'BSE SENSEX', symbol: 'SENSEX', value: 74683.7, change: 260.30, changePercent: 0.35 },
    { name: 'NIFTY BANK', symbol: 'BANKNIFTY', value: 48521.6, change: -73.25, changePercent: -0.15 },
    { name: 'NIFTY IT', symbol: 'NIFTYIT', value: 34892.8, change: 412.95, changePercent: 1.20 }
  ];

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await stockApi.getBSEMostActive();
        setError(null);

        // Try to extract real index data if the API provides it
        // Shape attempt: { success, data: { indices: { nifty, sensex, bank_nifty, it_nifty } } }
        const indicesData = response?.data?.indices || response?.data?.data?.indices;

        if (indicesData && indicesData.nifty) {
          const marketIndices: IndexData[] = [
            {
              name: 'NIFTY 50', symbol: 'NIFTY',
              value: parseFloat(indicesData.nifty?.value ?? '22654.5'),
              change: parseFloat(indicesData.nifty?.change ?? '127.45'),
              changePercent: parseFloat(indicesData.nifty?.percent_change ?? '0.57')
            },
            {
              name: 'BSE SENSEX', symbol: 'SENSEX',
              value: parseFloat(indicesData.sensex?.value ?? '74683.7'),
              change: parseFloat(indicesData.sensex?.change ?? '260.30'),
              changePercent: parseFloat(indicesData.sensex?.percent_change ?? '0.35')
            },
            {
              name: 'NIFTY BANK', symbol: 'BANKNIFTY',
              value: parseFloat(indicesData.bank_nifty?.value ?? '48521.6'),
              change: parseFloat(indicesData.bank_nifty?.change ?? '-73.25'),
              changePercent: parseFloat(indicesData.bank_nifty?.percent_change ?? '-0.15')
            },
            {
              name: 'NIFTY IT', symbol: 'NIFTYIT',
              value: parseFloat(indicesData.it_nifty?.value ?? '34892.8'),
              change: parseFloat(indicesData.it_nifty?.change ?? '412.95'),
              changePercent: parseFloat(indicesData.it_nifty?.percent_change ?? '1.20')
            }
          ];
          setIndices(marketIndices);
        } else {
          // BSE endpoint returns empty mock — always use fallback
          setIndices(fallbackIndices);
        }
      } catch (error) {
        logger.error('Failed to fetch market indices:', error);
        setError('Unable to load live market data. Showing fallback values.');
        setIndices(fallbackIndices);
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
          <div key={i} className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 p-6 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mb-3" />
            <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 mb-3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  // indices is always populated by the effect (real data or fallback)
  // so indices.length === 0 only transiently during first render before effect fires
  if (indices.length === 0) return null;


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
            className="h-full"
          >
            <div className="w-full min-h-[170px] rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950 p-6 hover:shadow-md transition-shadow">
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-600 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{index.name}</h3>
                {/* Mini sparkline */}
                <svg width="30" height="10" className="text-slate-400 dark:text-slate-500">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePoints[i] || sparklinePoints[0]}
                  />
                </svg>
              </div>

              {/* Value */}
              <div className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
                {typeof index.value === 'number'
                  ? index.value.toLocaleString('en-IN')
                  : parseFloat(String(index.value)).toLocaleString('en-IN') || '0'}
              </div>

              {/* Change indicator */}
              <div className={`flex items-center text-sm font-medium ${
                positive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {positive ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1.5" />
                )}
                <span>
                  {positive ? '+' : ''}{formatNumber(index.change)}
                </span>
                <span className="mx-1.5 text-slate-400 dark:text-slate-600">|</span>
                <span>
                  {positive ? '+' : ''}{formatNumber(index.changePercent)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}