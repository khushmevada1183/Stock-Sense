import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface PricePoint {
  day: number;
  bsePrice?: number;
  nsePrice?: number;
  date?: string;
}

interface StockTechnicalChartProps {
  technicalData: PricePoint[];
  symbol: string;
}

const StockTechnicalChart = ({ technicalData, symbol }: StockTechnicalChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<5 | 10 | 20 | 50 | 100 | 300>(50);
  
  // Filter data based on selected period
  const filteredData = technicalData
    .filter(point => point.day <= selectedPeriod)
    .sort((a, b) => a.day - b.day);
  
  // Format date for tooltip
  const formatDate = (date?: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return date;
    }
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-md">
          <p className="font-medium">{formatDate(dataPoint.date) || `Day ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  // Period options
  const periodOptions = [
    { value: 5, label: '5 Days' },
    { value: 10, label: '10 Days' },
    { value: 20, label: '20 Days' },
    { value: 50, label: '50 Days' },
    { value: 100, label: '100 Days' },
    { value: 300, label: '300 Days' }
  ];
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Price Trends
        </CardTitle>
        <CardDescription>
          Historical price movement for {symbol}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {technicalData.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {periodOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPeriod(option.value as any)}
                  className={`px-3 py-1 text-sm rounded ${
                    selectedPeriod === option.value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis 
                    dataKey="day" 
                    label={{ value: 'Days', position: 'insideBottomRight', offset: -5 }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {filteredData.some(d => d.bsePrice !== undefined) && (
                    <Line 
                      type="monotone" 
                      dataKey="bsePrice" 
                      name="BSE Price" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {filteredData.some(d => d.nsePrice !== undefined) && (
                    <Line 
                      type="monotone" 
                      dataKey="nsePrice" 
                      name="NSE Price" 
                      stroke="#EC4899" 
                      strokeWidth={2}
                      dot={{ r: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Price Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Opening</p>
                <p className="font-medium">
                  ₹{filteredData[0]?.bsePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Latest</p>
                <p className="font-medium">
                  ₹{filteredData[filteredData.length - 1]?.bsePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Highest</p>
                <p className="font-medium text-green-600">
                  ₹{Math.max(...filteredData.map(d => d.bsePrice || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Lowest</p>
                <p className="font-medium text-red-600">
                  ₹{Math.min(...filteredData.filter(d => (d.bsePrice || 0) > 0).map(d => d.bsePrice || Infinity)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Technical data is not available at this time.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockTechnicalChart; 