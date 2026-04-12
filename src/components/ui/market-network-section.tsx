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
          'bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.14),transparent_60%)] blur-3xl'
        )}
      />

      <div className="relative w-full py-3 md:py-4">
        <h2 className="mb-4 text-center">
          <span className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-slate-300">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            India Market Network
          </span>
          <span className="mt-1 block text-2xl font-bold text-slate-600 dark:text-slate-400">
            Trusted by Exchanges, Institutions, and Blue-Chip Leaders
          </span>
          <span className="mt-5 block tracking-tight text-3xl font-black text-slate-900 dark:text-white md:text-4xl">
            NSE • BSE • RBI • SEBI • Top Indian Companies
          </span>
        </h2>

        <MarketEntityTicker className="mt-8 md:mt-10" entities={entities} />
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
