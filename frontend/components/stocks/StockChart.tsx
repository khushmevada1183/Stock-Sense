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
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
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

    // Extract dates and prices
    const labels = sortedData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString();
    });
    
    const prices = sortedData.map(item => item.price);

    // Calculate gradient for line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); // Blue with opacity
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)'); // Transparent

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
              maxTicksLimit: 8,
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
  }, [data]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default StockChart; 