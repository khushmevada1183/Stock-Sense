'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import HeroSection from '../components/home/HeroSection';
import FeaturedStocks from '../components/home/FeaturedStocks';
import MarketOverview from '../components/home/MarketOverview';
import SectorPerformance from '../components/home/SectorPerformance';
import AnalysisFeatures from '../components/home/AnalysisFeatures';
import IpoSection from '../components/home/IpoSection';
import CtaSection from '../components/home/CtaSection';
import { useAnimation } from '../animations/shared/AnimationContext';
import { initHomePageAnimations } from '../animations/pages/homeAnimations';

// Framer Motion viewport animation wrapper
const SectionReveal = ({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const marketOverviewRef = useRef<HTMLElement>(null);
  const sectorPerformanceRef = useRef<HTMLElement>(null);
  const featuredStocksRef = useRef<HTMLElement>(null);
  const ipoSectionRef = useRef<HTMLElement>(null);
  const analysisFeaturesRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  const { isAnimationEnabled } = useAnimation();

  useEffect(() => {
    if (isAnimationEnabled) {
      const refs = {
        heroRef,
        marketOverviewRef,
        sectorPerformanceRef,
        featuredStocksRef,
        ipoSectionRef,
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

      {/* Animated section divider */}
      <div className="section-divider mx-auto max-w-5xl" />

      {/* Market Overview */}
      <SectionReveal>
        <section ref={marketOverviewRef} className="py-14 relative z-10 section-glow">
          <div className="container mx-auto px-4 max-w-[1440px] overflow-x-visible">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-white">
              Market <span className="gradient-text">Overview</span>
            </h2>
            <div className="overflow-x-auto pb-2">
              <MarketOverview />
            </div>
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />
      
      {/* Sector Performance */}
      <SectionReveal delay={0.05}>
        <section ref={sectorPerformanceRef} className="py-14 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-lg md:text-xl font-bold text-white">
                Sector Performance
              </h2>
              <Link href="/market" className="text-neon-400 hover:text-neon-300 font-medium text-sm transition-colors duration-300 hover-underline">
                View Details
              </Link>
            </div>
            <SectorPerformance />
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />

      {/* Featured Stocks */}
      <SectionReveal delay={0.05}>
        <section ref={featuredStocksRef} className="py-14 relative z-10 section-glow">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-lg md:text-xl font-bold text-white">
                Featured <span className="gradient-text">Stocks</span>
              </h2>
              <Link href="/stocks" className="text-neon-400 hover:text-neon-300 font-medium text-sm transition-colors duration-300 hover-underline">
                View All Stocks
              </Link>
            </div>
            <FeaturedStocks />
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />

      {/* IPO Section */}
      <SectionReveal delay={0.05}>
        <section ref={ipoSectionRef} className="py-14 relative z-10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-lg md:text-xl font-bold text-white">
                Upcoming IPOs
              </h2>
              <Link href="/ipo" className="text-neon-400 hover:text-neon-300 font-medium text-sm transition-colors duration-300 hover-underline">
                View All IPOs
              </Link>
            </div>
            <IpoSection />
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />

      {/* Analysis Features */}
      <SectionReveal delay={0.05}>
        <section ref={analysisFeaturesRef} className="py-14 relative z-10 section-glow">
          <div className="container mx-auto px-4">
            <AnalysisFeatures />
          </div>
        </section>
      </SectionReveal>

      {/* Call to Action */}
      <SectionReveal delay={0.05}>
        <section ref={ctaSectionRef} className="py-14 relative z-10">
          <div className="container mx-auto px-4">
            <CtaSection />
          </div>
        </section>
      </SectionReveal>

      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute w-[800px] h-[800px] rounded-full bg-neon-400/[0.03] blur-3xl top-1/3 -left-96 animate-float-slow"></div>
        <div className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/[0.03] blur-3xl top-2/3 -right-80 animate-float-delayed"></div>
      </div>
    </div>
  );
}

// This features array is used by AnalysisFeatures component
export const features = [
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