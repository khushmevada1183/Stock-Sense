import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import { MarketEntityTicker } from '@/components/ui/market-entity-ticker';

export default function MarketNetworkSection() {
  return (
    <div className="relative w-full">
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -top-24 left-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 rounded-full',
          'bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_60%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.14),transparent_60%)]'
        )}
      />

      <div className="relative w-full py-4 md:py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/75 px-5 py-6 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)] md:px-8 md:py-8">
            <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-slate-300/80 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              India market network
            </div>
            <h2 className="text-[clamp(1.75rem,3vw,2.75rem)] font-semibold tracking-[-0.04em] text-slate-950 dark:text-white">
              Trusted by exchanges, institutions, and blue-chip leaders.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 md:text-base">
              NSE, BSE, RBI, SEBI, and India&apos;s most relevant companies kept in a calm, premium network layer.
            </p>

            <MarketEntityTicker className="mt-8 md:mt-10" entities={entities} />
          </div>
        </div>
      </div>
    </div>
  );
}

const entities = [
  {
    name: 'National Stock Exchange of India',
    symbol: 'NSE',
    type: 'exchange' as const,
    logoSrc: '/logos/nse.svg',
  },
  {
    name: 'Bombay Stock Exchange',
    symbol: 'BSE',
    type: 'exchange' as const,
    logoSrc: '/logos/bse.svg',
  },
  {
    name: 'Securities and Exchange Board of India',
    symbol: 'SEBI',
    type: 'government' as const,
    logoSrc: '/logos/sebi.png',
  },
  {
    name: 'Reserve Bank of India',
    symbol: 'RBI',
    type: 'government' as const,
    logoSrc: '/logos/rbi.svg',
  },
  {
    name: 'Reliance Industries',
    symbol: 'RELIANCE',
    type: 'company' as const,
    logoSrc: '/logos/reliance.svg',
  },
  {
    name: 'Tata Consultancy Services',
    symbol: 'TCS',
    type: 'company' as const,
    logoSrc: '/logos/tcs.svg',
  },
  {
    name: 'Infosys',
    symbol: 'INFY',
    type: 'company' as const,
    logoSrc: '/logos/infosys.svg',
  },
  {
    name: 'HDFC Bank',
    symbol: 'HDFC',
    type: 'company' as const,
    logoSrc: '/logos/hdfc.svg',
  },
  {
    name: 'ICICI Bank',
    symbol: 'ICICI',
    type: 'company' as const,
    logoSrc: '/logos/icici.svg',
  },
  {
    name: 'State Bank of India',
    symbol: 'SBIN',
    type: 'company' as const,
    logoSrc: '/logos/sbi.svg',
  },
  {
    name: 'Larsen & Toubro',
    symbol: 'LT',
    type: 'company' as const,
    logoSrc: '/logos/lt.svg',
  },
  {
    name: 'Oil and Natural Gas Corporation',
    symbol: 'ONGC',
    type: 'company' as const,
    logoSrc: '/logos/ongc.svg',
  },
];
