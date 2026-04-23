"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  industry?: string;
  week52High?: number;
  week52Low?: number;
  distanceFromHighPercent?: number;
  distanceFromLowPercent?: number;
  marketCap?: number;
  source?: string;
  metadata?: Record<string, unknown>;
  highDate?: string;
  lowDate?: string;
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
  rangeHighs: Stock[];
  rangeLows: Stock[];
}

interface MarketEndpointStats {
  sectorHeatmapCount: number;
  high52Count: number;
  low52Count: number;
  indexHistoryPoints: number;
  snapshotHistoryCount: number;
  snapshotStatus: string;
  snapshotCapturedAt: string;
  snapshotFreshnessLabel: string;
  schedulerRunning: boolean;
  schedulerEnabled: boolean;
  snapshotErrorCount: number;
}

const MARKET_PANEL_CLASS = [
  'rounded-[28px]',
  'border',
  'border-slate-200/80',
  'bg-white/80',
  'shadow-[0_24px_80px_rgba(15,23,42,0.08)]',
  'backdrop-blur-xl',
  'dark:border-white/10',
  'dark:bg-slate-950/60',
  'dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)]',
].join(' ');

const MARKET_INSET_CLASS = [
  'rounded-[24px]',
  'border',
  'border-slate-200/70',
  'bg-white/75',
  'backdrop-blur-xl',
  'dark:border-white/10',
  'dark:bg-white/5',
].join(' ');

const MARKET_LABEL_CLASS = 'text-[0.68rem] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400';

const formatMarketVolume = (value: number) => {
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 10000000) {
    return `${(absoluteValue / 10000000).toFixed(2)} Cr`;
  }

  if (absoluteValue >= 100000) {
    return `${(absoluteValue / 100000).toFixed(2)} L`;
  }

  if (absoluteValue >= 1000) {
    return `${(absoluteValue / 1000).toFixed(2)} K`;
  }

  return absoluteValue.toLocaleString('en-IN');
};

const formatCompactNumber = (value: number | string | undefined, decimals = 2) => {
  const numeric = Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return '0.00';
  }

  return numeric.toFixed(decimals);
};

// Market Indices Component
interface MarketIndicesProps {
  data: MarketIndex[];
}

const MarketIndices = ({ data }: MarketIndicesProps) => {
  // Handle case where data might be undefined or not in expected format
  if (!data || !Array.isArray(data) || data.length === 0) {
    const fallbackIndices = [
      { name: 'NIFTY 50', value: '22,654.5', change: '+127.45', percentage: '+0.57%', tone: 'emerald' },
      { name: 'BSE SENSEX', value: '74,683.7', change: '+260.30', percentage: '+0.35%', tone: 'emerald' },
      { name: 'NIFTY BANK', value: '48,521.6', change: '-73.25', percentage: '-0.15%', tone: 'rose' },
      { name: 'NIFTY IT', value: '34,892.8', change: '+412.95', percentage: '+1.20%', tone: 'emerald' },
    ];

    return (
      <div className={`${MARKET_PANEL_CLASS} overflow-hidden p-0`}>
        <div className="border-b border-slate-200/70 px-4 py-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className={MARKET_LABEL_CLASS}>Benchmark indices</div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The live index feed is sparse, so the market benchmark stays visible with reference values.</p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Premium fallback values</div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {fallbackIndices.map((index, idx) => (
            <div key={index.name} className={`px-4 py-5 ${idx !== fallbackIndices.length - 1 ? 'border-b border-slate-200/70 sm:border-b-0 sm:border-r dark:border-white/10' : ''}`}>
              <div className={MARKET_LABEL_CLASS}>{index.name}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{index.value}</div>
              <div className={`mt-2 flex items-center text-sm font-medium ${index.tone === 'emerald' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                <span className="mr-1">{index.tone === 'emerald' ? '↗' : '↘'}</span>
                <span>{index.change} ({index.percentage})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${MARKET_PANEL_CLASS} overflow-hidden p-0`}>
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
            <div key={idx} className={`px-4 py-5 ${idx !== data.length - 1 ? 'border-b border-slate-200/70 sm:border-b-0 sm:border-r dark:border-white/10' : ''}`}>
              <div className={MARKET_LABEL_CLASS}>{indexData.name}</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{indexData.current.toLocaleString('en-IN')}</div>
              <div className={`mt-2 flex items-center text-sm font-medium ${indexData.change >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                {indexData.change >= 0 ? <span className="mr-1">↗</span> : <span className="mr-1">↘</span>}
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
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
        <p className="font-medium text-slate-950 dark:text-white">{label}</p>
        <p className={`text-sm ${value >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
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
      <div className={`${MARKET_PANEL_CLASS} p-5 sm:p-6 h-full`}>
        <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Sector Performance</h3>
        <div className="h-72 flex items-center justify-center">
          <CursiveLoader />
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.change - a.change);

  return (
    <div className={`${MARKET_PANEL_CLASS} p-5 sm:p-6 h-full`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Sector Performance</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Average range momentum across sectors based on the live 52-week feed.</p>
        </div>
      </div>
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
              stroke="#94a3b8"
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              width={70} 
              stroke="#94a3b8"
            />
            <Tooltip content={<SectorTooltip />} />
            <Bar 
              dataKey="change" 
              fill="#10b981"
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.change >= 0 ? '#10b981' : '#f43f5e'} />
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
    <div className={`${MARKET_PANEL_CLASS} p-5 sm:p-6 h-full`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Market Breadth</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Live advance/decline balance from the market overview feed.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">{data.advances}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Advances</div>
          <div className="text-xs text-slate-400">{total > 0 ? `${((data.advances / total) * 100).toFixed(1)}%` : '0%'}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-rose-600 dark:text-rose-300">{data.declines}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Declines</div>
          <div className="text-xs text-slate-400">{total > 0 ? `${((data.declines / total) * 100).toFixed(1)}%` : '0%'}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-500 dark:text-slate-300">{data.unchanged}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Unchanged</div>
          <div className="text-xs text-slate-400">{total > 0 ? `${((data.unchanged / total) * 100).toFixed(1)}%` : '0%'}</div>
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
              formatter={(value) => <span className="text-xs text-slate-500 dark:text-slate-400">{value}</span>}
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
  const safeGainers = Array.isArray(gainers) ? gainers : [];
  const safeLosers = Array.isArray(losers) ? losers : [];
  const hasMoverData = safeGainers.length > 0 || safeLosers.length > 0;

  return (
    <div className={`${MARKET_PANEL_CLASS} p-5 sm:p-6`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Market Movers</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {hasMoverData ? 'Live gainers and losers from the active market feed.' : 'Direct mover feed is empty right now. The page keeps the section visible as the feed warms up.'}
          </p>
        </div>
        <div className={`${MARKET_INSET_CLASS} px-3 py-2 text-right`}>
          <div className={MARKET_LABEL_CLASS}>Coverage</div>
          <div className="mt-1 text-sm font-medium text-slate-950 dark:text-white">
            {safeGainers.length} gainers · {safeLosers.length} losers
          </div>
        </div>
      </div>

      <Tabs defaultValue="gainers" className="w-full">
        <TabsList className="mb-4 grid h-11 w-full grid-cols-2 rounded-full border border-slate-200/80 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
          <TabsTrigger
            value="gainers"
            className="rounded-full px-4 text-sm font-medium text-slate-500 data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-emerald-300"
          >
            Top Gainers ({safeGainers.length})
          </TabsTrigger>
          <TabsTrigger
            value="losers"
            className="rounded-full px-4 text-sm font-medium text-slate-500 data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-600 data-[state=active]:shadow-sm dark:text-slate-400 dark:data-[state=active]:text-rose-300"
          >
            Top Losers ({safeLosers.length})
          </TabsTrigger>
        </TabsList>

        {['gainers', 'losers'].map((tabValue) => {
          const activeRows = tabValue === 'gainers' ? safeGainers : safeLosers;
          return (
            <TabsContent key={tabValue} value={tabValue} className="mt-0">
              {activeRows.length === 0 ? (
                <div className={`${MARKET_INSET_CLASS} px-5 py-10 text-center`}>
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${tabValue === 'gainers' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'}`}>
                    {tabValue === 'gainers' ? '↗' : '↘'}
                  </div>
                  <p className="text-sm font-medium text-slate-950 dark:text-white">No {tabValue} data available</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This feed is currently empty. Range data below keeps the page informative.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200/70 text-[0.7rem] uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                      <th className="pb-3 text-left">Stock</th>
                      <th className="pb-3 text-right">Price</th>
                      <th className="pb-3 text-right">Change</th>
                      <th className="pb-3 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeRows.slice(0, 5).map((stock, index) => {
                      const stockData = {
                        symbol: stock.symbol || stock.ric?.split('.')[0] || 'N/A',
                        name: stock.name || stock.displayName || stock.company_name || 'Unknown Company',
                        price: parseFloat(stock.price?.toString() || stock.current_price?.toString() || '0'),
                        change: parseFloat(stock.change?.toString() || stock.price_change?.toString() || '0'),
                        percentChange: parseFloat(stock.percentChange?.toString() || stock.percent_change?.toString() || stock.price_change_percentage?.toString() || '0'),
                        volume: stock.volume || stock.traded_volume || 0
                      };

                      return (
                        <tr key={index} className="border-b border-slate-200/50 last:border-b-0 dark:border-white/5">
                          <td className="py-3 pr-4">
                            <div>
                              <div className="font-medium text-slate-950 dark:text-white">{stockData.symbol}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{stockData.name}</div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="font-medium text-slate-950 dark:text-white">₹{stockData.price.toLocaleString('en-IN')}</div>
                          </td>
                          <td className="py-3 text-right">
                            <div className={`flex items-center justify-end ${tabValue === 'gainers' ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                              <span className="mr-1">{tabValue === 'gainers' ? '↗' : '↘'}</span>
                              <div className="text-right">
                                <div className="font-medium">{Math.abs(stockData.percentChange).toFixed(2)}%</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">₹{Math.abs(stockData.change).toFixed(2)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {stockData.volume ? stockData.volume.toLocaleString('en-IN') : 'N/A'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
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
    <div className={`${MARKET_PANEL_CLASS} p-5 sm:p-6 h-full`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Most Active</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Highest-turnover names from the live active feeds.
          </p>
        </div>
        <div className={`${MARKET_INSET_CLASS} px-3 py-2 text-right`}>
          <div className={MARKET_LABEL_CLASS}>Rows</div>
          <div className="mt-1 text-sm font-medium text-slate-950 dark:text-white">{safeData.length}</div>
        </div>
      </div>
      
      <div className="overflow-hidden">
        {safeData.length === 0 ? (
          <div className={`${MARKET_INSET_CLASS} px-5 py-10 text-center`}>
            <p className="text-sm font-medium text-slate-950 dark:text-white">No active trading data available</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The BSE/NSE active feeds are currently empty, so this panel stays intentionally minimal.</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200/70 text-[0.7rem] uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:text-slate-400">
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
                  <tr key={index} className="border-b border-slate-200/50 last:border-b-0 dark:border-white/5">
                    <td className="py-3">
                      <div>
                        <div className="font-medium text-slate-950 dark:text-white">{stockData.symbol}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{stockData.name}</div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="font-medium text-slate-950 dark:text-white">₹{stockData.price.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="py-3 text-right">
                      <div className={`flex items-center justify-end ${stockData.change >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>
                        {stockData.change >= 0 ? (
                          <span className="mr-1">↗</span>
                        ) : (
                          <span className="mr-1">↘</span>
                        )}
                        <span>{Math.abs(stockData.percentChange).toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {stockData.volume ? formatMarketVolume(stockData.volume) : 'N/A'}
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
      <div className={`${MARKET_PANEL_CLASS} p-5 sm:p-6`}>
        <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Market Heat Map</h3>
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
    <div className={`${MARKET_PANEL_CLASS} p-5 sm:p-6`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Market Heat Map</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sector blocks derived from the live 52-week range feeds and active market data.</p>
        </div>
      </div>
      
      <div className="mb-5 flex flex-wrap gap-2">
        <div className={`${MARKET_INSET_CLASS} flex items-center gap-2 px-3 py-2`}>
          <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Momentum above range midpoint</span>
        </div>
        <div className={`${MARKET_INSET_CLASS} flex items-center gap-2 px-3 py-2`}>
          <div className="h-3 w-3 rounded-full bg-rose-500"></div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Momentum below range midpoint</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {data.map((sector, idx) => (
            <div key={idx} className="mb-6">
              <h4 className="mb-2 text-sm font-semibold tracking-tight text-slate-950 dark:text-white">{sector.sector}</h4>
              <div className="flex flex-wrap gap-2">
                {sector.stocks && sector.stocks.map((stock, stockIdx) => {
                  const change = parseFloat(stock.change?.toString() || '0');
                  const marketCap = parseInt(stock.marketCap?.toString() || '1000000');
                  
                  return (
                    <div
                      key={stockIdx}
                      className={`${getBlockSize(marketCap)} ${getColorIntensity(change)} rounded-2xl border cursor-pointer p-2 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)] dark:hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]`}
                      title={`${stock.name} (${stock.symbol}): ${change > 0 ? '+' : ''}${change.toFixed(2)}%`}
                    >
                      <div className="font-bold text-[0.7rem] text-white truncate w-full">
                        {stock.symbol}
                      </div>
                      <div className="text-[0.65rem] text-white/90 truncate w-full">
                        {stock.name.length > 8 ? stock.name.substring(0, 8) + '...' : stock.name}  
                      </div>
                      <div className="text-[0.65rem] font-semibold text-white">
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
    heatMapData: [],
    rangeHighs: [],
    rangeLows: []
  });
  const [endpointStats, setEndpointStats] = useState<MarketEndpointStats>({
    sectorHeatmapCount: 0,
    high52Count: 0,
    low52Count: 0,
    indexHistoryPoints: 0,
    snapshotHistoryCount: 0,
    snapshotStatus: 'unknown',
    snapshotCapturedAt: '',
    snapshotFreshnessLabel: 'fresh',
    schedulerRunning: false,
    schedulerEnabled: false,
    snapshotErrorCount: 0,
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

    const normalizeRangeFeed = (value: unknown, sourceLabel: 'high52' | 'low52'): Stock[] => {
      const rows = extractRows(value);

      return rows.map((item, index) => {
        const record = item as Record<string, unknown>;
        const symbol = toSymbol(record.symbol || record.ticker || record.ric);
        const companyName = String(
          record.companyName ||
          record.company_name ||
          record.company ||
          record.name ||
          symbol ||
          `Range ${index + 1}`
        ).trim();
        const currentPrice = toNumeric(record.currentPrice ?? record.current_price ?? record.price ?? record.lastPrice ?? record.close);
        const week52High = toNumeric(record.week52High ?? record.high_52_week ?? record.high ?? currentPrice);
        const week52Low = toNumeric(record.week52Low ?? record.low_52_week ?? record.low ?? currentPrice);
        const distanceFromHigh = toNumeric(
          record.distanceFromHighPercent ??
            (week52High ? ((week52High - currentPrice) / week52High) * 100 : 0)
        );
        const distanceFromLow = toNumeric(
          record.distanceFromLowPercent ??
            (week52Low ? ((currentPrice - week52Low) / week52Low) * 100 : 0)
        );
        const momentumScore = Number((distanceFromLow - distanceFromHigh).toFixed(2));
        const marketCap = toNumeric(record.marketCap ?? record.market_cap ?? currentPrice * 1000);

        return {
          symbol,
          name: companyName,
          companyName,
          company_name: companyName,
          company: companyName,
          price: currentPrice,
          change: momentumScore,
          percentChange: momentumScore,
          current_price: currentPrice,
          percent_change: momentumScore,
          price_change_percentage: momentumScore,
          sector_name: String(record.sector || record.sector_name || record.industry || 'Other'),
          sector: String(record.sector || record.sector_name || record.industry || 'Other'),
          industry: String(record.industry || record.sector || record.sector_name || 'Other'),
          volume: 0,
          week52High,
          week52Low,
          distanceFromHighPercent: distanceFromHigh,
          distanceFromLowPercent: distanceFromLow,
          marketCap,
          source: String(record.source || sourceLabel),
          metadata: record.metadata && typeof record.metadata === 'object' ? (record.metadata as Record<string, unknown>) : undefined,
          highDate: String(record.highDate || ''),
          lowDate: String(record.lowDate || ''),
          ric: String(record.ric || record.symbol || symbol),
        };
      });
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
      const rangeHighRows = normalizeRangeFeed(getFulfilledData(week52HighApiData), 'high52');
      const rangeLowRows = normalizeRangeFeed(getFulfilledData(week52LowApiData), 'low52');
      const rangeBreadthCalculation = [...rangeHighRows, ...rangeLowRows].reduce(
        (acc: { advances: number; declines: number; unchanged: number }, stock: Stock) => {
          const pct = toNumeric(stock.change ?? stock.percentChange);

          if (pct > 0) {
            acc.advances++;
          } else if (pct < 0) {
            acc.declines++;
          } else {
            acc.unchanged++;
          }

          return acc;
        },
        { advances: 0, declines: 0, unchanged: 0 }
      );

      const rangeSectorMap: { [key: string]: number[] } = {};
      [...rangeHighRows, ...rangeLowRows].forEach((stock: Stock) => {
        const sectorName = stock.sector_name || stock.industry || 'Other';
        const score = Number(
          (
            (stock.distanceFromLowPercent ?? 0) -
            (stock.distanceFromHighPercent ?? 0)
          ).toFixed(2)
        );

        if (!rangeSectorMap[sectorName]) {
          rangeSectorMap[sectorName] = [];
        }

        rangeSectorMap[sectorName].push(score);
      });

      const sectorSourceMap = Object.keys(sectorMap).length > 0 ? sectorMap : rangeSectorMap;

      Object.entries(sectorSourceMap).forEach(([name, vals]) => {
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

      // Create Heat Map data from live range feeds or trending/active fallback
      const heatMapData = [];

      const buildHeatMapGroup = (label: string, stocks: Stock[]) => ({
        sector: label,
        stocks: stocks.slice(0, 8).map((stock) => ({
          name: stock.company_name || stock.companyName || stock.company || stock.name || stock.symbol || 'Unknown Company',
          symbol: toSymbol(stock.symbol || stock.ticker || stock.ric),
          change: toNumeric(stock.distanceFromLowPercent ?? stock.percent_change ?? stock.price_change_percentage ?? stock.change),
          marketCap: Math.trunc(toNumeric(stock.marketCap ?? stock.current_price ?? stock.price ?? 1000000)),
        }))
      });

      if (rangeHighRows.length > 0) {
        const groupedRangeHighs = rangeHighRows.reduce((acc: Record<string, Stock[]>, stock) => {
          const key = stock.sector_name || stock.industry || '52W Highs';
          if (!acc[key]) acc[key] = [];
          acc[key].push(stock);
          return acc;
        }, {});

        Object.entries(groupedRangeHighs).slice(0, 4).forEach(([sector, stocks]) => {
          heatMapData.push(buildHeatMapGroup(sector, stocks));
        });
      }

      if (rangeLowRows.length > 0) {
        const groupedRangeLows = rangeLowRows.reduce((acc: Record<string, Stock[]>, stock) => {
          const key = stock.sector_name || stock.industry || '52W Lows';
          if (!acc[key]) acc[key] = [];
          acc[key].push(stock);
          return acc;
        }, {});

        Object.entries(groupedRangeLows).slice(0, 4).forEach(([sector, stocks]) => {
          heatMapData.push(buildHeatMapGroup(sector, stocks));
        });
      }

      if (heatMapData.length === 0) {
        if (bseStocks.length > 0) {
          heatMapData.push({
            sector: 'Most Active BSE',
            stocks: bseStocks.slice(0, 6).map(stock => ({
              name: stock.company_name || stock.companyName || stock.company || stock.name || stock.symbol || 'Unknown Company',
              symbol: toSymbol(stock.symbol || stock.ticker || stock.ric),
              change: toNumeric(stock.percent_change ?? stock.pChange ?? stock.price_change_percentage),
              marketCap: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume ?? stock.finalQuantity, 1000000)),
            }))
          });
        }

        if (nseStocks.length > 0) {
          heatMapData.push({
            sector: 'Most Active NSE',
            stocks: nseStocks.slice(0, 6).map(stock => ({
              name: stock.company_name || stock.companyName || stock.company || stock.name || stock.symbol || 'Unknown Company',
              symbol: toSymbol(stock.symbol || stock.ticker || stock.ric),
              change: toNumeric(stock.percent_change ?? stock.pChange ?? stock.price_change_percentage),
              marketCap: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume ?? stock.finalQuantity, 1000000)),
            }))
          });
        }

        if (priceShockers.length > 0) {
          heatMapData.push({
            sector: 'Price Shockers',
            stocks: priceShockers.slice(0, 8).map(stock => ({
              name: stock.company_name || stock.companyName || stock.name || stock.symbol || 'Unknown Company',
              symbol: toSymbol(stock.symbol || stock.ric),
              change: toNumeric(stock.change_percent ?? stock.percent_change ?? stock.pChange ?? stock.percentChange),
              marketCap: Math.trunc(toNumeric(stock.volume ?? stock.totalTurnover ?? stock.traded_volume, 2000000)),
            }))
          });
        }

        if (trendingStocks.length > 0) {
          heatMapData.push({
            sector: 'Trending Stocks',
            stocks: trendingStocks.slice(0, 8).map(stock => ({
              name: stock.company_name || stock.companyName || stock.displayName || stock.name || 'Unknown',
              symbol: toSymbol(stock.symbol || stock.ric),
              change: toNumeric(stock.price_change_percentage ?? stock.percent_change ?? stock.pChange),
              marketCap: Math.trunc(toNumeric(stock.current_price ?? stock.lastPrice ?? stock.price ?? 2000000)),
            }))
          });
        }
      }

      const rangeHighs = rangeHighRows.slice(0, 6);
      const rangeLows = rangeLowRows.slice(0, 6);

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

      const activeFromRanges = [...rangeHighs, ...rangeLows].slice(0, 6);
        const resolvedBreadth = breadthFromOverview && (
          breadthFromOverview.advances > 0 ||
          breadthFromOverview.declines > 0 ||
          breadthFromOverview.unchanged > 0
        )
          ? breadthFromOverview
          : (priceShockers.length > 0 ? breadthCalculation : rangeBreadthCalculation);

      // Structure the data for the UI components
      const structuredData = {
        indices: overviewIndices.slice(0, 6).map((index) => ({
          name: String(index.index || index.name || index.indexSymbol || 'Index'),
          current: toNumeric(index.last ?? index.current ?? index.close),
          change: toNumeric(index.variation ?? index.change),
          percentage: toNumeric(index.percentChange ?? index.percentage ?? index.pChange),
        })),
        breadth: resolvedBreadth,
        sectors: sectorPerformance,
        rangeHighs,
        rangeLows,
        
        // Top Gainers — from price shockers gainers array
        // Fields: symbol, change_percent, last_price
        topGainers: (priceGainers.length > 0 ? priceGainers : rangeHighs)
          .slice(0, 5)
          .map(stock => ({
            symbol: toSymbol(stock.symbol || stock.ric),
            name: stock.company_name || stock.companyName || stock.displayName || stock.name || stock.symbol || 'Unknown',
            price: toNumeric(stock.last_price ?? stock.lastPrice ?? stock.current_price ?? stock.price ?? stock.week52High ?? stock.week52Low),
            change: toNumeric(stock.net_change ?? stock.change ?? stock.price_change ?? stock.distanceFromLowPercent ?? stock.change),
            percentChange: toNumeric(stock.change_percent ?? stock.percent_change ?? stock.pChange ?? stock.percentChange ?? stock.distanceFromLowPercent)
          })),

        // Top Losers — from price shockers losers array
        topLosers: (priceLosers.length > 0 ? priceLosers : rangeLows)
          .slice(0, 5)
          .map(stock => ({
            symbol: toSymbol(stock.symbol || stock.ric),
            name: stock.company_name || stock.companyName || stock.displayName || stock.name || stock.symbol || 'Unknown',
            price: toNumeric(stock.last_price ?? stock.lastPrice ?? stock.current_price ?? stock.price ?? stock.week52High ?? stock.week52Low),
            change: toNumeric(stock.net_change ?? stock.change ?? stock.price_change ?? stock.distanceFromHighPercent ?? stock.change),
            percentChange: toNumeric(stock.change_percent ?? stock.percent_change ?? stock.pChange ?? stock.percentChange ?? stock.distanceFromHighPercent)
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

      const snapshotStatusPayload = getFulfilledData(snapshotStatusApiData) as Record<string, unknown> | null;
      const snapshotLatestPayload = getFulfilledData(snapshotLatestApiData) as Record<string, unknown> | null;

      const freshnessPayload = snapshotStatusPayload?.freshness && typeof snapshotStatusPayload.freshness === 'object'
        ? snapshotStatusPayload.freshness as Record<string, unknown>
        : null;
      const schedulerPayload = snapshotStatusPayload?.scheduler && typeof snapshotStatusPayload.scheduler === 'object'
        ? snapshotStatusPayload.scheduler as Record<string, unknown>
        : null;
      const latestSnapshotPayload = snapshotStatusPayload?.latestSnapshot && typeof snapshotStatusPayload.latestSnapshot === 'object'
        ? snapshotStatusPayload.latestSnapshot as Record<string, unknown>
        : null;

      setEndpointStats({
        sectorHeatmapCount: sectorHeatmapRows.length,
        high52Count: high52Rows.length,
        low52Count: low52Rows.length,
        indexHistoryPoints: indexHistoryRows.length,
        snapshotHistoryCount: snapshotHistoryRows.length,
        snapshotStatus: String(
          schedulerPayload?.running ? 'running' :
          schedulerPayload?.enabled ? 'enabled' :
          latestSnapshotPayload?.syncStatus ? 'partial' :
          'unknown'
        ),
        snapshotCapturedAt: String(
          snapshotLatestPayload?.capturedAt ||
          latestSnapshotPayload?.capturedAt ||
          snapshotLatestPayload?.updatedAt ||
          ''
        ),
        snapshotFreshnessLabel: String(
          freshnessPayload?.isStale === true ? 'stale' : 'fresh'
        ),
        schedulerRunning: Boolean(schedulerPayload?.running),
        schedulerEnabled: Boolean(schedulerPayload?.enabled),
        snapshotErrorCount: Number(latestSnapshotPayload?.errorCount ?? 0),
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_24%),linear-gradient(to_bottom,_#f8fafc,_#eef2f7)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.1),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.4),_transparent_24%),linear-gradient(to_bottom,_#020617,_#0f172a_55%,_#111827)] dark:text-white">
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:56px_56px] pointer-events-none z-0"></div>
      
      <div ref={containerRef} className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <section className={`${MARKET_PANEL_CLASS} mb-8 overflow-hidden p-6 sm:p-8`}>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live Indian market overview
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl dark:text-white">
                Indian Market Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
                A premium live market surface for breadth, range leaders, sector momentum, and snapshot health. The page keeps its structure even when a feed is empty.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className={`${MARKET_INSET_CLASS} px-3 py-2`}>Last updated {currentDate}</span>
                <span className={`${MARKET_INSET_CLASS} px-3 py-2`}>Snapshot {endpointStats.snapshotFreshnessLabel === 'checking' ? 'checking' : endpointStats.snapshotFreshnessLabel}</span>
                <span className={`${MARKET_INSET_CLASS} px-3 py-2`}>Scheduler {endpointStats.schedulerRunning ? 'running' : endpointStats.schedulerEnabled ? 'enabled' : 'checking'}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[31rem] lg:grid-cols-3">
              <div className={`${MARKET_INSET_CLASS} p-4`}>
                <div className={MARKET_LABEL_CLASS}>Breadth</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{marketData.breadth.advances}/{marketData.breadth.declines}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Advances vs declines</div>
              </div>
              <div className={`${MARKET_INSET_CLASS} p-4`}>
                <div className={MARKET_LABEL_CLASS}>52W Rows</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{endpointStats.high52Count + endpointStats.low52Count}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">High + low coverage</div>
              </div>
              <div className={`${MARKET_INSET_CLASS} p-4`}>
                <div className={MARKET_LABEL_CLASS}>Snapshot</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{endpointStats.snapshotStatus === 'unknown' ? 'checking' : endpointStats.snapshotStatus}</div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{endpointStats.snapshotCapturedAt || 'awaiting capture'}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className={`${MARKET_INSET_CLASS} mb-8 px-4 py-3 text-amber-800 dark:text-amber-200`}>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-8">
            <div className={`${MARKET_PANEL_CLASS} overflow-hidden p-0`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="border-b border-slate-200/70 px-4 py-5 sm:border-b-0 sm:border-r dark:border-white/10">
                    <div className="animate-pulse">
                      <div className="mb-2 h-4 rounded-full bg-slate-200/80 dark:bg-slate-800" />
                      <div className="mb-1 h-6 rounded-full bg-slate-200/80 dark:bg-slate-800" />
                      <div className="h-4 rounded-full bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className={`${MARKET_PANEL_CLASS} p-5 sm:p-6 h-64`}>
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 w-1/3 rounded-full bg-slate-200/80 dark:bg-slate-800" />
                    <div className="space-y-2">
                      <div className="h-4 rounded-full bg-slate-200/80 dark:bg-slate-800" />
                      <div className="h-4 w-5/6 rounded-full bg-slate-200/80 dark:bg-slate-800" />
                      <div className="h-4 w-4/6 rounded-full bg-slate-200/80 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
              <CursiveLoader />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <MarketIndices data={marketData.indices} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <SectorPerformance data={marketData.sectors} />
              <MarketBreadth data={marketData.breadth} />
            </div>

            <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <TopMovers gainers={marketData.topGainers} losers={marketData.topLosers} />
              <MostActive data={marketData.mostActive} />
            </div>

            <div className="mb-8">
              <HeatMap data={marketData.heatMapData} />
            </div>

            <section className={`${MARKET_PANEL_CLASS} mb-8 p-5 sm:p-6`}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">52W Range Leaders</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The most reliable live data source on this page right now, derived directly from the 52-week high/low endpoints.</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} px-3 py-2 text-right`}>
                  <div className={MARKET_LABEL_CLASS}>Snapshot</div>
                  <div className="mt-1 text-sm font-medium text-slate-950 dark:text-white capitalize">{endpointStats.snapshotFreshnessLabel}</div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className={`${MARKET_INSET_CLASS} p-4 sm:p-5`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">52W Highs</h4>
                    <span className={MARKET_LABEL_CLASS}>{endpointStats.high52Count} rows</span>
                  </div>
                  <div className="overflow-hidden rounded-[20px] border border-slate-200/70 dark:border-white/10">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200/70 text-[0.7rem] uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                          <th className="px-3 py-3 text-left">Stock</th>
                          <th className="px-3 py-3 text-right">Price</th>
                          <th className="px-3 py-3 text-right">Distance</th>
                          <th className="px-3 py-3 text-right">Sector</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.rangeHighs.slice(0, 5).map((stock, index) => (
                          <tr key={`${stock.symbol}-${index}`} className="border-b border-slate-200/50 last:border-b-0 dark:border-white/5">
                            <td className="px-3 py-3">
                              <div className="font-medium text-slate-950 dark:text-white">{stock.symbol}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{stock.companyName || stock.name}</div>
                            </td>
                            <td className="px-3 py-3 text-right text-slate-950 dark:text-white">₹{formatCompactNumber(stock.price, 2)}</td>
                            <td className="px-3 py-3 text-right text-emerald-600 dark:text-emerald-300">{formatCompactNumber(stock.distanceFromHighPercent, 2)}%</td>
                            <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400">{stock.sector_name || 'Other'}</td>
                          </tr>
                        ))}
                        {marketData.rangeHighs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No 52W high rows are available yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`${MARKET_INSET_CLASS} p-4 sm:p-5`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold tracking-tight text-slate-950 dark:text-white">52W Lows</h4>
                    <span className={MARKET_LABEL_CLASS}>{endpointStats.low52Count} rows</span>
                  </div>
                  <div className="overflow-hidden rounded-[20px] border border-slate-200/70 dark:border-white/10">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200/70 text-[0.7rem] uppercase tracking-[0.2em] text-slate-500 dark:border-white/10 dark:text-slate-400">
                          <th className="px-3 py-3 text-left">Stock</th>
                          <th className="px-3 py-3 text-right">Price</th>
                          <th className="px-3 py-3 text-right">Distance</th>
                          <th className="px-3 py-3 text-right">Sector</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketData.rangeLows.slice(0, 5).map((stock, index) => (
                          <tr key={`${stock.symbol}-${index}`} className="border-b border-slate-200/50 last:border-b-0 dark:border-white/5">
                            <td className="px-3 py-3">
                              <div className="font-medium text-slate-950 dark:text-white">{stock.symbol}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{stock.companyName || stock.name}</div>
                            </td>
                            <td className="px-3 py-3 text-right text-slate-950 dark:text-white">₹{formatCompactNumber(stock.price, 2)}</td>
                            <td className="px-3 py-3 text-right text-rose-600 dark:text-rose-300">{formatCompactNumber(stock.distanceFromLowPercent, 2)}%</td>
                            <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400">{stock.sector_name || 'Other'}</td>
                          </tr>
                        ))}
                        {marketData.rangeLows.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No 52W low rows are available yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section className={`${MARKET_PANEL_CLASS} mb-8 p-5 sm:p-6`}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">Market Endpoint Coverage</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Backend feed health, snapshot freshness, and live data coverage at a glance.</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} px-3 py-2 text-right`}>
                  <div className={MARKET_LABEL_CLASS}>Status</div>
                  <div className="mt-1 text-sm font-medium text-slate-950 dark:text-white capitalize">{endpointStats.snapshotStatus === 'unknown' ? 'checking' : endpointStats.snapshotStatus}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className={`${MARKET_INSET_CLASS} p-4`}>
                  <p className={MARKET_LABEL_CLASS}>Sector Heatmap Rows</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{endpointStats.sectorHeatmapCount}</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} p-4`}>
                  <p className={MARKET_LABEL_CLASS}>52W High Rows</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{endpointStats.high52Count}</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} p-4`}>
                  <p className={MARKET_LABEL_CLASS}>52W Low Rows</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{endpointStats.low52Count}</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} p-4`}>
                  <p className={MARKET_LABEL_CLASS}>Snapshot History Rows</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{endpointStats.snapshotHistoryCount}</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} p-4 sm:col-span-2 xl:col-span-2`}>
                  <p className={MARKET_LABEL_CLASS}>Snapshot Captured At</p>
                  <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white break-all">{endpointStats.snapshotCapturedAt || 'n/a'}</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} p-4`}>
                  <p className={MARKET_LABEL_CLASS}>Freshness</p>
                  <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white capitalize">{endpointStats.snapshotFreshnessLabel}</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} p-4`}>
                  <p className={MARKET_LABEL_CLASS}>Scheduler</p>
                  <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{endpointStats.schedulerRunning ? 'Running' : 'Idle'}</p>
                </div>
                <div className={`${MARKET_INSET_CLASS} p-4`}>
                  <p className={MARKET_LABEL_CLASS}>Snapshot Errors</p>
                  <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{endpointStats.snapshotErrorCount}</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
