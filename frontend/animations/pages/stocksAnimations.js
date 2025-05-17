import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTableRowHoverEffect, createCardHoverEffect, createButtonHoverEffect } from '../shared/AnimationUtils';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger);

// Animation for the stocks page header
export const animateStocksHeader = (headerRef) => {
  if (!headerRef.current) return;

  const header = headerRef.current;
  const title = header.querySelector('h1');
  const searchLink = header.querySelector('a');

  // Create timeline for header animations
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.from(title, {
    opacity: 0,
    y: 20,
    duration: 0.7
  })
  .from(searchLink, {
    opacity: 0,
    y: 15,
    scale: 0.95,
    duration: 0.5
  }, "-=0.4");

  return tl;
};

// Animation for the stocks table
export const animateStocksTable = (tableRef) => {
  if (!tableRef.current) return;

  const table = tableRef.current;
  const tableHeader = table.querySelector('thead');
  const tableRows = table.querySelectorAll('tbody tr');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: table,
      start: "top 85%",
      toggleActions: "play none none none"
    }
  });

  tl.from(tableHeader, {
    opacity: 0,
    y: -20,
    duration: 0.5
  })
  .from(tableRows, {
    opacity: 0,
    y: 20,
    stagger: 0.03,
    duration: 0.4,
    ease: "power1.out"
  }, "-=0.2");

  // Use the new utility function for creating consistent hover effects
  if (tableRows.length > 0) {
    createTableRowHoverEffect(tableRows);
  }

  return tl;
};

// Animation for the notice box
export const animateNoticeBox = (noticeRef) => {
  if (!noticeRef.current) return;

  const notice = noticeRef.current;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: notice,
      start: "top 90%",
      toggleActions: "play none none none"
    }
  });

  tl.from(notice, {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: "power2.out"
  });

  return tl;
};

// Animation for stock cards (can be used in search results)
export const animateStockCards = (cardsContainerRef) => {
  if (!cardsContainerRef.current) return;

  const container = cardsContainerRef.current;
  const cards = container.querySelectorAll('.card, .stock-card');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(cards, {
    opacity: 0,
    y: 30,
    stagger: 0.08,
    duration: 0.6,
    ease: "power2.out"
  });

  // Add card hover effect
  if (cards.length > 0) {
    createCardHoverEffect(cards);
  }

  return tl;
};

// Animation for single stock details page
export const animateStockDetails = (refs) => {
  const {
    headerRef,
    priceCardRef,
    chartRef,
    infoCardsRef,
    financialsRef,
    newsRef
  } = refs;

  // Animate header section
  if (headerRef?.current) {
    const header = headerRef.current;
    const title = header.querySelector('h1');
    const subtitle = header.querySelector('p');
    const actions = header.querySelector('.actions');

    gsap.timeline().from(title, {
      opacity: 0,
      y: 20,
      duration: 0.7
    })
    .from(subtitle, {
      opacity: 0,
      y: 15,
      duration: 0.5
    }, "-=0.4")
    .from(actions, {
      opacity: 0,
      y: 10,
      duration: 0.5
    }, "-=0.3");
    
    // Add button hover effects if there are action buttons
    if (actions) {
      const buttons = actions.querySelectorAll('button, a');
      if (buttons.length > 0) {
        createButtonHoverEffect(buttons);
      }
    }
  }

  // Animate price card
  if (priceCardRef?.current) {
    gsap.from(priceCardRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      delay: 0.2,
      ease: "power2.out"
    });
  }

  // Animate chart
  if (chartRef?.current) {
    gsap.from(chartRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      scrollTrigger: {
        trigger: chartRef.current,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  }

  // Animate info cards (company overview, metrics, etc.)
  if (infoCardsRef?.current) {
    const cards = infoCardsRef.current.querySelectorAll('.card, section');
    
    gsap.from(cards, {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      scrollTrigger: {
        trigger: infoCardsRef.current,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
    
    // Add card hover effects
    if (cards.length > 0) {
      createCardHoverEffect(cards);
    }
  }

  // Animate financials section
  if (financialsRef?.current) {
    const financialsSection = financialsRef.current;
    const title = financialsSection.querySelector('h2, h3');
    const table = financialsSection.querySelector('table');
    
    gsap.timeline({
      scrollTrigger: {
        trigger: financialsSection,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    })
    .from(title, {
      opacity: 0,
      y: 20,
      duration: 0.5
    })
    .from(table, {
      opacity: 0,
      y: 20,
      duration: 0.6
    }, "-=0.2");
    
    // Add table row hover effects
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      if (rows.length > 0) {
        createTableRowHoverEffect(rows);
      }
    }
  }

  // Animate news section
  if (newsRef?.current) {
    const newsSection = newsRef.current;
    const title = newsSection.querySelector('h2, h3');
    const items = newsSection.querySelectorAll('article, .news-item');
    
    gsap.timeline({
      scrollTrigger: {
        trigger: newsSection,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    })
    .from(title, {
      opacity: 0,
      y: 20,
      duration: 0.5
    })
    .from(items, {
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.5
    }, "-=0.3");
    
    // Add news item hover effects
    if (items.length > 0) {
      createCardHoverEffect(items);
    }
  }
};

// Animation for the dashboard cards
export const animateDashboardCards = (cardsRefs) => {
  const cardsElements = document.querySelectorAll('.metric-card');
  
  if (cardsElements.length === 0) return;
  
  gsap.from(cardsElements, {
    opacity: 0,
    y: 30,
    stagger: 0.08,
    duration: 0.6,
    ease: "power2.out"
  });
  
  // Add hover effects
  createCardHoverEffect(cardsElements);
  
  return;
};

// Animation for the chart containers
export const animateChartContainers = () => {
  const chartContainers = document.querySelectorAll('.chart-container');
  
  if (chartContainers.length === 0) return;
  
  gsap.from(chartContainers, {
    opacity: 0,
    scale: 0.95,
    stagger: 0.15,
    duration: 0.7,
    ease: "power3.out"
  });
  
  return;
};

// Animation for the stocks dashboard
export const animateStocksDashboard = (refs) => {
  const {
    dashboardRef,
    headerRef,
    metricsRef,
    sectorsRef,
    stocksRef
  } = refs;
  
  // Create main timeline
  const masterTimeline = gsap.timeline();
  
  // Animate header
  if (headerRef?.current) {
    const header = headerRef.current;
    const title = header.querySelector('h1');
    const subtitle = header.querySelector('p');
    const searchLink = header.querySelector('a');
    
    const headerTl = gsap.timeline();
    
    headerTl.from(title, {
      opacity: 0,
      y: -20,
      duration: 0.7,
      ease: "power2.out"
    })
    .from(subtitle, {
      opacity: 0,
      y: -15,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.4")
    .from(searchLink, {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3");
    
    masterTimeline.add(headerTl);
  }
  
  // Animate metric cards
  if (metricsRef?.current) {
    const metricCards = metricsRef.current.querySelectorAll('.metric-card');
    
    if (metricCards.length > 0) {
      const metricsTl = gsap.timeline();
      
      metricsTl.from(metricCards, {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out"
      });
      
      // Add card hover effects
      createCardHoverEffect(metricCards);
      
      masterTimeline.add(metricsTl, "-=0.2");
    }
  }
  
  // Animate stocks table
  if (stocksRef?.current) {
    const stocksSection = stocksRef.current;
    const stocksTl = gsap.timeline({
      scrollTrigger: {
        trigger: stocksSection,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
    
    stocksTl.from(stocksSection, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: "power2.out"
    });
    
    // Animate table rows if they exist
    const table = stocksSection.querySelector('table');
    if (table) {
      const rows = table.querySelectorAll('tbody tr');
      
      if (rows.length > 0) {
        stocksTl.from(rows, {
          opacity: 0,
          y: 15,
          stagger: 0.03,
          duration: 0.4,
          ease: "power1.out"
        }, "-=0.3");
        
        // Add row hover effects
        createTableRowHoverEffect(rows);
      }
    }
    
    // Animate chart containers if they exist
    const chartContainers = stocksSection.querySelectorAll('.chart-container');
    if (chartContainers.length > 0) {
      stocksTl.from(chartContainers, {
        opacity: 0,
        scale: 0.95,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.2");
    }
  }
  
  // Animate sectors section
  if (sectorsRef?.current) {
    const sectorSection = sectorsRef.current;
    const sectorsTl = gsap.timeline({
      scrollTrigger: {
        trigger: sectorSection,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
    
    sectorsTl.from(sectorSection, {
      opacity: 0,
      y: 40,
      duration: 0.7,
      ease: "power2.out"
    });
    
    // Animate chart containers if they exist
    const chartContainers = sectorSection.querySelectorAll('.chart-container');
    if (chartContainers.length > 0) {
      sectorsTl.from(chartContainers, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3");
    }
    
    // Animate sector items if they exist
    const sectorItems = sectorSection.querySelectorAll('.px-6');
    if (sectorItems.length > 0) {
      sectorsTl.from(sectorItems, {
        opacity: 0,
        y: 15,
        stagger: 0.05,
        duration: 0.5,
        ease: "power1.out"
      }, "-=0.2");
    }
  }
  
  return masterTimeline;
};

// Initialize all Stocks page animations
export const initStocksPageAnimations = (refs) => {
  const {
    headerRef,
    tableRef,
    noticeRef
  } = refs;

  // Initial loading sequence
  const masterTimeline = gsap.timeline();
  
  // Animate header first
  if (headerRef?.current) {
    const headerTl = animateStocksHeader(headerRef);
    masterTimeline.add(headerTl);
  }
  
  // Setup scroll triggered animations
  if (tableRef?.current) {
    animateStocksTable(tableRef);
  }
  
  if (noticeRef?.current) {
    animateNoticeBox(noticeRef);
  }

  // Return the master timeline
  return masterTimeline;
};

export default {
  animateStocksHeader,
  animateStocksTable,
  animateNoticeBox,
  animateStockCards,
  animateStockDetails,
  initStocksPageAnimations,
  animateDashboardCards,
  animateChartContainers,
  animateStocksDashboard
}; 