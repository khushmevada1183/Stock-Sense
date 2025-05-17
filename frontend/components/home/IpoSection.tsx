'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { stockService } from '@/services/api';
import { IpoItem } from '@/types/ipo';

// Helper function to normalize IPO data
const normalizeIpoData = (ipo: any): IpoItem => {
  // Process numbers and ensure they're valid
  const processNumber = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleanValue = value.replace(/[₹,]/g, '');
      const parsed = parseFloat(cleanValue);
      if (!isNaN(parsed)) return parsed;
    }
    
    return null;
  };
  
  // Format price range to ensure it's not just zeros
  const formatPriceRange = (min: any, max: any, existing: any): string => {
    if (existing && existing !== '₹0 - ₹0') return existing;
    
    const minPrice = processNumber(min);
    const maxPrice = processNumber(max);
    
    if (minPrice !== null && maxPrice !== null) {
      if (minPrice === 0 && maxPrice === 0) return 'Price TBA';
      if (minPrice > 0 && maxPrice > 0) return `₹${minPrice} - ₹${maxPrice}`;
    }
    
    return 'Price TBA';
  };
  
  // Check if this IPO has minimal data (used for disabling animations)
  const hasMinimalData = 
    (!ipo.min_price && !ipo.max_price) || 
    (ipo.min_price === 0 && ipo.max_price === 0) ||
    (!ipo.open && !ipo.listing_date) ||
    (!ipo.price_range || ipo.price_range === '₹0 - ₹0');
  
  // Create standard IpoItem object matching the interface
  const normalizedIpo: IpoItem = {
    company_name: ipo.company_name || ipo.name || 'Company TBA',
    symbol: ipo.symbol || '',
    logo: ipo.logo || null,
    issue_size: ipo.issue_size && ipo.issue_size !== '0' ? ipo.issue_size : 'Size TBA',
    price_range: formatPriceRange(ipo.min_price, ipo.max_price, ipo.price_range),
    listing_date: ipo.listing_date || 'Not Announced',
    subscription_status: ipo.subscription_status || ipo.status || 'Upcoming',
    status: ipo.status || ipo.subscription_status || 'Upcoming',
    gmp: ipo.gmp || '',
    issue_type: ipo.issue_type || (ipo.is_sme ? 'SME IPO' : 'Book Built'),
    open: ipo.open || ipo.bidding_start_date || '',
    close: ipo.close || ipo.bidding_end_date || '',
    rhpLink: ipo.rhpLink || '',
    drhpLink: ipo.drhpLink || '',
    min_price: processNumber(ipo.min_price),
    max_price: processNumber(ipo.max_price),
    is_sme: ipo.is_sme === true
  };
  
  // Add non-interface property for animations - we'll handle this separately
  const result = {
    ...normalizedIpo,
    hasMinimalData
  };
  
  return result;
};

// Define extended IPO item type with our custom animation properties
type ExtendedIpoItem = IpoItem & { 
  hasMinimalData?: boolean;
  bidding_start_date?: string;
};

export default function IpoSection() {
  const [ipoData, setIpoData] = useState<ExtendedIpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Function to scroll carousel horizontally
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const scrollAmount = 250; // px to scroll
    const scrollPosition = direction === 'left' 
      ? carouselRef.current.scrollLeft - scrollAmount 
      : carouselRef.current.scrollLeft + scrollAmount;
      
    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        setLoading(true);
        
        // Fetch IPO data from our real API
        const response = await stockService.getIpoData();
        
        if (response && response.ipoData && response.ipoData.length > 0) {
          const normalizedData = response.ipoData.map(normalizeIpoData);
          setIpoData(normalizedData);
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Upcoming IPOs</h3>
            </div>
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Upcoming IPOs</h3>
          <Link 
            href="/ipo"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
          >
            View All IPOs →
          </Link>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No upcoming IPO data available at this time.
        </p>
      </div>
    );
  }

  // Get only the first 5 IPOs to display
  const displayedIpos = ipoData.slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Upcoming IPOs</h3>
          <Link 
            href="/ipo"
            className="px-4 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded text-sm font-medium transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Companies that have filed for an IPO with SEBI. Details might be disclosed later.
        </div>
        
        {/* IPO Cards in a scrollable container */}
        <div className="relative mb-2">
          <div 
            ref={carouselRef}
            className="overflow-x-auto pb-4 relative max-w-full"
          >
            <div className="flex gap-6 px-1 py-2 min-w-full">
              {displayedIpos.map((ipo, index) => (
                <div 
                  key={index} 
                  className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 p-4 min-w-[250px] flex flex-col items-center ipo-card ${ipo.hasMinimalData ? 'minimal-data' : ''}`}
                  data-minimal={ipo.hasMinimalData ? 'true' : 'false'}
                >
                  {ipo.logo ? (
                    <div className="w-12 h-12 mb-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      <Image 
                        src={ipo.logo} 
                        alt={`${ipo.company_name} logo`} 
                        width={48} 
                        height={48} 
                        className="object-contain" 
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 text-gray-800 dark:text-gray-200 font-semibold">
                      {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
                      </div>
                    )}
                  <div className="font-semibold text-gray-800 dark:text-gray-100 text-center mb-2 line-clamp-1">{ipo.company_name}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Issue Size: <span className="font-medium">{ipo.issue_size}</span></div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Price Range: {ipo.price_range}</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                    Issue Date: {ipo.open || ipo.bidding_start_date || 'Not Announced'}
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ipo.subscription_status || '')}`}>
                      {ipo.subscription_status || 'Upcoming'}
                    </span>
                  </div>
                  
                  {/* Document links if available */}
                  {(ipo.rhpLink || ipo.drhpLink) && (
                    <div className="flex gap-4 mt-2">
                      {ipo.rhpLink && (
                        <a 
                          href={ipo.rhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-yellow-500 hover:text-yellow-600 hover:underline text-xs font-medium transition-colors"
                        >
                          RHP
                        </a>
                      )}
                      {ipo.drhpLink && (
                        <a 
                          href={ipo.drhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-500 hover:text-green-600 hover:underline text-xs font-medium transition-colors"
                        >
                          DRHP
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Fade effect for scrolling indication */}
            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Carousel navigation buttons */}
          {displayedIpos.length > 2 && (
            <div className="flex justify-end mt-2 gap-2">
              <button 
                onClick={() => scrollCarousel('left')}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Demat Account CTA */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
          <div className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Applying for IPOs?</div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
            To apply for IPOs, you need a Demat account. Open your account now to start investing.
          </p>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium inline-block transition-colors"
          >
            Open a Demat Account
          </a>
        </div>
        
        <div className="mt-4 text-right">
          <Link 
            href="/ipo"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium text-sm transition-colors"
          >
            Explore All IPOs →
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