'use client';

import React, { useEffect, useRef } from 'react';
import * as stockApi from '@/api/clientApi';
import { ArrowDown, PieChart as PieChartIcon, BarChart2 as BarChartIcon, TrendingDownIcon, FilterIcon, PercentIcon, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Chart, registerables, TooltipItem, type ChartConfiguration, type ChartOptions } from 'chart.js';

Chart.register(...registerables);

// Helper function to sort and get top N losers
const getTopLosers = (stocks: any[], count: number = 10): any[] => {
  return stocks
    .filter(stock => stock.price_change_percentage < 0)
    .sort((a, b) => a.price_change_percentage - b.price_change_percentage)
    .slice(0, count);
};

interface SectorDistributionData {
  labels: string[];
  data: number[];
}

// Helper function to process data for sector distribution chart
const getSectorDistribution = (stocks: any[]): SectorDistributionData => {
  const sectorCounts: { [key: string]: number } = {};
  stocks.forEach(stock => {
    sectorCounts[stock.sector_name] = (sectorCounts[stock.sector_name] || 0) + 1;
  });
  return {
    labels: Object.keys(sectorCounts),
    data: Object.values(sectorCounts),
  };
};

const getAverageChange = (stocks: any[]): number => {
  if (stocks.length === 0) return 0;
  const totalChange = stocks.reduce((sum, stock) => sum + stock.price_change_percentage, 0);
  return totalChange / stocks.length;
};

const getTopVolumeMovers = (stocks: any[], count: number = 3): any[] => {
  return [...stocks].sort((a, b) => b.volume - a.volume).slice(0, count);
};

// New Helper Functions (similar to gainers, adapted for losers where needed)
interface DistributionChartData {
    labels: string[];
    data: number[];
}

const getPriceRangeDistribution = (stocks: any[]): DistributionChartData => {
    const ranges = {
        '< ₹100': 0,
        '₹100-₹500': 0,
        '₹500-₹1k': 0,
        '₹1k-₹5k': 0,
        '> ₹5k': 0,
    };
    stocks.forEach(stock => {
        if (stock.current_price < 100) ranges['< ₹100']++;
        else if (stock.current_price < 500) ranges['₹100-₹500']++;
        else if (stock.current_price < 1000) ranges['₹500-₹1k']++;
        else if (stock.current_price < 5000) ranges['₹1k-₹5k']++;
        else ranges['> ₹5k']++;
    });
    return { labels: Object.keys(ranges), data: Object.values(ranges) };
};

const getPercentageChangeDistribution = (stocks: any[]): DistributionChartData => {
    const lossRanges = { // Adjusted for losses
        '0 to -1%': 0,
        '-1 to -2%': 0,
        '-2 to -3%': 0,
        '-3 to -5%': 0,
        '< -5%': 0,
    };
    stocks.forEach(stock => {
        const change = stock.price_change_percentage;
        if (change >= -1) lossRanges['0 to -1%']++;
        else if (change >= -2) lossRanges['-1 to -2%']++;
        else if (change >= -3) lossRanges['-2 to -3%']++;
        else if (change >= -5) lossRanges['-3 to -5%']++;
        else lossRanges['< -5%']++;
    });
    return { labels: Object.keys(lossRanges), data: Object.values(lossRanges) };
};

const getBiggestLoser = (stocks: any[]): any | null => {
    if (stocks.length === 0) return null;
    return stocks.reduce((min, stock) => stock.price_change_percentage < min.price_change_percentage ? stock : min, stocks[0]);
};

export default function TopLosersPage() {
  const [losers, setLosers] = React.useState<any[]>([]);
  
  const sectorChartRef = useRef<HTMLCanvasElement>(null);
  const priceRangeChartRef = useRef<HTMLCanvasElement>(null);      // New Ref
  const percentChangeChartRef = useRef<HTMLCanvasElement>(null); // New Ref
  
  const chartInstanceRefs = useRef<{[key: string]: Chart | null}>({}); // Store all chart instances

  useEffect(() => {
    const fetchLosers = async () => {
      const data = await stockApi.getTopLosers();
      setLosers(data);
    };
    fetchLosers();
  }, []);

  const sectorDistribution = getSectorDistribution(losers);
  const averageChange = getAverageChange(losers);
  const topVolumeLosers = getTopVolumeMovers(losers, 3);
  const priceRangeDistribution = getPriceRangeDistribution(losers);
  const percentageChangeDistribution = getPercentageChangeDistribution(losers);
  const biggestLoser = getBiggestLoser(losers);

  // Generic Chart Drawing Effect (same as gainers page)
  const drawChart = (ref: React.RefObject<HTMLCanvasElement>, chartKey: string, config: ChartConfiguration) => {
    if (ref.current && config.data.labels && (config.data.labels as string[]).length > 0) {
      if (chartInstanceRefs.current[chartKey]) {
        chartInstanceRefs.current[chartKey]?.destroy();
      }
      const ctx = ref.current.getContext('2d');
      if (ctx) {
        chartInstanceRefs.current[chartKey] = new Chart(ctx, config);
      }
    }
  };

  useEffect(() => { // Sector Distribution Chart (Doughnut)
    const doughnutOptions: ChartOptions<'doughnut'> & { cutout?: string } = {
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
            legend: { position: 'bottom', labels: { color: document.body.classList.contains('dark') ? '#e5e7eb' : '#4b5563', padding: 8, font: {size: 9}}}, 
            tooltip: { callbacks: { label: (c: TooltipItem<'doughnut'>) => `${c.label}: ${c.parsed} stock(s)` }}
        },
        cutout: '60%'
    };
    drawChart(sectorChartRef, 'sector', {
      type: 'doughnut',
      data: { 
        labels: sectorDistribution.labels, 
        datasets: [{ 
            data: sectorDistribution.data, 
            backgroundColor: [ // Different colors for losers page
                'rgba(239, 68, 68, 0.7)', 'rgba(245, 158, 11, 0.7)', 
                'rgba(251, 191, 36, 0.7)', 'rgba(167, 139, 250, 0.7)', 
                'rgba(96, 165, 250, 0.7)', 'rgba(244, 114, 182, 0.7)'
            ], 
            borderColor: 'transparent' 
        }] 
      },
      options: doughnutOptions
    });
  }, [sectorDistribution]);

  useEffect(() => { // Price Range Distribution Chart (Bar)
    drawChart(priceRangeChartRef, 'priceRange', {
        type: 'bar',
        data: { labels: priceRangeDistribution.labels, datasets: [{ label: 'Stocks', data: priceRangeDistribution.data, backgroundColor: 'rgba(239, 68, 68, 0.6)', borderColor: 'rgba(239, 68, 68, 1)', borderWidth: 1 }] }, // Red color for losers
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280' } }, x: { ticks: { color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280', font: {size: 9} }} }}
    });
  }, [priceRangeDistribution]);

  useEffect(() => { // Percentage Change Distribution Chart (Bar)
    drawChart(percentChangeChartRef, 'percentChange', {
        type: 'bar',
        data: { labels: percentageChangeDistribution.labels, datasets: [{ label: 'Stocks', data: percentageChangeDistribution.data, backgroundColor: 'rgba(245, 158, 11, 0.6)', borderColor: 'rgba(245, 158, 11, 1)', borderWidth: 1 }] }, // Orange color for losers % change
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280' } }, x: { ticks: { color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280', font: {size: 9} }} }}
    });
  }, [percentageChangeDistribution]);
  
  // Cleanup for all charts
  useEffect(() => {
    return () => {
        Object.values(chartInstanceRefs.current).forEach(chart => chart?.destroy());
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 dark:bg-gray-900/90 shadow-lg border-gray-700/50 backdrop-blur-lg">
        <CardHeader className="pt-6 pb-4">
            <CardTitle className="text-4xl font-extrabold text-center flex items-center justify-center">
                <TrendingDownIcon className="w-10 h-10 mr-3 text-red-500" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-amber-600 dark:from-red-400 dark:via-orange-400 dark:to-amber-500">
                    Top Losers Today
                </span>
            </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-md text-gray-600 dark:text-gray-400">
            Explore today's stocks with the most notable price declines.
          </p>
        </CardContent>
      </Card>

      {losers.length === 0 ? (
        <Card className="text-center dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
          <CardHeader>
            <CardTitle>No Losers Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">There are no stocks with negative price changes in the mock data currently.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {losers.map((stock) => (
            <Card 
              key={stock.id} 
              className="group flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700 border-2 border-transparent hover:border-red-500/80 dark:hover:border-red-400/80 transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-2xl rounded-lg overflow-hidden"
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-indigo-700 dark:text-sky-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
                        <a href={`/stocks/${stock.symbol}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{stock.symbol}</a>
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500 dark:text-gray-400 truncate w-full max-w-[180px] sm:max-w-[200px] group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" title={stock.company_name}>{stock.company_name}</CardDescription>
                  </div>
                  <span className={`flex flex-col items-end text-sm font-medium ${stock.price_change_percentage < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                     <div className="flex items-center">
                        <ArrowDown size={16} className="mr-0.5" /> {stock.price_change_percentage.toFixed(2)}%
                    </div>
                    <div className="mt-0.5">
                        ₹{(stock.current_price * stock.price_change_percentage / 100).toFixed(2)}
                    </div>
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  ₹{stock.current_price.toFixed(2)}
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4 text-xs text-gray-600 dark:text-gray-300">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <p><span className="font-medium text-gray-700 dark:text-gray-200">Open:</span> <span className="text-gray-900 dark:text-white">₹{stock.day_high.toFixed(2)}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-200">High:</span> <span className="text-gray-900 dark:text-white">₹{stock.day_high.toFixed(2)}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-200">Prev. Close:</span> <span className="text-gray-900 dark:text-white">₹{(stock.current_price - (stock.current_price * stock.price_change_percentage / 100)).toFixed(2)}</span></p>
                  <p><span className="font-medium text-gray-700 dark:text-gray-200">Low:</span> <span className="text-gray-900 dark:text-white">₹{stock.day_low.toFixed(2)}</span></p>
                  <p className="col-span-2"><span className="font-medium text-gray-700 dark:text-gray-200">Volume:</span> <span className="text-gray-900 dark:text-white">{(stock.volume / 100000).toFixed(2)}L</span></p>
                  <p className="col-span-2"><span className="font-medium text-gray-700 dark:text-gray-200">Sector:</span> <span className="text-gray-900 dark:text-white">{stock.sector_name}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {losers.length > 0 && (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 text-center">Losers Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Sector Distribution Card (Doughnut) */}
                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Sector Breakdown</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent className="flex-grow flex justify-center items-center p-2 min-h-[200px]">
                        <div className="w-full h-full max-h-[220px]"><canvas ref={sectorChartRef}></canvas></div>
                    </CardContent>
                </Card>

                {/* Average Change Card */}
                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Price Change</CardTitle>
                        <TrendingDownIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{averageChange.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">Average loss for top {losers.length} stocks.</p>
                        {biggestLoser && (
                            <div className="text-xs text-muted-foreground dark:text-gray-500 flex items-center">
                                <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                                Biggest Drop: {biggestLoser.price_change_percentage.toFixed(2)}% ({biggestLoser.symbol})
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Volume Movers Card */}
                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Volume Losers</CardTitle>
                        <BarChartIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <ul className="text-xs space-y-2 text-gray-700 dark:text-gray-300">
                            {topVolumeLosers.map(stock => (
                                <li key={stock.symbol} className="flex flex-col items-start space-y-0.5">
                                    <div className="flex justify-between w-full items-center">
                                        <a href={`/stocks/${stock.symbol}`} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-sky-400 hover:underline truncate max-w-[120px]" title={stock.company_name}>
                                            {stock.symbol} <span className="text-gray-500 dark:text-gray-400 text-[10px] hidden sm:inline">({stock.company_name.length > 15 ? stock.company_name.substring(0,12) + '...' : stock.company_name})</span>
                                        </a>
                                        <span className="text-gray-600 dark:text-gray-400 font-semibold">{(stock.volume / 100000).toFixed(2)}L</span>
                                    </div>
                                    <span className="text-red-600 dark:text-red-400 text-[11px]">{stock.price_change_percentage.toFixed(2)}%</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Price Range Distribution Card (Bar Chart) */}
                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Ranges (Top Losers)</CardTitle>
                        <FilterIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent className="flex-grow flex justify-center items-center p-2 min-h-[200px]">
                         <div className="w-full h-full max-h-[220px]"><canvas ref={priceRangeChartRef}></canvas></div>
                    </CardContent>
                </Card>

                {/* Percentage Change Distribution Card (Bar Chart) */}
                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Loss % Spread</CardTitle>
                        <PercentIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent className="flex-grow flex justify-center items-center p-2 min-h-[200px]">
                        <div className="w-full h-full max-h-[220px]"><canvas ref={percentChangeChartRef}></canvas></div>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
} 