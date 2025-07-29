'use client';

import dynamic from 'next/dynamic';

const PortfolioDashboard = dynamic(() => import('@/components/portfolio/PortfolioDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-neon-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading portfolio data...</p>
      </div>
    </div>
  )
});

export default function PortfolioPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-baseline mb-6">
        <h1 className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
          Portfolio
        </h1>
        <span className="ml-2 text-2xl font-flex font-light text-gray-600 dark:text-gray-400">
          Dashboard
        </span>
      </div>
      <PortfolioDashboard />
    </div>
  );
} 