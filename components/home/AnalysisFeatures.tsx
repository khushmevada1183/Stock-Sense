"use client";

import React, { useState, useEffect } from 'react';
import { FiBarChart2, FiUsers, FiTrendingUp, FiActivity, FiDollarSign, FiFile, FiPieChart, FiTarget, FiGrid, FiBriefcase } from 'react-icons/fi';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function AnalysisFeatures() {
  const [mounted, setMounted] = useState(false);
  
  // Ensure component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Comprehensive Stock Analysis</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our platform analyzes stocks across ten key dimensions to give you the most complete picture.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-premium p-6 rounded-lg shadow-neon-sm hover:shadow-neon transition-shadow border border-neon-400/10"
            >
              <div className="text-neon-400 text-2xl mb-4">
                {mounted ? (
                  React.cloneElement(feature.icon as React.ReactElement, { suppressHydrationWarning: true })
                ) : (
                  <div className="h-8 w-8"></div>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features: FeatureItem[] = [
  {
    title: 'Financial Fundamentals',
    description: 'Analysis of EPS, P/E ratios, debt-to-equity, revenue growth, profit margins and other ratios.',
    icon: <FiBarChart2 className="h-8 w-8" />
  },
  {
    title: 'Management Analysis',
    description: 'Evaluation of leadership team, track record, governance practices, and management quality.',
    icon: <FiUsers className="h-8 w-8" />
  },
  {
    title: 'Industry Trends',
    description: 'Insights into sector performance, competition analysis, market share, and industry dynamics.',
    icon: <FiTrendingUp className="h-8 w-8" />
  },
  {
    title: 'Government Policies',
    description: 'Impact assessment of regulatory changes, subsidies, taxation, and policy shifts on stocks.',
    icon: <FiBriefcase className="h-8 w-8" />
  },
  {
    title: 'Macroeconomic Indicators',
    description: 'Analysis of GDP growth, inflation, interest rates, and currency fluctuations affecting stocks.',
    icon: <FiActivity className="h-8 w-8" />
  },
  {
    title: 'News Analysis',
    description: 'Latest developments, news sentiment analysis, and event impact assessment for stocks.',
    icon: <FiFile className="h-8 w-8" />
  },
  {
    title: 'Technical Analysis',
    description: 'Price patterns, moving averages, momentum indicators, and trend analysis for stocks.',
    icon: <FiPieChart className="h-8 w-8" />
  },
  {
    title: 'Growth Potential',
    description: 'Evaluation of future expansion plans, market opportunities, and R&D investments.',
    icon: <FiTarget className="h-8 w-8" />
  },
  {
    title: 'Institutional Investments',
    description: 'Tracking of FII/DII flows, major stake changes, block deals, and institutional sentiment.',
    icon: <FiGrid className="h-8 w-8" />
  },
  {
    title: 'Market Psychology',
    description: 'Analysis of sentiment indicators, investor behavior patterns, and market psychology.',
    icon: <FiDollarSign className="h-8 w-8" />
  }
]; 