'use client';

import React from 'react';

// Mock data for portfolio
const mockPortfolioData = {
  summary: {
    totalValue: 12750000, // 12.75 L
    totalInvestment: 10000000, // 10 L
    totalProfitLoss: 2750000, // 27.5% gain
    totalProfitLossPercent: 27.5,
    dayGain: 125000, // 1.25 L today
    dayGainPercent: 1.02,
    holdings: 8,
    unrealizedGain: 2750000,
    realizedGain: 450000
  },
  holdings: [
    {
      symbol: "RELIANCE",
      company: "Reliance Industries Ltd",
      quantity: 500,
      avgPrice: 2245.50,
      currentPrice: 2890.75,
      marketValue: 1445375,
      profitLoss: 322625,
      profitLossPercent: 28.74,
      dayChange: 45.20,
      dayChangePercent: 1.59,
      sector: "Oil & Gas"
    },
    {
      symbol: "TCS",
      company: "Tata Consultancy Services Ltd",
      quantity: 300,
      avgPrice: 3456.00,
      currentPrice: 4125.30,
      marketValue: 1237590,
      profitLoss: 200790,
      profitLossPercent: 19.37,
      dayChange: -25.80,
      dayChangePercent: -0.62,
      sector: "IT Services"
    },
    {
      symbol: "HDFCBANK",
      company: "HDFC Bank Ltd",
      quantity: 800,
      avgPrice: 1425.75,
      currentPrice: 1687.90,
      marketValue: 1350320,
      profitLoss: 209720,
      profitLossPercent: 18.38,
      dayChange: 12.45,
      dayChangePercent: 0.74,
      sector: "Banking"
    },
    {
      symbol: "INFY",
      company: "Infosys Ltd",
      quantity: 600,
      avgPrice: 1534.20,
      currentPrice: 1789.65,
      marketValue: 1073790,
      profitLoss: 153270,
      profitLossPercent: 16.66,
      dayChange: 8.90,
      dayChangePercent: 0.50,
      sector: "IT Services"
    },
    {
      symbol: "ICICIBANK",
      company: "ICICI Bank Ltd",
      quantity: 900,
      avgPrice: 834.60,
      currentPrice: 1045.25,
      marketValue: 940725,
      profitLoss: 189585,
      profitLossPercent: 25.24,
      dayChange: -15.30,
      dayChangePercent: -1.44,
      sector: "Banking"
    },
    {
      symbol: "HINDUNILVR",
      company: "Hindustan Unilever Ltd",
      quantity: 400,
      avgPrice: 2234.80,
      currentPrice: 2567.40,
      marketValue: 1026960,
      profitLoss: 133040,
      profitLossPercent: 14.88,
      dayChange: 18.75,
      dayChangePercent: 0.74,
      sector: "FMCG"
    }
  ]
};

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatLargeNumber = (value: number): string => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return formatCurrency(value);
};

const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export default function PortfolioPage() {
  const { summary, holdings } = mockPortfolioData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850">
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Portfolio Overview
          </h1>
          <p className="text-gray-400 text-lg">Track your investments and monitor performance</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Value */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-neon-400/30 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-medium">Total Value</h3>
                <div className="w-3 h-3 bg-neon-400 rounded-full"></div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{formatLargeNumber(summary.totalValue)}</p>
                <p className="text-sm text-gray-400">Investment: {formatLargeNumber(summary.totalInvestment)}</p>
              </div>
            </div>
          </div>

          {/* Total P&L */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-green-400/30 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-medium">Total P&L</h3>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-neon-400">+{formatLargeNumber(summary.totalProfitLoss)}</p>
                <p className="text-sm text-neon-400">{formatPercent(summary.totalProfitLossPercent)}</p>
              </div>
            </div>
          </div>

          {/* Day Change */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-blue-400/30 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-medium">Day Change</h3>
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-blue-400">+{formatLargeNumber(summary.dayGain)}</p>
                <p className="text-sm text-blue-400">{formatPercent(summary.dayGainPercent)}</p>
              </div>
            </div>
          </div>

          {/* Holdings Count */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-purple-400/30 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-medium">Holdings</h3>
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-white">{summary.holdings}</p>
                <p className="text-sm text-gray-400">Active stocks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white">Your Holdings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Qty</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Avg Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Current Price</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Market Value</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">P&L</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Day Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {holdings.map((stock, index) => (
                  <tr key={stock.symbol} className="hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-neon-400 to-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-black font-bold text-sm">{stock.symbol.substring(0, 2)}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{stock.symbol}</p>
                            <p className="text-gray-400 text-sm">{stock.sector}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{stock.quantity.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">₹{stock.avgPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">₹{stock.currentPrice.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold">{formatLargeNumber(stock.marketValue)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className={`font-medium ${stock.profitLoss >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                          {stock.profitLoss >= 0 ? '+' : ''}{formatLargeNumber(stock.profitLoss)}
                        </div>
                        <div className={`text-sm ${stock.profitLoss >= 0 ? 'text-neon-400' : 'text-red-400'}`}>
                          {formatPercent(stock.profitLossPercent)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className={`font-medium ${stock.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stock.dayChange >= 0 ? '+' : ''}₹{stock.dayChange.toFixed(2)}
                        </div>
                        <div className={`text-sm ${stock.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatPercent(stock.dayChangePercent)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unrealized vs Realized */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Gains Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Unrealized Gains</span>
                <span className="text-neon-400 font-bold">{formatLargeNumber(summary.unrealizedGain)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Realized Gains</span>
                <span className="text-green-400 font-bold">{formatLargeNumber(summary.realizedGain)}</span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Best Performer</span>
                <span className="text-neon-400 font-bold">RELIANCE (+28.74%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Return</span>
                <span className="text-green-400 font-bold">{formatPercent(summary.totalProfitLossPercent)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 