// Mock data for home page components
import { Stock } from '@/types/stocks';
import { IpoItem } from '@/types/ipo';
import { NewsItem } from '@/types/news';

// Mock Featured Stocks
export const getMockFeaturedStocks = (): Stock[] => {
  return [
    {
      id: 1,
      symbol: 'RELIANCE',
      company_name: 'Reliance Industries Ltd',
      sector_name: 'Oil & Gas',
      price_change_percentage: 2.45,
      current_price: 2815.75
    },
    {
      id: 2,
      symbol: 'HDFCBANK',
      company_name: 'HDFC Bank Ltd',
      sector_name: 'Banking',
      price_change_percentage: 1.32,
      current_price: 1672.60
    },
    {
      id: 3,
      symbol: 'INFY',
      company_name: 'Infosys Ltd',
      sector_name: 'IT',
      price_change_percentage: -0.87,
      current_price: 1458.25
    },
    {
      id: 4,
      symbol: 'TCS',
      company_name: 'Tata Consultancy Services Ltd',
      sector_name: 'IT',
      price_change_percentage: 0.54,
      current_price: 3542.80
    },
    {
      id: 5,
      symbol: 'ICICIBANK',
      company_name: 'ICICI Bank Ltd',
      sector_name: 'Banking',
      price_change_percentage: 1.75,
      current_price: 1028.45
    },
    {
      id: 6,
      symbol: 'BHARTIARTL',
      company_name: 'Bharti Airtel Ltd',
      sector_name: 'Telecom',
      price_change_percentage: 0.92,
      current_price: 952.30
    }
  ];
};

// Mock IPO Data
export const getMockIpoData = (): { ipoData: IpoItem[] } => {
  return {
    ipoData: [
      {
        company_name: 'Bajaj Housing Finance Ltd',
        symbol: 'BAJAJHFL',
        logo: null,
        issue_size: '₹7,000 Cr',
        price_range: '₹218 - ₹230',
        listing_date: '2024-05-28',
        subscription_status: 'Upcoming',
        status: 'Upcoming',
        gmp: '+₹40 (17.39%)',
        issue_type: 'Book Built',
        open: '2024-05-20',
        close: '2024-05-22',
        min_price: 218,
        max_price: 230,
        is_sme: false
      },
      {
        company_name: 'Swiggy Ltd',
        symbol: 'SWIGGY',
        logo: null,
        issue_size: '₹10,400 Cr',
        price_range: '₹350 - ₹375',
        listing_date: '2024-06-15',
        subscription_status: 'Upcoming',
        status: 'Upcoming',
        gmp: '+₹120 (32%)',
        issue_type: 'Book Built',
        open: '2024-06-05',
        close: '2024-06-07',
        min_price: 350,
        max_price: 375,
        is_sme: false
      },
      {
        company_name: 'Vishal Mega Mart Ltd',
        symbol: 'VISHAL',
        logo: null,
        issue_size: '₹5,000 Cr',
        price_range: '₹270 - ₹285',
        listing_date: '2024-06-25',
        subscription_status: 'Upcoming',
        status: 'Upcoming',
        gmp: '+₹65 (22.8%)',
        issue_type: 'Book Built',
        open: '2024-06-18',
        close: '2024-06-20',
        min_price: 270,
        max_price: 285,
        is_sme: false
      },
      {
        company_name: 'Ola Electric Mobility Ltd',
        symbol: 'OLAELEC',
        logo: null,
        issue_size: '₹5,500 Cr',
        price_range: '₹115 - ₹130',
        listing_date: '2024-07-10',
        subscription_status: 'Upcoming',
        status: 'Upcoming',
        gmp: '+₹45 (34.6%)',
        issue_type: 'Book Built',
        open: '2024-07-01',
        close: '2024-07-03',
        min_price: 115,
        max_price: 130,
        is_sme: false
      },
      {
        company_name: 'Aadhar Housing Finance Ltd',
        symbol: 'AADHARFIN',
        logo: null,
        issue_size: '₹3,000 Cr',
        price_range: '₹300 - ₹315',
        listing_date: '2024-05-30',
        subscription_status: 'Upcoming',
        status: 'Upcoming',
        gmp: '+₹75 (23.8%)',
        issue_type: 'Book Built',
        open: '2024-05-24',
        close: '2024-05-27',
        min_price: 300,
        max_price: 315,
        is_sme: false
      }
    ]
  };
};

// Mock News Data
export const getMockNewsData = (): { news: NewsItem[] } => {
  return {
    news: [
      {
        id: '1',
        title: 'RBI Keeps Repo Rate Unchanged at 6.5% for Seventh Consecutive Time',
        source: 'Economic Times',
        date: '2024-05-17T10:30:00Z',
        content: 'The Reserve Bank of India (RBI) has kept the repo rate unchanged at 6.5% for the seventh consecutive time, maintaining its focus on inflation control while supporting growth. Governor Shaktikanta Das announced the decision after the three-day monetary policy committee meeting.',
        summary: 'The Reserve Bank of India (RBI) has kept the repo rate unchanged at 6.5% for the seventh consecutive time, maintaining its focus on inflation control while supporting growth.',
        url: 'https://economictimes.indiatimes.com/markets/stocks/news/rbi-policy-mpc-keeps-repo-rate-unchanged-at-6-5-for-7th-time-in-a-row/articleshow/109861234.cms',
        imageUrl: 'https://img.etimg.com/thumb/msid-109861234,width-650,height-488,imgsize-35672,resizemode-75/rbi-policy-mpc-keeps-repo-rate-unchanged-at-6-5-for-7th-time-in-a-row.jpg',
        category: 'economy',
        author: 'ET Bureau'
      },
      {
        id: '2',
        title: 'Sensex, Nifty Hit Fresh Record Highs Led by Banking and IT Stocks',
        source: 'Mint',
        date: '2024-05-17T09:15:00Z',
        content: 'Indian benchmark indices Sensex and Nifty hit fresh record highs on Friday, led by strong gains in banking and IT stocks. The 30-share BSE Sensex crossed the 75,000 mark for the first time, while the NSE Nifty surpassed 22,800. HDFC Bank, Infosys, and TCS were among the top gainers.',
        summary: 'Indian benchmark indices Sensex and Nifty hit fresh record highs on Friday, led by strong gains in banking and IT stocks.',
        url: 'https://www.livemint.com/market/stock-market-news/stock-market-today-sensex-nifty-hit-fresh-record-highs-led-by-banking-it-stocks-11621234567890.html',
        imageUrl: 'https://images.livemint.com/img/2023/05/17/600x338/sensex_nifty_stock_market_1684293546661_1684293546896.jpg',
        category: 'markets',
        author: 'Mint Markets'
      },
      {
        id: '3',
        title: 'Reliance Industries Plans $10 Billion Investment in Green Energy Sector',
        source: 'Business Standard',
        date: '2024-05-16T14:45:00Z',
        content: 'Reliance Industries has announced plans to invest $10 billion in green energy projects over the next three years. The conglomerate aims to build four giga factories for solar panels, energy storage, green hydrogen, and fuel cells at its Jamnagar complex in Gujarat. This move aligns with India\'s goal to achieve net-zero carbon emissions by 2070.',
        summary: 'Reliance Industries has announced plans to invest $10 billion in green energy projects over the next three years, building four giga factories at its Jamnagar complex.',
        url: 'https://www.business-standard.com/companies/news/reliance-industries-plans-10-billion-investment-in-green-energy-sector-123051600789_1.html',
        imageUrl: 'https://bsmedia.business-standard.com/include/_mod/site/images/no-image-680x400.jpg',
        category: 'companies',
        author: 'BS Reporter'
      },
      {
        id: '4',
        title: 'Government Approves PLI Scheme for Semiconductor Manufacturing Worth ₹76,000 Crore',
        source: 'Financial Express',
        date: '2024-05-15T16:20:00Z',
        content: 'The Union Cabinet has approved a Production Linked Incentive (PLI) scheme worth ₹76,000 crore for semiconductor manufacturing in India. The scheme aims to position India as a global hub for electronics manufacturing and attract investments from major semiconductor companies. The government expects this initiative to create over 100,000 direct jobs in the sector.',
        summary: 'The Union Cabinet has approved a Production Linked Incentive (PLI) scheme worth ₹76,000 crore for semiconductor manufacturing in India.',
        url: 'https://www.financialexpress.com/industry/govt-approves-pli-scheme-for-semiconductor-manufacturing-worth-rs-76000-crore/2567890/',
        imageUrl: 'https://www.financialexpress.com/wp-content/uploads/2023/05/semiconductor.jpg',
        category: 'policy',
        author: 'FE Bureau'
      },
      {
        id: '5',
        title: 'Adani Group Stocks Rally After SEBI Completes Investigation',
        source: 'NDTV Profit',
        date: '2024-05-14T11:10:00Z',
        content: 'Adani Group stocks rallied up to 15% after reports suggested that the Securities and Exchange Board of India (SEBI) has completed its investigation into allegations made by Hindenburg Research. Market participants view this development as positive for the conglomerate, which has been under scrutiny since January 2023.',
        summary: 'Adani Group stocks rallied up to 15% after reports suggested that SEBI has completed its investigation into allegations made by Hindenburg Research.',
        url: 'https://www.ndtv.com/business/adani-group-stocks-rally-after-sebi-completes-investigation-report-4567890',
        imageUrl: 'https://c.ndtvimg.com/2023-05/adani-group-650_625x300.jpg',
        category: 'markets',
        author: 'NDTV Profit Team'
      },
      {
        id: '6',
        title: 'India\'s Retail Inflation Eases to 4.7% in April, Within RBI\'s Target Range',
        source: 'India Today',
        date: '2024-05-13T18:30:00Z',
        content: 'India\'s retail inflation eased to 4.7% in April, down from 5.1% in March, falling within the Reserve Bank of India\'s target range of 2-6%. The moderation was primarily due to lower food inflation, which came down to 8.2% from 8.5% in the previous month. This development may provide the central bank with more flexibility in its monetary policy decisions.',
        summary: 'India\'s retail inflation eased to 4.7% in April, down from 5.1% in March, falling within the RBI\'s target range of 2-6%.',
        url: 'https://www.indiatoday.in/business/story/india-retail-inflation-eases-to-4-7-percent-in-april-within-rbi-target-range-2489012-2023-05-13',
        imageUrl: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202305/inflation_1-sixteen_nine.jpg',
        category: 'economy',
        author: 'India Today Business'
      }
    ]
  };
}; 