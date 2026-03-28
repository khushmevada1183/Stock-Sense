import Link from 'next/link';

const endpointGroups = [
  {
    title: 'Core Data',
    endpoints: ['/api/stock', '/api/trending', '/api/historical_data', '/api/news'],
  },
  {
    title: 'Market Data',
    endpoints: ['/api/NSE_most_active', '/api/BSE_most_active', '/api/price_shockers', '/api/commodities'],
  },
  {
    title: 'IPO and Utilities',
    endpoints: ['/api/ipo', '/api/health'],
  },
];

export default function ApiDocsPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">API Documentation</h1>
          <p className="text-gray-300">
            Stock Sense frontend consumes these API routes through the configured backend URL.
          </p>
        </header>

        <section className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold text-white">Quick Links</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/api-test" className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Open API Test Page
            </Link>
            <a
              href="/api/health"
              className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm"
            >
              Check Health Endpoint
            </a>
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
