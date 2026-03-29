"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Activity,
  Zap,
  Globe,
  Shield
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
      // Simulate API call - replace with actual industry analysis APIs
      const mockMetrics: IndustryMetric[] = [
        {
          name: 'Industry P/E Ratio',
          value: 24.5,
          unit: 'x',
          change: 1.2,
          rank: 3,
          description: 'Price-to-earnings ratio compared to broader market'
        },
        {
          name: 'Revenue Growth Rate',
          value: 18.2,
          unit: '%',
          change: 2.1,
          rank: 2,
          description: 'Year-over-year revenue growth for the industry'
        },
        {
          name: 'Market Concentration',
          value: 42.8,
          unit: '%',
          change: -1.5,
          rank: 4,
          description: 'Market share held by top 5 players'
        },
        {
          name: 'Innovation Index',
          value: 76.5,
          unit: '/100',
          change: 3.2,
          rank: 1,
          description: 'R&D spending and patent filings relative to revenue'
        },
        {
          name: 'Profit Margins',
          value: 14.8,
          unit: '%',
          change: 0.8,
          rank: 2,
          description: 'Average net profit margins across industry'
        },
        {
          name: 'Export Dependency',
          value: 68.5,
          unit: '%',
          change: -2.1,
          rank: 1,
          description: 'Percentage of revenue from export markets'
        }
      ];

      const mockCompetitors: CompetitorData[] = [
        {
          name: 'TCS',
          marketCap: 1250000,
          peRatio: 26.8,
          revenue: 256000,
          marketShare: 4.2,
          rank: 1
        },
        {
          name: 'Infosys',
          marketCap: 850000,
          peRatio: 24.1,
          revenue: 189000,
          marketShare: 3.1,
          rank: 2
        },
        {
          name: 'Wipro',
          marketCap: 420000,
          peRatio: 22.5,
          revenue: 105000,
          marketShare: 1.7,
          rank: 3
        },
        {
          name: 'HCL Tech',
          marketCap: 380000,
          peRatio: 19.8,
          revenue: 128000,
          marketShare: 2.1,
          rank: 4
        },
        {
          name: 'Tech Mahindra',
          marketCap: 180000,
          peRatio: 21.2,
          revenue: 68000,
          marketShare: 1.1,
          rank: 5
        }
      ];

      const mockTrends: IndustryTrend[] = [
        {
          trend: 'AI & Machine Learning Adoption',
          impact: 'positive',
          timeframe: '2024-2026',
          description: 'Increased demand for AI/ML services driving revenue growth and margin expansion'
        },
        {
          trend: 'Digital Transformation Acceleration',
          impact: 'positive',
          timeframe: '2024-2025',
          description: 'Post-pandemic digital initiatives continue to drive outsourcing demand'
        },
        {
          trend: 'Geopolitical Uncertainties',
          impact: 'negative',
          timeframe: '2024',
          description: 'Trade tensions and visa restrictions affecting business operations'
        },
        {
          trend: 'Cloud Migration',
          impact: 'positive',
          timeframe: '2024-2027',
          description: 'Enterprise cloud adoption creating new service opportunities'
        },
        {
          trend: 'Talent Cost Inflation',
          impact: 'negative',
          timeframe: '2024-2025',
          description: 'Rising employee costs pressuring profit margins'
        },
        {
          trend: 'ESG Compliance Requirements',
          impact: 'neutral',
          timeframe: '2024-2026',
          description: 'Increasing focus on sustainability and governance standards'
        }
      ];

      setIndustryMetrics(mockMetrics);
      setCompetitors(mockCompetitors);
      setTrends(mockTrends);
    } catch (error) {
      logger.error('Error fetching industry data:', error);
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
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
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
            {industryMetrics.map((metric, index) => (
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
                  {metric.change > 0 ? <ArrowUp className="w-3 h-3" /> :
                   metric.change < 0 ? <ArrowDown className="w-3 h-3" /> :
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
        </CardContent>
      </Card>

      {/* Industry Trends */}
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

      {/* Sector Performance */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-400" />
            Sector Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-green-400 text-2xl font-bold mb-1">+18.5%</div>
              <div className="text-gray-400 text-sm">YTD Performance</div>
              <div className="text-xs text-gray-500 mt-1">vs Market: +12.3%</div>
            </div>
            
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-cyan-400 text-2xl font-bold mb-1">1.2x</div>
              <div className="text-gray-400 text-sm">Beta vs Market</div>
              <div className="text-xs text-gray-500 mt-1">Moderate volatility</div>
            </div>
            
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-yellow-400 text-2xl font-bold mb-1">Rs 4.2L Cr</div>
              <div className="text-gray-400 text-sm">Total Market Cap</div>
              <div className="text-xs text-gray-500 mt-1">15% of IT sector</div>
            </div>
          </div>

          {/* Key Drivers */}
          <div className="mt-6">
            <h4 className="text-white font-medium mb-3">Key Performance Drivers</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Strong demand for digital transformation services</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">Expansion in North American and European markets</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Increased focus on cybersecurity and compliance</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Strategic acquisitions to enhance capabilities</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-neon-400" />
            Industry Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-3">Key Risks</h4>
              <div className="space-y-2">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="font-medium text-red-400 text-sm">High</div>
                  <div className="text-gray-300 text-sm">Currency volatility impact</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <div className="font-medium text-yellow-400 text-sm">Medium</div>
                  <div className="text-gray-300 text-sm">Regulatory changes in key markets</div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="font-medium text-orange-400 text-sm">Medium</div>
                  <div className="text-gray-300 text-sm">Talent retention challenges</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-3">Opportunities</h4>
              <div className="space-y-2">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="font-medium text-green-400 text-sm">High</div>
                  <div className="text-gray-300 text-sm">AI and automation services</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <div className="font-medium text-neon-400 text-sm">High</div>
                  <div className="text-gray-300 text-sm">Cloud migration projects</div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                  <div className="font-medium text-purple-400 text-sm">Medium</div>
                  <div className="text-gray-300 text-sm">Emerging market expansion</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustryAnalysis;
