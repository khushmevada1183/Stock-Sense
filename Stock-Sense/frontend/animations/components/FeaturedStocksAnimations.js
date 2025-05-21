import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createCardHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize animations for FeaturedStocks component
 * 
 * @param {Object} refs - Reference object containing DOM refs
 * @returns {Object} - Collection of animation timelines and cleanup functions
 */
export const initFeaturedStocksAnimations = (refs) => {
  const {
    containerRef,
    titleRef,
    stockCardsRef,
    ctaButtonRef
  } = refs;
  
  const timelines = {};
  const cleanupFunctions = [];
  
  // Header animation
  if (titleRef?.current) {
    timelines.header = gsap.timeline();
    timelines.header.from(titleRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.7
    });
  }
  
  // Stock cards animation with stagger effect
  if (stockCardsRef?.current) {
    const cards = stockCardsRef.current.querySelectorAll('.stock-card');
    
    if (cards.length > 0) {
      timelines.cards = gsap.timeline({
        scrollTrigger: {
          trigger: stockCardsRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
      
      timelines.cards.from(cards, {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out"
      });
      
      // Add hover effects to cards
      const hoverCleanup = createCardHoverEffect(cards);
      cleanupFunctions.push(hoverCleanup);
    }
  }
  
  // CTA button animation with bounce effect
  if (ctaButtonRef?.current) {
    timelines.cta = gsap.timeline({
      scrollTrigger: {
        trigger: ctaButtonRef.current,
        start: "top 90%",
      }
    });
    
    timelines.cta.from(ctaButtonRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "back.out(1.5)"
    });
  }
  
  // Return function to cleanup all animations
  const cleanup = () => {
    // Kill all timelines
    Object.values(timelines).forEach(timeline => {
      if (timeline) timeline.kill();
    });
    
    // Run all cleanup functions
    cleanupFunctions.forEach(fn => fn());
    
    // Kill any ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => {
      if (containerRef?.current && trigger.vars.trigger && 
          containerRef.current.contains(trigger.vars.trigger)) {
        trigger.kill();
      }
    });
  };
  
  return {
    timelines,
    cleanup
  };
};

/**
 * Create sliding carousel animation for featured stocks
 * 
 * @param {React.RefObject} carouselRef - Reference to carousel container
 * @param {Object} options - Animation options
 * @returns {Object} - Animation controls and cleanup function
 */
export const createStocksCarousel = (carouselRef, options = {}) => {
  if (!carouselRef?.current) return { controls: {}, cleanup: () => {} };
  
  const defaults = {
    scrollAmount: 300,
    duration: 0.5,
    ease: "power2.inOut"
  };
  
  const config = { ...defaults, ...options };
  
  // Scroll carousel function
  const scrollCarousel = (direction) => {
    const { scrollAmount, duration, ease } = config;
    const carousel = carouselRef.current;
    
    if (!carousel) return;
    
    const currentScroll = carousel.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    gsap.to(carousel, {
      scrollLeft: targetScroll,
      duration,
      ease
    });
  };
  
  // Controls object for external use
  const controls = {
    scrollLeft: () => scrollCarousel('left'),
    scrollRight: () => scrollCarousel('right')
  };
  
  // Cleanup function (not much to clean up here)
  const cleanup = () => {
    if (carouselRef.current) {
      gsap.killTweensOf(carouselRef.current);
    }
  };
  
  return {
    controls,
    cleanup
  };
};

export default {
  initFeaturedStocksAnimations,
  createStocksCarousel
}; 