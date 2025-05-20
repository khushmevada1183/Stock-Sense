'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Chart, registerables } from 'chart.js';
import { ArrowUp, ArrowDown, TrendingUp, BarChart2, PieChart, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import { stockService } from '@/services/api';
import { useAnimation } from '@/animations/shared/AnimationContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { animateStocksDashboard } from '@/animations/pages/stocksAnimations';
import mockMarketData from '@/utils/mockMarketData';

// Register Chart.js components
Chart.register(...registerables);

// Use mock data from the imported file
const { sectorData, marketMetrics, indices, topIndianStocks, weeklyVolumeData } = mockMarketData;

interface Stock {
  id: number;
  symbol: string;
  company_name: string;
  sector_name: string;
  current_price: number;
  price_change_percentage: number;
}

export default function StocksIndexPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
  
  // Get animation context
  const { isAnimationEnabled } = useAnimation();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        // Use mock data instead of API call
        setStocks(topIndianStocks);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading stocks:', err);
        setError('Failed to load stocks data');
        setLoading(false);
      }
    };

    fetchStocks();
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
    if (!loading && sectorChartRef.current && gainersLosersChartRef.current && volumeChartRef.current) {
      // Sector distribution chart (donut)
      const sectorCtx = sectorChartRef.current.getContext('2d');
      if (sectorCtx) {
        new Chart(sectorCtx, {
          type: 'doughnut',
          data: {
            labels: sectorData.map(d => d.sector),
            datasets: [{
              data: sectorData.map(d => d.marketCap),
              backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(34, 211, 238, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
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
            }
          }
        });
      }
      
      // Gainers vs Losers chart (horizontal bar)
      const gainersLosersCtx = gainersLosersChartRef.current.getContext('2d');
      if (gainersLosersCtx) {
        new Chart(gainersLosersCtx, {
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
              borderWidth: 0,
              borderRadius: 4,
              barThickness: 20
            }]
          },
          options: {
            indexAxis: 'y',
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.1)'
                }
              },
              y: {
                grid: {
                  display: false
                }
              }
            },
            animation: {
              duration: 2000
            }
          }
        });
      }
      
      // Volume chart (line)
      const volumeCtx = volumeChartRef.current.getContext('2d');
      if (volumeCtx) {
        // Use the weekly volume data from our mock data
        const volumes = weeklyVolumeData.map(item => item.volume);
        const dates = weeklyVolumeData.map(item => item.date);
        
        // Create gradient
        const gradient = volumeCtx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
        
        new Chart(volumeCtx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: 'Volume (₹ Trillion)',
              data: volumes,
              borderColor: 'rgb(99, 102, 241)',
              backgroundColor: gradient,
              tension: 0.3,
              fill: true,
              pointRadius: 3,
              pointBackgroundColor: 'rgb(129, 140, 248)'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              x: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.1)'
                }
              },
              y: {
                grid: {
                  color: 'rgba(75, 85, 99, 0.1)'
                },
                ticks: {
                  callback: (value) => `${value}T`
                }
              }
            }
          }
        });
      }
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Stock Market Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-10 bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-20"></div>
              </div>
            ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 h-72 animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="h-48 bg-gray-700 rounded"></div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 h-72 animate-pulse">
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
    <div ref={dashboardRef} className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
      <div ref={headerRef} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Stock Market Dashboard</h1>
            <p className="text-gray-300 mt-1">Real-time insights and analytics for the Indian stock market</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link 
            href="/stocks/search"
              className="px-4 py-2 bg-neon-400 hover:bg-neon-300 text-black font-medium rounded-lg transition-colors shadow-neon-sm hover:shadow-neon"
          >
            Search Stocks
          </Link>
        </div>
      </div>
      
      {/* Market Metrics Cards */}
      <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="metric-card bg-gray-800 border-gray-700 text-white hover:bg-gray-700/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">₹{marketMetrics.marketCap}T</p>
                <p className="text-sm text-green-400 mt-1 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+2.1% this week</span>
                </p>
              </div>
              <div className="p-4 bg-indigo-500/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gray-800 border-gray-700 text-white hover:bg-gray-700/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">₹{marketMetrics.volume}T</p>
                <p className="text-sm text-green-400 mt-1 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+8.3% today</span>
                </p>
              </div>
              <div className="p-4 bg-purple-500/20 rounded-lg">
                <BarChart2 className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gray-800 border-gray-700 text-white hover:bg-gray-700/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">P/E Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{marketMetrics.peRatio}</p>
                <p className="text-sm text-red-400 mt-1 flex items-center">
                  <ArrowDown className="w-4 h-4 mr-1" />
                  <span>-1.2% this month</span>
                </p>
              </div>
              <div className="p-4 bg-cyan-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="metric-card bg-gray-800 border-gray-700 text-white hover:bg-gray-700/50 transition-colors">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-gray-300">Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{marketMetrics.volatility}%</p>
                <p className="text-sm text-yellow-400 mt-1 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+3.5% change</span>
                </p>
              </div>
              <div className="p-4 bg-pink-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-pink-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Indices Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {indices.slice(0, 4).map(index => (
          <Card 
            key={index.name} 
            className="metric-card bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-colors"
          >
            <CardContent className="pt-6">
              <h3 className="text-gray-300 font-medium">{index.name}</h3>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xl font-bold text-white">{index.value.toLocaleString()}</p>
                <p className={`px-2 py-1 rounded text-sm font-medium ${
                  index.change >= 0 
                    ? 'bg-green-400/20 text-green-400' 
                    : 'bg-red-400/20 text-red-400'
                }`}>
                  {index.change >= 0 ? '+' : ''}{index.change}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Stocks - Left Column (2/3 width) */}
        <div ref={stocksRef} className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="border-b border-gray-700 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Trending Stocks</CardTitle>
                <Link href="/stocks/search" className="text-sm text-indigo-400 hover:text-indigo-300">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Company
              </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Sector
              </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Price
              </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Change
              </th>
            </tr>
          </thead>
                  <tbody className="divide-y divide-gray-700">
                    {(Array.isArray(stocks) ? stocks.slice(0, 5) : []).map((stock) => (
                      <tr key={stock.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link 
                    href={`/stocks/${stock.symbol}`} 
                            className="font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    {stock.symbol}
                  </Link>
                </td>
                        <td className="px-6 py-4 text-white">
                  {stock.company_name}
                </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                  {stock.sector_name}
                </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-white font-medium">
                  ₹{stock.current_price.toLocaleString()}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right font-medium ${
                  stock.price_change_percentage >= 0 
                            ? 'text-green-400' 
                            : 'text-red-400'
                }`}>
                          <div className="flex items-center justify-end">
                            {stock.price_change_percentage >= 0 ? (
                              <ArrowUp className="w-4 h-4 mr-1" />
                            ) : (
                              <ArrowDown className="w-4 h-4 mr-1" />
                            )}
                            <span>
                  {stock.price_change_percentage >= 0 ? '+' : ''}
                  {stock.price_change_percentage.toFixed(2)}%
                            </span>
                          </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Gainers vs Losers</CardTitle>
                <CardDescription className="text-gray-400">Today&apos;s market movement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="chart-container h-44">
                  <canvas ref={gainersLosersChartRef} />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Trading Volume</CardTitle>
                <CardDescription className="text-gray-400">7-day trend (₹ in Trillion)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="chart-container h-44">
                  <canvas ref={volumeChartRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Market Insights - Right Column (1/3 width) */}
        <div ref={sectorsRef} className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Sector Distribution</CardTitle>
              <CardDescription className="text-gray-400">% Market Capitalization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="chart-container h-48 flex items-center justify-center">
                <canvas ref={sectorChartRef} />
              </div>
              <div className="mt-4 space-y-3">
                {sectorData.map((sector, index) => (
                  <div key={sector.sector} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ 
                          backgroundColor: [
                            'rgba(99, 102, 241, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(236, 72, 153, 0.8)',
                            'rgba(34, 211, 238, 0.8)',
                            'rgba(16, 185, 129, 0.8)',
                            'rgba(245, 158, 11, 0.8)',
                            'rgba(239, 68, 68, 0.8)'
                          ][index % 7] 
                        }}
                      ></span>
                      <span className="text-gray-300 text-sm">{sector.sector}</span>
                    </div>
                    <div className="text-white text-sm font-medium">
                      {sector.marketCap}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Sector Performance</CardTitle>
              <CardDescription className="text-gray-400">YTD Growth % by Sector</CardDescription>
            </CardHeader>
            <CardContent className="px-0 py-0">
              {sectorData.map((sector) => (
                <div 
                  key={sector.sector} 
                  className="px-6 py-3 border-b border-gray-700 last:border-0"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300">{sector.sector}</span>
                    <span className={`text-sm font-medium ${
                      sector.growth >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {sector.growth >= 0 ? '+' : ''}{sector.growth}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-1">
                    <div 
                      className={`h-1.5 rounded-full ${
                        sector.growth >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: `${Math.abs(sector.growth) * 4}%`,
                        maxWidth: '100%'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 