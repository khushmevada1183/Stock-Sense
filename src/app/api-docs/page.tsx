import Link from 'next/link';

export default function ApiDocsPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">API Documentation</h1>
          <p className="text-gray-300">
            Frontend API integrations are currently disabled for migration to a new backend.
          </p>
        </header>

        <section className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold text-white">Migration Status</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/api-test" className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
              Open Status Page
            </Link>
          </div>
        </section>

        <section className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">What&apos;s Next</h3>
          <ul className="space-y-2 text-gray-300 text-sm list-disc list-inside">
            <li>All previous API endpoint integrations were removed from frontend modules.</li>
            <li>The UI is running in local-data mode until the new backend contracts are finalized.</li>
            <li>New API documentation will be published after re-integration.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
