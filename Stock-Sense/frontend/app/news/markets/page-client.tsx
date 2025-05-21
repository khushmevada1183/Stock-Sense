'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });

export default function MarketsNewsPageClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Markets News</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Stay updated with the latest market movements, stock performance, and trading insights
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
              Market Highlights
            </h2>
            <FeaturedNews />
          </section>
          
          {/* Market News Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-green-500 rounded-sm mr-2"></span>
              Today&apos;s Market Updates
            </h2>
            <MarketNews />
          </section>
          
          {/* Market Indices Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-yellow-500 rounded-sm mr-2"></span>
              Market Indices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Index Cards */}
              {['NIFTY 50', 'SENSEX', 'NIFTY BANK', 'NIFTY IT', 'NIFTY AUTO', 'NIFTY PHARMA'].map((index) => (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-white">{index}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      index === 'NIFTY IT' || index === 'NIFTY AUTO' 
                        ? 'bg-red-900/30 text-red-400 border border-red-800' 
                        : 'bg-green-900/30 text-green-400 border border-green-800'
                    }`}>
                      {index === 'NIFTY IT' || index === 'NIFTY AUTO' ? '-0.82%' : '+1.24%'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {Math.floor(Math.random() * 10000) + 15000}
                  </div>
                  <div className="text-sm text-gray-400">
                    {index === 'NIFTY IT' || index === 'NIFTY AUTO' 
                      ? `↓ ${Math.floor(Math.random() * 100) + 50}` 
                      : `↑ ${Math.floor(Math.random() * 100) + 50}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        
        {/* Sidebar - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-6">
          {/* Trending Topics */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Trending Topics</h3>
            <TrendingTopics />
          </div>
          
          {/* Market Calendar */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Market Calendar</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">RBI Policy Meeting</span>
                <span className="text-xs text-gray-400">Jun 5-7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Q1 Results Season</span>
                <span className="text-xs text-gray-400">Jul 15-Aug 15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Budget Session</span>
                <span className="text-xs text-gray-400">Jul 1</span>
              </div>
            </div>
          </div>
          
          {/* Top Movers */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Top Movers Today</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm text-green-400 font-medium mb-2">Top Gainers</h4>
                <div className="space-y-2">
                  {['HDFC Bank', 'Reliance', 'TCS'].map((stock) => (
                    <div key={stock} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{stock}</span>
                      <span className="text-xs text-green-400">+{(Math.random() * 5 + 1).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm text-red-400 font-medium mb-2">Top Losers</h4>
                <div className="space-y-2">
                  {['Infosys', 'Maruti', 'Wipro'].map((stock) => (
                    <div key={stock} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{stock}</span>
                      <span className="text-xs text-red-400">-{(Math.random() * 5 + 1).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 