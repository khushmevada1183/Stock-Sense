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
  Tag,
  Leaf,
  Shield,
  Rocket
} from 'lucide-react';
import { apiHelpers } from '@/api/api';
// Removed separate financial API imports - now using single /stock endpoint
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FinancialStatements from '@/components/stocks/FinancialStatements';
import StockNewsSection from '@/components/stocks/StockNewsSection';
import FinancialHighlights from '@/components/stocks/FinancialHighlights';
import ManagementInfo from '@/components/stocks/ManagementInfo';
import TechnicalAnalysis from '@/components/stocks/TechnicalAnalysis';
import MacroeconomicIndicators from '@/components/stocks/MacroeconomicIndicators';
import SentimentAnalysis from '@/components/stocks/SentimentAnalysis';
import IndustryAnalysis from '@/components/stocks/IndustryAnalysis';
import ManagementGovernance from '@/components/stocks/ManagementGovernance';
import InstitutionalInvestment from '@/components/stocks/InstitutionalInvestment';
import ESGMetrics from '@/components/stocks/ESGMetrics';
import RiskAssessment from '@/components/stocks/RiskAssessment';
import FutureGrowthPotential from '@/components/stocks/FutureGrowthPotential';
import Overview from '@/components/stocks/Overview';
import FundamentalAnalysis from '@/components/stocks/FundamentalAnalysis';
import MetricCard from '@/components/stocks/MetricCard';
// Define types needed for financial data
interface FinancialRatiosData {
  [key: string]: any;
}

interface FetchedFinancialStatementsData {
  [key: string]: any;
}
import { FinancialPeriod } from '@/components/stocks/FinancialStatements'; // Import for transformFinancialData

// Register Chart.js components
Chart.register(...registerables);

// Main page component (renamed from StockDetailsClient to Page)
export default function Page() {
  const params = useParams();
  const symbol = params?.symbol as string || '';
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // State for Fundamental Analysis Data
  const [financialRatios, setFinancialRatios] = useState<FinancialRatiosData | null>(null);
  const [financialStatements, setFinancialStatements] = useState<FetchedFinancialStatementsData | null>(null); // Use renamed type
  const [loadingRatios, setLoadingRatios] = useState(true);
  const [errorRatios, setErrorRatios] = useState<string | null>(null);
  const [loadingStatements, setLoadingStatements] = useState(true);
  const [errorStatements, setErrorStatements] = useState<string | null>(null);
  
  // Refs for animations and charts
  const headerRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const sectorDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const financialRatiosRef = useRef<HTMLDivElement>(null); 
  const financialStatementsRef = useRef<HTMLDivElement>(null);
  
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
        
        const data = await apiHelpers.getStockDetails(symbol);
        
        if (data) {
          console.log('Stock data received:', data);
          setStockData(data);
          // Process financial data from the main response
          setTimeout(() => fetchFinancialData(), 100);
        } else {
          setError(`No data found for \"${symbol}\". Please check the stock name or symbol and try again.`);
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

    const fetchFinancialData = async () => {
      // Financial data should already be included in the main stock data response
      // No need for separate API calls since /stock endpoint returns all data
      setLoadingRatios(false);
      setLoadingStatements(false);
      
      if (stockData) {
        // Extract financial ratios from main stock data
        if (stockData.financialRatios || stockData.ratios || stockData.keyMetrics) {
          setFinancialRatios(stockData.financialRatios || stockData.ratios || stockData.keyMetrics);
        } else {
          setErrorRatios(`No financial ratios found in stock data for \"${symbol}\".`);
        }

        // Extract financial statements from main stock data
        if (stockData.financialStatements || stockData.statements || stockData.fiscalPeriods) {
          setFinancialStatements(stockData.financialStatements || stockData.statements || stockData.fiscalPeriods);
        } else {
          setErrorStatements(`No financial statements found in stock data for \"${symbol}\".`);
        }
      }
    };
    
    fetchStockData();
    // fetchFinancialData(); // Removed - now handled within fetchStockData 
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

      // Animate Financial Ratios section
      if (financialRatiosRef.current) {
        timeline.from(financialRatiosRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.2");
      }

      // Animate Financial Statements section
      if (financialStatementsRef.current) {
        timeline.from(financialStatementsRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out"
        }, "-=0.2");
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
            'rgba(57, 255, 20, 0.7)',
            'rgba(0, 194, 203, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(34, 211, 238, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
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
              backgroundColor: 'rgba(10, 10, 10, 0.9)',
              borderColor: 'rgba(57, 255, 20, 0.2)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#9ca3af',
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
      gradient.addColorStop(0, 'rgba(57, 255, 20, 0.3)');
      gradient.addColorStop(0.5, 'rgba(57, 255, 20, 0.08)');
      gradient.addColorStop(1, 'rgba(57, 255, 20, 0.0)');
      
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
            borderColor: '#39FF14',
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#39FF14',
            pointHoverBorderColor: '#39FF14',
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
              maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(10, 10, 10, 0.9)',
              borderColor: 'rgba(57, 255, 20, 0.2)',
              borderWidth: 1,
              titleColor: '#fff',
              bodyColor: '#9ca3af',
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.03)',
              },
              ticks: {
                maxTicksLimit: 6,
                color: 'rgba(156, 163, 175, 0.5)',
                font: { size: 11 }
              },
              border: { display: false }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.03)',
              },
              ticks: {
                callback: (value) => `₹${value.toLocaleString()}`,
                color: 'rgba(156, 163, 175, 0.5)',
                font: { size: 11 }
              },
              border: { display: false }
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
    // Prioritize specific fields if they exist, otherwise fall back
    return stockData.price || stockData.current_price || stockData.lastPrice || stockData.ltp || 'N/A';
  };

  const formatMarketCap = (marketCap: string | number): string => {
    if (typeof marketCap === 'string') {
      return marketCap.startsWith('₹') ? marketCap : `₹${marketCap}`;
    }
    
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
  const transformFinancialData = (): FinancialPeriod[] => { // Added return type
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

  // Helper function to transform fetched financial statements to FinancialPeriod format
  const transformFetchedFinancialStatements = (data: FetchedFinancialStatementsData): FinancialPeriod[] => {
    if (!data || !data.statements || !Array.isArray(data.statements)) {
      return [];
    }

    return data.statements.map((statement: any) => ({
      stockFinancialMap: {
        INC: statement.incomeStatement || [],
        BAL: statement.balanceSheet || [],
        CAS: statement.cashFlow || []
      },
      FiscalYear: statement.year || new Date().getFullYear().toString(),
      EndDate: statement.endDate || new Date().toISOString().split('T')[0],
      Type: statement.type || 'Annual',
      StatementDate: statement.statementDate || statement.endDate || new Date().toISOString().split('T')[0],
      fiscalPeriodNumber: statement.period || 0
    }));
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 p-8">
        <div className="glass-card rounded-xl p-6 border-red-500/20 max-w-2xl mx-auto">
          <div className="flex items-center text-red-400">
            <Info className="h-5 w-5 mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Extract key information for display
  const companyName = stockData.companyName || stockData.name || symbol;
  const displaySymbol = stockData.symbol || symbol;
  const industry = stockData.industry || stockData.sector || 'N/A';
  const price = extractPrice();
  const marketCapValue = stockData.marketCap || stockData.market_cap; // Extracted for formatting
  
  // Percent change
  const percentChange = stockData.percentChange || stockData.percent_change || 0;
  const isPositive = parseFloat(percentChange) >= 0;
  
  // 52-week range
  const yearHigh = stockData.yearHigh || stockData.year_high;
  const yearLow = stockData.yearLow || stockData.year_low;
  
  // Key metrics using our enhanced extraction functions
  const marketCap = formatMarketCap(marketCapValue); // Use extracted value
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
  const financialData = transformFinancialData(); // This will be used by FinancialStatements and FinancialHighlights
  
  // Recent news
  const recentNews = stockData.recentNews || [];  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Basic information and charts'
    },
    {
      id: 'fundamental',
      label: 'Fundamental Analysis',
      icon: <BarChart4 className="h-4 w-4" />,
      description: 'Financial statements and ratios'
    },
    {
      id: 'technical',
      label: 'Technical Analysis',
      icon: <LineChart className="h-4 w-4" />,
      description: 'Technical indicators and charts'
    },
    {
      id: 'management',
      label: 'Management & Governance',
      icon: <Users className="h-4 w-4" />,
      description: 'Leadership and corporate governance'
    },
    {
      id: 'industry',
      label: 'Industry Analysis',
      icon: <Building className="h-4 w-4" />,
      description: 'Industry trends and competitive analysis'
    },
    {
      id: 'sentiment',
      label: 'Market Sentiment',
      icon: <Tag className="h-4 w-4" />,
      description: 'Social media and news sentiment'
    },
    {
      id: 'institutional',
      label: 'Institutional Investment',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'FII/DII holdings and flows'
    },
    {
      id: 'macroeconomic',
      label: 'Macroeconomic',
      icon: <Scale className="h-4 w-4" />,
      description: 'Economic indicators and policy impact'
    },
    {
      id: 'esg',
      label: 'ESG Metrics',
      icon: <Leaf className="h-4 w-4" />,
      description: 'Environmental, Social & Governance analysis'
    },
    {
      id: 'risk',
      label: 'Risk Assessment',
      icon: <Shield className="h-4 w-4" />,
      description: 'Comprehensive risk analysis and scenarios'
    },
    {
      id: 'growth',
      label: 'Future Growth',
      icon: <Rocket className="h-4 w-4" />,
      description: 'Growth potential and strategic opportunities'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-950 relative">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-neon-400/[0.02] blur-[120px] -top-40 -right-40" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px] bottom-20 -left-40" />
      </div>

      <div className="stock-details-page min-h-screen text-white p-4 md:p-8 relative z-10">
        {/* Header Section */}
        <div ref={headerRef} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{companyName}</h1>
                <span className="px-3 py-1 bg-neon-400/10 text-neon-400 border border-neon-400/20 rounded-full text-sm font-medium">
                  {displaySymbol}
                </span>
              </div>
              {industry && (
                <p className="text-gray-500 mt-2 flex items-center">
                  <Building className="h-4 w-4 mr-1.5 text-gray-600" />
                  {industry}
                </p>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-4">
              {[
                { label: 'ISIN', value: isin },
                { label: 'BSE', value: bseCode },
                { label: 'NSE', value: nseCode }
              ].map((id) => (
                <span key={id.label} className="text-xs text-gray-600">
                  <span className="text-gray-500">{id.label}:</span> {id.value || 'N/A'}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Price and Key Metrics Cards */}
        <div ref={priceRef} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Current Price Card */}
            <MetricCard
              title="Current Price"
              value={`${stockData?.currencySymbol || '₹'}${price}`}
              change={`${percentChange}%`}
              isPositive={isPositive}
              icon={<TrendingUp className="h-5 w-5" />}
              delay={0.1}
            />
            
            {/* Market Cap Card */}
            <MetricCard
              title="Market Cap"
              value={marketCap}
              icon={<Building className="h-5 w-5" />}
              delay={0.2}
            />
            
            {/* P/E Ratio Card */}
            <MetricCard
              title="P/E Ratio"
              value={pe}
              icon={<Scale className="h-5 w-5" />}
              delay={0.3}
            />
            
            {/* EPS Card */}
            <MetricCard
              title="EPS"
              value={eps}
              icon={<Percent className="h-5 w-5" />}
              delay={0.4}
            />
          </div>
        </div>
        
        {/* 52 Week Range */}
        {(yearHigh || yearLow) && (
          <div ref={rangeRef} className="glass-card rounded-xl p-6 mb-8">
            <h2 className="text-base font-semibold text-gray-300 mb-4">52 Week Range</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 font-mono text-sm">₹{yearLow || 'N/A'}</span>
              <div className="h-2 bg-gray-800/60 rounded-full flex-grow mx-4 relative range-slider">
                <div 
                  className="h-full bg-gradient-to-r from-neon-400/70 to-cyan-400/50 rounded-full" 
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
                  className="absolute h-5 w-5 bg-neon-400 -top-1.5 rounded-full transform -translate-x-1/2 shadow-neon-sm range-dot"
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
              <span className="text-gray-400 font-mono text-sm">₹{yearHigh || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Tabbed Interface — Modern Pill Design */}
        <div className="mb-8">
          {/* Tab Category Groups */}
          <div className="space-y-3">
            {/* Primary Tabs Row */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mr-1 flex-shrink-0 hidden lg:block">Core</span>
              {tabs.slice(0, 3).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-neon-400/10 text-neon-400 shadow-[0_0_20px_rgba(57,255,20,0.08)] border border-neon-400/20'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 border border-transparent'
                  }`}
                >
                  <span className={`transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-neon-400 drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]' 
                      : 'text-gray-600 group-hover:text-gray-400'
                  }`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-pulse shadow-[0_0_6px_rgba(57,255,20,0.6)]" />
                  )}
                </button>
              ))}

              <div className="w-px h-6 bg-gray-800/40 mx-1 flex-shrink-0 hidden lg:block" />
              <span className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mr-1 flex-shrink-0 hidden lg:block">Analysis</span>
              {tabs.slice(3, 6).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-neon-400/10 text-neon-400 shadow-[0_0_20px_rgba(57,255,20,0.08)] border border-neon-400/20'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 border border-transparent'
                  }`}
                >
                  <span className={`transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-neon-400 drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]' 
                      : 'text-gray-600 group-hover:text-gray-400'
                  }`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-pulse shadow-[0_0_6px_rgba(57,255,20,0.6)]" />
                  )}
                </button>
              ))}
            </div>

            {/* Secondary Tabs Row */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 font-semibold mr-1 flex-shrink-0 hidden lg:block">Research</span>
              {tabs.slice(6).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-neon-400/10 text-neon-400 shadow-[0_0_20px_rgba(57,255,20,0.08)] border border-neon-400/20'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/30 border border-transparent'
                  }`}
                >
                  <span className={`transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'text-neon-400 drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]' 
                      : 'text-gray-600 group-hover:text-gray-400'
                  }`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-400 animate-pulse shadow-[0_0_6px_rgba(57,255,20,0.6)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {/* Active tab header bar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800/20">
            <span className="text-neon-400">
              {tabs.find(t => t.id === activeTab)?.icon}
            </span>
            <div>
              <h2 className="text-white font-semibold text-base">{tabs.find(t => t.id === activeTab)?.label}</h2>
              <p className="text-gray-600 text-xs">{tabs.find(t => t.id === activeTab)?.description}</p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <Overview 
                stockData={stockData}
                symbol={symbol}
                companyName={companyName}
                industry={industry}
                price={price}
                yearHigh={yearHigh}
                yearLow={yearLow}
                volume={volume}
                avgVolume={avgVolume}
                dividendYield={dividendYield}
                debtToEquity={debtToEquity}
                description={description}
                financialData={financialData}
                recentNews={recentNews}
                officers={officers}
                performanceChartRef={performanceChartRef}
                sectorDistributionChartRef={sectorDistributionChartRef}
                aboutRef={aboutRef}
                chartContainerRef={chartContainerRef}
              />
            )}

            {activeTab === 'fundamental' && (
              <FundamentalAnalysis
                financialRatios={financialRatios}
                financialStatements={financialStatements}
                companyName={companyName}
                pe={pe}
                eps={eps}
                dividendYield={dividendYield}
                debtToEquity={debtToEquity}
                currencySymbol={stockData?.currencySymbol || '₹'}
                loadingRatios={loadingRatios}
                errorRatios={errorRatios}
                loadingStatements={loadingStatements}
                errorStatements={errorStatements}
                transformFetchedFinancialStatements={transformFetchedFinancialStatements}
              />
            )}
            
            {activeTab === 'technical' && (
              <TechnicalAnalysis 
                symbol={symbol} 
                currentPrice={parseFloat(price.toString().replace(/[₹,]/g, '')) || 0}
              />
            )}

            {activeTab === 'management' && (
              <ManagementGovernance symbol={symbol} companyName={companyName} />
            )}

            {activeTab === 'industry' && (
              <IndustryAnalysis symbol={symbol} sector={industry} industry={industry} />
            )}

            {activeTab === 'sentiment' && (
              <SentimentAnalysis symbol={symbol} companyName={companyName} />
            )}

            {activeTab === 'institutional' && (
              <InstitutionalInvestment 
                symbol={symbol} 
                marketCap={parseFloat(marketCapValue?.toString().replace(/[₹,]/g, '') || '0')} 
              />
            )}
            
            {activeTab === 'macroeconomic' && (
              <MacroeconomicIndicators sector={industry} />
            )}
            
            {activeTab === 'esg' && (
              <ESGMetrics 
                symbol={symbol} 
                companyName={companyName}
                industry={industry}
              />
            )}
            
            {activeTab === 'risk' && (
              <RiskAssessment 
                stock={{
                  symbol: symbol,
                  companyName: companyName,
                  current_price: parseFloat(price.toString().replace(/[₹,]/g, '')) || 0,
                  marketCap: parseFloat(marketCapValue?.toString().replace(/[₹,]/g, '') || '0'),
                  ...stockData
                }}
              />
            )}
            
            {activeTab === 'growth' && (
              <FutureGrowthPotential 
                symbol={symbol} 
                companyName={companyName}
                industry={industry}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}