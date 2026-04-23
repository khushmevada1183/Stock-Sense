"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, BarChart3, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';

const marketPulse = [
  { label: 'NIFTY 50', value: '22,654.50', change: '+0.57%', positive: true },
  { label: 'SENSEX', value: '74,683.70', change: '+0.35%', positive: true },
  { label: 'BANK NIFTY', value: '48,521.60', change: '-0.15%', positive: false },
];

const heroStats = [
  { label: 'Live coverage', value: '41 routes' },
  { label: 'Research layers', value: '10 dimensions' },
  { label: 'Portfolio focus', value: 'Primary view' },
];

const chartPoints = [
  { x: 20, y: 134 },
  { x: 56, y: 110 },
  { x: 92, y: 118 },
  { x: 128, y: 86 },
  { x: 164, y: 52 },
  { x: 200, y: 60 },
  { x: 236, y: 34 },
];

const linePath = 'M20 134 L56 110 L92 118 L128 86 L164 52 L200 60 L236 34';
const areaPath = 'M20 134 L56 110 L92 118 L128 86 L164 52 L200 60 L236 34 L236 164 L20 164 Z';

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pb-8 pt-8 md:pb-12 md:pt-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.16)_0%,rgba(16,185,129,0)_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(57,255,20,0.18)_0%,rgba(57,255,20,0)_68%)]" />
        <div className="absolute right-[-5rem] top-20 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0)_72%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(148,163,184,0.14)_0%,rgba(148,163,184,0)_72%)]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300/80 bg-white/75 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.65)] ring-1 ring-white/70 backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:ring-white/5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Premium market intelligence
          </div>

          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,7vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-slate-950 dark:text-white font-[var(--font-sans)]">
            Read the market with calm, clarity, and precision.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 md:text-lg">
            A premium home for live indices, portfolio intelligence, IPO context, and stock research - designed to feel as measured as the product itself.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="inline-flex items-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.22)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              onClick={() => router.push('/market')}
            >
              Explore markets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="inline-flex items-center rounded-full border border-slate-300/80 bg-white/80 px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              onClick={() => router.push('/portfolio')}
            >
              Open portfolio
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[24px] border border-slate-200/70 bg-white/75 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_22px_60px_rgba(0,0,0,0.34)]"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                  Market pulse
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  A calm snapshot of India&apos;s market direction.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-600 dark:text-emerald-300">
                <Activity className="h-3.5 w-3.5" />
                Live
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-slate-200/70 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/5">
              <svg viewBox="0 0 260 180" className="h-[18rem] w-full">
                <defs>
                  <linearGradient id="hero-line" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                  <linearGradient id="hero-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="18" x2="242" y1="148" y2="148" className="stroke-slate-200 dark:stroke-white/10" strokeDasharray="4 8" />
                <path d={areaPath} fill="url(#hero-area)" opacity="0.95" />
                <path d={linePath} fill="none" stroke="url(#hero-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {chartPoints.map((point, index) => (
                  <g key={`${point.x}-${point.y}-${index}`}>
                    <circle cx={point.x} cy={point.y} r="4.5" fill="#d1fae5" />
                    <circle cx={point.x} cy={point.y} r="2.2" fill="#34d399" />
                  </g>
                ))}
              </svg>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {marketPulse.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[22px] border border-slate-200/70 bg-white/75 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                    {metric.label}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <span className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
                      {metric.value}
                    </span>
                    <span
                      className={`text-xs font-semibold ${metric.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-slate-200/70 bg-white/75 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  Coverage
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Live indices, stocks, IPOs, alerts, and research signals in one calm interface.
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/70 bg-white/75 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                  Focus
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  Portfolio-first structure with premium light and dark treatments.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}