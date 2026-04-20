"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import * as stockApi from '@/api/api';
import { logger } from '@/lib/logger';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAnimation } from '@/animations/shared/AnimationContext';
import marketAnimations from '@/animations/pages/marketAnimations';
import CursiveLoader from '@/components/ui/CursiveLoader';

// Market data interfaces
interface MarketIndex {
  name: string;
  current: number;
  change: number;
  percentage: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume?: number;
  // API response fields from various endpoints
  ric?: string;
  ticker?: string;
  displayName?: string;
  company_name?: string;
  companyName?: string;
  company?: string;
  current_price?: number;
  lastPrice?: number;
  price_change?: number;
  percent_change?: number;
  price_change_percentage?: number;
  net_change?: number;
  pChange?: number;
  change_percent?: number;
  last_price?: number;
  totalTurnover?: number;
  finalQuantity?: number;
  sector_name?: string;
  sector?: string;
  netChange?: number;
  traded_volume?: number;
}

interface SectorData {
  name: string;
  change: number;
}

interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
}

interface HeatMapStock {
  name: string;
  symbol: string;
  change: number;
  marketCap: number;
}

interface HeatMapSector {
  sector: string;
  stocks: HeatMapStock[];
}

interface MarketData {
  indices: MarketIndex[];
  topGainers: Stock[];
  topLosers: Stock[];
  mostActive: Stock[];
  breadth: MarketBreadth;
  sectors: SectorData[];
  heatMapData: HeatMapSector[];
}

interface MarketEndpointStats {
  sectorHeatmapCount: number;
  high52Count: number;
  low52Count: number;
  indexHistoryPoints: number;
  snapshotHistoryCount: number;
  snapshotStatus: string;
  snapshotCapturedAt: string;
}

// Market Indices Component
interface MarketIndicesProps {
  data: MarketIndex[];
}

const MarketIndices = ({ data }: MarketIndicesProps) => {
  // Handle case where data might be undefined or not in expected format
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden border border-gray-700/50">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-4 py-5 border-r border-gray-700/50">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-600/50 rounded mb-2"></div>
                <div className="h-6 bg-gray-600/50 rounded mb-1"></div>
                <div className="h-4 bg-gray-600/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden border border-gray-700/50">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
        {data.map((index, idx) => {
          // Ensure all required properties exist with fallbacks
          const indexData = {
            name: index.name || `Index ${idx + 1}`,
            current: parseFloat(index.current?.toString() || '0'),
            change: parseFloat(index.change?.toString() || '0'),
            percentage: parseFloat(index.percentage?.toString() || '0')
          };
          
          return (
            <div key={idx} className={`px-4 py-5 ${idx !== data.length - 1 ? 'border-r border-gray-700/50' : ''}`}>
              <div className="text-sm text-gray-300 mb-1">{indexData.name}</div>
              <div className="font-semibold text-xl mb-1 text-white">{indexData.current.toLocaleString()}</div>
              <div className={`flex items-center text-sm ${indexData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {indexData.change >= 0 ? (
                  <span className="text-green-400 mr-1">↗</span>
                ) : (
                  <span className="text-red-400 mr-1">↘</span>
                )}
                <span>{Math.abs(indexData.change).toFixed(2)} ({Math.abs(indexData.percentage).toFixed(2)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Sector Performance Component
interface SectorPerformanceProps {
  data: SectorData[];
}

interface SectorTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}

const SectorTooltip = ({ active, payload, label }: SectorTooltipProps) => {
  const value = payload?.[0]?.value;

  if (active && value !== undefined) {
    return (
      <div className="bg-black/90 backdrop-blur-lg p-3 border border-gray-600/50 rounded-lg shadow-lg">
        <p className="font-medium text-white">{label}</p>
        <p className={`text-sm ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {value >= 0 ? '+' : ''}{value.toFixed(2)}%
        </p>
      </div>
    );
  }

  return null;
};

const SectorPerformance = ({ data }: SectorPerformanceProps) => {
  // Handle empty data case
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 h-full border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 text-white">Sector Performance</h3>
        <div className="h-72 flex items-center justify-center">
          <CursiveLoader />
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.change - a.change);

  return (
    <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 h-full border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-4 text-white">Sector Performance</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              tickFormatter={(value) => `${value}%`} 
              stroke="#9ca3af"
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              width={70} 
              stroke="#9ca3af"
            />
            <Tooltip content={<SectorTooltip />} />
            <Bar 
              dataKey="change" 
              fill="#22c55e"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Market Breadth Component
interface MarketBreadthProps {
  data: MarketBreadth;
}

const MarketBreadth = ({ data }: MarketBreadthProps) => {
  const total = data.advances + data.declines + data.unchanged;
  
  const breadthData = [
    { name: 'Advances', value: data.advances, color: '#22c55e' },
    { name: 'Declines', value: data.declines, color: '#ef4444' },
    { name: 'Unchanged', value: data.unchanged, color: '#9ca3af' }
  ];

  return (
    <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 h-full border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-4 text-white">Market Breadth</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-green-400 text-lg font-semibold">{data.advances}</div>
          <div className="text-sm text-gray-300">Advances</div>
          <div className="text-xs text-gray-400">{total > 0 ? `${((data.advances / total) * 100).toFixed(1)}%` : '0%'}</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold">{data.declines}</div>
          <div className="text-sm text-gray-300">Declines</div>
          <div className="text-xs text-gray-400">{total > 0 ? `${((data.declines / total) * 100).toFixed(1)}%` : '0%'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-lg font-semibold">{data.unchanged}</div>
          <div className="text-sm text-gray-300">Unchanged</div>
          <div className="text-xs text-gray-400">{total > 0 ? `${((data.unchanged / total) * 100).toFixed(1)}%` : '0%'}</div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breadthData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {breadthData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value) => <span className="text-xs text-gray-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Top Movers Component
interface TopMoversProps {
  gainers: Stock[];
  losers: Stock[];
}

const TopMovers = ({ gainers, losers }: TopMoversProps) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');

  const safeGainers = Array.isArray(gainers) ? gainers : [];
  const safeLosers = Array.isArray(losers) ? losers : [];

  return (
    <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 h-full border border-gray-700/50">
      <div className="flex border-b border-gray-600/50 mb-4">
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === 'gainers'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-300'
          }`}
          onClick={() => setActiveTab('gainers')}
        >
          Top Gainers ({safeGainers.length})
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === 'losers'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-gray-300'
          }`}
          onClick={() => setActiveTab('losers')}
        >
          Top Losers ({safeLosers.length})
        </button>
      </div>

      <div className="overflow-hidden">
        {(activeTab === 'gainers' ? safeGainers : safeLosers).length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            <p>No {activeTab} data available</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-600/50">
                <th className="pb-2 text-left">Stock</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">Change</th>
                <th className="pb-2 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'gainers' ? safeGainers : safeLosers).slice(0, 5).map((stock, index) => {
                // Ensure all required properties exist with fallbacks  
                const stockData = {
                  symbol: stock.symbol || stock.ric?.split('.')[0] || 'N/A',
                  name: stock.name || stock.displayName || stock.company_name || 'Unknown Company',
                  price: parseFloat(stock.price?.toString() || stock.current_price?.toString() || '0'),
                  change: parseFloat(stock.change?.toString() || stock.price_change?.toString() || '0'),
                  percentChange: parseFloat(stock.percentChange?.toString() || stock.percent_change?.toString() || stock.price_change_percentage?.toString() || '0'),
                  volume: stock.volume || stock.traded_volume || 0
                };

                return (
                  <tr key={index} className="border-b border-gray-700/30 last:border-b-0">
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-white">{stockData.symbol}</div>
                        <div className="text-sm text-gray-300 truncate">{stockData.name}</div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="font-medium text-white">₹{stockData.price.toLocaleString()}</div>
                    </td>
                    <td className="py-3 text-right">
                      <div className={`flex items-center justify-end ${activeTab === 'gainers' ? 'text-green-400' : 'text-red-400'}`}>
                        {activeTab === 'gainers' ? (
                          <span className="mr-1">↗</span>
                        ) : (
                          <span className="mr-1">↘</span>
                        )}
                        <div>
                          <div className="font-medium">{Math.abs(stockData.percentChange).toFixed(2)}%</div>
                          <div className="text-xs">₹{Math.abs(stockData.change).toFixed(2)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="text-sm text-gray-300">
                        {stockData.volume ? stockData.volume.toLocaleString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Most Active Component
interface MostActiveProps {
  data: Stock[];
}

const MostActive = ({ data }: MostActiveProps) => {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 h-full border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-4 text-white">Most Active ({safeData.length})</h3>
      
      <div className="overflow-hidden">
        {safeData.length === 0 ? (
          <div className="text-center py-8 text-gray-300">
            <p>No active trading data available</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-600/50">
                <th className="pb-2 text-left">Stock</th>
                <th className="pb-2 text-right">Price</th>
                <th className="pb-2 text-right">Change</th>
                <th className="pb-2 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {safeData.slice(0, 5).map((stock, index) => {
                // Ensure all required properties exist with fallbacks
                const stockData = {
                  symbol: stock.symbol || stock.ticker?.split('.')[0] || stock.ric?.split('.')[0] || 'N/A',
                  name: stock.name || stock.company || stock.company_name || 'Unknown Company',
                  price: parseFloat(stock.price?.toString() || stock.current_price?.toString() || '0'),
                  change: parseFloat(stock.change?.toString() || stock.net_change?.toString() || stock.price_change?.toString() || '0'),
                  percentChange: parseFloat(stock.percentChange?.toString() || stock.percent_change?.toString() || stock.price_change_percentage?.toString() || '0'),
                  volume: parseInt(stock.volume?.toString() || stock.traded_volume?.toString() || '0')
                };

                return (
                  <tr key={index} className="border-b border-gray-700/30 last:border-b-0">
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-white">{stockData.symbol}</div>
                        <div className="text-sm text-gray-300 truncate">{stockData.name}</div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="font-medium text-white">₹{stockData.price.toLocaleString()}</div>
                    </td>
                    <td className="py-3 text-right">
                      <div className={`flex items-center justify-end ${stockData.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stockData.change >= 0 ? (
                          <span className="mr-1">↗</span>
                        ) : (
                          <span className="mr-1">↘</span>
                        )}
                        <span>{Math.abs(stockData.percentChange).toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="text-sm text-gray-300">
                        {stockData.volume ? (stockData.volume >= 10000000 ? 
                          (stockData.volume / 10000000).toFixed(2) + ' Cr' :
                          stockData.volume >= 100000 ? 
                          (stockData.volume / 100000).toFixed(2) + ' L' :
                          stockData.volume >= 1000 ? 
                          (stockData.volume / 1000).toFixed(2) + ' K' :
                          stockData.volume.toString()
                        ) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Heat Map Component
interface HeatMapProps {
  data: HeatMapSector[];
}

const HeatMap = ({ data }: HeatMapProps) => {
  // Handle empty data case
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 text-white">Market Heat Map</h3>
        <div className="py-8 flex items-center justify-center">
          <CursiveLoader />
        </div>
      </div>
    );
  }

  const getColorIntensity = (change: number): string => {
    if (change > 0) {
      if (change > 5) return 'bg-green-600/80 border-green-500';
      if (change > 3) return 'bg-green-500/80 border-green-400';
      if (change > 1) return 'bg-green-400/80 border-green-300';
      return 'bg-green-300/80 border-green-200';
    } else {
      if (change < -5) return 'bg-red-600/80 border-red-500';
      if (change < -3) return 'bg-red-500/80 border-red-400';
      if (change < -1) return 'bg-red-400/80 border-red-300';
      return 'bg-red-300/80 border-red-200';
    }
  };

  // Calculate block size based on market cap
  const getBlockSize = (marketCap: number): string => {
    if (marketCap > 100000) return 'h-24 w-24';
    if (marketCap > 50000) return 'h-20 w-20';
    if (marketCap > 20000) return 'h-16 w-16';
    return 'h-12 w-12';
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 border border-gray-700/50">
      <h3 className="text-lg font-semibold mb-4 text-white">Market Heat Map</h3>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 mr-1 rounded"></div>
          <span className="text-xs text-gray-300">&gt;5%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-400 mr-1 rounded"></div>
          <span className="text-xs text-gray-300">1-5%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-400 mr-1 rounded"></div>
          <span className="text-xs text-gray-300">-1 to -5%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600 mr-1 rounded"></div>
          <span className="text-xs text-gray-300">&lt;-5%</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {data.map((sector, idx) => (
            <div key={idx} className="mb-6">
              <h4 className="font-medium text-gray-200 mb-2">{sector.sector}</h4>
              <div className="flex flex-wrap gap-2">
                {sector.stocks && sector.stocks.map((stock, stockIdx) => {
                  const change = parseFloat(stock.change?.toString() || '0');
                  const marketCap = parseInt(stock.marketCap?.toString() || '1000000');
                  
                  return (
                    <div
                      key={stockIdx}
                      className={`${getBlockSize(marketCap)} ${getColorIntensity(change)} rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-lg p-2 flex flex-col justify-center items-center text-center`}
                      title={`${stock.name} (${stock.symbol}): ${change > 0 ? '+' : ''}${change.toFixed(2)}%`}
                    >
                      <div className="font-bold text-xs text-white truncate w-full">
                        {stock.symbol}
                      </div>
                      <div className="text-xs text-white/90 truncate w-full">
                        {stock.name.length > 8 ? stock.name.substring(0, 8) + '...' : stock.name}  
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Market Page Component
export default function MarketPage() {
  const SOCKET_REFRESH_COOLDOWN_MS = 5000;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData>({
    indices: [],
    topGainers: [],
    topLosers: [],
    mostActive: [],
    breadth: { advances: 0, declines: 0, unchanged: 0 },
    sectors: [],
    heatMapData: []
  });
  const [endpointStats, setEndpointStats] = useState<MarketEndpointStats>({
    sectorHeatmapCount: 0,
    high52Count: 0,
    low52Count: 0,
    indexHistoryPoints: 0,
    snapshotHistoryCount: 0,
    snapshotStatus: 'unknown',
    snapshotCapturedAt: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const lastSocketRefreshRef = useRef(0);
  const { isAnimationEnabled } = useAnimation();

  // Animation effects
  useEffect(() => {
    if (!isAnimationEnabled || loading) return;

    const timeline = marketAnimations.initMarketPageAnimations({ container: containerRef });
    return () => {
      if (timeline) {
        timeline.kill();
      }
    };
  }, [loading, isAnimationEnabled]);
  
  const currentDate = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });

  const fetchMarketData = useCallback(async (showLoader = false) => {
    const extractRows = (value: unknown): unknown[] => {
      if (Array.isArray(value)) {
        return value;
      }

      if (value && typeof value === 'object') {
        const data = value as Record<string, unknown>;
        for (const key of ['items', 'rows', 'results', 'data', 'records', 'history', 'series', 'snapshots', 'highs', 'lows']) {
          if (Array.isArray(data[key])) {
            return data[key] as unknown[];
          }
        }
      }

      return [];
    };

    const toNumeric = (value: unknown, fallback = 0): number => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const toSymbol = (value: unknown): string => {
      const text = String(value || '').trim();
      return text ? text.split('.')[0].toUpperCase() : 'N/A';
    };

    const normalizeMostActivePayload = (value: unknown): Stock[] => {
      if (Array.isArray(value)) {
        return value as Stock[];
      }

      if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;

        if (Array.isArray(record.stocks)) {
          return record.stocks as Stock[];
        }

        if (record.data && typeof record.data === 'object') {
          const nested = record.data as Record<string, unknown>;
          if (Array.isArray(nested.stocks)) {
            return nested.stocks as Stock[];
          }
          if (Array.isArray(record.data)) {
            return record.data as Stock[];
          }
        }
      }

      return [];
    };

    const getFulfilledValue = (result: PromiseSettledResult<unknown>): unknown | null => {
      if (result.status !== 'fulfilled') {
        return null;
      }

      return (result as PromiseFulfilledResult<unknown>).value;
    };

    const unwrapApiData = (value: unknown): unknown => {
      if (value && typeof value === 'object' && 'data' in value) {
        return (value as { data?: unknown }).data ?? value;
      }

      return value;
    };

    const getFulfilledData = (result: PromiseSettledResult<unknown>): unknown | null => {
      const value = getFulfilledValue(result);
      return value === null ? null : unwrapApiData(value);
    };

    try {
      if (showLoader) {
        setLoading(true);
      }
      setError(null);
      
      // Fetch data from multiple Indian Stock API endpoints according to the mapping
      const [
        marketOverviewData,
        trendingData,           // For Market Heat Map (trending stocks)
        bseMostActiveData,     // For Most Active & Heat Map
        nseMostActiveData,     // For Most Active & Heat Map
        priceShockersData,     // For Top Gainers/Losers & Market Breadth
        sectorHeatmapApiData,
        week52HighApiData,
        week52LowApiData,
        snapshotLatestApiData,
        snapshotHistoryApiData,
        snapshotStatusApiData,
      ] = await Promise.allSettled([
        stockApi.getMarketOverview(),
        stockApi.getTrendingStocks(),
        stockApi.getBSEMostActive(),
        stockApi.getNSEMostActive(),
        stockApi.getPriceShockers(),
        stockApi.getMarketSectorHeatmap(),
        stockApi.get52WeekHigh(),
        stockApi.get52WeekLow(),
        stockApi.getMarketSnapshotLatest(),
        stockApi.getMarketSnapshotHistory({ limit: 30 }),
        stockApi.getMarketSnapshotStatus(),
      ]);

      const overviewPayloadValue = getFulfilledData(marketOverviewData);
      const overviewPayload = overviewPayloadValue && typeof overviewPayloadValue === 'object'
        ? (overviewPayloadValue as Record<string, unknown>)
        : null;
      const overviewIndices = Array.isArray(overviewPayload?.indices)
        ? (overviewPayload.indices as Array<Record<string, unknown>>)
        : [];
      const overviewBreadth = overviewPayload?.breadth && typeof overviewPayload.breadth === 'object'
        ? (overviewPayload.breadth as Record<string, unknown>)
        : null;
      const overviewGainersLosers = overviewPayload?.gainersLosers && typeof overviewPayload.gainersLosers === 'object'
        ? (overviewPayload.gainersLosers as Record<string, unknown>)
        : null;

      // ---- Price Shockers ------------------------------------------------
      // Actual shape: { success, data: { gainers: [...], losers: [...] } }
      // Each item: { symbol, change_percent, last_price }
      let priceGainers: Stock[] = [];
      let priceLosers: Stock[] = [];
      const priceShockersEnvelope = getFulfilledValue(priceShockersData);
      const priceShockersRecord = priceShockersEnvelope && typeof priceShockersEnvelope === 'object'
        ? (priceShockersEnvelope as { success?: boolean; data?: unknown })
        : null;
      const priceShockersPayload = priceShockersRecord?.data && typeof priceShockersRecord.data === 'object'
        ? (priceShockersRecord.data as Record<string, unknown>)
        : null;
      if (priceShockersRecord?.success && priceShockersPayload) {
        // Try new format first: { gainers, losers }
        priceGainers = Array.isArray(priceShockersPayload.gainers)
          ? (priceShockersPayload.gainers as Stock[])
          : Array.isArray(priceShockersPayload.BSE_PriceShocker)
            ? (priceShockersPayload.BSE_PriceShocker as Stock[])
            : [];
        priceLosers = Array.isArray(priceShockersPayload.losers)
          ? (priceShockersPayload.losers as Stock[])
          : Array.isArray(priceShockersPayload.NSE_PriceShocker)
            ? (priceShockersPayload.NSE_PriceShocker as Stock[])
            : [];
      }

      if (!priceGainers.length) {
        priceGainers = Array.isArray(overviewGainersLosers?.gainers)
          ? (overviewGainersLosers.gainers as Stock[])
          : Array.isArray(overviewGainersLosers?.topGainers)
            ? (overviewGainersLosers.topGainers as Stock[])
            : [];
      }

      if (!priceLosers.length) {
        priceLosers = Array.isArray(overviewGainersLosers?.losers)
          ? (overviewGainersLosers.losers as Stock[])
          : Array.isArray(overviewGainersLosers?.topLosers)
            ? (overviewGainersLosers.topLosers as Stock[])
            : [];
      }
      const priceShockers = [...priceGainers, ...priceLosers];

      // Calculate Market Breadth from price shockers
      // Field name: change_percent (not percentChange)
      const breadthCalculation = priceShockers.reduce(
        (acc: { advances: number; declines: number; unchanged: number }, stock: Stock) => {
          const pct = toNumeric(
            stock.change_percent ?? stock.pChange ?? stock.percentChange ?? stock.percent_change ?? stock.price_change_percentage
          );
          if (pct > 0) acc.advances++;
          else if (pct < 0) acc.declines++;
          else acc.unchanged++;
          return acc;
        },
        { advances: 0, declines: 0, unchanged: 0 }
      );

      // Sector Performance — derive from trending stocks by sector_name
      const sectorMap: { [k: string]: number[] } = {};
      const sectorPerformance: { name: string; change: number }[] = [];

      // ---- Trending stocks -----------------------------------------------
      // Actual shape: { success, data: { stocks: [...] } }
      let trendingStocks: Stock[] = [];
      const trendingEnvelope = getFulfilledValue(trendingData);
      const trendingRecord = trendingEnvelope && typeof trendingEnvelope === 'object'
        ? (trendingEnvelope as { success?: boolean; data?: unknown })
        : null;
      if (trendingRecord?.success) {
        const td = trendingRecord.data;
        if (Array.isArray(td)) {
          trendingStocks = td as Stock[];
        } else if (td && typeof td === 'object') {
          const tdRecord = td as Record<string, unknown>;
          if (Array.isArray(tdRecord.stocks)) {
            trendingStocks = tdRecord.stocks as Stock[];
          } else if (tdRecord.trending_stocks && typeof tdRecord.trending_stocks === 'object') {
            const nestedTrending = tdRecord.trending_stocks as Record<string, unknown>;
            trendingStocks = [
              ...(Array.isArray(nestedTrending.top_gainers) ? (nestedTrending.top_gainers as Stock[]) : []),
              ...(Array.isArray(nestedTrending.top_losers) ? (nestedTrending.top_losers as Stock[]) : [])
            ];
          }
        }
      }

      // Build sector performance from trending stock sectors
      trendingStocks.forEach((s: Stock) => {
        const sec = s.sector_name || s.sector || 'Other';
        const pct = toNumeric(s.price_change_percentage ?? s.percent_change ?? s.pChange ?? s.percentChange);
        if (!sectorMap[sec]) sectorMap[sec] = [];
        sectorMap[sec].push(pct);
      });
      Object.entries(sectorMap).forEach(([name, vals]) => {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        sectorPerformance.push({ name, change: parseFloat(avg.toFixed(2)) });
      });

      // Extract BSE most active data
      let bseStocks: Stock[] = [];
      const bsePayload = getFulfilledData(bseMostActiveData);
      if (bsePayload !== null) {
        bseStocks = normalizeMostActivePayload(bsePayload);
      }

      // Extract NSE most active data
      let nseStocks: Stock[] = [];
      const nsePayload = getFulfilledData(nseMostActiveData);
      if (nsePayload !== null) {
        nseStocks = normalizeMostActivePayload(nsePayload);
      }

      // Create Heat Map data from trending + most active stocks
      const heatMapData = [];
      
      // Add BSE most active if we have data
      if (bseStocks.length > 0) {
        heatMapData.push({
          sector: "Most Active BSE",
          stocks: bseStocks.slice(0, 6).map(stock => ({
            name: stock.company_name || stock.companyName || stock.company || stock.name || stock.symbol || 'Unknown Company',
            symbol: toSymbol(stock.symbol || stock.ticker || stock.ric),
            change: toNumeric(stock.percent_change ?? stock.pChange ?? stock.price_change_percentage),
            marketCap: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume ?? stock.finalQuantity, 1000000)),
          }))
        });
      }
      
      // Add NSE most active if we have data
      if (nseStocks.length > 0) {
        heatMapData.push({
          sector: "Most Active NSE", 
          stocks: nseStocks.slice(0, 6).map(stock => ({
            name: stock.company_name || stock.companyName || stock.company || stock.name || stock.symbol || 'Unknown Company',
            symbol: toSymbol(stock.symbol || stock.ticker || stock.ric),
            change: toNumeric(stock.percent_change ?? stock.pChange ?? stock.price_change_percentage),
            marketCap: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume ?? stock.finalQuantity, 1000000)),
          }))
        });
      }
      
      // Add price shockers as a heat map section if we have data
      if (priceShockers.length > 0) {
        heatMapData.push({
          sector: "Price Shockers",
          stocks: priceShockers.slice(0, 8).map(stock => ({
            name: stock.company_name || stock.companyName || stock.name || stock.symbol || 'Unknown Company',
            symbol: toSymbol(stock.symbol || stock.ric),
            change: toNumeric(stock.change_percent ?? stock.percent_change ?? stock.pChange ?? stock.percentChange),
            marketCap: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume, 2000000)),
          }))
        });
      }

      // Add trending stocks if we have data
      // Field names: symbol, company_name, price_change_percentage, current_price
      if (trendingStocks.length > 0) {
        heatMapData.push({
          sector: "Trending Stocks",
          stocks: trendingStocks.slice(0, 8).map(stock => ({
            name: stock.company_name || stock.companyName || stock.displayName || stock.name || 'Unknown',
            symbol: toSymbol(stock.symbol || stock.ric),
            change: toNumeric(stock.price_change_percentage ?? stock.percent_change ?? stock.pChange),
            marketCap: Math.trunc(toNumeric(stock.current_price ?? stock.lastPrice ?? stock.price ?? 2000000)),
          }))
        });
      }

      const breadthFromOverview = overviewBreadth
        ? {
            advances: Math.trunc(toNumeric(overviewBreadth.gainers)),
            declines: Math.trunc(toNumeric(overviewBreadth.losers)),
            unchanged: Math.max(
              0,
              Math.trunc(toNumeric(overviewBreadth.total)) -
                Math.trunc(toNumeric(overviewBreadth.gainers)) -
                Math.trunc(toNumeric(overviewBreadth.losers))
            ),
          }
        : null;

      // Structure the data for the UI components
      const structuredData = {
        indices: overviewIndices.slice(0, 6).map((index) => ({
          name: String(index.index || index.name || index.indexSymbol || 'Index'),
          current: toNumeric(index.last ?? index.current ?? index.close),
          change: toNumeric(index.variation ?? index.change),
          percentage: toNumeric(index.percentChange ?? index.percentage ?? index.pChange),
        })),
        breadth: breadthFromOverview || breadthCalculation,
        sectors: sectorPerformance,
        
        // Top Gainers — from price shockers gainers array
        // Fields: symbol, change_percent, last_price
        topGainers: priceGainers
          .slice(0, 5)
          .map(stock => ({
            symbol: toSymbol(stock.symbol || stock.ric),
            name: stock.company_name || stock.companyName || stock.displayName || stock.name || stock.symbol || 'Unknown',
            price: toNumeric(stock.last_price ?? stock.lastPrice ?? stock.current_price ?? stock.price),
            change: toNumeric(stock.net_change ?? stock.change ?? stock.price_change),
            percentChange: toNumeric(stock.change_percent ?? stock.percent_change ?? stock.pChange ?? stock.percentChange)
          })),

        // Top Losers — from price shockers losers array
        topLosers: priceLosers
          .slice(0, 5)
          .map(stock => ({
            symbol: toSymbol(stock.symbol || stock.ric),
            name: stock.company_name || stock.companyName || stock.displayName || stock.name || stock.symbol || 'Unknown',
            price: toNumeric(stock.last_price ?? stock.lastPrice ?? stock.current_price ?? stock.price),
            change: toNumeric(stock.net_change ?? stock.change ?? stock.price_change),
            percentChange: toNumeric(stock.change_percent ?? stock.percent_change ?? stock.pChange ?? stock.percentChange)
          })),
        
        // Most Active: Combine BSE and NSE most active stocks
        mostActive: [
          ...(bseStocks.slice(0, 3).map(stock => ({
            symbol: toSymbol(stock.symbol || stock.ticker || stock.ric),
            name: `${stock.company_name || stock.companyName || stock.company || stock.name || stock.symbol || 'Unknown Company'} (BSE)`,
            price: toNumeric(stock.last_price ?? stock.lastPrice ?? stock.price ?? stock.current_price),
            change: toNumeric(stock.net_change ?? stock.change ?? stock.price_change),
            percentChange: toNumeric(stock.percent_change ?? stock.pChange ?? stock.price_change_percentage),
            volume: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume ?? stock.finalQuantity))
          }))),
          ...(nseStocks.slice(0, 2).map(stock => ({
            symbol: toSymbol(stock.symbol || stock.ticker || stock.ric),
            name: `${stock.company_name || stock.companyName || stock.company || stock.name || stock.symbol || 'Unknown Company'} (NSE)`,
            price: toNumeric(stock.last_price ?? stock.lastPrice ?? stock.price ?? stock.current_price),
            change: toNumeric(stock.net_change ?? stock.change ?? stock.price_change),
            percentChange: toNumeric(stock.percent_change ?? stock.pChange ?? stock.price_change_percentage),
            volume: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume ?? stock.finalQuantity))
          })))
        ].slice(0, 5),
        
        heatMapData: heatMapData
      };

      setMarketData(structuredData);

      const sectorHeatmapRows = extractRows(getFulfilledData(sectorHeatmapApiData));
      const high52Rows = extractRows(getFulfilledData(week52HighApiData));
      const low52Rows = extractRows(getFulfilledData(week52LowApiData));
      const indexHistoryRows: unknown[] = [];
      const snapshotHistoryRows = extractRows(getFulfilledData(snapshotHistoryApiData));

      const snapshotStatusPayload = getFulfilledData(snapshotStatusApiData);
      const snapshotLatestPayload = getFulfilledData(snapshotLatestApiData);

      setEndpointStats({
        sectorHeatmapCount: sectorHeatmapRows.length,
        high52Count: high52Rows.length,
        low52Count: low52Rows.length,
        indexHistoryPoints: indexHistoryRows.length,
        snapshotHistoryCount: snapshotHistoryRows.length,
        snapshotStatus: String(
          (snapshotStatusPayload as Record<string, unknown> | null)?.status ||
          (snapshotStatusPayload as Record<string, unknown> | null)?.state ||
          'unknown'
        ),
        snapshotCapturedAt: String(
          (snapshotLatestPayload as Record<string, unknown> | null)?.capturedAt ||
          (snapshotLatestPayload as Record<string, unknown> | null)?.updatedAt ||
          ''
        ),
      });

    } catch (error) {
      logger.error('Error fetching market data', error);
      setError('Failed to load market data from API.');
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  const triggerSocketRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastSocketRefreshRef.current < SOCKET_REFRESH_COOLDOWN_MS) {
      return;
    }

    lastSocketRefreshRef.current = now;
    void fetchMarketData();
  }, [fetchMarketData]);

  const { subscribeMarketOverview, unsubscribeMarketOverview } = useWebSocket({
    onMarketSnapshot: () => {
      triggerSocketRefresh();
    },
  });

  useEffect(() => {
    subscribeMarketOverview();
    return () => {
      unsubscribeMarketOverview();
    };
  }, [subscribeMarketOverview, unsubscribeMarketOverview]);

  useEffect(() => {
    void fetchMarketData(true);

    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      void fetchMarketData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMarketData]);

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Grid overlay for entire page */}
        <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <h1 className="sr-only">Indian Market Dashboard</h1>
          <div className="mb-8">
            <div className="h-8 bg-gray-600/50 rounded mb-2 w-1/3"></div>
            <div className="h-4 bg-gray-600/50 rounded w-2/3"></div>
          </div>
          
          <div className="space-y-8">
            {/* Loading skeleton for indices */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden border border-gray-700/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="px-4 py-5 border-r border-gray-700/50">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-600/50 rounded mb-2"></div>
                      <div className="h-6 bg-gray-600/50 rounded mb-1"></div>
                      <div className="h-4 bg-gray-600/50 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Loading skeleton for other components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 h-64 border border-gray-700/50">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-600/50 rounded w-1/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600/50 rounded"></div>
                      <div className="h-4 bg-gray-600/50 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-600/50 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-gray-300 flex items-center justify-center">
              <CursiveLoader />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div ref={containerRef} className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Indian Market Dashboard
          </h1>
          <p className="text-gray-300">
            Real-time overview of the Indian stock market and its key indicators
          </p>
          <div className="text-sm text-gray-400 mt-1">
            Last updated: {currentDate}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-yellow-900/50 border border-yellow-600 text-yellow-200 px-4 py-2 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            {/* Loading skeleton for indices */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden border border-gray-700/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="px-4 py-5 border-r border-gray-700/50">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-600/50 rounded mb-2"></div>
                      <div className="h-6 bg-gray-600/50 rounded mb-1"></div>
                      <div className="h-4 bg-gray-600/50 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Loading skeleton for other components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 h-64 border border-gray-700/50">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-600/50 rounded w-1/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-600/50 rounded"></div>
                      <div className="h-4 bg-gray-600/50 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-600/50 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-gray-300 flex items-center justify-center">
              <CursiveLoader />
            </div>
          </div>
        ) : (
          <>
            {/* Market Indices - Show only if we have data */}
            {marketData.indices.length > 0 && (
              <div className="mb-8">
                <MarketIndices data={marketData.indices} />
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Sector Performance */}
              <SectorPerformance data={marketData.sectors} />
              
              {/* Market Breadth */}
              <MarketBreadth data={marketData.breadth} />
            </div>

            {/* Top Movers and Most Active */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <TopMovers gainers={marketData.topGainers} losers={marketData.topLosers} />
              <MostActive data={marketData.mostActive} />
            </div>

            {/* Heat Map */}
            <div className="mb-8">
              <HeatMap data={marketData.heatMapData} />
            </div>

            <div className="mb-8 bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg border border-gray-700/50 p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Market Endpoint Coverage</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="bg-gray-800/70 rounded-md p-3 border border-gray-700">
                  <p className="text-gray-400">Sector Heatmap Rows</p>
                  <p className="text-neon-400 font-semibold text-xl">{endpointStats.sectorHeatmapCount}</p>
                </div>
                <div className="bg-gray-800/70 rounded-md p-3 border border-gray-700">
                  <p className="text-gray-400">52W High Rows</p>
                  <p className="text-neon-400 font-semibold text-xl">{endpointStats.high52Count}</p>
                </div>
                <div className="bg-gray-800/70 rounded-md p-3 border border-gray-700">
                  <p className="text-gray-400">52W Low Rows</p>
                  <p className="text-neon-400 font-semibold text-xl">{endpointStats.low52Count}</p>
                </div>
                <div className="bg-gray-800/70 rounded-md p-3 border border-gray-700">
                  <p className="text-gray-400">Index History Points</p>
                  <p className="text-neon-400 font-semibold text-xl">{endpointStats.indexHistoryPoints}</p>
                </div>
                <div className="bg-gray-800/70 rounded-md p-3 border border-gray-700">
                  <p className="text-gray-400">Snapshot History Rows</p>
                  <p className="text-neon-400 font-semibold text-xl">{endpointStats.snapshotHistoryCount}</p>
                </div>
                <div className="bg-gray-800/70 rounded-md p-3 border border-gray-700 md:col-span-2">
                  <p className="text-gray-400">Snapshot Status</p>
                  <p className="text-neon-400 font-semibold text-xl capitalize">{endpointStats.snapshotStatus}</p>
                </div>
                <div className="bg-gray-800/70 rounded-md p-3 border border-gray-700 md:col-span-2">
                  <p className="text-gray-400">Snapshot Captured At</p>
                  <p className="text-neon-400 font-semibold text-sm break-all">{endpointStats.snapshotCapturedAt || 'n/a'}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
