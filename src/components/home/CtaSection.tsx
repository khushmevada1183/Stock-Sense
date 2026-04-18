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

  return (
    <section className="relative pt-0 pb-10 md:pt-1 md:pb-12">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-6 -z-10 flex justify-center">
        <div className="h-36 w-[min(88vw,860px)] rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.09),transparent_72%)] blur-xl dark:bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.18),transparent_76%)]" />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-300/75 bg-white/75 px-4 py-2 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.65)] ring-1 ring-white/75 backdrop-blur-md dark:border-gray-700/70 dark:bg-gray-900/70 dark:ring-gray-300/10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[0.6rem] font-[var(--font-roboto-mono)] font-semibold tracking-[0.16em] text-slate-50 dark:bg-slate-100 dark:text-slate-950">
              01
            </span>
            <span className="inline-flex items-center gap-2 font-[var(--font-roboto-mono)] text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-200">
              <Zap className="h-3.5 w-3.5" />
              Start your journey
            </span>
          </div>

          <div className="mb-6">
            <h2 className="font-[var(--font-sans)] text-[clamp(2rem,4.6vw,3.8rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-slate-900 dark:text-slate-50">
              Ready to Make Smarter Investment Decisions?
            </h2>
          </div>
          <p className="mx-auto mb-10 max-w-2xl text-[1.2rem] leading-relaxed text-slate-600 dark:text-slate-300 md:text-[1.34rem]">
            Join thousands of investors using our platform to analyze Indian stocks
            and build profitable portfolios.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col justify-center gap-3 sm:flex-row md:mb-14">
            <Button
              variant="outline"
              size="lg"
              className="group inline-flex min-w-[240px] items-center justify-center rounded-2xl border !border-slate-900 !bg-slate-900 px-8 py-4 font-[var(--font-sans)] text-base font-semibold tracking-[-0.015em] !text-slate-50 shadow-[0_16px_34px_-20px_rgba(15,23,42,0.86)] transition-all duration-300 hover:-translate-y-0.5 hover:!bg-slate-800 hover:shadow-[0_18px_42px_-22px_rgba(15,23,42,0.9)] dark:!border-slate-100 dark:!bg-slate-100 dark:!text-slate-950 dark:hover:!bg-slate-200"
              onClick={() => router.push('/signup')}
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="inline-flex min-w-[170px] items-center justify-center rounded-2xl border border-slate-300 bg-white/70 px-8 py-4 font-[var(--font-sans)] text-base font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900 dark:border-gray-700/70 dark:bg-gray-900/70 dark:text-slate-200 dark:hover:bg-gray-900/90"
              onClick={() => router.push('/about')}
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
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
              className="h-full"
            >
              <div className="relative h-full min-h-[142px] overflow-hidden rounded-2xl border border-slate-200/85 bg-white/78 p-6 shadow-[0_20px_36px_-32px_rgba(15,23,42,0.9)] ring-1 ring-white/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_46px_-30px_rgba(15,23,42,0.6)] dark:border-gray-700/70 dark:bg-gray-900/80 dark:ring-gray-200/5">
                <div className="mx-auto mb-4 h-px w-16 bg-gradient-to-r from-transparent via-slate-400/80 to-transparent dark:via-slate-500/90" />
                <div className="text-center">
                  <div className="mb-2 font-[var(--font-sans)] text-[2.25rem] font-semibold leading-none tracking-[-0.03em] text-slate-900 dark:text-slate-50">
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