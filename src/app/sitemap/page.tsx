import Link from 'next/link';

const siteSections = [
  { title: 'Main', links: ['/', '/stocks', '/stock-search', '/market', '/ipo', '/news', '/portfolio'] },
  { title: 'Company', links: ['/about', '/contact', '/privacy', '/terms', '/faq', '/learn', '/blog'] },
  { title: 'Support', links: ['/api-docs', '/api-test', '/accessibility'] },
];

export default function SitemapPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Sitemap</h1>
          <p className="text-gray-300">Browse all major pages in Stock Sense.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {siteSections.map((section) => (
            <section key={section.title} className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-3">{section.title}</h2>
              <ul className="space-y-2">
                {section.links.map((href) => (
                  <li key={href}>
                    <Link href={href} className="inline-flex min-h-[44px] min-w-[44px] items-center px-1 -mx-1 text-sm text-gray-300 hover:text-neon-400 transition-colors">
                      {href}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
