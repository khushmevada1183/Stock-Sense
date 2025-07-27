import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createNewsItemHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize animations for News component
 * 
 * @param {Object} refs - Reference object containing DOM refs
 * @returns {Object} - Collection of animation timelines and cleanup functions
 */
export const initNewsAnimations = (refs) => {
  const {
    containerRef,
    titleRef,
    newsItemsRef,
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
  
  // News items animation with staggered appearance and text fade
  if (newsItemsRef?.current) {
    const newsItems = newsItemsRef.current.querySelectorAll('.news-item, article');
    
    if (newsItems.length > 0) {
      timelines.newsItems = gsap.timeline({
        scrollTrigger: {
          trigger: newsItemsRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
      
      // Create staggered reveal animation for news items
      timelines.newsItems.from(newsItems, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
      
      // Add hover effects for news items
      const hoverCleanup = createNewsItemHoverEffect(newsItems);
      cleanupFunctions.push(hoverCleanup);
      
      // Add text reveal animation for headlines if needed
      newsItems.forEach(item => {
        const headline = item.querySelector('h3, .headline, .title, .font-medium, .text-lg');
        const meta = item.querySelectorAll('.meta, .date, .source, .text-sm, .text-gray-500');
        const summary = item.querySelector('.summary, .text-sm, p');
        
        if (headline && summary) {
          const itemTl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          });
          
          itemTl.from(headline, {
            opacity: 0,
            y: 10,
            duration: 0.4,
            ease: "power2.out"
          });
          
          if (meta && meta.length > 0) {
            itemTl.from(meta, {
              opacity: 0,
              y: 5,
              duration: 0.3,
              stagger: 0.05,
              ease: "power1.out"
            }, "-=0.2");
          }
          
          if (summary) {
            itemTl.from(summary, {
              opacity: 0,
              height: 0,
              duration: 0.4,
              ease: "power2.out"
            }, "-=0.1");
          }
        }
      });
    }
  }
  
  // CTA button animation
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
 * Create special loading animation for news items
 * 
 * @param {React.RefObject} containerRef - Reference to the news container
 * @returns {Object} - Loading animation controls
 */
export const createNewsLoadingAnimation = (containerRef) => {
  if (!containerRef?.current) return { start: () => {}, stop: () => {} };
  
  // Find or create placeholder elements for loading animation
  const createPlaceholders = () => {
    const container = containerRef.current;
    const existingPlaceholders = container.querySelectorAll('.news-placeholder');
    
    // Remove any existing placeholders
    existingPlaceholders.forEach(el => el.remove());
    
    // Create new placeholders
    for (let i = 0; i < 3; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'news-placeholder bg-gray-100 dark:bg-gray-800 rounded-md p-4 mb-4 overflow-hidden';
      placeholder.innerHTML = `
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 shimmer"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4 shimmer"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 shimmer"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 shimmer"></div>
        <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 shimmer"></div>
      `;
      container.appendChild(placeholder);
    }
    
    return container.querySelectorAll('.news-placeholder');
  };
  
  // Create shimmer effect animation
  const createShimmerAnimation = (elements) => {
    const shimmerElements = [];
    elements.forEach(el => {
      shimmerElements.push(...el.querySelectorAll('.shimmer'));
    });
    
    return gsap.timeline({ repeat: -1 })
      .to(shimmerElements, {
        backgroundPosition: '200% 0',
        duration: 1.5,
        ease: "linear",
        stagger: 0.1
      });
  };
  
  // Controls object
  const controls = {
    timeline: null,
    placeholders: [],
    
    start: () => {
      // Create placeholders
      const placeholders = createPlaceholders();
      controls.placeholders = placeholders;
      
      // Set initial state
      gsap.set(placeholders, { opacity: 0, y: 20 });
      
      // Create master timeline
      controls.timeline = gsap.timeline();
      
      // Animate placeholders in
      controls.timeline.to(placeholders, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "power2.out"
      });
      
      // Add shimmer effect
      const shimmerTl = createShimmerAnimation(placeholders);
      controls.timeline.add(shimmerTl, 0);
      
      return controls.timeline;
    },
    
    stop: () => {
      if (controls.timeline) {
        controls.timeline.kill();
      }
      
      // Animate placeholders out
      gsap.to(controls.placeholders, {
        opacity: 0,
        y: -10,
        stagger: 0.05,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          controls.placeholders.forEach(el => {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          });
        }
      });
    }
  };
  
  return controls;
};

/**
 * Create animation for news feed refresh
 * 
 * @param {React.RefObject} newsContainerRef - Reference to news container element
 * @param {Function} fetchNews - Function to fetch new news data
 * @returns {Function} - Function to trigger the refresh animation and data fetch
 */
export const createNewsRefreshAnimation = (newsContainerRef, fetchNews) => {
  if (!newsContainerRef?.current) return () => {};
  
  return () => {
    const container = newsContainerRef.current;
    const newsItems = container.querySelectorAll('.news-item, article');
    
    if (newsItems.length === 0) return;
    
    // Create timeline for the refresh animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Fetch new data when animation completes
        fetchNews();
      }
    });
    
    // Animate out current news items
    tl.to(newsItems, {
      opacity: 0,
      y: -20,
      stagger: 0.05,
      duration: 0.3,
      ease: "power2.in"
    });
    
    // Add loading state
    tl.add(() => {
      // This would be handled by the loading animation
      const loadingControls = createNewsLoadingAnimation(newsContainerRef);
      loadingControls.start();
      
      // Store reference to stop it later
      container.loadingAnimation = loadingControls;
    });
    
    // Return the timeline for external control if needed
    return tl;
  };
};

export default {
  initNewsAnimations,
  createNewsLoadingAnimation,
  createNewsRefreshAnimation
}; 