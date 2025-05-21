import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createButtonHoverEffect, createCardHoverEffect, createNewsItemHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

// Animation for news page header section
export const animateNewsHeader = (headerRef) => {
  if (!headerRef.current) return;

  const header = headerRef.current;
  const title = header.querySelector('h1');
  const description = header.querySelector('p');

  const tl = gsap.timeline();

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.7,
    ease: "power2.out"
  })
  .from(description, {
    opacity: 0,
    y: 15,
    duration: 0.5
  }, "-=0.4");

  return tl;
};

// Animation for news filter/category tabs
export const animateNewsTabs = (tabsRef) => {
  if (!tabsRef.current) return;

  const tabsContainer = tabsRef.current;
  const tabs = tabsContainer.querySelectorAll('button, a');

  const tl = gsap.timeline();

  tl.from(tabs, {
    opacity: 0,
    y: 20,
    stagger: 0.05,
    duration: 0.5,
    ease: "power2.out"
  });

  // Use the utility function for hover effects
  // Pass condition to check if tab has 'active' class
  createButtonHoverEffect(tabs, (tab) => tab.classList.contains('active'));

  return tl;
};

// Animation for featured news article
export const animateFeaturedNews = (featuredRef) => {
  if (!featuredRef.current) return;

  const featured = featuredRef.current;
  const title = featured.querySelector('h2');
  const image = featured.querySelector('img');
  const excerpt = featured.querySelector('p');
  const button = featured.querySelector('a, button');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: featured,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(featured, {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: "power2.out"
  })
  .from(image, {
    opacity: 0,
    scale: 0.95,
    duration: 0.6
  }, "-=0.6")
  .from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  }, "-=0.4")
  .from(excerpt, {
    opacity: 0,
    y: 15,
    duration: 0.5
  }, "-=0.3")
  .from(button, {
    opacity: 0,
    y: 10,
    duration: 0.4
  }, "-=0.3");

  return tl;
};

// Animation for news grid/list
export const animateNewsGrid = (gridRef) => {
  if (!gridRef.current) return;

  const grid = gridRef.current;
  const newsCards = grid.querySelectorAll('article, .news-card, .news-item');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: grid,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(newsCards, {
    opacity: 0,
    y: 30,
    stagger: {
      each: 0.1,
      grid: "auto",
      from: "start"
    },
    duration: 0.6,
    ease: "power2.out"
  });

  // Use the utility function for card hover effects
  createCardHoverEffect(newsCards);

  return tl;
};

// Animation for news sidebar components
export const animateNewsSidebar = (sidebarRef) => {
  if (!sidebarRef.current) return;

  const sidebar = sidebarRef.current;
  const widgets = sidebar.querySelectorAll('section, .widget');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sidebar,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(widgets, {
    opacity: 0,
    x: 20,
    stagger: 0.15,
    duration: 0.6,
    ease: "power2.out"
  });

  return tl;
};

// Animation for pagination or load more button
export const animatePagination = (paginationRef) => {
  if (!paginationRef.current) return;

  const pagination = paginationRef.current;
  const buttons = pagination.querySelectorAll('button, a');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pagination,
      start: "top 90%",
      toggleActions: "play none none none"
    }
  });

  tl.from(pagination, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: "power2.out"
  })
  .from(buttons, {
    opacity: 0,
    scale: 0.9,
    stagger: 0.1,
    duration: 0.4,
    ease: "back.out(1.5)"
  }, "-=0.3");

  // Use the utility function for button hover effects
  // Pass condition to check if button has 'active' class
  createButtonHoverEffect(buttons, (button) => button.classList.contains('active'));

  return tl;
};

// Animation for news detail/single article view
export const animateNewsArticle = (articleRef) => {
  if (!articleRef.current) return;

  const article = articleRef.current;
  const title = article.querySelector('h1');
  const meta = article.querySelector('.meta, .article-meta');
  const image = article.querySelector('img');
  const paragraphs = article.querySelectorAll('p:not(.meta)');
  const shareButtons = article.querySelector('.share-buttons, .social-share');

  const tl = gsap.timeline();

  tl.from(title, {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: "power2.out"
  })
  .from(meta, {
    opacity: 0,
    y: 20,
    duration: 0.5
  }, "-=0.5")
  .from(image, {
    opacity: 0,
    y: 30,
    scale: 0.95,
    duration: 0.7
  }, "-=0.3")
  .from(paragraphs, {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.5
  }, "-=0.4");

  if (shareButtons) {
    tl.from(shareButtons, {
      opacity: 0,
      y: 20,
      duration: 0.5
    }, "-=0.3");
  }

  // Add scroll animation for reading progress
  const paragraphsArray = Array.from(paragraphs);
  paragraphsArray.forEach((paragraph, index) => {
    ScrollTrigger.create({
      trigger: paragraph,
      start: "top 70%",
      onEnter: () => {
        gsap.to(paragraph, {
          color: index % 2 === 0 ? '#121212' : '#212121',
          duration: 0.5
        });
      },
      onLeaveBack: () => {
        gsap.to(paragraph, {
          color: index % 2 === 0 ? '#333333' : '#444444',
          duration: 0.5
        });
      }
    });
  });

  return tl;
};

// Initialize all News page animations
export const initNewsPageAnimations = (refs) => {
  const {
    headerRef,
    tabsRef,
    featuredRef,
    gridRef,
    sidebarRef,
    paginationRef
  } = refs;

  // Initial loading sequence
  const masterTimeline = gsap.timeline();
  
  // Animate header first
  if (headerRef?.current) {
    const headerTl = animateNewsHeader(headerRef);
    masterTimeline.add(headerTl);
  }
  
  // Animate tabs
  if (tabsRef?.current) {
    const tabsTl = animateNewsTabs(tabsRef);
    masterTimeline.add(tabsTl, "-=0.3");
  }
  
  // Setup scroll triggered animations for other sections
  if (featuredRef?.current) {
    animateFeaturedNews(featuredRef);
  }
  
  if (gridRef?.current) {
    animateNewsGrid(gridRef);
  }
  
  if (sidebarRef?.current) {
    animateNewsSidebar(sidebarRef);
  }
  
  if (paginationRef?.current) {
    animatePagination(paginationRef);
  }

  // Return the master timeline
  return masterTimeline;
};

export default {
  animateNewsHeader,
  animateNewsTabs,
  animateFeaturedNews,
  animateNewsGrid,
  animateNewsSidebar,
  animatePagination,
  animateNewsArticle,
  initNewsPageAnimations
}; 