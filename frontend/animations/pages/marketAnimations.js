import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTableRowHoverEffect, createCardHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

// Animation for market page title/header
export const animateMarketHeader = (headerRef) => {
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
    y: 20,
    duration: 0.5
  }, "-=0.4");

  return tl;
};

// Animation for market indices section
export const animateMarketIndices = (indicesRef) => {
  if (!indicesRef.current) return;

  const indicesSection = indicesRef.current;
  const indexCards = indicesSection.querySelectorAll('div[class*="grid-cols"] > div');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: indicesSection,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(indexCards, {
    opacity: 0,
    y: 20,
    stagger: 0.08,
    duration: 0.5,
    ease: "power2.out"
  });

  return tl;
};

// Animation for sector performance chart
export const animateSectorPerformance = (sectorRef) => {
  if (!sectorRef.current) return;

  const sectorSection = sectorRef.current;
  const title = sectorSection.querySelector('h3');
  const chart = sectorSection.querySelector('.recharts-responsive-container');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectorSection,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: "power2.out"
  })
  .from(chart, {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: "power2.out"
  }, "-=0.3");

  return tl;
};

// Animation for market breadth section (pie chart)
export const animateMarketBreadth = (breadthRef) => {
  if (!breadthRef.current) return;

  const breadthSection = breadthRef.current;
  const title = breadthSection.querySelector('h3');
  const stats = breadthSection.querySelectorAll('.grid-cols-3 > div');
  const chart = breadthSection.querySelector('.recharts-responsive-container');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: breadthSection,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(stats, {
    opacity: 0,
    y: 15,
    stagger: 0.1,
    duration: 0.4
  }, "-=0.3")
  .from(chart, {
    opacity: 0,
    scale: 0.9,
    duration: 0.7,
    ease: "back.out(1.2)"
  }, "-=0.2");

  return tl;
};

// Animation for top movers (gainers/losers)
export const animateTopMovers = (moversRef) => {
  if (!moversRef.current) return;

  const moversSection = moversRef.current;
  const tabs = moversSection.querySelectorAll('button[role="tab"]');
  const title = moversSection.querySelector('h3');
  const tableRows = moversSection.querySelectorAll('tbody tr');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: moversSection,
      start: "top 80%",
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
    y: 15,
    stagger: 0.1,
    duration: 0.4
  }, "-=0.3")
  .from(tableRows, {
    opacity: 0,
    y: 20,
    stagger: 0.05,
    duration: 0.3
  }, "-=0.2");

  // Use the new utility function for hover effects
  createTableRowHoverEffect(tableRows);

  return tl;
};

// Animation for most active stocks
export const animateMostActive = (activeRef) => {
  if (!activeRef.current) return;

  const activeSection = activeRef.current;
  const title = activeSection.querySelector('h3');
  const tableRows = activeSection.querySelectorAll('tbody tr');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: activeSection,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(tableRows, {
    opacity: 0,
    y: 20,
    stagger: 0.05,
    duration: 0.4
  }, "-=0.2");

  // Use the new utility function for hover effects
  createTableRowHoverEffect(tableRows);

  return tl;
};

// Animation for heat map
export const animateHeatMap = (heatMapRef) => {
  if (!heatMapRef.current) return;

  const heatMapSection = heatMapRef.current;
  const title = heatMapSection.querySelector('h3');
  const sectors = heatMapSection.querySelectorAll('.sector-group');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heatMapSection,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(sectors, {
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.6
  }, "-=0.3");

  // Create hover effects for heat map items using the new utility
  const heatMapItems = heatMapSection.querySelectorAll('.heat-map-item');
  createCardHoverEffect(heatMapItems);

  return tl;
};

// Animation for analysis section
export const animateAnalysisSection = (analysisRef) => {
  if (!analysisRef.current) return;

  const analysisSection = analysisRef.current;
  const title = analysisSection.querySelector('h3');
  const content = analysisSection.querySelectorAll('p, div.text-content');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: analysisSection,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.5
  })
  .from(content, {
    opacity: 0,
    y: 20,
    stagger: 0.1,
    duration: 0.5
  }, "-=0.3");

  return tl;
};

// Initialize all Market page animations
export const initMarketPageAnimations = (refs) => {
  const {
    headerRef,
    indicesRef,
    sectorRef,
    breadthRef,
    moversRef,
    activeRef,
    heatMapRef,
    analysisRef
  } = refs;

  // Initial loading sequence
  const masterTimeline = gsap.timeline();
  
  // Animate the header first
  if (headerRef?.current) {
    const headerTl = animateMarketHeader(headerRef);
    masterTimeline.add(headerTl);
  }
  
  // Setup scroll triggered animations for other sections
  if (indicesRef?.current) {
    animateMarketIndices(indicesRef);
  }
  
  if (sectorRef?.current) {
    animateSectorPerformance(sectorRef);
  }
  
  if (breadthRef?.current) {
    animateMarketBreadth(breadthRef);
  }
  
  if (moversRef?.current) {
    animateTopMovers(moversRef);
  }
  
  if (activeRef?.current) {
    animateMostActive(activeRef);
  }
  
  if (heatMapRef?.current) {
    animateHeatMap(heatMapRef);
  }
  
  if (analysisRef?.current) {
    animateAnalysisSection(analysisRef);
  }

  // Return the master timeline
  return masterTimeline;
};

export default {
  animateMarketHeader,
  animateMarketIndices,
  animateSectorPerformance,
  animateMarketBreadth,
  animateTopMovers,
  animateMostActive,
  animateHeatMap,
  animateAnalysisSection,
  initMarketPageAnimations
}; 