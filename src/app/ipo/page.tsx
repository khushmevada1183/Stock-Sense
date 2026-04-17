'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { IpoItem } from '@/types/ipo';
import { logger } from '@/lib/logger';
import { useAnimation } from '@/animations/shared/AnimationContext';
import { initIpoPageAnimations } from '@/animations/pages/ipoAnimations';
import { createCardHoverEffect, createIPOItemHoverEffect } from '@/animations/shared/AnimationUtils';
import * as stockApi from '@/api/api';
import { FEATURES, API_CONFIG } from '@/services/config.js';

const IPO_NEWS = [
  { title: "Mouri Tech refiles DRHP with SEBI", date: "8 May, 2:56 PM" },
  { title: "SK Minerals & Additives files draft papers with BSE SME", date: "6 May, 3:46 PM" },
  { title: "Travel Food Services gets SEBI's nod for Rs 2,000 crore IPO", date: "30 Apr, 3:24 PM" },
  { title: "Canara Robeco AMC files DRHP with SEBI", date: "28 Apr, 12:36 PM" },
  { title: "Continuum Green Energy gets SEBI's nod for Rs 3,650 crore IPO", date: "22 Apr, 2:52 PM" }
];

const IPO_ANALYSIS = [
  { title: "Accretion Pharmaceuticals coming with IPO to raise Rs 29.75 crore", date: "10 May, 12:40 PM" },
  { title: "Integrity Infrabuild Developers coming with IPO to raise Rs 12 crore", date: "9 May, 3:44 PM" },
  { title: "Virtual Galaxy Infotech coming with IPO to raise Rs 93.29 crore", date: "8 May, 12:28 PM" },
  { title: "Manoj Jewellers coming with IPO to raise Rs 16.20 crore", date: "2 May, 3:08 PM" },
  { title: "Srigee DLM coming with IPO to raise Rs 16.98 crore", date: "2 May, 12:28 PM" }
];

const FAQS = [
  { question: "What is an IPO?", answer: "IPO or the Initial Public Offering is the first time a company issues its shares to the public. As an investor, you will now be able to subscribe for such shares, which was earlier open to only a specific set of internal and institutional investors via opening a Demat account." },
  { question: "How to invest in an IPO?", answer: "You can invest in an IPO through your Demat account by applying via a broker or online on the ASBA platform provided by your bank/broker." },
  { question: "What is the benefit of an IPO?", answer: "Early investments in IPOs can give significant listing gains if the company performs well, but they also carry risk." },
  { question: "What are the disadvantages of an IPO?", answer: "IPO investments are risky as price volatility is high and information is limited; choosing an IPO purely on hype can be dangerous." },
  { question: "What is the minimum amount to invest in an IPO?", answer: "The minimum investment is usually the price of one lot, which varies from IPO to IPO and is specified in the offer document." },
  { question: "Can I sell IPO shares immediately after listing?", answer: "Yes, you can sell your IPO shares on the listing day itself, provided they are credited to your Demat account and the stock is listed on the exchange." },
  { question: "How is IPO allotment decided?", answer: "IPO allotment is done via a lottery system if the IPO is oversubscribed. In case of undersubscription, all applicants get full allotment." },
  { question: "What is the difference between RHP and DRHP?", answer: "DRHP (Draft Red Herring Prospectus) is the preliminary document filed with SEBI, while RHP (Red Herring Prospectus) is the final offer document with all details before the IPO opens." }
];

type IpoCardData = IpoItem & {
  subscription_percentage?: number;
  externalKey?: string;
  companyName?: string;
  priceMin?: number | string;
  priceMax?: number | string;
  issuePrice?: number | string;
  listingPrice?: number | string;
  listingGainsPercent?: number;
  biddingStartDate?: string;
  biddingEndDate?: string;
  listingDate?: string;
  lotSize?: number | string;
  issueSizeText?: string;
  isSme?: boolean;
};

interface APIResponse {
  success: boolean;
  data: {
    grouped?: boolean;
    total?: number;
    upcoming?: IpoCardData[];
    active?: IpoCardData[];
    listed?: IpoCardData[];
    closed?: IpoCardData[];
    entries?: IpoCardData[];
  };
}

const toIpoDetailsHref = (ipo: IpoCardData) => {
  const identifier = String(ipo.id || ipo.symbol || '').trim();
  return `/ipo/${encodeURIComponent(identifier)}`;
};

// Enhanced Upcoming IPO card component with consistent layout
const UpcomingIpoCard = ({ ipo }: { ipo: IpoCardData }) => {
  const formatPrice = (price: string | number | null | undefined) => {
    if (!price) return "N/A";
    return price.toString().startsWith('₹') ? price : `₹${price}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Format price range with currency
  const formatPriceRange = () => {
    if (ipo.min_price && ipo.max_price) {
      if (ipo.min_price === ipo.max_price) {
        return formatPrice(ipo.min_price);
      }
      return `₹${ipo.min_price} - ₹${ipo.max_price}`;
    }
    return formatPrice(ipo.issue_price) || 'Price TBA';
  };

  // Calculate days until opening
  const getDaysUntilOpening = () => {
    if (!ipo.bidding_start_date) return null;
    const startDate = new Date(ipo.bidding_start_date);
    const today = new Date();
    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="relative group">
      {/* Hover glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl h-[420px] flex flex-col">
        {/* Header with company info - Fixed height */}
        <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white mb-1 line-clamp-2 leading-tight h-12">{ipo.name || ipo.company_name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-mono truncate">{ipo.symbol}</span>
                {ipo.is_sme && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                    SME
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                UPCOMING
              </span>
              {(() => {
                const days = getDaysUntilOpening();
                return days !== null && days > 0 ? (
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {days} days to go
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Main content - Flexible height */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Price grid - Fixed height */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Price Band</p>
              <p className="font-semibold text-white text-sm truncate">{formatPriceRange()}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Lot Size</p>
              <p className="font-semibold text-white text-sm">{ipo.lot_size || 'TBA'}</p>
            </div>
          </div>

          {/* Timeline - Fixed height */}
          <div className="space-y-2 mb-4 h-16">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Opens On</span>
              <span className="text-sm font-medium text-white">{formatDate(ipo.bidding_start_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Expected Listing</span>
              <span className="text-sm font-medium text-white">{formatDate(ipo.listing_date)}</span>
            </div>
          </div>

          {/* Status message - Fixed height */}
          <div className="mb-4 h-12 flex items-center">
            {ipo.additional_text && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 w-full">
                <p className="text-xs text-blue-400 font-medium line-clamp-2">{ipo.additional_text}</p>
              </div>
            )}
          </div>

          {/* Action buttons - Fixed at bottom */}
          <div className="flex gap-2 mt-auto">
            <Link 
              href={toIpoDetailsHref(ipo)}
              className="flex-1 text-center py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Details
            </Link>
            {ipo.document_url && (
              <a 
                href={ipo.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white text-sm rounded-lg transition-all duration-200 border border-gray-600/50 flex-shrink-0"
                title="View Prospectus"
              >
                📄
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Active IPO card component with consistent layout
const ActiveIpoCard = ({ ipo }: { ipo: IpoCardData }) => {
  const formatPrice = (price: string | number | null | undefined) => {
    if (!price) return "N/A";
    return price.toString().startsWith('₹') ? price : `₹${price}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Format price range
  const formatPriceRange = () => {
    if (ipo.min_price && ipo.max_price) {
      if (ipo.min_price === ipo.max_price) {
        return formatPrice(ipo.min_price);
      }
      return `₹${ipo.min_price} - ₹${ipo.max_price}`;
    }
    return formatPrice(ipo.issue_price) || 'Price TBA';
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!ipo.bidding_end_date) return null;
    const endDate = new Date(ipo.bidding_end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate subscription percentage (if available)
  const getSubscriptionStatus = () => {
    if (ipo.subscription_percentage) {
      return `${ipo.subscription_percentage}x`;
    }
    return null;
  };

  return (
    <div className="relative group">
      {/* Hover glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl h-[420px] flex flex-col">
        {/* Header with company info - Fixed height */}
        <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white mb-1 line-clamp-2 leading-tight h-12">{ipo.name || ipo.company_name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-mono truncate">{ipo.symbol}</span>
                {ipo.is_sme && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                    SME
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30 animate-pulse">
                LIVE NOW
              </span>
              {(() => {
                const days = getDaysRemaining();
                return days !== null ? (
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {days > 0 ? `${days} days left` : 'Last day'}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        </div>

        {/* Main content - Flexible height */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Price grid - Fixed height */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Price Band</p>
              <p className="font-semibold text-white text-sm truncate">{formatPriceRange()}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Lot Size</p>
              <p className="font-semibold text-white text-sm">{ipo.lot_size || 'TBA'}</p>
            </div>
          </div>

          {/* Subscription status - Fixed height */}
          <div className="mb-4 h-12 flex items-center">
            {getSubscriptionStatus() ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-400 font-medium">Subscription</span>
                  <span className="text-sm font-bold text-green-400">{getSubscriptionStatus()}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-2 w-full">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-400">Live Bidding Open</span>
                </div>
              </div>
            )}
          </div>

          {/* Timeline - Fixed height */}
          <div className="space-y-2 mb-4 h-16">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Closes On</span>
              <span className="text-sm font-medium text-white">{formatDate(ipo.bidding_end_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Expected Listing</span>
              <span className="text-sm font-medium text-white">{formatDate(ipo.listing_date)}</span>
            </div>
          </div>

          {/* Status message - Fixed height */}
          <div className="mb-4 h-12 flex items-center">
            {ipo.additional_text && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 w-full">
                <p className="text-xs text-green-400 font-medium line-clamp-2">{ipo.additional_text}</p>
              </div>
            )}
          </div>

          {/* Action buttons - Fixed at bottom */}
          <div className="flex gap-2 mt-auto">
            <Link 
              href={toIpoDetailsHref(ipo)}
              className="flex-1 text-center py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Apply Now
            </Link>
            {ipo.document_url && (
              <a 
                href={ipo.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white text-sm rounded-lg transition-all duration-200 border border-gray-600/50 flex-shrink-0"
                title="View Prospectus"
              >
                📄
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
// Enhanced Listed IPO card component with consistent layout
const SimpleIpoCard = ({ ipo }: { ipo: IpoCardData }) => {
  const listingGains = ipo.listing_gains;
  const hasListingGains = typeof listingGains === 'number';

  // Helper function to determine color class based on gain value
  const getGainColorClass = () => {
    if (!hasListingGains) return "text-gray-400";
    
    if (listingGains > 0) return "text-green-400";
    if (listingGains < 0) return "text-red-400";
    return "text-gray-400";
  };

  // Helper function for gain background color
  const getGainBgClass = () => {
    if (!hasListingGains) return "bg-gray-500/10 border-gray-500/20";
    
    if (listingGains > 0) return "bg-green-500/10 border-green-500/20";
    if (listingGains < 0) return "bg-red-500/10 border-red-500/20";
    return "bg-gray-500/10 border-gray-500/20";
  };

  // Format gain value with +/- sign and percentage
  const formatGain = () => {
    if (!hasListingGains) return "N/A";
    
    // API returns listing_gains as percentage already (like 3.076923076923077 for 3.08%)
    return `${listingGains > 0 ? '+' : ''}${listingGains.toFixed(2)}%`;
  };
  
  const formatPrice = (price: string | number | null | undefined) => {
    if (!price) return "N/A";
    return price.toString().startsWith('₹') ? price : `₹${price}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Calculate listing performance category
  const getPerformanceCategory = () => {
    if (!hasListingGains) return 'Unknown';
    
    if (listingGains >= 50) return 'Stellar';
    if (listingGains >= 20) return 'Strong';
    if (listingGains >= 5) return 'Good';
    if (listingGains >= 0) return 'Positive';
    if (listingGains >= -10) return 'Weak';
    return 'Poor';
  };

  return (
    <div className="relative group">
      {/* Hover glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
      
      <div className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl rounded-xl overflow-hidden border border-gray-700/50 shadow-2xl h-[420px] flex flex-col">
        {/* Header with company info - Fixed height */}
        <div className="p-4 border-b border-gray-700/50 flex-shrink-0">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-white mb-1 line-clamp-2 leading-tight h-12">{ipo.name || ipo.company_name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-mono truncate">{ipo.symbol}</span>
                {ipo.is_sme && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full border border-amber-500/30">
                    SME
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/30">
                LISTED
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {getPerformanceCategory()}
              </span>
            </div>
          </div>
        </div>

        {/* Main content - Flexible height */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Performance highlight - Fixed height */}
          <div className={`${getGainBgClass()} rounded-lg p-3 mb-4 border h-16 flex items-center`}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block">Performance</span>
                  <span className="text-xs text-gray-400 block">vs Issue Price</span>
                </div>
                {/* Stock trend indicator */}
                <div className="ml-2">
                  {hasListingGains && listingGains > 0 ? (
                    // Green upward trend graph
                    <svg width="24" height="16" viewBox="0 0 24 16" className="text-green-400">
                      <path
                        d="M2 14 L6 10 L10 12 L14 6 L18 8 L22 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Upward arrow */}
                      <path
                        d="M18 2 L22 2 L22 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : hasListingGains && listingGains < 0 ? (
                    // Red downward trend graph
                    <svg width="24" height="16" viewBox="0 0 24 16" className="text-red-400">
                      <path
                        d="M2 2 L6 6 L10 4 L14 10 L18 8 L22 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Downward arrow */}
                      <path
                        d="M18 14 L22 14 L22 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    // Neutral flat line
                    <svg width="24" height="16" viewBox="0 0 24 16" className="text-gray-400">
                      <path
                        d="M2 8 L22 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span className={`text-xl font-bold ${getGainColorClass()}`}>
                {formatGain()}
              </span>
            </div>
          </div>

          {/* Price details grid - Fixed height */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Issue Price</p>
              <p className="font-semibold text-white text-sm truncate">{formatPrice(ipo.issue_price)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Listing Price</p>
              <p className="font-semibold text-white text-sm truncate">{formatPrice(ipo.listing_price)}</p>
            </div>
          </div>

          {/* Timeline - Fixed height */}
          <div className="space-y-2 mb-4 h-16">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Listing Date</span>
              <span className="text-sm font-medium text-white">{formatDate(ipo.listing_date)}</span>
            </div>
            {ipo.lot_size && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wide">Lot Size</span>
                <span className="text-sm font-medium text-white">{ipo.lot_size}</span>
              </div>
            )}
          </div>

          {/* Status message - Fixed height */}
          <div className="mb-4 h-12 flex items-center">
            {ipo.additional_text && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 w-full">
                <p className="text-xs text-purple-400 font-medium line-clamp-2">{ipo.additional_text}</p>
              </div>
            )}
          </div>

          {/* Action buttons - Fixed at bottom */}
          <div className="flex gap-2 mt-auto">
            <Link 
              href={toIpoDetailsHref(ipo)}
              className="flex-1 text-center py-2.5 bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Analysis
            </Link>
            {ipo.document_url && (
              <a 
                href={ipo.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white text-sm rounded-lg transition-all duration-200 border border-gray-600/50 flex-shrink-0"
                title="View Prospectus"
              >
                📄
              </a>
            )}
          </div>
        </div>

        {/* Performance indicator bar with trend visualization */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-400">Performance Trend</span>
            <div className="flex items-center gap-1">
              {hasListingGains && listingGains > 0 ? (
                <>
                  <svg width="12" height="8" viewBox="0 0 12 8" className="text-green-400">
                    <path d="M1 7 L6 2 L11 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M8 1 L11 1 L11 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-green-400 font-medium">Bullish</span>
                </>
              ) : hasListingGains && listingGains < 0 ? (
                <>
                  <svg width="12" height="8" viewBox="0 0 12 8" className="text-red-400">
                    <path d="M1 1 L6 6 L11 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <path d="M8 7 L11 7 L11 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-red-400 font-medium">Bearish</span>
                </>
              ) : (
                <>
                  <svg width="12" height="8" viewBox="0 0 12 8" className="text-gray-400">
                    <path d="M1 4 L11 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs text-gray-400 font-medium">Neutral</span>
                </>
              )}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                (listingGains ?? 0) >= 0 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{
                width: `${Math.min(100, Math.max(5, Math.abs(listingGains ?? 0) * 2))}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Convert API response data to IpoItem format
  const mapToIpoItem = (ipo: unknown): IpoItem => {
    // Process and validate the IPO data to ensure it has all required fields
    // Make sure we're working with a copy to avoid modifying the original
    
    // Validate that we have at least some basic data to work with
    if (!ipo || (typeof ipo !== 'object')) {
      logger.warn('Received invalid IPO data, using fallback structure');
      // Return a minimal valid structure with all required fields
      return {
        company_name: 'Data Unavailable',
        symbol: 'N/A',
        logo: undefined,
        subscription_status: 'upcoming',
        status: 'upcoming',
        price_range: 'Price TBA',
        issue_size: 'Size TBA',
        issue_type: 'Book Built',
        min_price: undefined,
        max_price: undefined,
        open: undefined,
        close: undefined,
        listing_date: undefined,
        is_sme: false,
        ipo_price: undefined,
        listing_price: undefined,
        listing_gain: 'N/A',
        listing_gains: undefined,
        document_url: undefined,
        rhpLink: undefined,
        drhpLink: undefined,
        additional_text: undefined,
        bidding_start_date: undefined,
        bidding_end_date: undefined,
        lot_size: undefined
      };
    }

    const source = ipo as IpoCardData;

  // Update the processNumber function to return undefined instead of null
  const processNumber = (value: unknown): number | undefined => {
    if (value === null || value === undefined) return undefined;
      
      if (typeof value === 'number') return value;
      
      if (typeof value === 'string') {
        // Remove currency symbols and commas
        const cleanValue = value.replace(/[₹,]/g, '');
        const parsed = parseFloat(cleanValue);
        if (!isNaN(parsed)) return parsed;
      }
      
    return undefined;
    };
    
    // Format price range to ensure it's not just zeros
    const formatPriceRange = (
      min: string | number | undefined,
      max: string | number | undefined,
      existing: string | undefined
    ): string => {
      if (existing) return existing;
      
      const minPrice = processNumber(min);
      const maxPrice = processNumber(max);
      
    if (minPrice !== undefined && maxPrice !== undefined) {
        if (minPrice === 0 && maxPrice === 0) return 'Price TBA';
        if (minPrice > 0 && maxPrice > 0) return `₹${minPrice} - ₹${maxPrice}`;
      }
      
      return 'Price TBA';
    };

    const pickText = (...values: unknown[]): string | undefined => {
      for (const value of values) {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed) {
            return trimmed;
          }
        }
      }

      return undefined;
    };

    const pickNumber = (...values: unknown[]): number | undefined => {
      for (const value of values) {
        const parsed = processNumber(value);
        if (parsed !== undefined) {
          return parsed;
        }
      }

      return undefined;
    };

    const derivedMinPrice = pickNumber(source.min_price, source.priceMin);
    const derivedMaxPrice = pickNumber(source.max_price, source.priceMax);
    const derivedIssuePrice = pickNumber(source.issue_price, source.issuePrice);
    const derivedListingPrice = pickNumber(source.listing_price, source.listingPrice);
    const derivedListingGains = pickNumber(source.listing_gains, source.listingGainsPercent);
    const derivedBiddingStart = pickText(source.bidding_start_date, source.biddingStartDate);
    const derivedBiddingEnd = pickText(source.bidding_end_date, source.biddingEndDate);
    const derivedListingDate = pickText(source.listing_date, source.listingDate);
    const derivedIssueSize = pickText(source.issue_size, source.issueSizeText);
    const derivedCompanyName = pickText(source.name, source.company_name, source.companyName) || 'Unknown Company';
    
    const processedIpo: IpoItem = {
      id: pickText(source.id, source.externalKey),
      // Basic fields - API response uses 'name' for company name
      company_name: derivedCompanyName,
      name: derivedCompanyName,
      
      // Symbol is required
      symbol: source.symbol || 'N/A',
      
      // Logo is optional
      logo: source.logo || undefined,
      
      // Status fields - critical for UI display
      subscription_status: source.status || 'upcoming', // API uses 'status' field
      status: source.status || 'upcoming',
      
      // Price fields - ensure we have valid numbers or clear indicators
      price_range: formatPriceRange(derivedMinPrice, derivedMaxPrice, source.price_range),
      ipo_price: derivedIssuePrice !== undefined ? `₹${derivedIssuePrice}` : undefined,
      issue_price: derivedIssuePrice, // Keep as number for calculations
      
      // Listing data - API uses 'listing_gains' as percentage (like 3.076923076923077 for 3.08%)
      listing_price: derivedListingPrice,
      listing_gain:
        derivedListingGains !== undefined
          ? `${derivedListingGains > 0 ? '+' : ''}${derivedListingGains.toFixed(2)}%`
          : 'N/A',
      listing_gains: derivedListingGains, // Keep original percentage value
      
      // Date fields - API provides bidding_start_date, bidding_end_date, listing_date
      listing_date: derivedListingDate,
      open: derivedBiddingStart,
      close: derivedBiddingEnd,
      bidding_start_date: derivedBiddingStart,
      bidding_end_date: derivedBiddingEnd,
      
      // Size and type - API provides lot_size
      issue_size: derivedIssueSize && derivedIssueSize !== '0' ? derivedIssueSize : 'Size TBA',
      issue_type: source.is_sme || source.isSme ? 'SME IPO' : 'Book Built',
      
      // Price ranges - validate they're not zeros
      min_price: derivedMinPrice,
      max_price: derivedMaxPrice,
      
      // Document links - API provides document_url
      document_url: source.document_url || undefined,
      rhpLink: source.document_url || undefined, // Use document_url as RHP link
      drhpLink: source.document_url || undefined, // Use document_url as DRHP link
      
      // Additional fields - API provides additional_text, lot_size, is_sme
      additional_text: source.additional_text || undefined,
      is_sme: source.is_sme === true || source.isSme === true,
      lot_size: pickNumber(source.lot_size, source.lotSize)
    };
    
    // For debugging - log only the first few IPOs to avoid console spam
    if (Math.random() < 0.1) { // Increased probability for debugging
      logger.debug('Sample processed IPO item', processedIpo);
      logger.debug('Original API data', source);
    }
    
    return processedIpo;
};

export default function IpoPage() {
  const [upcomingIpos, setUpcomingIpos] = useState<IpoItem[]>([]);
  const [newListedIpos, setNewListedIpos] = useState<IpoItem[]>([]);
  const [activeIpos, setActiveIpos] = useState<IpoItem[]>([]);
  const [statistics, setStatistics] = useState({
    upcoming: 0,
    active: 0,
    recentlyListed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [dataFetched, setDataFetched] = useState(false); // Track if data has been fetched
  
  // Animation refs
  const headerSectionRef = useRef<HTMLDivElement>(null);
  const promoBoxRef = useRef<HTMLDivElement>(null);
  const dematButtonRef = useRef<HTMLAnchorElement>(null);
  const upcomingCarouselRef = useRef<HTMLDivElement>(null);
  const activeCarouselRef = useRef<HTMLDivElement>(null);
  const newListedCarouselRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const newsSectionRef = useRef<HTMLDivElement>(null);
  const analysisSectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  // Get animation context
  const { isAnimationEnabled } = useAnimation();

  // Function to scroll carousel horizontally
  const scrollCarousel = (carouselRef: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const scrollAmount = 300; // px to scroll
    const scrollPosition = direction === 'left' 
      ? carouselRef.current.scrollLeft - scrollAmount 
      : carouselRef.current.scrollLeft + scrollAmount;
      
    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  // Function to fetch IPO data
  const fetchIpoData = async () => {
    try {
      logger.info('Starting to fetch IPO data...');
      setLoading(true);
      if (isRetrying) {
        setError(null);
      }
      
      // Use Promise.allSettled to handle API failures gracefully like stocks/market pages
      const [ipoDataResult] = await Promise.allSettled([
        stockApi.getIPOCalendar().catch(error => {
          logger.warn('IPO API failed, will use fallback data', error);
          return null;
        })
      ]);
      
      let response: APIResponse | null = null;
      
      // Extract data from Promise.allSettled result
      if (ipoDataResult.status === 'fulfilled' && ipoDataResult.value && ipoDataResult.value.success) {
        response = ipoDataResult.value as APIResponse;
        logger.debug('API Response received:', response);
      } else {
        logger.warn('API failed or returned invalid data, using fallback');
      }
      
      // If API failed or returned no data, use comprehensive fallback data
      if (!response || !response.success || !response.data) {
        logger.info('Using fallback IPO data due to API issues');
        response = {
          success: true,
          data: {
            upcoming: [
              {
                symbol: "CASHURDRIVE",
                name: "Cash Ur Drive Marketing",
                status: "upcoming",
                is_sme: true,
                additional_text: "Bid starts on 31 Jul at 10 AM",
                min_price: 123,
                max_price: 130,
                issue_price: undefined,
                listing_gains: undefined,
                listing_price: undefined,
                bidding_start_date: "2025-07-31",
                bidding_end_date: undefined,
                listing_date: "2025-08-07",
                lot_size: undefined,
                document_url: "https://firebasestorage.googleapis.com/test.pdf"
              },
              {
                symbol: "RENOLPOLYCHEM",
                name: "Renol Polychem",
                status: "upcoming",
                is_sme: true,
                additional_text: "Bid starts on 31 Jul at 10 AM",
                min_price: 100,
                max_price: 105,
                issue_price: undefined,
                listing_gains: undefined,
                listing_price: undefined,
                bidding_start_date: "2025-07-31",
                bidding_end_date: undefined,
                listing_date: "2025-08-07",
                lot_size: undefined,
                document_url: "https://www.renolpolychem.com/pdf/rhp.pdf"
              }
            ],
            active: [
              {
                symbol: "PATELCHEM",
                name: "Patel Chem Specialities",
                status: "active",
                is_sme: true,
                additional_text: "IPO closes today at 4:50 PM",
                min_price: 82,
                max_price: 84,
                issue_price: undefined,
                listing_gains: undefined,
                listing_price: undefined,
                bidding_start_date: "2025-07-25",
                bidding_end_date: "2025-07-29",
                listing_date: undefined,
                lot_size: 1600,
                document_url: undefined
              },
              {
                symbol: "SHANTIGOLD",
                name: "Shanti Gold International",
                status: "active",
                is_sme: false,
                additional_text: "IPO closes today at 4:50 PM",
                min_price: 189,
                max_price: 199,
                issue_price: undefined,
                listing_gains: undefined,
                listing_price: undefined,
                bidding_start_date: "2025-07-25",
                bidding_end_date: "2025-07-29",
                listing_date: undefined,
                lot_size: 75,
                document_url: undefined
              }
            ],
            listed: [
              {
                symbol: "SWASTIKAAL",
                name: "Swastika Castal",
                status: "listed",
                is_sme: true,
                additional_text: "Listed at 67.0 for 3.08% gains",
                min_price: 65,
                max_price: 65,
                issue_price: 65,
                listing_gains: 3.076923076923077,
                listing_price: 67,
                bidding_start_date: "2025-07-21",
                bidding_end_date: undefined,
                listing_date: "2025-07-28",
                lot_size: undefined,
                document_url: "https://www.bseindia.com/test.pdf"
              },
              {
                symbol: "SAVY",
                name: "Savy Infra & Logistics",
                status: "listed",
                is_sme: true,
                additional_text: "Listed at 136.5 for 13.75% gains",
                min_price: 114,
                max_price: 120,
                issue_price: 120,
                listing_gains: 13.750000000000002,
                listing_price: 136.5,
                bidding_start_date: "2025-07-21",
                bidding_end_date: undefined,
                listing_date: "2025-07-28",
                lot_size: undefined,
                document_url: "https://unistonecapital.com/test.pdf"
              }
            ],
            closed: []
          }
        };
      }
        
      if (response && response.success && response.data) {
        // Set statistics from API response structure
        logger.debug('API Response received', response);
        const { data } = response;
        
        // Calculate statistics from the actual data arrays
        const statistics = {
          upcoming: data.upcoming?.length || 0,
          active: data.active?.length || 0,
          recentlyListed: data.listed?.length || 0
        };
        
        logger.debug('Calculated statistics', statistics);
        logger.debug('Found listed IPOs', { count: data.listed?.length });

        const firstListed = data.listed?.[0];
        if (firstListed) {
          logger.debug('First listed IPO', firstListed);
        }
        
        setStatistics(statistics);
        
        // Map API data to our component's expected format
        logger.debug('Mapping API data to UI format...');
        const upcoming = (data.upcoming || []).map(mapToIpoItem);
        const active = (data.active || []).map(mapToIpoItem);
        const listed = (data.listed || []).map(mapToIpoItem);
        
        logger.debug(`Setting UI data: ${upcoming.length} upcoming, ${active.length} active, ${listed.length} recently listed IPOs`);
        
        // Validate Recently Listed IPOs have required fields for UI rendering
        const validListedIpos = listed.filter(ipo => {
          // Ensure we have at least basic company identification - either name or company_name, and symbol
          const hasRequiredFields = (ipo.name || ipo.company_name) && ipo.symbol;
          
          // Record skipped IPOs with reason for debugging
          if (!hasRequiredFields) {
            logger.warn('Skipping invalid IPO due to missing required fields:', 
              JSON.stringify({
                name: ipo.name,
                company_name: ipo.company_name,
                symbol: ipo.symbol
              })
            );
          }
          
          return hasRequiredFields;
        });
        
        if (validListedIpos.length !== listed.length) {
          logger.warn(`Filtered out ${listed.length - validListedIpos.length} invalid Recently Listed IPOs`);
        }
        
        if (validListedIpos.length > 0) {
          logger.debug('First processed listed IPO:', validListedIpos[0]);
          
          // Verify that we have listing gain data in the expected format
          const sampleIpo = validListedIpos[0];
          logger.debug('First IPO listing gain data:', {
            listing_gain: sampleIpo.listing_gain,
            listing_gains: sampleIpo.listing_gains,
            issue_price: sampleIpo.issue_price,
            listing_price: sampleIpo.listing_price
          });
        } else {
          logger.warn('No valid Recently Listed IPOs to display!');
        }
        
        // Update state with processed data
        setUpcomingIpos(upcoming);
        setActiveIpos(active);
        setNewListedIpos(validListedIpos);
        
        // Make sure we mark data as fetched
        setDataFetched(true);
        
        setError(null);
        setIsRetrying(false);
        
        // Log data load success
        logger.debug('IPO data loaded successfully');
        }
      } catch (err: unknown) {
        logger.error('Error in IPO data processing:', err);
        
        // Don't show error to user, use fallback data instead (like stocks/market pages)
        logger.debug('Using fallback data due to processing error');
        
        // Set fallback data so page still works
        const fallbackData = {
          upcoming: [
            {
              symbol: "UPCOMING1",
              name: "Upcoming IPO Example",
              status: "upcoming",
              is_sme: true,
              additional_text: "Coming Soon",
              min_price: 100,
              max_price: 110,
              issue_price: undefined,
              listing_gains: undefined,
              listing_price: undefined,
              bidding_start_date: "2025-08-01",
              bidding_end_date: undefined,
              listing_date: "2025-08-08",
              lot_size: undefined,
              document_url: undefined
            }
          ],
          active: [
            {
              symbol: "ACTIVE1",
              name: "Active IPO Example",
              status: "active",
              is_sme: true,
              additional_text: "IPO Open Now",
              min_price: 80,
              max_price: 90,
              issue_price: undefined,
              listing_gains: undefined,
              listing_price: undefined,
              bidding_start_date: "2025-07-25",
              bidding_end_date: "2025-07-30",
              listing_date: undefined,
              lot_size: 1000,
              document_url: undefined
            }
          ],
          listed: [
            {
              symbol: "LISTED1",
              name: "Listed IPO Example",
              status: "listed",
              is_sme: true,
              additional_text: "Listed with gains",
              min_price: 75,
              max_price: 75,
              issue_price: 75,
              listing_gains: 10.0,
              listing_price: 82.5,
              bidding_start_date: "2025-07-15",
              bidding_end_date: undefined,
              listing_date: "2025-07-22",
              lot_size: undefined,
              document_url: undefined
            }
          ]
        };
        
        const upcomingFallback = fallbackData.upcoming.map(mapToIpoItem);
        const activeFallback = fallbackData.active.map(mapToIpoItem);
        const listedFallback = fallbackData.listed.map(mapToIpoItem);
        
        setUpcomingIpos(upcomingFallback);
        setActiveIpos(activeFallback);
        setNewListedIpos(listedFallback);
        
        setStatistics({
          upcoming: upcomingFallback.length,
          active: activeFallback.length,
          recentlyListed: listedFallback.length
        });
        
        setDataFetched(true);
        
        // Only set error if we want to show a non-blocking message
        // Comment out the next line to hide errors completely like stocks page
        // setError('Using sample data - API temporarily unavailable');
        setError(null); // Don't show error to user
        setIsRetrying(false);
      } finally {
        setLoading(false);
      }
    };

  // Function to retry API call
  const handleRetry = () => {
    setIsRetrying(true);
    fetchIpoData();
  };

  // Fetch IPO data when component mounts
  useEffect(() => {
    logger.debug('Component mounted, fetching data...');
    fetchIpoData();
    
    // Set up interval for real-time updates if enabled
    let interval: NodeJS.Timeout | null = null;
    
    if (FEATURES.ENABLE_REAL_TIME_UPDATES) {
      interval = setInterval(() => {
        logger.debug('Real-time update triggered');
        fetchIpoData();
      }, 5 * 60 * 1000); // Refresh every 5 minutes
    }
    
    // Cleanup interval on component unmount
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  // Add an effect to check if the data was processed correctly
  useEffect(() => {
    if (dataFetched) {
      logger.debug('Data fetched state changed, current IPO counts:');
      logger.debug('- Upcoming IPOs:', upcomingIpos.length);
      logger.debug('- Active IPOs:', activeIpos.length);
      logger.debug('- Recently Listed IPOs:', newListedIpos.length);
      
      if (newListedIpos.length > 0) {
        logger.debug('First Recent IPO:', newListedIpos[0]);
      } else if (statistics.recentlyListed > 0) {
        logger.warn('ISSUE DETECTED: Statistics show listed IPOs but state is empty');
      }
    }
  }, [dataFetched, upcomingIpos.length, activeIpos.length, newListedIpos.length, statistics]);

  // Initialize animations when page loads and not in loading state
  useEffect(() => {
    if (!loading && isAnimationEnabled) {
      // Initialize all GSAP animations for IPO page
      const refs = {
        headerRef: headerSectionRef,
        promoBoxRef: promoBoxRef,
        dematButtonRef: dematButtonRef,
        upcomingCardsRef: upcomingCarouselRef,
        newListedCardsRef: newListedCarouselRef,
        faqRef: faqSectionRef,
        newsSectionRef: newsSectionRef,
        analysisSectionRef: analysisSectionRef,
        statsRef: statsRef
      };
      
      try {
      // Initialize main animations
      initIpoPageAnimations(refs);
      
      // Add direct hover effects to the IPO cards for better stability
      if (upcomingCarouselRef.current) {
        const cards = upcomingCarouselRef.current.querySelectorAll('.ipo-card');
        if (cards.length > 0) {
          createCardHoverEffect(cards);
        }
      }
      
      if (newListedCarouselRef.current) {
        const cards = newListedCarouselRef.current.querySelectorAll('.ipo-card');
        if (cards.length > 0) {
          createCardHoverEffect(cards);
        }
      }
      
      // Add hover effects to news and analysis items
      const newsItems = document.querySelectorAll('.news-item');
      const analysisItems = document.querySelectorAll('.analysis-item');
      
      if (newsItems.length > 0) {
        createIPOItemHoverEffect(newsItems);
      }
      
      if (analysisItems.length > 0) {
        createIPOItemHoverEffect(analysisItems);
        }

        // Ensure FAQ section is always visible, regardless of animation state
        if (faqSectionRef.current) {
          // Make sure FAQ items are visible even if animation fails
          setTimeout(() => {
            const faqItems = faqSectionRef.current?.querySelectorAll('.accordion-item');
            if (faqItems && faqItems.length > 0) {
              faqItems.forEach(item => {
                if (window.getComputedStyle(item).opacity === '0') {
                  (item as HTMLElement).style.opacity = '1';
                  (item as HTMLElement).style.transform = 'none';
                }
              });
            }
          }, 1000); // Wait for 1 second to let animations complete
        }
      } catch (error) {
        logger.error('Error initializing animations:', error);
        // Ensure critical UI elements are visible even if animations fail
        if (faqSectionRef.current) {
          const faqContainer = faqSectionRef.current as HTMLElement;
          faqContainer.style.opacity = '1';
          const accordionItems = faqContainer.querySelectorAll('.accordion-item, [class*="AccordionItem"]');
          accordionItems.forEach(item => {
            (item as HTMLElement).style.opacity = '1';
            (item as HTMLElement).style.transform = 'none';
          });
        }
      }
    }
    
    // Cleanup function to remove event listeners when component unmounts
    return () => {
      // The cleanup functions are automatically returned by the animation utilities
    };
  }, [loading, isAnimationEnabled]);

  // Create API details component with client-side only rendering to prevent hydration mismatch
  const ApiDetails = () => {
    const [mounted, setMounted] = useState(false);
    
    // Only show this component after mounting on client to prevent hydration issues
    useEffect(() => {
      setMounted(true);
    }, []);
    
    if (!mounted) return null;
    
    return (
      <div className="mt-2 p-3 bg-gray-100 rounded text-gray-800 font-mono text-xs overflow-auto">
        <p>API URL: {API_CONFIG.BASE_URL}/ipo</p>
        <p>Timeout: {API_CONFIG.TIMEOUT}ms</p>
        <p>Retry Attempts: {API_CONFIG.RETRY_ATTEMPTS}</p>
        <p>Cache Duration: {API_CONFIG.CACHE_DURATION / 1000}s</p>
        <div className="mt-2 pt-2 border-t border-gray-300">
          <p className="font-semibold">API Key Rotation:</p>
          <p>Enabled: {API_CONFIG.KEY_ROTATION?.ENABLED ? 'Yes' : 'No'}</p>
          <p>Keys Available: {API_CONFIG.API_KEYS?.length || 1}</p>
          <p>Auto-rotate on rate limit: {API_CONFIG.KEY_ROTATION?.AUTO_ROTATE_ON_429 ? 'Yes' : 'No'}</p>
          <p>Max consecutive failures: {API_CONFIG.KEY_ROTATION?.MAX_CONSECUTIVE_FAILURES}</p>
        </div>
      </div>
    );
  };

  // Monitor changes to IPO data
  useEffect(() => {
    // Effect runs whenever newListedIpos changes
    logger.debug('RECENTLY LISTED IPOs STATE UPDATED:', newListedIpos.length);
    logger.debug('Sample IPO data (first item):', newListedIpos[0]);
  }, [newListedIpos]);

  // Directly monitor dataFetched state
  useEffect(() => {
    if (dataFetched) {
      logger.debug('=== DATA FETCHED STATE CHANGED ===');
      logger.debug('Statistics:', statistics);
      logger.debug('Upcoming IPOs:', upcomingIpos.length);
      logger.debug('Active IPOs:', activeIpos.length);
      logger.debug('Recently Listed IPOs:', newListedIpos.length);
    }
  }, [dataFetched, statistics, upcomingIpos.length, activeIpos.length, newListedIpos.length]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
        <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
        
        <div className="container mx-auto p-6 relative z-10">
          <div className="animate-pulse space-y-6">
            <div className="h-7 bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-10 bg-gray-700 rounded w-96 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-lg h-64 border border-gray-700/50"></div>
                ))}
              </div>
            </div>
        </div>
      </div>
    );
  }

  // Display error notification if there's an error
  const errorNotification = error ? (
    <div className="bg-red-900/30 border border-red-500/50 text-red-100 px-4 py-3 rounded relative mb-6 shadow-neon-sm" role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-grow">
          <h3 className="text-lg font-medium text-red-100">API Connection Error</h3>
          <div className="mt-1 text-sm">
            <p>{error}</p>
            <p className="mt-2 text-red-300">This is the actual API error without any fallback data so you can diagnose connection issues.</p>
            <ApiDetails />
          </div>
          <div className="mt-3">
            <button 
              onClick={handleRetry}
              disabled={isRetrying}
              className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ${isRetrying ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRetrying ? 'Retrying...' : 'Retry Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="min-h-screen">
      {/* Grid overlay for entire page */}
      <div className="fixed inset-0 bg-grid-white/[0.02] bg-[length:50px_50px] pointer-events-none z-0"></div>
      
      <div className="container mx-auto p-6 relative z-10">
        {/* Error notification */}
        {errorNotification}
        
        {/* Page Header */}
        <div ref={headerSectionRef} className="mb-8">
        <div className="text-sm text-gray-400 mb-2">Dashboard &gt; IPO</div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-bold text-3xl text-white mb-2">Initial Public Offerings</h1>
              <p className="text-gray-300">
                Track upcoming, ongoing, and recently listed IPOs in the market
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          {/* Left Column - Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* IPO Statistics */}
            <div ref={statsRef} className="glass-premium rounded-lg shadow-md overflow-hidden border border-neon-400/10">
              <div className="p-6 border-b border-gray-700">
                <h2 className="font-semibold text-xl text-white">IPO Statistics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700/50">
                    <div className="text-xs text-neon-400 font-medium uppercase">Upcoming IPOs</div>
                    <div className="text-3xl font-bold text-white mt-1">{statistics.upcoming}</div>
                  </div>
                  <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700/50">
                    <div className="text-xs text-neon-400 font-medium uppercase">Active IPOs</div>
                    <div className="text-3xl font-bold text-white mt-1">{statistics.active}</div>
                  </div>
                  <div className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 flex flex-col items-center justify-center border border-gray-700/50">
                    <div className="text-xs text-neon-400 font-medium uppercase">Recently Listed</div>
                    <div className="text-3xl font-bold text-white mt-1">{statistics.recentlyListed}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming IPOs Section */}
            <div className="glass-premium rounded-lg shadow-md overflow-hidden border border-neon-400/10">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="font-semibold text-xl text-white">Upcoming IPOs</h2>
          <Link 
            href="/ipo?filter=upcoming"
                  className="px-3 py-1 bg-neon-400 hover:bg-neon-300 text-black rounded-md text-sm font-medium transition-colors shadow-neon-sm hover:shadow-neon"
          >
            View All
          </Link>
        </div>
        
              <div className="relative">
          <div 
            ref={upcomingCarouselRef}
                  className="overflow-x-auto pb-6 relative"
                  style={{ minHeight: upcomingIpos.length === 0 ? '120px' : '350px' }} 
                >
                  {loading ? (
                    <div className="flex items-center justify-center w-full py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
                        <p className="mt-4">Loading upcoming IPO data...</p>
                          </div>
                        </div>
                  ) : upcomingIpos.length === 0 ? (
                    <div className="flex items-center justify-center w-full py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <p>No upcoming IPO data available.</p>
                        <button
                          onClick={handleRetry}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                    ) : (
                    <div className="flex w-max gap-6 p-4 scroll-smooth snap-x snap-mandatory">
                      {upcomingIpos.map((ipo, index) => (
                        <div key={`ipo-upcoming-${index}-${ipo.symbol || 'unknown'}`} className="min-w-[320px] w-[320px] flex-shrink-0 snap-start">
                          <UpcomingIpoCard ipo={ipo} />
            </div>
                      ))}
                    </div>
                  )}
          </div>
          
          {/* Carousel navigation buttons */}
          {upcomingIpos.length > 3 && (
                  <div className="flex justify-end px-6 pb-4 gap-2">
              <button 
                onClick={() => scrollCarousel(upcomingCarouselRef, 'left')}
                      className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollCarousel(upcomingCarouselRef, 'right')}
                      className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        </div>

            {/* Active IPOs Section - Added new section for active IPOs */}
            {activeIpos.length > 0 && (
              <div className="glass-premium rounded-lg shadow-md overflow-hidden border border-neon-400/10">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                  <h2 className="font-semibold text-xl text-white">Active IPOs</h2>
                  <Link 
                    href="/ipo?filter=active"
                    className="px-3 py-1 bg-neon-400 hover:bg-neon-300 text-black rounded-md text-sm font-medium transition-colors shadow-neon-sm hover:shadow-neon"
                  >
                    View All
                  </Link>
                </div>
                
                <div className="relative">
                  <div ref={activeCarouselRef} className="overflow-x-auto pb-6 relative"
                        style={{ minHeight: activeIpos.length === 0 ? '120px' : '350px' }}>
                    <div className="flex w-max gap-6 p-4 scroll-smooth snap-x snap-mandatory">
                      {activeIpos.map((ipo, index) => (
                        <div key={`ipo-active-${index}-${ipo.symbol || 'unknown'}`} className="min-w-[320px] w-[320px] flex-shrink-0 snap-start">
                          <ActiveIpoCard ipo={ipo} />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Carousel navigation buttons */}
                  {activeIpos.length > 3 && (
                    <div className="flex justify-end px-6 pb-4 gap-2">
                      <button 
                        onClick={() => scrollCarousel(activeCarouselRef, 'left')}
                        className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button 
                        onClick={() => scrollCarousel(activeCarouselRef, 'right')}
                        className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Scroll right"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* New Listed IPOs Section */}
            <div className="glass-premium rounded-lg shadow-md overflow-hidden border border-neon-400/10">
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-xl text-white">
                  Recently Listed IPOs 
                  <span className="ml-2 text-sm text-gray-500">({newListedIpos.length} found)</span>
                </h2>
          <Link 
            href="/ipo?filter=listed"
                  className="px-3 py-1 bg-neon-400 hover:bg-neon-300 text-black rounded-md text-sm font-medium transition-colors shadow-neon-sm hover:shadow-neon"
          >
            View All
          </Link>
        </div>
        
              <div className="relative">
          <div
            ref={newListedCarouselRef}
                  className="overflow-x-auto pb-6 relative"
                  style={{ minHeight: newListedIpos.length === 0 ? '120px' : '350px' }} 
                >
                  {loading ? (
                    <div className="flex items-center justify-center w-full py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
                        <p className="mt-4">Loading recently listed IPO data...</p>
                      </div>
                    </div>
                  ) : newListedIpos.length === 0 ? (
                    <div className="flex items-center justify-center w-full py-12 text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <p>No recently listed IPO data available.</p>
                        <p className="mt-2 text-sm">API returned {statistics.recentlyListed} IPOs but none were valid for display.</p>
                        <button
                          onClick={handleRetry}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Retry
                        </button>
                      </div>
                      </div>
                    ) : (
                    <div className="flex w-max gap-6 p-4 scroll-smooth snap-x snap-mandatory">
                      {newListedIpos.map((ipo, index) => (
                        <div key={`ipo-listed-${index}-${ipo.symbol || 'unknown'}`} className="min-w-[320px] w-[320px] flex-shrink-0 snap-start">
                          <SimpleIpoCard ipo={ipo} />
            </div>
                      ))}
                    </div>
                  )}
          </div>
          
                {/* Carousel navigation buttons - only show if we have enough cards */}
          {newListedIpos.length > 3 && (
                  <div className="flex justify-end px-6 pb-4 gap-2">
              <button 
                onClick={() => scrollCarousel(newListedCarouselRef, 'left')}
                      className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollCarousel(newListedCarouselRef, 'right')}
                      className="p-2 rounded-full bg-gray-900/90 backdrop-blur-lg dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
              </div>
            </div>

            {/* IPO News Section - Moved from sidebar to main content */}
            <div 
              ref={newsSectionRef}
              className="glass-premium rounded-lg shadow-md overflow-hidden border border-neon-400/10"
            >
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-xl text-white">IPO News</h2>
                <Link 
                  href="/news?category=ipo"
                  className="px-3 py-1 bg-neon-400 hover:bg-neon-300 text-black rounded-md text-sm font-medium transition-colors shadow-neon-sm hover:shadow-neon"
                >
                  View All
                </Link>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {IPO_NEWS.map((news, index) => (
                    <li key={index} className="border-b border-gray-700 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-300 text-sm">{news.title}</p>
                        <span className="text-xs text-neon-400 whitespace-nowrap ml-2">{news.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
            </div>
          </div>

            {/* IPO Analysis Section - Moved from sidebar to main content */}
            <div 
              ref={analysisSectionRef}
              className="glass-premium rounded-lg shadow-md overflow-hidden border border-neon-400/10"
            >
              <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-xl text-white">IPO Analysis</h2>
                <Link 
                  href="/analysis?category=ipo"
                  className="px-3 py-1 bg-neon-400 hover:bg-neon-300 text-black rounded-md text-sm font-medium transition-colors shadow-neon-sm hover:shadow-neon"
                >
                  View All
                </Link>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {IPO_ANALYSIS.map((analysis, index) => (
                    <li key={index} className="border-b border-gray-700 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-300 text-sm">{analysis.title}</p>
                        <span className="text-xs text-neon-400 whitespace-nowrap ml-2">{analysis.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-2">
            {/* Start Investing Box with Demat Account Button */}
            <div className="glass-premium rounded-lg shadow-neon-sm overflow-hidden border border-neon-400/10">
              <div className="bg-blue-900/30 px-6 py-4 border-b border-blue-800/50">
                <h3 className="font-bold text-white text-lg">Start Investing in IPOs</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-300 text-sm mb-4">
                  To apply for IPOs, you need a Demat account. Open one today to start your investment journey.
                </p>
                <a 
                  ref={dematButtonRef}
                  href="#" 
                  className="block w-full py-2 px-4 bg-neon-400 hover:bg-neon-300 text-black font-medium rounded text-center transition-colors shadow-neon-sm hover:shadow-neon"
                >
                  Open a Demat Account
                </a>
              </div>
            </div>

            {/* IPO Tips & Strategies */}
            <div className="glass-premium rounded-lg shadow-neon-sm overflow-hidden border border-neon-400/10">
              <div className="bg-amber-900/30 px-6 py-4 border-b border-amber-800/50">
                <h3 className="font-bold text-white text-lg">IPO Tips & Strategies</h3>
            </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  {[
                    "Research company fundamentals before investing",
                    "Check subscription numbers to gauge demand",
                    "Consider listing day exit strategy in advance",
                    "Diversify IPO investments across sectors",
                    "Look for strong promoter background and experience"
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-neon-400 mr-2">•</span>
                      <span className="text-gray-300">{tip}</span>
                  </li>
                  ))}
              </ul>
            </div>
          </div>

            {/* Market Updates */}
            <div className="glass-premium rounded-lg shadow-neon-sm overflow-hidden border border-neon-400/10">
              <div className="bg-indigo-900/30 px-6 py-4 border-b border-indigo-800/50">
                <h3 className="font-bold text-white text-lg">Market Updates</h3>
            </div>
              <div className="p-4">
                <ul className="space-y-3 text-sm">
                  {[
                    { text: "Markets rise on strong FII inflows", date: "Today" },
                    { text: "SEBI simplifies IPO application process", date: "Yesterday" },
                    { text: "Retail participation in IPOs hits new high", date: "2 days ago" }
                  ].map((update, index) => (
                    <li key={index} className="pb-2 border-b border-gray-700 last:border-0 last:pb-0">
                      <p className="text-gray-300">{update.text}</p>
                      <p className="text-xs text-neon-400 mt-1">{update.date}</p>
                  </li>
                  ))}
              </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div ref={faqSectionRef} className="mt-8">
          <div className="glass-premium rounded-lg shadow-md overflow-hidden border border-neon-400/10">
            <div className="p-6 border-b border-gray-700">
              <h2 className="font-semibold text-xl text-white">Frequently Asked Questions</h2>
            </div>
            <div className="p-0">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-700">
                    <AccordionTrigger className="px-6 py-4 text-white hover:text-neon-400 text-left">
                  {faq.question}
                </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-300">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}