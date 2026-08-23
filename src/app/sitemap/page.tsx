import Link from 'next/link';
import { ContentPageLayout } from '@/components/content/ContentPageLayout';
import { insetPanelClass } from '@/styles/design-tokens';

const siteSections = [
  { title: 'Main', links: ['/', '/stocks', '/stock-search', '/market', '/ipo', '/news', '/portfolio'] },
  { title: 'Company', links: ['/about', '/contact', '/privacy', '/terms', '/faq', '/learn', '/blog'] },
  { title: 'Support', links: ['/api-docs', '/api-test', '/accessibility'] },
];

export default function SitemapPage() {
  return (
    <ContentPageLayout
      eyebrow="Site"
      title="Sitemap"
      description="Browse all major pages in Stock Sense."
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {siteSections.map((section) => (
          <section key={section.title} className={`${insetPanelClass} p-5`}>
            <h2 className="mb-3 text-lg font-semibold text-slate-950 dark:text-white">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((href) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center px-1 -mx-1 text-sm text-slate-600 transition-colors hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:text-slate-400 dark:hover:text-emerald-400"
                  >
                    {href}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ContentPageLayout>
  );
}
