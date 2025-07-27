'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as stockApi from '@/api/clientApi';
import { ArrowUp, PieChart as PieChartIcon, BarChart2 as BarChartIcon, TrendingUpIcon, FilterIcon, PercentIcon, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Chart, registerables, TooltipItem, type ChartConfiguration, type ChartOptions } from 'chart.js';

Chart.register(...registerables);

// Helper function to sort and get top N gainers
const getTopGainers = (stocks: any[], count: number = 10): any[] => {
  return stocks
    .filter(stock => stock.price_change_percentage > 0)
    .sort((a, b) => b.price_change_percentage - a.price_change_percentage)
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
    const gainRanges = {
        '0-1%': 0,
        '1-2%': 0,
        '2-3%': 0,
        '3-5%': 0,
        '>5%': 0,
    };
    stocks.forEach(stock => {
        const change = stock.price_change_percentage;
        if (change <= 1) gainRanges['0-1%']++;
        else if (change <= 2) gainRanges['1-2%']++;
        else if (change <= 3) gainRanges['2-3%']++;
        else if (change <= 5) gainRanges['3-5%']++;
        else gainRanges['>5%']++;
    });
    return { labels: Object.keys(gainRanges), data: Object.values(gainRanges) };
};

const getHighestGainer = (stocks: any[]): any | null => {
    if (stocks.length === 0) return null;
    return stocks.reduce((max, stock) => stock.price_change_percentage > max.price_change_percentage ? stock : max, stocks[0]);
};

export default function TopGainersPage() {
  const [gainers, setGainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectorChartRef = useRef<HTMLCanvasElement>(null);
  const priceRangeChartRef = useRef<HTMLCanvasElement>(null);
  const percentChangeChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRefs = useRef<{[key: string]: Chart | null}>({});

  // Fetch top gainers from API
  useEffect(() => {
    const fetchGainers = async () => {
      try {
        setLoading(true);
        const data = await stockApi.getTopGainers({ limit: 10 });
        setGainers(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching top gainers:', err);
        setError('Failed to load top gainers data');
        setGainers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGainers();
  }, []);

  const sectorDistribution = getSectorDistribution(gainers);
  const averageChange = getAverageChange(gainers);
  const topVolumeGainers = getTopVolumeMovers(gainers, 3);
  const priceRangeDistribution = getPriceRangeDistribution(gainers);
  const percentageChangeDistribution = getPercentageChangeDistribution(gainers);
  const highestGainer = getHighestGainer(gainers);

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

  useEffect(() => {
    const fetchGainers = async () => {
      const data = await stockApi.getTopGainers();
      // Use data
    };
    fetchGainers();
  }, []);

  useEffect(() => {
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
      data: { labels: sectorDistribution.labels, datasets: [{ data: sectorDistribution.data, backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384'], borderColor: 'transparent' }] },
      options: doughnutOptions
    });
  }, [sectorDistribution]);

  useEffect(() => {
    drawChart(priceRangeChartRef, 'priceRange', {
        type: 'bar',
        data: { labels: priceRangeDistribution.labels, datasets: [{ label: 'Stocks', data: priceRangeDistribution.data, backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280' } }, x: { ticks: { color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280', font: {size: 9} }} }}
    });
  }, [priceRangeDistribution]);

  useEffect(() => {
    drawChart(percentChangeChartRef, 'percentChange', {
        type: 'bar',
        data: { labels: percentageChangeDistribution.labels, datasets: [{ label: 'Stocks', data: percentageChangeDistribution.data, backgroundColor: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgba(153, 102, 255, 1)', borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }}, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280' } }, x: { ticks: { color: document.body.classList.contains('dark') ? '#9ca3af' : '#6b7280', font: {size: 9} }} }}
    });
  }, [percentageChangeDistribution]);
  
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
            <TrendingUpIcon className="w-10 h-10 mr-3 text-green-500" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-500 to-teal-600 dark:from-green-300 dark:via-emerald-400 dark:to-teal-500">
              Top Gainers Today
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <p className="text-md text-gray-600 dark:text-gray-400">
            Discover today's market leaders with the most significant price increases.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="text-center dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
          <CardHeader>
            <CardTitle>Loading Top Gainers...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we load the latest market data.</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="text-center dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
          </CardContent>
        </Card>
      ) : gainers.length === 0 ? (
        <Card className="text-center dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
          <CardHeader>
            <CardTitle>No Gainers Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300">There are no stocks with positive gains currently.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
          {gainers.map((stock) => (
            <Card 
              key={stock.id} 
              className="group flex flex-col justify-between dark:bg-slate-800 dark:border-slate-700 border-2 border-transparent hover:border-green-500/80 dark:hover:border-green-400/80 transition-all duration-300 ease-in-out transform hover:scale-[1.03] hover:shadow-2xl rounded-lg overflow-hidden"
            >
              <CardHeader className="pb-3 pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-xl font-bold text-indigo-700 dark:text-sky-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                        <a href={`/stocks/${stock.symbol}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{stock.symbol}</a>
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500 dark:text-gray-400 truncate w-full max-w-[180px] sm:max-w-[200px] group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300" title={stock.company_name}>{stock.company_name}</CardDescription>
                  </div>
                  <span className={`flex flex-col items-end text-sm font-medium ${stock.price_change_percentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    <div className="flex items-center">
                        <ArrowUp size={16} className="mr-0.5" /> {stock.price_change_percentage.toFixed(2)}%
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
                  <p><span className="font-medium text-gray-700 dark:text-gray-200">Open:</span> <span className="text-gray-900 dark:text-white">₹{stock.day_low.toFixed(2)}</span></p> 
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

      {gainers.length > 0 && (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100 text-center">Gainers Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Sector Breakdown</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent className="flex-grow flex justify-center items-center p-2 min-h-[200px]">
                        <div className="w-full h-full max-h-[220px]"><canvas ref={sectorChartRef}></canvas></div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Price Change</CardTitle>
                        <TrendingUpIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">+{averageChange.toFixed(2)}%</div>
                        <p className="text-xs text-muted-foreground dark:text-gray-500">Average gain for top {gainers.length} stocks.</p>
                        {highestGainer && (
                            <div className="text-xs text-muted-foreground dark:text-gray-500 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                                Highest: +{highestGainer.price_change_percentage.toFixed(2)}% ({highestGainer.symbol})
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Volume Gainers</CardTitle>
                        <BarChartIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <ul className="text-xs space-y-2 text-gray-700 dark:text-gray-300">
                            {topVolumeGainers.map(stock => (
                                <li key={stock.symbol} className="flex flex-col items-start space-y-0.5">
                                    <div className="flex justify-between w-full items-center">
                                        <a href={`/stocks/${stock.symbol}`} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 dark:text-sky-400 hover:underline truncate max-w-[120px]" title={stock.company_name}>
                                            {stock.symbol} <span className="text-gray-500 dark:text-gray-400 text-[10px] hidden sm:inline">({stock.company_name.length > 15 ? stock.company_name.substring(0,12) + '...' : stock.company_name})</span>
                                        </a>
                                        <span className="text-gray-600 dark:text-gray-400 font-semibold">{(stock.volume / 100000).toFixed(2)}L</span>
                                    </div>
                                    <span className="text-green-600 dark:text-green-400 text-[11px]">+{stock.price_change_percentage.toFixed(2)}%</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Ranges (Top Gainers)</CardTitle>
                        <FilterIcon className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
                    </CardHeader>
                    <CardContent className="flex-grow flex justify-center items-center p-2 min-h-[200px]">
                         <div className="w-full h-full max-h-[220px]"><canvas ref={priceRangeChartRef}></canvas></div>
                    </CardContent>
                </Card>

                <Card className="dark:bg-gray-900/90 backdrop-blur-lg border-gray-700/50 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Gain % Spread</CardTitle>
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