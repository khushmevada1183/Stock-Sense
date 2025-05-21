'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });

export default function AlertsNewsPageClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Market Alerts</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Important market alerts, breaking news, and critical updates that may impact your investments
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
          {/* Breaking News Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-red-500 rounded-sm mr-2"></span>
              Breaking News
            </h2>
            <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
              <div className="flex items-center mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white">RBI Announces Emergency Rate Hike</h3>
              </div>
              <p className="text-gray-300 mb-3">
                The Reserve Bank of India has announced an emergency 50 basis point hike in the repo rate to combat rising inflation. 
                This unexpected move comes ahead of the scheduled monetary policy meeting.
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-400">Posted 35 minutes ago</span>
                <a href="#" className="text-blue-400 hover:underline">Read full story</a>
              </div>
            </div>
            <FeaturedNews />
          </section>
          
          {/* Market Alerts Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-yellow-500 rounded-sm mr-2"></span>
              Market Alerts
            </h2>
            <div className="space-y-4">
              {[
                {
                  title: 'Nifty Breaks Key Support Level',
                  description: 'The Nifty index has broken below the crucial support level of 21,500, signaling potential further downside.',
                  time: '2 hours ago',
                  category: 'Technical',
                  impact: 'high'
                },
                {
                  title: 'SEBI Announces New Margin Rules',
                  description: 'The Securities and Exchange Board of India has announced new margin requirements for F&O trading, effective next month.',
                  time: '4 hours ago',
                  category: 'Regulatory',
                  impact: 'medium'
                },
                {
                  title: 'IT Sector Under Pressure After US Tech Selloff',
                  description: 'Indian IT stocks are facing selling pressure following a major selloff in US technology stocks overnight.',
                  time: '5 hours ago',
                  category: 'Sectoral',
                  impact: 'medium'
                },
                {
                  title: 'Crude Oil Surges 5% on Supply Concerns',
                  description: 'Crude oil prices have jumped 5% due to escalating tensions in the Middle East, potentially impacting fuel prices.',
                  time: '6 hours ago',
                  category: 'Commodity',
                  impact: 'high'
                }
              ].map((alert) => (
                <div key={alert.title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{alert.title}</h3>
                    <div className="flex items-center">
                      <span className={`text-xs px-2 py-1 rounded mr-2 ${
                        alert.category === 'Technical' ? 'bg-purple-900/30 text-purple-300 border border-purple-800' :
                        alert.category === 'Regulatory' ? 'bg-blue-900/30 text-blue-300 border border-blue-800' :
                        alert.category === 'Sectoral' ? 'bg-green-900/30 text-green-300 border border-green-800' :
                        'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
                      }`}>
                        {alert.category}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alert.impact === 'high' ? 'bg-red-900/30 text-red-300 border border-red-800' :
                        alert.impact === 'medium' ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800' :
                        'bg-green-900/30 text-green-300 border border-green-800'
                      }`}>
                        {alert.impact.charAt(0).toUpperCase() + alert.impact.slice(1)} Impact
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">{alert.description}</p>
                  <div className="text-sm text-gray-500">{alert.time}</div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Recent Updates Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-blue-500 rounded-sm mr-2"></span>
              Recent Updates
            </h2>
            <MarketNews />
          </section>
        </div>
        
        {/* Sidebar - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-6">
          {/* Trending Topics */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Trending Topics</h3>
            <TrendingTopics />
          </div>
          
          {/* Alert Settings */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Alert Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Price Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Breaking News</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Technical Alerts</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Regulatory Updates</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          {/* Custom Alert */}
          <div className="bg-blue-900/30 rounded-xl border border-blue-800 p-4">
            <h3 className="text-lg font-bold mb-2">Create Custom Alert</h3>
            <p className="text-sm text-gray-300 mb-4">Set up personalized alerts for stocks, indices, or news topics</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Alert Type</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white">
                  <option>Price Alert</option>
                  <option>News Alert</option>
                  <option>Technical Alert</option>
                  <option>Volume Alert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Symbol/Topic</label>
                <input 
                  type="text" 
                  placeholder="e.g., RELIANCE, Nifty, Budget" 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                />
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors">
                Create Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 