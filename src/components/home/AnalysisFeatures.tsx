"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiUsers, FiTrendingUp, FiActivity, FiDollarSign, FiFile, FiPieChart, FiTarget, FiGrid, FiBriefcase } from 'react-icons/fi';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function AnalysisFeatures() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <section className="py-16 section-glow">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-white">
            Comprehensive Stock <span className="gradient-text">Analysis</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Our platform analyzes stocks across ten key dimensions to give you the most complete picture.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card card-shine p-5 rounded-xl group"
            >
              <div className="text-neon-400 text-2xl mb-4 icon-glow w-fit">
                {mounted ? (
                  React.cloneElement(feature.icon as React.ReactElement, { suppressHydrationWarning: true })
                ) : (
                  <div className="h-8 w-8"></div>
                )}
              </div>
              <h3 className="text-base font-semibold mb-2 text-gray-200 group-hover:text-white transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
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