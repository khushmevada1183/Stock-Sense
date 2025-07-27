'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, DollarSign, Percent } from 'lucide-react';
import * as stockApi from '@/api/clientApi';
import { IpoItem } from '@/types/ipo';
import { gsap } from 'gsap';

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
  const cardsRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

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

  // Initialize animations
  useEffect(() => {
    if (!loading && ipoData.length > 0 && sectionRef.current && cardsRef.current) {
      // Animate the section
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      // Animate each card with staggered effect
      const cards = cardsRef.current.querySelectorAll('.ipo-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 15, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.4, 
          stagger: 0.1, 
          ease: "back.out(1.2)" 
        }
      );

      // Animate metrics within each card
      cards.forEach((card) => {
        const metrics = card.querySelectorAll('.metric-item');
        gsap.fromTo(
          metrics,
          { opacity: 0, x: -5 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.3, 
            stagger: 0.1,
            delay: 0.3,
            ease: "power1.out" 
          }
        );
      });
    }
  }, [loading, ipoData]);

  useEffect(() => {
    setLoading(false);
    setIpoData([]);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700/50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-100">Upcoming IPOs</h3>
            </div>
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-400">
        {error}
      </div>
    );
  }

  if (ipoData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-100">Upcoming IPOs</h3>
          <Link 
            href="/ipo"
            className="text-blue-400 hover:text-blue-300 font-medium text-sm"
          >
            View All IPOs →
          </Link>
        </div>
        <p className="text-gray-400 text-center py-8">
          No upcoming IPO data available at this time.
        </p>
      </div>
    );
  }

  // Get only the first 5 IPOs to display
  const displayedIpos = ipoData.slice(0, 5);

  return (
    <div ref={sectionRef} className="bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-800">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-100">Upcoming IPOs</h3>
          <Link 
            href="/ipo"
            className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg text-sm font-medium transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="text-gray-400 text-sm mb-6">
          Companies that have filed for an IPO with SEBI. Details might be disclosed later.
        </div>
        
        {/* IPO Cards in a scrollable container */}
        <div className="relative mb-4">
          <div 
            ref={carouselRef}
            className="overflow-x-auto pb-4 relative max-w-full hide-scrollbar"
          >
            <div ref={cardsRef} className="flex gap-6 px-1 py-2 min-w-full">
              {displayedIpos.map((ipo, index) => (
                <div 
                  key={index} 
                  className="ipo-card bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 p-5 min-w-[280px] flex flex-col"
                  data-minimal={ipo.hasMinimalData ? 'true' : 'false'}
                >
                  <div className="flex items-center mb-4">
                  {ipo.logo ? (
                      <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden mr-3">
                      <Image 
                        src={ipo.logo} 
                        alt={`${ipo.company_name} logo`} 
                        width={48} 
                        height={48} 
                        className="object-contain" 
                      />
                    </div>
                  ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-700 rounded-lg mr-3 text-gray-200 font-bold text-xl">
                      {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-100 mb-0.5">{ipo.company_name}</div>
                      <div className="text-gray-400 text-sm">{ipo.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="metric-item flex items-center text-gray-300">
                      <DollarSign size={16} className="mr-2 text-yellow-500" />
                      <div className="text-sm">
                        <span className="text-gray-400">Issue Size:</span> {ipo.issue_size}
                      </div>
                    </div>
                    
                    <div className="metric-item flex items-center text-gray-300">
                      <TrendingUp size={16} className="mr-2 text-blue-500" />
                      <div className="text-sm">
                        <span className="text-gray-400">Price Range:</span> {ipo.price_range}
                      </div>
                    </div>
                    
                    <div className="metric-item flex items-center text-gray-300">
                      <Calendar size={16} className="mr-2 text-green-500" />
                      <div className="text-sm">
                        <span className="text-gray-400">Open Date:</span> {ipo.open || 'TBA'}
                      </div>
                    </div>
                  </div>

                  {/* Subscription bar */}
                  <div className="mb-3">
                    <div className="text-xs text-gray-400 mb-1">Expected Interest</div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        style={{ width: `${Math.random() * 50 + 50}%` }} 
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ipo.subscription_status || '')}`}>
                      {ipo.subscription_status || 'Upcoming'}
                    </span>
                  </div>
                  
                  {/* Document links if available */}
                  {(ipo.rhpLink || ipo.drhpLink) && (
                    <div className="flex gap-4 mt-3">
                      {ipo.rhpLink && (
                        <a 
                          href={ipo.rhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-yellow-500 hover:text-yellow-400 hover:underline text-xs font-medium transition-colors"
                        >
                          RHP Document
                        </a>
                      )}
                      {ipo.drhpLink && (
                        <a 
                          href={ipo.drhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-500 hover:text-green-400 hover:underline text-xs font-medium transition-colors"
                        >
                          DRHP Document
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Fade effect for scrolling indication */}
            <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Carousel navigation buttons */}
          {displayedIpos.length > 2 && (
            <div className="flex justify-end mt-2 gap-2">
              <button 
                onClick={() => scrollCarousel('left')}
                className="p-1.5 rounded-full bg-gray-900/90 backdrop-blur-lg text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => scrollCarousel('right')}
                className="p-1.5 rounded-full bg-gray-900/90 backdrop-blur-lg text-gray-300 border border-gray-700 hover:bg-gray-700 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        
        {/* Demat Account CTA */}
        <div className="mt-6 bg-blue-900/20 rounded-lg p-4 text-center border border-blue-900/40">
          <div className="font-semibold text-gray-100 mb-2">Applying for IPOs?</div>
          <p className="text-gray-400 text-sm mb-3">
            To apply for IPOs, you need a Demat account. Open your account now to start investing.
          </p>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium inline-block transition-colors"
          >
            Open a Demat Account
          </a>
        </div>
        
        <div className="mt-4 text-right">
          <Link 
            href="/ipo"
            className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-sm transition-colors"
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
    return 'bg-green-900/60 text-green-300 border border-green-800';
  } else if (status.includes('upcoming') || status.includes('announced')) {
    return 'bg-blue-900/60 text-blue-300 border border-blue-800';
  } else if (status.includes('closed') || status.includes('completed')) {
    return 'bg-gray-900/90 backdrop-blur-lg text-gray-300 border border-gray-700';
  } else if (status.includes('oversubscribed')) {
    return 'bg-purple-900/60 text-purple-300 border border-purple-800';
  } else {
    return 'bg-gray-900/90 backdrop-blur-lg text-gray-300 border border-gray-700';
  }
}

// Add this to your global CSS or as a scoped style
const styles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`; 