"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Globe,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  Star,
  Rocket,
  Brain
} from 'lucide-react';

interface GrowthDriver {
  category: 'Revenue' | 'Market Expansion' | 'Innovation' | 'Efficiency' | 'Strategic';
  name: string;
  impact: 'High' | 'Medium' | 'Low';
  timeline: '1-2 years' | '2-5 years' | '5+ years';
  description: string;
  probability: number;
  estimatedContribution: number;
}

interface MarketOpportunity {
  market: string;
  size: number;
  growth: number;
  penetration: number;
  potential: number;
  timeline: string;
  barriers: string[];
  advantages: string[];
}

interface GrowthProjection {
  metric: string;
  current: number;
  year1: number;
  year3: number;
  year5: number;
  unit: string;
  confidence: 'High' | 'Medium' | 'Low';
}

interface Innovation {
  title: string;
  stage: 'Research' | 'Development' | 'Testing' | 'Launch' | 'Scaling';
  category: 'Product' | 'Technology' | 'Process' | 'Business Model';
  impact: 'Transformative' | 'Significant' | 'Moderate' | 'Incremental';
  timeline: string;
  description: string;
  marketPotential: number;
}

interface CompetitiveAdvantage {
  factor: string;
  strength: 'Very Strong' | 'Strong' | 'Moderate' | 'Weak';
  sustainability: 'High' | 'Medium' | 'Low';
  description: string;
  threats: string[];
}

interface FutureGrowthPotentialProps {
  symbol: string;
  companyName: string;
  industry: string;
  currentRevenue?: number;
}

const FutureGrowthPotential: React.FC<FutureGrowthPotentialProps> = ({ 
  symbol, 
  companyName, 
  industry, 
  currentRevenue = 0 
}) => {
  const [growthDrivers, setGrowthDrivers] = useState<GrowthDriver[]>([]);
  const [marketOpportunities, setMarketOpportunities] = useState<MarketOpportunity[]>([]);
  const [growthProjections, setGrowthProjections] = useState<GrowthProjection[]>([]);
  const [innovations, setInnovations] = useState<Innovation[]>([]);
  const [competitiveAdvantages, setCompetitiveAdvantages] = useState<CompetitiveAdvantage[]>([]);
  const [overallGrowthScore, setOverallGrowthScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchGrowthData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock growth drivers
      setGrowthDrivers([
        {
          category: 'Revenue',
          name: 'Digital Transformation',
          impact: 'High',
          timeline: '2-5 years',
          description: 'Expansion of digital services and platform offerings',
          probability: 85,
          estimatedContribution: 25
        },
        {
          category: 'Market Expansion',
          name: 'International Markets',
          impact: 'High',
          timeline: '2-5 years',
          description: 'Entry into emerging markets with high growth potential',
          probability: 70,
          estimatedContribution: 30
        },
        {
          category: 'Innovation',
          name: 'AI Integration',
          impact: 'Medium',
          timeline: '1-2 years',
          description: 'Implementation of AI solutions across operations',
          probability: 80,
          estimatedContribution: 15
        },
        {
          category: 'Efficiency',
          name: 'Automation Initiative',
          impact: 'Medium',
          timeline: '1-2 years',
          description: 'Process automation to reduce costs and improve margins',
          probability: 90,
          estimatedContribution: 12
        }
      ]);

      // Mock market opportunities
      setMarketOpportunities([
        {
          market: 'Electric Vehicles',
          size: 1200000,
          growth: 22.5,
          penetration: 3.2,
          potential: 380000,
          timeline: '3-7 years',
          barriers: ['High capital investment', 'Infrastructure development'],
          advantages: ['First mover advantage', 'Strong R&D capabilities']
        },
        {
          market: 'Renewable Energy',
          size: 850000,
          growth: 18.3,
          penetration: 8.7,
          potential: 156000,
          timeline: '2-5 years',
          barriers: ['Regulatory approval', 'Technology adaptation'],
          advantages: ['Government support', 'Existing partnerships']
        }
      ]);

      // Mock growth projections
      setGrowthProjections([
        {
          metric: 'Revenue',
          current: 1000,
          year1: 1150,
          year3: 1450,
          year5: 1800,
          unit: '₹ Cr',
          confidence: 'High'
        },
        {
          metric: 'EBITDA Margin',
          current: 18.5,
          year1: 20.2,
          year3: 23.8,
          year5: 26.5,
          unit: '%',
          confidence: 'Medium'
        },
        {
          metric: 'Market Share',
          current: 12.3,
          year1: 13.8,
          year3: 16.5,
          year5: 20.2,
          unit: '%',
          confidence: 'Medium'
        },
        {
          metric: 'ROE',
          current: 15.2,
          year1: 17.5,
          year3: 21.3,
          year5: 24.8,
          unit: '%',
          confidence: 'High'
        }
      ]);

      // Mock innovations
      setInnovations([
        {
          title: 'Next-Gen Platform',
          stage: 'Development',
          category: 'Technology',
          impact: 'Transformative',
          timeline: '18 months',
          description: 'Revolutionary platform leveraging AI and machine learning',
          marketPotential: 500
        },
        {
          title: 'Sustainable Manufacturing',
          stage: 'Testing',
          category: 'Process',
          impact: 'Significant',
          timeline: '12 months',
          description: 'Green manufacturing processes reducing environmental impact',
          marketPotential: 200
        }
      ]);

      // Mock competitive advantages
      setCompetitiveAdvantages([
        {
          factor: 'Technology Leadership',
          strength: 'Very Strong',
          sustainability: 'High',
          description: 'Leading-edge technology stack and innovation capabilities',
          threats: ['Fast-moving competitors', 'Technology disruption']
        },
        {
          factor: 'Brand Recognition',
          strength: 'Strong',
          sustainability: 'High',
          description: 'Strong brand presence and customer loyalty',
          threats: ['New market entrants', 'Changing consumer preferences']
        },
        {
          factor: 'Market Position',
          strength: 'Strong',
          sustainability: 'Medium',
          description: 'Dominant position in key market segments',
          threats: ['Market consolidation', 'Regulatory changes']
        }
      ]);

      // Calculate overall growth score
      const avgProbability = growthDrivers.reduce((sum, driver) => sum + driver.probability, 0) / growthDrivers.length;
      const avgContribution = growthDrivers.reduce((sum, driver) => sum + driver.estimatedContribution, 0) / growthDrivers.length;
      setOverallGrowthScore((avgProbability + avgContribution * 2) / 3);

      setLoading(false);
    };

    fetchGrowthData();
  }, [symbol]);

  // Animation effect
  useEffect(() => {
    if (!loading && containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.growth-card');
      
      gsap.fromTo(cards, {
        y: 30,
        opacity: 0
      }, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out"
      });
    }
  }, [loading]);

  const getImpactColor = (impact: string): string => {
    switch (impact) {
      case 'High':
      case 'Transformative':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
      case 'Significant':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
      case 'Moderate':
      case 'Incremental':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'Very Strong':
        return 'text-green-500';
      case 'Strong':
        return 'text-green-400';
      case 'Moderate':
        return 'text-yellow-400';
      case 'Weak':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Revenue':
        return <BarChart3 className="h-4 w-4" />;
      case 'Market Expansion':
        return <Globe className="h-4 w-4" />;
      case 'Innovation':
        return <Lightbulb className="h-4 w-4" />;
      case 'Efficiency':
        return <Activity className="h-4 w-4" />;
      case 'Strategic':
        return <Target className="h-4 w-4" />;
      case 'Technology':
        return <Brain className="h-4 w-4" />;
      case 'Product':
        return <Star className="h-4 w-4" />;
      case 'Process':
        return <Zap className="h-4 w-4" />;
      case 'Business Model':
        return <Rocket className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'Research':
        return 'bg-cyan-500/10 text-cyan-400 border-blue-500/30';
      case 'Development':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Testing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Launch':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Scaling':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConfidenceColor = (confidence: string): string => {
    switch (confidence) {
      case 'High':
        return 'text-green-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Low':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatNumber = (num: number, unit: string): string => {
    if (unit === '₹ Cr' && num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}K Cr`;
    }
    return `${num}${unit}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        <span className="ml-2 text-gray-400">Analyzing growth potential...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Growth Potential Overview */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-neon-400" />
            Growth Potential Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-neon-400 mb-2">
                {overallGrowthScore.toFixed(0)}/100
              </div>
              <div className="text-sm text-gray-400">Growth Score</div>
            </div>
            
            <div className="col-span-2">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Growth Outlook</h3>
                <p className="text-gray-300 text-sm">
                  {companyName} shows strong growth potential driven by digital transformation, 
                  market expansion, and innovation initiatives. Multiple growth drivers present 
                  significant opportunities for revenue and market share expansion.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Analysis Date: {new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Forecast Horizon: 5 Years</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Drivers */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Key Growth Drivers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {growthDrivers.map((driver, index) => (
              <div key={index} className="glass-card rounded-xl p-4 border border-gray-800/30">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 glass-card rounded-xl">
                      {getCategoryIcon(driver.category)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{driver.name}</h3>
                      <span className="text-xs text-gray-400">{driver.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getImpactColor(driver.impact)}`}>
                      {driver.impact} Impact
                    </span>
                    <span className="text-sm font-bold text-white">{driver.estimatedContribution}%</span>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{driver.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400">Timeline:</span>
                    <span className="ml-1 text-white">{driver.timeline}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Probability:</span>
                    <span className="ml-1 text-white">{driver.probability}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Contribution:</span>
                    <span className="ml-1 text-white">{driver.estimatedContribution}%</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="w-full bg-gray-800/60 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${driver.probability}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Projections */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            Growth Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/30">
                  <th className="text-left py-2 text-gray-400">Metric</th>
                  <th className="text-right py-2 text-gray-400">Current</th>
                  <th className="text-right py-2 text-gray-400">Year 1</th>
                  <th className="text-right py-2 text-gray-400">Year 3</th>
                  <th className="text-right py-2 text-gray-400">Year 5</th>
                  <th className="text-center py-2 text-gray-400">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {growthProjections.map((projection, index) => (
                  <tr key={index} className="border-b border-gray-800/30/50">
                    <td className="py-3 text-white font-medium">{projection.metric}</td>
                    <td className="py-3 text-right text-gray-300">
                      {formatNumber(projection.current, projection.unit)}
                    </td>
                    <td className="py-3 text-right text-white">
                      {formatNumber(projection.year1, projection.unit)}
                      <div className="text-xs text-green-400">
                        +{(((projection.year1 - projection.current) / projection.current) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-3 text-right text-white">
                      {formatNumber(projection.year3, projection.unit)}
                      <div className="text-xs text-green-400">
                        +{(((projection.year3 - projection.current) / projection.current) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-3 text-right text-white">
                      {formatNumber(projection.year5, projection.unit)}
                      <div className="text-xs text-green-400">
                        +{(((projection.year5 - projection.current) / projection.current) * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(projection.confidence)}`}>
                        {projection.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Opportunities & Innovation Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-400" />
              Market Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketOpportunities.map((opportunity, index) => (
                <div key={index} className="glass-card rounded-xl p-4 border border-gray-800/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{opportunity.market}</h3>
                    <span className="text-lg font-bold text-purple-400">
                      ₹{(opportunity.potential / 1000).toFixed(0)}K Cr
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                    <div>
                      <span className="text-gray-400">Market Size:</span>
                      <span className="ml-1 text-white">₹{(opportunity.size / 1000).toFixed(0)}K Cr</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Growth Rate:</span>
                      <span className="ml-1 text-green-400">{opportunity.growth}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Current Penetration:</span>
                      <span className="ml-1 text-white">{opportunity.penetration}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Timeline:</span>
                      <span className="ml-1 text-white">{opportunity.timeline}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-400">Advantages:</span>
                      {opportunity.advantages.map((advantage, idx) => (
                        <div key={idx} className="text-xs text-green-400 flex items-center gap-1 ml-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          {advantage}
                        </div>
                      ))}
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Barriers:</span>
                      {opportunity.barriers.map((barrier, idx) => (
                        <div key={idx} className="text-xs text-red-400 flex items-center gap-1 ml-2">
                          <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                          {barrier}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-400" />
              Innovation Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {innovations.map((innovation, index) => (
                <div key={index} className="glass-card rounded-xl p-4 border border-gray-800/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(innovation.category)}
                      <div>
                        <h3 className="font-semibold text-white">{innovation.title}</h3>
                        <span className="text-xs text-gray-400">{innovation.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getStageColor(innovation.stage)}`}>
                        {innovation.stage}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">{innovation.timeline}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{innovation.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getImpactColor(innovation.impact)}`}>
                      {innovation.impact}
                    </span>
                    <span className="text-sm font-bold text-yellow-400">
                      ₹{innovation.marketPotential} Cr potential
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Advantages */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-400" />
            Competitive Advantages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {competitiveAdvantages.map((advantage, index) => (
              <div key={index} className="glass-card rounded-xl p-4 border border-gray-800/30">
                <div className="mb-3">
                  <h3 className="font-semibold text-white mb-1">{advantage.factor}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getStrengthColor(advantage.strength)}`}>
                      {advantage.strength}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`text-xs ${
                      advantage.sustainability === 'High' ? 'text-green-400' :
                      advantage.sustainability === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {advantage.sustainability} Sustainability
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{advantage.description}</p>
                
                <div>
                  <span className="text-xs text-gray-400">Key Threats:</span>
                  {advantage.threats.map((threat, idx) => (
                    <div key={idx} className="text-xs text-red-400 flex items-center gap-1 ml-2">
                      <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                      {threat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FutureGrowthPotential;
