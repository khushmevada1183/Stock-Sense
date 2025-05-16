import { gsap } from 'gsap';

// Debug flag - set to true to enable animation debugging
const DEBUG_ANIMATIONS = false;

/**
 * Debug function to help identify animation issues
 * 
 * @param {Element} element - The DOM element
 * @param {String} action - The action being performed
 * @param {Object} props - Animation properties
 */
const debugAnimation = (element, action, props) => {
  if (!DEBUG_ANIMATIONS) return;
  
  console.log(`Animation ${action}:`, {
    element: element,
    className: element.className,
    id: element.id,
    props
  });
  
  // Add a visual debug indicator
  if (action === 'enter') {
    element.style.outline = '2px solid red';
  } else {
    element.style.outline = 'none';
  }
};

/**
 * Creates hover effect for elements using GSAP that stays consistent
 * and doesn't disappear after initial hover
 * 
 * @param {NodeList|Array} elements - Elements to add hover effect to
 * @param {Object} enterProps - GSAP properties for mouseenter
 * @param {Object} leaveProps - GSAP properties for mouseleave
 * @param {Function} condition - Optional condition function to determine if animation should run
 * @returns {Function} Cleanup function to remove event listeners
 */
export const createHoverEffect = (elements, enterProps, leaveProps, condition = null) => {
  if (!elements || elements.length === 0) return () => {};
  
  const elementsArray = Array.from(elements);
  const eventListeners = [];
  
  // Create a single timeline for all hover effects
  const mainTimeline = gsap.timeline({ paused: true });
  
  elementsArray.forEach(element => {
    if (!element) return;
    
    // Apply initial styles to ensure consistent state
    gsap.set(element, {
      ...leaveProps,
      clearProps: "boxShadow,backgroundColor,scale,y,x" // Clear any existing styles
    });
    
    // Pre-create the animation instances
    const enterTween = gsap.to(element, { 
      ...enterProps,
      duration: enterProps.duration || 0.3,
      ease: enterProps.ease || "power1.out",
      overwrite: "auto"
    });
    
    const leaveTween = gsap.to(element, { 
      ...leaveProps,
      duration: leaveProps.duration || 0.3,
      ease: leaveProps.ease || "power1.out",
      overwrite: "auto"
    });
    
    // Add tweens to main timeline
    mainTimeline.add(enterTween, 0);
    
    // Event handlers with better performance
    const handleMouseEnter = () => {
      if (condition && !condition(element)) return;
      
      // Debug info
      debugAnimation(element, 'enter', enterProps);
      
      gsap.killTweensOf(element); // Kill any running animations
      gsap.to(element, { 
        ...enterProps,
        duration: enterProps.duration || 0.3,
        ease: enterProps.ease || "power1.out",
        overwrite: true // Force overwrite of any existing animations
      });
    };
    
    const handleMouseLeave = () => {
      if (condition && !condition(element)) return;
      
      // Debug info
      debugAnimation(element, 'leave', leaveProps);
      
      gsap.killTweensOf(element); // Kill any running animations
      gsap.to(element, { 
        ...leaveProps,
        duration: leaveProps.duration || 0.3,
        ease: leaveProps.ease || "power1.out",
        overwrite: true // Force overwrite of any existing animations
      });
    };
    
    // Attach event listeners
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Store for cleanup
    eventListeners.push({
      element,
      listeners: [
        { type: 'mouseenter', handler: handleMouseEnter },
        { type: 'mouseleave', handler: handleMouseLeave }
      ]
    });
  });
  
  // Return cleanup function
  return () => {
    eventListeners.forEach(({ element, listeners }) => {
      listeners.forEach(({ type, handler }) => {
        element.removeEventListener(type, handler);
      });
    });
  };
};

/**
 * Creates a stable table row hover effect with glow highlight
 * 
 * @param {NodeList|Array} rows - Table rows to add hover effect to
 * @returns {Function} Cleanup function
 */
export const createTableRowHoverEffect = (rows) => {
  return createHoverEffect(
    rows,
    { 
      backgroundColor: 'rgba(243, 244, 246, 0.5)',
      boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)', 
      duration: 0.2 
    },
    { 
      backgroundColor: 'transparent',
      boxShadow: 'none', 
      duration: 0.2 
    }
  );
};

/**
 * Creates a card hover effect with lift and shadow
 * 
 * @param {NodeList|Array} cards - Cards to add hover effect to
 * @returns {Function} Cleanup function
 */
export const createCardHoverEffect = (cards) => {
  return createHoverEffect(
    cards,
    { 
      y: -5, 
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)', 
      duration: 0.3 
    },
    { 
      y: 0, 
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)', 
      duration: 0.3 
    }
  );
};

/**
 * Creates a stable button hover effect with glow
 * 
 * @param {NodeList|Array} buttons - Buttons to add hover effect to
 * @param {Function} isActiveCondition - Function to determine if button is active
 * @returns {Function} Cleanup function
 */
export const createButtonHoverEffect = (buttons, isActiveCondition = null) => {
  return createHoverEffect(
    buttons,
    { 
      scale: 1.05, 
      backgroundColor: 'rgba(243, 244, 246, 0.7)',
      boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)',
      duration: 0.3 
    },
    { 
      scale: 1, 
      backgroundColor: 'transparent',
      boxShadow: 'none', 
      duration: 0.3 
    },
    isActiveCondition ? (el) => !isActiveCondition(el) : null
  );
};

/**
 * Creates a stable news item hover effect with glow
 * 
 * @param {NodeList|Array} newsItems - News items to add hover effect to
 * @returns {Function} Cleanup function
 */
export const createNewsItemHoverEffect = (newsItems) => {
  return createHoverEffect(
    newsItems,
    { 
      x: 5, 
      backgroundColor: 'rgba(243, 244, 246, 0.7)',
      boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)', 
      duration: 0.3 
    },
    { 
      x: 0, 
      backgroundColor: 'transparent',
      boxShadow: 'none', 
      duration: 0.3 
    }
  );
};

/**
 * Creates a special IPO item hover effect with prominent glow
 * This effect is designed to be more visible and not disappear
 * 
 * @param {NodeList|Array} ipoItems - IPO items to add hover effect to
 * @returns {Function} Cleanup function
 */
export const createIPOItemHoverEffect = (ipoItems) => {
  return createHoverEffect(
    ipoItems,
    { 
      backgroundColor: 'rgba(243, 244, 246, 0.8)',
      boxShadow: '0 0 12px rgba(16, 185, 129, 0.5), inset 0 0 3px rgba(16, 185, 129, 0.3)', 
      borderLeftColor: 'rgba(16, 185, 129, 0.8)',
      borderLeftWidth: '3px',
      x: 3,
      duration: 0.4,
      ease: "power2.out"
    },
    { 
      backgroundColor: 'transparent',
      boxShadow: 'none',
      borderLeftColor: 'transparent',
      borderLeftWidth: '0px',
      x: 0,
      duration: 0.4,
      ease: "power2.out" 
    }
  );
};

/**
 * Enable or disable animation debugging
 * @param {boolean} enable - Whether to enable debugging
 */
export const setAnimationDebugging = (enable) => {
  window.DEBUG_ANIMATIONS = enable;
  console.log(`Animation debugging ${enable ? 'enabled' : 'disabled'}`);
};

export default {
  createHoverEffect,
  createTableRowHoverEffect,
  createCardHoverEffect,
  createButtonHoverEffect,
  createNewsItemHoverEffect,
  createIPOItemHoverEffect,
  setAnimationDebugging
}; 