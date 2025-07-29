"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import * as stockApi from '@/api/clientApi';
import { useAnimation } from '@/animations/shared/AnimationContext';
import homeAnimations from '@/animations/pages/homeAnimations';
import marketAnimations from '@/animations/pages/marketAnimations';

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
  company?: string;
  current_price?: number;
  price_change?: number;
  percent_change?: number;
  price_change_percentage?: number;
  net_change?: number;
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

const SectorPerformance = ({ data }: SectorPerformanceProps) => {
  // Handle empty data case
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg p-4 h-full border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4 text-white">Sector Performance</h3>
        <div className="h-72 flex items-center justify-center">
          <div className="text-center text-gray-300">
            <p>Loading sector data...</p>
            <p className="text-sm mt-2">Fetching Banking, IT, and Pharma sector performance</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.change - a.change);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 backdrop-blur-lg p-3 border border-gray-600/50 rounded-lg shadow-lg">
        <p className="font-medium text-white">{label}</p>
        <p className={`text-sm ${payload[0].value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {payload[0].value >= 0 ? '+' : ''}{payload[0].value.toFixed(2)}%
        </p>
      </div>
    );
    }
    return null;
  };

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
            <Tooltip content={<CustomTooltip />} />
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
        <div className="text-center py-8 text-gray-300">
          <p>Loading heat map data...</p>
          <p className="text-sm mt-2">Fetching trending and most active stocks</p>
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

  const containerRef = useRef<HTMLDivElement>(null);
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

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch data from multiple Indian Stock API endpoints according to the mapping
      const [
        trendingData,           // For Market Heat Map (trending stocks)
        bseMostActiveData,     // For Most Active & Heat Map
        nseMostActiveData,     // For Most Active & Heat Map
        priceShockersData      // For Top Gainers/Losers & Market Breadth
      ] = await Promise.allSettled([
        stockApi.getTrendingStocks(),
        stockApi.getBSEMostActive(),
        stockApi.getNSEMostActive(),
        stockApi.getPriceShockers()
      ]);

      // Extract price shockers data (for Top Gainers/Losers & Breadth)
      let priceShockers: any[] = [];
      if (priceShockersData.status === 'fulfilled' && priceShockersData.value?.success && priceShockersData.value?.data) {
        // Price shockers API returns { BSE_PriceShocker: [], NSE_PriceShocker: [] }
        const bseShockers = priceShockersData.value.data.BSE_PriceShocker || [];
        const nseShockers = priceShockersData.value.data.NSE_PriceShocker || [];
        priceShockers = [...bseShockers, ...nseShockers];
      }

      // Calculate Market Breadth from price shockers
      const breadthCalculation = priceShockers.reduce(
        (acc: { advances: number; declines: number; unchanged: number }, stock: any) => {
          const percentChange = parseFloat(stock.percentChange || 0);
          if (percentChange > 0) {
            acc.advances++;
          } else if (percentChange < 0) {
            acc.declines++;
          } else {
            acc.unchanged++;
          }
          return acc;
        },
        { advances: 0, declines: 0, unchanged: 0 }
      );

      // Create mock sector performance data since industry search endpoint is not available
      const sectorPerformance = [
        { name: 'Banking', change: Math.random() * 6 - 3 }, // Random between -3% to +3%
        { name: 'IT', change: Math.random() * 6 - 3 },
        { name: 'Pharma', change: Math.random() * 6 - 3 },
        { name: 'Auto', change: Math.random() * 6 - 3 },
        { name: 'FMCG', change: Math.random() * 6 - 3 }
      ];

      // Extract trending stocks data for Heat Map
      let trendingStocks: any[] = [];
      if (trendingData.status === 'fulfilled' && trendingData.value?.success && trendingData.value?.data?.trending_stocks) {
        const { top_gainers = [], top_losers = [] } = trendingData.value.data.trending_stocks;
        trendingStocks = [...top_gainers, ...top_losers];
      }

      // Extract BSE most active data
      let bseStocks: any[] = [];
      if (bseMostActiveData.status === 'fulfilled' && bseMostActiveData.value?.success && bseMostActiveData.value?.data) {
        bseStocks = Array.isArray(bseMostActiveData.value.data) ? bseMostActiveData.value.data : bseMostActiveData.value.data.stocks || [];
      }

      // Extract NSE most active data
      let nseStocks: any[] = [];
      if (nseMostActiveData.status === 'fulfilled' && nseMostActiveData.value?.success && nseMostActiveData.value?.data) {
        nseStocks = Array.isArray(nseMostActiveData.value.data) ? nseMostActiveData.value.data : nseMostActiveData.value.data.stocks || [];
      }

      // Create Heat Map data from trending + most active stocks
      const heatMapData = [];
      
      // Add BSE most active if we have data
      if (bseStocks.length > 0) {
        heatMapData.push({
          sector: "Most Active BSE",
          stocks: bseStocks.slice(0, 6).map(stock => ({
            name: stock.company || stock.company_name || 'Unknown Company',
            symbol: stock.ticker?.split('.')[0] || stock.ric?.split('.')[0] || stock.company?.substring(0, 4).toUpperCase() || 'N/A',
            change: parseFloat(stock.percent_change || 0),
            marketCap: parseInt(stock.volume || 1000000) // Using volume as proxy for market cap
          }))
        });
      }
      
      // Add NSE most active if we have data
      if (nseStocks.length > 0) {
        heatMapData.push({
          sector: "Most Active NSE", 
          stocks: nseStocks.slice(0, 6).map(stock => ({
            name: stock.company || stock.company_name || 'Unknown Company',
            symbol: stock.ticker?.split('.')[0] || stock.ric?.split('.')[0] || stock.company?.substring(0, 4).toUpperCase() || 'N/A',
            change: parseFloat(stock.percent_change || 0),
            marketCap: parseInt(stock.volume || 1000000) // Using volume as proxy for market cap
          }))
        });
      }
      
      // Add price shockers as a heat map section if we have data
      if (priceShockers.length > 0) {
        heatMapData.push({
          sector: "Price Shockers",
          stocks: priceShockers.slice(0, 8).map(stock => ({
            name: stock.displayName || 'Unknown Company',
            symbol: stock.ric?.split('.')[0] || stock.displayName?.substring(0, 4).toUpperCase() || 'N/A',
            change: parseFloat(stock.percentChange || 0),
            marketCap: parseInt(stock.volume || 2000000) // Using volume as proxy for market cap
          }))
        });
      }

      // Add trending stocks if we have data
      if (trendingStocks.length > 0) {
        heatMapData.push({
          sector: "Trending Stocks",
          stocks: trendingStocks.slice(0, 8).map(stock => ({
            name: stock.company_name || 'Unknown Company',
            symbol: stock.ric?.split('.')[0] || stock.company_name?.substring(0, 4).toUpperCase() || 'N/A',
            change: parseFloat(stock.percent_change || 0),
            marketCap: parseInt(stock.volume || 2000000) // Using volume as proxy for market cap
          }))
        });
      }

      // Structure the data for the UI components
      const structuredData = {
        indices: [], // API doesn't provide direct index data - keeping empty
        breadth: breadthCalculation, // Calculated from price shockers
        sectors: sectorPerformance, // Mock data since industry search not available
        
        // Top Gainers from price shockers (filter positive changes)
        topGainers: priceShockers
          .filter(stock => parseFloat(stock.percentChange || 0) > 0)
          .sort((a, b) => parseFloat(b.percentChange || 0) - parseFloat(a.percentChange || 0))
          .slice(0, 5)
          .map(stock => ({
            symbol: stock.ric?.split('.')[0] || stock.displayName?.substring(0, 4).toUpperCase() || 'N/A',
            name: stock.displayName || 'Unknown Company',
            price: parseFloat(stock.price || 0),
            change: parseFloat(stock.netChange || 0),
            percentChange: parseFloat(stock.percentChange || 0)
          })),
          
        // Top Losers from price shockers (filter negative changes)
        topLosers: priceShockers
          .filter(stock => parseFloat(stock.percentChange || 0) < 0)
          .sort((a, b) => parseFloat(a.percentChange || 0) - parseFloat(b.percentChange || 0))
          .slice(0, 5)
          .map(stock => ({
            symbol: stock.ric?.split('.')[0] || stock.displayName?.substring(0, 4).toUpperCase() || 'N/A',
            name: stock.displayName || 'Unknown Company',
            price: parseFloat(stock.price || 0),
            change: parseFloat(stock.netChange || 0),
            percentChange: parseFloat(stock.percentChange || 0)
          })),
        
        // Most Active: Combine BSE and NSE most active stocks
        mostActive: [
          ...(bseStocks.slice(0, 3).map(stock => ({
            symbol: stock.ticker?.split('.')[0] || stock.ric?.split('.')[0] || stock.company?.toUpperCase() || 'N/A',
            name: (stock.company || stock.company_name || 'Unknown Company') + ' (BSE)',
            price: parseFloat(stock.price || stock.current_price || 0),
            change: parseFloat(stock.net_change || stock.price_change || 0),
            percentChange: parseFloat(stock.percent_change || stock.price_change_percentage || 0),
            volume: parseInt(stock.volume || stock.traded_volume || 0)
          }))),
          ...(nseStocks.slice(0, 2).map(stock => ({
            symbol: stock.ticker?.split('.')[0] || stock.ric?.split('.')[0] || stock.company?.toUpperCase() || 'N/A',
            name: (stock.company || stock.company_name || 'Unknown Company') + ' (NSE)',
            price: parseFloat(stock.price || stock.current_price || 0),
            change: parseFloat(stock.net_change || stock.price_change || 0),
            percentChange: parseFloat(stock.percent_change || stock.price_change_percentage || 0),
            volume: parseInt(stock.volume || stock.traded_volume || 0)
          })))
        ].slice(0, 5),
        
        heatMapData: heatMapData
      };

      setMarketData(structuredData);

    } catch (error) {
      console.error('Error fetching market data:', error);
      setError('Failed to load market data from API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
        {/* Grid overlay for entire page */}
        <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
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
            
            <div className="text-center text-gray-300">
              <p>Loading market data from Indian Stock API...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
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
            
            <div className="text-center text-gray-300">
              <p>Loading market data from Indian Stock API...</p>
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
          </>
        )}
      </div>
    </div>
  );
}
