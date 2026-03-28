'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Chart, registerables } from 'chart.js';
import { ArrowUp, ArrowDown, TrendingUp, BarChart2, PieChart, DollarSign, Activity, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import * as stockApi from '@/api/api';
import { useAnimation } from '@/animations/shared/AnimationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import EnhancedStockCard from '@/components/stocks/EnhancedStockCard';
import { logger } from '@/lib/logger';
import { animateStocksDashboard } from '@/animations/pages/stocksAnimations';

// Register Chart.js components
Chart.register(...registerables);

interface Stock {
  id: number;
  ticker_id: string;
  symbol: string;
  company_name: string;
  sector_name: string;
  current_price: number;
  percent_change: number;
  price_change_percentage: number; // Added this property
  net_change: number;
  bid: number;
  ask: number;
  high: number;
  low: number;
  open: number;
  close: number;
  volume: number;
  bid_size: number;
  ask_size: number;
  low_circuit_limit: number;
  up_circuit_limit: number;
  exchange_type: string;
  lot_size: number;
  overall_rating: string;
  short_term_trends: string;
  long_term_trends: string;
  year_low: number;
  year_high: number;
  date: string;
  time: string;
  ric: string;
}

interface HighLowData {
  symbol: string;
  high_52_week: number;
  low_52_week: number;
  current_price: number;
}

interface LooseStock {
  id?: string | number;
  ticker_id?: string;
  tickerId?: string;
  ticker?: string;
  symbol?: string;
  nseCode?: string;
  ric?: string;
  company?: string;
  company_name?: string;
  displayName?: string;
  name?: string;
  sector_name?: string;
  sector?: string;
  industry?: string;
  current_price?: number;
  last_price?: number;
  ltp?: number;
  price?: number;
  market_cap?: number | string;
  marketCap?: number | string;
  averagePrice?: number;
  price_change_percentage?: number;
  percent_change?: number;
  percentChange?: number;
  change?: number;
  net_change?: number;
  netChange?: number;
  bid?: number;
  bidSize?: number;
  ask?: number;
  askSize?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  volume?: number;
  bid_size?: number;
  ask_size?: number;
  low_circuit_limit?: number;
  lowCircuitLimit?: number;
  up_circuit_limit?: number;
  upCircuitLimit?: number;
  exchange_type?: string;
  exchangeType?: string;
  lot_size?: number;
  lotSize?: number;
  overall_rating?: string;
  overallRating?: string;
  short_term_trend?: string;
  short_term_trends?: string;
  shortTermTrends?: string;
  long_term_trend?: string;
  long_term_trends?: string;
  longTermTrends?: string;
  year_low?: number;
  ylow?: number;
  low_52_week?: number;
  '52_week_low'?: number;
  year_high?: number;
  yhigh?: number;
  high_52_week?: number;
  '52_week_high'?: number;
  deviation?: number;
  actualDeviation?: number;
  description?: string;
  isin?: string;
  isInId?: string;
  date?: string;
  time?: string;
}

const STOCKS_TABLE_PAGE_SIZE = 10;
const SECTOR_CARD_PAGE_SIZE = 6;
const PERFORMANCE_CARD_PAGE_SIZE = 8;
const HIGH_LOW_CARD_PAGE_SIZE = 4;

export default function StocksIndexPage() {
  // API Data States
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [trendingStocks, setTrendingStocks] = useState<LooseStock[]>([]);
  const [bseActive, setBseActive] = useState<LooseStock[]>([]);
  const [nseActive, setNseActive] = useState<LooseStock[]>([]);
  const [highLowData, setHighLowData] = useState<HighLowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stocksTablePage, setStocksTablePage] = useState(1);
  const [sectorCardPage, setSectorCardPage] = useState(1);
  const [performanceCardPage, setPerformanceCardPage] = useState(1);
  const [highLowCardPage, setHighLowCardPage] = useState(1);
  
  // Calculated metrics from real API data
  const [marketMetrics, setMarketMetrics] = useState({
    gainers: 0,
    losers: 0, 
    unchanged: 0,
    totalVolume: '0',
    avgPrice: '0'
  });
  
  const [sectorDistribution, setSectorDistribution] = useState<{[key: string]: number}>({});
  
  // Refs for animating elements
  const dashboardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const sectorsRef = useRef<HTMLDivElement>(null);
  const stocksRef = useRef<HTMLDivElement>(null);
  
  // Refs for charts
  const sectorChartRef = useRef<HTMLCanvasElement>(null);
  const gainersLosersChartRef = useRef<HTMLCanvasElement>(null);
  const volumeChartRef = useRef<HTMLCanvasElement>(null);
  const bseVolumeChartRef = useRef<HTMLCanvasElement>(null);
  const nseVolumeChartRef = useRef<HTMLCanvasElement>(null);
  const bsePerformanceChartRef = useRef<HTMLCanvasElement>(null);
  const nsePerformanceChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances for cleanup
  const chartInstances = useRef<Chart[]>([]);
  
  // Get animation context
  const { isAnimationEnabled } = useAnimation();

  const totalStocksPages = Math.max(1, Math.ceil((stocks?.length || 0) / STOCKS_TABLE_PAGE_SIZE));
  const tableStartIndex = (stocksTablePage - 1) * STOCKS_TABLE_PAGE_SIZE;
  const paginatedStocks = (Array.isArray(stocks) ? stocks : []).slice(
    tableStartIndex,
    tableStartIndex + STOCKS_TABLE_PAGE_SIZE
  );

  const sectorEntries = Object.entries(sectorDistribution);
  const totalSectorPages = Math.max(1, Math.ceil(sectorEntries.length / SECTOR_CARD_PAGE_SIZE));
  const sectorStartIndex = (sectorCardPage - 1) * SECTOR_CARD_PAGE_SIZE;
  const paginatedSectorEntries = sectorEntries.slice(sectorStartIndex, sectorStartIndex + SECTOR_CARD_PAGE_SIZE);

  const totalPerformancePages = Math.max(1, Math.ceil(stocks.length / PERFORMANCE_CARD_PAGE_SIZE));
  const performanceStartIndex = (performanceCardPage - 1) * PERFORMANCE_CARD_PAGE_SIZE;
  const paginatedPerformanceStocks = stocks.slice(performanceStartIndex, performanceStartIndex + PERFORMANCE_CARD_PAGE_SIZE);

  const totalHighLowPages = Math.max(1, Math.ceil(highLowData.length / HIGH_LOW_CARD_PAGE_SIZE));
  const highLowStartIndex = (highLowCardPage - 1) * HIGH_LOW_CARD_PAGE_SIZE;
  const paginatedHighLowData = highLowData.slice(highLowStartIndex, highLowStartIndex + HIGH_LOW_CARD_PAGE_SIZE);

  useEffect(() => {
    setStocksTablePage((prev) => Math.min(prev, totalStocksPages));
  }, [totalStocksPages]);

  useEffect(() => {
    setSectorCardPage((prev) => Math.min(prev, totalSectorPages));
  }, [totalSectorPages]);

  useEffect(() => {
    setPerformanceCardPage((prev) => Math.min(prev, totalPerformancePages));
  }, [totalPerformancePages]);

  useEffect(() => {
    setHighLowCardPage((prev) => Math.min(prev, totalHighLowPages));
  }, [totalHighLowPages]);

  useEffect(() => {
    setStocksTablePage(1);
  }, [stocks.length]);

  useEffect(() => {
    setSectorCardPage(1);
  }, [sectorEntries.length]);

  useEffect(() => {
    setPerformanceCardPage(1);
  }, [stocks.length]);

  useEffect(() => {
    setHighLowCardPage(1);
  }, [highLowData.length]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        
        // Fetch multiple stock data sources in parallel using documented endpoints
        const [trendingRes, bseRes, nseRes, priceShockersRes] = await Promise.all([
          stockApi.getTrendingStocks(),
          stockApi.getBSEMostActive(), 
          stockApi.getNSEMostActive(),
          fetch('/api/price_shockers').then(r => r.json()).catch(() => ({ success: false, data: {} }))
        ]);

        logger.debug('API Responses fetched', { 
          trending: trendingRes, 
          bse: bseRes, 
          nse: nseRes, 
          priceShockers: priceShockersRes 
        });

        // ---- Trending stocks -----------------------------------------------
        // Actual shape: { success, data: { stocks: [...] } }
        // Each item: { id, symbol, company_name, sector_name, current_price, price_change_percentage }
        let allTrendingStocks: LooseStock[] = [];

        if (trendingRes?.success && Array.isArray(trendingRes?.data?.stocks)) {
          allTrendingStocks = trendingRes.data.stocks;
        } else if (trendingRes?.success && trendingRes?.data?.trending_stocks) {
          // Legacy nested format fallback
          const g = trendingRes.data.trending_stocks.top_gainers || [];
          const l = trendingRes.data.trending_stocks.top_losers || [];
          allTrendingStocks = [...g, ...l];
        } else if (Array.isArray(trendingRes?.data)) {
          allTrendingStocks = trendingRes.data;
        } else if (Array.isArray(trendingRes)) {
          allTrendingStocks = trendingRes;
        }

        const trendingGainers = allTrendingStocks.filter(
          s => (s.price_change_percentage ?? s.percent_change ?? 0) >= 0
        );
        const trendingLosers = allTrendingStocks.filter(
          s => (s.price_change_percentage ?? s.percent_change ?? 0) < 0
        );

        // ---- BSE / NSE most active -----------------------------------------
        // Actual shape when data exists: { success, data: { success, data: [...] } }  (double-wrapped)
        // Current mock returns: { success, data: { success, message, data: {} } }
        const unwrap = (res: unknown): LooseStock[] => {
          const response = res as {
            data?: {
              data?: unknown[] | Record<string, unknown>;
            } | unknown[];
          } | unknown[];

          if (!res) return [];
          // Try double-unwrap first (real data format)
          const inner = (response as { data?: { data?: unknown[] | Record<string, unknown> } })?.data?.data;
          if (Array.isArray(inner)) return inner as LooseStock[];
          if (inner && typeof inner === 'object' && Object.keys(inner).length > 0) {
            return Object.values(inner) as LooseStock[];
          }
          // Single-unwrap
          if (Array.isArray((response as { data?: unknown[] })?.data)) return (response as { data: LooseStock[] }).data;
          if (Array.isArray(response)) return response as LooseStock[];
          return [];
        };

        const bseData = unwrap(bseRes);
        const nseData = unwrap(nseRes);

        // ---- Price shockers ------------------------------------------------
        let priceShockers: LooseStock[] = [];
        if (priceShockersRes?.success && priceShockersRes?.data) {
          priceShockers = [
            ...(priceShockersRes.data.BSE_PriceShocker || []),
            ...(priceShockersRes.data.NSE_PriceShocker || [])
          ];
        }

        logger.debug('Extracted data:', {
          trendingTotal: allTrendingStocks.length,
          gainers: trendingGainers.length,
          losers: trendingLosers.length,
          bseCount: bseData.length,
          nseCount: nseData.length,
          priceShockersCount: priceShockers.length,
          sample: allTrendingStocks[0],
        });

        setTrendingStocks(allTrendingStocks);
        setBseActive(bseData);
        setNseActive(nseData);

        // Combine all stocks for the main table/metrics
        const allStocksData = [
          ...allTrendingStocks,
          ...priceShockers.slice(0, 10)
        ];

        const toNumber = (value: string | number | undefined) => {
          if (typeof value === 'number') return value;
          return Number.parseFloat(value ?? '0') || 0;
        };

        const toInteger = (value: string | number | undefined) => {
          if (typeof value === 'number') return Math.trunc(value);
          return Number.parseInt(value ?? '0', 10) || 0;
        };


        // Transform API data to include ALL available fields with enhanced mapping
        const transformedStocks = allStocksData.map((stock, index) => {
          logger.debug(`Processing stock ${index}`, stock);
          
          return {
            id: index + 1,
            // Handle different API response formats for ticker/symbol
            ticker_id: stock.ticker_id || stock.tickerId || stock.ticker?.split('.')?.[0] || '',
            symbol: stock.ric?.split('.')[0] || stock.nseCode || stock.symbol || stock.ticker?.split('.')[0] || `STOCK${index + 1}`,
            
            // Company name with fallbacks
            company_name: stock.company_name || stock.displayName || stock.company || stock.name || `Company ${index + 1}`,
            sector_name: stock.sector_name || stock.sector || stock.industry || 'General',
            
            // Price data with comprehensive mapping
            current_price: toNumber(stock.price || stock.current_price || stock.ltp || stock.last_price),
            price_change_percentage: toNumber(stock.percent_change || stock.percentChange || stock.price_change_percentage),
            percent_change: toNumber(stock.percent_change || stock.percentChange || stock.price_change_percentage),
            net_change: toNumber(stock.net_change || stock.netChange || stock.change),
            
            // Trading data
            bid: toNumber(stock.bid),
            ask: toNumber(stock.ask),
            high: toNumber(stock.high),
            low: toNumber(stock.low),
            open: toNumber(stock.open),
            close: toNumber(stock.close),
            volume: toInteger(stock.volume),
            
            // Size and limit data
            bid_size: toInteger(stock.bid_size || stock.bidSize),
            ask_size: toInteger(stock.ask_size || stock.askSize),
            low_circuit_limit: toNumber(stock.low_circuit_limit || stock.lowCircuitLimit),
            up_circuit_limit: toNumber(stock.up_circuit_limit || stock.upCircuitLimit),
            
            // Exchange and lot data
            exchange_type: stock.exchange_type || stock.exchangeType || 'NSE',
            lot_size: toNumber(stock.lot_size || stock.lotSize || 1),
            
            // Rating and trend data
            overall_rating: stock.overall_rating || stock.overallRating || 'Neutral',
            short_term_trends: stock.short_term_trends || stock.short_term_trend || stock.shortTermTrends || 'Neutral',
            long_term_trends: stock.long_term_trends || stock.long_term_trend || stock.longTermTrends || 'Neutral',
            
            // 52-week range data
            year_low: toNumber(stock.year_low || stock.ylow || stock['52_week_low']),
            year_high: toNumber(stock.year_high || stock.yhigh || stock['52_week_high']),
            
            // Timestamp data
            date: stock.date || new Date().toISOString().split('T')[0],
            time: stock.time || new Date().toLocaleTimeString(),
            ric: stock.ric || stock.symbol || `${stock.company_name || 'UNKNOWN'}.NS`,
            
            // Additional metadata for enhanced display
            deviation: stock.deviation || stock.actualDeviation || null,
            averagePrice: stock.averagePrice || null,
            marketCap: stock.marketCap || stock.market_cap || null,
            description: stock.description || null,
            isInId: stock.isInId || stock.isin || null
          };
        });

        logger.info('Transformed stocks data', { count: transformedStocks.length });
        setStocks(transformedStocks); // Show ALL stocks from trending API (dynamic)
        
        // Calculate market metrics from real data
        if (transformedStocks.length > 0) {
          const gainersCount = transformedStocks.filter(stock => stock.percent_change > 0).length;
          const losersCount = transformedStocks.filter(stock => stock.percent_change < 0).length;
          const unchangedCount = transformedStocks.filter(stock => stock.percent_change === 0).length;
          
          const totalVolume = transformedStocks.reduce((sum, stock) => sum + stock.current_price, 0);
          const avgPrice = transformedStocks.length > 0 ? totalVolume / transformedStocks.length : 0;
          
          setMarketMetrics({
            gainers: gainersCount,
            losers: losersCount,
            unchanged: unchangedCount,
            totalVolume: (totalVolume / 1000).toFixed(1), // Convert to thousands
            avgPrice: avgPrice.toFixed(2)
          });
          
          // Calculate sector distribution
          const sectors: {[key: string]: number} = {};
          transformedStocks.forEach(stock => {
            sectors[stock.sector_name] = (sectors[stock.sector_name] || 0) + 1;
          });
          setSectorDistribution(sectors);
          
          // Populate 52-week high/low data from transformed stocks
          const highLowStocks: HighLowData[] = transformedStocks
            .filter(stock => stock.year_high > 0 && stock.year_low > 0) // Only stocks with valid 52-week data
            .sort((a, b) => {
              // Sort by performance: stocks closest to 52-week high first
              const aPerformance = ((a.current_price - a.year_low) / (a.year_high - a.year_low)) * 100;
              const bPerformance = ((b.current_price - b.year_low) / (b.year_high - b.year_low)) * 100;
              return bPerformance - aPerformance;
            })
            .slice(0, 10) // Top 10 performers
            .map(stock => ({
              symbol: stock.symbol,
              high_52_week: stock.year_high,
              low_52_week: stock.year_low,
              current_price: stock.current_price
            }));
          
          setHighLowData(highLowStocks);
          logger.debug('52-week high/low data populated', { count: highLowStocks.length });
        }
        
      } catch (err) {
        logger.error('Error loading stock data', err);
        setError('Failed to load stock data. Please check if the API server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);
  
  // Initialize GSAP animations
  useEffect(() => {
    if (!loading && isAnimationEnabled) {
      const refs = {
        dashboardRef,
        headerRef,
        metricsRef,
        sectorsRef,
        stocksRef
      };
      
      // Use the dedicated animation function instead of inline animations
      animateStocksDashboard(refs);
    }
  }, [loading, isAnimationEnabled]);

  // Initialize charts
  useEffect(() => {
    // Cleanup: destroy any chart tracked in our ref AND any orphaned charts
    // still attached to canvas elements (handles React Strict Mode double-invoke)
    chartInstances.current.forEach(chart => {
      try { chart?.destroy(); } catch {}
    });
    chartInstances.current = [];

    // Helper: destroy any existing Chart.js instance on a canvas before creating a new one
    const safeGetCtx = (ref: React.RefObject<HTMLCanvasElement>) => {
      if (!ref.current) return null;
      const existing = Chart.getChart(ref.current);
      if (existing) { try { existing.destroy(); } catch {} }
      return ref.current.getContext('2d');
    };

    if (!loading && sectorChartRef.current && gainersLosersChartRef.current && volumeChartRef.current && 
        bseVolumeChartRef.current && nseVolumeChartRef.current && bsePerformanceChartRef.current && nsePerformanceChartRef.current) {
      
      // Sector distribution chart (donut) - using real sector data
      const sectorCtx = safeGetCtx(sectorChartRef);
      if (sectorCtx && Object.keys(sectorDistribution).length > 0) {
        const sectorLabels = Object.keys(sectorDistribution);
        const sectorValues = Object.values(sectorDistribution);
        
        const sectorChart = new Chart(sectorCtx, {
          type: 'doughnut',
          data: {
            labels: sectorLabels,
            datasets: [{
              data: sectorValues,
              backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(34, 211, 238, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(34, 197, 94, 0.8)'
              ].slice(0, sectorLabels.length),
              borderWidth: 2,
              borderColor: 'rgba(31, 41, 55, 1)',
              hoverBorderWidth: 3,
              hoverBorderColor: 'rgba(255, 255, 255, 0.8)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(75, 85, 99, 1)',
                borderWidth: 1,
                callbacks: {
                  label: (context) => `${context.label}: ${context.raw} stocks (${((Number(Number(context.raw)) / sectorValues.reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%)`
                }
              }
            },
            animation: {
              animateRotate: true,
              duration: 1500
            }
          }
        });
        chartInstances.current.push(sectorChart);
      }
      
      // Gainers vs Losers chart (horizontal bar) - using real market metrics
      const gainersLosersCtx = safeGetCtx(gainersLosersChartRef);
      if (gainersLosersCtx && (marketMetrics.gainers > 0 || marketMetrics.losers > 0 || marketMetrics.unchanged > 0)) {
        const gainersLosersChart = new Chart(gainersLosersCtx, {
          type: 'bar',
          data: {
            labels: ['Gainers', 'Losers', 'Unchanged'],
            datasets: [{
              data: [marketMetrics.gainers, marketMetrics.losers, marketMetrics.unchanged],
              backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(107, 114, 128, 0.8)'
              ],
              borderColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(239, 68, 68, 1)', 
                'rgba(107, 114, 128, 1)'
              ],
              borderWidth: 2,
              borderRadius: 6,
              barThickness: 24
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(75, 85, 99, 1)',
                borderWidth: 1,
                callbacks: {
                  label: (context) => `${context.label}: ${context.raw} stocks`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11 }
                }
              },
              y: {
                grid: {
                  display: false
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 12, weight: 'bold' }
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
        chartInstances.current.push(gainersLosersChart);
      }
      
      // Volume chart (line) - using price trends from real stock data
      const volumeCtx = safeGetCtx(volumeChartRef);
      if (volumeCtx && stocks.length > 0) {
        // Use stock prices as a proxy for volume trend (up to 5 stocks or all if less)
        const chartStocksCount = Math.min(5, stocks.length);
        const priceData = stocks.slice(0, chartStocksCount).map(stock => stock.current_price / 100); // Scale down for chart
        const stockSymbols = stocks.slice(0, chartStocksCount).map(stock => stock.symbol);
        
        // Create gradient
        const gradient = volumeCtx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.6)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.3)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        
        const volumeChart = new Chart(volumeCtx, {
          type: 'line',
          data: {
            labels: stockSymbols,
            datasets: [{
              label: 'Price Trend (₹)',
              data: priceData,
              borderColor: 'rgb(99, 102, 241)',
              backgroundColor: gradient,
              borderWidth: 3,
              tension: 0.4,
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
              pointBackgroundColor: 'rgb(129, 140, 248)',
              pointBorderColor: 'rgb(99, 102, 241)',
              pointHoverBackgroundColor: 'rgba(255, 255, 255, 1)',
              pointHoverBorderColor: 'rgb(99, 102, 241)',
              pointBorderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: 'index'
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(75, 85, 99, 1)',
                borderWidth: 1,
                callbacks: {
                  label: (context) => `${context.label}: ₹${(Number(context.raw) * 100).toFixed(2)}`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11 }
                }
              },
              y: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11 },
                  callback: (value) => `₹${value}`
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
        chartInstances.current.push(volumeChart);
      }
      
      // BSE Volume Chart (bar chart showing volume by stock)
      const bseVolumeCtx = safeGetCtx(bseVolumeChartRef);
      if (bseVolumeCtx && bseActive.length > 0) {
        const bseVolumes = bseActive.slice(0, 5).map(stock => (stock.volume ?? 0) / 1000000); // Convert to millions
        const bseSymbols = bseActive.slice(0, 5).map(stock => stock.ticker?.split('.')[0] || stock.company?.substring(0, 8));
        
        const bseVolumeChart = new Chart(bseVolumeCtx, {
          type: 'bar',
          data: {
            labels: bseSymbols,
            datasets: [{
              label: 'Volume (Millions)',
              data: bseVolumes,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
              hoverBackgroundColor: 'rgba(59, 130, 246, 0.9)',
              hoverBorderColor: 'rgba(99, 102, 241, 1)',
              hoverBorderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 20,
                bottom: 10,
                left: 10,
                right: 10
              }
            },
            plugins: {
              legend: { 
                display: false 
              },
              tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(75, 85, 99, 1)',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => `Volume: ${Number(context.raw).toFixed(2)}M`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11, weight: 'bold' }
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11 },
                  callback: (value) => `${value}M`
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
        chartInstances.current.push(bseVolumeChart);
      }
      
      // NSE Volume Chart (bar chart)
      const nseVolumeCtx = safeGetCtx(nseVolumeChartRef);
      if (nseVolumeCtx && nseActive.length > 0) {
        const nseVolumes = nseActive.slice(0, 5).map(stock => (stock.volume ?? 0) / 1000000);
        const nseSymbols = nseActive.slice(0, 5).map(stock => stock.ticker?.split('.')[0] || stock.company?.substring(0, 8));
        
        const nseVolumeChart = new Chart(nseVolumeCtx, {
          type: 'bar',
          data: {
            labels: nseSymbols,
            datasets: [{
              label: 'Volume (Millions)',
              data: nseVolumes,
              backgroundColor: 'rgba(16, 185, 129, 0.8)',
              borderColor: 'rgba(16, 185, 129, 1)',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
              hoverBackgroundColor: 'rgba(16, 185, 129, 0.9)',
              hoverBorderColor: 'rgba(5, 150, 105, 1)',
              hoverBorderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 20,
                bottom: 10,
                left: 10,
                right: 10
              }
            },
            plugins: {
              legend: { 
                display: false 
              },
              tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(75, 85, 99, 1)',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => `Volume: ${Number(context.raw).toFixed(2)}M`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11, weight: 'bold' }
                }
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11 },
                  callback: (value) => `${value}M`
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
        chartInstances.current.push(nseVolumeChart);
      }
      
      // BSE Performance Chart (horizontal bar showing % change)
      const bsePerformanceCtx = safeGetCtx(bsePerformanceChartRef);
      if (bsePerformanceCtx && bseActive.length > 0) {
        const bseChanges = bseActive.slice(0, 6).map(stock => stock.percent_change || 0);
        const bseCompanies = bseActive.slice(0, 6).map(stock => stock.company?.substring(0, 12) || stock.ticker);
        
        const bsePerformanceChart = new Chart(bsePerformanceCtx, {
          type: 'bar',
          data: {
            labels: bseCompanies,
            datasets: [{
              data: bseChanges,
              backgroundColor: bseChanges.map(change => 
                change >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
              ),
              borderColor: bseChanges.map(change => 
                change >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
              ),
              borderWidth: 2,
              borderRadius: 6,
              hoverBorderWidth: 3,
              hoverBorderColor: bseChanges.map(change => 
                change >= 0 ? 'rgba(5, 150, 105, 1)' : 'rgba(220, 38, 38, 1)'
              )
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 10,
                bottom: 10,
                left: 20,
                right: 20
              }
            },
            plugins: {
              legend: { 
                display: false 
              },
              tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(75, 85, 99, 1)',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => `Change: ${Number(context.raw).toFixed(2)}%`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11 },
                  callback: (value) => `${value}%`
                }
              },
              y: {
                grid: {
                  display: false
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11, weight: 'bold' }
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
        chartInstances.current.push(bsePerformanceChart);
      }
      
      // NSE Performance Chart (horizontal bar)
      const nsePerformanceCtx = safeGetCtx(nsePerformanceChartRef);
      if (nsePerformanceCtx && nseActive.length > 0) {
        const nseChanges = nseActive.slice(0, 6).map(stock => stock.percent_change || 0);
        const nseCompanies = nseActive.slice(0, 6).map(stock => stock.company?.substring(0, 12) || stock.ticker);
        
        const nsePerformanceChart = new Chart(nsePerformanceCtx, {
          type: 'bar',
          data: {
            labels: nseCompanies,
            datasets: [{
              data: nseChanges,
              backgroundColor: nseChanges.map(change => 
                change >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
              ),
              borderColor: nseChanges.map(change => 
                change >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'
              ),
              borderWidth: 2,
              borderRadius: 6,
              hoverBorderWidth: 3,
              hoverBorderColor: nseChanges.map(change => 
                change >= 0 ? 'rgba(5, 150, 105, 1)' : 'rgba(220, 38, 38, 1)'
              )
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: 10,
                bottom: 10,
                left: 20,
                right: 20
              }
            },
            plugins: {
              legend: { 
                display: false 
              },
              tooltip: {
                backgroundColor: 'rgba(31, 41, 55, 0.9)',
                titleColor: 'rgba(255, 255, 255, 1)',
                bodyColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(75, 85, 99, 1)',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => `Change: ${Number(context.raw).toFixed(2)}%`
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.2)',
                  
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11 },
                  callback: (value) => `${value}%`
                }
              },
              y: {
                grid: {
                  display: false
                },
                ticks: {
                  color: 'rgba(156, 163, 175, 1)',
                  font: { size: 11, weight: 'bold' }
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
        chartInstances.current.push(nsePerformanceChart);
      }
    }
  }, [loading, stocks, marketMetrics, sectorDistribution, bseActive, nseActive]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Stock Market Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-10 bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-20"></div>
              </div>
            ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg rounded-xl p-6 h-72 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
          </div>
          
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg rounded-xl p-6 h-72 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Stock Market Dashboard</h1>
        
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-400">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
      <div ref={headerRef} className="mb-12">
        <div className="text-start">
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Stock Market Dashboard
          </h1>
          <p className="text-gray-300 mt-2 text-lg align-start">Real-time insights and analytics for the Indian stock market</p>
        </div>
      </div>
      
      {/* Market Metrics Cards */}
      <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <Card className="metric-card bg-gray-900/90 backdrop-blur-lg border-gray-700/50 text-white hover:bg-gray-700/50 transition-colors shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">₹{marketMetrics.totalVolume}K</p>
                <p className="text-sm text-green-400 mt-1 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>From {stocks.length} stocks</span>
                </p>
              </div>
              <div className="p-4 bg-indigo-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gray-900/90 backdrop-blur-lg border-gray-700/50 text-white hover:bg-gray-700/50 transition-colors shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">Avg Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">₹{marketMetrics.avgPrice}</p>
                <p className="text-sm text-blue-400 mt-1 flex items-center">
                  <BarChart2 className="w-4 h-4 mr-1" />
                  <span>Average stock price</span>
                </p>
              </div>
              <div className="p-4 bg-purple-500/20 rounded-lg">
                <BarChart2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gray-900/90 backdrop-blur-lg border-gray-700/50 text-white hover:bg-gray-700/50 transition-colors shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">Gainers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{marketMetrics.gainers}</p>
                <p className="text-sm text-green-400 mt-1 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>Positive change</span>
                </p>
              </div>
              <div className="p-4 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gray-900/90 backdrop-blur-lg border-gray-700/50 text-white hover:bg-gray-700/50 transition-colors shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">Losers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{marketMetrics.losers}</p>
                <p className="text-sm text-red-400 mt-1 flex items-center">
                  <ArrowDown className="w-4 h-4 mr-1" />
                  <span>Negative change</span>
                </p>
              </div>
              <div className="p-4 bg-red-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Data Sources Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <Card className="metric-card bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-200 font-semibold text-lg">Trending Stocks</h3>
                <p className="text-3xl font-bold text-white mt-2">{trendingStocks.length}</p>
              </div>
              <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-400/20 to-blue-600/20 text-blue-300 border border-blue-400/30">
                Live Data
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-200 font-semibold text-lg">BSE Most Active</h3>
                <p className="text-3xl font-bold text-white mt-2">{bseActive.length}</p>
              </div>
              <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-400/20 to-green-600/20 text-green-300 border border-green-400/30">
                BSE Live
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:bg-gray-700/50 transition-all duration-300 shadow-xl hover:shadow-2xl">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-200 font-semibold text-lg">NSE Most Active</h3>
                <p className="text-3xl font-bold text-white mt-2">{nseActive.length}</p>
              </div>
              <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-400/20 to-purple-600/20 text-purple-300 border border-purple-400/30">
                NSE Live
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12">
        {/* Featured Stocks - Left Column (2/3 width) */}
        <div ref={stocksRef} className="xl:col-span-2 space-y-6 lg:space-y-8">
          <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
            <CardHeader className="border-b border-gray-700 pb-3">
              <CardTitle className="text-white">Trending Stocks</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Exchange
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Change
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        High/Low
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        More Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedStocks.map((stock) => (
                      <tr key={stock.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Link 
                            href={`/stocks/${stock.symbol}`} 
                            className="font-medium text-indigo-400 hover:text-indigo-300"
                          >
                            {stock.symbol}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <div className="text-white font-medium">{stock.company_name}</div>
                            <div className="text-xs text-gray-400">{stock.sector_name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                            {stock.exchange_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col">
                            <div className="text-white font-medium">₹{stock.current_price.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">
                              O: ₹{stock.open.toFixed(2)} | C: ₹{stock.close.toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-4 whitespace-nowrap text-right font-medium ${
                          (stock.price_change_percentage || stock.percent_change || 0) >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`}>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center">
                              {(stock.price_change_percentage || stock.percent_change || 0) >= 0 ? (
                                <ArrowUp className="w-4 h-4 mr-1" />
                              ) : (
                                <ArrowDown className="w-4 h-4 mr-1" />
                              )}
                              <span>
                                {(stock.price_change_percentage || stock.percent_change || 0) >= 0 ? '+' : ''}
                                {(stock.price_change_percentage || stock.percent_change || 0).toFixed(2)}%
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              ₹{stock.net_change.toFixed(2)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col text-xs">
                            <div className="text-green-400">H: ₹{stock.high.toFixed(2)}</div>
                            <div className="text-red-400">L: ₹{stock.low.toFixed(2)}</div>
                            <div className="text-gray-400 text-[10px] mt-1">
                              52W: ₹{stock.year_low.toFixed(0)}-₹{stock.year_high.toFixed(0)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col text-xs">
                            <div className="text-white font-medium">
                              {(stock.volume / 1000000).toFixed(1)}M
                            </div>
                            <div className="text-gray-400">
                              Lot: {stock.lot_size}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              stock.overall_rating === 'Bullish' 
                                ? 'bg-green-900 text-green-200' 
                                : stock.overall_rating === 'Bearish'
                                ? 'bg-red-900 text-red-200'
                                : stock.overall_rating === 'Neutral'
                                ? 'bg-gray-700 text-gray-300'
                                : stock.overall_rating.includes('Bearish')
                                ? 'bg-red-900 text-red-200'
                                : 'bg-gray-700 text-gray-300'
                            }`}>
                              {stock.overall_rating}
                            </span>
                            <div className="text-[10px] text-gray-400">
                              ST: {stock.short_term_trends}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <div className="flex flex-col text-xs space-y-1">
                            <div className="text-gray-400">
                              Bid: ₹{stock.bid.toFixed(2)}
                            </div>
                            <div className="text-gray-400">
                              Ask: ₹{stock.ask.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {stock.date} {stock.time}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {stocks.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-gray-700 px-4 py-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-gray-400">
                    Showing <span className="text-white">{tableStartIndex + 1}</span> to{' '}
                    <span className="text-white">{Math.min(tableStartIndex + STOCKS_TABLE_PAGE_SIZE, stocks.length)}</span> of{' '}
                    <span className="text-white">{stocks.length}</span> stocks
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStocksTablePage((prev) => Math.max(1, prev - 1))}
                      disabled={stocksTablePage === 1}
                      className="rounded-md border border-gray-600 px-3 py-1.5 text-sm text-gray-200 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-2 text-sm text-gray-300">
                      Page {stocksTablePage} of {totalStocksPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStocksTablePage((prev) => Math.min(totalStocksPages, prev + 1))}
                      disabled={stocksTablePage === totalStocksPages}
                      className="rounded-md border border-gray-600 px-3 py-1.5 text-sm text-gray-200 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Stock Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stocks.slice(0, Math.min(2, stocks.length)).map((stock) => (
              <Card key={stock.id} className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">{stock.company_name}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {stock.symbol}
                      </CardDescription>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stock.overall_rating === 'Bullish' 
                        ? 'bg-green-900 text-green-200' 
                        : stock.overall_rating === 'Bearish'
                        ? 'bg-red-900 text-red-200'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {stock.overall_rating}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Current Price</h4>
                      <p className="text-2xl font-bold text-white">₹{stock.current_price.toLocaleString()}</p>
                      <p className={`text-sm ${(stock.price_change_percentage || stock.percent_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {(stock.price_change_percentage || stock.percent_change || 0) >= 0 ? '+' : ''}
                        {(stock.price_change_percentage || stock.percent_change || 0).toFixed(2)}% (₹{stock.net_change.toFixed(2)})
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Day Range</h4>
                      <p className="text-white">₹{stock.low.toFixed(2)} - ₹{stock.high.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">Open: ₹{stock.open.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Trading Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Volume</h4>
                      <p className="text-white font-medium">{stock.volume.toLocaleString()}</p>
                      <p className="text-sm text-gray-400">Lot Size: {stock.lot_size}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Bid/Ask</h4>
                      <p className="text-white">₹{stock.bid.toFixed(2)} / ₹{stock.ask.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">Size: {stock.bid_size} / {stock.ask_size}</p>
                    </div>
                  </div>

                  {/* Circuit Limits */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Circuit Limits</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-sm text-white">₹{stock.low_circuit_limit.toFixed(2)}</span>
                      </div>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full relative">
                        <div 
                          className="h-2 bg-gradient-to-r from-red-500 to-green-500 rounded-full" 
                          style={{
                            width: `${((stock.current_price - stock.low_circuit_limit) / (stock.up_circuit_limit - stock.low_circuit_limit)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-white">₹{stock.up_circuit_limit.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trends */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Short Term</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stock.short_term_trends === 'Bullish' 
                          ? 'bg-green-900 text-green-200' 
                          : stock.short_term_trends === 'Bearish'
                          ? 'bg-red-900 text-red-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {stock.short_term_trends}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Long Term</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stock.long_term_trends === 'Bullish' 
                          ? 'bg-green-900 text-green-200' 
                          : stock.long_term_trends === 'Bearish'
                          ? 'bg-red-900 text-red-200'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {stock.long_term_trends}
                      </span>
                    </div>
                  </div>

                  {/* 52-Week Range */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">52-Week Range</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">₹{stock.year_low.toFixed(2)}</span>
                      <div className="flex-1 mx-4 h-2 bg-gray-700 rounded-full relative">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{
                            width: `${((stock.current_price - stock.year_low) / (stock.year_high - stock.year_low)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-white">₹{stock.year_high.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      Last updated: {stock.date} at {stock.time} • Exchange: {stock.exchange_type}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg font-semibold">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-red-400 rounded-full mr-3"></div>
                  Gainers vs Losers
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">Today&apos;s market movement distribution</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="chart-container h-56 relative rounded-lg bg-black/20 p-4">
                  <canvas ref={gainersLosersChartRef} className="rounded-lg" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg font-semibold">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3"></div>
                  Price Trend
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">Top 5 stocks price comparison</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="chart-container h-56 relative rounded-lg bg-black/20 p-4">
                  <canvas ref={volumeChartRef} className="rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Market Insights - Right Column (1/3 width) */}
        <div ref={sectorsRef} className="space-y-6 lg:space-y-8">
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center text-lg font-semibold">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full mr-3"></div>
                Sector Distribution
              </CardTitle>
              <CardDescription className="text-gray-300 text-sm">Market capitalization breakdown</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="chart-container h-64 flex items-center justify-center relative rounded-lg bg-black/20 p-4 mb-6">
                <canvas ref={sectorChartRef} className="rounded-lg" />
              </div>
              <div className="space-y-4">{paginatedSectorEntries.map(([sector, count], index) => (
                  <div key={sector} className="flex justify-between items-center p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center">
                      <span 
                        className="w-4 h-4 rounded-full mr-3 shadow-lg" 
                        style={{ 
                          backgroundColor: [
                            'rgba(99, 102, 241, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(34, 211, 238, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)',
                            'rgba(168, 85, 247, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(34, 197, 94, 0.8)'
                          ][(sectorStartIndex + index) % 10] 
                        }}
                      ></span>
                      <span className="text-gray-200 font-medium">{sector}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold">{count}</span>
                      <span className="text-gray-400 text-sm">stocks</span>
                    </div>
                  </div>
                ))}
              </div>

              {sectorEntries.length > SECTOR_CARD_PAGE_SIZE && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-700/70 pt-3">
                  <span className="text-xs text-gray-400">
                    {sectorStartIndex + 1}-{Math.min(sectorStartIndex + SECTOR_CARD_PAGE_SIZE, sectorEntries.length)} of {sectorEntries.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSectorCardPage((prev) => Math.max(1, prev - 1))}
                      disabled={sectorCardPage === 1}
                      className="rounded-md border border-gray-600 p-1.5 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous sector page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-gray-300">{sectorCardPage}/{totalSectorPages}</span>
                    <button
                      type="button"
                      onClick={() => setSectorCardPage((prev) => Math.min(totalSectorPages, prev + 1))}
                      disabled={sectorCardPage === totalSectorPages}
                      className="rounded-md border border-gray-600 p-1.5 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next sector page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Stock Performance</CardTitle>
              <CardDescription className="text-gray-400">Price Change % by Stock</CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {paginatedPerformanceStocks.map((stock) => (
                <div 
                  key={stock.id} 
                  className="px-6 py-3 border-b border-gray-700 last:border-0"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">{stock.symbol}</span>
                    <span className={`text-sm font-medium ${
                      (stock.price_change_percentage || stock.percent_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(stock.price_change_percentage || stock.percent_change || 0) >= 0 ? '+' : ''}{(stock.price_change_percentage || stock.percent_change || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                    <div 
                      className={`h-1.5 rounded-full ${
                        (stock.price_change_percentage || stock.percent_change || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs((stock.price_change_percentage || stock.percent_change || 0)) * 10, 100)}%`,
                        minWidth: '2%'
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {stocks.length > PERFORMANCE_CARD_PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-gray-700 px-6 py-3">
                  <span className="text-xs text-gray-400">
                    {performanceStartIndex + 1}-{Math.min(performanceStartIndex + PERFORMANCE_CARD_PAGE_SIZE, stocks.length)} of {stocks.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPerformanceCardPage((prev) => Math.max(1, prev - 1))}
                      disabled={performanceCardPage === 1}
                      className="rounded-md border border-gray-600 p-1.5 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous stock performance page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-gray-300">{performanceCardPage}/{totalPerformancePages}</span>
                    <button
                      type="button"
                      onClick={() => setPerformanceCardPage((prev) => Math.min(totalPerformancePages, prev + 1))}
                      disabled={performanceCardPage === totalPerformancePages}
                      className="rounded-md border border-gray-600 p-1.5 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next stock performance page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">52-Week High/Low Range</CardTitle>
              <CardDescription className="text-gray-400">Top performers with position indicators</CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {paginatedHighLowData.map((stock, index) => (
                <div 
                  key={stock.symbol || index} 
                  className="px-6 py-3 border-b border-gray-700 last:border-0 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 font-medium">{stock.symbol}</span>
                    <span className="text-white text-sm font-bold">₹{stock.current_price?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span className="text-green-400">High: ₹{stock.high_52_week?.toFixed(2) || 'N/A'}</span>
                    <span className="text-red-400">Low: ₹{stock.low_52_week?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 relative">
                    {stock.high_52_week && stock.low_52_week && stock.current_price && (
                      <>
                        <div 
                          className="h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"
                          style={{ 
                            width: `${((stock.current_price - stock.low_52_week) / (stock.high_52_week - stock.low_52_week)) * 100}%`
                          }}
                        ></div>
                        <div 
                          className="absolute top-0 w-1 h-2 bg-white rounded-full shadow-sm"
                          style={{ 
                            left: `${((stock.current_price - stock.low_52_week) / (stock.high_52_week - stock.low_52_week)) * 100}%`,
                            transform: 'translateX(-50%)'
                          }}
                        ></div>
                      </>
                    )}
                  </div>
                  {stock.high_52_week && stock.low_52_week && stock.current_price && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {(((stock.current_price - stock.low_52_week) / (stock.high_52_week - stock.low_52_week)) * 100).toFixed(1)}% from 52W low
                    </div>
                  )}
                </div>
              ))}

              {highLowData.length > HIGH_LOW_CARD_PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-gray-700 px-6 py-3">
                  <span className="text-xs text-gray-400">
                    {highLowStartIndex + 1}-{Math.min(highLowStartIndex + HIGH_LOW_CARD_PAGE_SIZE, highLowData.length)} of {highLowData.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setHighLowCardPage((prev) => Math.max(1, prev - 1))}
                      disabled={highLowCardPage === 1}
                      className="rounded-md border border-gray-600 p-1.5 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Previous 52-week range page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-gray-300">{highLowCardPage}/{totalHighLowPages}</span>
                    <button
                      type="button"
                      onClick={() => setHighLowCardPage((prev) => Math.min(totalHighLowPages, prev + 1))}
                      disabled={highLowCardPage === totalHighLowPages}
                      className="rounded-md border border-gray-600 p-1.5 text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next 52-week range page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>

      {/* Enhanced Stock Cards Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">📈 Detailed Stock Analysis</CardTitle>
            <CardDescription className="text-gray-400">
              Comprehensive stock data with technical analysis and market insights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {stocks.slice(0, 18).map((stock) => (
                <EnhancedStockCard
                  key={stock.id}
                  stock={stock}
                  price_change_percentage={(stock.price_change_percentage || stock.percent_change || 0) || stock.percent_change || 0}
                  showAllData={true}
                />
              ))}
            </div>
            
            {stocks.length > 18 && (
              <div className="mt-8 text-center">
                <Link
                  href="/stocks/all"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  View All {stocks.length} Stocks
                  <ArrowUp className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* BSE Most Active Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-white flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mr-4"></div>
            <BarChart2 className="w-7 h-7 mr-3 text-blue-400" />
            BSE Most Active Stocks
          </h2>
          
          {/* BSE Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg font-semibold">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mr-3"></div>
                  BSE Volume Leaders
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">Top 5 stocks by trading volume</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="h-56 relative rounded-lg bg-black/20 p-4">
                  <canvas ref={bseVolumeChartRef} className="rounded-lg" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg font-semibold">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mr-3"></div>
                  BSE Performance
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">Price change % comparison</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="h-56 relative rounded-lg bg-black/20 p-4">
                  <canvas ref={bsePerformanceChartRef} className="rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* BSE Stock Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {bseActive.map((stock, index) => (
              <Card key={stock.ticker || index} className="bg-gray-900/90 backdrop-blur-lg border-gray-700/50 hover:bg-gray-700/50 transition-colors shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{stock.company}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {stock.ticker} • Volume: {stock.volume?.toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">₹{stock.price?.toFixed(2)}</div>
                      <div className={`text-sm font-medium flex items-center ${
                        (stock.percent_change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(stock.percent_change ?? 0) >= 0 ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 mr-1" />
                        )}
                        {(stock.percent_change ?? 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">High/Low:</span>
                      <span className="text-white">₹{stock.high?.toFixed(2)} / ₹{stock.low?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Open/Close:</span>
                      <span className="text-white">₹{stock.open?.toFixed(2)} / ₹{stock.close?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">52W Range:</span>
                      <span className="text-white">₹{stock['52_week_low']?.toFixed(2)} - ₹{stock['52_week_high']?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rating:</span>
                      <span className={`font-medium ${
                        stock.overall_rating === 'Bullish' ? 'text-green-400' :
                        stock.overall_rating === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {stock.overall_rating}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Trends:</span>
                      <span className="text-gray-300 text-xs">
                        ST: {stock.short_term_trend} | LT: {stock.long_term_trend}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* NSE Most Active Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
          <h2 className="text-3xl font-bold mb-8 text-white flex items-center">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mr-4"></div>
            <TrendingUp className="w-7 h-7 mr-3 text-green-400" />
            NSE Most Active Stocks
          </h2>
          
          {/* NSE Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg font-semibold">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mr-3"></div>
                  NSE Volume Leaders
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">Top 5 stocks by trading volume</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="h-56 relative rounded-lg bg-black/20 p-4">
                  <canvas ref={nseVolumeChartRef} className="rounded-lg" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border-gray-700/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center text-lg font-semibold">
                  <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mr-3"></div>
                  NSE Performance
                </CardTitle>
                <CardDescription className="text-gray-300 text-sm">Price change % comparison</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="h-56 relative rounded-lg bg-black/20 p-4">
                  <canvas ref={nsePerformanceChartRef} className="rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* NSE Stock Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {nseActive.map((stock, index) => (
              <Card key={stock.ticker || index} className="bg-gray-900/90 backdrop-blur-lg border-gray-700/50 hover:bg-gray-700/50 transition-colors shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{stock.company}</CardTitle>
                      <CardDescription className="text-gray-400">
                        {stock.ticker} • Volume: {stock.volume?.toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">₹{stock.price?.toFixed(2)}</div>
                      <div className={`text-sm font-medium flex items-center ${
                        (stock.percent_change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(stock.percent_change ?? 0) >= 0 ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 mr-1" />
                        )}
                        {(stock.percent_change ?? 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">High/Low:</span>
                      <span className="text-white">₹{stock.high?.toFixed(2)} / ₹{stock.low?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Open/Close:</span>
                      <span className="text-white">₹{stock.open?.toFixed(2)} / ₹{stock.close?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">52W Range:</span>
                      <span className="text-white">₹{stock['52_week_low']?.toFixed(2)} - ₹{stock['52_week_high']?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rating:</span>
                      <span className={`font-medium ${
                        stock.overall_rating === 'Bullish' ? 'text-green-400' :
                        stock.overall_rating === 'Bearish' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {stock.overall_rating}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Trends:</span>
                      <span className="text-gray-300 text-xs">
                        ST: {stock.short_term_trend} | LT: {stock.long_term_trend}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BSE vs NSE Comparison Section */}
      {bseActive.length > 0 && nseActive.length > 0 && (
        <section className="mb-8">
          <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-6 border border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-6 text-white flex items-center">
              <PieChart className="w-6 h-6 mr-2 text-purple-400" />
              BSE vs NSE Market Comparison
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Market Summary Cards */}
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">BSE Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Stocks:</span>
                        <span className="text-white font-medium">{bseActive.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Volume:</span>
                        <span className="text-white font-medium">
                          {(bseActive.reduce((sum, stock) => sum + (stock.volume || 0), 0) / bseActive.length / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gainers:</span>
                        <span className="text-green-400 font-medium">
                          {bseActive.filter(stock => (stock.percent_change || 0) >= 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Losers:</span>
                        <span className="text-red-400 font-medium">
                          {bseActive.filter(stock => (stock.percent_change || 0) < 0).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">NSE Summary</CardTitle>  
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Stocks:</span>
                        <span className="text-white font-medium">{nseActive.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Avg Volume:</span>
                        <span className="text-white font-medium">
                          {(nseActive.reduce((sum, stock) => sum + (stock.volume || 0), 0) / nseActive.length / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gainers:</span>
                        <span className="text-green-400 font-medium">
                          {nseActive.filter(stock => (stock.percent_change || 0) >= 0).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Losers:</span>
                        <span className="text-red-400 font-medium">
                          {nseActive.filter(stock => (stock.percent_change || 0) < 0).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Top Performers Comparison */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 shadow-lg h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white">Top Performers by Exchange</CardTitle>
                    <CardDescription className="text-gray-400">Best and worst performing stocks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* BSE Top Performer */}
                      <div>
                        <h4 className="text-sm font-medium text-blue-400 mb-3">BSE Top Gainer</h4>
                        {(() => {
                          const topBseGainer = bseActive.sort((a, b) => (b.percent_change || 0) - (a.percent_change || 0))[0];
                          return topBseGainer ? (
                            <div className="bg-gray-700/50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-white">{topBseGainer.company}</span>
                                <span className="text-green-400 font-bold">+{topBseGainer.percent_change?.toFixed(2)}%</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                ₹{topBseGainer.price?.toFixed(2)} • Vol: {((topBseGainer.volume ?? 0) / 1000000).toFixed(1)}M
                              </div>
                            </div>
                          ) : <div className="text-gray-500">No data available</div>;
                        })()}
                        
                        <h4 className="text-sm font-medium text-red-400 mb-3 mt-4">BSE Top Loser</h4>
                        {(() => {
                          const topBseLoser = bseActive.sort((a, b) => (a.percent_change || 0) - (b.percent_change || 0))[0];
                          return topBseLoser ? (
                            <div className="bg-gray-700/50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-white">{topBseLoser.company}</span>
                                <span className="text-red-400 font-bold">{topBseLoser.percent_change?.toFixed(2)}%</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                ₹{topBseLoser.price?.toFixed(2)} • Vol: {((topBseLoser.volume ?? 0) / 1000000).toFixed(1)}M
                              </div>
                            </div>
                          ) : <div className="text-gray-500">No data available</div>;
                        })()}
                      </div>
                      
                      {/* NSE Top Performer */}
                      <div>
                        <h4 className="text-sm font-medium text-green-400 mb-3">NSE Top Gainer</h4>
                        {(() => {
                          const topNseGainer = nseActive.sort((a, b) => (b.percent_change || 0) - (a.percent_change || 0))[0];
                          return topNseGainer ? (
                            <div className="bg-gray-700/50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-white">{topNseGainer.company}</span>
                                <span className="text-green-400 font-bold">+{topNseGainer.percent_change?.toFixed(2)}%</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                ₹{topNseGainer.price?.toFixed(2)} • Vol: {((topNseGainer.volume ?? 0) / 1000000).toFixed(1)}M
                              </div>
                            </div>
                          ) : <div className="text-gray-500">No data available</div>;
                        })()}
                        
                        <h4 className="text-sm font-medium text-red-400 mb-3 mt-4">NSE Top Loser</h4>
                        {(() => {
                          const topNseLoser = nseActive.sort((a, b) => (a.percent_change || 0) - (b.percent_change || 0))[0];
                          return topNseLoser ? (
                            <div className="bg-gray-700/50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-white">{topNseLoser.company}</span>
                                <span className="text-red-400 font-bold">{topNseLoser.percent_change?.toFixed(2)}%</span>
                              </div>
                              <div className="text-sm text-gray-400">
                                ₹{topNseLoser.price?.toFixed(2)} • Vol: {((topNseLoser.volume ?? 0) / 1000000).toFixed(1)}M
                              </div>
                            </div>
                          ) : <div className="text-gray-500">No data available</div>;
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}