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
        // Try to fetch sector data via NSE most active (which often includes sector data)
        const response = await stockApi.getNSEMostActive();
        
        if (response && response.success && response.data && response.data.sector_performance) {
          // Map API response to our SectorData interface
          const sectorData: SectorData[] = response.data.sector_performance
            .slice(0, 8) // Limit to 8 sectors for display
            .map((sector: any) => ({
              name: sector.sector_name || sector.name,
              changePercent: parseFloat(sector.change_percent || sector.percent_change || '0'),
              marketCap: sector.market_cap || undefined
            }));
          
          setSectors(sectorData);
        } else {
          // Fallback to mock data
          setSectors(mockSectors);
          console.log('API returned unexpected data structure for sectors, using fallback');
        }
      } catch (err) {
        console.error('Failed to fetch sector performance:', err);
        setError('Failed to load sector performance');
        setSectors(mockSectors); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchSectorData();
  }, []);

  // Mock data for development/fallback
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
      <div ref={sectionRef} className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 border border-gray-700/50">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sectors.map((sector, index) => (
        <div 
          key={sector.name || index}
          className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 border border-gray-700/50 transition-all hover:border-gray-600/70 hover:shadow-lg hover:shadow-blue-900/10"
        >
          <h3 className="font-medium text-gray-300 mb-1 text-sm">{sector.name}</h3>
          <div className={`flex items-center font-semibold text-lg ${sector.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {sector.changePercent >= 0 ? (
              <ArrowUp className="w-4 h-4 mr-1" />
            ) : (
              <ArrowDown className="w-4 h-4 mr-1" />
            )}
            {Math.abs(sector.changePercent).toFixed(2)}%
          </div>
        </div>
      ))}
    </div>
  );
}
