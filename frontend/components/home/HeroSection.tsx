"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stocksAnalyzed, setStocksAnalyzed] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  
  // Testimonials data
  const testimonials = [
    { name: "Rajesh M.", position: "Portfolio Manager", text: "Gained 27% returns in just 3 months using Stock Sense&apos;s AI predictions" },
    { name: "Priya S.", position: "Retail Investor", text: "The real-time alerts helped me avoid a 15% market drop last quarter" },
    { name: "Vikram J.", position: "Financial Advisor", text: "My clients have seen an average 31% improvement in portfolio performance" }
  ];
  
  // Track mouse movement for parallax effect
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
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Animate stocks analyzed counter
  useEffect(() => {
    const interval = setInterval(() => {
      setStocksAnalyzed(prev => {
        if (prev < 247) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, []);
  
  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate parallax movement
  const calcParallaxX = (depth = 1) => {
    const centerX = heroRef.current ? heroRef.current.offsetWidth / 2 : 0;
    const moveX = (mousePosition.x - centerX) / 50 * depth;
    return moveX;
  };
  
  const calcParallaxY = (depth = 1) => {
    const centerY = heroRef.current ? heroRef.current.offsetHeight / 2 : 0;
    const moveY = (mousePosition.y - centerY) / 50 * depth;
    return moveY;
  };

  return (
    <section 
      ref={heroRef}
      className="relative py-24 overflow-hidden text-white"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute w-[800px] h-[800px] rounded-full bg-neon-400/5 blur-3xl"
          style={{ 
            left: `calc(10% + ${calcParallaxX(0.5)}px)`, 
            top: `calc(30% + ${calcParallaxY(0.5)}px)` 
          }}
        />
        <div 
          className="absolute w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-3xl"
          style={{ 
            right: `calc(15% + ${calcParallaxX(-0.3)}px)`, 
            top: `calc(20% + ${calcParallaxY(-0.3)}px)` 
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-neon-400/5 blur-3xl"
          style={{ 
            left: `calc(50% + ${calcParallaxX(0.2)}px)`, 
            bottom: `calc(10% + ${calcParallaxY(0.2)}px)` 
          }}
        />
      </div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-neon-400/30 bg-gray-850/30 backdrop-blur-sm text-neon-400 text-sm mb-6">
                <span className="animate-pulse mr-2 h-2 w-2 rounded-full bg-neon-400"></span>
                Real-time market intelligence
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-300 to-cyan-400">
                  Gain the Edge with 
                </span>
                <br />
                <span className="relative neon-glow-text">
                  AI-Powered Insights
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-neon-400/50 rounded-full"></span>
                </span>
              </h1>
              
              <p className="text-xl mb-8 text-gray-300 max-w-2xl">
                Our advanced algorithms outperform traditional analysis by <span className="font-semibold text-neon-400">43%</span>, 
                giving you the confidence to make smarter investment decisions in India's dynamic market.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Link
                  href="/auth/register"
                  className="group relative px-8 py-4 bg-neon-400 text-black font-medium rounded-lg overflow-hidden transition-all duration-300 hover:shadow-neon-lg hover:scale-105"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-neon-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
                <Link
                  href="/stocks"
                  className="group px-8 py-4 bg-gray-850/50 backdrop-blur-md text-white font-medium rounded-lg border border-neon-400/20 hover:bg-gray-850/70 hover:border-neon-400/40 transition-all duration-300 hover:shadow-neon-sm"
                >
                  Browse Stocks <ChevronRight className="inline-block ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-gray-400">
                <div>
                  <span className="block text-2xl font-bold text-neon-400 mb-1">{stocksAnalyzed}</span>
                  <span>Stocks analyzed today</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-neon-400 mb-1">12.4M+</span>
                  <span>Data points processed</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-neon-400 mb-1">94%</span>
                  <span>Accuracy rate</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ 
                transform: `translate(${calcParallaxX(-0.5)}px, ${calcParallaxY(-0.5)}px)` 
              }}
              className="relative"
            >
              {/* 3D Chart Visualization */}
              <div className="relative h-[400px] w-full glass-premium rounded-2xl border border-neon-400/10 shadow-neon-lg overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:30px_30px]"></div>
                
                {/* Chart elements */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  {/* Chart background gradient */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#39FF14" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Animated chart line */}
                  <path 
                    d="M0,150 C50,120 80,180 120,100 C160,30 200,90 240,70 C280,50 350,120 400,100" 
                    fill="none" 
                    stroke="#39FF14" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  
                  {/* Area under the chart */}
                  <path 
                    d="M0,150 C50,120 80,180 120,100 C160,30 200,90 240,70 C280,50 350,120 400,100 V200 H0 Z" 
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Data points */}
                  <circle cx="120" cy="100" r="4" fill="#39FF14" className="animate-ping" style={{animationDelay: "0s", animationDuration: "3s"}} />
                  <circle cx="240" cy="70" r="4" fill="#39FF14" className="animate-ping" style={{animationDelay: "1s", animationDuration: "3s"}} />
                  <circle cx="350" cy="120" r="4" fill="#39FF14" className="animate-ping" style={{animationDelay: "2s", animationDuration: "3s"}} />
                </svg>
                
                {/* Live data indicators */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="text-xs font-mono bg-gray-850/70 backdrop-blur-sm px-3 py-1 rounded-full text-neon-400 flex items-center">
                    <span className="animate-pulse mr-1.5 h-1.5 w-1.5 rounded-full bg-neon-400"></span>
                    LIVE DATA
                  </div>
                  <div className="text-xs font-mono bg-gray-850/70 backdrop-blur-sm px-3 py-1 rounded-full text-neon-400">
                    NIFTY 50: 19,200 <span className="text-neon-400">+1.20%</span>
                  </div>
                </div>
                
                {/* Metrics */}
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
                  <div className="bg-gray-850/50 backdrop-blur-sm p-2 rounded-lg">
                    <div className="text-xs text-gray-400">SENSEX</div>
                    <div className="text-sm font-semibold flex items-center">
                      63,450 <TrendingUp className="ml-1 h-3 w-3 text-neon-400" />
                    </div>
                  </div>
                  <div className="bg-gray-850/50 backdrop-blur-sm p-2 rounded-lg">
                    <div className="text-xs text-gray-400">BANK NIFTY</div>
                    <div className="text-sm font-semibold">44,120</div>
                  </div>
                  <div className="bg-gray-850/50 backdrop-blur-sm p-2 rounded-lg">
                    <div className="text-xs text-gray-400">IT INDEX</div>
                    <div className="text-sm font-semibold">32,150</div>
                  </div>
                </div>
                
                {/* Glowing effect */}
                <div className="absolute -bottom-20 -left-20 w-[250px] h-[250px] rounded-full bg-neon-400/10 blur-3xl"></div>
                <div className="absolute -top-20 -right-20 w-[200px] h-[200px] rounded-full bg-cyan-500/10 blur-3xl"></div>
              </div>
              
              {/* Testimonial card */}
              <motion.div 
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="absolute -bottom-12 -right-12 w-64 glass-premium rounded-lg border border-neon-400/10 p-4 shadow-neon-sm"
              >
                <div className="flex items-start mb-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neon-400 to-cyan-500 flex items-center justify-center text-black font-semibold text-sm">
                    {testimonials[currentTestimonial].name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-semibold">{testimonials[currentTestimonial].name}</div>
                    <div className="text-xs text-gray-400">{testimonials[currentTestimonial].position}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-300 italic">"{testimonials[currentTestimonial].text}"</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}