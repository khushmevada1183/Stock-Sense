import Link from 'next/link';

const checklist = [
  'Keyboard navigation support across primary actions',
  'Visible focus states for controls and links',
  'Semantic structure for headings, landmarks, and lists',
  'Readable contrast in both light and dark themes',
  'Accessible labels for icon-only controls and dialogs',
];

export default function AccessibilityPage() {
  return (
    <main className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Accessibility Statement</h1>
          <p className="text-gray-300">
            Stock Sense is actively maintained to improve usability and accessibility for all users.
          </p>
        </header>

        <section className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold text-white">Current Focus Areas</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-300">
            {checklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold text-white">Need Help?</h2>
          <p className="text-gray-300">
            If you find an accessibility issue, please contact us so we can prioritize a fix.
          </p>
          <Link href="/contact" className="inline-flex px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm">
            Contact Support
          </Link>
        </section>
      </div>
    </main>
  );
}
