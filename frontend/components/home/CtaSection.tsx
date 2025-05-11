import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Make Smarter Investment Decisions?</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
          Join thousands of investors using our platform to analyze Indian stocks
          and build profitable portfolios.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Free Account
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Learn More
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100,000+</div>
            <p className="text-gray-600 dark:text-gray-400">Stocks Analyzed</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">50,000+</div>
            <p className="text-gray-600 dark:text-gray-400">Registered Users</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10+</div>
            <p className="text-gray-600 dark:text-gray-400">Analysis Dimensions</p>
          </div>
        </div>
      </div>
    </section>
  );
} 