"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { gsap } from 'gsap';
import { Chart, registerables } from 'chart.js';
import { 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  LineChart, 
  BarChart4, 
  Scale,
  Percent,
  Info,
  Building,
  Users,
  Tag
} from 'lucide-react';
import { apiHelpers } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FinancialStatements from '@/components/stocks/FinancialStatements';
import StockNewsSection from '@/components/stocks/StockNewsSection';
import FinancialHighlights from '@/components/stocks/FinancialHighlights';
import ManagementInfo from '@/components/stocks/ManagementInfo';

// Register Chart.js components
Chart.register(...registerables);

type MetricCardProps = {
  title: string;
        value: string | number;
  change?: string | number;
  isPositive?: boolean;
  icon: React.ReactNode;
  isAnimated?: boolean;
  delay?: number;
};

// Reusable Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, change, isPositive, icon, isAnimated = true, delay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAnimated && cardRef.current) {
      gsap.from(cardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: delay,
        ease: "power3.out"
      });
    }
  }, [isAnimated, delay]);

  return (
    <div ref={cardRef} className="metric-card bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:bg-gray-700/50 transition-colors">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-gray-400 font-medium text-sm">{title}</h3>
          <div className={`p-2 rounded-lg ${
            typeof isPositive === 'boolean' 
              ? isPositive 
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
              : 'bg-indigo-500/20 text-indigo-400'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex flex-col">
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`flex items-center mt-1 text-sm ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}>
              {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              <span>{change}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function StockDetailsClient() {
  const params = useParams();
  const symbol = params?.symbol as string || '';

  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for animations and charts
  const headerRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const sectorDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  
  // Refs to store chart instances
  const sectorChartInstanceRef = useRef<Chart | null>(null);
  const performanceChartInstanceRef = useRef<Chart | null>(null);
  
  // Cleanup function for charts
  const cleanupCharts = () => {
    // Destroy previous chart instances if they exist
    if (sectorChartInstanceRef.current) {
      sectorChartInstanceRef.current.destroy();
      sectorChartInstanceRef.current = null;
    }
    
    if (performanceChartInstanceRef.current) {
      performanceChartInstanceRef.current.destroy();
      performanceChartInstanceRef.current = null;
    }
  };
  
  // Cleanup charts on component unmount
  useEffect(() => {
    return () => {
      cleanupCharts();
    };
  }, []);
  
  useEffect(() => {
    if (!symbol) {
      setError('No symbol provided');
      setLoading(false);
      return;
    }

    // Clean up any existing charts when the symbol changes
    cleanupCharts();

    // Function to fetch stock data using our improved apiHelpers
    const fetchStockData = async () => {
      try {
        setLoading(true);
        console.log(`Fetching stock data for symbol: ${symbol}`);
        
        // Use the robust apiHelpers which will try multiple endpoints and formats
        const data = await apiHelpers.getStockDetails(symbol);
        
        if (data) {
          console.log('Stock data received:', data);
          setStockData(data);
        } else {
          setError(`No data found for "${symbol}". Please check the stock name or symbol and try again.`);
        }
      } catch (err: any) {
        console.error('Error fetching stock data:', err);
        setError(
          err.response?.status === 404
            ? `Stock "${symbol}" not found. Please check the name or symbol and try again.`
            : `Failed to fetch stock data: ${err.message || 'Unknown error'}. Please try again.`
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
  }, [symbol]);
  
  // Initialize animations after data is loaded
  useEffect(() => {
    if (!loading && stockData && !error) {
      const timeline = gsap.timeline();
      
      // Animate header
      if (headerRef.current) {
        timeline.from(headerRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        });
      }
      
      // Animate price card
      if (priceRef.current) {
        timeline.from(priceRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.3");
      }
      
      // Animate range slider
      if (rangeRef.current) {
        const rangeSlider = rangeRef.current.querySelector('.range-slider');
        const rangeDot = rangeRef.current.querySelector('.range-dot');
        
        timeline.from(rangeRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.4");
        
        if (rangeSlider) {
          timeline.from(rangeSlider, {
            width: 0,
            duration: 0.8,
            ease: "power3.inOut"
          }, "-=0.3");
        }
        
        if (rangeDot) {
          timeline.from(rangeDot, {
            scale: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
          }, "-=0.4");
        }
      }
      
      // Animate about section
      if (aboutRef.current) {
        timeline.from(aboutRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.3");
      }
      
      // Initialize charts with animations
      setTimeout(() => {
        initializeCharts();
      }, 100);
    }
  }, [loading, stockData, error]);
  
  // Initialize the charts
  const initializeCharts = () => {
    // Only proceed if we have data and chart refs
    if (!stockData) return;
    
    // Clean up any existing charts first
    cleanupCharts();
    
    setTimeout(() => {
      // First, make sure the canvas elements exist and are accessible
      if (!sectorDistributionChartRef.current || !performanceChartRef.current) {
        console.log('Canvas elements not available yet');
        return;
      }
      
      // Create dummy sector distribution data (replace with real data when available)
      const sectorCtx = sectorDistributionChartRef.current.getContext('2d');
      if (sectorCtx) {
        try {
          const industry = stockData.industry || stockData.sector || '';
          
          // Sector distribution (dummy data - replace with real data)
          const sectorData = {
            labels: ['Financial Services', 'IT & Technology', 'Oil & Gas', 'Pharmaceuticals', 'FMCG', industry],
            datasets: [{
              data: [26.5, 22.3, 15.8, 12.9, 10.5, 8.7],
              backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(34, 211, 238, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
              ],
              borderWidth: 0
            }]
          };
          
          // Create and store the chart instance
          sectorChartInstanceRef.current = new Chart(sectorCtx, {
            type: 'doughnut',
            data: sectorData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              cutout: '70%',
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw}%`
                  }
                }
              },
              animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1500,
                easing: 'easeOutQuart'
              }
            }
          });
        } catch (error) {
          console.error('Error creating sector chart:', error);
        }
      }
      
      // Performance over time chart (dummy data - replace with real data)
      const performanceCtx = performanceChartRef.current.getContext('2d');
      if (performanceCtx) {
        try {
          // Create gradient
          const gradient = performanceCtx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          
          // Extract price from stock data (use price field or fallback to current_price)
          const price = extractPrice();
          const priceFloat = parseFloat(price.toString().replace(/[₹,]/g, '')) || 100;
          
          // Generate sample data points around the current price
          const lastMonthData = Array.from({ length: 30 }, (_, i) => {
            const variation = (Math.random() - 0.5) * 20;  // Random variation ±10%
            return priceFloat * (1 + variation / 100); // Current price with variation
          });
          
          const timeLabels = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (30 - i - 1));
            return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          });
          
          // Create and store the chart instance
          performanceChartInstanceRef.current = new Chart(performanceCtx, {
            type: 'line',
            data: {
              labels: timeLabels,
              datasets: [{
                label: 'Price (₹)',
                data: lastMonthData,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: gradient,
                tension: 0.3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgb(129, 140, 248)'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                x: {
                  grid: {
                    color: 'rgba(75, 85, 99, 0.1)'
                  },
                  ticks: {
                    maxTicksLimit: 6,
                    color: 'rgba(156, 163, 175, 0.8)'
                  }
                },
                y: {
                  grid: {
                    color: 'rgba(75, 85, 99, 0.1)'
                  },
                  ticks: {
                    callback: (value) => `₹${value.toLocaleString()}`,
                    color: 'rgba(156, 163, 175, 0.8)'
                  }
                }
              },
              animation: {
                duration: 2000,
                easing: 'easeOutQuart'
              }
            }
          });
        } catch (error) {
          console.error('Error creating performance chart:', error);
        }
      }
    }, 300); // Slightly longer delay to ensure DOM is ready
  };
  
  // Helper function to extract price
  const extractPrice = () => {
    if (!stockData) return 'N/A';
    
    // Try all possible price fields
    if (stockData.latestPrice) return stockData.latestPrice;
    if (stockData.price) return stockData.price;
    if (stockData.current_price) return stockData.current_price;
    if (stockData.currentPrice?.BSE) return stockData.currentPrice.BSE;
    if (stockData.currentPrice?.NSE) return stockData.currentPrice.NSE;
    if (stockData.stockTechnicalData?.[0]?.bsePrice) return stockData.stockTechnicalData[0].bsePrice;
    
    return 'N/A';
  };

  // Helper function to extract and format market cap
  const extractMarketCap = () => {
    if (!stockData) return 'N/A';
    
    let marketCap = stockData.marketCap || stockData.market_cap;
    
    // Try to extract from nested objects if direct property doesn't exist
    if (!marketCap && stockData.stockTechnicalData && stockData.stockTechnicalData.length > 0) {
      marketCap = stockData.stockTechnicalData[0].marketCap || stockData.stockTechnicalData[0].market_cap;
    }
    
    if (!marketCap && stockData.companyProfile) {
      marketCap = stockData.companyProfile.marketCap || stockData.companyProfile.market_cap;
    }
    
    // Format the market cap
    if (marketCap) {
      // If it's already a string with formatting
      if (typeof marketCap === 'string') {
        return marketCap.startsWith('₹') ? marketCap : `₹${marketCap}`;
      }
      
      // If it's a number, format it
      if (typeof marketCap === 'number') {
        // Format large numbers in crores/lakhs
        if (marketCap >= 10000000) {
          return `₹${(marketCap / 10000000).toFixed(2)} Cr`;
        } else if (marketCap >= 100000) {
          return `₹${(marketCap / 100000).toFixed(2)} L`;
        } else {
          return `₹${marketCap.toLocaleString()}`;
        }
      }
    }
    
    return 'N/A';
  };
  
  // Helper function to extract PE ratio
  const extractPE = () => {
    if (!stockData) return 'N/A';
    
    let pe = stockData.pe || stockData.pe_ratio || stockData.peRatio;
    
    // Try to extract from nested objects
    if (!pe && stockData.stockTechnicalData && stockData.stockTechnicalData.length > 0) {
      pe = stockData.stockTechnicalData[0].pe || stockData.stockTechnicalData[0].peRatio;
    }
    
    if (!pe && stockData.companyProfile) {
      pe = stockData.companyProfile.pe || stockData.companyProfile.peRatio;
    }
    
    // Format the PE ratio
    if (pe !== undefined && pe !== null) {
      if (typeof pe === 'number') {
        return pe.toFixed(2);
      }
      return pe;
    }
    
    return 'N/A';
  };
  
  // Helper function to extract EPS
  const extractEPS = () => {
    if (!stockData) return 'N/A';
    
    let eps = stockData.eps || stockData.EPS;
    
    // Try to extract from nested objects
    if (!eps && stockData.stockTechnicalData && stockData.stockTechnicalData.length > 0) {
      eps = stockData.stockTechnicalData[0].eps || stockData.stockTechnicalData[0].EPS;
    }
    
    if (!eps && stockData.companyProfile) {
      eps = stockData.companyProfile.eps || stockData.companyProfile.EPS;
    }
    
    // Also check for financials section if available
    if (!eps && stockData.financials && stockData.financials.statements && stockData.financials.statements.length > 0) {
      const latestStatement = stockData.financials.statements[0];
      if (latestStatement.income) {
        const epsEntry = latestStatement.income.find((item: any) => 
          item.name === 'EPS' || item.name === 'Earnings Per Share'
        );
        if (epsEntry) {
          eps = epsEntry.value;
        }
      }
    }
    
    // Format the EPS
    if (eps !== undefined && eps !== null) {
      if (typeof eps === 'number') {
        return `₹${eps.toFixed(2)}`;
      }
      return eps.toString().startsWith('₹') ? eps : `₹${eps}`;
    }
    
    return 'N/A';
  };

  // Helper function to transform financial data from API response
  const transformFinancialData = () => {
    // If stockData has statements directly, process them
    if (stockData.stockFinancialMap) {
      return [{
        stockFinancialMap: stockData.stockFinancialMap,
        FiscalYear: stockData.FiscalYear || new Date().getFullYear().toString(),
        EndDate: stockData.StatementDate || stockData.EndDate || new Date().toISOString().split('T')[0],
        Type: stockData.Type || 'Interim',
        StatementDate: stockData.StatementDate || new Date().toISOString().split('T')[0],
        fiscalPeriodNumber: stockData.fiscalPeriodNumber || 0
      }];
    }

    // Look for financial statements in fiscal periods array
    if (Array.isArray(stockData.fiscalPeriods)) {
      return stockData.fiscalPeriods;
    }

    // Check if financial statements are in a nested field
    if (stockData.financials?.statements) {
      return stockData.financials.statements.map((statement: any) => ({
        stockFinancialMap: {
          INC: statement.income || [],
          BAL: statement.balance || [],
          CAS: statement.cashflow || []
        },
        FiscalYear: statement.year || new Date().getFullYear().toString(),
        EndDate: statement.date || new Date().toISOString().split('T')[0],
        Type: statement.type || 'Interim',
        StatementDate: statement.date || new Date().toISOString().split('T')[0],
        fiscalPeriodNumber: statement.period || 0
      }));
    }

    return [];
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-900 rounded-xl p-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-400">Loading {symbol} data...</p>
      </div>
    );
  }
  
  if (error || !stockData) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-400 p-6 rounded-xl">
        <div className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          <p>{error || `No data found for symbol "${symbol}"`}</p>
        </div>
      </div>
    );
  }
  
  // Extract key information for display
  const companyName = stockData.companyName || stockData.name || symbol;
  const displaySymbol = stockData.symbol || symbol;
  const industry = stockData.industry || stockData.sector || 'N/A';
  const price = extractPrice();
  
  // Percent change
  const percentChange = stockData.percentChange || stockData.percent_change || 0;
  const isPositive = parseFloat(percentChange) >= 0;
  
  // 52-week range
  const yearHigh = stockData.yearHigh || stockData.year_high;
  const yearLow = stockData.yearLow || stockData.year_low;
  
  // Key metrics using our enhanced extraction functions
  const marketCap = extractMarketCap();
  const pe = extractPE();
  const eps = extractEPS();
  const debtToEquity = stockData.debtToEquity || stockData.debt_to_equity;
  const dividendYield = stockData.dividendYield || stockData.dividend_yield;
  const volume = stockData.volume;
  const avgVolume = stockData.averageVolume || stockData.average_volume;
  
  // Company description
  const description = stockData.companyProfile?.companyDescription || stockData.description || 'No company description available.';
  
  // Identifiers
  const isin = stockData.companyProfile?.isInId;
  const bseCode = stockData.companyProfile?.exchangeCodeBse;
  const nseCode = stockData.companyProfile?.exchangeCodeNse;
  
  // Management team
  const officers = stockData.companyProfile?.officers?.officer || [];

  // Financial data
  const financialData = transformFinancialData();
  
  // Recent news
  const recentNews = stockData.recentNews || [];
  
  return (
    <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
      <div ref={headerRef} className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white">{companyName}</h1>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">{displaySymbol}</span>
            </div>
            {industry && <p className="text-gray-400 mt-1">{industry}</p>}
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-sm text-gray-400">ISIN: {isin || 'N/A'}</span>
            <span className="text-sm text-gray-400">BSE: {bseCode || 'N/A'}</span>
            <span className="text-sm text-gray-400">NSE: {nseCode || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {/* Price and Key Metrics Cards */}
      <div ref={priceRef} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Price Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 font-medium text-sm">Current Price</h3>
                <div className={`p-2 rounded-lg bg-indigo-500/20 text-indigo-400`}>
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-white">₹{price}</p>
                <div className={`flex items-center mt-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  <span>{isPositive ? '+' : ''}{percentChange}% today</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Market Cap Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 font-medium text-sm">Market Cap</h3>
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <BarChart4 className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-white">{marketCap}</p>
              </div>
            </div>
          </div>
          
          {/* P/E Ratio Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 font-medium text-sm">P/E Ratio</h3>
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Scale className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-white">{pe}</p>
              </div>
            </div>
          </div>
          
          {/* EPS Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-gray-400 font-medium text-sm">EPS</h3>
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <p className="text-2xl font-bold text-white">{eps}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 52 Week Range */}
      {(yearHigh || yearLow) && (
        <div ref={rangeRef} className="bg-gray-800 border border-gray-700 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">52 Week Range</h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">₹{yearLow || 'N/A'}</span>
            <div className="h-2 bg-gray-700 rounded-full flex-grow mx-4 relative range-slider">
              <div 
                className="h-full bg-indigo-500 rounded-full" 
                style={{ 
                  width: `${Math.min(
                    100, 
                    Math.max(
                      0, 
                      ((parseFloat(price) - (yearLow || 0)) / 
                       ((yearHigh || 0) - (yearLow || 0))) * 100
                    )
                  )}%` 
                }}
              />
              <div 
                className="absolute h-5 w-5 bg-indigo-600 -top-1.5 rounded-full transform -translate-x-1/2 shadow-lg range-dot"
                style={{ 
                  left: `${Math.min(
                    100, 
                    Math.max(
                      0, 
                      ((parseFloat(price) - (yearLow || 0)) / 
                       ((yearHigh || 0) - (yearLow || 0))) * 100
                    )
                  )}%` 
                }}
              />
            </div>
            <span className="text-gray-300">₹{yearHigh || 'N/A'}</span>
          </div>
        </div>
      )}
        
      {/* Financial Highlights Section */}
      {financialData && financialData.length > 0 && (
        <div className="mb-8">
          <FinancialHighlights financialData={financialData} />
        </div>
      )}
      
      {/* Charts and About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Chart */}
        <div ref={chartContainerRef} className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Price Performance</CardTitle>
              <CardDescription className="text-gray-400">Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] relative">
                <canvas ref={performanceChartRef} />
              </div>
            </CardContent>
          </Card>
          </div>
          
        {/* About Card */}
        <div ref={aboutRef} className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 h-full">
            <CardHeader>
              <CardTitle className="text-white">About</CardTitle>
              <CardDescription className="text-gray-400">Company Overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-gray-300 text-sm overflow-y-auto max-h-[230px] pr-2">
                {description}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

      {/* Financial Statements Section */}
      {financialData && financialData.length > 0 && (
        <div className="mb-8">
          <FinancialStatements financialData={financialData} />
        </div>
      )}

      {/* News and Key Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trading Info */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LineChart className="h-5 w-5 text-indigo-400" />
              Trading Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Volume</span>
              <span className="text-white font-medium">{volume ? volume.toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Avg. Volume</span>
              <span className="text-white font-medium">{avgVolume ? avgVolume.toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Dividend Yield</span>
              <span className="text-white font-medium">{dividendYield ? `${dividendYield}%` : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Debt to Equity</span>
              <span className="text-white font-medium">{debtToEquity || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Sector Distribution */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-400" />
              Sector Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center relative">
              <canvas ref={sectorDistributionChartRef} />
            </div>
          </CardContent>
        </Card>
        
        {/* Key Management - Replaced with enhanced ManagementInfo component */}
        <div className="lg:col-span-1">
          <ManagementInfo officers={officers} />
        </div>
      </div>

      {/* Recent News Section */}
      {recentNews && recentNews.length > 0 && (
        <div className="mb-8">
          <StockNewsSection news={recentNews} />
        </div>
      )}
    </div>
  );
}
