import Link from 'next/link';

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
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">API Documentation</h1>
          <p className="text-gray-300">
            Frontend is integrated with backend API v1 at
            {' '}
            <span className="font-mono text-neon-400">{displayedApiBaseUrl}</span>.
          </p>
        </header>

        <section className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold text-white">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/api-test" className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Open API Test Page
            </Link>
            <Link href="/login" className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm">
              Open Auth Login
            </Link>
            <Link href="/alerts" className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm">
              Open Alerts
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          {endpointGroups.map((group) => (
            <div key={group.title} className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.endpoints.map((endpoint) => (
                  <li key={endpoint} className="font-mono text-sm text-gray-300 bg-gray-800/70 rounded px-3 py-2">
                    {endpoint}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
