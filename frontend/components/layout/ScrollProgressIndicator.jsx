'use client';

import { useEffect, useRef } from 'react';
import { useAnimation } from '../../animations/shared/AnimationContext';
import { createScrollProgressAnimation } from '../../animations/layout/NavigationAnimations';

const ScrollProgressIndicator = () => {
  const progressBarRef = useRef(null);
  const glowEffectRef = useRef(null);
  const { isAnimationEnabled } = useAnimation();
  
  useEffect(() => {
    console.log('ScrollProgressIndicator is rendering');
  }, []);
  
  useEffect(() => {
    if (!isAnimationEnabled || !progressBarRef.current) return;
    
    // Setup scroll progress animation with enhanced options
    const cleanup = createScrollProgressAnimation(progressBarRef, {
      color: null, // Using CSS for colors
      duration: 0.15 // Slightly smoother
    });
    
    // Mirror the same animation for the glow effect
    if (glowEffectRef.current) {
      const glowCleanup = createScrollProgressAnimation(glowEffectRef, {
        color: null,
        duration: 0.15
      });
      
      return () => {
        cleanup();
        glowCleanup();
      };
    }
    
    return cleanup;
  }, [isAnimationEnabled]);
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      {/* Backdrop blur for a modern look */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/5 h-2"></div>
      
      {/* Main progress bar with gradient */}
      <div 
        ref={progressBarRef}
        className="h-1 absolute top-0 left-0 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left transform scale-x-0"
      ></div>
      
      {/* Glow effect that follows the progress */}
      <div
        ref={glowEffectRef}
        className="h-1 absolute top-0 left-0 w-full origin-left transform scale-x-0"
      >
        <div className="absolute inset-0 blur-sm bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 opacity-70"></div>
      </div>
      
      {/* Additional pulsing dot at the end of the progress */}
      <div className="absolute top-0 right-0 w-2 h-2 -mt-0.5 rounded-full bg-white shadow-lg shadow-purple-500/50 opacity-0 animate-pulse" 
           style={{
             opacity: 0,
             transform: 'translateX(100%)',
             animation: 'pulse 1.5s infinite'
           }}>
      </div>
    </div>
  );
};

export default ScrollProgressIndicator;