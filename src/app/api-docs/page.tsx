'use client';

import Link from 'next/link';
import { ContentPageLayout } from '@/components/content/ContentPageLayout';
import { contentCardClass, secondaryButtonClass } from '@/styles/design-tokens';

const endpointGroups = [
  {
    title: 'Authentication',
    endpoints: [
      'POST /auth/signup',
      'POST /auth/login',
      'POST /auth/refresh',
      'POST /auth/logout',
      'GET /auth/profile',
      'GET /auth/sessions',
      'GET /auth/audit-logs',
    ],
  },
  {
    title: 'Stocks & Market',
    endpoints: [
      'GET /stocks/search',
      'GET /stocks/{symbol}',
      'GET /stocks/{symbol}/quote',
      'GET /stocks/{symbol}/technical',
      'GET /stocks/{symbol}/fundamental',
      'GET /market/overview',
      'GET /market/sector-heatmap',
      'GET /market/52-week-high',
      'GET /market/52-week-low',
      'GET /market/snapshot/latest',
    ],
  },
  {
    title: 'Portfolio, Watchlist, Alerts',
    endpoints: [
      'GET /portfolios',
      'POST /portfolios',
      'GET /watchlists',
      'POST /watchlists',
      'GET /alerts',
      'POST /alerts',
      'GET /alerts/evaluator/status',
    ],
  },
  {
    title: 'News, IPO, Institutional, Health',
    endpoints: [
      'GET /news',
      'GET /news/trending',
      'GET /news/fear-greed',
      'GET /ipo/calendar',
      'GET /ipo/subscriptions/latest',
      'GET /ipo/gmp/latest',
      'GET /institutional/fii-dii',
      'GET /institutional/block-deals',
      'GET /institutional/shareholding',
      'GET /health',
      'GET /health/db',
    ],
  },
];

export default function ApiDocsPage() {
  const displayedApiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://stock-sense-backend-ocjo.onrender.com/api/v1';

  return (
    <ContentPageLayout
      eyebrow="Developers"
      title="API Documentation"
      description="Stock Sense frontend integrates with backend API v1. Use these routes for market data, portfolios, alerts, and auth."
    >
      <div className="space-y-6">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Base URL:{' '}
          <span className="font-mono text-emerald-600 dark:text-emerald-300">{displayedApiBaseUrl}</span>
        </p>

        <div className={`${contentCardClass} space-y-3 p-5`}>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Quick links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/api-test" className={secondaryButtonClass}>
              Open API test page
            </Link>
            <Link href="/login" className={secondaryButtonClass}>
              Open auth login
            </Link>
            <Link href="/alerts" className={secondaryButtonClass}>
              Open alerts
            </Link>
          </div>
        </div>

        {endpointGroups.map((group) => (
          <div key={group.title} className={`${contentCardClass} space-y-3 p-5`}>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{group.title}</h3>
            <ul className="space-y-2">
              {group.endpoints.map((endpoint) => (
                <li
                  key={endpoint}
                  className="rounded-lg border border-slate-200/70 bg-white/60 px-3 py-2 font-mono text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                >
                  {endpoint}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ContentPageLayout>
  );
}
