import PortfolioDashboard from '@/components/portfolio/PortfolioDashboard';

export const metadata = {
  title: 'Portfolio Dashboard | Indian Stock Sense',
  description: 'Track and analyze your stock portfolio performance',
};

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