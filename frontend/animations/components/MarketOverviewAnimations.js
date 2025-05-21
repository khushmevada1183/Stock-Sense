import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createCardHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize animations for Market Overview component
 * 
 * @param {Object} refs - Reference object containing DOM refs
 * @returns {Object} - Collection of animation timelines and cleanup functions
 */
export const initMarketOverviewAnimations = (refs) => {
  const {
    containerRef,
    titleRef,
    chartRef,
    indicesRef,
    statsRef
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
  
  // Chart animation with drawing effect
  if (chartRef?.current) {
    timelines.chart = gsap.timeline({
      scrollTrigger: {
        trigger: chartRef.current,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
    
    // Find all SVG paths in the chart
    const paths = chartRef.current.querySelectorAll('path');
    const lines = chartRef.current.querySelectorAll('line');
    const texts = chartRef.current.querySelectorAll('text');
    
    // Create drawing animation for paths (if any)
    if (paths.length > 0) {
      paths.forEach(path => {
        // Save original values to restore them after animation
        const length = path.getTotalLength ? path.getTotalLength() : 100;
        
        // Set initial state for the drawing animation
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          opacity: 0.3
        });
        
        // Add to timeline
        timelines.chart.to(path, {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power2.inOut"
        }, "-=1.3"); // Overlap animations slightly
      });
    }
    
    // Animate grid lines
    if (lines.length > 0) {
      timelines.chart.from(lines, {
        opacity: 0,
        scaleX: 0.8,
        duration: 0.8,
        stagger: 0.05,
        ease: "power1.out"
      }, "-=1");
    }
    
    // Animate text labels
    if (texts.length > 0) {
      timelines.chart.from(texts, {
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.03,
        ease: "power1.out"
      }, "-=0.8");
    }
  }
  
  // Market indices animation
  if (indicesRef?.current) {
    const indices = indicesRef.current.querySelectorAll('.index-card, .market-index');
    
    if (indices.length > 0) {
      timelines.indices = gsap.timeline({
        scrollTrigger: {
          trigger: indicesRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
      
      // Animate indices with stagger
      timelines.indices.from(indices, {
        opacity: 0,
        y: 15,
        scale: 0.95,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
      });
      
      // Add hover effect to indices
      const hoverCleanup = createCardHoverEffect(indices);
      cleanupFunctions.push(hoverCleanup);
      
      // Add number counting animation for index values
      indices.forEach(index => {
        const valueElement = index.querySelector('.value, .text-lg, .font-bold');
        const changeElement = index.querySelector('.change, .text-green-500, .text-red-500');
        
        if (valueElement) {
          // Get the target value
          const targetValue = parseFloat(valueElement.textContent.replace(/[^0-9.-]+/g, ''));
          
          // Set initial value
          valueElement.textContent = '0';
          
          // Create the counting animation
          gsap.to(valueElement, {
            duration: 2,
            ease: "power2.out",
            innerText: targetValue.toFixed(2),
            snap: { innerText: 0.01 },
            scrollTrigger: {
              trigger: valueElement,
              start: "top 90%"
            }
          });
        }
        
        if (changeElement) {
          // Create a subtle pulse animation for the change indicator
          gsap.from(changeElement, {
            scale: 0.9,
            opacity: 0,
            duration: 0.5,
            delay: 0.8
          });
        }
      });
    }
  }
  
  // Market statistics animation
  if (statsRef?.current) {
    const statItems = statsRef.current.querySelectorAll('.stat-item, .market-stat');
    
    if (statItems.length > 0) {
      timelines.stats = gsap.timeline({
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
      
      // Animate stat items with stagger and slide effect
      timelines.stats.from(statItems, {
        opacity: 0,
        x: 20,
        stagger: 0.08,
        duration: 0.5,
        ease: "power1.out"
      });
      
      // Add value counting animation
      statItems.forEach(item => {
        const valueElement = item.querySelector('.value, .font-semibold');
        
        if (valueElement) {
          const content = valueElement.textContent;
          
          // Check if it's a percentage or number value
          if (content.includes('%') || !isNaN(parseFloat(content))) {
            const targetValue = parseFloat(content.replace(/[^0-9.-]+/g, ''));
            const isPercentage = content.includes('%');
            
            // Set initial value to 0
            valueElement.textContent = isPercentage ? '0%' : '0';
            
            // Create the counting animation
            gsap.to(valueElement, {
              duration: 1.5,
              ease: "power1.inOut",
              innerText: targetValue,
              snap: { innerText: 0.1 },
              onUpdate: () => {
                valueElement.textContent = valueElement.textContent + (isPercentage ? '%' : '');
              },
              scrollTrigger: {
                trigger: valueElement,
                start: "top 90%"
              }
            });
          }
        }
      });
    }
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
 * Animates chart data updates with smooth transitions
 * 
 * @param {React.RefObject} chartRef - Reference to chart container
 * @param {Function} updateChart - Function to update chart with new data
 * @returns {Function} - Function to trigger animated chart update
 */
export const createChartUpdateAnimation = (chartRef, updateChart) => {
  if (!chartRef?.current) return () => {};
  
  return (newData) => {
    // First fade out the current chart
    gsap.to(chartRef.current, {
      opacity: 0.3,
      duration: 0.3,
      onComplete: () => {
        // Update chart data
        updateChart(newData);
        
        // Fade in updated chart
        gsap.to(chartRef.current, {
          opacity: 1,
          duration: 0.5,
          delay: 0.1
        });
        
        // Find all updated paths and animate them
        const paths = chartRef.current.querySelectorAll('path');
        paths.forEach(path => {
          if (path.getTotalLength) {
            const length = path.getTotalLength();
            
            // Draw path animation
            gsap.fromTo(path, 
              { strokeDasharray: length, strokeDashoffset: length },
              { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }
            );
          }
        });
      }
    });
  };
};

/**
 * Create subtle live update animation for market indices
 * 
 * @param {NodeList|Array} indexElements - Index elements to animate on update
 * @returns {Function} - Function to trigger the update animation
 */
export const createIndexUpdateAnimation = (indexElements) => {
  if (!indexElements || indexElements.length === 0) return () => {};
  
  // Convert to array if needed
  const elements = Array.from(indexElements);
  
  return (newValues) => {
    elements.forEach((element, index) => {
      const newValue = newValues[index];
      if (!newValue) return;
      
      const valueElement = element.querySelector('.value, .text-lg, .font-bold');
      const changeElement = element.querySelector('.change, .text-green-500, .text-red-500');
      
      if (valueElement && newValue.value) {
        // Highlight and update the value
        gsap.to(valueElement, {
          backgroundColor: "rgba(255, 255, 150, 0.3)",
          duration: 0.2,
          onComplete: () => {
            // Update the value
            valueElement.textContent = newValue.value;
            
            // Fade out the highlight
            gsap.to(valueElement, {
              backgroundColor: "rgba(255, 255, 150, 0)",
              duration: 0.5
            });
          }
        });
      }
      
      if (changeElement && newValue.change !== undefined) {
        // Determine if this is an increase or decrease
        const isPositive = parseFloat(newValue.change) >= 0;
        
        // Update class for color
        if (isPositive) {
          changeElement.classList.remove('text-red-500');
          changeElement.classList.add('text-green-500');
        } else {
          changeElement.classList.remove('text-green-500');
          changeElement.classList.add('text-red-500');
        }
        
        // Animate the change
        gsap.fromTo(changeElement, 
          { scale: 0.8, opacity: 0.5 },
          { scale: 1, opacity: 1, duration: 0.3 }
        );
        
        // Update content
        changeElement.textContent = newValue.change;
      }
    });
  };
};

export default {
  initMarketOverviewAnimations,
  createChartUpdateAnimation,
  createIndexUpdateAnimation
}; 