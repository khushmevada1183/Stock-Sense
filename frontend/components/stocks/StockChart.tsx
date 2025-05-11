"use client";

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
}

interface StockChartProps {
  data: HistoricalDataPoint[];
  period?: string; // Add period prop
}

const StockChart: React.FC<StockChartProps> = ({ data, period = '1m' }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Sort data by date (oldest to newest)
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Format dates based on period
    const formatDateByPeriod = (dateStr: string, periodType: string) => {
      const date = new Date(dateStr);
      
      switch (periodType) {
        case '1m':
          // For 1 month, show day and month (e.g., "15 Jan")
          return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
        case '6m':
          // For 6 months, show month (e.g., "Jan")
          return date.toLocaleDateString(undefined, { month: 'short' });
        case '1yr':
          // For 1 year, show month (e.g., "Jan")
          return date.toLocaleDateString(undefined, { month: 'short' });
        case '3yr':
        case '5yr':
          // For 3-5 years, show month and year (e.g., "Jan 2022")
          return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        case 'max':
          // For max, show year only (e.g., "2022")
          return date.toLocaleDateString(undefined, { year: 'numeric' });
        default:
          return date.toLocaleDateString();
      }
    };

    // Extract dates and prices
    const labels = sortedData.map(item => formatDateByPeriod(item.date, period));
    const prices = sortedData.map(item => item.price);
          
    // Calculate gradient for line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // Blue with opacity
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)'); // Transparent

    // Determine max ticks based on period
    const getMaxTicksByPeriod = (periodType: string) => {
      switch (periodType) {
        case '1m': return 10;
        case '6m': return 6;
        case '1yr': return 12;
        case '3yr': return 6;
        case '5yr': return 5;
        case 'max': return 8;
        default: return 8;
      }
    };

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Price',
            data: prices,
            borderColor: 'rgb(59, 130, 246)', // Blue
            backgroundColor: gradient,
            borderWidth: 2,
            pointRadius: 0, // Hide points
            pointHoverRadius: 5, // Show points on hover
            pointBackgroundColor: 'rgb(59, 130, 246)',
            tension: 0.1, // Slight curve
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          tooltip: {
            enabled: true,
            callbacks: {
              label: function(context) {
                return `₹${context.parsed.y.toFixed(2)}`;
              },
              title: function(tooltipItems) {
                // Format the tooltip title based on period
                const item = tooltipItems[0];
                const dataIndex = item.dataIndex;
                const originalDate = sortedData[dataIndex]?.date;
                
                if (originalDate) {
                  const date = new Date(originalDate);
                  return date.toLocaleDateString(undefined, { 
                    weekday: 'short', 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  });
                }
                return item.label;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            ticks: {
              maxTicksLimit: getMaxTicksByPeriod(period),
              maxRotation: 0
            },
            grid: {
              display: false
            }
          },
          y: {
            position: 'right',
            ticks: {
              callback: function(value) {
                return '₹' + value;
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, period]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default StockChart; 