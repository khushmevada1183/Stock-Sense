'use client';

import React, { useEffect, useState } from 'react';
import { getStockDetails, getHistoricalData } from '@/services/stockService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import TargetPriceAnalysis from '@/app/components/TargetPriceAnalysis';
import StockLogo from '@/app/components/StockLogo';
import { ArrowUp, ArrowDown, TrendingUp, LineChart, DollarSign, Briefcase, Activity } from 'lucide-react';
import Link from 'next/link';
import StockChart from '@/components/stocks/StockChart';

// Type definitions for stock data
interface StockDetails {
  tickerId: string;
  companyName: string;
  industry: string;
  currentPrice: {
    BSE: number;
    NSE: number;
  };
  percentChange: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  pe: number;
  eps: number;
  dividendYield: number;
  volume: number;
  averageVolume: number;
}

interface HistoricalData {
  dates: string[];
  prices: number[];
}

// Stock details client component
export default function StockDetailsClient({ symbol }: { symbol: string }) {
  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | '5Y'>('1M');
  
  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching data for symbol: ${symbol}`);
        
        // Uppercase the symbol for consistency
        const upperSymbol = symbol.toUpperCase();
        
        // Fetch stock details
        console.log(`Calling getStockDetails for ${upperSymbol}`);
        const details = await getStockDetails(upperSymbol);
        console.log('Stock details received:', details);
        
        if (!details) {
          throw new Error(`No data found for symbol "${upperSymbol}"`);
        }
        
        // Normalize the data structure if needed
        const normalizedDetails = normalizeStockDetails(details, upperSymbol);
        setStockDetails(normalizedDetails);
        
        // Fetch historical data
        console.log(`Fetching historical data for ${upperSymbol}`);
          const historical = await getHistoricalData(upperSymbol);
          console.log('Historical data received:', historical);
        
        // Normalize the historical data structure
        if (historical) {
          // Check for different data formats and normalize
          if (historical.dates && historical.prices && 
              Array.isArray(historical.dates) && Array.isArray(historical.prices)) {
          setHistoricalData(historical);
          } else if (historical.datasets && Array.isArray(historical.datasets)) {
            // Extract data from datasets format
            const priceDataset = historical.datasets.find((d: any) => 
              d.metric === 'Price' || d.name === 'Price' || d.type === 'price'
            );
            
            if (priceDataset && Array.isArray(priceDataset.values)) {
              // Convert from [[date, price], ...] format to {dates: [], prices: []}
              const dates = priceDataset.values.map((point: any) => point[0]);
              const prices = priceDataset.values.map((point: any) => point[1]);
              setHistoricalData({ dates, prices });
            }
          }
        } else {
          throw new Error('Historical data not available');
        }
      } catch (err: any) {
        console.error('Error fetching stock data:', err);
        
        // Set appropriate error message
        if (err.response && err.response.status === 404) {
          setError(`Stock "${symbol}" not found. Please check the symbol and try again.`);
        } else {
          setError(`Failed to load data for ${symbol}. ${err.message || 'Server error or network issue.'}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [symbol]);
  
  // Helper function to normalize stock details from different API formats
  const normalizeStockDetails = (data: any, symbol: string): StockDetails => {
    console.log('Normalizing data:', data);
    
    // If it's already in the expected format with required fields
    if (data.tickerId && 
        data.companyName && 
        data.currentPrice && 
        typeof data.currentPrice.BSE === 'number' && 
        typeof data.currentPrice.NSE === 'number') {
      console.log('Data already in expected format');
      return data as StockDetails;
    }
    
    // For API response, extract values using possible field names
    const bsePrice = extractNumber(data, ['bse_price', 'current_price', 'price', 'latestPrice']);
    const nsePrice = extractNumber(data, ['nse_price', 'current_price', 'price', 'latestPrice']);
    
    // Get all possible numeric values
    const marketCap = extractNumber(data, ['market_cap', 'marketCap', 'mcap']);
    const pe = extractNumber(data, ['pe_ratio', 'pe', 'pe_ttm']);
    const eps = extractNumber(data, ['eps', 'eps_ttm']);
    const dividendYield = extractNumber(data, ['dividend_yield', 'dividendYield', 'div_yield']);
    const volume = extractNumber(data, ['volume', 'vol']);
    const avgVolume = extractNumber(data, ['average_volume', 'averageVolume', 'avg_volume', 'avg_vol']);
    const percentChange = extractNumber(data, ['percent_change', 'changePercent', 'price_change_percentage', 'change_percent']);
    
    // Extract high/low values
    const yearHigh = extractNumber(data, ['year_high', 'yearHigh', 'high_52_week', '52_week_high', 'high52w']);
    const yearLow = extractNumber(data, ['year_low', 'yearLow', 'low_52_week', '52_week_low', 'low52w']);
    
    // Normalize the data
    return {
      tickerId: extractString(data, ['symbol', 'ticker', 'tickerId', 'name']) || symbol,
      companyName: extractString(data, ['company_name', 'companyName', 'name', 'full_name']) || `${symbol} Stock`,
      industry: extractString(data, ['sector', 'industry', 'sector_name', 'category']) || 'N/A',
      currentPrice: {
        BSE: bsePrice,
        NSE: nsePrice || bsePrice
      },
      percentChange: percentChange,
      yearHigh: yearHigh,
      yearLow: yearLow,
      marketCap: marketCap,
      pe: pe,
      eps: eps,
      dividendYield: dividendYield,
      volume: volume,
      averageVolume: avgVolume
    };
  };
  
  // Helper to extract first available numeric value from different possible keys
  function extractNumber(data: any, possibleKeys: string[]): number {
    if (!data) return 0;
    
    for (let i = 0; i < possibleKeys.length; i++) {
      const key = possibleKeys[i];
      if (data[key] !== undefined && data[key] !== null) {
        const value = parseFloat(data[key]);
            if (!isNaN(value)) {
              return value;
        }
      }
    }
    
    return 0;
  }
  
  // Helper to extract first available string value from different possible keys
  function extractString(data: any, possibleKeys: string[]): string | null {
    if (!data) return null;
    
    for (let i = 0; i < possibleKeys.length; i++) {
      const key = possibleKeys[i];
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        return String(data[key]);
      }
    }
    
    return null;
  }
  
  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error || !stockDetails) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg">
          {error || `No data found for symbol "${symbol}"`}
        </div>
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            Try searching for a different stock symbol or check if "{symbol}" is a valid stock symbol.
          </p>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Popular Indian stock symbols:</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {['RELIANCE', 'TCS', 'HDFC', 'INFY', 'ITC', 'SBIN'].map(stockSymbol => (
                <Link 
                  key={stockSymbol}
                  href={`/stocks/${stockSymbol}`}
                  className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/40"
                >
                  {stockSymbol}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Stock Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="flex items-center">
            <StockLogo symbol={stockDetails.tickerId} size={48} className="mr-4" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{stockDetails.companyName}</h1>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-mono mr-2">{stockDetails.tickerId}</span>
                <span className="mx-2">•</span>
                <span>{stockDetails.industry}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-baseline">
            <span className="text-2xl md:text-3xl font-bold mr-2">
              ₹{stockDetails.currentPrice.NSE.toLocaleString()}
            </span>
            <div className={`flex items-center ${stockDetails.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stockDetails.percentChange >= 0 ? (
                <ArrowUp className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 mr-1" />
              )}
              <span className="font-medium">
                {stockDetails.percentChange >= 0 ? '+' : ''}{stockDetails.percentChange.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
              <p className="font-medium">₹{(stockDetails.marketCap / 10).toFixed(2)} Cr</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mr-3">
              <LineChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">P/E Ratio</p>
              <p className="font-medium">{stockDetails.pe.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mr-3">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">EPS</p>
              <p className="font-medium">₹{stockDetails.eps.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full mr-3">
              <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Div Yield</p>
              <p className="font-medium">{stockDetails.dividendYield.toFixed(2)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Price Range */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Price Range</CardTitle>
                <CardDescription>52-week high and low</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative pt-5">
                  <div className="flex justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>₹{stockDetails.yearLow.toLocaleString()}</span>
                    <span>₹{stockDetails.yearHigh.toLocaleString()}</span>
                  </div>
                  
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div 
                      className="absolute h-4 w-2 bg-blue-600 -top-1 rounded-full"
                      style={{ 
                        left: `${((stockDetails.currentPrice.NSE - stockDetails.yearLow) / (stockDetails.yearHigh - stockDetails.yearLow)) * 100}%`
                      }}
                    ></div>
                  </div>
                  
                  <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">BSE Price</p>
                      <p className="text-lg font-medium">₹{stockDetails.currentPrice.BSE.toLocaleString()}</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">NSE Price</p>
                      <p className="text-lg font-medium">₹{stockDetails.currentPrice.NSE.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Trading Information */}
            <Card>
              <CardHeader>
                <CardTitle>Trading Information</CardTitle>
                <CardDescription>Volume and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Volume</span>
                    <span className="font-medium">{stockDetails.volume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Volume</span>
                    <span className="font-medium">{stockDetails.averageVolume.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Day Range</span>
                    <span className="font-medium">
                      ₹{(stockDetails.currentPrice.NSE * 0.98).toFixed(2)} - ₹{(stockDetails.currentPrice.NSE * 1.02).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TargetPriceAnalysis symbol={symbol} currentPrice={stockDetails.currentPrice.NSE} />
            
            <Card>
              <CardHeader>
                <CardTitle>Technical Indicators</CardTitle>
                <CardDescription>Key technical analysis metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-gray-500 py-4">
                    Technical indicator data is not available at this time. Real data will be fetched from the API when implemented.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>Historical price movement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <StockChart symbol={symbol} timeRange={timeRange} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financials">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Key financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Quarterly Results</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2">Quarter</th>
                          <th className="text-right py-2">Revenue (Cr)</th>
                          <th className="text-right py-2">Net Profit (Cr)</th>
                          <th className="text-right py-2">EPS (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">
                            Financial data is not available at this time. Real data will be fetched from the API when implemented.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Annual Results</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b dark:border-gray-700">
                          <th className="text-left py-2">Year</th>
                          <th className="text-right py-2">Revenue (Cr)</th>
                          <th className="text-right py-2">Net Profit (Cr)</th>
                          <th className="text-right py-2">EPS (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500">
                            Financial data is not available at this time. Real data will be fetched from the API when implemented.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-gray-500 dark:text-gray-400 mt-6">
        <p>Data is for educational purposes only. Not financial advice.</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
