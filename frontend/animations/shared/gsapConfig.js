// Import GSAP and plugins
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'; 
import { Flip } from 'gsap/Flip';

// Register plugins with GSAP
gsap.registerPlugin(ScrollTrigger, TextPlugin, MotionPathPlugin, Flip);

// Default Animation Properties
export const defaults = {
  fadeIn: {
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
    autoAlpha: 0,
  },
  slideUp: {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    autoAlpha: 0,
  },
  slideLeft: {
    x: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    autoAlpha: 0,
  },
  slideRight: {
    x: -50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    autoAlpha: 0,
  },
  scaleUp: {
    scale: 0.85,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    autoAlpha: 0,
  },
  staggerChildren: {
    stagger: 0.1,
    ease: "power2.out",
  }
};

// ScrollTrigger default configs
export const scrollTriggerDefaults = {
  basic: {
    start: "top 75%",
    end: "bottom 25%",
    toggleActions: "play none none reverse",
  },
  parallax: {
    start: "top bottom",
    end: "bottom top",
    scrub: true,
  },
  pin: {
    start: "top top",
    end: "bottom top",
    pin: true,
    pinSpacing: true,
  }
};

// Utility functions
export const createScrollTrigger = (element, animation, options = {}) => {
  const config = { ...scrollTriggerDefaults.basic, ...options };
  
  // Create and return ScrollTrigger
  return ScrollTrigger.create({
    trigger: element,
    animation,
    ...config,
  });
};

// Cleanup function for unmounting components
export const cleanupGSAP = (component) => {
  return () => {
    // Get all ScrollTrigger instances associated with component
    const triggers = ScrollTrigger.getAll().filter(
      trigger => trigger.vars.trigger && 
        component.current && 
        component.current.contains(trigger.vars.trigger)
    );
    
    // Kill each trigger
    triggers.forEach(trigger => trigger.kill(false));
  };
};

// Initialize GSAP 
export const initGSAP = () => {
  // Reset ScrollTrigger on window resize for responsive support
  ScrollTrigger.addEventListener("refreshInit", () => {
    ScrollTrigger.refresh();
  });

  // Setup any global GSAP defaults here
  gsap.defaults({
    ease: "power2.out",
    duration: 0.7
  });
};

// Magnetic button effect
export const createMagneticEffect = (element, options = {}) => {
  if (!element) return;
  
  const defaults = {
    strength: 0.3,
    radius: 100,
    ease: "power2.out"
  };

  const config = { ...defaults, ...options };
  const { strength, radius, ease } = config;
  
  const handleMouseMove = (e) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < radius) {
      gsap.to(element, {
        x: distanceX * strength,
        y: distanceY * strength,
        duration: 0.5,
        ease
      });
    } else {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease
      });
    }
  };
  
  const handleMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease
    });
  };
  
  element.addEventListener('mousemove', handleMouseMove);
  element.addEventListener('mouseleave', handleMouseLeave);
  
  // Return cleanup function to remove event listeners
  return () => {
    element.removeEventListener('mousemove', handleMouseMove);
    element.removeEventListener('mouseleave', handleMouseLeave);
  };
};

export default {
  gsap,
  ScrollTrigger,
  TextPlugin,
  MotionPathPlugin,
  Flip,
  defaults,
  scrollTriggerDefaults,
  createScrollTrigger,
  cleanupGSAP,
  initGSAP,
  createMagneticEffect
}; 