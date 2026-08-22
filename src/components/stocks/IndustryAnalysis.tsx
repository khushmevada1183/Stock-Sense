"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { getStockPeers } from '@/api/api';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Activity,
} from 'lucide-react';

interface IndustryMetric {
  name: string;
  value: number;
  unit: string;
  change: number;
  rank: number;
  description: string;
}

interface CompetitorData {
  name: string;
  marketCap: number;
  peRatio: number;
  revenue: number;
  marketShare: number;
  rank: number;
}

interface IndustryTrend {
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  timeframe: string;
  description: string;
}

interface IndustryAnalysisProps {
  symbol: string;
  sector: string;
  industry: string;
}

const IndustryAnalysis: React.FC<IndustryAnalysisProps> = ({ 
  symbol, 
  sector = "Technology", 
  industry = "Software Services" 
}) => {
  const [industryMetrics, setIndustryMetrics] = useState<IndustryMetric[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorData[]>([]);
  const [trends, setTrends] = useState<IndustryTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchIndustryData();
  }, [symbol, sector, industry]);

  const fetchIndustryData = async () => {
    setLoading(true);
    try {
      const payload = await getStockPeers(symbol);
      const data = payload as {
        sector?: string;
        industry?: string;
        peers?: Record<string, unknown>[];
        count?: number;
      };

      const resolvedSector = data.sector && data.sector !== 'UNKNOWN' ? data.sector : (sector !== 'UNKNOWN' && sector !== 'N/A' ? sector : '');
      const resolvedIndustry = data.industry && data.industry !== 'UNKNOWN' ? data.industry : (industry !== 'UNKNOWN' && industry !== 'N/A' ? industry : '');

      const metrics: IndustryMetric[] = [];
      if (resolvedSector) {
        metrics.push({
          name: 'Sector',
          value: 0,
          unit: '',
          change: 0,
          rank: 0,
          description: resolvedSector,
        });
      }
      if (resolvedIndustry) {
        metrics.push({
          name: 'Industry',
          value: 0,
          unit: '',
          change: 0,
          rank: 0,
          description: resolvedIndustry,
        });
      }
      metrics.push({
        name: 'Peer Count',
        value: data.count ?? data.peers?.length ?? 0,
        unit: '',
        change: 0,
        rank: 0,
        description: 'Comparable companies in the same sector taxonomy',
      });

      const mappedCompetitors: CompetitorData[] = (data.peers ?? []).slice(0, 10).map((peer, index) => ({
        name: String(peer.companyName ?? peer.symbol ?? `Peer ${index + 1}`),
        marketCap: Number(peer.marketCap ?? 0),
        peRatio: Number(peer.peRatio ?? peer.pe ?? 0),
        revenue: Number(peer.revenue ?? 0),
        marketShare: Number(peer.marketShare ?? 0),
        rank: index + 1,
      }));

      setIndustryMetrics(metrics);
      setCompetitors(mappedCompetitors);
      setTrends([]);
    } catch (error) {
      logger.error('Error fetching industry data:', error);
      setIndustryMetrics([]);
      setCompetitors([]);
      setTrends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !containerRef.current) return;

    const elements = Array.from(containerRef.current.children);
    if (!elements.length) return;

    gsap.killTweensOf(elements);
    gsap.set(elements, { clearProps: 'opacity,transform,filter' });

    const tween = gsap.fromTo(
      elements,
      { y: 20 },
      {
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: "auto"
      }
    );

    return () => {
      tween.kill();
      gsap.set(elements, { clearProps: 'opacity,transform,filter' });
    };
  }, [loading]);

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'negative': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getRankBadge = (rank: number) => {
    const colors = [
      'bg-yellow-500/20 text-yellow-400', // 1st - Gold
      'bg-gray-400/20 text-gray-300',     // 2nd - Silver
      'bg-orange-500/20 text-orange-400', // 3rd - Bronze
      'bg-cyan-500/10 text-cyan-400',     // 4th+
      'bg-purple-500/20 text-purple-400'  // 5th+
    ];
    return colors[Math.min(rank - 1, colors.length - 1)];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} glass>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-800/60 rounded shimmer w-1/4"></div>
                <div className="h-32 bg-gray-800/60 rounded shimmer"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Industry Overview */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neon-400" />
            {industry} Industry Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industryMetrics.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No sector taxonomy available from the API for this symbol.</p>
            ) : industryMetrics.map((metric, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium text-sm">{metric.name}</h4>
                  <div className={`px-2 py-1 rounded text-xs ${getRankBadge(metric.rank)}`}>
                    #{metric.rank}
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-white">{metric.value}</span>
                  <span className="text-gray-400 text-sm">{metric.unit}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  metric.change > 0 ? 'text-green-400' : 
                  metric.change < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {metric.change > 0 ? <span className="font-semibold leading-none">+</span> :
                   metric.change < 0 ? <span className="font-semibold leading-none">-</span> :
                   <Activity className="w-3 h-3" />}
                  <span>{Math.abs(metric.change)}{metric.unit}</span>
                </div>
                <p className="text-gray-400 text-xs mt-2">{metric.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitive Landscape */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-neon-400" />
            Competitive Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          {competitors.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No peer companies returned from the API for this symbol.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800/30">
                  <th className="text-left text-gray-400 font-medium py-3">Rank</th>
                  <th className="text-left text-gray-400 font-medium py-3">Company</th>
                  <th className="text-right text-gray-400 font-medium py-3">Market Cap</th>
                  <th className="text-right text-gray-400 font-medium py-3">P/E Ratio</th>
                  <th className="text-right text-gray-400 font-medium py-3">Revenue</th>
                  <th className="text-right text-gray-400 font-medium py-3">Market Share</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor, index) => (
                  <tr key={index} className="border-b border-gray-800/30 hover:bg-gray-700/30">
                    <td className="py-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadge(competitor.rank)}`}>
                        {competitor.rank}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-white font-medium">{competitor.name}</div>
                    </td>
                    <td className="py-3 text-right text-white">
                      ₹{(competitor.marketCap / 1000).toFixed(0)}K Cr
                    </td>
                    <td className="py-3 text-right text-white">
                      {competitor.peRatio.toFixed(1)}x
                    </td>
                    <td className="py-3 text-right text-white">
                      ₹{(competitor.revenue / 1000).toFixed(0)}K Cr
                    </td>
                    <td className="py-3 text-right text-white">
                      {competitor.marketShare.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>

      {trends.length > 0 && (
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-neon-400" />
            Industry Trends & Outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div key={index} className={`border rounded-lg p-4 ${getImpactColor(trend.impact)}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{trend.trend}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-black/20 rounded">
                      {trend.timeframe}
                    </span>
                    {trend.impact === 'positive' && <TrendingUp className="w-4 h-4" />}
                    {trend.impact === 'negative' && <TrendingDown className="w-4 h-4" />}
                    {trend.impact === 'neutral' && <Activity className="w-4 h-4" />}
                  </div>
                </div>
                <p className="text-sm opacity-90">{trend.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
};

export default IndustryAnalysis;
