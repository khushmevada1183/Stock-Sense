'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { stockService } from '@/services/api';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function IpoPage() {
  const [upcomingIpos, setUpcomingIpos] = useState(MOCK_UPCOMING_IPOS);
  const [newListedIpos, setNewListedIpos] = useState(MOCK_NEW_LISTED_IPOS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const upcomingCarouselRef = useRef<HTMLDivElement>(null);
  const newListedCarouselRef = useRef<HTMLDivElement>(null);

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

  // Helper function to determine status color
  function getStatusColor(status: string): string {
    status = status.toLowerCase();
    if (status.includes('open') || status.includes('active')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else if (status.includes('upcoming') || status.includes('announced')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (status.includes('closed') || status.includes('completed') || status.includes('listed')) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    } else if (status.includes('oversubscribed')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 animate-pulse">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Page Breadcrumb and Title */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Dashboard &gt; IPO</div>
        <h1 className="font-bold text-3xl text-gray-800 dark:text-gray-100 mb-2">IPO</h1>
        <div className="text-gray-600 dark:text-gray-400 mb-8">
          Following is the list of companies for IPO as of today.
        </div>

        {/* Upcoming section */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">Upcoming IPOs</h2>
          <Link 
            href="/ipo?filter=upcoming"
            className="px-4 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-3">Companies that have filed for an IPO with SEBI. Details might be disclosed later.</div>
        
        {/* Upcoming IPOs cards carousel */}
        <div className="mb-10 relative">
          <div 
            ref={upcomingCarouselRef}
            className="overflow-x-auto pb-4 relative max-w-full"
          >
            <div className="flex gap-6 px-1 py-2 min-w-full">
              {upcomingIpos.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No upcoming IPO data available at this time.</div>
              ) : (
                upcomingIpos.map((ipo, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-300 p-6 min-w-[280px] flex flex-col items-center">
                    {ipo.logo ? (
                      <img src={ipo.logo} alt={`${ipo.company_name} logo`} className="w-14 h-14 object-contain rounded-lg mb-3 bg-gray-50 dark:bg-gray-700" />
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-3">
                        {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
                      </div>
                    )}
                    <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-2 text-center">{ipo.company_name}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Issue Size: <span className="font-medium">{ipo.issue_size || 'TBA'}</span></div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Price Range: {ipo.price_range || 'TBA'}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Open: {ipo.open || 'TBA'}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Close: {ipo.close || 'TBA'}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Listing Date: {ipo.listing_date || 'TBA'}</div>
                    
                    <div className="flex mt-3 gap-4">
                      {ipo.rhpLink && (
                        <a 
                          href={ipo.rhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-yellow-500 hover:text-yellow-600 hover:underline font-medium text-sm transition-colors"
                        >
                          RHP
                        </a>
                      )}
                      {ipo.drhpLink && (
                        <a 
                          href={ipo.drhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-500 hover:text-green-600 hover:underline font-medium text-sm transition-colors"
                        >
                          DRHP
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Fade effect for scrolling indication */}
            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Carousel navigation buttons */}
          {upcomingIpos.length > 3 && (
            <div className="flex justify-end mt-3 gap-2">
              <button 
                onClick={() => scrollCarousel(upcomingCarouselRef, 'left')}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollCarousel(upcomingCarouselRef, 'right')}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Apply IPO box */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-10 max-w-4xl mx-auto text-center">
          <div className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Applying for IPOs?</div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            To apply for IPOs, you need a Demat account. Open your Demat account now to start investing in IPOs.
          </p>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium inline-block"
          >
            Open a Demat Account
          </a>
        </div>

        {/* Ongoing section */}
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 mb-2">Ongoing IPOs</h2>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Companies where the IPO investment process is started and will be listed soon on the stock market.
        </div>
        {/* Ongoing IPOs - none message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-10 text-gray-500 dark:text-gray-400 flex items-center">
          <span className="text-2xl mr-2">☁️</span>Currently, no ongoing IPO found.
        </div>

        {/* New Listed section */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">New Listed IPOs</h2>
          <Link 
            href="/ipo?filter=listed"
            className="px-4 py-1 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Companies that have been listed recently through an IPO. Find their listing gains and returns here.
        </div>
        
        {/* New Listed IPOs cards */}
        <div className="mb-10 relative">
          <div
            ref={newListedCarouselRef}
            className="overflow-x-auto pb-4 relative max-w-full"
          >
            <div className="flex gap-6 px-1 py-2 min-w-full">
              {newListedIpos.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">No newly listed IPO data available at this time.</div>
              ) : (
                newListedIpos.map((ipo, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-300 p-6 min-w-[280px] flex flex-col items-center">
                    {ipo.logo ? (
                      <img src={ipo.logo} alt={`${ipo.company_name} logo`} className="w-14 h-14 object-contain rounded-lg mb-3 bg-gray-50 dark:bg-gray-700" />
                    ) : (
                      <div className="w-14 h-14 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg mb-3">
                        {ipo.symbol?.substring(0, 2) || ipo.company_name?.substring(0, 2) || 'IP'}
                      </div>
                    )}
                    <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-2 text-center">{ipo.company_name}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">IPO Price: <span className="font-medium">{ipo.ipo_price || 'N/A'}</span></div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Listing Price: {ipo.listing_price || 'N/A'}</div>
                    <div className="text-green-500 text-sm mb-1 font-medium">Listing Gain: {ipo.listing_gain || 'N/A'}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Listing Date: {ipo.listing_date || 'N/A'}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm mb-1">Current Price: {ipo.current_price || 'N/A'}</div>
                    <div className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">Current Return: {ipo.current_return || 'N/A'}</div>
                    
                    <div className="flex mt-3 gap-4">
                      {ipo.rhpLink && (
                        <a 
                          href={ipo.rhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-yellow-500 hover:text-yellow-600 hover:underline font-medium text-sm transition-colors"
                        >
                          RHP
                        </a>
                      )}
                      {ipo.drhpLink && (
                        <a 
                          href={ipo.drhpLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-500 hover:text-green-600 hover:underline font-medium text-sm transition-colors"
                        >
                          DRHP
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Fade effect for scrolling indication */}
            <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-gray-50 dark:from-gray-900 to-transparent pointer-events-none"></div>
          </div>
          
          {/* Carousel navigation buttons */}
          {newListedIpos.length > 3 && (
            <div className="flex justify-end mt-3 gap-2">
              <button 
                onClick={() => scrollCarousel(newListedCarouselRef, 'left')}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollCarousel(newListedCarouselRef, 'right')}
                className="p-1.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* News & Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-blue-100 dark:border-blue-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">IPO News</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {IPO_NEWS.map((news, index) => (
                  <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-md transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-800 dark:text-gray-200 font-medium text-sm md:text-base">{news.title}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap ml-2">{news.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b border-green-100 dark:border-green-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">IPO Analysis</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {IPO_ANALYSIS.map((analysis, index) => (
                  <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-md transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-800 dark:text-gray-200 font-medium text-sm md:text-base">{analysis.title}</span>
                      <span className="text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap ml-2">{analysis.date}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 mb-2 mt-14">Frequently Asked Questions</h2>
        <div className="text-gray-500 dark:text-gray-400 text-sm mb-5">Find answers to common questions about IPOs.</div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-10">
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
  );
} 