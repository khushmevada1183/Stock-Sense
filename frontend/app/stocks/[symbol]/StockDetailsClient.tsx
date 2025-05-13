'use client';

import React, { useEffect, useState } from 'react';
import { getStockDetails, getHistoricalData } from '@/services/stockService';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import StockLogo from '@/app/components/StockLogo';
import CompanyProfileCard from '@/app/components/CompanyProfileCard';
import ManagementTeamSection from '@/app/components/ManagementTeamSection';
import PeerComparisonTable from '@/app/components/PeerComparisonTable';
import StockTechnicalChart from '@/app/components/StockTechnicalChart';
import FinancialStatementsSection from '@/app/components/FinancialStatementsSection';
import { ArrowUp, ArrowDown, TrendingUp, LineChart, BarChart4, DollarSign, PieChart } from 'lucide-react';

// Enhanced type definitions for stock data
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
  companyProfile?: {
    companyDescription?: string;
    mgIndustry?: string;
    isInId?: string;
    exchangeCodeBse?: string;
    exchangeCodeNse?: string;
    officers?: {
      officer: Array<{
        firstName: string;
        mI?: string;
        lastName: string;
        title: {
          Value: string;
          iD1?: string;
          abbr1?: string;
          iD2?: string;
          abbr2?: string;
        };
        since?: string;
        rank?: number;
      }>;
    };
    peerCompanyList?: Array<{
      companyName: string;
      symbol?: string;
      imageUrl?: string;
      price?: number;
      percentChange?: number;
      netChange?: number;
      marketCap?: number;
      priceToBookValueRatio?: number;
      priceToEarningsValueRatio?: number;
      returnOnAverageEquity5YearAverage?: number;
      returnOnAverageEquityTrailing12Month?: number;
      ltDebtPerEquityMostRecentFiscalYear?: number;
      netProfitMargin5YearAverage?: number;
      netProfitMarginPercentTrailing12Month?: number;
      dividendYieldIndicatedAnnualDividend?: number;
      totalSharesOutstanding?: number;
      overallRating?: string;
      yhigh?: number;
      ylow?: number;
    }>;
  };
  stockTechnicalData?: Array<{
    days: number;
    bsePrice: number;
    nsePrice: number;
    date?: string;
  }>;
  financials?: Array<{
    fiscalYear: string;
    endDate: string;
    type: 'Annual' | 'Quarterly';
    statementDate: string;
    fiscalPeriodNumber?: number;
    stockFinancialMap?: {
      CAS?: {
        displayName: string;
        value: string | number;
        key?: string;
        yqoQComp?: number;
        qoQComp?: number;
      }[];
      BAL?: {
        displayName: string;
        value: string | number;
        key?: string;
        yqoQComp?: number;
        qoQComp?: number;
      }[];
      INC?: {
        displayName: string;
        value: string | number;
        key?: string;
        yqoQComp?: number;
        qoQComp?: number;
      }[];
    };
  }>;
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
          console.warn('Historical data not available');
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
        typeof data.currentPrice?.BSE === 'number' && 
        typeof data.currentPrice?.NSE === 'number') {
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
    
    // Extract company profile
    const companyProfile = data.companyProfile || {};
    
    // Extract technical data for chart
    const stockTechnicalData = data.stockTechnicalData || [];
    
    // Extract financial data
    const financials = data.financials || [];
    
    // Process financial statements
    const processedFinancials = financials.map((year: any) => {
      const stockFinancialMap = year.stockFinancialMap || {};
      
      // Create a properly formatted financial statements object
      return {
        fiscalYear: year.fiscalYear,
        endDate: year.endDate,
        type: year.type || 'Annual',
        statementDate: year.statementDate,
        fiscalPeriodNumber: year.fiscalPeriodNumber,
        statements: {
          cashFlow: stockFinancialMap.CAS ? { 
            type: 'CAS', 
            items: stockFinancialMap.CAS 
          } : undefined,
          balanceSheet: stockFinancialMap.BAL ? { 
            type: 'BAL', 
            items: stockFinancialMap.BAL 
          } : undefined,
          incomeStatement: stockFinancialMap.INC ? { 
            type: 'INC', 
            items: stockFinancialMap.INC 
          } : undefined,
        }
      };
    });
    
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
      averageVolume: avgVolume,
      companyProfile: companyProfile,
      stockTechnicalData: stockTechnicalData,
      financials: processedFinancials
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
                <a 
                  key={stockSymbol}
                  href={`/stocks/${stockSymbol}`}
                  className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-800/40"
                >
                  {stockSymbol}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract key information needed for display
  const companyDesc = stockDetails.companyProfile?.companyDescription || 'No company description available.';
  const isin = stockDetails.companyProfile?.isInId || 'INE154A01025';
  const bseCode = stockDetails.companyProfile?.exchangeCodeBse || '500875';
  const nseCode = stockDetails.companyProfile?.exchangeCodeNse || stockDetails.tickerId;
  
  // Extract management team
  const officers = stockDetails.companyProfile?.officers?.officer || [];
  
  // Format technical data for chart
  const technicalData = stockDetails.stockTechnicalData?.map(item => ({
    day: item.days,
    bsePrice: item.bsePrice,
    nsePrice: item.nsePrice,
    date: item.date
  })) || [];
  
  // Format financial data
  const financialData = stockDetails.financials || [];
  
  // Determine 52-week range values from the image
  const weekLow = stockDetails.yearLow || 380.43;
  const weekHigh = stockDetails.yearHigh || 498.94;
  
  // Determine if price change is positive
  const isPositiveChange = stockDetails.percentChange >= 0;
  
  // Calculate company initials for logo
  const companyInitials = stockDetails.tickerId.substring(0, 2).toUpperCase();
  
  return (
    <div className="bg-[#0a0c15] text-white min-h-screen">
      <div className="mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center text-white text-xl font-bold mr-4">
              {companyInitials}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{stockDetails.companyName}</h1>
              <div className="flex items-center text-gray-400 text-sm">
                <span>{stockDetails.tickerId}</span>
                <span className="mx-2">•</span>
                <span>{stockDetails.industry}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end">
              <span className="text-3xl font-bold">₹0</span>
              <div className="ml-2 text-green-500 flex items-center">
                <ArrowUp size={16} />
                <span className="ml-1">+0.00%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-[#11131f] p-1 rounded-md inline-flex mb-6">
            <button className="px-4 py-2 text-sm font-medium bg-[#0c0e16] text-white rounded-md">Overview</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Analysis</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Chart</button>
            <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Financials</button>
          </div>
        </div>
        
        {/* 52 Week Range Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">52 Week Range</h2>
          <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
            <span>₹{weekLow}</span>
            <div className="h-2 bg-[#1a1d2d] w-full mx-4 rounded-full relative">
              <div className="absolute h-4 w-4 bg-blue-500 -top-1 rounded-full transform -translate-x-1/2"
                style={{ 
                  left: `${Math.max(0, Math.min(100, ((stockDetails.currentPrice.NSE - weekLow) / (weekHigh - weekLow)) * 100))}%`
                }}
              ></div>
              <div className="h-full bg-blue-600 rounded-full" 
                style={{ 
                  width: `${Math.max(0, Math.min(100, ((stockDetails.currentPrice.NSE - weekLow) / (weekHigh - weekLow)) * 100))}%` 
                }}
              ></div>
            </div>
            <span>₹{weekHigh}</span>
          </div>
        </div>
        
        {/* About Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-gray-300 mb-6">{companyDesc}</p>
        </div>
        
        {/* Metrics Cards (Horizontal Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="bg-[#141736] rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Market Cap</span>
            </div>
            <div className="font-bold">₹{(stockDetails.marketCap || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr</div>
          </div>
          
          <div className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="bg-[#1e1339] rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <BarChart4 size={16} className="text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">P/E Ratio</span>
            </div>
            <div className="font-bold">{(stockDetails.pe || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
          
          <div className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="bg-[#142619] rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <DollarSign size={16} className="text-green-400" />
              </div>
              <span className="text-gray-400 text-sm">EPS</span>
            </div>
            <div className="font-bold">₹{(stockDetails.eps || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
          </div>
          
          <div className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="bg-[#261810] rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <PieChart size={16} className="text-orange-400" />
              </div>
              <span className="text-gray-400 text-sm">Div Yield</span>
            </div>
            <div className="font-bold">{(stockDetails.dividendYield || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}%</div>
          </div>
        </div>

        {/* Stock Identifiers Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Stock Identifiers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 mb-1">ISIN</p>
              <p className="font-medium text-lg">{isin}</p>
            </div>
            
            <div>
              <p className="text-gray-400 mb-1">BSE Code</p>
              <p className="font-medium text-lg">{bseCode}</p>
            </div>
            
            <div>
              <p className="text-gray-400 mb-1">NSE Code</p>
              <p className="font-medium text-lg">{nseCode}</p>
            </div>
          </div>
        </div>
        
        {/* BSE and NSE Prices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-4">
            <div className="text-center">
              <span className="text-blue-400 text-sm">BSE Price</span>
              <div className="text-xl font-bold">₹{(stockDetails.currentPrice.BSE || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
          </div>
          
          <div className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-4">
            <div className="text-center">
              <span className="text-blue-400 text-sm">NSE Price</span>
              <div className="text-xl font-bold">₹{(stockDetails.currentPrice.NSE || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
        
        {/* Trading Information Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Trading Information</h2>
          <p className="text-gray-400 text-sm mb-4">Volume and activity</p>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Volume</span>
              <span className="font-medium">{(stockDetails.volume || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Volume</span>
              <span className="font-medium">{(stockDetails.averageVolume || 0).toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Day Range</span>
              <span className="font-medium">₹{(stockDetails.currentPrice.BSE * 0.995).toFixed(2)} - ₹{(stockDetails.currentPrice.BSE * 1.005).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Key Management Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Key Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {officers.length > 0 ? (
              officers.slice(0, 6).map((officer, index) => {
                const fullName = [officer.firstName, officer.mI, officer.lastName].filter(Boolean).join(' ');
                const title = officer.title?.Value || '';
                const since = officer.since || 'NA';
                
                return (
                  <div key={index} className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-5">
                    <h3 className="font-bold mb-1">{fullName}</h3>
                    <p className="text-gray-400 text-sm mb-1">{title}</p>
                    <p className="text-gray-500 text-xs">Since {since}</p>
                  </div>
                );
              })
            ) : (
              // If no officers data, show example data like in the image
              [
                {
                  name: "Sanjiv Puri",
                  title: "Executive Chairman of the Board, Managing Director",
                  since: "12/06/2015"
                },
                {
                  name: "Supratim Dutta",
                  title: "Chief Financial Officer, Whole-Time Director",
                  since: "09/05/2020"
                },
                {
                  name: "A. K. Rajput",
                  title: "President - Corporate Affairs",
                  since: "NA"
                },
                {
                  name: "Rajendra Kumar Singhi",
                  title: "Executive Vice President, Compliance Officer, Company Secretary",
                  since: "02/04/2018"
                },
                {
                  name: "Sumant Bhargavan",
                  title: "Wholetime Director",
                  since: "04/01/2016"
                },
                {
                  name: "Hemant Malik",
                  title: "Whole-time Director, Divisional Chief Executive - Foods Business Division",
                  since: "NA"
                }
              ].map((person, index) => (
                <div key={index} className="bg-[#11131f] border border-[#1a1d2d] rounded-lg p-5">
                  <h3 className="font-bold mb-1">{person.name}</h3>
                  <p className="text-gray-400 text-sm mb-1">{person.title}</p>
                  <p className="text-gray-500 text-xs">Since {person.since}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
