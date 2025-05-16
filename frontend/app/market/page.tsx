"use client";

import React, { useState, useEffect, useRef } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { format } from 'date-fns';
import indianApiService from '../../services/indianApiService';
import { useAnimation } from '@/animations/shared/AnimationContext';
import { initMarketPageAnimations } from '@/animations/pages/marketAnimations';

/**
 * Mock data for market dashboard
 */
const mockMarketData = {
  indices: [
    { name: "NIFTY 50", current: 22356.30, change: 203.25, percentChange: 0.92, color: "#22c55e" },
    { name: "SENSEX", current: 73667.76, change: 612.21, percentChange: 0.84, color: "#22c55e" },
    { name: "NIFTY BANK", current: 47892.35, change: 522.60, percentChange: 1.10, color: "#22c55e" },
    { name: "NIFTY IT", current: 34562.15, change: -126.45, percentChange: -0.36, color: "#ef4444" },
    { name: "NIFTY METAL", current: 8654.20, change: 98.70, percentChange: 1.15, color: "#22c55e" },
    { name: "NIFTY PHARMA", current: 18642.80, change: -75.30, percentChange: -0.40, color: "#ef4444" }
  ],
  
  breadth: {
    advances: 1845,
    declines: 1623,
    unchanged: 176
  },
  
  sectors: [
    { name: "Metal", change: 2.14 },
    { name: "Realty", change: 1.76 },
    { name: "PSU Bank", change: 1.62 },
    { name: "Auto", change: 1.35 },
    { name: "Bank", change: 1.10 },
    { name: "Finance", change: 0.87 },
    { name: "FMCG", change: 0.32 },
    { name: "Media", change: -0.11 },
    { name: "Pharma", change: -0.40 },
    { name: "IT", change: -0.36 }
  ],
  
  topGainers: [
    { symbol: "TATASTEEL", name: "Tata Steel Ltd.", price: 145.30, change: 9.25, percentChange: 6.8 },
    { symbol: "HINDPETRO", name: "Hindustan Petroleum Corporation Ltd.", price: 478.55, change: 26.30, percentChange: 5.81 },
    { symbol: "M&M", name: "Mahindra & Mahindra Ltd.", price: 2132.85, change: 99.65, percentChange: 4.9 },
    { symbol: "ADANIPORTS", name: "Adani Ports and Special Economic Zone Ltd.", price: 1290.60, change: 53.20, percentChange: 4.3 },
    { symbol: "SBIN", name: "State Bank of India", price: 782.40, change: 26.80, percentChange: 3.55 }
  ],
  
  topLosers: [
    { symbol: "WIPRO", name: "Wipro Ltd.", price: 452.65, change: -22.30, percentChange: -4.69 },
    { symbol: "HCLTECH", name: "HCL Technologies Ltd.", price: 1342.10, change: -48.75, percentChange: -3.51 },
    { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd.", price: 1187.45, change: -36.30, percentChange: -2.97 },
    { symbol: "TCS", name: "Tata Consultancy Services Ltd.", price: 3679.90, change: -94.20, percentChange: -2.5 },
    { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories Ltd.", price: 5642.35, change: -135.65, percentChange: -2.35 }
  ],
  
  mostActive: [
    { symbol: "RELIANCE", name: "Reliance Industries Ltd.", price: 2853.75, change: 32.45, percentChange: 1.15, volume: 15890000 },
    { symbol: "HDFC", name: "Housing Development Finance Corporation Ltd.", price: 3126.90, change: 18.20, percentChange: 0.59, volume: 9540000 },
    { symbol: "TATASTEEL", name: "Tata Steel Ltd.", price: 145.30, change: 9.25, percentChange: 6.8, volume: 8760000 },
    { symbol: "SBIN", name: "State Bank of India", price: 782.40, change: 26.80, percentChange: 3.55, volume: 7230000 },
    { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", price: 1085.70, change: 12.35, percentChange: 1.15, volume: 6850000 }
  ],
  
  heatMap: [
    {
      sector: "Banking & Finance",
      stocks: [
        { symbol: "HDFC", name: "Housing Development Finance Corporation Ltd.", change: 0.59, marketCap: 125000 },
        { symbol: "SBIN", name: "State Bank of India", change: 3.55, marketCap: 85000 },
        { symbol: "ICICIBANK", name: "ICICI Bank Ltd.", change: 1.15, marketCap: 95000 },
        { symbol: "AXISBANK", name: "Axis Bank Ltd.", change: 1.82, marketCap: 65000 },
        { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd.", change: -0.72, marketCap: 45000 },
        { symbol: "HDFCBANK", name: "HDFC Bank Ltd.", change: 0.85, marketCap: 115000 }
      ]
    },
    {
      sector: "IT & Technology",
      stocks: [
        { symbol: "TCS", name: "Tata Consultancy Services Ltd.", change: -2.5, marketCap: 105000 },
        { symbol: "INFY", name: "Infosys Ltd.", change: -1.8, marketCap: 89000 },
        { symbol: "WIPRO", name: "Wipro Ltd.", change: -4.69, marketCap: 42000 },
        { symbol: "HCLTECH", name: "HCL Technologies Ltd.", change: -3.51, marketCap: 38000 },
        { symbol: "TECHM", name: "Tech Mahindra Ltd.", change: -1.2, marketCap: 25000 }
      ]
    },
    {
      sector: "Energy & Metals",
      stocks: [
        { symbol: "RELIANCE", name: "Reliance Industries Ltd.", change: 1.15, marketCap: 145000 },
        { symbol: "ONGC", name: "Oil and Natural Gas Corporation Ltd.", change: 2.3, marketCap: 35000 },
        { symbol: "TATASTEEL", name: "Tata Steel Ltd.", change: 6.8, marketCap: 28000 },
        { symbol: "HINDPETRO", name: "Hindustan Petroleum Corporation Ltd.", change: 5.81, marketCap: 18000 },
        { symbol: "COALINDIA", name: "Coal India Ltd.", change: 3.2, marketCap: 22000 },
        { symbol: "JSWSTEEL", name: "JSW Steel Ltd.", change: 4.1, marketCap: 19000 }
      ]
    }
  ]
};

/**
 * Market Indices Component
 */
interface Index {
  name: string;
  current: number;
  change: number;
  percentChange: number;
  color: string;
}

interface MarketIndicesProps {
  data: Index[];
}

const MarketIndices = ({ data }: MarketIndicesProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
        {data.map((index, idx) => (
          <div key={idx} className={`px-4 py-5 ${idx !== data.length - 1 ? 'border-r border-gray-100 dark:border-gray-700' : ''}`}>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{index.name}</div>
            <div className="font-semibold text-xl mb-1 dark:text-gray-200">{index.current.toLocaleString()}</div>
            <div className={`flex items-center text-sm ${index.change >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {index.change >= 0 ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              <span>{index.change.toFixed(2)}</span>
              <span className="ml-1">({index.percentChange.toFixed(2)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Sector Performance Component
 */
interface Sector {
  name: string;
  change: number;
}

interface SectorPerformanceProps {
  data: Sector[];
}

const SectorPerformance = ({ data }: SectorPerformanceProps) => {
  const sortedData = [...data].sort((a, b) => b.change - a.change);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-sm text-gray-800 dark:text-gray-200">{`${payload[0].payload.name}: ${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Sector Performance</h3>
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
              tick={{ fontSize: 12 }}
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

/**
 * Market Breadth Component
 */
interface BreadthData {
  advances: number;
  declines: number;
  unchanged: number;
}

interface MarketBreadthProps {
  data: BreadthData;
}

const MarketBreadth = ({ data }: MarketBreadthProps) => {
  const { advances, declines, unchanged } = data;
  const total = advances + declines + unchanged;
  
  const chartData = [
    { name: 'Advances', value: advances, color: '#22c55e' },
    { name: 'Declines', value: declines, color: '#ef4444' },
    { name: 'Unchanged', value: unchanged, color: '#9ca3af' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Market Breadth</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-green-600 dark:text-green-500 text-lg font-semibold">{advances}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Advances</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">({((advances / total) * 100).toFixed(1)}%)</div>
        </div>
        <div className="text-center">
          <div className="text-red-600 dark:text-red-500 text-lg font-semibold">{declines}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Declines</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">({((declines / total) * 100).toFixed(1)}%)</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-400 text-lg font-semibold">{unchanged}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Unchanged</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">({((unchanged / total) * 100).toFixed(1)}%)</div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/**
 * Top Movers Component
 */
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
}

interface TopMoversProps {
  gainers: Stock[];
  losers: Stock[];
}

const TopMovers = ({ gainers, losers }: TopMoversProps) => {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === 'gainers'
              ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('gainers')}
        >
          Top Gainers
        </button>
        <button
          className={`pb-2 px-4 font-medium ${
            activeTab === 'losers'
              ? 'text-red-600 dark:text-red-500 border-b-2 border-red-600 dark:border-red-500'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('losers')}
        >
          Top Losers
        </button>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="pb-2 text-left">Stock</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'gainers' ? gainers : losers).map((stock, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="py-3">
                  <div className="font-medium text-gray-800 dark:text-gray-200">{stock.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{stock.name}</div>
                </td>
                <td className="py-3 text-right">
                  <div className="font-medium text-gray-800 dark:text-gray-200">₹{stock.price.toLocaleString()}</div>
                </td>
                <td className="py-3 text-right">
                  <div className={`flex items-center justify-end ${activeTab === 'gainers' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {activeTab === 'gainers' ? (
                      <TrendingUp size={15} className="mr-1" />
                    ) : (
                      <TrendingDown size={15} className="mr-1" />
                    )}
                    <div>
                      <div>{Math.abs(stock.percentChange).toFixed(2)}%</div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Most Active Component
 */
interface StockWithVolume extends Stock {
  volume: number;
}

interface MostActiveProps {
  data: StockWithVolume[];
}

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + ' Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(2) + ' L';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + ' K';
  }
  return num.toString();
};

const MostActive = ({ data }: MostActiveProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-full">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Most Active</h3>
      
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              <th className="pb-2 text-left">Stock</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Chg%</th>
              <th className="pb-2 text-right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {data.map((stock, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <td className="py-3">
                  <div className="font-medium text-gray-800 dark:text-gray-200">{stock.symbol}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{stock.name}</div>
                </td>
                <td className="py-3 text-right">
                  <div className="font-medium text-gray-800 dark:text-gray-200">₹{stock.price.toLocaleString()}</div>
                </td>
                <td className="py-3 text-right">
                  <div className={`flex items-center justify-end ${stock.change >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {stock.change >= 0 ? (
                      <TrendingUp size={15} className="mr-1" />
                    ) : (
                      <TrendingDown size={15} className="mr-1" />
                    )}
                    <span>{Math.abs(stock.percentChange).toFixed(2)}%</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <div className="text-gray-700 dark:text-gray-300">{formatNumber(stock.volume)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Heat Map Component
 */
interface HeatMapItem {
  sector: string;
  stocks: {
    name: string;
    symbol: string;
    change: number;
    marketCap: number;
  }[];
}

interface HeatMapProps {
  data: HeatMapItem[];
}

const HeatMap = ({ data }: HeatMapProps) => {
  const getColorIntensity = (change: number): string => {
    if (change > 0) {
      if (change > 5) return 'bg-green-600 dark:bg-green-600';
      if (change > 3) return 'bg-green-500 dark:bg-green-500';
      if (change > 1) return 'bg-green-400 dark:bg-green-400';
      return 'bg-green-300 dark:bg-green-400/70';
    } else {
      if (change < -5) return 'bg-red-600 dark:bg-red-600';
      if (change < -3) return 'bg-red-500 dark:bg-red-500';
      if (change < -1) return 'bg-red-400 dark:bg-red-400';
      return 'bg-red-300 dark:bg-red-400/70';
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Market Heat Map</h3>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-600 mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">&gt;5%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-400 mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">1-5%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-400 mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">-1 to -5%</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600 mr-1"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">&lt;-5%</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {data.map((sector, idx) => (
            <div key={idx} className="mb-6">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">{sector.sector}</h4>
              <div className="flex flex-wrap gap-2">
                {sector.stocks.map((stock, stockIdx) => (
                  <div 
                    key={stockIdx}
                    className={`${getColorIntensity(stock.change)} ${getBlockSize(stock.marketCap)} rounded flex flex-col justify-center items-center p-1 text-white`}
                  >
                    <div className="text-xs font-medium truncate w-full text-center">{stock.symbol}</div>
                    <div className="text-xs">{stock.change > 0 ? '+' : ''}{stock.change.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Market Page component
 */
export default function MarketPage() {
  const [marketData, setMarketData] = useState(mockMarketData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Animation refs
  const headerRef = useRef<HTMLDivElement>(null);
  const indicesRef = useRef<HTMLDivElement>(null);
  const sectorRef = useRef<HTMLDivElement>(null);
  const breadthRef = useRef<HTMLDivElement>(null);
  const moversRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const heatMapRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  
  // Get animation context
  const { isAnimationEnabled } = useAnimation();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real market data
      const data = await indianApiService.getMarketOverview();
      
      if (data && Object.keys(data).length > 0) {
        setMarketData(data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data. Using fallback data instead.');
      // Use mock data as fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);
  
  // Initialize animations when data is loaded
  useEffect(() => {
    if (!loading && isAnimationEnabled) {
      const refs = {
        headerRef,
        indicesRef,
        sectorRef,
        breadthRef,
        moversRef,
        activeRef,
        heatMapRef,
        analysisRef
      };
      
      initMarketPageAnimations(refs);
    }
  }, [loading, isAnimationEnabled]);

  const currentDate = format(new Date(), 'dd MMM yyyy');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div ref={headerRef} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Indian Market Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time overview of the Indian stock market and its key indicators
        </p>
      </div>
      
      {/* Market Indices */}
      <div ref={indicesRef} className="mb-8">
        <MarketIndices data={marketData.indices} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Sector Performance */}
        <div ref={sectorRef}>
          <SectorPerformance data={marketData.sectors} />
        </div>
        
        {/* Market Breadth */}
        <div ref={breadthRef}>
          <MarketBreadth data={marketData.breadth} />
        </div>
      </div>
      
      {/* Top Movers */}
      <div ref={moversRef} className="mb-8">
        <TopMovers gainers={marketData.topGainers} losers={marketData.topLosers} />
      </div>
      
      {/* Most Active Stocks */}
      <div ref={activeRef} className="mb-8">
        <MostActive data={marketData.mostActive} />
      </div>
      
      {/* Heat Map */}
      <div ref={heatMapRef} className="mb-8">
        <HeatMap data={marketData.heatMap} />
      </div>
      
      {/* Market Analysis */}
      <div ref={analysisRef} className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Market Analysis</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-3">
            Market remained buoyant today with broad-based buying interest across sectors.
            Banking and metal stocks led the rally, while IT and pharma sectors witnessed
            profit booking. Global cues were positive as US markets closed higher.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            FIIs were net buyers today, injecting ₹1,200 crores, while DIIs bought
            stocks worth ₹850 crores. Market breadth was positive with more advances
            than declines, indicating healthy market sentiment.
          </p>
        </div>
      </div>
    </div>
  );
} 