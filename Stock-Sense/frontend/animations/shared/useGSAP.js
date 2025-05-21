import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { defaults, scrollTriggerDefaults, cleanupGSAP } from './gsapConfig';

// Hook for general GSAP animations with useEffect cleanup
export const useGSAPEffect = (callback, dependencies = []) => {
  const component = useRef();
  
  useEffect(() => {
    // Call the animation callback with the component ref
    const animation = callback(component);
    
    // Setup automatic cleanup
    return () => {
      if (typeof animation === 'function') {
        animation();
      }
      
      cleanupGSAP(component)();
    };
  }, dependencies);
  
  return component;
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (animationCallback, options = {}, dependencies = []) => {
  const component = useRef();
  
  useEffect(() => {
    if (!component.current) return;
    
    const config = { ...scrollTriggerDefaults.basic, ...options };
    const elements = component.current.querySelectorAll('[data-animate]');
    
    const ctx = gsap.context(() => {
      // Apply specified animation to each element with data-animate attribute
      elements.forEach(element => {
        const animation = animationCallback(element);
        
        ScrollTrigger.create({
          trigger: element,
          animation,
          ...config,
        });
      });
    }, component);
    
    return () => {
      ctx.revert();
      cleanupGSAP(component)();
    };
  }, dependencies);
  
  return component;
};

// Hook for staggered elements animation
export const useStaggerAnimation = (
  selector = '[data-stagger]', 
  animationProps = {}, 
  staggerProps = {},
  scrollTriggerOptions = {},
  dependencies = []
) => {
  const component = useRef();
  
  useEffect(() => {
    if (!component.current) return;
    
    const elements = component.current.querySelectorAll(selector);
    if (elements.length === 0) return;
    
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: scrollTriggerOptions.trigger ? {
          ...scrollTriggerDefaults.basic,
          ...scrollTriggerOptions,
          trigger: scrollTriggerOptions.trigger === 'self' 
            ? component.current 
            : scrollTriggerOptions.trigger
        } : null
      });
      
      tl.from(elements, {
        ...defaults.fadeIn,
        ...animationProps,
        stagger: staggerProps.stagger || 0.1,
        ease: staggerProps.ease || "power2.out",
      });
    }, component);
    
    return () => {
      ctx.revert();
    };
  }, dependencies);
  
  return component;
};

// Hook for magnetic buttons effect
export const useMagneticEffect = (options = {}, dependencies = []) => {
  const elementRef = useRef();
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
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
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, dependencies);
  
  return elementRef;
};

// Hook for parallax scrolling effect
export const useParallax = (options = {}, dependencies = []) => {
  const elementRef = useRef();
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    const defaults = {
      yPercent: 20,
      speed: 1,
      scrub: true,
      start: "top bottom",
      end: "bottom top",
    };
    
    const config = { ...defaults, ...options };
    const { yPercent, speed, ease, scrub, start, end } = config;
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start,
        end,
        scrub,
      }
    });
    
    tl.fromTo(element, 
      { yPercent: 0 },
      { yPercent: yPercent * speed, ease: ease || "none" }
    );
    
    return () => {
      tl.kill();
      ScrollTrigger.getAll()
        .filter(st => st.vars.trigger === element)
        .forEach(st => st.kill());
    };
  }, dependencies);
  
  return elementRef;
};

// Hook for text splitting (like SplitText plugin)
export const useTextSplit = (options = {}, dependencies = []) => {
  const elementRef = useRef();
  
  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    const defaults = {
      type: 'chars', // chars, words, lines
      charsClass: 'split-char',
      wordsClass: 'split-word',
      linesClass: 'split-line'
    };
    
    const config = { ...defaults, ...options };
    
    // Simple split text implementation (not as robust as SplitText plugin)
    const splitText = (el, type = 'chars') => {
      const text = el.textContent;
      el.innerHTML = '';
      
      if (type === 'chars' || type === 'both') {
        [...text].forEach(char => {
          if (char === ' ') {
            el.appendChild(document.createTextNode(' '));
          } else {
            const span = document.createElement('span');
            span.textContent = char;
            span.className = config.charsClass;
            el.appendChild(span);
          }
        });
      } else if (type === 'words' || type === 'both') {
        text.split(' ').forEach((word, i, arr) => {
          const span = document.createElement('span');
          span.textContent = word;
          span.className = config.wordsClass;
          el.appendChild(span);
          
          if (i !== arr.length - 1) {
            el.appendChild(document.createTextNode(' '));
          }
        });
      } else if (type === 'lines') {
        // Simple line splitting (not as accurate as SplitText)
        text.split('\n').forEach(line => {
          const span = document.createElement('span');
          span.textContent = line;
          span.className = config.linesClass;
          el.appendChild(span);
          el.appendChild(document.createElement('br'));
        });
      }
      
      return el;
    };
    
    splitText(element, config.type);
    
    // Return cleanup if needed
    return () => {
      // Optional: restore original text
      // element.textContent = text;
    };
  }, dependencies);
  
  return elementRef;
};

export default {
  useGSAPEffect,
  useScrollAnimation,
  useStaggerAnimation,
  useMagneticEffect,
  useParallax,
  useTextSplit
}; 