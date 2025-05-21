import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowUpRight, ArrowDownRight, Clock, Newspaper, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

// Enhanced mock Indian stock market data with more realistic news
const generateMockStockData = () => {
  // Major Indian indices
  const indices = [
    { name: "NIFTY 50", code: "NIFTY" },
    { name: "SENSEX", code: "SENSEX" },
    { name: "NIFTY BANK", code: "BANKNIFTY" },
    { name: "NIFTY IT", code: "NIFTYIT" },
    { name: "NIFTY PHARMA", code: "NIFTYPHARMA" }
  ];

  // Top Indian stocks
  const stocks = [
    { name: "Reliance Industries", code: "RELIANCE" },
    { name: "Tata Consultancy Services", code: "TCS" },
    { name: "HDFC Bank", code: "HDFCBANK" },
    { name: "Infosys", code: "INFY" },
    { name: "ICICI Bank", code: "ICICIBANK" },
    { name: "Hindustan Unilever", code: "HINDUNILVR" },
    { name: "Bharti Airtel", code: "BHARTIARTL" },
    { name: "ITC", code: "ITC" },
    { name: "State Bank of India", code: "SBIN" },
    { name: "Kotak Mahindra Bank", code: "KOTAKBANK" }
  ];

  // Generate random price movement
  const getRandomChange = () => {
    return (Math.random() * 5 - 2.5).toFixed(2);
  };

  // Generate price for a stock/index
  const generatePrice = (code) => {
    let basePrice;
    
    // Set realistic base prices for major indices and stocks
    switch(code) {
      case "NIFTY": basePrice = 22500; break;
      case "SENSEX": basePrice = 74000; break;
      case "BANKNIFTY": basePrice = 48500; break;
      case "NIFTYIT": basePrice = 34000; break;
      case "NIFTYPHARMA": basePrice = 17000; break;
      case "RELIANCE": basePrice = 2900; break;
      case "TCS": basePrice = 3800; break;
      case "HDFCBANK": basePrice = 1650; break;
      case "INFY": basePrice = 1500; break;
      case "ICICIBANK": basePrice = 1050; break;
      case "HINDUNILVR": basePrice = 2580; break;
      case "BHARTIARTL": basePrice = 1170; break;
      case "ITC": basePrice = 430; break;
      case "SBIN": basePrice = 775; break;
      case "KOTAKBANK": basePrice = 1800; break;
      default: basePrice = 1000; break;
    }
    
    // Randomize the price a bit
    const randomFactor = 0.98 + Math.random() * 0.04;
    return (basePrice * randomFactor).toFixed(2);
  };

  // Generate historical data points for charts
  const generateHistoricalData = (code) => {
    const basePrice = parseFloat(generatePrice(code));
    const points = [];
    for (let i = 0; i < 15; i++) {
      const randomMovement = (Math.random() * 2 - 1) * (basePrice * 0.01);
      points.push({
        time: `${i}:00`,
        price: (basePrice + randomMovement * i).toFixed(2)
      });
    }
    return points;
  };

  // Generate index data
  const indicesData = indices.map(index => {
    const currentPrice = generatePrice(index.code);
    const change = getRandomChange();
    const percentChange = (parseFloat(change) / (parseFloat(currentPrice) - parseFloat(change)) * 100).toFixed(2);
    
    return {
      ...index,
      price: currentPrice,
      change: change,
      percentChange: percentChange,
      direction: parseFloat(change) >= 0 ? 'up' : 'down',
      historicalData: generateHistoricalData(index.code)
    };
  });

  // Generate stock data
  const stocksData = stocks.map(stock => {
    const currentPrice = generatePrice(stock.code);
    const change = getRandomChange();
    const percentChange = (parseFloat(change) / (parseFloat(currentPrice) - parseFloat(change)) * 100).toFixed(2);
    
    return {
      ...stock,
      price: currentPrice,
      change: change,
      percentChange: percentChange,
      direction: parseFloat(change) >= 0 ? 'up' : 'down',
      historicalData: generateHistoricalData(stock.code),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      dayRange: {
        low: (parseFloat(currentPrice) * 0.98).toFixed(2),
        high: (parseFloat(currentPrice) * 1.02).toFixed(2)
      },
      yearRange: {
        low: (parseFloat(currentPrice) * 0.85).toFixed(2),
        high: (parseFloat(currentPrice) * 1.15).toFixed(2)
      }
    };
  });

  // Generate sector performance
  const sectors = [
    { name: "IT", change: getRandomChange() },
    { name: "Banking", change: getRandomChange() },
    { name: "Pharma", change: getRandomChange() },
    { name: "Auto", change: getRandomChange() },
    { name: "Energy", change: getRandomChange() },
    { name: "FMCG", change: getRandomChange() },
    { name: "Metal", change: getRandomChange() }
  ];

  // Top gainers and losers
  const allStocks = [...stocksData];
  const topGainers = [...allStocks].sort((a, b) => parseFloat(b.percentChange) - parseFloat(a.percentChange)).slice(0, 5);
  const topLosers = [...allStocks].sort((a, b) => parseFloat(a.percentChange) - parseFloat(b.percentChange)).slice(0, 5);

  // Market breadth data
  const marketBreadth = {
    advancers: Math.floor(Math.random() * 1000) + 1000,
    decliners: Math.floor(Math.random() * 800) + 500,
    unchanged: Math.floor(Math.random() * 200) + 50,
  };

  // Enhanced market news with more detailed content and images
  const newsItems = [
    { 
      headline: "Sensex Surges 500 Points as IT Stocks Rally",
      content: "Indian markets closed higher on Monday, with the Sensex gaining over 500 points led by strong performance in IT and banking stocks. Infosys and TCS were among the top gainers, rising over 3% each on positive global cues and strong quarterly results expectations.",
      time: "10:45 AM", 
      source: "Economic Times",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070&auto=format&fit=crop",
      category: "Markets"
    },
    { 
      headline: "RBI Keeps Repo Rate Unchanged at 6.5%",
      content: "The Reserve Bank of India (RBI) kept the benchmark interest rate unchanged for the seventh consecutive time, maintaining its focus on inflation control. Governor Shaktikanta Das mentioned that the central bank remains vigilant about inflation risks while supporting growth.",
      time: "9:30 AM", 
      source: "Business Standard",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop",
      category: "Economy"
    },
    { 
      headline: "Reliance Industries Reports Record Quarterly Profit",
      content: "Reliance Industries Limited (RIL) reported a record quarterly profit of ₹16,203 crore, up 12.5% year-on-year, driven by strong performance in retail and digital services. The conglomerate's revenue increased by 9.3% to ₹2.2 lakh crore during the same period.",
      time: "11:15 AM", 
      source: "Mint",
      image: "https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?q=80&w=2076&auto=format&fit=crop",
      category: "Corporate"
    },
    { 
      headline: "Tata Motors Unveils New Electric Vehicle Lineup",
      content: "Tata Motors announced an ambitious plan to launch five new electric vehicles in the next 18 months, aiming to capture 30% of the EV market in India by 2025. The company also revealed plans to invest ₹15,000 crore in EV development over the next five years.",
      time: "8:50 AM", 
      source: "Financial Express",
      image: "https://images.unsplash.com/photo-1593941707882-a5bba13a3760?q=80&w=2072&auto=format&fit=crop",
      category: "Auto"
    },
    { 
      headline: "Government Approves ₹76,000 Crore Semiconductor Manufacturing Scheme",
      content: "The Union Cabinet approved a ₹76,000 crore scheme for semiconductor and display manufacturing in India, aiming to position the country as a global hub for electronics. The scheme will provide financial support to companies investing in semiconductors, display manufacturing, and design.",
      time: "10:20 AM", 
      source: "The Hindu Business Line",
      image: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?q=80&w=2070&auto=format&fit=crop",
      category: "Policy"
    }
  ];

  return {
    timestamp: new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      day: "numeric",
      month: "short",
      year: "numeric"
    }),
    indices: indicesData,
    stocks: stocksData,
    sectors: sectors,
    topGainers: topGainers,
    topLosers: topLosers,
    marketBreadth: marketBreadth,
    news: newsItems
  };
};

// Format numbers with commas for Indian number system
const formatIndianNumber = (num) => {
  if (num === undefined || num === null) return "";
  const numStr = num.toString();
  let result = "";
  let decimal = "";
  
  // Handle decimal part
  if (numStr.includes(".")) {
    const parts = numStr.split(".");
    result = parts[0];
    decimal = "." + parts[1];
  } else {
    result = numStr;
  }
  
  // Format integer part
  let formattedInt = "";
  let count = 0;
  
  for (let i = result.length - 1; i >= 0; i--) {
    count++;
    formattedInt = result[i] + formattedInt;
    
    if (count === 3 && i > 0) {
      formattedInt = "," + formattedInt;
      count = 0;
    } else if (count === 2 && i > 0 && formattedInt.includes(",")) {
      formattedInt = "," + formattedInt;
      count = 0;
    }
  }
  
  return formattedInt + decimal;
};

// Component for a metric card with standard styling
const MetricCard = ({ title, children, className = "" }) => {
  const cardRef = useRef(null);
  
  useEffect(() => {
    gsap.from(cardRef.current, {
      duration: 0.6,
      y: 20,
      opacity: 0,
      ease: "power3.out",
      delay: Math.random() * 0.5
    });
  }, []);

  return (
    <div 
      ref={cardRef} 
      className={`bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 h-full ${className}`}
    >
      <h2 className="text-lg font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">{title}</h2>
      <div className="h-full">{children}</div>
    </div>
  );
};

// Price change component with appropriate coloring
const PriceChange = ({ change, percentChange }) => {
  const isPositive = parseFloat(change) >= 0;
  const color = isPositive ? "text-green-500" : "text-red-500";
  const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;
  
  return (
    <span className={`flex items-center ${color} text-sm font-medium`}>
      <Arrow size={16} className="mr-1" />
      <span>{isPositive ? "+" : ""}{change} ({isPositive ? "+" : ""}{percentChange}%)</span>
    </span>
  );
};

// Simplified placeholder components for charts
const StockPriceChart = ({ data }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-gray-400">Chart visualization would appear here</div>
    </div>
  );
};

const MarketBreadthChart = ({ data }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-gray-400">Market breadth chart would appear here</div>
    </div>
  );
};

const SectorPerformanceChart = ({ sectors }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-gray-400">Sector performance chart would appear here</div>
    </div>
  );
};

// Enhanced news item component with better styling
const NewsItem = ({ item }) => {
  const categoryColors = {
    "Markets": "bg-blue-500",
    "Economy": "bg-green-500",
    "Corporate": "bg-purple-500",
    "Auto": "bg-red-500",
    "Policy": "bg-yellow-500",
    "Technology": "bg-indigo-500",
    "Banking": "bg-cyan-500"
  };

  const categoryColor = categoryColors[item.category] || "bg-gray-500";
  
  return (
    <div className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 transition duration-200 cursor-pointer">
      {item.image && (
        <div className="mb-3">
          <img 
            src={item.image} 
            alt={item.headline}
            className="w-full h-40 object-cover rounded-md"
          />
        </div>
      )}
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-200 text-lg">{item.headline}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.content}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className={`${categoryColor} text-white text-xs px-2 py-1 rounded-full`}>{item.category}</span>
          <span className="text-xs text-gray-400 ml-2">{item.source}</span>
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">{item.time}</div>
      </div>
    </div>
  );
};

// Main dashboard component
const IndianStockMarketDashboard = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef(null);

  useEffect(() => {
    // Simulate API call with a delay
    const fetchData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateMockStockData();
      setMarketData(data);
      setLoading(false);
    };

    fetchData();

    // Refresh data every 60 seconds
    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!loading && dashboardRef.current) {
      // Animate the dashboard entrance
      gsap.from(".dashboard-header", {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      const cards = document.querySelectorAll(".metric-card");
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.3
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading Market Data...</p>
        </div>
      </div>
    );
  }

  const { indices, stocks, sectors, topGainers, topLosers, marketBreadth, news, timestamp } = marketData;

  return (
    <div ref={dashboardRef} className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="dashboard-header flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Indian Stock Market Dashboard</h1>
          <p className="text-gray-400 text-sm flex items-center mt-1">
            <Clock size={16} className="mr-1" />
            Last updated: {timestamp} IST
          </p>
        </div>
        <div className="flex space-x-4">
          {indices.slice(0, 2).map((index) => (
            <div key={index.code} className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700">
              <div className="text-sm text-gray-400">{index.name}</div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">₹{formatIndianNumber(index.price)}</span>
                <PriceChange change={index.change} percentChange={index.percentChange} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Major Indices Card */}
        <MetricCard title="Major Indices" className="metric-card">
          <div className="space-y-3">
            {indices.map((index) => (
              <div key={index.code} className="flex justify-between items-center border-b border-gray-700 pb-2 last:border-0">
                <div>
                  <div className="font-medium">{index.name}</div>
                  <div className="text-sm text-gray-400">{index.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{formatIndianNumber(index.price)}</div>
                  <PriceChange change={index.change} percentChange={index.percentChange} />
                </div>
              </div>
            ))}
          </div>
        </MetricCard>

        {/* NIFTY 50 Chart Card */}
        <MetricCard title="NIFTY 50 Today" className="metric-card">
          <div className="h-64">
            <StockPriceChart data={indices.find(idx => idx.code === "NIFTY")?.historicalData || []} />
          </div>
        </MetricCard>

        {/* SENSEX Chart Card */}
        <MetricCard title="SENSEX Today" className="metric-card">
          <div className="h-64">
            <StockPriceChart data={indices.find(idx => idx.code === "SENSEX")?.historicalData || []} />
          </div>
        </MetricCard>

        {/* Market Breadth Card */}
        <MetricCard title="Market Breadth" className="metric-card">
          <MarketBreadthChart data={marketBreadth} />
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="bg-gray-700 bg-opacity-30 rounded p-2">
              <div className="text-green-500 text-lg font-semibold">{formatIndianNumber(marketBreadth.advancers)}</div>
              <div className="text-xs text-gray-400">Advancing</div>
            </div>
            <div className="bg-gray-700 bg-opacity-30 rounded p-2">
              <div className="text-red-500 text-lg font-semibold">{formatIndianNumber(marketBreadth.decliners)}</div>
              <div className="text-xs text-gray-400">Declining</div>
            </div>
            <div className="bg-gray-700 bg-opacity-30 rounded p-2">
              <div className="text-gray-300 text-lg font-semibold">{formatIndianNumber(marketBreadth.unchanged)}</div>
              <div className="text-xs text-gray-400">Unchanged</div>
            </div>
          </div>
        </MetricCard>

        {/* Sector Performance Card */}
        <MetricCard title="Sector Performance" className="metric-card">
          <SectorPerformanceChart sectors={sectors} />
        </MetricCard>

        {/* Top Gainers Card */}
        <MetricCard title="Top Gainers" className="metric-card">
          <div className="space-y-2">
            {topGainers.map((stock) => (
              <div key={stock.code} className="flex justify-between items-center p-2 bg-green-900 bg-opacity-20 rounded">
                <div>
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-xs text-gray-400">{stock.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{formatIndianNumber(stock.price)}</div>
                  <div className="text-green-500 text-sm">+{stock.percentChange}%</div>
                </div>
              </div>
            ))}
          </div>
        </MetricCard>

        {/* Top Losers Card */}
        <MetricCard title="Top Losers" className="metric-card">
          <div className="space-y-2">
            {topLosers.map((stock) => (
              <div key={stock.code} className="flex justify-between items-center p-2 bg-red-900 bg-opacity-20 rounded">
                <div>
                  <div className="font-medium">{stock.name}</div>
                  <div className="text-xs text-gray-400">{stock.code}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{formatIndianNumber(stock.price)}</div>
                  <div className="text-red-500 text-sm">{stock.percentChange}%</div>
                </div>
              </div>
            ))}
          </div>
        </MetricCard>

        {/* Latest News Card - Enhanced with better styling */}
        <MetricCard title="Market News" className="metric-card lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {news.map((item, index) => (
              <NewsItem key={index} item={item} />
            ))}
          </div>
        </MetricCard>

        {/* Detailed Stock View */}
        <MetricCard title="Stock Spotlight: Reliance Industries" className="metric-card">
          {(() => {
            const stock = stocks.find(s => s.code === "RELIANCE");
            if (!stock) return null;
            
            return (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-xl font-semibold">{stock.name}</div>
                    <div className="text-gray-400">{stock.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">₹{formatIndianNumber(stock.price)}</div>
                    <PriceChange change={stock.change} percentChange={stock.percentChange} />
                  </div>
                </div>
                
                <div className="h-40 mb-4">
                  <StockPriceChart data={stock.historicalData} />
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-700 bg-opacity-30 p-2 rounded">
                    <div className="text-gray-400">Volume</div>
                    <div className="font-medium">{formatIndianNumber(stock.volume)}</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-30 p-2 rounded">
                    <div className="text-gray-400">Day Range</div>
                    <div className="font-medium">₹{stock.dayRange.low} - ₹{stock.dayRange.high}</div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-30 p-2 rounded col-span-2">
                    <div className="text-gray-400">52 Week Range</div>
                    <div className="font-medium">₹{stock.yearRange.low} - ₹{stock.yearRange.high}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </MetricCard>
      </div>
    </div>
  );
};

// Export the component
const NewsComponent = IndianStockMarketDashboard;
export default NewsComponent;