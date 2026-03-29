import Link from 'next/link';

import dynamic from 'next/dynamic';
import { SectionReveal } from '../components/ui/SectionReveal';

import HeroSection from '../components/home/HeroSection';
import AnalysisFeatures from '../components/home/AnalysisFeatures';
import CtaSection from '../components/home/CtaSection';
import MarketNetworkSection from '../components/ui/market-network-section';

// Dynamically import heavy UI components to reduce initial bundle size and speed up perceived loading
const MarketOverview = dynamic(() => import('../components/home/MarketOverview'), { 
  loading: () => <div className="h-64 rounded-xl mb-3 shimmer w-full" />
});
const SectorPerformance = dynamic(() => import('../components/home/SectorPerformance'), { 
  loading: () => <div className="h-48 rounded-xl mb-3 shimmer w-full" />
});
const FeaturedStocks = dynamic(() => import('../components/home/FeaturedStocks'), { 
  loading: () => <div className="h-64 rounded-xl mb-3 shimmer w-full" />
});
const IpoSection = dynamic(() => import('../components/home/IpoSection'), { 
  loading: () => <div className="h-48 rounded-xl mb-3 shimmer w-full" />
});

type SectionHeaderProps = {
  badge: string;
  title: string;
  accent: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function SectionHeader({ badge, title, accent, ctaHref, ctaLabel }: SectionHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="inline-flex rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          {badge}
        </span>
        <h2 className="mt-4 text-2xl font-bold leading-tight text-white md:text-3xl">
          {title} <span className="text-neon-300 neon-glow-text">{accent}</span>
        </h2>
      </div>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-flex w-fit items-center text-sm font-semibold tracking-wide text-gray-300 transition-colors duration-300 hover:text-white"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}


export default function Home() {

  return (
    <div className="relative overflow-hidden pb-8 md:pb-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-72 w-[70%] rounded-full bg-[radial-gradient(circle,_rgba(56,189,248,0.16)_0%,_transparent_65%)] blur-3xl"
      />

      <div>
        <HeroSection />
      </div>

      <div className="section-divider mx-auto max-w-5xl" />

      <SectionReveal>
        <section className="relative z-10 py-16">
          <div className="container mx-auto max-w-[1440px] overflow-x-visible px-4">
            <SectionHeader badge="Module 01" title="Market" accent="Overview" />
            <div className="overflow-x-auto pb-2">
              <MarketOverview />
            </div>
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />
      
      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <SectionHeader
              badge="Module 01"
              title="Sector"
              accent="Performance"
              ctaHref="/market"
              ctaLabel="View Details"
            />
            <SectorPerformance />
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />

      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <SectionHeader
              badge="Module 01"
              title="Featured"
              accent="Stocks"
              ctaHref="/stocks"
              ctaLabel="View All Stocks"
            />
            <FeaturedStocks />
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />

      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <SectionHeader
              badge="Module 01"
              title="Upcoming"
              accent="IPOs"
              ctaHref="/ipo"
              ctaLabel="View All IPOs"
            />
            <IpoSection />
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />

      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-16">
          <div className="container mx-auto px-4">
            <AnalysisFeatures />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.05}>
        <section className="relative z-10 pt-0 pb-12 md:pt-2 md:pb-14">
          <div className="container mx-auto px-4">
            <CtaSection />
          </div>
        </section>
      </SectionReveal>

      <div className="section-divider mx-auto max-w-5xl" />

      <SectionReveal delay={0.05}>
        <section className="relative z-10 pt-8 pb-4 md:pt-10 md:pb-6">
          <MarketNetworkSection />
        </section>
      </SectionReveal>

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