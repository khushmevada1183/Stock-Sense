'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { stockService } from '@/services/api';

interface IpoItem {
  id?: number;
  company_name: string;
  symbol?: string;
  issue_size?: string;
  price_range?: string;
  issue_date?: string;
  listing_date?: string;
  subscription_status?: string;
  gmp?: string; // Grey Market Premium
}

export default function IpoSection() {
  const [ipoData, setIpoData] = useState<IpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        setLoading(true);
        
        // Fetch IPO data from our real API
        const response = await stockService.getIpoData();
        
        if (response && response.ipoData && response.ipoData.length > 0) {
          setIpoData(response.ipoData);
        } else {
          setError('No IPO data available');
          setIpoData([]);
        }
      } catch (err: any) {
        console.error('Error fetching IPO data:', err);
        setError('Failed to load IPO data');
        setIpoData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIpoData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-48"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (ipoData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Upcoming IPOs</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No upcoming IPO data available at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">Upcoming IPOs</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price Range
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Issue Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {ipoData.map((ipo, index) => (
                <tr key={ipo.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {ipo.company_name}
                    </div>
                    {ipo.symbol && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {ipo.symbol}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {ipo.price_range || 'TBA'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {ipo.issue_date || 'TBA'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${getStatusColor(ipo.subscription_status || '')}`}>
                      {ipo.subscription_status || 'Upcoming'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-right">
          <Link 
            href="/ipo"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
          >
            View All IPOs →
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine status color
function getStatusColor(status: string): string {
  status = status.toLowerCase();
  if (status.includes('open') || status.includes('active')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  } else if (status.includes('upcoming') || status.includes('announced')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  } else if (status.includes('closed') || status.includes('completed')) {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  } else if (status.includes('oversubscribed')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
} 