'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });
const SectorNews = dynamic(() => import('@/components/News/SectorNews'), { ssr: false });

export default function TrendingNewsPageClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Trending News</h1>
        <p className="text-gray-500 dark:text-gray-400">
          The most discussed and trending financial topics and market movements
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
              Trending Stories
            </h2>
            <FeaturedNews />
          </section>
          
          {/* Trending Topics Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-yellow-500 rounded-sm mr-2"></span>
              Hot Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  topic: 'RBI Policy Impact', 
                  mentions: 2453,
                  sentiment: 'neutral',
                  tags: ['monetary policy', 'interest rates', 'inflation']
                },
                { 
                  topic: 'Tech Layoffs', 
                  mentions: 1876,
                  sentiment: 'negative',
                  tags: ['IT sector', 'employment', 'recession']
                },
                { 
                  topic: 'IPO Market Revival', 
                  mentions: 1562,
                  sentiment: 'positive',
                  tags: ['startups', 'public offerings', 'valuations']
                },
                { 
                  topic: 'Crypto Regulation', 
                  mentions: 1423,
                  sentiment: 'neutral',
                  tags: ['bitcoin', 'regulation', 'digital assets']
                }
              ].map((topic) => (
                <div key={topic.topic} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{topic.topic}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      topic.sentiment === 'positive' ? 'bg-green-900/30 text-green-400 border border-green-800' : 
                      topic.sentiment === 'negative' ? 'bg-red-900/30 text-red-400 border border-red-800' : 
                      'bg-blue-900/30 text-blue-400 border border-blue-800'
                    }`}>
                      {topic.sentiment.charAt(0).toUpperCase() + topic.sentiment.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 mb-3">
                    {topic.mentions.toLocaleString()} mentions in the last 24 hours
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topic.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Social Media Buzz Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-green-500 rounded-sm mr-2"></span>
              Social Media Buzz
            </h2>
            <MarketNews />
          </section>
          
          {/* Trending Sectors Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-purple-500 rounded-sm mr-2"></span>
              Trending Sectors
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
          
          {/* Trending Stocks */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Trending Stocks</h3>
            <div className="space-y-3">
              {[
                { symbol: 'RELIANCE', name: 'Reliance Industries', change: '+2.5%', volume: '2.3M' },
                { symbol: 'HDFCBANK', name: 'HDFC Bank', change: '+1.8%', volume: '1.8M' },
                { symbol: 'INFY', name: 'Infosys', change: '-1.2%', volume: '1.5M' },
                { symbol: 'TCS', name: 'Tata Consultancy', change: '+0.8%', volume: '1.1M' },
                { symbol: 'TATAMOTORS', name: 'Tata Motors', change: '+3.2%', volume: '3.2M' }
              ].map((stock) => (
                <div key={stock.symbol} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-400">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${stock.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change}
                    </div>
                    <div className="text-xs text-gray-400">Vol: {stock.volume}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Trending Hashtags */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Trending Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { tag: 'StockMarket', count: 12500 },
                { tag: 'FinTech', count: 8700 },
                { tag: 'Investing', count: 7800 },
                { tag: 'IPO', count: 6500 },
                { tag: 'RBIPolicy', count: 5900 },
                { tag: 'Budget2023', count: 5200 },
                { tag: 'TechStocks', count: 4800 },
                { tag: 'CryptoNews', count: 4500 },
                { tag: 'MarketCrash', count: 4100 },
                { tag: 'BullMarket', count: 3800 }
              ].map((hashtag) => (
                <div 
                  key={hashtag.tag} 
                  className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>#{hashtag.tag}</span>
                  <span className="text-gray-500 text-[10px]">{(hashtag.count / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 