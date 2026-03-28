"use client";

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Brain,
  Users,
  MessageSquare,
  MessageCircle,
  Newspaper,
  Star,
  Zap,
} from 'lucide-react';

interface SentimentData {
  overall: number; // -100 to 100
  social: number;
  news: number;
  analyst: number;
  retail: number;
  institutional: number;
  forum: number;
  rating: number;
}

interface SentimentSource {
  source: string;
  sentiment: number;
  volume: number;
  trending_topics: string[];
  key_mentions: string[];
}

interface MarketMoodIndicator {
  name: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SentimentAnalysisProps {
  symbol: string;
  companyName: string;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ symbol }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [sources, setSources] = useState<SentimentSource[]>([]);
  const [marketMood, setMarketMood] = useState<MarketMoodIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSentimentData();
  }, [symbol]);

  const fetchSentimentData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual sentiment analysis APIs
      const mockSentimentData: SentimentData = {
        overall: Math.floor(Math.random() * 40) + 20, // Random between 20-60
        social: Math.floor(Math.random() * 60) - 10, // Random between -10 to 50
        news: Math.floor(Math.random() * 50) + 10, // Random between 10-60
        analyst: Math.floor(Math.random() * 40) + 30, // Random between 30-70
        retail: Math.floor(Math.random() * 50) + 5, // Random between 5-55
        institutional: Math.floor(Math.random() * 30) + 40, // Random between 40-70
        forum: Math.floor(Math.random() * 40) + 10, // Random between 10-50
        rating: Math.floor(Math.random() * 30) + 50 // Random between 50-80
      };

      const mockSources: SentimentSource[] = [
        {
          source: 'Twitter/X',
          sentiment: mockSentimentData.social,
          volume: Math.floor(Math.random() * 5000) + 1000,
          trending_topics: ['quarterly results', 'expansion plans', 'market share'],
          key_mentions: ['strong performance', 'growth outlook', 'dividend announcement']
        },
        {
          source: 'Financial News',
          sentiment: mockSentimentData.news,
          volume: Math.floor(Math.random() * 200) + 50,
          trending_topics: ['revenue growth', 'profit margins', 'market position'],
          key_mentions: ['beat estimates', 'positive outlook', 'strong fundamentals']
        },
        {
          source: 'Reddit/Forums',
          sentiment: Math.floor(Math.random() * 40) + 10,
          volume: Math.floor(Math.random() * 1000) + 200,
          trending_topics: ['technical analysis', 'long term hold', 'value pick'],
          key_mentions: ['undervalued', 'good entry point', 'solid company']
        },
        {
          source: 'Analyst Reports',
          sentiment: mockSentimentData.analyst,
          volume: Math.floor(Math.random() * 50) + 10,
          trending_topics: ['price target', 'recommendation', 'sector outlook'],
          key_mentions: ['buy rating', 'target raised', 'positive coverage']
        }
      ];

      const mockMarketMood: MarketMoodIndicator[] = [
        {
          name: 'Fear & Greed Index',
          value: Math.floor(Math.random() * 40) + 40,
          trend: 'up',
          description: 'Market sentiment indicator based on volatility and momentum'
        },
        {
          name: 'Volatility Index (VIX)',
          value: Math.floor(Math.random() * 20) + 15,
          trend: 'down',
          description: 'Market fear gauge based on options volatility'
        },
        {
          name: 'Put/Call Ratio',
          value: Math.random() * 0.5 + 0.7,
          trend: 'stable',
          description: 'Ratio of put to call options trading volume'
        },
        {
          name: 'Insider Trading Activity',
          value: Math.floor(Math.random() * 30) + 50,
          trend: 'up',
          description: 'Recent insider buying/selling activity'
        }
      ];

      setSentimentData(mockSentimentData);
      setSources(mockSources);
      setMarketMood(mockMarketMood);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
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

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 50) return 'text-green-400 bg-green-500/20';
    if (sentiment >= 20) return 'text-yellow-400 bg-yellow-500/20';
    if (sentiment >= -20) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 60) return 'Very Bullish';
    if (sentiment >= 30) return 'Bullish';
    if (sentiment >= 10) return 'Slightly Bullish';
    if (sentiment >= -10) return 'Neutral';
    if (sentiment >= -30) return 'Slightly Bearish';
    if (sentiment >= -60) return 'Bearish';
    return 'Very Bearish';
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 30) return <ThumbsUp className="w-5 h-5 text-neon-400" />;
    if (sentiment >= -30) return <Activity className="w-5 h-5 text-neon-400" />;
    return <ThumbsDown className="w-5 h-5 text-neon-400" />;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-yellow-400" />;
    }
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
      {/* Overall Sentiment Score */}
      {sentimentData && (
        <Card glass>
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-neon-400" />
              Overall Sentiment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl ${getSentimentColor(sentimentData.overall)}`}>
                {getSentimentIcon(sentimentData.overall)}
                <div>
                  <div className="text-3xl font-bold">{sentimentData.overall}</div>
                  <div className="text-sm">{getSentimentLabel(sentimentData.overall)}</div>
                </div>
              </div>
              <p className="text-gray-400 mt-4">
                Aggregated sentiment from multiple sources including social media, news, and analyst reports
              </p>
            </div>

            {/* Sentiment Breakdown */}
                        {/* Sentiment Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="glass-card rounded-xl p-4 text-center border border-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-xl font-bold text-white">{sentimentData.social}</div>
                <div className="text-sm text-gray-400">Social Media</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border border-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <Newspaper className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-xl font-bold text-white">{sentimentData.news}</div>
                <div className="text-sm text-gray-400">News Articles</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border border-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-white">{sentimentData.analyst}</div>
                <div className="text-sm text-gray-400">Analyst Reports</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border border-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <MessageCircle className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-xl font-bold text-white">{sentimentData.forum}</div>
                <div className="text-sm text-gray-400">Forums</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border border-gray-800/30">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-xl font-bold text-white">{sentimentData.rating}</div>
                <div className="text-sm text-gray-400">Ratings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment Sources */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-neon-400" />
            Sentiment Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{source.source}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${getSentimentColor(source.sentiment)}`}>
                      {source.sentiment > 0 ? '+' : ''}{source.sentiment}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm">{source.volume.toLocaleString()}</div>
                    <div className="text-gray-400 text-xs">mentions</div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="text-sm text-gray-400 mb-1">Trending Topics:</div>
                  <div className="flex flex-wrap gap-1">
                    {source.trending_topics.map((topic, topicIndex) => (
                      <span key={topicIndex} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-400 mb-1">Key Mentions:</div>
                  <div className="flex flex-wrap gap-1">
                    {source.key_mentions.map((mention, mentionIndex) => (
                      <span key={mentionIndex} className="px-2 py-1 bg-gray-800/40 text-gray-300 text-xs rounded">
                        {mention}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Psychology Indicators */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-neon-400" />
            Market Psychology Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketMood.map((indicator, index) => (
              <div key={index} className="glass-card rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-white font-medium">{indicator.name}</h4>
                  {getTrendIcon(indicator.trend)}
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {typeof indicator.value === 'number' ? 
                    (indicator.value < 10 ? indicator.value.toFixed(2) : Math.round(indicator.value)) : 
                    indicator.value}
                </div>
                <p className="text-gray-400 text-sm">{indicator.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis Insights */}
      <Card glass>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-neon-400" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-neon-400 rounded-full mt-2"></div>
                <div>
                  <div className="text-cyan-400 font-medium text-sm">Sentiment Trend</div>
                  <div className="text-gray-300 text-sm">
                    {sentimentData && sentimentData.overall > 30 
                      ? "Positive sentiment is building momentum across multiple platforms. Social media engagement is increasing with bullish discussions."
                      : sentimentData && sentimentData.overall < -10
                      ? "Sentiment shows bearish bias with increasing negative mentions. Monitor for potential sentiment reversal signals."
                      : "Mixed sentiment with neutral bias. No strong directional momentum detected across platforms."
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <div className="text-green-400 font-medium text-sm">Key Drivers</div>
                  <div className="text-gray-300 text-sm">
                    Recent earnings announcement and management guidance are primary sentiment drivers. 
                    Institutional sentiment remains more stable compared to retail sentiment volatility.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div>
                  <div className="text-yellow-400 font-medium text-sm">Risk Factors</div>
                  <div className="text-gray-300 text-sm">
                    Monitor for sentiment shifts around upcoming events. High social media volume may indicate 
                    increased volatility. Consider contrarian indicators when sentiment reaches extremes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalysis;
