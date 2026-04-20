'use client';

import { useEffect, useMemo, useState } from 'react';

interface CursiveLoaderProps {
  className?: string;
  textClassName?: string;
}

const BRAND_TEXT = 'Stock Sense';
const STOCK_WORD_LENGTH = 'Stock'.length;
const TYPE_INTERVAL_MS = 90;
const HOLD_AFTER_COMPLETE_MS = 260;

export default function CursiveLoader({ className = '', textClassName = '' }: CursiveLoaderProps) {
  const [typedCount, setTypedCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setTypedCount(BRAND_TEXT.length);
      return;
    }

    const typingInterval = window.setInterval(() => {
      setTypedCount((previousCount) => {
        const nextCount = previousCount + 1;

        if (nextCount > BRAND_TEXT.length) {
          window.clearInterval(typingInterval);

          window.setTimeout(() => {
            setTypedCount(0);
          }, HOLD_AFTER_COMPLETE_MS);

          return BRAND_TEXT.length;
        }

        return nextCount;
      });
    }, TYPE_INTERVAL_MS);

    return () => {
      window.clearInterval(typingInterval);
    };
  }, [typedCount]);

  const typedText = useMemo(() => BRAND_TEXT.slice(0, typedCount), [typedCount]);
  const stockTyped = useMemo(() => typedText.slice(0, STOCK_WORD_LENGTH), [typedText]);
  const senseTyped = useMemo(() => typedText.slice(STOCK_WORD_LENGTH), [typedText]);

  return (
    <div className={`inline-flex items-center justify-center ${className}`.trim()}>
      <span className={`stock-sense-loader-brand text-lg leading-none sm:text-xl ${textClassName}`.trim()}>
        <span className="text-neon-400">{stockTyped}</span>
        <span className="text-slate-300">{senseTyped}</span>
      </span>
    </div>
  );
}
