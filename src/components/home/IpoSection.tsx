'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, DollarSign, Percent } from 'lucide-react';
import * as stockApi from '@/api/api';
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

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;

    const scrollAmount = 300;
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
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );

      const cards = cardsRef.current.querySelectorAll('.ipo-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.2)" }
      );

      cards.forEach((card) => {
        const metrics = card.querySelectorAll('.metric-item');
        gsap.fromTo(
          metrics,
          { opacity: 0, x: -5 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.1, delay: 0.3, ease: "power1.out" }
        );
      });
    }
  }, [loading, ipoData]);

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        const response = await stockApi.getIPOData();

        if (response && response.success && response.data) {
          let upcomingIpos: ExtendedIpoItem[] = [];

          if (Array.isArray(response.data)) {
            upcomingIpos = response.data.slice(0, 5).map((ipo: any) => ({
              ...ipo,
              hasMinimalData: !ipo.price_range || !ipo.issue_size
            }));
          } else if (response.data.upcoming && Array.isArray(response.data.upcoming)) {
            upcomingIpos = response.data.upcoming.slice(0, 5).map((ipo: any) => ({
              ...ipo,
              hasMinimalData: !ipo.price_range || !ipo.issue_size
            }));
          }

          setIpoData(upcomingIpos);
        } else {
          setIpoData(getMockIpoData());
          logger.debug('API returned unexpected data structure for IPOs, using fallback');
        }
      } catch (err) {
        logger.error('Failed to fetch IPO data:', err);
        setError('Failed to fetch IPO data');
        setIpoData(getMockIpoData());
      } finally {
        setLoading(false);
      }
    };

    const getMockIpoData = (): ExtendedIpoItem[] => {
      return [
        { company_name: 'Cello World Ltd', symbol: 'CELLO', price_range: '₹648 - ₹660', issue_size: '₹1,900 Cr', bidding_start_date: '2023-10-30' },
        { company_name: 'Protean eGov Technologies', symbol: 'PROTEAN', price_range: '₹745 - ₹792', issue_size: '₹490 Cr', bidding_start_date: '2023-11-06' },
        { company_name: 'ASK Automotive Ltd', symbol: 'ASKAUTO', price_range: '₹268 - ₹282', issue_size: '₹834 Cr', bidding_start_date: '2023-11-07' },
        { company_name: 'Aadhar Housing Finance', symbol: 'AADHAR', price_range: '₹280 - ₹295', issue_size: '₹3,000 Cr', bidding_start_date: '2023-11-15' },
        { company_name: 'Zaggle Prepaid Ocean Services', symbol: 'ZAGGLE', price_range: '₹156 - ₹164', issue_size: '₹563 Cr', bidding_start_date: '2023-11-20' }
      ];
    };

    fetchIpoData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 min-w-[300px]">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-800/60 rounded-xl shimmer" />
                <div className="ml-3">
                  <div className="h-5 bg-gray-800/60 rounded-lg w-32 mb-2 shimmer" />
                  <div className="h-3 bg-gray-800/60 rounded-lg w-16 shimmer" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-800/60 rounded-lg w-full shimmer" />
                <div className="h-4 bg-gray-800/60 rounded-lg w-3/4 shimmer" />
                <div className="h-4 bg-gray-800/60 rounded-lg w-2/3 shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-4 border-red-500/20 text-red-400">
        {error}
      </div>
    );
  }

  if (ipoData.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6">
        <p className="text-gray-500 text-center py-8">
          No upcoming IPO data available at this time.
        </p>
      </div>
    );
  }

  const displayedIpos = ipoData.slice(0, 5);

  return (
    <div ref={sectionRef} className="glass-card rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="text-gray-500 text-sm mb-6">
          Companies that have filed for an IPO with SEBI. Details might be disclosed later.
        </div>

        {/* IPO Cards in a scrollable container */}
        <div className="relative mb-4">
          <div
            ref={carouselRef}
            className="overflow-x-auto pb-4 relative max-w-full hide-scrollbar"
          >
            <div ref={cardsRef} className="flex gap-5 px-1 py-2 min-w-full">
              {displayedIpos.map((ipo, index) => (
                <div
                  key={index}
                  className="ipo-card glass-card card-shine rounded-xl p-5 min-w-[300px] flex flex-col relative overflow-hidden"
                  data-minimal={ipo.hasMinimalData ? 'true' : 'false'}
                >
                  {/* Status accent on top */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] ${getStatusGradient(ipo.subscription_status || '')}`} />

                  <div className="flex items-center mb-4">
                    {ipo.logo ? (
                      <div className="w-12 h-12 rounded-xl bg-gray-800/60 flex items-center justify-center overflow-hidden mr-3 border border-gray-700/30">
                        <Image
                          src={ipo.logo}
                          alt={`${ipo.company_name} logo`}
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-800/60 rounded-xl mr-3 text-gray-300 font-bold text-lg border border-gray-700/30">
                        {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-gray-100 mb-0.5">{ipo.company_name}</div>
                      <div className="text-gray-500 text-sm">{ipo.symbol}</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="metric-item flex items-center text-gray-300">
                      <div className="w-7 h-7 rounded-lg bg-yellow-500/10 flex items-center justify-center mr-2.5">
                        <DollarSign size={14} className="text-yellow-400" />
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Issue Size:</span>{' '}
                        <span className="text-gray-200 font-medium">{ipo.issue_size}</span>
                      </div>
                    </div>

                    <div className="metric-item flex items-center text-gray-300">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center mr-2.5">
                        <TrendingUp size={14} className="text-blue-400" />
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Price Range:</span>{' '}
                        <span className="text-gray-200 font-medium">{ipo.price_range}</span>
                      </div>
                    </div>

                    <div className="metric-item flex items-center text-gray-300">
                      <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center mr-2.5">
                        <Calendar size={14} className="text-green-400" />
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Open Date:</span>{' '}
                        <span className="text-gray-200 font-medium">{ipo.open || 'TBA'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription bar */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-600 mb-1.5">Expected Interest</div>
                    <div className="h-1.5 bg-gray-800/60 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-neon-400/60 to-cyan-400/40 rounded-full"
                        style={{ width: `${Math.random() * 50 + 50}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ipo.subscription_status || '')}`}>
                      {ipo.subscription_status || 'Upcoming'}
                    </span>
                  </div>

                  {/* Document links if available */}
                  {(ipo.rhpLink || ipo.drhpLink) && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-800/30">
                      {ipo.rhpLink && (
                        <a
                          href={ipo.rhpLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 text-xs font-medium transition-colors hover-underline"
                        >
                          RHP Document
                        </a>
                      )}
                      {ipo.drhpLink && (
                        <a
                          href={ipo.drhpLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors hover-underline"
                        >
                          DRHP Document
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Carousel navigation buttons */}
          {displayedIpos.length > 2 && (
            <div className="flex justify-end mt-2 gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-2 rounded-full glass-card text-gray-400 hover:text-neon-400 hover:border-neon-400/20 transition-all duration-300"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-2 rounded-full glass-card text-gray-400 hover:text-neon-400 hover:border-neon-400/20 transition-all duration-300"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Demat Account CTA */}
        <div className="mt-6 glass-card rounded-xl p-5 text-center border-neon-400/10">
          <div className="font-semibold text-gray-200 mb-2">Applying for IPOs?</div>
          <p className="text-gray-500 text-sm mb-4">
            To apply for IPOs, you need a Demat account. Open your account now to start investing.
          </p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-neon-400 hover:shadow-neon text-black rounded-lg text-sm font-semibold inline-block transition-all duration-300 hover:scale-[1.03]"
          >
            Open a Demat Account
          </a>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine status badge color
function getStatusColor(status: string): string {
  status = status.toLowerCase();
  if (status.includes('open') || status.includes('active')) {
    return 'bg-green-500/10 text-green-400 border border-green-500/20';
  } else if (status.includes('upcoming') || status.includes('announced')) {
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  } else if (status.includes('closed') || status.includes('completed')) {
    return 'bg-gray-800/40 text-gray-400 border border-gray-700/30';
  } else if (status.includes('oversubscribed')) {
    return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
  } else {
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
  }
}

// Helper function for gradient accent line color
function getStatusGradient(status: string): string {
  status = status.toLowerCase();
  if (status.includes('open') || status.includes('active')) {
    return 'bg-gradient-to-r from-transparent via-green-400/50 to-transparent';
  } else if (status.includes('oversubscribed')) {
    return 'bg-gradient-to-r from-transparent via-purple-400/50 to-transparent';
  }
  return 'bg-gradient-to-r from-transparent via-blue-400/50 to-transparent';
}