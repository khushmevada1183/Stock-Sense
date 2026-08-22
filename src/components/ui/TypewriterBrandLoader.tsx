'use client';

import { useEffect, useMemo, useState } from 'react';

const BRAND_TEXT = 'Stock Sense';
const STOCK_WORD_LENGTH = 'Stock'.length;
const TYPE_INTERVAL_MS = 140;
const HOLD_AFTER_COMPLETE_MS = 340;
const FADE_OUT_MS = 420;

export default function TypewriterBrandLoader() {
  const [typedCount, setTypedCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setTypedCount(BRAND_TEXT.length);

      const reduceMotionTimeout = window.setTimeout(() => {
        setIsVisible(false);
      }, 200);

      return () => {
        window.clearTimeout(reduceMotionTimeout);
      };
    }

    const typingInterval = window.setInterval(() => {
      setTypedCount((previousCount) => {
        const nextCount = previousCount + 1;

        if (nextCount >= BRAND_TEXT.length) {
          window.clearInterval(typingInterval);

          window.setTimeout(() => {
            setIsFadingOut(true);

            window.setTimeout(() => {
              setIsVisible(false);
            }, FADE_OUT_MS);
          }, HOLD_AFTER_COMPLETE_MS);

          return BRAND_TEXT.length;
        }

        return nextCount;
      });
    }, TYPE_INTERVAL_MS);

    return () => {
      window.clearInterval(typingInterval);
    };
  }, []);

  const typedText = useMemo(() => BRAND_TEXT.slice(0, typedCount), [typedCount]);
  const stockTyped = useMemo(() => typedText.slice(0, STOCK_WORD_LENGTH), [typedText]);
  const senseTyped = useMemo(() => typedText.slice(STOCK_WORD_LENGTH), [typedText]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[140] flex items-center justify-center bg-slate-950 transition-opacity duration-[420ms] ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <h1 className="stock-sense-loader-brand text-6xl leading-none sm:text-7xl md:text-8xl">
        <span className="text-neon-400">{stockTyped}</span>
        <span className="text-slate-200">{senseTyped}</span>
        {typedCount < BRAND_TEXT.length ? <span className="stock-sense-loader-caret text-neon-400" /> : null}
      </h1>
    </div>
  );
}
