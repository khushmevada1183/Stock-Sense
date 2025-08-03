"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Leaf, 
  Users, 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  Award,
  AlertTriangle,
  CheckCircle,
  Target,
  Globe,
  Heart,
  Scale
} from 'lucide-react';

interface ESGScore {
  category: 'Environmental' | 'Social' | 'Governance';
  score: number;
  maxScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  trend: 'improving' | 'stable' | 'declining';
  description: string;
}

interface ESGInitiative {
  title: string;
  category: 'Environmental' | 'Social' | 'Governance';
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  status: 'Completed' | 'In Progress' | 'Planned';
  timeline: string;
}

interface ESGRisk {
  factor: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  impact: string;
  mitigation: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

interface ESGComparison {
  company: string;
  overallScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  isCurrentCompany?: boolean;
}

interface ESGMetricsProps {
  symbol: string;
  companyName: string;
  industry: string;
}

const ESGMetrics: React.FC<ESGMetricsProps> = ({ 
  symbol, 
  companyName, 
  industry 
}) => {
  const [esgScores, setESGScores] = useState<ESGScore[]>([]);
  const [initiatives, setInitiatives] = useState<ESGInitiative[]>([]);
  const [risks, setRisks] = useState<ESGRisk[]>([]);
  const [industryComparison, setIndustryComparison] = useState<ESGComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchESGData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock ESG scores
      setESGScores([
        {
          category: 'Environmental',
          score: 78,
          maxScore: 100,
          grade: 'B+',
          trend: 'improving',
          description: 'Strong commitment to renewable energy and carbon reduction'
        },
        {
          category: 'Social',
          score: 85,
          maxScore: 100,
          grade: 'A',
          trend: 'stable',
          description: 'Excellent employee welfare and community engagement'
        },
        {
          category: 'Governance',
          score: 72,
          maxScore: 100,
          grade: 'B',
          trend: 'improving',
          description: 'Good board structure with room for improvement in transparency'
        }
      ]);

      // Mock initiatives
      setInitiatives([
        {
          title: 'Carbon Neutral by 2030',
          category: 'Environmental',
          description: 'Comprehensive plan to achieve net-zero carbon emissions across all operations',
          impact: 'High',
          status: 'In Progress',
          timeline: '2025-2030'
        },
        {
          title: 'Employee Diversity Program',
          category: 'Social',
          description: 'Initiative to increase workplace diversity and inclusion',
          impact: 'Medium',
          status: 'In Progress',
          timeline: '2024-2026'
        },
        {
          title: 'Board Independence Enhancement',
          category: 'Governance',
          description: 'Increasing the proportion of independent directors',
          impact: 'Medium',
          status: 'Completed',
          timeline: '2024'
        }
      ]);

      // Mock risks
      setRisks([
        {
          factor: 'Climate Change Impact',
          riskLevel: 'Medium',
          impact: 'Supply chain disruptions due to extreme weather events',
          mitigation: 'Diversifying suppliers and implementing climate-resilient practices',
          trend: 'stable'
        },
        {
          factor: 'Regulatory Compliance',
          riskLevel: 'Low',
          impact: 'Changes in environmental regulations',
          mitigation: 'Proactive compliance monitoring and adaptation strategies',
          trend: 'decreasing'
        }
      ]);

      // Mock industry comparison
      setIndustryComparison([
        { company: companyName, overallScore: 78, environmentalScore: 78, socialScore: 85, governanceScore: 72, isCurrentCompany: true },
        { company: 'Industry Leader', overallScore: 89, environmentalScore: 92, socialScore: 88, governanceScore: 87 },
        { company: 'Competitor A', overallScore: 75, environmentalScore: 70, socialScore: 80, governanceScore: 76 },
        { company: 'Competitor B', overallScore: 71, environmentalScore: 68, socialScore: 75, governanceScore: 70 },
        { company: 'Industry Average', overallScore: 68, environmentalScore: 65, socialScore: 70, governanceScore: 69 }
      ]);

      setLoading(false);
    };

    fetchESGData();
  }, [symbol, companyName]);

  // Animation effect
  useEffect(() => {
    if (!loading && containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.esg-card');
      
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

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (grade.startsWith('B')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (grade.startsWith('C')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'declining':
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Target className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Environmental':
        return <Leaf className="h-5 w-5 text-green-400" />;
      case 'Social':
        return <Heart className="h-5 w-5 text-blue-400" />;
      case 'Governance':
        return <Scale className="h-5 w-5 text-purple-400" />;
      default:
        return <Shield className="h-5 w-5 text-gray-400" />;
    }
  };

  const getRiskLevelColor = (level: string): string => {
    switch (level) {
      case 'High':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'In Progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Planned':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        <span className="ml-2 text-gray-400">Loading ESG metrics...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ESG Overview Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {esgScores.map((score, index) => (
          <Card key={index} className="esg-card bg-gray-900/90 backdrop-blur-lg border-gray-700/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                {getCategoryIcon(score.category)}
                {score.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                    {score.score}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg border text-sm font-medium ${getGradeColor(score.grade)}`}>
                      {score.grade}
                    </span>
                    {getTrendIcon(score.trend)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                  />
                </div>
                
                <p className="text-gray-300 text-sm">{score.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ESG Initiatives */}
      <Card className="esg-card bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            ESG Initiatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initiatives.map((initiative, index) => (
              <div key={index} className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(initiative.category)}
                    <h3 className="font-semibold text-white">{initiative.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(initiative.status)}`}>
                      {initiative.status}
                    </span>
                    <span className="text-xs text-gray-400">{initiative.timeline}</span>
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{initiative.description}</p>
                
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">Impact:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    initiative.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                    initiative.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {initiative.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ESG Risks */}
      <Card className="esg-card bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            ESG Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risks.map((risk, index) => (
              <div key={index} className="bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 border border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-white">{risk.factor}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg border text-xs font-medium ${getRiskLevelColor(risk.riskLevel)}`}>
                      {risk.riskLevel} Risk
                    </span>
                    {getTrendIcon(risk.trend)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-400">Impact: </span>
                    <span className="text-gray-300 text-sm">{risk.impact}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Mitigation: </span>
                    <span className="text-gray-300 text-sm">{risk.mitigation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Comparison */}
      <Card className="esg-card bg-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            Industry ESG Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {industryComparison.map((company, index) => (
              <div 
                key={index} 
                className={`bg-gray-900/90 backdrop-blur-lg rounded-lg p-4 border ${
                  company.isCurrentCompany ? 'border-indigo-500' : 'border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{company.company}</h3>
                    {company.isCurrentCompany && (
                      <CheckCircle className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                  <span className={`text-lg font-bold ${getScoreColor(company.overallScore)}`}>
                    {company.overallScore}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-gray-400">Environmental</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getScoreColor(company.environmentalScore)}`}>
                        {company.environmentalScore}
                      </span>
                      <div className="flex-1 bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full"
                          style={{ width: `${company.environmentalScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-400">Social</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getScoreColor(company.socialScore)}`}>
                        {company.socialScore}
                      </span>
                      <div className="flex-1 bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${company.socialScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-gray-400">Governance</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${getScoreColor(company.governanceScore)}`}>
                        {company.governanceScore}
                      </span>
                      <div className="flex-1 bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-purple-500 h-1 rounded-full"
                          style={{ width: `${company.governanceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ESGMetrics;
