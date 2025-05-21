import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTableRowHoverEffect, createNewsItemHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

// Animation for the dashboard header
export const animateDashboardHeader = (headerRef) => {
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

// Animation for stock list section
export const animateStockList = (stockListRef) => {
  if (!stockListRef.current) return;

  const stockList = stockListRef.current;
  const title = stockList.querySelector('h2, h3');
  const stockItems = stockList.querySelectorAll('.stock-item, tbody tr');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stockList,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(stockItems, {
    opacity: 0,
    y: 20,
    stagger: 0.04,
    duration: 0.4,
    ease: "power1.out"
  }, "-=0.3");

  // Use the new utility for hover effects
  createTableRowHoverEffect(stockItems);

  return tl;
};

// Animation for commodities table
export const animateCommoditiesTable = (commoditiesRef) => {
  if (!commoditiesRef.current) return;

  const commoditiesSection = commoditiesRef.current;
  const title = commoditiesSection.querySelector('h2, h3');
  const tableHeader = commoditiesSection.querySelector('thead');
  const tableRows = commoditiesSection.querySelectorAll('tbody tr');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: commoditiesSection,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(tableHeader, {
    opacity: 0,
    y: -15,
    duration: 0.4
  }, "-=0.3")
  .from(tableRows, {
    opacity: 0,
    y: 15,
    stagger: 0.05,
    duration: 0.4
  }, "-=0.2");

  // Use the new utility for hover effects
  createTableRowHoverEffect(tableRows);

  return tl;
};

// Animation for IPO table
export const animateIPOTable = (ipoRef) => {
  if (!ipoRef.current) return;

  const ipoSection = ipoRef.current;
  const title = ipoSection.querySelector('h2, h3');
  const tableHeader = ipoSection.querySelector('thead');
  const tableRows = ipoSection.querySelectorAll('tbody tr');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ipoSection,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(tableHeader, {
    opacity: 0,
    y: -15,
    duration: 0.4
  }, "-=0.3")
  .from(tableRows, {
    opacity: 0,
    y: 15,
    stagger: 0.05,
    duration: 0.4
  }, "-=0.2");

  // Use the new utility for hover effects
  createTableRowHoverEffect(tableRows);

  return tl;
};

// Animation for market news
export const animateMarketNews = (newsRef) => {
  if (!newsRef.current) return;

  const newsSection = newsRef.current;
  const title = newsSection.querySelector('h2, h3');
  const newsItems = newsSection.querySelectorAll('.news-item, article, li');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: newsSection,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(newsItems, {
    opacity: 0,
    y: 20,
    stagger: 0.08,
    duration: 0.5
  }, "-=0.3");

  // Use the new utility for news item hover effects
  createNewsItemHoverEffect(newsItems);

  return tl;
};

// Animation for high/low table
export const animateHighLowTable = (highLowRef) => {
  if (!highLowRef.current) return;

  const highLowSection = highLowRef.current;
  const title = highLowSection.querySelector('h2, h3');
  const tabs = highLowSection.querySelectorAll('button[role="tab"]');
  const tabContent = highLowSection.querySelectorAll('div[role="tabpanel"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: highLowSection,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(tabs, {
    opacity: 0,
    y: 10,
    stagger: 0.1,
    duration: 0.4
  }, "-=0.3")
  .from(tabContent, {
    opacity: 0,
    y: 15,
    duration: 0.5
  }, "-=0.2");

  return tl;
};

// Initialize all Dashboard page animations
export const initDashboardPageAnimations = (refs) => {
  const {
    headerRef,
    stockListRef,
    commoditiesRef,
    ipoTableRef,
    marketNewsRef,
    highLowRef
  } = refs;

  // Initial loading sequence
  const masterTimeline = gsap.timeline();
  
  // Animate header first
  if (headerRef?.current) {
    const headerTl = animateDashboardHeader(headerRef);
    masterTimeline.add(headerTl);
  }
  
  // Setup scroll triggered animations for other sections
  if (stockListRef?.current) {
    animateStockList(stockListRef);
  }
  
  if (commoditiesRef?.current) {
    animateCommoditiesTable(commoditiesRef);
  }
  
  if (ipoTableRef?.current) {
    animateIPOTable(ipoTableRef);
  }
  
  if (marketNewsRef?.current) {
    animateMarketNews(marketNewsRef);
  }
  
  if (highLowRef?.current) {
    animateHighLowTable(highLowRef);
  }

  // Return the master timeline
  return masterTimeline;
};

export default {
  animateDashboardHeader,
  animateStockList,
  animateCommoditiesTable,
  animateIPOTable,
  animateMarketNews,
  animateHighLowTable,
  initDashboardPageAnimations
}; 