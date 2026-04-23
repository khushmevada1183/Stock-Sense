'use client';

import { useState, useEffect } from 'react';
import * as stockApi from '@/api/api';
import { IndexData } from '@/types/market';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { logger } from '@/lib/logger';

type MarketOverviewIndexItem = {
  index?: string;
  indexSymbol?: string;
  last?: number | string;
  variation?: number | string;
  percentChange?: number | string;
};

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

  const toFiniteNumber = (value: unknown, fallback: number) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const normalizeLabel = (value: string | undefined) => String(value || '').trim().toUpperCase();

  const findIndexRow = (rows: MarketOverviewIndexItem[], labels: string[]) => {
    const expected = labels.map((label) => normalizeLabel(label));
    return rows.find((row) => {
      const index = normalizeLabel(row.index);
      const symbol = normalizeLabel(row.indexSymbol);
      return expected.some((label) => label === index || label === symbol);
    });
  };

  const toIndexCard = (
    row: MarketOverviewIndexItem | undefined,
    fallback: IndexData
  ): IndexData => {
    if (!row) {
      return fallback;
    }

    return {
      ...fallback,
      value: toFiniteNumber(row.last, fallback.value),
      change: toFiniteNumber(row.variation, fallback.change),
      changePercent: toFiniteNumber(row.percentChange, fallback.changePercent),
    };
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await stockApi.getMarketOverview();
        setError(null);

        const overviewPayload =
          response && typeof response === 'object' && 'data' in response
            ? (response as { data?: unknown }).data
            : response;

        const indexRows =
          overviewPayload &&
          typeof overviewPayload === 'object' &&
          'indices' in overviewPayload &&
          Array.isArray((overviewPayload as { indices?: unknown }).indices)
          ? ((overviewPayload as { indices: MarketOverviewIndexItem[] }).indices)
          : [];

        if (indexRows.length === 0) {
          setIndices(fallbackIndices);
          return;
        }

        const nifty50Row = findIndexRow(indexRows, ['NIFTY 50']);
        const sensexRow = findIndexRow(indexRows, ['SENSEX', 'BSE SENSEX']);
        const niftyBankRow = findIndexRow(indexRows, ['NIFTY BANK']);
        const niftyItRow = findIndexRow(indexRows, ['NIFTY IT']);

        setIndices([
          toIndexCard(nifty50Row, fallbackIndices[0]),
          toIndexCard(sensexRow, fallbackIndices[1]),
          toIndexCard(niftyBankRow, fallbackIndices[2]),
          toIndexCard(niftyItRow, fallbackIndices[3]),
        ]);
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse rounded-[24px] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="mb-3 h-3.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="mb-3 h-7 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-1/3 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-200/70 bg-rose-50/80 p-4 text-rose-700 backdrop-blur-xl dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-300">
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
    <div className="grid w-full grid-cols-1 gap-3 overflow-x-visible sm:grid-cols-2 lg:grid-cols-4">
      {indices.map((index, i) => {
        const positive = isPositive(index.change);
        return (
          <div
            key={i} 
            className="h-full"
          >
            <div className="w-full min-h-[170px] rounded-[24px] border border-slate-200/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_28px_90px_rgba(0,0,0,0.35)]">
              {/* Header row */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{index.name}</h3>
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
              <div className="mb-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
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
                <span className="mx-1.5 text-slate-300 dark:text-slate-600">|</span>
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