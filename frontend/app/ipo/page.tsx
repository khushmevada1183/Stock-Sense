'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { stockService } from '@/services/api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiHelpers } from '../../utils/api';
import { IpoItem, UpcomingIpo, ListedIpo } from '../../types/ipo';
import { useAnimation } from '../../animations/shared/AnimationContext';
import { initIpoPageAnimations } from '../../animations/pages/ipoAnimations';
import { createCardHoverEffect, createIPOItemHoverEffect } from '../../animations/shared/AnimationUtils';
import { gsap } from 'gsap';

// Mock data for the IPO page - will be replaced with real API data in production
const MOCK_UPCOMING_IPOS = [
  {
    company_name: "Go Airlines (India) Ltd.",
    logo: "https://ext.same-assets.com/1188256355/478000983.jpeg",
    price_range: "Not Issued",
    open: "Not Issued",
    close: "Not Issued",
    issue_size: "₹3,600 Cr.",
    issue_type: "Book Built",
    listing_date: "Not Issued",
    subscription_status: "Upcoming",
    symbol: "GOAIR",
    rhpLink: "https://ext.same-assets.com/1188256355/4187067686.svg",
    drhpLink: "https://www.bseindia.com/corporates/download/302584/Go%20Airlines%20(India)%20Limited-Draft%20Red%20Herring%20Prospectus_20210514115653.pdf"
  },
  {
    company_name: "Belrise Industries Ltd.",
    logo: "https://ext.same-assets.com/1188256355/3608980834.jpeg",
    price_range: "Not Issued",
    open: "Not Issued",
    close: "Not Issued",
    issue_size: "₹2,150 Cr.",
    issue_type: "Book Built",
    listing_date: "Not Issued",
    subscription_status: "Upcoming",
    symbol: "BELRISE",
    rhpLink: "https://ext.same-assets.com/1188256355/749195229.svg",
    drhpLink: "https://www.sebi.gov.in/filings/public-issues/nov-2024/belrise-industries-limited_88690.html"
  },
  {
    company_name: "Penna Cement Industries Ltd.",
    logo: "https://ext.same-assets.com/1188256355/3270286238.jpeg",
    price_range: "Not Issued",
    open: "Not Issued",
    close: "Not Issued",
    issue_size: "₹1,550 Cr.",
    issue_type: "Book Built",
    listing_date: "Not Issued",
    subscription_status: "Upcoming",
    symbol: "PENNA",
    rhpLink: "https://ext.same-assets.com/1188256355/224906416.svg",
    drhpLink: "https://www.bseindia.com/corporates/download/383604/Penna%20Cement%20-%20DRHP_20210518090816.pdf"
  }
];

const MOCK_NEW_LISTED_IPOS = [
  {
    company_name: "Ather Energy Ltd.",
    logo: "https://ext.same-assets.com/1188256355/912792445.jpeg",
    ipo_price: "₹321",
    listing_price: "₹328",
    listing_gain: "2.18%",
    listing_date: "2025-05-06",
    current_price: "₹302.65",
    current_return: "-5.72%",
    symbol: "ATHER",
    subscription_status: "Listed",
    rhpLink: "https://www.axiscapital.co.in/contents/Ather%20Energy%20Limited-RHP-1745322268.pdf",
    drhpLink: "https://www.sebi.gov.in/filings/public-issues/sep-2024/ather-energy-limited_86582.html"
  },
  {
    company_name: "Quality Power Electrical Equipments Ltd.",
    logo: "https://ext.same-assets.com/1188256355/2882650442.jpeg",
    ipo_price: "₹425",
    listing_price: "₹430",
    listing_gain: "1.18%",
    listing_date: "2025-02-24",
    current_price: "₹377.65",
    current_return: "-11.14%",
    symbol: "QPOWER",
    subscription_status: "Listed",
    rhpLink: "https://www.sebi.gov.in/filings/public-issues/sep-2024/quality-power-electrical-equipments-limited_86877.html",
    drhpLink: "https://pantomath-web.s3.ap-south-1.amazonaws.com/1738934165984-QualityPowerElectricalEquipmentsLimited.pdf"
  }
];

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

  // Set up card animations when it mounts
  useEffect(() => {
    if (!isAnimationEnabled || !cardRef.current) return;

    // Create a 3D tilt effect for the card
    const card = cardRef.current;
    let bounds;

    const mouseEnter = (e) => {
      bounds = card.getBoundingClientRect();
      gsap.to(card, {
        scale: 1.03,
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const mouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        rotationX: 0,
        rotationY: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const mouseMove = (e) => {
      if (!bounds) return;
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const leftX = mouseX - bounds.x;
      const topY = mouseY - bounds.y;
      const center = {
        x: leftX - bounds.width / 2,
        y: topY - bounds.height / 2
      };
      const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
      
      gsap.to(card, {
        rotationX: -center.y / 10,
        rotationY: center.x / 10,
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
  }, [isAnimationEnabled]);

  // Determine status color based on subscription status
  const getStatusColor = () => {
    if (!ipo.subscription_status) return 'bg-gray-100 dark:bg-gray-800';
    
    const status = ipo.subscription_status.toLowerCase();
    if (status.includes('open') || status.includes('active')) {
      return 'bg-green-500 text-white';
    } else if (status.includes('upcoming') || status.includes('announced')) {
      return 'bg-blue-500 text-white';
    } else if (status.includes('closed')) {
      return 'bg-orange-500 text-white';
    } else if (status.includes('listed')) {
      return 'bg-purple-500 text-white';
    } else {
      return 'bg-gray-500 text-white';
    }
  };

  // Calculate change color for current return (listed IPOs)
  const getReturnColor = () => {
    if (!ipo.current_return) return 'text-gray-700 dark:text-gray-300';
    
    const returnValue = parseFloat(ipo.current_return.replace('%', ''));
    if (returnValue > 0) {
      return 'text-green-500 dark:text-green-400';
    } else if (returnValue < 0) {
      return 'text-red-500 dark:text-red-400';
    } else {
      return 'text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div 
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden min-w-[280px] md:min-w-[320px] flex flex-col h-full ipo-card transform transition-all duration-300 gpu-accelerated"
    >
      {/* Card Header with Logo and Status */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div ref={logoRef} className="mr-3">
            {ipo.logo ? (
              <img src={ipo.logo} alt={`${ipo.company_name} logo`} className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-700" />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 font-bold">
                {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{ipo.company_name}</h3>
            <div className="text-gray-500 dark:text-gray-400 text-xs">{ipo.symbol || 'TBA'}</div>
          </div>
        </div>
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
          {ipo.subscription_status || type}
        </div>
      </div>
      
      {/* Card Content */}
      <div ref={contentRef} className="p-4 flex-grow">
        {type === 'upcoming' ? (
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div className="col-span-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Issue Size</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.issue_size || 'TBA'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Price Range</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.price_range || 'TBA'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Issue Type</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.issue_type || 'TBA'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Open Date</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.open || 'TBA'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Close Date</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.close || 'TBA'}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Listing Date</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.listing_date || 'TBA'}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-3 gap-x-2">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">IPO Price</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.ipo_price || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Listing Price</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.listing_price || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Listing Gain</div>
              <div className="font-medium text-green-500">{ipo.listing_gain || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Listing Date</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.listing_date || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Current Price</div>
              <div className="font-medium text-gray-800 dark:text-gray-200">{ipo.current_price || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Current Return</div>
              <div className={`font-medium ${getReturnColor()}`}>{ipo.current_return || 'N/A'}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Card Footer with Links */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex justify-between items-center">
        <div className="flex space-x-3">
          {ipo.rhpLink && (
            <a 
              href={ipo.rhpLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-400 hover:underline text-sm font-medium"
            >
              RHP
            </a>
          )}
          {ipo.drhpLink && (
            <a 
              href={ipo.drhpLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 hover:underline text-sm font-medium"
            >
              DRHP
            </a>
          )}
        </div>
        <div>
          <button className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm font-medium">
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default function IpoPage() {
  const [upcomingIpos, setUpcomingIpos] = useState<IpoItem[]>([]);
  const [newListedIpos, setNewListedIpos] = useState<IpoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Animation refs
  const headerSectionRef = useRef<HTMLDivElement>(null);
  const promoBoxRef = useRef<HTMLDivElement>(null);
  const dematButtonRef = useRef<HTMLAnchorElement>(null);
  const upcomingCarouselRef = useRef<HTMLDivElement>(null);
  const newListedCarouselRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLDivElement>(null);
  const newsSectionRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const fetchIpoData = async () => {
      try {
        setLoading(true);
        
        // Fetch IPO data from our real API
        const response = await stockService.getIpoData();
        
        if (response && response.ipoData && response.ipoData.length > 0) {
          // Filter ipos by status
          const upcoming = response.ipoData.filter((ipo: any) => 
            ipo.subscription_status?.toLowerCase().includes('upcoming') || 
            ipo.subscription_status?.toLowerCase().includes('announced')
          );
          
          const listed = response.ipoData.filter((ipo: any) => 
            ipo.subscription_status?.toLowerCase().includes('listed') || 
            ipo.subscription_status?.toLowerCase().includes('completed')
          );
          
          if (upcoming.length > 0) setUpcomingIpos(upcoming);
          if (listed.length > 0) setNewListedIpos(listed);
        }
      } catch (err: any) {
        console.error('Error fetching IPO data:', err);
        // We don't set error here as we'll use the mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    fetchIpoData();
  }, []);

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
        statsRef: statsRef
      };
      
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
    }
    
    // Cleanup function to remove event listeners when component unmounts
    return () => {
      // The cleanup functions are automatically returned by the animation utilities
    };
  }, [loading, isAnimationEnabled]);

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-6">
        {/* Page Header */}
        <div ref={headerSectionRef} className="mb-8">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Dashboard &gt; IPO</div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="font-bold text-3xl text-gray-800 dark:text-gray-100 mb-2">Initial Public Offerings</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track upcoming, ongoing, and recently listed IPOs in the market
              </p>
            </div>
            <div className="flex">
              <a 
                ref={dematButtonRef}
                href="#" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium inline-block shadow-md hover:shadow-lg transition-all"
              >
                Open a Demat Account
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
          {/* Left Column - Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* IPO Statistics */}
            <div ref={statsRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">IPO Statistics</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Upcoming IPOs</div>
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{upcomingIpos.length || 0}</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">Active IPOs</div>
                    <div className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">0</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 flex flex-col items-center justify-center">
                    <div className="text-xs text-purple-600 dark:text-purple-400 font-medium uppercase">Recently Listed</div>
                    <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-1">{newListedIpos.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming IPOs Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">Upcoming IPOs</h2>
                <Link 
                  href="/ipo?filter=upcoming"
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-md text-sm font-medium"
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
                      <div className="flex items-center justify-center w-full p-6 text-gray-500 dark:text-gray-400">
                        <span>No upcoming IPO data available at this time.</span>
                      </div>
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

            {/* New Listed IPOs Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">Recently Listed IPOs</h2>
                <Link 
                  href="/ipo?filter=listed"
                  className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-md text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              
              <div className="relative">
                <div
                  ref={newListedCarouselRef}
                  className="overflow-x-auto pb-6 relative"
                >
                  <div className="flex gap-4 p-4 min-w-full">
                    {newListedIpos.length === 0 ? (
                      <div className="flex items-center justify-center w-full p-6 text-gray-500 dark:text-gray-400">
                        <span>No newly listed IPO data available at this time.</span>
                      </div>
                    ) : (
                      newListedIpos.map((ipo, index) => (
                        <IpoCard key={index} ipo={ipo} type="listed" />
                      ))
                    )}
                  </div>
                  {/* Fade effect for scrolling indication */}
                  <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none"></div>
                </div>
                
                {/* Carousel navigation buttons */}
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Apply IPO box */}
            <div 
              ref={promoBoxRef}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundSize: "200% 200%",
                backgroundPosition: "0% 0%"
              }}
            >
              {/* Background overlay with subtle animated pattern */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="text-xl font-bold mb-2">New to IPO Investing?</div>
                <p className="text-blue-100 mb-4">
                  To apply for IPOs, you need a Demat account. Open your Demat account now to start investing in IPOs.
                </p>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 rounded-md font-medium inline-block transition-colors shadow-md hover:shadow-lg transform hover:translate-y-[-2px] transition-all duration-300"
                >
                  Open Demat Account
                </a>
              </div>
            </div>

            {/* News & Analysis Section */}
            <div 
              ref={newsSectionRef}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">IPO News</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-3">
                  {IPO_NEWS.map((news, index) => (
                    <li key={index} className="news-item hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-md transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{news.title}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap ml-2">{news.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* IPO Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b border-green-100 dark:border-green-800">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">IPO Analysis</h3>
              </div>
              <div className="p-4">
                <ul className="space-y-3">
                  {IPO_ANALYSIS.map((analysis, index) => (
                    <li key={index} className="analysis-item hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-md transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-800 dark:text-gray-200 font-medium text-sm">{analysis.title}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap ml-2">{analysis.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div ref={faqSectionRef} className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">Frequently Asked Questions</h2>
            </div>
            <div className="p-0">
              <Accordion type="single" collapsible className="divide-y divide-gray-200 dark:divide-gray-700">
                {FAQS.map((faq, idx) => (
                  <AccordionItem 
                    value={`faq-${idx}`} 
                    key={idx} 
                    className="border-none"
                  >
                    <AccordionTrigger className="px-6 py-5 text-gray-800 dark:text-gray-100 font-medium text-base hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-750/50">
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