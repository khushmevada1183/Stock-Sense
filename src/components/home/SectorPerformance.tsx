'use client';

import { useState, useEffect, useRef } from 'react';
import * as stockApi from '@/api/api';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { logger } from '@/lib/logger';

interface SectorData {
  name: string;
  changePercent: number;
  marketCap?: string;
}

interface SectorPerformanceApiItem {
  sector_name?: string;
  name?: string;
  change_percent?: string | number;
  percent_change?: string | number;
  market_cap?: string;
}

export default function SectorPerformance() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        const response = await stockApi.getNSEMostActive();
        
        if (response && response.success && response.data && response.data.sector_performance) {
          const sectorData: SectorData[] = (response.data.sector_performance as SectorPerformanceApiItem[])
            .slice(0, 8)
            .map((sector) => ({
              name: sector.sector_name || sector.name || 'Unknown Sector',
              changePercent: parseFloat(String(sector.change_percent ?? sector.percent_change ?? '0')),
              marketCap: sector.market_cap || undefined
            }));
          
          setSectors(sectorData);
        } else {
          setSectors(mockSectors);
          logger.debug('API returned unexpected data structure for sectors, using fallback');
        }
      } catch (err) {
        console.error('Failed to fetch sector performance:', err);
        setError('Failed to load sector performance');
        setSectors(mockSectors);
      } finally {
        setLoading(false);
      }
    };

    fetchSectorData();
  }, []);

  const mockSectors: SectorData[] = [
    { name: 'Information Technology', changePercent: 1.8 },
    { name: 'Financial Services', changePercent: -0.5 },
    { name: 'Healthcare', changePercent: 0.9 },
    { name: 'Consumer Goods', changePercent: 0.3 },
    { name: 'Energy', changePercent: -1.2 },
    { name: 'Automobile', changePercent: 1.5 },
    { name: 'Metals', changePercent: -0.8 },
    { name: 'Real Estate', changePercent: 0.2 }
  ];

  if (loading) {
    return (
      <div ref={sectionRef}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 p-4 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mb-3" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  // Find the max absolute change for bar scaling
  const maxAbsChange = Math.max(...sectors.map(s => Math.abs(s.changePercent)), 1);

  return (
    <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sectors.map((sector, index) => {
        const positive = sector.changePercent >= 0;
        const barWidth = (Math.abs(sector.changePercent) / maxAbsChange) * 100;
        
        return (
          <div 
            key={sector.name || index}
            className="relative overflow-hidden"
          >
            <div className="w-full min-h-[122px] rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950 p-4 hover:shadow-md transition-shadow">
              <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2 text-sm leading-tight">
                {sector.name}
              </h3>
              <div className={`flex items-center font-bold text-lg ${
                positive 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {positive ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(sector.changePercent).toFixed(2)}%
              </div>

              {/* Performance bar */}
              <div
                className={`mt-3 h-1 rounded-full transition-all duration-700 ${
                  positive 
                    ? 'bg-green-200 dark:bg-green-900/30' 
                    : 'bg-red-200 dark:bg-red-900/30'
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
