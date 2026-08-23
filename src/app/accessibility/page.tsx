import Link from 'next/link';
import { ContentPageLayout } from '@/components/content/ContentPageLayout';
import { primaryButtonClass } from '@/styles/design-tokens';

const checklist = [
  'Keyboard navigation support across primary actions',
  'Visible focus states for controls and links',
  'Semantic structure for headings, landmarks, and lists',
  'Readable contrast in both light and dark themes',
  'Accessible labels for icon-only controls and dialogs',
];

export default function AccessibilityPage() {
  return (
    <ContentPageLayout
      eyebrow="Support"
      title="Accessibility Statement"
      description="Stock Sense is actively maintained to improve usability and accessibility for all users."
    >
      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Current Focus Areas</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Need Help?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            If you find an accessibility issue, please contact us so we can prioritize a fix.
          </p>
          <Link href="/contact" className={`${primaryButtonClass} inline-flex min-h-[44px] items-center`}>
            Contact Support
          </Link>
        </section>
      </div>
    </ContentPageLayout>
  );
}
