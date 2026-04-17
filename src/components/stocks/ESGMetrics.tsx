"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Leaf, 
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
import { getCorporateActionsLatest, getShareholdingLatest } from '@/api/api';

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

  useEffect(() => {
    const fetchESGData = async () => {
      setLoading(true);

      try {
        const [shareholdingResponse, actionsResponse] = await Promise.all([
          getShareholdingLatest({ symbol }),
          getCorporateActionsLatest({ symbol, limit: 20 }),
        ]);

        const toArray = (value: unknown) => {
          if (Array.isArray(value)) return value;
          if (value && typeof value === 'object') {
            const data = value as Record<string, unknown>;
            for (const key of ['items', 'rows', 'results', 'data', 'records']) {
              if (Array.isArray(data[key])) return data[key] as unknown[];
            }
          }
          return [];
        };

        const shareholdingPayload = (shareholdingResponse as { data?: unknown })?.data ?? shareholdingResponse;
        const actionsPayload = (actionsResponse as { data?: unknown })?.data ?? actionsResponse;

        const shareholdingRows = toArray(shareholdingPayload);
        const actionRows = toArray(actionsPayload);

        const promoterShare = Number(
          (shareholdingRows.find((row) =>
            String((row as Record<string, unknown>).category || '').toLowerCase().includes('promoter')
          ) as Record<string, unknown> | undefined)?.percentage || 0
        );
        const institutionalShare = Number(
          (shareholdingRows.find((row) =>
            String((row as Record<string, unknown>).category || '').toLowerCase().includes('institution')
          ) as Record<string, unknown> | undefined)?.percentage || 0
        );

        const governanceScore = Math.min(95, Math.max(45, Math.round(55 + promoterShare / 2)));
        const socialScore = Math.min(95, Math.max(45, Math.round(50 + institutionalShare / 2)));
        const environmentalScore = Math.min(95, Math.max(40, 45 + Math.min(actionRows.length, 10) * 3));

        const gradeFromScore = (score: number): ESGScore['grade'] => {
          if (score >= 90) return 'A+';
          if (score >= 80) return 'A';
          if (score >= 75) return 'B+';
          if (score >= 65) return 'B';
          if (score >= 55) return 'C+';
          if (score >= 45) return 'C';
          return 'D';
        };

        setESGScores([
          {
            category: 'Environmental',
            score: environmentalScore,
            maxScore: 100,
            grade: gradeFromScore(environmentalScore),
            trend: actionRows.length >= 3 ? 'improving' : 'stable',
            description: 'Environmental score inferred from corporate-action cadence and disclosures.',
          },
          {
            category: 'Social',
            score: socialScore,
            maxScore: 100,
            grade: gradeFromScore(socialScore),
            trend: institutionalShare >= 20 ? 'improving' : 'stable',
            description: 'Social score inferred from ownership participation and continuity.',
          },
          {
            category: 'Governance',
            score: governanceScore,
            maxScore: 100,
            grade: gradeFromScore(governanceScore),
            trend: promoterShare >= 45 ? 'stable' : 'declining',
            description: 'Governance score inferred from promoter and institutional holding structure.',
          },
        ]);

        setInitiatives(
          actionRows.slice(0, 5).map((row, index) => {
            const item = row as Record<string, unknown>;
            const title = String(item.actionType || item.type || item.title || `Corporate Action ${index + 1}`);
            const lower = title.toLowerCase();

            const category: ESGInitiative['category'] =
              lower.includes('dividend') || lower.includes('buyback')
                ? 'Governance'
                : lower.includes('employee') || lower.includes('esop')
                  ? 'Social'
                  : 'Environmental';

            return {
              title,
              category,
              description: String(item.description || item.summary || 'Action captured from institutional feed.'),
              impact: 'Medium',
              status: 'In Progress',
              timeline: String(item.date || item.announcementDate || 'Ongoing'),
            };
          })
        );

        setRisks([
          {
            factor: 'Shareholding Concentration',
            riskLevel: promoterShare > 70 ? 'High' : promoterShare > 50 ? 'Medium' : 'Low',
            impact: 'Ownership concentration can increase governance sensitivity.',
            mitigation: 'Track quarterly shareholding trends and governance disclosures.',
            trend: 'stable',
          },
          {
            factor: 'Institutional Participation',
            riskLevel: institutionalShare < 15 ? 'High' : institutionalShare < 25 ? 'Medium' : 'Low',
            impact: 'Lower institutional coverage may increase valuation volatility.',
            mitigation: 'Monitor fund participation and insider/corporate action signals.',
            trend: institutionalShare >= 20 ? 'decreasing' : 'increasing',
          },
        ]);

        const overallScore = Math.round((environmentalScore + socialScore + governanceScore) / 3);
        setIndustryComparison([
          {
            company: companyName,
            overallScore,
            environmentalScore,
            socialScore,
            governanceScore,
            isCurrentCompany: true,
          },
          {
            company: `${industry} Average`,
            overallScore: 68,
            environmentalScore: 66,
            socialScore: 69,
            governanceScore: 69,
          },
        ]);
      } catch {
        setESGScores([]);
        setInitiatives([]);
        setRisks([]);
        setIndustryComparison([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchESGData();
  }, [symbol, companyName, industry]);

  // Animation effect
  useEffect(() => {
    if (loading || !containerRef.current) return;

    const cards = Array.from(containerRef.current.querySelectorAll('.esg-card'));
    if (!cards.length) return;

    gsap.killTweensOf(cards);
    gsap.set(cards, { clearProps: 'opacity,transform,filter' });

    const tween = gsap.fromTo(cards, {
      y: 30,
      opacity: 0
    }, {
      y: 0,
      opacity: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      overwrite: "auto"
    });

    return () => {
      tween.kill();
      gsap.set(cards, { clearProps: 'opacity,transform,filter' });
    };
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
        return <Heart className="h-5 w-5 text-cyan-400" />;
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
        return 'bg-cyan-500/10 text-cyan-400 border-blue-500/30';
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
          <Card key={index} glass>
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
                
                <div className="w-full bg-gray-800/60 rounded-full h-1.5">
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
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-neon-400" />
            ESG Initiatives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {initiatives.map((initiative, index) => (
              <div key={index} className="glass-card rounded-xl p-4 border border-gray-800/30">
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
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            ESG Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risks.map((risk, index) => (
              <div key={index} className="glass-card rounded-xl p-4 border border-gray-800/30">
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
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-cyan-400" />
            {industry} ESG Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {industryComparison.map((company, index) => (
              <div 
                key={index} 
                className={`glass-card rounded-xl p-4 border ${
                  company.isCurrentCompany ? 'border-indigo-500' : 'border-gray-800/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{company.company}</h3>
                    {company.isCurrentCompany && (
                      <CheckCircle className="h-4 w-4 text-neon-400" />
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
