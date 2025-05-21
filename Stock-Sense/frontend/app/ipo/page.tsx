/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { IpoItem, UpcomingIpo, ListedIpo } from '../../types/ipo';
import { useAnimation } from '../../animations/shared/AnimationContext';
import { initIpoPageAnimations } from '../../animations/pages/ipoAnimations';
import { createCardHoverEffect, createIPOItemHoverEffect } from '../../animations/shared/AnimationUtils';
import ipoService from '@/services/api/ipoService';
import { FEATURES, API_CONFIG } from '@/services/config';
import { gsap } from 'gsap';

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

// IPO card component
const IpoCard = ({ ipo, type = 'upcoming' }: { ipo: IpoItem, type?: 'upcoming' | 'listed' }) => {
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const contentRef = useRef(null);
  const { isAnimationEnabled } = useAnimation();

  // Normalize data fields - ensure we handle all possible field names
  const normalizedData = useMemo(() => {
    // Format listing gain as percentage with appropriate color
    let formattedListingGain = 'N/A';
    let gainValue = null;
    
    // Check for listing_gains (number) or listing_gain (string)
    if (typeof ipo.listing_gains === 'number') {
      // API returns decimal value (e.g., 0.15 for 15%)
      gainValue = ipo.listing_gains;
      formattedListingGain = `${(gainValue * 100).toFixed(2)}%`;
    } else if (ipo.listing_gain) {
      // Try to parse if it's a string that might contain a number
      const gainMatch = String(ipo.listing_gain).match(/([-+]?\d+\.?\d*)%?/);
      if (gainMatch) {
        const parsedGain = parseFloat(gainMatch[1]);
        if (!isNaN(parsedGain)) {
          // Check if the value already includes percentage conversion
          gainValue = parsedGain > -1 && parsedGain < 1 ? parsedGain : parsedGain / 100;
          formattedListingGain = `${parsedGain.toFixed(2)}%`;
        } else {
          formattedListingGain = ipo.listing_gain;
        }
      } else {
        formattedListingGain = ipo.listing_gain;
      }
    }
    
    // Determine if this is an SME IPO
    const isSME = ipo.is_sme === true;
    
    // Format listing date properly
    let formattedListingDate = ipo.listing_date || 'N/A';
    if (formattedListingDate && formattedListingDate !== 'N/A') {
      try {
        const date = new Date(formattedListingDate);
        if (!isNaN(date.getTime())) {
          formattedListingDate = date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
        }
      } catch (e) {
        // If date parsing fails, keep the original format
      }
    }

    // Check if price range is just zeros and replace with TBA
    const priceRangeText = ipo.price_range || 
      (ipo.min_price && ipo.max_price ? 
        (ipo.min_price === 0 && ipo.max_price === 0 ? 
          'Price TBA' : 
          `₹${ipo.min_price} - ₹${ipo.max_price}`) : 
        'Price TBA');
    
    // Check if issue size is valid
    const issueSizeText = ipo.issue_size && ipo.issue_size !== '0' ? ipo.issue_size : 'Size TBA';
    
    return {
      name: ipo.company_name || ipo.name || 'Unknown Company',
      symbol: ipo.symbol || 'N/A',
      status: ipo.subscription_status || ipo.status || type,
      ipoPrice: ipo.ipo_price || (ipo.issue_price ? `₹${ipo.issue_price}` : 'Price TBA'),
      listingPrice: ipo.listing_price ? `₹${ipo.listing_price}` : 'N/A',
      listingGain: formattedListingGain,
      listingGainValue: gainValue, // Store the numeric value for color styling
      minPrice: ipo.min_price ? (ipo.min_price > 0 ? `₹${ipo.min_price}` : 'TBA') : 'TBA',
      maxPrice: ipo.max_price ? (ipo.max_price > 0 ? `₹${ipo.max_price}` : 'TBA') : 'TBA',
      listingDate: formattedListingDate,
      openDate: ipo.open || ipo.bidding_start_date || 'TBA',
      closeDate: ipo.close || ipo.bidding_end_date || 'TBA',
      documentUrl: ipo.document_url || null,
      rhpLink: ipo.rhpLink || null,
      drhpLink: ipo.drhpLink || null,
      priceRange: priceRangeText,
      issueSize: issueSizeText,
      issueType: ipo.issue_type || (isSME ? 'SME IPO' : 'Book Built'),
      isSME: isSME,
      additionalText: ipo.additional_text || null,
      // Flag to detect if this IPO has minimal data
      hasMinimalData: !ipo.min_price || !ipo.max_price || (ipo.min_price === 0 && ipo.max_price === 0)
    };
  }, [ipo, type]);

  // Set up card animations when it mounts
  useEffect(() => {
    if (!isAnimationEnabled || !cardRef.current) return;

    // Create a 3D tilt effect for the card
    const card = cardRef.current;
    let bounds;

    const mouseEnter = (e) => {
      bounds = card.getBoundingClientRect();
      gsap.to(card, {
        scale: 1.02, // Reduced from 1.03 for less extreme effect
        boxShadow: '0 0 15px rgba(57, 255, 20, 0.2)', // Changed to neon green shadow
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const mouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: '0 0 5px rgba(57, 255, 20, 0.1)', // Changed to subtle neon green shadow
        rotationX: 0,
        rotationY: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const mouseMove = (e) => {
      // Skip 3D effects for cards with minimal data to prevent blur
      if (!bounds || normalizedData.hasMinimalData) return;
      
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };
      
      // Reduced rotation values to prevent blur
      gsap.to(card, {
        rotationX: -center.y / 30, // Reduced from /10
        rotationY: center.x / 30, // Reduced from /10
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    // Add event listeners
    card.addEventListener('mouseenter', mouseEnter);
    card.addEventListener('mouseleave', mouseLeave);
    card.addEventListener('mousemove', mouseMove);

    // Clean up event listeners when component unmounts
    return () => {
      card.removeEventListener('mouseenter', mouseEnter);
      card.removeEventListener('mouseleave', mouseLeave);
      card.removeEventListener('mousemove', mouseMove);
    };
  }, [isAnimationEnabled, normalizedData.hasMinimalData]);

  // Determine status color based on subscription status
  const getStatusColor = () => {
    if (!normalizedData.status) return 'bg-gray-700 text-gray-300';
    
    const status = normalizedData.status.toLowerCase();
    if (status.includes('open') || status.includes('active')) {
      return 'bg-neon-400 text-black';
    } else if (status.includes('upcoming') || status.includes('announced')) {
      return 'bg-cyan-500 text-white';
    } else if (status.includes('closed')) {
      return 'bg-amber-500 text-black';
    } else if (status.includes('listed')) {
      return 'bg-purple-500 text-white';
    } else {
      return 'bg-gray-700 text-gray-300';
    }
  };

  return (
    <div 
      ref={cardRef}
      className="glass-premium rounded-lg shadow-neon-sm overflow-hidden min-w-[280px] md:min-w-[320px] w-[320px] flex flex-col h-full ipo-card transform transition-all duration-300 gpu-accelerated relative z-10 border border-neon-400/10"
      style={{flex: '0 0 auto'}}
    >
      {/* Card Header with Logo and Status */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center">
          <div ref={logoRef} className="mr-3">
            {ipo.logo ? (
              <img src={ipo.logo} alt={`${normalizedData.name} logo`} className="w-10 h-10 object-contain rounded-lg bg-gray-700" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-lg text-neon-400 font-bold">
                {normalizedData.symbol.substring(0, 2) || normalizedData.name.substring(0, 2) || 'IP'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">{normalizedData.name}</h3>
            <div className="text-gray-400 text-xs">{normalizedData.symbol}</div>
          </div>
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
          {normalizedData.status}
          {normalizedData.isSME && <span className="ml-1 text-xs">SME</span>}
        </div>
      </div>
      
      {/* Card Content */}
      <div ref={contentRef} className="p-4 flex-grow">
        {type === 'upcoming' ? (
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div className="col-span-2">
              <div className="text-xs text-gray-400">Issue Size</div>
              <div className="text-sm font-medium text-white">{normalizedData.issueSize}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Price Range</div>
              <div className="text-sm font-medium text-white">{normalizedData.priceRange}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Issue Type</div>
              <div className="text-sm font-medium text-white">{normalizedData.issueType}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Open Date</div>
              <div className="text-sm font-medium text-white">{normalizedData.openDate}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Close Date</div>
              <div className="text-sm font-medium text-white">{normalizedData.closeDate}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div>
              <div className="text-xs text-gray-400">IPO Price</div>
              <div className="text-sm font-medium text-white">{normalizedData.ipoPrice}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Listing Price</div>
              <div className="text-sm font-medium text-white">{normalizedData.listingPrice}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Listing Gain</div>
              <div className={`text-sm font-medium ${
                normalizedData.listingGainValue > 0 
                  ? 'text-neon-400' 
                  : normalizedData.listingGainValue < 0
                    ? 'text-red-500'
                  : 'text-gray-400'
              }`}>
                {normalizedData.listingGain}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Listing Date</div>
              <div className="text-sm font-medium text-white">{normalizedData.listingDate}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-400">Issue Size</div>
              <div className="text-sm font-medium text-white">{normalizedData.issueSize}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Card Footer */}
      <div className="p-4 border-t border-gray-700 flex justify-center">
        <Link 
          href={`/ipo/${normalizedData.symbol}`}
          className="w-full text-center py-2 bg-gray-750 hover:bg-gray-700 text-white text-sm rounded-md transition-colors border border-neon-400/20 hover:border-neon-400/40 hover:shadow-neon-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

// Simple IPO card component for Recently Listed IPOs (direct API data display)
const SimpleIpoCard = ({ ipo }: { ipo: any }) => {
  // Helper function to determine color class based on gain value
  const getGainColorClass = () => {
    if (!ipo.listing_gain && !ipo.listing_gains) return "text-gray-400";
    
    let gain = 0;
    if (typeof ipo.listing_gains === 'number') {
      gain = ipo.listing_gains;
    } else if (ipo.listing_gain) {
      const gainMatch = String(ipo.listing_gain).match(/([-+]?\d+\.?\d*)%?/);
      if (gainMatch) {
        gain = parseFloat(gainMatch[1]) / 100;
      }
    }
    
    if (gain > 0) return "text-neon-400";
    if (gain < 0) return "text-red-500";
    return "text-gray-400";
  };

  // Format gain value with +/- sign and percentage
  const formatGain = () => {
    if (!ipo.listing_gain && !ipo.listing_gains) return "N/A";
    
    if (typeof ipo.listing_gains === 'number') {
      return `${ipo.listing_gains > 0 ? '+' : ''}${(ipo.listing_gains * 100).toFixed(2)}%`;
    }
    
    if (ipo.listing_gain) {
      // Check if it already has a sign
      if (ipo.listing_gain.startsWith('+') || ipo.listing_gain.startsWith('-')) {
        return ipo.listing_gain;
      }
      
      const gainMatch = String(ipo.listing_gain).match(/([-+]?\d+\.?\d*)%?/);
      if (gainMatch) {
        const value = parseFloat(gainMatch[1]);
        return `${value > 0 ? '+' : ''}${value}%`;
      }
    }
    
    return String(ipo.listing_gain || "N/A");
  };
  
  const formatPrice = (price: any) => {
    if (!price) return "N/A";
    return price.toString().startsWith('₹') ? price : `₹${price}`;
  };

  const formatDate = (dateString: any) => {
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
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="glass-premium rounded-lg shadow-neon-sm overflow-hidden border border-neon-400/10">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-white">{ipo.company_name || ipo.name}</h3>
          <div className="text-gray-400 text-sm">{ipo.symbol}</div>
          </div>
        <div className="text-xs font-medium px-2 py-1 rounded-full bg-neon-400 text-black">
          Listed
          </div>
        </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-gray-400">IPO Price</div>
            <div className="text-sm font-medium text-white">{formatPrice(ipo.ipo_price || ipo.issue_price)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Listing Price</div>
            <div className="text-sm font-medium text-white">{formatPrice(ipo.listing_price)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Listing Gain</div>
            <div className={`text-sm font-medium ${getGainColorClass()}`}>
              {formatGain()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Listing Date</div>
            <div className="text-sm font-medium text-white">{formatDate(ipo.listing_date)}</div>
            </div>
          </div>
              </div>
      <div className="p-4 border-t border-gray-700 flex justify-center">
        <Link 
          href={`/ipo/${ipo.symbol}`}
          className="w-full text-center py-2 bg-gray-750 hover:bg-gray-700 text-white text-sm rounded-md transition-colors border border-neon-400/20 hover:border-neon-400/40 hover:shadow-neon-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
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

  // Convert API response data to IpoItem format
  const mapToIpoItem = (ipo: any): IpoItem => {
    // Process and validate the IPO data to ensure it has all required fields
    // Make sure we're working with a copy to avoid modifying the original
    
    // Validate that we have at least some basic data to work with
    if (!ipo || (typeof ipo !== 'object')) {
      console.warn('Received invalid IPO data, using fallback structure');
      // Return a minimal valid structure with all required fields
      return {
        company_name: 'Data Unavailable',
        symbol: 'N/A',
        logo: null,
        subscription_status: 'upcoming',
        status: 'upcoming',
        price_range: 'Price TBA',
        issue_size: 'Size TBA',
        issue_type: 'Book Built',
        min_price: null,
        max_price: null,
        open: null,
        close: null,
        listing_date: null,
        is_sme: false,
        ipo_price: null,
        listing_price: null,
        listing_gain: 'N/A',
        listing_gains: null,
        document_url: null,
        rhpLink: null,
        drhpLink: null,
        additional_text: null
      };
    }
    
    // Helper function to format listing gain as percentage
    const formatListingGain = (gain: any): string => {
      if (gain === null || gain === undefined) return 'N/A';
      
      // If it's already a formatted string with % sign
      if (typeof gain === 'string' && gain.includes('%')) {
        return gain;
      }
      
      // If it's a decimal value (API usually returns like -0.09 for -9%)
      if (typeof gain === 'number') {
        return `${(gain * 100).toFixed(2)}%`;
      }
      
      // If it's a string number without % sign
      if (typeof gain === 'string') {
        const parsedValue = parseFloat(gain);
        if (!isNaN(parsedValue)) {
          // Check if it's already percentage or decimal
          if (parsedValue > -1 && parsedValue < 1) {
            // Decimal value (convert to percentage)
            return `${(parsedValue * 100).toFixed(2)}%`;
          } else {
            // Already percentage value
            return `${parsedValue.toFixed(2)}%`;
          }
        }
      }
      
      return String(gain);
    };
    
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
      if (existing) return existing;
      
      const minPrice = processNumber(min);
      const maxPrice = processNumber(max);
      
      if (minPrice !== null && maxPrice !== null) {
        if (minPrice === 0 && maxPrice === 0) return 'Price TBA';
        if (minPrice > 0 && maxPrice > 0) return `₹${minPrice} - ₹${maxPrice}`;
      }
      
      return 'Price TBA';
    };
    
    const processedIpo: IpoItem = {
      // Basic fields - API uses 'name' instead of 'company_name'
      company_name: ipo.company_name || ipo.name || 'Unknown Company',
      name: ipo.name || ipo.company_name, // Keep original name field
      
      // Symbol is required
      symbol: ipo.symbol || 'N/A',
      
      // Logo is optional
      logo: ipo.logo || null,
      
      // Status fields - critical for UI display
      subscription_status: ipo.subscription_status || ipo.status || 'upcoming',
      status: ipo.status || ipo.subscription_status || 'upcoming',
      
      // Price fields - ensure we have valid numbers or clear indicators
      price_range: formatPriceRange(ipo.min_price, ipo.max_price, ipo.price_range),
      ipo_price: ipo.ipo_price || (processNumber(ipo.issue_price) ? `₹${ipo.issue_price}` : undefined),
      issue_price: processNumber(ipo.issue_price), // Keep as number for calculations
      
      // Listing data - API uses 'listing_gains' as decimal (like -0.09 for -9%)
      listing_price: processNumber(ipo.listing_price),
      listing_gain: ipo.listing_gain || formatListingGain(ipo.listing_gains),
      listing_gains: ipo.listing_gains, // Keep original decimal value
      
      // Date fields - ensure we have clear indicators for missing dates
      listing_date: ipo.listing_date || null,
      open: ipo.open || ipo.bidding_start_date || null,
      close: ipo.close || ipo.bidding_end_date || null,
      bidding_start_date: ipo.bidding_start_date || ipo.open || null,
      bidding_end_date: ipo.bidding_end_date || ipo.close || null,
      
      // Size and type - validate issue size isn't empty or zero
      issue_size: ipo.issue_size && ipo.issue_size !== '0' ? ipo.issue_size : 'Size TBA',
      issue_type: ipo.issue_type || (ipo.is_sme ? 'SME IPO' : 'Book Built'),
      
      // Price ranges - validate they're not zeros
      min_price: processNumber(ipo.min_price),
      max_price: processNumber(ipo.max_price),
      
      // Document links
      document_url: ipo.document_url || null,
      rhpLink: ipo.rhpLink || null,
      drhpLink: ipo.drhpLink || null,
      
      // Additional fields
      additional_text: ipo.additional_text || null,
      is_sme: ipo.is_sme === true,
      lot_size: ipo.lot_size
    };
    
    // For debugging - log only the first few IPOs to avoid console spam
    if (Math.random() < 0.05) {
      console.log('Sample processed IPO item:', processedIpo);
    }
    
    return processedIpo;
  };

  // Function to fetch IPO data
    const fetchIpoData = async () => {
      try {
      console.log('Starting to fetch IPO data...');
        setLoading(true);
      if (isRetrying) {
        setError(null);
      }
        
      // Fetch IPO data from our API
      console.log('Calling ipoService.fetchIPOData()');
      const response = await ipoService.fetchIPOData();
        
      if (response) {
        // Set statistics
        console.log('API Response received:', response);
        console.log('Statistics:', response.statistics);
        console.log('Found recentlyListedIPOs:', response.recentlyListedIPOs?.length);
        
        if (response.recentlyListedIPOs?.length > 0) {
          console.log('First recently listed IPO:', response.recentlyListedIPOs[0]);
        }
        
        setStatistics(response.statistics);
        
        // Map API data to our component's expected format
        console.log('Mapping API data to UI format...');
        const upcoming = response.upcomingIPOs.map(mapToIpoItem);
        const active = response.activeIPOs.map(mapToIpoItem);
        const listed = response.recentlyListedIPOs.map(mapToIpoItem);
        
        console.log(`Setting UI data: ${upcoming.length} upcoming, ${active.length} active, ${listed.length} recently listed IPOs`);
        
        // Validate Recently Listed IPOs have required fields for UI rendering
        const validListedIpos = listed.filter(ipo => {
          // Ensure we have at least basic company identification - either name or company_name, and symbol
          const hasRequiredFields = (ipo.name || ipo.company_name) && ipo.symbol;
          
          // Record skipped IPOs with reason for debugging
          if (!hasRequiredFields) {
            console.warn('Skipping invalid IPO due to missing required fields:', 
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
          console.warn(`Filtered out ${listed.length - validListedIpos.length} invalid Recently Listed IPOs`);
        }
        
        if (validListedIpos.length > 0) {
          console.log('First processed listed IPO:', validListedIpos[0]);
          
          // Verify that we have listing gain data in the expected format
          const sampleIpo = validListedIpos[0];
          console.log('First IPO listing gain data:', {
            listing_gain: sampleIpo.listing_gain,
            listing_gains: sampleIpo.listing_gains,
            issue_price: sampleIpo.issue_price,
            listing_price: sampleIpo.listing_price
          });
        } else {
          console.warn('No valid Recently Listed IPOs to display!');
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
        console.log('IPO data loaded successfully');
        }
      } catch (err: any) {
        console.error('Error fetching IPO data:', err);
      setError(err.message || 'Failed to fetch IPO data');
      setIsRetrying(false);
      
      // No more fallback to mock data
      setUpcomingIpos([]);
      setActiveIpos([]);
      setNewListedIpos([]);
      setStatistics({
        upcoming: 0,
        active: 0,
        recentlyListed: 0
      });
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
    console.log('Component mounted, fetching data...');
    fetchIpoData();
    
    // Set up interval for real-time updates if enabled
    let interval: NodeJS.Timeout | null = null;
    
    if (FEATURES.ENABLE_REAL_TIME_UPDATES) {
      interval = setInterval(() => {
        console.log('Real-time update triggered');
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
      console.log('Data fetched state changed, current IPO counts:');
      console.log('- Upcoming IPOs:', upcomingIpos.length);
      console.log('- Active IPOs:', activeIpos.length);
      console.log('- Recently Listed IPOs:', newListedIpos.length);
      
      if (newListedIpos.length > 0) {
        console.log('First Recent IPO:', newListedIpos[0]);
      } else if (statistics.recentlyListed > 0) {
        console.warn('ISSUE DETECTED: Statistics show listed IPOs but state is empty');
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
        console.error('Error initializing animations:', error);
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
    console.log('RECENTLY LISTED IPOs STATE UPDATED:', newListedIpos.length);
    console.log('Sample IPO data (first item):', newListedIpos[0]);
  }, [newListedIpos]);

  // Directly monitor dataFetched state
  useEffect(() => {
    if (dataFetched) {
      console.log('=== DATA FETCHED STATE CHANGED ===');
      console.log('Statistics:', statistics);
      console.log('Upcoming IPOs:', upcomingIpos.length);
      console.log('Active IPOs:', activeIpos.length);
      console.log('Recently Listed IPOs:', newListedIpos.length);
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
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-neon-sm h-64 border border-neon-400/10"></div>
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
    <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 noise-bg min-h-screen">
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
                  <div className="bg-gray-850/50 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-neon-400 font-medium uppercase">Upcoming IPOs</div>
                    <div className="text-3xl font-bold text-white mt-1">{statistics.upcoming}</div>
                  </div>
                  <div className="bg-gray-850/50 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-neon-400 font-medium uppercase">Active IPOs</div>
                    <div className="text-3xl font-bold text-white mt-1">{statistics.active}</div>
                  </div>
                  <div className="bg-gray-850/50 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center justify-center">
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
          >
                  <div className="flex gap-4 p-4 min-w-full">
              {upcomingIpos.length === 0 ? (
                      loading ? (
                        <div className="flex items-center justify-center w-full p-6 text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent align-[-0.125em]"></div>
                            <span className="mt-4">Loading upcoming IPO data...</span>
                          </div>
                        </div>
                      ) : (
                      <div className="flex items-center justify-center w-full p-6 text-gray-500 dark:text-gray-400">
                        <span>No upcoming IPO data available at this time.</span>
                      </div>
                      )
                    ) : (
                      upcomingIpos.map((ipo, index) => (
                        <IpoCard key={index} ipo={ipo} type="upcoming" />
                ))
              )}
            </div>
            {/* Fade effect for scrolling indication */}
                  <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Carousel navigation buttons */}
          {upcomingIpos.length > 3 && (
                  <div className="flex justify-end px-6 pb-4 gap-2">
              <button 
                onClick={() => scrollCarousel(upcomingCarouselRef, 'left')}
                      className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollCarousel(upcomingCarouselRef, 'right')}
                      className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
                  <div className="overflow-x-auto pb-6 relative">
                    <div className="flex gap-4 p-4 min-w-full">
                      {activeIpos.map((ipo, index) => (
                        <IpoCard key={index} ipo={ipo} type="upcoming" />
                      ))}
                    </div>
                    {/* Fade effect for scrolling indication */}
                    <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                  </div>
                  
                  {/* Carousel navigation buttons */}
                  {activeIpos.length > 3 && (
                    <div className="flex justify-end px-6 pb-4 gap-2">
                      <button 
                        onClick={() => scrollCarousel(upcomingCarouselRef, 'left')}
                        className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button 
                        onClick={() => scrollCarousel(upcomingCarouselRef, 'right')}
                        className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
              
              {/* Direct debug info - visible in all environments */}
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 text-xs flex justify-between items-center">
                <div>
                  <span className="font-medium">IPO Data Status:</span> 
                  <span className="ml-1">{loading ? 'Loading...' : dataFetched ? 'Data loaded' : 'No data'}</span>
                  <span className="mx-2">|</span>
                  <span className="font-medium">Recently Listed IPOs:</span> 
                  <span className="ml-1">{newListedIpos.length}</span>
                  <span className="mx-2">|</span>
                  <span className="font-medium">Statistics count:</span> 
                  <span className="ml-1">{statistics.recentlyListed}</span>
                </div>
                {/* Clear cache button */}
                <button 
                  onClick={() => {
                    // Force a refresh by setting timestamp to 0
                    console.log('Forcing data refresh...');
                    handleRetry();
                  }}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  Refresh Data
                </button>
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
                    <div className="flex gap-6 p-4 overflow-x-auto scroll-smooth" style={{ width: '100%', position: 'relative' }}>
                      {/* Directly map IPO data to a simpler card component */}
                      {newListedIpos.map((ipo, index) => (
                        <div key={`ipo-${index}-${ipo.symbol || 'unknown'}`} className="min-w-[320px] w-[320px] flex-shrink-0">
                          {/* Use the main IpoCard component */}
                          <SimpleIpoCard ipo={ipo} />
            </div>
                      ))}
                    </div>
                  )}
                  
            {/* Fade effect for scrolling indication */}
                  {newListedIpos.length > 0 && (
                  <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                  )}
          </div>
          
                {/* Carousel navigation buttons - only show if we have enough cards */}
          {newListedIpos.length > 3 && (
                  <div className="flex justify-end px-6 pb-4 gap-2">
              <button 
                onClick={() => scrollCarousel(newListedCarouselRef, 'left')}
                      className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollCarousel(newListedCarouselRef, 'right')}
                      className="p-2 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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