import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-blue-700 to-blue-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Comprehensive Analysis of Indian Stocks
          </h1>
          <p className="text-xl mb-8">
            Make informed investment decisions with our in-depth analysis across ten key dimensions
            including financials, management, industry trends and more.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/auth/register"
              className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/stocks"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg border border-blue-500 hover:bg-blue-700 transition-colors"
            >
              Browse Stocks
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 