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
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse rounded-[24px] border border-slate-200/70 bg-white/75 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 h-3.5 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-rose-200/70 bg-rose-50/80 p-4 text-rose-700 backdrop-blur-xl dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-300">
        {error}
      </div>
    );
  }

  // Find the max absolute change for bar scaling
  const maxAbsChange = Math.max(...sectors.map(s => Math.abs(s.changePercent)), 1);

  return (
    <div ref={sectionRef} className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {sectors.map((sector, index) => {
        const positive = sector.changePercent >= 0;
        const barWidth = (Math.abs(sector.changePercent) / maxAbsChange) * 100;
        
        return (
          <div 
            key={sector.name || index}
            className="relative overflow-hidden"
          >
            <div className="w-full min-h-[122px] rounded-[24px] border border-slate-200/70 bg-white/75 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_22px_60px_rgba(0,0,0,0.32)]">
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 leading-tight">
                {sector.name}
              </h3>
              <div className={`flex items-center text-base font-semibold tracking-tight ${
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
