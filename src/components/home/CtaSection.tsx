'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

// Animated counter component
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    const numericTarget = parseInt(target.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numericTarget)) return;
    
    const duration = 2000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numericTarget));
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, target]);

  const formattedCount = count.toLocaleString();

  return (
    <span ref={ref} className="stat-value">
      {formattedCount}{suffix}
    </span>
  );
}

export default function CtaSection() {
  return (
    <section className="py-16 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-neon-400/[0.03] blur-[100px] rounded-full" />
      </div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-neon-400/20 bg-neon-400/[0.05] text-neon-400 text-sm mb-8">
            <Zap className="mr-2 h-3.5 w-3.5" />
            Start your journey
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Ready to Make Smarter <span className="gradient-text">Investment Decisions</span>?
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of investors using our platform to analyze Indian stocks
            and build profitable portfolios.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              href="/auth/register"
              className="group px-8 py-4 bg-neon-400 text-black font-semibold rounded-xl hover:shadow-neon-lg transition-all duration-400 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center justify-center"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="group px-8 py-4 text-white font-medium rounded-xl border border-gray-700/50 bg-gray-900/50 backdrop-blur-lg hover:border-neon-400/30 hover:bg-gray-800/60 transition-all duration-400 hover:shadow-neon-sm inline-flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {[
            { value: '100000', suffix: '+', label: 'Stocks Analyzed' },
            { value: '50000', suffix: '+', label: 'Registered Users' },
            { value: '10', suffix: '+', label: 'Analysis Dimensions' }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card card-shine rounded-xl p-6"
            >
              <div className="text-3xl font-bold text-neon-400 mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}