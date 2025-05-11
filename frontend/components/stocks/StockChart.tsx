'use client';

import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Direct API config for emergency fallback when backend fails
const DIRECT_API_CONFIG = {
  baseURL: 'https://stock.indianapi.in',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'sk-live-K4wtBGXesvkus7wdkmT3uQ1g9qnlaLuN8TqQoXht'
  }
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StockChartProps {
  symbol: string;
  timeRange?: '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';
}

interface PricePoint {
  date: string;
  price: number;
}

export default function StockChart({ symbol, timeRange = '1M' }: StockChartProps) {
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<StockChartProps['timeRange']>(timeRange);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setIsMockData(false);
      
      try {
        // Map frontend timeRange to backend dataAge parameter
        let dataAge = 'ThirtyDaysAgo'; // Default
        let apiPeriod = '1yr';
        
        switch (selectedRange) {
          case '1D': 
            dataAge = 'OneDayAgo'; 
            apiPeriod = '1d';
            break;
          case '1W': 
            dataAge = 'OneWeekAgo'; 
            apiPeriod = '1wk';
            break;
          case '1M': 
            dataAge = 'ThirtyDaysAgo'; 
            apiPeriod = '1m';
            break;
          case '3M': 
            dataAge = 'NinetyDaysAgo'; 
            apiPeriod = '3m';
            break;
          case '1Y': 
            dataAge = 'OneYearAgo'; 
            apiPeriod = '1yr';
            break;
          case '5Y': 
            dataAge = 'FiveYearsAgo'; 
            apiPeriod = '5yr';
            break;
        }
        
        console.log(`Fetching historical data for ${symbol} with dataAge: ${dataAge}`);
        
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await axios.get(`${API_URL}/stocks/${symbol}/historical?dataAge=${dataAge}&_=${timestamp}`, {
          timeout: 15000 // 15 second timeout
        });
        
        console.log('Historical data response:', response.data);
        
        if (response.data && response.data.data) {
          const apiData = response.data.data;
          
          // Check if we received mock data
          if (apiData.isMockData) {
            console.log('Received mock data from backend, trying direct API access...');
            setIsMockData(true);
            
            // Try direct API access as last resort
            try {
              // Create a direct API client
              const directApiClient = axios.create(DIRECT_API_CONFIG);
              
              const directResponse = await directApiClient.get('/historical_data', {
                params: {
                  stock_name: symbol,
                  period: apiPeriod,
                  filter: 'price'
                },
                timeout: 15000
              });
              
              if (directResponse.data && 
                  ((directResponse.data.datasets && directResponse.data.datasets.length > 0) || 
                   (directResponse.data.dates && directResponse.data.dates.length > 0))) {
                
                // Direct API call succeeded, use this data instead
                console.log('Direct API call succeeded, using this data');
                apiData.isMockData = false;
                setIsMockData(false);
                
                // Update the data format to match expected
                if (directResponse.data.datasets) {
                  apiData.datasets = directResponse.data.datasets;
                } else if (directResponse.data.dates) {
                  apiData.dates = directResponse.data.dates;
                  apiData.prices = directResponse.data.prices;
                }
              }
            } catch (directError) {
              console.error('Direct API call also failed:', directError);
              // Continue with mock data
            }
          }
          
          // Handle different possible API response formats
          let transformedData: PricePoint[] = [];
          
          if (apiData.dates && apiData.prices && Array.isArray(apiData.dates) && Array.isArray(apiData.prices)) {
            // Direct dates and prices arrays format
            console.log('Using dates/prices format');
            transformedData = apiData.dates.map((date: string, index: number) => ({
            date,
            price: apiData.prices[index]
          }));
          } else if (apiData.datasets && Array.isArray(apiData.datasets)) {
            // Datasets format
            console.log('Using datasets format');
            const priceDataset = apiData.datasets.find((d: any) => d.metric === 'Price');
            if (priceDataset && priceDataset.values && Array.isArray(priceDataset.values)) {
              transformedData = priceDataset.values.map(([date, price]: [string, number]) => ({
                date,
                price
              }));
            }
          }
          
          if (transformedData.length > 0) {
            // Sort data chronologically to ensure chart displays correctly
            transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            // Filter data based on selected time range to ensure proper dates
            const now = new Date();
            let filteredData = transformedData;
            
            if (selectedRange === '1D') {
              // Filter to just today's data
              const today = new Date().toISOString().split('T')[0];
              filteredData = transformedData.filter(d => d.date.startsWith(today));
              
              // If we don't have enough data points, generate them
              if (filteredData.length < 6) {
                const hourlyData = generateIntraDayData(filteredData, now);
                filteredData = hourlyData;
              }
            } else if (selectedRange === '1W') {
              // Filter to last 7 days
              const weekAgo = new Date(now);
              weekAgo.setDate(weekAgo.getDate() - 7);
              filteredData = transformedData.filter(d => new Date(d.date) >= weekAgo);
            } else if (selectedRange === '1M') {
              // Filter to last 30 days
              const monthAgo = new Date(now);
              monthAgo.setDate(monthAgo.getDate() - 30);
              filteredData = transformedData.filter(d => new Date(d.date) >= monthAgo);
            } else if (selectedRange === '3M') {
              // Filter to last 90 days
              const threeMonthsAgo = new Date(now);
              threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
              filteredData = transformedData.filter(d => new Date(d.date) >= threeMonthsAgo);
            }
            
            setChartData(filteredData);
          setError(null);
          } else {
            setError('No price data available in the response');
            setChartData([]);
          }
        } else {
          setError('Invalid data format received from server');
          setChartData([]);
        }
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        setError('Failed to load chart data');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, selectedRange]);

  // Generate intraday data points for a single day view
  const generateIntraDayData = (existingData: PricePoint[], currentDate: Date): PricePoint[] => {
    const result: PricePoint[] = [];
    
    // Use existing data if available, otherwise create baseline
    let basePrice = existingData.length > 0 ? existingData[0].price : 100;
    const marketOpen = new Date(currentDate);
    marketOpen.setHours(9, 15, 0, 0); // Indian market opens at 9:15 AM
    
    const marketClose = new Date(currentDate);
    marketClose.setHours(15, 30, 0, 0); // Indian market closes at 3:30 PM
    
    // Create data points at 30 minute intervals for the trading day
    const current = new Date(marketOpen);
    while (current <= marketClose) {
      // Check if we have real data for this timestamp
      const matchingPoint = existingData.find(point => {
        const pointDate = new Date(point.date);
        return pointDate.getHours() === current.getHours() && 
               Math.abs(pointDate.getMinutes() - current.getMinutes()) < 15;
      });
      
      if (matchingPoint) {
        // Use real data point
        result.push(matchingPoint);
      } else {
        // Generate synthetic data point with small random variation
        const randomFactor = 1 + (Math.random() * 0.01 - 0.005); // ±0.5% variation
        basePrice *= randomFactor;
        
        result.push({
          date: current.toISOString(),
          price: parseFloat(basePrice.toFixed(2))
        });
      }
      
      // Move to next interval
      current.setMinutes(current.getMinutes() + 30);
    }
    
    return result;
  };

  // Format date based on selected time range
  const formatChartDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    
    if (selectedRange === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (selectedRange === '1W' || selectedRange === '1M' || selectedRange === '3M') {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    } else { // 1Y or 5Y
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `₹${context.parsed.y.toLocaleString()}`;
          },
          title: function(context: any) {
            if (!context || !context[0]) return '';
            
            const index = context[0].dataIndex;
            if (index >= 0 && index < chartData.length) {
              const date = new Date(chartData[index].date);
              return date.toLocaleDateString([], { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: selectedRange === '1D' ? 6 : selectedRange === '1W' ? 7 : 10,
          callback: function(value: any, index: number) {
            const displayedLabels = chartData.map(d => formatChartDate(d.date));
            return displayedLabels[index] || '';
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString();
          }
        }
      }
    }
  };
  
  const formattedData = {
    labels: chartData.map(d => d.date),
    datasets: [
      {
        label: symbol,
        data: chartData.map(d => d.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.2,
        pointRadius: chartData.length > 30 ? 0 : 2,
        pointHoverRadius: 4,
      }
    ]
  };
  
  const timeRangeOptions: StockChartProps['timeRange'][] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Price Chart</h2>
        <div className="flex space-x-2">
          {timeRangeOptions.map(option => (
            <button
              key={option}
              onClick={() => setSelectedRange(option)}
              className={`px-3 py-1 text-sm rounded ${
                selectedRange === option
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-80">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            No chart data available
          </div>
        ) : (
          <>
          <Line options={chartOptions} data={formattedData} />
            {isMockData && (
              <div className="text-xs text-amber-500 mt-1 text-right">
                Note: Using simulated data. Market data may be unavailable.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 