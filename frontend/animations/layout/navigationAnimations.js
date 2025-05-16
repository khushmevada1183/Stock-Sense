import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

/**
 * Initialize animations for the main navigation
 * 
 * @param {Object} refs - Reference object containing DOM refs
 * @returns {Object} - Collection of animation timelines and cleanup functions
 */
export const initNavigationAnimations = (refs) => {
  const {
    navbarRef,
    logoRef,
    menuItemsRef,
    userMenuRef,
    mobileMenuBtnRef
  } = refs;
  
  const timelines = {};
  const cleanupFunctions = [];
  
  // Navbar animation on page load
  if (navbarRef?.current) {
    timelines.navbar = gsap.timeline();
    
    timelines.navbar.from(navbarRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out"
    });
  }
  
  // Logo animation
  if (logoRef?.current) {
    timelines.navbar.from(logoRef.current, {
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power3.out"
    }, "-=0.3");
    
    // Add hover effect to logo
    const handleLogoHover = () => {
      gsap.to(logoRef.current, {
        scale: 1.05,
        duration: 0.2,
        ease: "power1.out"
      });
    };
    
    const handleLogoLeave = () => {
      gsap.to(logoRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power1.out"
      });
    };
    
    logoRef.current.addEventListener('mouseenter', handleLogoHover);
    logoRef.current.addEventListener('mouseleave', handleLogoLeave);
    
    // Add to cleanup functions
    cleanupFunctions.push(() => {
      if (logoRef.current) {
        logoRef.current.removeEventListener('mouseenter', handleLogoHover);
        logoRef.current.removeEventListener('mouseleave', handleLogoLeave);
      }
    });
  }
  
  // Menu items animation
  if (menuItemsRef?.current) {
    const menuItems = menuItemsRef.current.querySelectorAll('a, button, .nav-item');
    
    if (menuItems.length > 0) {
      timelines.navbar.from(menuItems, {
        opacity: 0,
        y: -10,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.2");
      
      // Add hover effects to menu items
      menuItems.forEach(item => {
        // Get initial background color
        const initialBg = window.getComputedStyle(item).backgroundColor;
        
        const handleItemHover = () => {
          gsap.to(item, {
            backgroundColor: "rgba(243, 244, 246, 0.1)",
            scale: 1.05,
            duration: 0.2,
            ease: "power1.out"
          });
        };
        
        const handleItemLeave = () => {
          gsap.to(item, {
            backgroundColor: initialBg,
            scale: 1,
            duration: 0.2,
            ease: "power1.out"
          });
        };
        
        item.addEventListener('mouseenter', handleItemHover);
        item.addEventListener('mouseleave', handleItemLeave);
        
        // Add to cleanup
        cleanupFunctions.push(() => {
          item.removeEventListener('mouseenter', handleItemHover);
          item.removeEventListener('mouseleave', handleItemLeave);
        });
      });
    }
  }
  
  // User menu animation
  if (userMenuRef?.current) {
    const userMenuBtn = userMenuRef.current.querySelector('button, .user-menu-btn');
    const userMenuDropdown = userMenuRef.current.querySelector('.dropdown, .menu-dropdown');
    
    if (userMenuBtn) {
      timelines.navbar.from(userMenuBtn, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        ease: "power3.out"
      }, "-=0.1");
      
      // Add dropdown animation
      if (userMenuDropdown) {
        // Set initial state
        gsap.set(userMenuDropdown, { 
          opacity: 0,
          y: -10,
          scale: 0.95,
          transformOrigin: "top right",
          display: "none"
        });
        
        // Create toggle animation
        const dropdownTimeline = gsap.timeline({ paused: true });
        
        dropdownTimeline.to(userMenuDropdown, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          ease: "power3.out",
          display: "block"
        });
        
        // Add click handler for user menu button
        const toggleUserMenu = () => {
          const isOpen = userMenuDropdown.classList.contains('is-open');
          
          if (isOpen) {
            dropdownTimeline.reverse();
            userMenuDropdown.classList.remove('is-open');
          } else {
            dropdownTimeline.play();
            userMenuDropdown.classList.add('is-open');
          }
        };
        
        userMenuBtn.addEventListener('click', toggleUserMenu);
        
        // Add to cleanup
        cleanupFunctions.push(() => {
          userMenuBtn.removeEventListener('click', toggleUserMenu);
          dropdownTimeline.kill();
        });
      }
    }
  }
  
  // Mobile menu button animation
  if (mobileMenuBtnRef?.current) {
    const mobileBtn = mobileMenuBtnRef.current;
    const menuBars = mobileBtn.querySelectorAll('.bar, span, line');
    
    timelines.navbar.from(mobileBtn, {
      opacity: 0,
      scale: 0.9,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.3");
    
    // Create hamburger to X animation
    if (menuBars.length > 0) {
      const toggleTimeline = gsap.timeline({ paused: true });
      
      // Animate to X shape
      toggleTimeline.to(menuBars[0], {
        y: 6,
        rotation: 45,
        duration: 0.3,
        transformOrigin: "center"
      })
      .to(menuBars[1], {
        opacity: 0,
        duration: 0.2
      }, "-=0.3")
      .to(menuBars[2], {
        y: -6,
        rotation: -45,
        duration: 0.3,
        transformOrigin: "center"
      }, "-=0.3");
      
      // Toggle animation on click
      const toggleMobileMenu = () => {
        const isOpen = mobileBtn.classList.contains('is-open');
        
        if (isOpen) {
          toggleTimeline.reverse();
          mobileBtn.classList.remove('is-open');
        } else {
          toggleTimeline.play();
          mobileBtn.classList.add('is-open');
        }
      };
      
      mobileBtn.addEventListener('click', toggleMobileMenu);
      
      // Add to cleanup
      cleanupFunctions.push(() => {
        mobileBtn.removeEventListener('click', toggleMobileMenu);
        toggleTimeline.kill();
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
  };
  
  return {
    timelines,
    cleanup
  };
};

/**
 * Create page transition animations
 * 
 * @param {Object} refs - Reference object containing DOM refs
 * @returns {Object} - Page transition animation controls
 */
export const createPageTransitions = (refs) => {
  const {
    pageWrapperRef,
    overlayRef
  } = refs;
  
  if (!pageWrapperRef?.current) {
    return {
      transitionIn: () => {},
      transitionOut: () => {},
      cleanup: () => {}
    };
  }
  
  // Create overlay if not provided
  let overlay = overlayRef?.current;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #111827;
      z-index: 9999;
      transform: translateY(100%);
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
  }
  
  // Set initial state
  gsap.set(overlay, { y: '100%' });
  
  // Create transition timelines
  const transitionOutTl = gsap.timeline({
    paused: true,
    onComplete: () => {
      // This would typically trigger the actual page navigation
      console.log('Page transition out complete');
    }
  });
  
  transitionOutTl.to(overlay, {
    y: 0,
    duration: 0.6,
    ease: "power3.inOut"
  })
  .to(pageWrapperRef.current, {
    y: -50,
    opacity: 0,
    duration: 0.4,
    ease: "power2.in"
  }, "-=0.4");
  
  const transitionInTl = gsap.timeline({
    paused: true,
    onComplete: () => {
      console.log('Page transition in complete');
    }
  });
  
  transitionInTl.to(overlay, {
    y: '-100%',
    duration: 0.6,
    ease: "power3.inOut"
  })
  .from(pageWrapperRef.current, {
    y: 50,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.3");
  
  // Return control functions
  return {
    transitionOut: (callback) => {
      transitionOutTl.eventCallback('onComplete', callback || null);
      transitionOutTl.restart();
      return transitionOutTl;
    },
    
    transitionIn: (callback) => {
      transitionInTl.eventCallback('onComplete', callback || null);
      transitionInTl.restart();
      return transitionInTl;
    },
    
    cleanup: () => {
      transitionOutTl.kill();
      transitionInTl.kill();
      
      // Remove overlay if we created it
      if (!overlayRef?.current && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }
  };
};

/**
 * Create header scroll animation that shows/hides the header based on scroll direction
 * 
 * @param {React.RefObject} headerRef - Reference to header element
 * @param {Object} options - Configuration options
 * @returns {Function} - Cleanup function
 */
export const createHeaderScrollAnimation = (headerRef, options = {}) => {
  if (!headerRef?.current) return () => {};
  
  const header = headerRef.current;
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  // Default options
  const defaults = {
    hideDistance: 50,        // Min scroll-down distance to hide header
    showInstantly: true,     // Show header instantly on scroll up
    pinUntil: 100,           // Pin header until this scroll position
    animationDuration: 0.3   // Duration of show/hide animation
  };
  
  const config = { ...defaults, ...options };
  
  // Save original styles
  const headerHeight = header.offsetHeight;
  
  // Prepare header for animation
  gsap.set(header, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 100
  });
  
  // Create show/hide animations
  const showHeader = () => {
    gsap.to(header, {
      y: 0,
      duration: config.animationDuration,
      ease: "power2.out"
    });
  };
  
  const hideHeader = () => {
    gsap.to(header, {
      y: -headerHeight,
      duration: config.animationDuration,
      ease: "power2.in"
    });
  };
  
  // Scroll handler
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const scrollDifference = currentScrollY - lastScrollY;
        
        // Pin header at top of page until certain scroll position
        if (currentScrollY < config.pinUntil) {
          showHeader();
        } 
        // Scrolling down - hide header after threshold
        else if (scrollDifference > 0 && scrollDifference > config.hideDistance) {
          hideHeader();
        } 
        // Scrolling up - show header
        else if (scrollDifference < 0) {
          if (config.showInstantly || Math.abs(scrollDifference) > config.hideDistance) {
            showHeader();
          }
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
      });
      
      ticking = true;
    }
  };
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
    gsap.set(header, { clearProps: "all" });
  };
};

/**
 * Create scroll progress indicator animation
 * 
 * @param {React.RefObject} progressBarRef - Reference to progress bar element
 * @param {Object} options - Configuration options
 * @returns {Function} - Cleanup function
 */
export const createScrollProgressAnimation = (progressBarRef, options = {}) => {
  if (!progressBarRef?.current) return () => {};
  
  const progressElement = progressBarRef.current;
  
  // Default options
  const defaults = {
    duration: 0.1,
    ease: "none",
    color: null
  };
  
  const config = { ...defaults, ...options };
  
  // Apply color if specified
  if (config.color) {
    gsap.set(progressElement, {
      backgroundColor: config.color
    });
  }
  
  const updateProgress = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
    
    gsap.to(progressElement, {
      scaleX: progress,
      duration: config.duration,
      ease: config.ease
    });
  };
  
  // Call once to set initial state
  updateProgress();
  
  // Add scroll listener
  window.addEventListener('scroll', updateProgress);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', updateProgress);
  };
};

export default {
  initNavigationAnimations,
  createPageTransitions,
  createHeaderScrollAnimation,
  createScrollProgressAnimation
}; 