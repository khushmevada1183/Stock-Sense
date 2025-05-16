'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSection from '../components/home/HeroSection';
import FeaturedStocks from '../components/home/FeaturedStocks';
import MarketOverview from '../components/home/MarketOverview';
import AnalysisFeatures from '../components/home/AnalysisFeatures';
import LatestNews from '../components/home/LatestNews';
import IpoSection from '../components/home/IpoSection';
import CtaSection from '../components/home/CtaSection';
import { useAnimation } from '../animations/shared/AnimationContext';
import { initHomePageAnimations } from '../animations/pages/homeAnimations';

export default function Home() {
  // Create refs for each section to animate
  const heroRef = useRef<HTMLDivElement>(null);
  const marketOverviewRef = useRef<HTMLElement>(null);
  const featuredStocksRef = useRef<HTMLElement>(null);
  const ipoSectionRef = useRef<HTMLElement>(null);
  const latestNewsRef = useRef<HTMLElement>(null);
  const analysisFeaturesRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  
  // Get animation context
  const { isAnimationEnabled } = useAnimation();
  
  // Initialize animations when component mounts
  useEffect(() => {
    if (isAnimationEnabled) {
      const refs = {
        heroRef,
        marketOverviewRef,
        featuredStocksRef,
        ipoSectionRef,
        latestNewsRef,
        analysisFeaturesRef,
        ctaSectionRef
      };
      
      initHomePageAnimations(refs);
    }
  }, [isAnimationEnabled]);

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <div ref={heroRef}>
        <HeroSection />
      </div>
      
      {/* Market Overview */}
      <section ref={marketOverviewRef} className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Market Overview
          </h2>
          <MarketOverview />
        </div>
      </section>
      
      {/* Featured Stocks */}
      <section ref={featuredStocksRef} className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg md:text-xl font-bold">
            Featured Stocks
          </h2>
            <Link 
              href="/stocks" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View All Stocks
            </Link>
          </div>
          <FeaturedStocks />
        </div>
      </section>
      
      {/* IPO Section */}
      <section ref={ipoSectionRef} className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg md:text-xl font-bold">
              Upcoming IPOs
            </h2>
            <Link 
              href="/ipo" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View All IPOs
            </Link>
          </div>
          <IpoSection />
        </div>
      </section>
      
      {/* Latest News */}
      <section ref={latestNewsRef} className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg md:text-xl font-bold">
              Latest Market News
            </h2>
            <Link 
              href="/news" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View All News
            </Link>
          </div>
          <LatestNews />
        </div>
      </section>
      
      {/* Analysis Features */}
      <div ref={analysisFeaturesRef}>
        <AnalysisFeatures />
      </div>
      
      {/* CTA Section */}
      <div ref={ctaSectionRef}>
        <CtaSection />
      </div>
    </div>
  );
}

const features = [
  {
    icon: '📊',
    title: 'Financial Fundamentals',
    description: 'Analyze EPS, P/E ratios, debt-to-equity, revenue growth, and profit margins.'
  },
  {
    icon: '👥',
    title: 'Management Analysis',
    description: 'Evaluate leadership quality, track record, and governance practices.'
  },
  {
    icon: '🏭',
    title: 'Industry Trends',
    description: 'Review sector performance, competition analysis, and market share.'
  },
  {
    icon: '🏛️',
    title: 'Government Policies',
    description: 'Understand regulatory impacts, subsidies, and taxation changes.'
  },
  {
    icon: '📈',
    title: 'Macroeconomic Indicators',
    description: 'Track GDP growth, inflation, interest rates, and currency fluctuations.'
  },
  {
    icon: '📰',
    title: 'News Analysis',
    description: 'Stay updated with developments affecting stock performance.'
  },
  {
    icon: '📉',
    title: 'Technical Analysis',
    description: 'Study price patterns, moving averages, and momentum indicators.'
  },
  {
    icon: '🚀',
    title: 'Growth Potential',
    description: 'Evaluate future expansion plans, market opportunities, and R&D investments.'
  },
  {
    icon: '🏦',
    title: 'Institutional Investments',
    description: 'Track FII/DII flows, stake changes, and block deals.'
  },
  {
    icon: '🧠',
    title: 'Market Psychology',
    description: 'Gauge sentiment indicators and investor behavior patterns.'
  }
]; 