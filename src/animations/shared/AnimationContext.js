'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initGSAP } from './gsapConfig';

// Import all page animations for easy access
import homeAnimations from '../pages/homeAnimations';
import stocksAnimations from '../pages/stocksAnimations';
import marketAnimations from '../pages/marketAnimations';
import ipoAnimations from '../pages/ipoAnimations';
import newsAnimations from '../pages/newsAnimations';
import dashboardAnimations from '../pages/dashboardAnimations';

// Create context
const AnimationContext = createContext({
  gsap: null,
  isAnimationEnabled: true,
  setAnimationEnabled: () => {},
  refreshScrollTrigger: () => {},
  animations: {
    home: null,
    stocks: null,
    market: null,
    ipo: null,
    news: null,
    dashboard: null
  }
});

export const AnimationProvider = ({ children }) => {
  const [isAnimationEnabled, setAnimationEnabled] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();

  // Clears stale inline animation styles that can leave elements dim/invisible
  // when route transitions interrupt active timelines.
  const normalizeAnimationVisibility = () => {
    if (typeof window === 'undefined') return;

    const styledNodes = document.querySelectorAll('[style*="opacity"], [style*="visibility"], [style*="filter"]');
    styledNodes.forEach((node) => {
      const element = /** @type {HTMLElement} */ (node);
      // Only touch elements that GSAP has animated.
      if (!element || !element._gsap) return;

      const inlineOpacity = element.style.opacity;
      if (inlineOpacity && Number(inlineOpacity) < 1) {
        element.style.opacity = '';
      }

      if (element.style.visibility === 'hidden') {
        element.style.visibility = '';
      }

      if (element.style.filter && element.style.filter.includes('blur')) {
        element.style.filter = '';
      }
    });
  };

  // Initialize GSAP once on client
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      // Register necessary plugins
      gsap.registerPlugin(ScrollTrigger);
      
      // Initialize GSAP with default settings
      initGSAP();
      
      // Set initialized state
      setIsInitialized(true);
      
      // Listen for resize events to refresh ScrollTrigger
      const handleResize = () => {
        ScrollTrigger.refresh();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isInitialized]);

  // Route-level animation hard reset to prevent stale/partial render states.
  useEffect(() => {
    if (typeof window === 'undefined' || !isInitialized) return;

    const rafId = window.requestAnimationFrame(() => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true));
      gsap.killTweensOf('*');
      normalizeAnimationVisibility();
      ScrollTrigger.refresh();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [pathname, isInitialized]);

  // Function to manually refresh ScrollTrigger
  const refreshScrollTrigger = () => {
    if (typeof window !== 'undefined') {
      ScrollTrigger.refresh();
    }
  };

  // Animation collections for easy access
  const animations = {
    home: homeAnimations,
    stocks: stocksAnimations,
    market: marketAnimations,
    ipo: ipoAnimations,
    news: newsAnimations,
    dashboard: dashboardAnimations
  };

  // Provide context value
  const contextValue = {
    gsap,
    isAnimationEnabled,
    setAnimationEnabled,
    refreshScrollTrigger,
    animations
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Custom hook to use animation context
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  
  return context;
};

export default AnimationContext; 