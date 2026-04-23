'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '../ui/button';

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
  const router = useRouter();

  const stats = [
    { value: '100000', suffix: '+', label: 'Stocks analyzed' },
    { value: '50000', suffix: '+', label: 'Registered users' },
    { value: '10', suffix: '+', label: 'Analysis dimensions' },
  ];

  return (
    <section className="relative overflow-hidden pt-0 pb-10 md:pt-1 md:pb-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 flex justify-center">
        <div className="h-36 w-[min(88vw,860px)] rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_72%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.18),transparent_76%)]" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60 dark:shadow-[0_28px_90px_rgba(0,0,0,0.45)] sm:p-8 md:p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.65)] backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Start your journey
          </div>

          <div className="mb-6 mt-6">
            <h2 className="text-[clamp(2.2rem,4.8vw,4rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-slate-950 dark:text-white font-[var(--font-sans)]">
              Ready to make smarter investment decisions?
            </h2>
          </div>
          <p className="mx-auto mb-10 max-w-2xl text-[1.05rem] leading-relaxed text-slate-600 dark:text-slate-400 md:text-[1.15rem]">
            Join thousands of investors using our platform to analyze Indian stocks
            and build profitable portfolios.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col justify-center gap-3 sm:flex-row md:mb-14">
            <Button
              variant="outline"
              size="lg"
              className="group inline-flex min-w-[240px] items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-8 py-4 font-[var(--font-sans)] text-base font-semibold tracking-[-0.015em] text-slate-50 shadow-[0_16px_34px_-20px_rgba(15,23,42,0.86)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-[0_18px_42px_-22px_rgba(15,23,42,0.9)] dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
              onClick={() => router.push('/signup')}
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="inline-flex min-w-[170px] items-center justify-center rounded-full border border-slate-300/80 bg-white/80 px-8 py-4 font-[var(--font-sans)] text-base font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
              onClick={() => router.push('/about')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              <div className="relative h-full min-h-[142px] overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/75 p-6 shadow-[0_20px_36px_-32px_rgba(15,23,42,0.9)] ring-1 ring-white/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_46px_-30px_rgba(15,23,42,0.6)] dark:border-white/10 dark:bg-white/5 dark:ring-white/5">
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-slate-400/80 to-transparent dark:via-slate-500/90" />
                <div className="text-center">
                  <div className="mb-2 font-[var(--font-sans)] text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-slate-950 dark:text-white">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="font-[var(--font-roboto-mono)] text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}