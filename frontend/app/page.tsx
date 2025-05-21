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
    <div className="pb-16 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      {/* Hero Section */}
      <div ref={heroRef}>
      <HeroSection />
      </div>
      
      {/* Subtle divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neon-400/20 to-transparent mx-auto max-w-5xl"></div>
      
      {/* Market Overview */}
      <section ref={marketOverviewRef} className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white">
            Market Overview
          </h2>
          <MarketOverview />
        </div>
      </section>
      
      {/* Subtle divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neon-400/20 to-transparent mx-auto max-w-5xl"></div>
      
      {/* Featured Stocks */}
      <section ref={featuredStocksRef} className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg md:text-xl font-bold text-white">
            Featured Stocks
          </h2>
            <Link 
              href="/stocks" 
              className="text-neon-400 hover:text-neon-300 font-medium"
            >
              View All Stocks
            </Link>
          </div>
          <FeaturedStocks />
        </div>
      </section>
      
      {/* Subtle divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neon-400/20 to-transparent mx-auto max-w-5xl"></div>
      
      {/* IPO Section */}
      <section ref={ipoSectionRef} className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg md:text-xl font-bold text-white">
              Upcoming IPOs
            </h2>
            <Link 
              href="/ipo" 
              className="text-neon-400 hover:text-neon-300 font-medium"
            >
              View All IPOs
            </Link>
          </div>
          <IpoSection />
        </div>
      </section>
      
      {/* Subtle divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neon-400/20 to-transparent mx-auto max-w-5xl"></div>
      
      {/* Latest News */}
      <section ref={latestNewsRef} className="py-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg md:text-xl font-bold text-white">
              Latest Market News
            </h2>
            <Link 
              href="/news" 
              className="text-neon-400 hover:text-neon-300 font-medium"
            >
              View All News
            </Link>
          </div>
          <LatestNews />
        </div>
      </section>
      
      {/* Subtle divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neon-400/20 to-transparent mx-auto max-w-5xl"></div>
      
      {/* Analysis Features */}
      <div ref={analysisFeaturesRef} className="relative z-10">
      <AnalysisFeatures />
      </div>
      
      {/* Subtle divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-neon-400/20 to-transparent mx-auto max-w-5xl"></div>
      
      {/* CTA Section */}
      <div ref={ctaSectionRef} className="relative z-10">
      <CtaSection />
      </div>
      
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[800px] h-[800px] rounded-full bg-neon-400/5 blur-3xl top-1/3 -left-96"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl top-2/3 -right-80"></div>
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