"use client";

import React, { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { useParams } from 'next/navigation';
import { gsap } from 'gsap';
import { Chart, registerables } from 'chart.js';
import { 
  TrendingUp, 
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
import { normalizeStockData, type NormalizedStock } from '@/lib/normalizeStock';
// Removed separate financial API imports - now using single /stock endpoint
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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
  [key: string]: unknown;
}

interface FetchedFinancialStatementsData {
  statements?: Array<{
    incomeStatement?: FinancialItem[];
    balanceSheet?: FinancialItem[];
    cashFlow?: FinancialItem[];
    year?: string;
    endDate?: string;
    type?: string;
    statementDate?: string;
    period?: number;
  }>;
}
import { FinancialItem, FinancialPeriod } from '@/components/stocks/FinancialStatements'; // Import for transformFinancialData

// Register Chart.js components
Chart.register(...registerables);

// Main page component (renamed from StockDetailsClient to Page)
export default function Page() {
  const params = useParams();
  const symbol = params?.symbol as string || '';
  const [stockData, setStockData] = useState<unknown | null>(null);           // raw API response
  const [stock, setStock] = useState<NormalizedStock | null>(null); // normalized data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // State for Fundamental Analysis Data
  const financialRatios: FinancialRatiosData | null = null;
  const financialStatements: FetchedFinancialStatementsData | null = null;
  const loadingRatios = false;
  const errorRatios: string | null = null;
  const loadingStatements = false;
  const errorStatements: string | null = null;
  
  // Refs for animations and charts
  const headerRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);
  const sectorDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const financialRatiosRef = useRef<HTMLDivElement>(null); 
  const financialStatementsRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<number | null>(null);
  
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

    // Fetch stock data and normalize NSE India response structure
    const fetchStockData = async () => {
      try {
        setLoading(true);
        logger.debug(`Fetching stock data for symbol: ${symbol}`);
        
        const raw = await apiHelpers.getStockDetails(symbol);
        
        if (raw) {
          logger.debug('Raw stock data received:', raw);
          setStockData(raw);
          // Normalize the nested NSE India structure into a flat object
          const normalized = normalizeStockData(raw);
          logger.debug('Normalized stock data:', normalized);
          setStock(normalized);
          if (!normalized) {
            setError(`Could not parse data for "${symbol}". Unexpected data format.`);
          }
        } else {
          setError(`No data found for "${symbol}". Please check the stock name or symbol and try again.`);
        }
      } catch (err: unknown) {
        logger.error('Error fetching stock data:', err);
        const errorObj = err as { response?: { status?: number }; message?: string };
        setError(
          errorObj.response?.status === 404
            ? `Stock "${symbol}" not found. Please check the name or symbol and try again.`
            : `Failed to fetch stock data: ${errorObj.message || 'Unknown error'}. Please try again.`
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchStockData();
    // fetchFinancialData(); // Removed - NSE India equityDetails is all-in-one
  }, [symbol]);
  
  // Initialize animations after data is loaded — use fromTo so elements always end visible
  useEffect(() => {
    if (loading || !stock || error) return;

    const animatedRefs = [
      headerRef.current,
      priceRef.current,
      rangeRef.current,
      aboutRef.current,
      financialRatiosRef.current,
      financialStatementsRef.current
    ].filter(Boolean) as HTMLElement[];

    if (animatedRefs.length) {
      gsap.killTweensOf(animatedRefs);
      gsap.set(animatedRefs, { clearProps: 'opacity,transform,filter' });
    }

    const timeline = gsap.timeline({ defaults: { overwrite: 'auto' } });

    if (headerRef.current)
      timeline.fromTo(headerRef.current,
        { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });

    if (priceRef.current)
      timeline.fromTo(priceRef.current,
        { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.3");

    if (rangeRef.current)
      timeline.fromTo(rangeRef.current,
        { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4");

    if (aboutRef.current)
      timeline.fromTo(aboutRef.current,
        { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.3");

    if (financialRatiosRef.current)
      timeline.fromTo(financialRatiosRef.current,
        { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.2");

    if (financialStatementsRef.current)
      timeline.fromTo(financialStatementsRef.current,
        { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.2");

    // Initialize charts with animations
    animationTimerRef.current = window.setTimeout(() => {
      initializeCharts();
    }, 100);

    return () => {
      timeline.kill();

      if (animationTimerRef.current !== null) {
        window.clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }

      if (animatedRefs.length) {
        gsap.set(animatedRefs, { clearProps: 'opacity,transform,filter' });
      }
    };
  }, [loading, stock, error]);

  // Prevent stale GSAP inline styles from previous tab content from leaving cards dimmed
  useEffect(() => {
    if (!tabContentRef.current) return;

    const nodes = Array.from(tabContentRef.current.querySelectorAll('*'));
    if (!nodes.length) return;

    gsap.killTweensOf(nodes);
    gsap.set(nodes, { clearProps: 'opacity,transform,filter' });
  }, [activeTab]);
  
  // Initialize the charts
  const initializeCharts = () => {
    // Only proceed if we have data and chart refs
    if (!stock) return;
    
    // Clean up any existing charts first
    cleanupCharts();
    
    setTimeout(() => {
      // First, make sure the canvas elements exist and are accessible
      if (!sectorDistributionChartRef.current || !performanceChartRef.current) {
        logger.debug('Canvas elements not available yet');
        return;
      }
    
    // Create dummy sector distribution data (replace with real data when available)
    const sectorCtx = sectorDistributionChartRef.current.getContext('2d');
    if (sectorCtx) {
        try {
      const industry = stock.industry || stock.sector || '';
      
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
          logger.error('Error creating sector chart:', error);
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
      const lastMonthData = Array.from({ length: 30 }, () => {
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
          logger.error('Error creating performance chart:', error);
        }
    }
    }, 300); // Slightly longer delay to ensure DOM is ready
  };
  
  // Helper function to extract price
  // ── Data extraction (all reads from normalized `stock` object) ──────────
  const extractPrice = () => {
    if (stock) return stock.lastPrice || 'N/A';
    return 'N/A';
  };

  const formatMarketCap = (marketCap: string | number): string => {
    if (typeof marketCap === 'string') {
      return marketCap.startsWith('₹') ? marketCap : `₹${marketCap}`;
    }
    
    if (typeof marketCap === 'number') {
      // Format large numbers in crores/lakhs
      if (marketCap >= 10000000) {
        return `₹${(marketCap / 10000000).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} Cr`;
      } else if (marketCap >= 100000) {
        return `₹${(marketCap / 100000).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} L`;
      } else {
        return `₹${marketCap.toLocaleString('en-IN')}`;
      }
    }
    
    return 'N/A';
  };
  
  // Helper: PE ratio from normalized data (metadata.pdSymbolPe in NSE India)
  const extractPE = () => {
    if (stock?.symbolPE && stock.symbolPE !== 'N/A') return String(stock.symbolPE);
    return 'N/A';
  };
  
  // Helper: EPS — not directly in NSE India equityDetails; show N/A
  const extractEPS = () => 'N/A';
  // Helper function to transform fetched financial statements to FinancialPeriod format
  const transformFetchedFinancialStatements = (data: unknown): FinancialPeriod[] => {
    if (!data || typeof data !== 'object') {
      return [];
    }

    const fetchedData = data as FetchedFinancialStatementsData;

    if (!fetchedData.statements || !Array.isArray(fetchedData.statements)) {
      return [];
    }

    return fetchedData.statements.map((statement) => ({
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
  
  // ── Extract key info — prefer normalized stock, fall back to raw ─────────────
  const companyName = stock?.companyName || symbol;
  const displaySymbol = stock?.symbol || symbol;
  const industry = stock?.industry || 'N/A';
  const sector = stock?.sector || 'N/A';
  const price = extractPrice();
  
  // Percent change
  const pChange = stock?.pChange ?? 0;
  const change = stock?.change ?? 0;
  const isPositive = stock ? stock.isPositive : pChange >= 0;
  
  // 52-week range (NSE India: priceInfo.weekHighLow.{max,min})
  const yearHigh = stock?.yearHigh;
  const yearLow = stock?.yearLow;
  
  // Intraday
  const dayHigh = stock?.dayHigh;
  const dayLow = stock?.dayLow;
  const openPrice = stock?.open;
  const prevClose = stock?.previousClose;
  const vwap = stock?.vwap;
  
  // Circuit limits
  const upperCircuit = stock?.upperCircuit || 'N/A';
  const lowerCircuit = stock?.lowerCircuit || 'N/A';
  
  // Metrics (PE, EPS, Market Cap)
  const pe = extractPE();
  const eps = extractEPS();
  const marketCap = stock?.marketCap ? formatMarketCap(stock.marketCap) : 'N/A';
  const volume = stock?.volume || 'N/A';
  const debtToEquity = 'N/A';
  const dividendYield = 'N/A';
  
  // Identifiers from NSE India
  const isin = stock?.isin || '';
  const bseCode = '';
  const nseCode = stock?.symbol || '';
  
  // Market status
  const marketCapValue = stock?.marketCap || undefined;

  // Management team
  const officers: React.ComponentProps<typeof Overview>['officers'] = [];

  // Financial data (NSE India doesn't return detailed financials in equityDetails)
  const financialData: React.ComponentProps<typeof Overview>['financialData'] = [];
  
  // Company description from securityInfo or industryInfo
  const description = `${companyName} is listed on the NSE under the ${industry} sector.`;

  // Recent news
  const recentNews: React.ComponentProps<typeof Overview>['recentNews'] = [];  // Tab configuration
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
              value={`₹${typeof price === 'number' ? price.toLocaleString('en-IN', {minimumFractionDigits:2,maximumFractionDigits:2}) : price}`}
              change={`${pChange >= 0 ? '+' : ''}${pChange.toFixed(2)}% (₹${change >= 0 ? '+' : ''}${change.toFixed(2)})`}
              isPositive={isPositive}
              icon={<TrendingUp className="h-5 w-5" />}
              delay={0.1}
            />
            
            {/* Day's Range Card */}
            <MetricCard
              title="Day's Range"
              value={dayHigh ? `₹${(dayLow || 0).toLocaleString('en-IN')} – ₹${dayHigh.toLocaleString('en-IN')}` : 'N/A'}
              icon={<Building className="h-5 w-5" />}
              delay={0.2}
            />
            
            {/* VWAP Card */}
            <MetricCard
              title="VWAP"
              value={vwap ? `₹${vwap.toLocaleString('en-IN', {minimumFractionDigits:2})}` : 'N/A'}
              icon={<Scale className="h-5 w-5" />}
              delay={0.3}
            />
            
            {/* P/E Ratio (Sector PE as fallback) */}
            <MetricCard
              title={pe !== 'N/A' ? 'P/E Ratio' : 'Sector PE'}
              value={pe !== 'N/A' ? pe : (stock?.sectorPE !== 'N/A' ? String(stock?.sectorPE) : 'N/A')}
              icon={<Percent className="h-5 w-5" />}
              delay={0.4}
            />
          </div>
        </div>
        
        {/* 52-Week Range + Trading Info */}
        {(yearHigh || yearLow) && (
          <div ref={rangeRef} className="glass-card rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-300">52-Week Range</h2>
              <div className="flex gap-4 text-xs text-gray-500">
                {prevClose && <span>Prev Close: <span className="text-gray-300 font-mono">₹{typeof prevClose === 'number' ? prevClose.toLocaleString('en-IN', {minimumFractionDigits:2}) : prevClose}</span></span>}
                {openPrice && <span>Open: <span className="text-gray-300 font-mono">₹{typeof openPrice === 'number' ? openPrice.toLocaleString('en-IN', {minimumFractionDigits:2}) : openPrice}</span></span>}
                {stock?.priceBand && stock.priceBand !== 'N/A' && <span>Band: <span className="text-gray-300">{stock.priceBand}</span></span>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-gray-400 font-mono text-sm">₹{yearLow?.toLocaleString('en-IN') || 'N/A'}</div>
                <div className="text-[10px] text-gray-600">{stock?.yearLowDate}</div>
              </div>
              <div className="h-2 bg-gray-800/60 rounded-full flex-grow mx-4 relative range-slider">
                <div 
                  className="h-full bg-gradient-to-r from-neon-400/70 to-cyan-400/50 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Math.max(0, 
                      (((stock?.lastPrice || 0) - (yearLow || 0)) / 
                       ((yearHigh || 1) - (yearLow || 0))) * 100
                    ))}%` 
                  }}
                />
                <div 
                  className="absolute h-5 w-5 bg-neon-400 -top-1.5 rounded-full transform -translate-x-1/2 shadow-neon-sm range-dot"
                  style={{ 
                    left: `${Math.min(100, Math.max(0, 
                      (((stock?.lastPrice || 0) - (yearLow || 0)) / 
                       ((yearHigh || 1) - (yearLow || 0))) * 100
                    ))}%` 
                  }}
                />
              </div>
              <div className="text-right">
                <div className="text-gray-400 font-mono text-sm">₹{yearHigh?.toLocaleString('en-IN') || 'N/A'}</div>
                <div className="text-[10px] text-gray-600">{stock?.yearHighDate}</div>
              </div>
            </div>
            {/* Circuit Limits */}
            {(upperCircuit !== 'N/A' || lowerCircuit !== 'N/A') && (
              <div className="mt-4 pt-3 border-t border-gray-800/30 flex gap-6 text-xs">
                <span className="text-gray-500">Upper Circuit: <span className="text-green-400 font-mono">₹{upperCircuit}</span></span>
                <span className="text-gray-500">Lower Circuit: <span className="text-red-400 font-mono">₹{lowerCircuit}</span></span>
                {stock?.listingDate && stock.listingDate !== 'N/A' && (
                  <span className="text-gray-500 ml-auto">Listed: <span className="text-gray-300">{stock.listingDate}</span></span>
                )}
              </div>
            )}
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
          <div ref={tabContentRef} className="p-6">
            {activeTab === 'overview' && (
              <Overview 
                stockData={stock?._raw || stockData || {}}
                symbol={symbol}
                companyName={companyName}
                industry={industry}
                price={stock?.lastPrice ?? 0}
                yearHigh={yearHigh}
                yearLow={yearLow}
                volume={typeof volume === 'number' ? volume : 0}
                marketCap={marketCap}
                avgVolume={0}
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
                currencySymbol={'₹'}
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
              currentPrice={stock?.lastPrice || 0}
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
                marketCap={marketCapValue || 0} 
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
                  price: stock?.lastPrice ?? 0,
                  high: dayHigh ?? 0,
                  low: dayLow ?? 0,
                  lowCircuitLimit: lowerCircuit,
                  upCircuitLimit: upperCircuit,
                  year_high: yearHigh ?? 0,
                  year_low: yearLow ?? 0,
                  volume: volume,
                  averageVolume: 0,
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