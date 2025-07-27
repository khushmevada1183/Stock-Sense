'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });
const SectorNews = dynamic(() => import('@/components/News/SectorNews'), { ssr: false });

export default function EconomyNewsPageClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Economy News</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Stay updated with the latest economic policies, indicators, and financial insights
        </p>
      </div>
      
      {/* News Category Tabs */}
      <div className="mb-8">
        <NewsCategoryTabs />
      </div>
      
      {/* Main content and sidebar layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - 3/4 width on large screens */}
        <div className="lg:col-span-3 space-y-8">
          {/* Featured News Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-blue-500 rounded-sm mr-2"></span>
              Economic Highlights
            </h2>
            <FeaturedNews />
          </section>
          
          {/* Economic Indicators Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-yellow-500 rounded-sm mr-2"></span>
              Key Economic Indicators
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Indicator Cards */}
              {[
                { name: 'GDP Growth', value: '7.2%', change: '+0.3%', trend: 'up' },
                { name: 'Inflation (CPI)', value: '5.1%', change: '-0.2%', trend: 'down' },
                { name: 'Repo Rate', value: '6.5%', change: '0%', trend: 'neutral' },
                { name: 'Forex Reserves', value: '$642B', change: '+$1.2B', trend: 'up' },
                { name: 'Current Account', value: '-1.8%', change: '+0.2%', trend: 'up' },
                { name: 'Fiscal Deficit', value: '5.8%', change: '-0.1%', trend: 'down' }
              ].map((indicator) => (
                <div key={indicator.name} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-1">{indicator.name}</div>
                  <div className="text-xl font-bold text-white mb-1">
                    {indicator.value}
                  </div>
                  <div className={`text-xs flex items-center ${
                    indicator.trend === 'up' ? 'text-green-400' : 
                    indicator.trend === 'down' ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {indicator.trend === 'up' ? '↑' : 
                     indicator.trend === 'down' ? '↓' : 
                     '→'} {indicator.change}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Policy News Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-green-500 rounded-sm mr-2"></span>
              Policy Updates
            </h2>
            <MarketNews />
          </section>
          
          {/* Global Economy Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-purple-500 rounded-sm mr-2"></span>
              Global Economy
            </h2>
            <SectorNews />
          </section>
        </div>
        
        {/* Sidebar - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-6">
          {/* Trending Topics */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Trending Topics</h3>
            <TrendingTopics />
          </div>
          
          {/* Economic Calendar */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Economic Calendar</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">GDP Data Release</span>
                <span className="text-xs text-gray-400">Jun 15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Inflation Report</span>
                <span className="text-xs text-gray-400">Jun 12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">RBI Policy Meeting</span>
                <span className="text-xs text-gray-400">Jun 5-7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Budget Session</span>
                <span className="text-xs text-gray-400">Jul 1</span>
              </div>
            </div>
          </div>
          
          {/* Currency Rates */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Currency Exchange</h3>
            <div className="space-y-3">
              {[
                { pair: 'USD/INR', rate: '82.65', change: '+0.12' },
                { pair: 'EUR/INR', rate: '89.37', change: '-0.08' },
                { pair: 'GBP/INR', rate: '104.92', change: '+0.25' },
                { pair: 'JPY/INR', rate: '0.54', change: '-0.01' }
              ].map((currency) => (
                <div key={currency.pair} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{currency.pair}</span>
                  <div className="flex items-center">
                    <span className="text-sm text-white mr-2">{currency.rate}</span>
                    <span className={`text-xs ${
                      parseFloat(currency.change) > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {currency.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 