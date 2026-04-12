'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import * as stockApi from '@/api/api';
import { IpoItem } from '@/types/ipo';
import { gsap } from 'gsap';
import { Button } from '../ui/button';

// Define extended IPO item type with our custom animation properties
type ExtendedIpoItem = IpoItem & {
  hasMinimalData?: boolean;
  bidding_start_date?: string;
};

export default function IpoSection() {
  const router = useRouter();
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
            upcomingIpos = response.data.slice(0, 5).map((ipo: ExtendedIpoItem) => ({
              ...ipo,
              hasMinimalData: !ipo.price_range || !ipo.issue_size
            }));
          } else if (response.data.upcoming && Array.isArray(response.data.upcoming)) {
            upcomingIpos = response.data.upcoming.slice(0, 5).map((ipo: ExtendedIpoItem) => ({
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
      <div className="rounded-lg border border-slate-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/90 p-6">
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 dark:border-gray-700/50 bg-white dark:bg-gray-900/90 p-5 min-w-[300px] animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-slate-200 dark:bg-gray-700/70 rounded-lg" />
                <div className="ml-3">
                  <div className="h-5 bg-slate-200 dark:bg-gray-700/70 rounded-lg w-32 mb-2" />
                  <div className="h-3 bg-slate-200 dark:bg-gray-700/70 rounded-lg w-16" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-gray-700/70 rounded-lg w-full" />
                <div className="h-4 bg-slate-200 dark:bg-gray-700/70 rounded-lg w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-gray-700/70 rounded-lg w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 p-4 text-red-700 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (ipoData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/90 p-6">
        <p className="text-slate-600 dark:text-slate-400 text-center py-8">
          No upcoming IPO data available at this time.
        </p>
      </div>
    );
  }

  const displayedIpos = ipoData.slice(0, 5);

  return (
    <div ref={sectionRef} className="rounded-lg border border-slate-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/90 overflow-hidden">
      <div className="p-6">
        <div className="text-slate-600 dark:text-slate-400 text-sm mb-6">
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
                  className="ipo-card min-w-[300px]"
                  data-minimal={ipo.hasMinimalData ? 'true' : 'false'}
                >
                  {(() => {
                    const statusText = (ipo.subscription_status || 'Upcoming').toLowerCase();
                    const isPositiveStatus = /(oversubscribed|subscribed|open|strong|bullish)/.test(statusText);

                    return (
                      <div className="relative w-full min-h-[330px] rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900/90 p-5 hover:shadow-md transition-shadow flex flex-col">
                        <div className="flex items-center mb-4">
                          {ipo.logo ? (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-gray-800/80 flex items-center justify-center overflow-hidden mr-3">
                              <Image
                                src={ipo.logo}
                                alt={`${ipo.company_name} logo`}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-gray-800/80 rounded-lg mr-3 text-slate-900 dark:text-white font-bold text-lg">
                              {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white mb-0.5">{ipo.company_name}</div>
                            <div className="text-slate-500 dark:text-slate-400 text-sm">{ipo.symbol}</div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="metric-item flex items-center text-slate-700 dark:text-slate-300">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-gray-800/80 flex items-center justify-center mr-2.5">
                              <DollarSign size={14} className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500 dark:text-slate-400">Issue Size:</span>{' '}
                              <span className="text-slate-900 dark:text-white font-medium">{ipo.issue_size}</span>
                            </div>
                          </div>

                          <div className="metric-item flex items-center text-slate-700 dark:text-slate-300">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-gray-800/80 flex items-center justify-center mr-2.5">
                              <TrendingUp size={14} className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500 dark:text-slate-400">Price Range:</span>{' '}
                              <span className="text-slate-900 dark:text-white font-medium">{ipo.price_range}</span>
                            </div>
                          </div>

                          <div className="metric-item flex items-center text-slate-700 dark:text-slate-300">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-gray-800/80 flex items-center justify-center mr-2.5">
                              <Calendar size={14} className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500 dark:text-slate-400">Open Date:</span>{' '}
                              <span className="text-slate-900 dark:text-white font-medium">{ipo.open || 'TBA'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Subscription bar */}
                        <div className="mb-4">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">Expected Interest</div>
                          <div className="h-2 bg-slate-200 dark:bg-gray-700/70 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isPositiveStatus
                                  ? 'bg-green-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.random() * 50 + 50}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-auto">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isPositiveStatus
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {ipo.subscription_status || 'Upcoming'}
                          </span>
                        </div>

                        {/* Document links if available */}
                        {(ipo.rhpLink || ipo.drhpLink) && (
                          <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-gray-700/60">
                            {ipo.rhpLink && (
                              <a
                                href={ipo.rhpLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                              >
                                RHP Document
                              </a>
                            )}
                            {ipo.drhpLink && (
                              <a
                                href={ipo.drhpLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors"
                              >
                                DRHP Document
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>

          {/* Carousel navigation buttons */}
          {displayedIpos.length > 2 && (
            <div className="flex justify-end mt-2 gap-2">
              <button
                onClick={() => scrollCarousel('left')}
                className="p-2 rounded-lg border border-slate-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="p-2 rounded-lg border border-slate-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/90 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Demat Account CTA */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-white dark:border-gray-700/50 dark:bg-gray-900/90 p-5 text-center">
          <div className="font-semibold text-slate-900 dark:text-white mb-2">Applying for IPOs?</div>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            To apply for IPOs, you need a Demat account. Open your account now to start investing.
          </p>
          <Button
            size="sm"
            className="mx-auto"
            onClick={() => router.push('/auth/register')}
          >
            Open a Demat Account
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine status badge color (kept for potential future use)
function getStatusColor(status: string): string {
  const value = status.toLowerCase();
  if (/oversubscribed|subscribed|open|strong|bullish/.test(value)) {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  }
  if (/undersubscribed|closed|withdrawn|failed|weak|bearish/.test(value)) {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}