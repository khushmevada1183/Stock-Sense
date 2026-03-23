"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stocksAnalyzed, setStocksAnalyzed] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  const testimonials = [
    { name: "Rajesh M.", position: "Portfolio Manager", text: "Gained 27% returns in just 3 months using Stock Sense\u0027s AI predictions" },
    { name: "Priya S.", position: "Retail Investor", text: "The real-time alerts helped me avoid a 15% market drop last quarter" },
    { name: "Vikram J.", position: "Financial Advisor", text: "My clients have seen an average 31% improvement in portfolio performance" }
  ];
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Animate stocks analyzed counter with spring physics
  useEffect(() => {
    let start = 0;
    const end = 247;
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for spring-like feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      setStocksAnalyzed(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
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
  
  const calcParallaxX = (depth = 1) => {
    const centerX = heroRef.current ? heroRef.current.offsetWidth / 2 : 0;
    return (mousePosition.x - centerX) / 50 * depth;
  };
  
  const calcParallaxY = (depth = 1) => {
    const centerY = heroRef.current ? heroRef.current.offsetHeight / 2 : 0;
    return (mousePosition.y - centerY) / 50 * depth;
  };

  return (
    <section 
      ref={heroRef}
      className="relative py-24 md:py-32 overflow-hidden text-white"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full bg-neon-400/[0.04] blur-[100px] animate-float-slow"
          style={{ 
            left: `calc(10% + ${calcParallaxX(0.5)}px)`, 
            top: `calc(30% + ${calcParallaxY(0.5)}px)` 
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[80px] animate-float-delayed"
          style={{ 
            right: `calc(15% + ${calcParallaxX(-0.3)}px)`, 
            top: `calc(20% + ${calcParallaxY(-0.3)}px)` 
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-neon-400/[0.03] blur-[120px] animate-float"
          style={{ 
            left: `calc(50% + ${calcParallaxX(0.2)}px)`, 
            bottom: `calc(10% + ${calcParallaxY(0.2)}px)` 
          }}
        />
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neon-400/20 bg-neon-400/[0.05] backdrop-blur-lg text-neon-400 text-sm mb-8 animate-glow-pulse">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Real-time market intelligence
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-7 tracking-tight leading-[1.1]">
                <span className="gradient-text">
                  Gain the Edge with 
                </span>
                <br />
                <span className="relative text-white">
                  AI-Powered Insights
                  <span className="absolute -bottom-2 left-0 w-full h-[3px] bg-gradient-to-r from-neon-400/60 to-cyan-400/40 rounded-full" />
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl mb-10 text-gray-400 max-w-2xl leading-relaxed">
                Our advanced algorithms outperform traditional analysis by{' '}
                <span className="font-semibold text-neon-400">43%</span>, 
                giving you confidence to make smarter investment decisions in India&apos;s dynamic market.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-14">
                <Link
                  href="/auth/register"
                  className="group relative px-8 py-4 bg-neon-400 text-black font-semibold rounded-xl overflow-hidden transition-all duration-400 hover:shadow-neon-lg hover:scale-[1.03] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-neon-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                </Link>
                <Link
                  href="/stocks"
                  className="group px-8 py-4 text-white font-medium rounded-xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-lg hover:border-neon-400/30 hover:bg-gray-800/60 transition-all duration-400 hover:shadow-neon-sm"
                >
                  Browse Stocks <ChevronRight className="inline-block ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
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
                    <span className="block text-2xl font-bold text-neon-400 mb-1 stat-value">
                      {stat.value}{stat.suffix}
                    </span>
                    <span className="text-sm text-gray-500">{stat.label}</span>
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
              style={{ 
                transform: `translate(${calcParallaxX(-0.5)}px, ${calcParallaxY(-0.5)}px)` 
              }}
              className="relative"
            >
              {/* 3D Chart Card */}
              <div className="relative h-[400px] w-full glass-card card-shine rounded-2xl border border-neon-400/10 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]" />
                
                {/* Chart SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#39FF14" stopOpacity="0.25" />
                      <stop offset="50%" stopColor="#39FF14" stopOpacity="0.08" />
                      <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#39FF14" />
                      <stop offset="50%" stopColor="#00C2CB" />
                      <stop offset="100%" stopColor="#39FF14" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Area under chart */}
                  <path 
                    d="M0,150 C50,120 80,180 120,100 C160,30 200,90 240,70 C280,50 350,120 400,100 V200 H0 Z" 
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Main chart line with gradient */}
                  <path 
                    d="M0,150 C50,120 80,180 120,100 C160,30 200,90 240,70 C280,50 350,120 400,100" 
                    fill="none" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                  
                  {/* Data points with glow */}
                  {[
                    { cx: 120, cy: 100 },
                    { cx: 240, cy: 70 },
                    { cx: 350, cy: 120 }
                  ].map((point, i) => (
                    <g key={i}>
                      <circle cx={point.cx} cy={point.cy} r="6" fill="rgba(57, 255, 20, 0.15)" />
                      <circle cx={point.cx} cy={point.cy} r="3" fill="#39FF14" filter="url(#glow)" />
                    </g>
                  ))}
                </svg>
                
                {/* Live data indicators */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="text-xs font-mono bg-gray-950/70 backdrop-blur-xl px-3 py-1.5 rounded-full text-neon-400 flex items-center border border-gray-700/30">
                    <span className="animate-pulse mr-2 h-1.5 w-1.5 rounded-full bg-neon-400 shadow-neon-sm" />
                    LIVE DATA
                  </div>
                  <div className="text-xs font-mono bg-gray-950/70 backdrop-blur-xl px-3 py-1.5 rounded-full text-gray-300 border border-gray-700/30">
                    NIFTY 50: 19,200 <span className="text-neon-400 ml-1">+1.20%</span>
                  </div>
                </div>
                
                {/* Bottom metrics */}
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                  {[
                    { label: 'SENSEX', value: '63,450', up: true },
                    { label: 'BANK NIFTY', value: '44,120', up: false },
                    { label: 'IT INDEX', value: '32,150', up: true }
                  ].map((metric, i) => (
                    <div key={i} className="bg-gray-950/60 backdrop-blur-xl p-2.5 rounded-lg border border-gray-700/20">
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{metric.label}</div>
                      <div className="text-sm font-semibold flex items-center mt-0.5">
                        {metric.value}
                        {metric.up && <TrendingUp className="ml-1 h-3 w-3 text-neon-400" />}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Glow effects */}
                <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] rounded-full bg-neon-400/[0.06] blur-[80px]" />
                <div className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full bg-cyan-500/[0.06] blur-[60px]" />
              </div>
              
              {/* Testimonial card */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentTestimonial}
                  initial={{ opacity: 0, y: 16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-12 -right-8 w-64 glass-card card-shine rounded-xl border border-neon-400/10 p-4"
                >
                  <div className="flex items-start mb-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-400 to-cyan-400 flex items-center justify-center text-black font-semibold text-sm shadow-neon-sm">
                      {testimonials[currentTestimonial].name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-semibold text-gray-200">{testimonials[currentTestimonial].name}</div>
                      <div className="text-xs text-gray-500">{testimonials[currentTestimonial].position}</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 italic leading-relaxed">&ldquo;{testimonials[currentTestimonial].text}&rdquo;</p>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}