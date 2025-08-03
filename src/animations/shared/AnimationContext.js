'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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