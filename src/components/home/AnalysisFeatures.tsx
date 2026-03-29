"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiUsers, FiTrendingUp, FiActivity, FiDollarSign, FiFile, FiPieChart, FiTarget, FiGrid, FiBriefcase } from 'react-icons/fi';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  outcomeWeight: number;
}

export default function AnalysisFeatures() {
  return (
    <div className="relative">
      <div className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
        <div className="mb-5 flex items-center justify-center gap-2 font-[var(--font-roboto-mono)] text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Comprehensive Coverage
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-slate-900 dark:text-slate-50">
          Comprehensive Stock Analysis
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-[1.12rem] leading-relaxed text-slate-600 dark:text-slate-300 md:text-[1.24rem]">
          Our platform analyzes stocks across ten key dimensions to give you the most complete picture.
        </p>

        <p className="mx-auto mt-4 max-w-2xl font-[var(--font-roboto-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
          Indicative outcome weights • vary by market regime
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <motion.li
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="feature-card group"
          >
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-full bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-950">
                {feature.icon}
              </div>

              <div className="min-w-0">
                <div className="font-[var(--font-roboto-mono)] text-[0.64rem] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <h3 className="mt-2 text-[1.15rem] font-semibold leading-snug tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                  {feature.title}
                </h3>

                <p className="mt-2 text-[0.98rem] leading-relaxed text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>

                <div className="mt-4 flex items-baseline justify-between gap-6">
                  <span className="font-[var(--font-roboto-mono)] text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                    Outcome probability
                  </span>
                  <span className="font-[var(--font-roboto-mono)] text-[0.98rem] font-semibold tabular-nums tracking-[-0.02em] text-slate-900 dark:text-slate-50">
                    {feature.outcomeWeight}%
                  </span>
                </div>

                <div aria-hidden className="mt-4 flex items-center gap-2 text-slate-300 dark:text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  <span className="h-px w-10 bg-current opacity-70 transition-all duration-300 group-hover:w-16 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const features: FeatureItem[] = [
  {
    title: 'Financial Fundamentals',
    description: 'Analysis of EPS, P/E ratios, debt-to-equity, revenue growth, profit margins and other ratios.',
    icon: <FiBarChart2 className="h-5 w-5" />,
    outcomeWeight: 22
  },
  {
    title: 'Management Analysis',
    description: 'Evaluation of leadership team, track record, governance practices, and management quality.',
    icon: <FiUsers className="h-5 w-5" />,
    outcomeWeight: 11
  },
  {
    title: 'Industry Trends',
    description: 'Insights into sector performance, competition analysis, market share, and industry dynamics.',
    icon: <FiTrendingUp className="h-5 w-5" />,
    outcomeWeight: 10
  },
  {
    title: 'Government Policies',
    description: 'Impact assessment of regulatory changes, subsidies, taxation, and policy shifts on stocks.',
    icon: <FiBriefcase className="h-5 w-5" />,
    outcomeWeight: 8
  },
  {
    title: 'Macroeconomic Indicators',
    description: 'Analysis of GDP growth, inflation, interest rates, and currency fluctuations affecting stocks.',
    icon: <FiActivity className="h-5 w-5" />,
    outcomeWeight: 9
  },
  {
    title: 'News Analysis',
    description: 'Latest developments, news sentiment analysis, and event impact assessment for stocks.',
    icon: <FiFile className="h-5 w-5" />,
    outcomeWeight: 7
  },
  {
    title: 'Technical Analysis',
    description: 'Price patterns, moving averages, momentum indicators, and trend analysis for stocks.',
    icon: <FiPieChart className="h-5 w-5" />,
    outcomeWeight: 12
  },
  {
    title: 'Growth Potential',
    description: 'Evaluation of future expansion plans, market opportunities, and R&D investments.',
    icon: <FiTarget className="h-5 w-5" />,
    outcomeWeight: 9
  },
  {
    title: 'Institutional Investments',
    description: 'Tracking of FII/DII flows, major stake changes, block deals, and institutional sentiment.',
    icon: <FiGrid className="h-5 w-5" />,
    outcomeWeight: 6
  },
  {
    title: 'Market Psychology',
    description: 'Analysis of sentiment indicators, investor behavior patterns, and market psychology.',
    icon: <FiDollarSign className="h-5 w-5" />,
    outcomeWeight: 6
  }
];