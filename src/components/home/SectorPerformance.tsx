'use client';

import { useState, useEffect, useRef } from 'react';
import * as stockApi from '@/api/api';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SectorData {
  name: string;
  changePercent: number;
  marketCap?: string;
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
          const sectorData: SectorData[] = response.data.sector_performance
            .slice(0, 8)
            .map((sector: any) => ({
              name: sector.sector_name || sector.name,
              changePercent: parseFloat(sector.change_percent || sector.percent_change || '0'),
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
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="h-4 bg-gray-800/60 rounded-lg w-3/4 mb-3 shimmer" />
              <div className="h-6 bg-gray-800/60 rounded-lg w-1/2 shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-4 border-red-500/20 text-red-400">
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
            className="glass-card card-shine rounded-xl p-4 group relative overflow-hidden"
          >
            {/* Performance bar (background accent) */}
            <div 
              className={`absolute bottom-0 left-0 h-[3px] rounded-full transition-all duration-700 ${
                positive 
                  ? 'bg-gradient-to-r from-green-500/60 to-green-400/30' 
                  : 'bg-gradient-to-r from-red-500/60 to-red-400/30'
              }`}
              style={{ width: `${barWidth}%` }}
            />
            
            <h3 className="font-medium text-gray-400 mb-2 text-sm leading-tight group-hover:text-gray-300 transition-colors duration-300">
              {sector.name}
            </h3>
            <div className={`flex items-center font-bold text-lg ${
              positive ? 'text-green-400' : 'text-red-400'
            }`}>
              {positive ? (
                <ArrowUp className="w-4 h-4 mr-1 animate-subtle-bounce" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(sector.changePercent).toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
