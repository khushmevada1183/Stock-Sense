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
  eyebrow: string;
  title: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

function SectionHeader({ eyebrow, title, description, ctaHref, ctaLabel }: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-[clamp(1.75rem,2.8vw,2.6rem)] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="inline-flex w-fit items-center justify-center rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}


export default function Home() {

  return (
    <div className="relative overflow-hidden pb-12 md:pb-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[32rem] w-[min(88vw,72rem)] rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.11)_0%,_transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(57,255,20,0.14)_0%,_transparent_70%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-40 mx-auto h-px w-[min(88vw,72rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-300/70 to-transparent dark:via-white/10"
      />

      <div>
        <HeroSection />
      </div>

      <SectionReveal>
        <section className="relative z-10 py-12 md:py-14">
          <div className="container mx-auto max-w-[1440px] overflow-x-visible px-4">
            <SectionHeader
              eyebrow="Live snapshot"
              title="Market overview"
              description="A calm, real-time view of the broader market presented with the same restraint as the portfolio experience."
            />
            <div className="overflow-x-auto pb-2">
              <MarketOverview />
            </div>
          </div>
        </section>
      </SectionReveal>
      
      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-12 md:py-14">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow="Relative strength"
              title="Sector performance"
              description="See where capital is rotating, with compact surfaces and quieter visual hierarchy."
              ctaHref="/market"
              ctaLabel="View Details"
            />
            <SectorPerformance />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-12 md:py-14">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow="Curated watchlist"
              title="Featured stocks"
              description="Highlighted ideas, rendered in a denser but still premium card system."
              ctaHref="/stocks"
              ctaLabel="View All Stocks"
            />
            <FeaturedStocks />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-12 md:py-14">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow="Primary market"
              title="Upcoming IPOs"
              description="Primary market activity, curated in a cleaner and more modern presentation."
              ctaHref="/ipo"
              ctaLabel="View All IPOs"
            />
            <IpoSection />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.05}>
        <section className="relative z-10 py-12 md:py-14">
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