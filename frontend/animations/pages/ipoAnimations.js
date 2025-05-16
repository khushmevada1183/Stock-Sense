import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { createIPOItemHoverEffect, createCardHoverEffect, createButtonHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Animation for the IPO page header section
export const animateIpoHeader = (headerRef) => {
  if (!headerRef.current) return;

  const header = headerRef.current;
  const breadcrumb = header.querySelector('.text-sm'); // Breadcrumb element
  const title = header.querySelector('h1'); // Title element
  const description = header.querySelector('.text-gray-600'); // Description element

  // Create timeline for header animations
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.from(breadcrumb, {
    opacity: 0,
    y: -20,
    duration: 0.5
  })
  .from(title, {
    opacity: 0,
    y: 20,
    duration: 0.6
  }, "-=0.3")
  .from(description, {
    opacity: 0,
    y: 20,
    duration: 0.6
  }, "-=0.4");

  return tl;
};

// Animation for the "Applying for IPOs?" promo box
export const animatePromoBox = (promoBoxRef) => {
  if (!promoBoxRef.current) return;

  const promoBox = promoBoxRef.current;
  const title = promoBox.querySelector('.text-xl');
  const text = promoBox.querySelector('p');
  const button = promoBox.querySelector('a');

  // Create timeline for promo box animations
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: promoBox,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(promoBox, {
    opacity: 0,
    scale: 0.95,
    duration: 0.6,
    ease: "power2.out"
  })
  .from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  }, "-=0.3")
  .from(text, {
    opacity: 0,
    y: 15,
    duration: 0.5
  }, "-=0.3")
  .from(button, {
    opacity: 0,
    y: 10,
    scale: 0.9,
    duration: 0.5,
    ease: "back.out(1.5)"
  }, "-=0.2");

  return tl;
};

// Magnetic effect for the "Open a Demat Account" button
export const createMagneticButton = (buttonRef) => {
  if (!buttonRef.current) return;

  const button = buttonRef.current;
  const strength = 0.3;
  const radius = 100;
  let isHovered = false;
  
  // Store initial button styles to ensure proper reset
  const initialStyles = {
    scale: 1,
    x: 0,
    y: 0,
    boxShadow: window.getComputedStyle(button).boxShadow || "0 4px 12px rgba(0, 128, 0, 0.15)"
  };

  // Predefine the animations for better performance
  const enterAnimation = gsap.to(button, {
    scale: 1.05,
    boxShadow: "0 10px 25px rgba(0, 128, 0, 0.25), 0 0 15px rgba(0, 128, 0, 0.15)",
    duration: 0.3,
    ease: "power2.out",
    paused: true,
    overwrite: true
  });

  const leaveAnimation = gsap.to(button, {
    scale: 1,
    x: 0,
    y: 0,
    boxShadow: initialStyles.boxShadow,
    duration: 0.3,
    ease: "power2.out",
    paused: true,
    overwrite: true
  });

  // Mouse enter/leave events with better handling
  const handleMouseEnter = () => {
    isHovered = true;
    gsap.killTweensOf(button); // Kill any running animations
    enterAnimation.restart();
  };

  const handleMouseLeave = () => {
    isHovered = false;
    gsap.killTweensOf(button); // Kill any running animations
    leaveAnimation.restart();
  };

  // Magnetic effect with improved performance
  const handleMouseMove = (e) => {
    if (!isHovered) return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    if (distance < radius) {
      gsap.to(button, {
        x: distanceX * strength,
        y: distanceY * strength,
        duration: 0.3,
        ease: "power2.out",
        overwrite: 'auto'
      });
    } else {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "power2.out",
        overwrite: 'auto'
      });
    }
  };

  // Add event listeners
  button.addEventListener('mouseenter', handleMouseEnter);
  button.addEventListener('mouseleave', handleMouseLeave);
  button.addEventListener('mousemove', handleMouseMove);

  // Return cleanup function with proper reference to the handlers
  return () => {
    button.removeEventListener('mouseenter', handleMouseEnter);
    button.removeEventListener('mouseleave', handleMouseLeave);
    button.removeEventListener('mousemove', handleMouseMove);
    
    // Reset to initial state
    gsap.set(button, initialStyles);
  };
};

// Animation for the IPO cards (upcoming and listed)
export const animateIpoCards = (cardsContainerRef) => {
  if (!cardsContainerRef.current) return;

  const container = cardsContainerRef.current;
  const cards = container.querySelectorAll('.ipo-card');

  // Create staggered animation for cards
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top 75%",
      toggleActions: "play none none none"
    }
  });

  tl.from(cards, {
    opacity: 0,
    y: 30,
    scale: 0.95,
    stagger: 0.08,
    duration: 0.6,
    ease: "power2.out"
  });

  // Add enhanced card hover effect with light effects
  cards.forEach(card => {
    const cardHeader = card.querySelector('.p-4.flex.items-center');
    const cardContent = card.querySelector('.p-4.flex-grow');
    const cardFooter = card.querySelector('.px-4.py-3.border-t');
    
    const statusBadge = card.querySelector('.rounded-full');
    const logo = card.querySelector('.w-10.h-10');
    
    // Initial state
    gsap.set([cardHeader, cardContent, cardFooter], { 
      transformOrigin: "center center"
    });
    
    // Create hover effect
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -5,
        scale: 1.02,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Subtle movement of internal elements
      gsap.to(cardContent, {
        y: -2,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      gsap.to(cardFooter, {
        y: -1,
        duration: 0.4,
        ease: 'power2.out'
      });
      
      // Badge and logo effects
      if (statusBadge) {
        gsap.to(statusBadge, {
          scale: 1.1,
          duration: 0.3,
          ease: 'back.out(1.5)'
        });
      }
      
      if (logo) {
        gsap.to(logo, {
          rotation: 5,
          scale: 1.1,
          duration: 0.3,
          ease: 'power1.out'
        });
      }
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Reset internal elements
      gsap.to([cardContent, cardFooter], {
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      
      // Reset badge and logo
      if (statusBadge) {
        gsap.to(statusBadge, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
      
      if (logo) {
        gsap.to(logo, {
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    });
  });

  return tl;
};

// Animation for the IPO statistics cards
export const animateIpoStats = (statsContainerRef) => {
  if (!statsContainerRef?.current) return;
  
  const container = statsContainerRef.current;
  const statCards = container.querySelectorAll('.rounded-lg');
  const statNumbers = container.querySelectorAll('.text-3xl');
  
  // Initial animation for the stat cards
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top 80%"
    }
  });
  
  tl.from(statCards, {
    opacity: 0,
    y: 20,
    scale: 0.9,
    stagger: 0.15,
    duration: 0.6,
    ease: "back.out(1.5)"
  });
  
  // Count up animation for the numbers
  if (statNumbers.length) {
    statNumbers.forEach(number => {
      const targetValue = parseInt(number.textContent) || 0;
      gsap.from(number, {
        textContent: 0,
        duration: 1.5,
        ease: "power2.out",
        snap: { textContent: 1 },
        stagger: 0.2,
        delay: 0.3,
        onUpdate: function() {
          number.textContent = Math.round(this.targets()[0].textContent);
        }
      });
    });
  }
  
  // Add hover effect on stat cards
  statCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -5,
        scale: 1.05,
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: 'none',
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  });
  
  return tl;
};

// Animation for FAQ accordion
export const animateFaqAccordion = (faqRef) => {
  if (!faqRef.current) return;

  const faqContainer = faqRef.current;
  const title = faqContainer.querySelector('h2');
  const description = faqContainer.querySelector('.text-gray-500');
  const accordionItems = faqContainer.querySelectorAll('[data-state="closed"]');

  // Create timeline for FAQ section
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: faqContainer,
      start: "top 75%",
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(description, {
    opacity: 0,
    y: 10,
    duration: 0.5
  }, "-=0.3")
  .from(accordionItems, {
    opacity: 0,
    y: 20,
    stagger: 0.08,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.2");

  return tl;
};

// Animation for the news and analysis sections
export const animateNewsSection = (newsSectionRef) => {
  if (!newsSectionRef.current) return;

  const newsSection = newsSectionRef.current;
  const panels = newsSection.querySelectorAll('.bg-white');
  const newsItems = newsSection.querySelectorAll('li');

  // Create timeline for news panels with parallax effect
  gsap.from(panels, {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out",
    scrollTrigger: {
      trigger: newsSection,
      start: "top 80%",
      end: "+=200",
      toggleActions: "play none none reverse"
    }
  });

  // Add hover animations for news items using the specialized IPO hover effect
  if (newsItems.length > 0) {
    createIPOItemHoverEffect(newsItems);
  }

  return () => {
    // Cleanup will be handled by createIPOItemHoverEffect
  };
};

// Initialize all IPO page animations
export const initIpoPageAnimations = (refs) => {
  const {
    headerRef,
    promoBoxRef,
    dematButtonRef,
    upcomingCardsRef,
    newListedCardsRef,
    faqRef,
    newsSectionRef,
    statsRef
  } = refs;

  // Initial loading sequence
  const masterTimeline = gsap.timeline();
  
  // First animate the header
  if (headerRef?.current) {
    const headerTl = animateIpoHeader(headerRef);
    masterTimeline.add(headerTl);
  }
  
  // Setup magnetic effect on demat button
  if (dematButtonRef?.current) {
    createMagneticButton(dematButtonRef);
  }
  
  // Animate promo box with glowing effect
  if (promoBoxRef?.current) {
    const promoBox = promoBoxRef.current;
    
    // Animate the promo box
    const promoTl = gsap.timeline();
    promoTl.from(promoBox, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: "power2.out"
    });
    
    // Add a subtle pulsing gradient effect
    gsap.to(promoBox, {
      backgroundPosition: "100% 100%",
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true
    });
    
    masterTimeline.add(promoTl, "-=0.4");
  }
  
  // Animate IPO statistics section
  if (statsRef?.current) {
    animateIpoStats(statsRef);
  }

  // Setup scroll triggered animations
  if (upcomingCardsRef?.current) {
    animateIpoCards(upcomingCardsRef);
  }

  if (newListedCardsRef?.current) {
    animateIpoCards(newListedCardsRef);
  }

  if (faqRef?.current) {
    animateFaqAccordion(faqRef);
  }

  if (newsSectionRef?.current) {
    animateNewsSection(newsSectionRef);
  }

  return masterTimeline;
};

export default {
  animateIpoHeader,
  animatePromoBox,
  createMagneticButton,
  animateIpoCards,
  animateIpoStats,
  animateFaqAccordion,
  animateNewsSection,
  initIpoPageAnimations
}; 