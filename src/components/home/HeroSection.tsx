"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export default function HeroSection() {
  const router = useRouter();
  const [stocksAnalyzed, setStocksAnalyzed] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    { name: "Rajesh M.", position: "Portfolio Manager", text: "Gained 27% returns in just 3 months using Stock Sense's AI predictions" },
    { name: "Priya S.", position: "Retail Investor", text: "The real-time alerts helped me avoid a 15% market drop last quarter" },
    { name: "Vikram J.", position: "Financial Advisor", text: "My clients have seen an average 31% improvement in portfolio performance" }
  ];

  // Animate stocks analyzed counter
  useEffect(() => {
    const end = 247;
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setStocksAnalyzed(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden pt-10 pb-24 md:pt-14 md:pb-32">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-slate-700 text-sm mb-8 dark:border-gray-700/70 dark:bg-gray-900/80 dark:text-slate-300">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Real-time market intelligence
              </div>
              
              {/* Headline */}
              <div className="mb-7">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-3 text-slate-900 dark:text-white">
                  Gain the Edge with AI-Powered
                </h1>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neon-500 dark:text-neon-300 neon-glow-text">
                  Stock Insights
                </h2>
              </div>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl mb-10 text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Our advanced algorithms outperform traditional analysis by{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-200">43%</span>, 
                giving you confidence to make smarter investment decisions in India's dynamic market.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-14">
                <Button
                  size="lg"
                  className="rounded-lg px-8 py-4"
                  onClick={() => router.push('/signup')}
                >
                  <span className="flex items-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-lg px-8 py-4"
                  onClick={() => router.push('/stocks')}
                >
                  <span className="flex items-center">
                    Browse Stocks <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                {[
                  { value: stocksAnalyzed, label: 'Stocks analyzed today', suffix: '' },
                  { value: '12.4M', label: 'Data points processed', suffix: '+' },
                  { value: '94', label: 'Accuracy rate', suffix: '%' }
                ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                  >
                    <span className="block text-2xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}{stat.suffix}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Chart Visualization */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Chart Card */}
              <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900/90 p-6">
                {/* Chart SVG */}
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#39ff14" stopOpacity="0.18" />
                      <stop offset="50%" stopColor="#39ff14" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#39ff14" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#39ff14" />
                      <stop offset="50%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#39ff14" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under chart */}
                  <path 
                    d="M0,150 C50,120 80,180 120,100 C160,30 200,90 240,70 C280,50 350,120 400,100 V200 H0 Z" 
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Main chart line */}
                  <path 
                    d="M0,150 C50,120 80,180 120,100 C160,30 200,90 240,70 C280,50 350,120 400,100" 
                    fill="none" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  
                  {/* Data points */}
                  {[
                    { cx: 120, cy: 100 },
                    { cx: 240, cy: 70 },
                    { cx: 350, cy: 120 }
                  ].map((point, i) => (
                    <g key={i}>
                      <circle cx={point.cx} cy={point.cy} r="6" fill="#dcfce7" />
                      <circle cx={point.cx} cy={point.cy} r="3" fill="#39ff14" />
                    </g>
                  ))}
                </svg>
                
                {/* Live data indicators */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="text-xs font-mono bg-slate-50 dark:bg-gray-900 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 flex items-center border border-slate-200 dark:border-gray-700/50">
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-green-500" />
                    LIVE DATA
                  </div>
                  <div className="text-xs font-mono bg-slate-50 dark:bg-gray-900 px-3 py-1.5 rounded-full text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-700/50">
                    NIFTY 50: 19,200 <span className="text-green-600 dark:text-green-400 ml-1">+1.20%</span>
                  </div>
                </div>
                
                {/* Bottom metrics */}
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'SENSEX', value: '63,450', change: '+0.80%', positive: true },
                    { label: 'BANK NIFTY', value: '44,120', change: '-0.45%', positive: false },
                    { label: 'IT INDEX', value: '32,150', change: '+1.20%', positive: true }
                  ].map((metric, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-gray-900 p-2.5 rounded-lg border border-slate-200 dark:border-gray-700/50">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{metric.label}</div>
                      <div className="text-sm font-semibold flex items-center justify-between mt-0.5">
                        <span className="text-slate-900 dark:text-white">{metric.value}</span>
                        <span className={metric.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Testimonial card */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="absolute -bottom-12 -right-8 w-64 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700/50 dark:bg-gray-900/90 p-4"
                >
                  <div className="flex items-start mb-3">
                    <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-gray-700/80 flex items-center justify-center text-slate-900 dark:text-white font-semibold text-sm">
                      {testimonials[currentTestimonial].name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{testimonials[currentTestimonial].name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{testimonials[currentTestimonial].position}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">&ldquo;{testimonials[currentTestimonial].text}&rdquo;</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}