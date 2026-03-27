"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  BarChart3, 
  PieChart, 
  Target,
  Shield,
  Activity,
  Eye,
  Plus,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import * as stockApi from '@/api/api';
import { logger } from '@/lib/logger';

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Helper function to format percentage
const formatPercent = (value: number | undefined): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00%';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// Helper function to format large numbers
const formatLargeNumber = (value: number): string => {
  if (value >= 10000000) { // 1 crore
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) { // 1 lakh
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) { // 1 thousand
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return formatCurrency(value);
};

const PortfolioDashboard = () => {
  const [holdings, setHoldings] = useState<any[]>([]); // Changed type to any[] as StockHolding is removed
  const [summary, setSummary] = useState<any | null>(null); // Changed type to any | null
  const [isLoading, setIsLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get mock data
        const holdingsData = await stockApi.getPortfolioHoldings();
        const summaryData = await stockApi.getPortfolioSummary();
        
        setHoldings(holdingsData.holdings || []);
        setSummary(summaryData.summary || null);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Animation effect for dashboard elements
  useEffect(() => {
    if (!isLoading && dashboardRef.current) {
      const cards = dashboardRef.current.querySelectorAll('.dashboard-card');
      
      // Simple fade-in animation without GSAP
      cards.forEach((card, index) => {
        const element = card as HTMLElement;
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100 * index); // Staggered timing
      });
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
        <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="min-h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-neon-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-300">Loading your portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
        <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="bg-red-900/20 backdrop-blur-lg border border-red-800/50 rounded-xl p-6 text-center glass">
            <h3 className="text-lg font-medium text-red-400">Portfolio Unavailable</h3>
            <p className="mt-2 text-red-300/80">Unable to load your portfolio data. Please try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-300 transition-all duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div ref={dashboardRef} className="container mx-auto px-4 py-6 relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-2 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Portfolio Dashboard</h1>
              <p className="text-gray-300 mt-1">
                Track your investments and monitor performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200">
                <RefreshCw size={20} />
              </button>
              <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200">
                <Download size={20} />
              </button>
              <button className="p-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Total Value Card */}
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Portfolio Value</p>
                <p className="text-2xl font-bold text-white mt-1">{formatLargeNumber(summary.totalValue || 0)}</p>
              </div>
              <div className="p-3 bg-neon-400/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-neon-400" />
              </div>
            </div>
          </div>

          {/* Total Gain/Loss Card */}
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total P&L</p>
                <p className={`text-2xl font-bold mt-1 ${(summary.totalProfitLoss || 0) >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                  {formatLargeNumber(summary.totalProfitLoss || 0)}
                </p>
                <p className={`text-sm mt-1 ${(summary.totalProfitLoss || 0) >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                  {formatPercent(summary.totalProfitLossPercent)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${(summary.totalProfitLoss || 0) >= 0 ? 'bg-neon-400/10' : 'bg-red-400/10'}`}>
                {(summary.totalProfitLoss || 0) >= 0 ? 
                  <TrendingUp className="w-6 h-6 text-neon-400" /> : 
                  <TrendingDown className="w-6 h-6 text-red-400" />
                }
              </div>
            </div>
          </div>

          {/* Day Change Card */}
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Day Change</p>
                <p className={`text-2xl font-bold mt-1 ${(summary.dayGain || 0) >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                  {formatLargeNumber(summary.dayGain || 0)}
                </p>
                <p className={`text-sm mt-1 ${(summary.dayGain || 0) >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                  {formatPercent(summary.dayGainPercent)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${(summary.dayGain || 0) >= 0 ? 'bg-neon-400/10' : 'bg-red-400/10'}`}>
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Holdings Count Card */}
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Holdings</p>
                <p className="text-2xl font-bold text-white mt-1">{Array.isArray(holdings) ? holdings.length : 0}</p>
                <p className="text-sm text-gray-400 mt-1">Active stocks</p>
              </div>
              <div className="p-3 bg-blue-400/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
        {/* Portfolio Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Analysis Card */}
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Risk Analysis</h3>
              <Shield className="w-5 h-5 text-neon-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Conservative</span>
                <span className="text-gray-400">Aggressive</span>
              </div>
              <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
                <div 
                  className="absolute h-3 w-3 bg-white rounded-full -mt-0.5 transform -translate-x-1/2 border-2 border-gray-900"
                  style={{ 
                    left: summary.riskProfile === 'Low' ? '20%' : 
                           summary.riskProfile === 'Moderately Aggressive' ? '60%' : 
                           summary.riskProfile === 'Aggressive' ? '80%' : '90%' 
                  }}
                ></div>
              </div>
              <div className="text-center">
                <span className="text-white font-medium">{summary.riskProfile || 'Moderate'}</span>
                <p className="text-gray-400 text-xs mt-1">Risk Level</p>
              </div>
            </div>
          </div>

          {/* Performance Score Card */}
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance</h3>
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-800"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${((summary.valuationScore || 3) / 5) * 251.2} 251.2`}
                    className="text-neon-400"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neon-400">{summary.valuationScore || 3.0}</div>
                    <div className="text-xs text-gray-400">/ 5.0</div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">Good Performance</p>
                <p className="text-gray-400 text-xs">Overall Score</p>
              </div>
            </div>
          </div>

          {/* Sector Allocation Card */}
          <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Diversification</h3>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {summary.sectorAllocation && summary.sectorAllocation.length >= 3 ? (
                    <>
                      <circle cx="50" cy="50" r="35" fill="transparent" stroke="#39FF14" strokeWidth="12" strokeDasharray={`${summary.sectorAllocation[0].percentage * 2.2} 220`} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="35" fill="transparent" stroke="#00C2CB" strokeWidth="12" strokeDasharray={`${summary.sectorAllocation[1].percentage * 2.2} 220`} strokeDashoffset={`${-summary.sectorAllocation[0].percentage * 2.2}`} transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="35" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray={`${summary.sectorAllocation[2].percentage * 2.2} 220`} strokeDashoffset={`${-(summary.sectorAllocation[0].percentage + summary.sectorAllocation[1].percentage) * 2.2}`} transform="rotate(-90 50 50)" />
                    </>
                  ) : (
                    <circle cx="50" cy="50" r="35" fill="transparent" stroke="#374151" strokeWidth="12" />
                  )}
                </svg>
              </div>
              <div className="ml-4 space-y-2">
                {summary.sectorAllocation && summary.sectorAllocation.length >= 3 ? (
                  <>
                    <div className="flex items-center text-xs">
                      <span className="w-2 h-2 bg-neon-400 rounded-full mr-2"></span>
                      <span className="text-gray-300">{summary.sectorAllocation[0].name}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                      <span className="text-gray-300">{summary.sectorAllocation[1].name}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      <span className="text-gray-300">{summary.sectorAllocation[2].name}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-xs">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Holdings Table */}
        <div className="bg-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-xl p-6 glass dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Your Holdings</h3>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-neon-400/10 hover:bg-neon-400/20 border border-neon-400/30 rounded-lg text-neon-400 transition-all duration-200 text-sm font-medium">
                <Plus className="w-4 h-4 inline mr-2" />
                Add Stock
              </button>
              <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-all duration-200 text-sm">
                Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left border-b border-gray-800">
                  <th className="pb-4 text-gray-400 font-medium text-sm">Stock</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">Price</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">Change</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">Quantity</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">Value</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">P&L</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">P&L %</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">P/E</th>
                  <th className="pb-4 text-gray-400 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(holdings) && holdings.length > 0 ? holdings.map((stock, index) => (
                  <tr key={stock.symbol || index} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-400 to-cyan-500 rounded-lg flex items-center justify-center text-black font-bold text-xs">
                          {stock.symbol?.substring(0, 2) || 'ST'}
                        </div>
                        <div>
                          <Link href={`/stocks/${stock.symbol}`} className="text-white hover:text-neon-400 font-medium transition-colors duration-200">
                            {stock.symbol}
                          </Link>
                          <p className="text-gray-400 text-xs mt-0.5">NSE</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-white font-medium">{formatCurrency(stock.lastPrice)}</span>
                    </td>
                    <td className="py-4">
                      <div className={`flex items-center space-x-1 ${stock.change >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                        {stock.change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        <span className="font-medium">{stock.change.toFixed(2)}</span>
                        <span className="text-xs">({formatPercent(stock.changePercent)})</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-300">{stock.quantity}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-white font-medium">{formatLargeNumber(stock.marketValue)}</span>
                    </td>
                    <td className="py-4">
                      <span className={`font-medium ${stock.profitLoss >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                        {stock.profitLoss >= 0 ? '+' : ''}{formatLargeNumber(stock.profitLoss)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${stock.profitLossPercent >= 0 ? 'bg-neon-400/10 text-neon-400' : 'bg-red-400/10 text-red-400'}`}>
                        {formatPercent(stock.profitLossPercent)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-gray-300">{stock.pe?.toFixed(2) || 'N/A'}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors duration-200">
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors duration-200">
                          <Settings size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="w-12 h-12 text-gray-600 mb-3" />
                        <h3 className="text-gray-400 font-medium mb-1">No Holdings Found</h3>
                        <p className="text-gray-500 text-sm mb-4">Start building your portfolio by adding your first stock</p>
                        <button className="px-6 py-2 bg-neon-400 hover:bg-neon-500 text-black font-medium rounded-lg transition-colors duration-200">
                          Add Your First Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard; 