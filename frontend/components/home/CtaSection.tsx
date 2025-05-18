import Link from 'next/link';

export default function CtaSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Ready to Make Smarter Investment Decisions?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Join thousands of investors using our platform to analyze Indian stocks
          and build profitable portfolios.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-neon-400 text-black font-semibold rounded-lg hover:bg-neon-300 transition-colors shadow-neon-sm hover:shadow-neon"
          >
            Create Free Account
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 bg-gray-850/50 backdrop-blur-sm text-white font-semibold rounded-lg border border-neon-400/20 hover:bg-gray-850/70 hover:border-neon-400/40 transition-all duration-300 hover:shadow-neon-sm"
          >
            Learn More
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-premium p-6 rounded-lg shadow-neon-sm border border-neon-400/10">
            <div className="text-3xl font-bold text-neon-400 mb-2">100,000+</div>
            <p className="text-gray-300">Stocks Analyzed</p>
          </div>
          
          <div className="glass-premium p-6 rounded-lg shadow-neon-sm border border-neon-400/10">
            <div className="text-3xl font-bold text-neon-400 mb-2">50,000+</div>
            <p className="text-gray-300">Registered Users</p>
          </div>
          
          <div className="glass-premium p-6 rounded-lg shadow-neon-sm border border-neon-400/10">
            <div className="text-3xl font-bold text-neon-400 mb-2">10+</div>
            <p className="text-gray-300">Analysis Dimensions</p>
          </div>
        </div>
      </div>
    </section>
  );
} 