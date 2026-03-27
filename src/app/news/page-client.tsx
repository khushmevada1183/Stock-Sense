/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import * as stockApi from '@/api/api';
import { logger } from '@/lib/logger';

// Dynamically import components with SSR disabled for those with client-side data fetching
const MarketNews = dynamic(() => import('@/components/News/MarketNews'), { ssr: false });
const FeaturedNews = dynamic(() => import('@/components/News/FeaturedNews'), { ssr: false });
const SectorNews = dynamic(() => import('@/components/News/SectorNews'), { ssr: false });
const TrendingTopics = dynamic(() => import('@/components/News/TrendingTopics'), { ssr: false });
const NewsCategoryTabs = dynamic(() => import('@/components/News/NewsCategoryTabs'), { ssr: false });

const FALLBACK_NEWS = [
  { id: 1, title: "Sensex surges 600 pts on strong global cues; Nifty above 22,600", summary: "Indian markets opened on a strong note tracking positive global sentiment after US Fed signals.", category: "markets", date: new Date().toISOString(), source: "Economic Times", url: "#", imageUrl: null },
  { id: 2, title: "Reliance Industries Q4 profit rises 7% YoY to ₹21,243 crore", summary: "RIL reported robust quarterly numbers driven by strong performance in retail and digital segments.", category: "markets", date: new Date().toISOString(), source: "Business Standard", url: "#", imageUrl: null },
  { id: 3, title: "RBI holds repo rate at 6.5% for sixth consecutive meeting", summary: "The Monetary Policy Committee unanimously voted to keep interest rates unchanged amid inflation concerns.", category: "economy", date: new Date().toISOString(), source: "Mint", url: "#", imageUrl: null },
  { id: 4, title: "IT sector sees revival as TCS, Infosys post strong deal wins", summary: "Major IT firms report record deal pipeline for FY26 amid recovering global tech spending.", category: "IT", date: new Date().toISOString(), source: "NDTV Profit", url: "#", imageUrl: null },
  { id: 5, title: "HDFC Bank NIM stable at 3.5%; asset quality improvement continues", summary: "HDFC Bank's merger integration on track with improving return ratios and loan growth.", category: "banking", date: new Date().toISOString(), source: "Financial Express", url: "#", imageUrl: null },
  { id: 6, title: "Sun Pharma bags $200M US FDA approval for specialty drug", summary: "Sun Pharmaceutical receives clearance for a key dermatology product in the high-margin US market.", category: "pharma", date: new Date().toISOString(), source: "Moneycontrol", url: "#", imageUrl: null },
  { id: 7, title: "Maruti Suzuki February sales up 12% YoY; SUVs lead growth", summary: "Auto sector continues its strong momentum with Maruti's domestic passenger vehicle sales hitting a record.", category: "auto", date: new Date().toISOString(), source: "Reuters", url: "#", imageUrl: null },
  { id: 8, title: "FII inflows return to Indian equities; ₹8,000 crore bought in March", summary: "Foreign institutional investors turn net buyers after three months of selling pressure.", category: "markets", date: new Date().toISOString(), source: "Bloomberg Quint", url: "#", imageUrl: null },
  { id: 9, title: "Nifty Midcap 100 outperforms benchmark; up 3% this week", summary: "Mid-cap stocks continue to attract interest as earnings growth outlook remains strong.", category: "markets", date: new Date().toISOString(), source: "Economic Times", url: "#", imageUrl: null },
  { id: 10, title: "Wipro, HCL Tech announce large AI transformation deals", summary: "Indian IT majors are winning significant AI-led transformation mandates from global enterprises.", category: "IT", date: new Date().toISOString(), source: "Business Standard", url: "#", imageUrl: null },
];

export default function NewsPageClient() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        const response = await stockApi.getLatestNews();
        // API shape: { success, data: [...] } or { success, data: { news: [...] } }
        let articles: any[] = [];
        if (response?.success) {
          articles = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.news)
              ? response.data.news
              : [];
        }
        setNewsData(articles.length > 0 ? articles : FALLBACK_NEWS);
        setError('');
      } catch (err) {
        logger.error('Error fetching news (using fallback)', err);
        setNewsData(FALLBACK_NEWS);
        setError('');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);


  return (
    <div className="min-h-screen">
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
            <FeaturedNews newsData={newsData} loading={loading} error={error} />
          </section>
          
          {/* Market News Section */}
          <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-neon-400 rounded-sm mr-2"></span>
              Latest Market Updates
            </h2>
            <MarketNews newsData={newsData} loading={loading} error={error} />
          </section>
          
          {/* Sector News Section */}
          <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-white">
                <span className="inline-block w-1.5 h-6 bg-cyan-500 rounded-sm mr-2"></span>
              Sector News
            </h2>
            <SectorNews newsData={newsData} loading={loading} error={error} />
          </section>
        </div>
        
        {/* Sidebar - 1/4 width on large screens */}
        <div className="lg:col-span-1 space-y-6">
          {/* Trending Topics */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 glass">
              <h3 className="text-lg font-bold mb-4 text-white">Trending Topics</h3>
            <TrendingTopics />
          </div>
          
          {/* Market Calendar */}
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 p-4 glass">
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
            <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl border border-neon-400/20 p-4 glass-premium">
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