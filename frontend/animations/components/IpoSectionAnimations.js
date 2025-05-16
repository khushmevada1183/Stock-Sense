import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createCardHoverEffect, createIPOItemHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize animations for IPO Section component
 * 
 * @param {Object} refs - Reference object containing DOM refs
 * @returns {Object} - Collection of animation timelines and cleanup functions
 */
export const initIpoSectionAnimations = (refs) => {
  const {
    containerRef,
    titleRef,
    subtitleRef,
    ipoCardsRef,
    ctaButtonRef
  } = refs;
  
  const timelines = {};
  const cleanupFunctions = [];
  
  // Header animations with text reveal effect
  if (titleRef?.current && subtitleRef?.current) {
    timelines.header = gsap.timeline();
    
    // Animate title with clip path for text reveal effect
    timelines.header.from(titleRef.current, {
      clipPath: "inset(0 100% 0 0)",
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
    
    // Animate subtitle with slight delay
    timelines.header.from(subtitleRef.current, {
      opacity: 0,
      y: 15,
      duration: 0.6
    }, "-=0.3");
  }
  
  // IPO cards animation with staggered appearance
  if (ipoCardsRef?.current) {
    const cards = ipoCardsRef.current.querySelectorAll('.ipo-card');
    
    if (cards.length > 0) {
      timelines.cards = gsap.timeline({
        scrollTrigger: {
          trigger: ipoCardsRef.current,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      });
      
      // Create staggered reveal animation for cards
      timelines.cards.from(cards, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
      });
      
      // Apply enhanced hover effect for IPO cards
      const hoverCleanup = createCardHoverEffect(cards);
      cleanupFunctions.push(hoverCleanup);
      
      // Add additional animation for card logos and content if needed
      cards.forEach(card => {
        const logo = card.querySelector('img, .logo-placeholder');
        const title = card.querySelector('.font-semibold, .company-name');
        const details = card.querySelectorAll('.text-gray-500, .text-sm');
        
        if (logo && title) {
          const cardTl = gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          });
          
          cardTl.from(logo, {
            opacity: 0,
            scale: 0.8,
            duration: 0.5,
            ease: "back.out(1.7)"
          }, "+=0.1")
          .from(title, {
            opacity: 0,
            y: 10,
            duration: 0.4
          }, "-=0.2")
          .from(details, {
            opacity: 0,
            y: 8,
            stagger: 0.03,
            duration: 0.3
          }, "-=0.2");
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
    
    // Add pulsing attention effect to CTA button
    const pulseAnimation = gsap.to(ctaButtonRef.current, {
      scale: 1.05,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      paused: true
    });
    
    // Start pulsing after initial animation
    timelines.cta.add(() => {
      setTimeout(() => {
        pulseAnimation.play();
      }, 1000);
    });
    
    // Add to cleanup functions
    cleanupFunctions.push(() => {
      pulseAnimation.kill();
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
 * Create horizontal slide carousel for IPO cards
 * 
 * @param {React.RefObject} carouselRef - Reference to carousel container
 * @param {Object} options - Animation options
 * @returns {Object} - Animation controls and cleanup function
 */
export const createIpoCarousel = (carouselRef, options = {}) => {
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
  
  // Animate scroll buttons when carousel is hovered
  const attachButtonAnimations = (leftButtonRef, rightButtonRef) => {
    if (!leftButtonRef?.current || !rightButtonRef?.current) return () => {};
    
    const leftButton = leftButtonRef.current;
    const rightButton = rightButtonRef.current;
    
    // Button hover animations
    const leftEnter = () => {
      gsap.to(leftButton, {
        scale: 1.1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        duration: 0.3
      });
    };
    
    const leftLeave = () => {
      gsap.to(leftButton, {
        scale: 1,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
        duration: 0.3
      });
    };
    
    const rightEnter = () => {
      gsap.to(rightButton, {
        scale: 1.1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        duration: 0.3
      });
    };
    
    const rightLeave = () => {
      gsap.to(rightButton, {
        scale: 1,
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.1)",
        duration: 0.3
      });
    };
    
    // Add event listeners
    leftButton.addEventListener('mouseenter', leftEnter);
    leftButton.addEventListener('mouseleave', leftLeave);
    rightButton.addEventListener('mouseenter', rightEnter);
    rightButton.addEventListener('mouseleave', rightLeave);
    
    // Return cleanup function
    return () => {
      leftButton.removeEventListener('mouseenter', leftEnter);
      leftButton.removeEventListener('mouseleave', leftLeave);
      rightButton.removeEventListener('mouseenter', rightEnter);
      rightButton.removeEventListener('mouseleave', rightLeave);
    };
  };
  
  // Cleanup function
  const cleanup = () => {
    if (carouselRef.current) {
      gsap.killTweensOf(carouselRef.current);
    }
  };
  
  return {
    controls,
    attachButtonAnimations,
    cleanup
  };
};

export default {
  initIpoSectionAnimations,
  createIpoCarousel
}; 