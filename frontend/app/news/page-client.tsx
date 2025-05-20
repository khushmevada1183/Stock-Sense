/* eslint-disable react/no-unescaped-entities */
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const SectorNews = dynamic(() => import('@/components/News/SectorNews'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });

export default function NewsPageClient() {
  return (
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
      <div className="flex flex-col space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-white">Market News</h1>
          <p className="text-gray-300">
          Stay updated with the latest market news, sector updates, and financial insights.
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
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-neon-400 rounded-sm mr-2"></span>
              Featured News
            </h2>
            <FeaturedNews />
          </section>
          
          {/* Market News Section */}
          <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-neon-400 rounded-sm mr-2"></span>
              Latest Market Updates
            </h2>
            <MarketNews />
          </section>
          
          {/* Sector News Section */}
          <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-cyan-500 rounded-sm mr-2"></span>
              Sector News
            </h2>
            <SectorNews />
          </section>
        </div>
        
        {/* Sidebar - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-6">
          {/* Trending Topics */}
            <div className="bg-gray-850 rounded-xl border border-gray-800 p-4 glass">
              <h3 className="text-lg font-bold mb-4 text-white">Trending Topics</h3>
            <TrendingTopics />
          </div>
          
          {/* Market Calendar */}
            <div className="bg-gray-850 rounded-xl border border-gray-800 p-4 glass">
              <h3 className="text-lg font-bold mb-4 text-white">Market Calendar</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">RBI Policy Meeting</span>
                <span className="text-xs text-gray-400">Jun 5-7</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Q1 Results Season</span>
                <span className="text-xs text-gray-400">Jul 15-Aug 15</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Budget Session</span>
                <span className="text-xs text-gray-400">Jul 1</span>
              </div>
            </div>
          </div>
          
          {/* Newsletter Signup */}
            <div className="bg-gray-850 rounded-xl border border-neon-400/20 p-4 glass-premium">
              <h3 className="text-lg font-bold mb-2 text-white">Daily Market Digest</h3>
            <p className="text-sm text-gray-300 mb-4">Get the day's top financial stories delivered to your inbox</p>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                  className="w-full px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm focus:ring-1 focus:ring-neon-400 focus:border-neon-400"
              />
                <button className="w-full bg-neon-400 hover:bg-neon-300 text-black py-2 rounded-lg text-sm transition-colors hover:shadow-neon-sm">
                Subscribe
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}