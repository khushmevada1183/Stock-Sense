"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ChevronRight, DollarSign, Percent, BarChart3, PieChart } from 'lucide-react';
import { getMockHoldings, getMockPortfolioSummary, StockHolding, PortfolioSummary } from '@/services/mockPortfolioService';

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
const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

const PortfolioDashboard = () => {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get mock data
        const holdingsData = getMockHoldings();
        const summaryData = getMockPortfolioSummary();
        
        setHoldings(holdingsData);
        setSummary(summaryData);
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
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-neon-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Failed to load portfolio data</h3>
        <p className="mt-2 text-red-600 dark:text-red-300">Please try refreshing the page</p>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="space-y-8">
      {/* Portfolio Summary Header */}
      <div className="dashboard-card bg-gray-950 glass-premium rounded-xl p-6 shadow-neon-sm border border-neon-400/10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{formatCurrency(summary.totalValue)}</h1>
            <div className="flex items-center mt-2">
              <span className={`text-lg font-medium ${summary.totalProfitLoss >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                {summary.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalProfitLoss)} ({formatPercent(summary.totalProfitLossPercent)})
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Day Gain</span>
              <span className={`font-medium ${summary.dayGain >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                {summary.dayGain >= 0 ? '+' : ''}{formatCurrency(summary.dayGain)} ({formatPercent(summary.dayGainPercent)})
              </span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-gray-400 mr-2">Total Gain</span>
              <span className={`font-medium ${summary.totalProfitLoss >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                {formatCurrency(summary.totalProfitLoss)} ({formatPercent(summary.totalProfitLossPercent)})
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Profile Card */}
        <div className="dashboard-card bg-gray-850 glass rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-serif text-neon-400 mb-4">Risk Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Low</span>
              <span className="text-gray-400">High</span>
            </div>
            <div className="relative h-3 bg-gradient-to-r from-neon-400 via-cyan-500 to-red-500 rounded-full">
              <div 
                className="absolute h-5 w-5 bg-white rounded-full -mt-1 transform -translate-x-1/2 border-4 border-gray-850"
                style={{ 
                  left: summary.riskProfile === 'Low' ? '15%' : 
                         summary.riskProfile === 'Moderately Aggressive' ? '50%' : 
                         summary.riskProfile === 'Aggressive' ? '75%' : '90%' 
                }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <span className="text-white font-medium">{summary.riskProfile}</span>
            </div>
          </div>
        </div>
        
        {/* Valuation Card */}
        <div className="dashboard-card bg-gray-850 glass rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-serif text-neon-400 mb-4">Valuation</h3>
          <div className="space-y-4">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-neon-400 h-3 rounded-full" 
                style={{ width: `${(summary.valuationScore / 5) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <span className="block text-2xl font-bold text-neon-400">{summary.valuationScore}</span>
                <span className="text-gray-400 text-sm">Score</span>
              </div>
              <div className="text-right">
                <span className="block text-white font-medium">Near Fair</span>
                <span className="text-gray-400">Value</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Diversity Card */}
        <div className="dashboard-card bg-gray-850 glass rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-serif text-neon-400 mb-4">Diversity</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              {/* Simple donut chart */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#39FF14" strokeWidth="20" strokeDasharray={`${summary.sectorAllocation[0].percentage * 2.51} 251`} transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#00C2CB" strokeWidth="20" strokeDasharray={`${summary.sectorAllocation[1].percentage * 2.51} 251`} strokeDashoffset={`${-summary.sectorAllocation[0].percentage * 2.51}`} transform="rotate(-90 50 50)" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="20" strokeDasharray={`${summary.sectorAllocation[2].percentage * 2.51} 251`} strokeDashoffset={`${-(summary.sectorAllocation[0].percentage + summary.sectorAllocation[1].percentage) * 2.51}`} transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="20" fontWeight="bold">
                  {summary.sectorAllocation[0].percentage.toFixed(1)}%
                </text>
              </svg>
            </div>
            <div className="ml-4">
              <div className="flex items-center mb-2">
                <span className="w-3 h-3 bg-neon-400 rounded-full mr-2"></span>
                <span className="text-gray-300">{summary.sectorAllocation[0].name}</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="w-3 h-3 bg-cyan-500 rounded-full mr-2"></span>
                <span className="text-gray-300">{summary.sectorAllocation[1].name}</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                <span className="text-gray-300">{summary.sectorAllocation[2].name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Holdings Table */}
      <div className="dashboard-card bg-gray-850 glass rounded-xl p-6 shadow-lg overflow-x-auto">
        <h3 className="text-lg font-mono font-bold text-neon-400 mb-4">Your Holdings</h3>
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-800">
              <th className="pb-3">Symbol</th>
              <th className="pb-3">Last Price</th>
              <th className="pb-3">Change</th>
              <th className="pb-3">Shares</th>
              <th className="pb-3">Market Value</th>
              <th className="pb-3">Total Chg</th>
              <th className="pb-3">Total Chg %</th>
              <th className="pb-3">P/E</th>
              <th className="pb-3">EPS</th>
              <th className="pb-3">Book Val</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((stock) => (
              <tr key={stock.symbol} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-4">
                  <Link href={`/stocks/${stock.symbol}`} className="text-neon-400 hover:text-neon-300 font-medium">
                    {stock.symbol}
                  </Link>
                </td>
                <td className="py-4">{formatCurrency(stock.lastPrice)}</td>
                <td className={`py-4 ${stock.change >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                  <div className="flex items-center">
                    {stock.change >= 0 ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
                    {stock.change.toFixed(2)} ({formatPercent(stock.changePercent)})
                  </div>
                </td>
                <td className="py-4">{stock.quantity}</td>
                <td className="py-4">{formatCurrency(stock.marketValue)}</td>
                <td className={`py-4 ${stock.profitLoss >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                  {stock.profitLoss >= 0 ? '+' : ''}{formatCurrency(stock.profitLoss)}
                </td>
                <td className={`py-4 ${stock.profitLossPercent >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                  {formatPercent(stock.profitLossPercent)}
                </td>
                <td className="py-4">{stock.pe.toFixed(2)}</td>
                <td className="py-4">{stock.eps.toFixed(2)}</td>
                <td className="py-4">{stock.bookValue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioDashboard; 