'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, IndianRupee } from 'lucide-react';
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
      <div className="rounded-[28px] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <div className="flex gap-5 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[300px] animate-pulse rounded-[24px] border border-slate-200/70 bg-white/75 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <div className="ml-3">
                  <div className="mb-2 h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-200/70 bg-rose-50/80 p-4 text-rose-700 backdrop-blur-xl dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-300">
        {error}
      </div>
    );
  }

  if (ipoData.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200/70 bg-white/75 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <p className="py-8 text-center text-slate-600 dark:text-slate-400">
          No upcoming IPO data available at this time.
        </p>
      </div>
    );
  }

  const displayedIpos = ipoData.slice(0, 5);

  return (
    <div ref={sectionRef} className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
      <div className="p-6">
        <div className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Companies that have filed for an IPO with SEBI. Details might be disclosed later.
        </div>

        {/* IPO Cards in a scrollable container */}
        <div className="relative mb-4">
          <div
            ref={carouselRef}
            className="relative max-w-full overflow-x-auto pb-4 hide-scrollbar"
          >
            <div ref={cardsRef} className="flex min-w-full gap-4 px-1 py-2">
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
                      <div className="relative flex min-h-[330px] w-full flex-col rounded-[28px] border border-slate-200/70 bg-white/75 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
                        <div className="flex items-center mb-4">
                          {ipo.logo ? (
                            <div className="mr-3 flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-100/80 dark:bg-white/10">
                              <Image
                                src={ipo.logo}
                                alt={`${ipo.company_name} logo`}
                                width={48}
                                height={48}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100/80 text-lg font-semibold text-slate-900 dark:bg-white/10 dark:text-white">
                              {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
                            </div>
                          )}
                          <div>
                            <div className="mb-0.5 font-semibold tracking-tight text-slate-950 dark:text-white">{ipo.company_name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{ipo.symbol}</div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="metric-item flex items-center text-slate-700 dark:text-slate-300">
                            <div className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100/80 dark:bg-white/10">
                              <IndianRupee size={14} className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500 dark:text-slate-400">Issue Size:</span>{' '}
                              <span className="text-slate-900 dark:text-white font-medium">{ipo.issue_size}</span>
                            </div>
                          </div>

                          <div className="metric-item flex items-center text-slate-700 dark:text-slate-300">
                            <div className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100/80 dark:bg-white/10">
                              <TrendingUp size={14} className="text-slate-600 dark:text-slate-400" />
                            </div>
                            <div className="text-sm">
                              <span className="text-slate-500 dark:text-slate-400">Price Range:</span>{' '}
                              <span className="text-slate-900 dark:text-white font-medium">{ipo.price_range}</span>
                            </div>
                          </div>

                          <div className="metric-item flex items-center text-slate-700 dark:text-slate-300">
                            <div className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100/80 dark:bg-white/10">
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
                          <div className="mb-1.5 text-xs text-slate-500 dark:text-slate-400">Expected interest</div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
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
                className="rounded-full border border-slate-300/80 bg-white/80 p-2 text-slate-600 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="rounded-full border border-slate-300/80 bg-white/80 p-2 text-slate-600 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Demat Account CTA */}
          <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-white/75 p-5 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="mb-2 font-semibold tracking-tight text-slate-950 dark:text-white">Applying for IPOs?</div>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            To apply for IPOs, you need a Demat account. Open your account now to start investing.
          </p>
          <Button
            size="sm"
              className="mx-auto rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            onClick={() => router.push('/signup')}
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