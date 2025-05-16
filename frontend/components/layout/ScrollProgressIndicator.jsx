'use client';

import { useEffect, useRef } from 'react';
import { useAnimation } from '../../animations/shared/AnimationContext';
import { createScrollProgressAnimation } from '../../animations/layout/NavigationAnimations';

const ScrollProgressIndicator = () => {
  const progressBarRef = useRef(null);
  const { isAnimationEnabled } = useAnimation();
  
  useEffect(() => {
    if (!isAnimationEnabled || !progressBarRef.current) return;
    
    // Setup scroll progress animation
    const cleanup = createScrollProgressAnimation(progressBarRef, {
      color: null, // Use the color from CSS
      duration: 0.1
    });
    
    // Cleanup on component unmount
    return cleanup;
  }, [isAnimationEnabled]);
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div 
        ref={progressBarRef}
        className="h-full bg-yellow-500 origin-left w-full transform scale-x-0"
      ></div>
    </div>
  );
};

export default ScrollProgressIndicator; 