'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });

export default function CompaniesNewsPageClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">Companies News</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Stay updated with the latest corporate announcements, earnings reports, and company updates
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
              Corporate Highlights
            </h2>
            <FeaturedNews />
          </section>
          
          {/* Earnings Calendar Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-yellow-500 rounded-sm mr-2"></span>
              Upcoming Earnings
            </h2>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Company</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Date</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Expected EPS</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Previous EPS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { company: 'Reliance Industries', date: 'Jun 15', expectedEps: '₹15.2', previousEps: '₹14.8' },
                      { company: 'HDFC Bank', date: 'Jun 18', expectedEps: '₹8.7', previousEps: '₹8.3' },
                      { company: 'TCS', date: 'Jun 20', expectedEps: '₹12.1', previousEps: '₹11.6' },
                      { company: 'Infosys', date: 'Jun 22', expectedEps: '₹6.8', previousEps: '₹6.5' },
                      { company: 'Bharti Airtel', date: 'Jun 25', expectedEps: '₹3.2', previousEps: '₹2.8' }
                    ].map((earning, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-3 px-4 text-sm text-white">{earning.company}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{earning.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{earning.expectedEps}</td>
                        <td className="py-3 px-4 text-sm text-gray-300">{earning.previousEps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          
          {/* Company News Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-green-500 rounded-sm mr-2"></span>
              Latest Company Updates
            </h2>
            <MarketNews />
          </section>
          
          {/* Corporate Actions Section */}
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="inline-block w-1.5 h-6 bg-purple-500 rounded-sm mr-2"></span>
              Corporate Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { 
                  company: 'Reliance Industries', 
                  action: 'Dividend', 
                  details: '₹8 per share',
                  exDate: 'Jun 22, 2023',
                  recordDate: 'Jun 24, 2023'
                },
                { 
                  company: 'TCS', 
                  action: 'Buyback', 
                  details: '₹4,500 per share',
                  exDate: 'Jul 5, 2023',
                  recordDate: 'Jul 7, 2023'
                },
                { 
                  company: 'Infosys', 
                  action: 'Bonus', 
                  details: '1:1 ratio',
                  exDate: 'Jun 15, 2023',
                  recordDate: 'Jun 17, 2023'
                },
                { 
                  company: 'HDFC Bank', 
                  action: 'Dividend', 
                  details: '₹15 per share',
                  exDate: 'Jul 12, 2023',
                  recordDate: 'Jul 14, 2023'
                }
              ].map((action, index) => (
                <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{action.company}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-blue-900/30 text-blue-400 border border-blue-800">
                      {action.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{action.details}</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Ex-Date:</span>
                      <span>{action.exDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Record Date:</span>
                      <span>{action.recordDate}</span>
                    </div>
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
          
          {/* Top Companies */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-lg font-bold mb-4">Top Companies</h3>
            <div className="space-y-3">
              {['Reliance Industries', 'HDFC Bank', 'TCS', 'Infosys', 'HUL'].map((company) => (
                <div key={company} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{company}</span>
                  <span className={`text-xs ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 5 + 1).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Newsletter Signup */}
          <div className="bg-blue-900/30 rounded-xl border border-blue-800 p-4">
            <h3 className="text-lg font-bold mb-2">Company Alerts</h3>
            <p className="text-sm text-gray-300 mb-4">Get alerts for earnings, dividends, and major announcements</p>
            <div className="space-y-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
              />
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 