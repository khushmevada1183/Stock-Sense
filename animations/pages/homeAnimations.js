import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Ensure plugins are registered
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Animation for the Hero section
export const animateHeroSection = (heroRef) => {
  if (!heroRef.current) return;

  const hero = heroRef.current;
  const heading = hero.querySelector('h1');
  const paragraph = hero.querySelector('p');
  const buttons = hero.querySelectorAll('a');

  // Create timeline for hero animations
  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

  tl.from(heading, {
    opacity: 0,
    y: 30,
    duration: 0.8
  })
  .from(paragraph, {
    opacity: 0,
    y: 20,
    duration: 0.6
  }, "-=0.4")
  .from(buttons, {
    opacity: 0,
    y: 20,
    stagger: 0.15,
    duration: 0.5
  }, "-=0.3");

  return tl;
};

// Animation for the Market Overview section
export const animateMarketOverview = (overviewRef) => {
  if (!overviewRef.current) return;

  const overview = overviewRef.current;
  const heading = overview.querySelector('h2');
  const cards = overview.querySelectorAll('.card, .market-card');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: overview,
      start: "top 75%",
      toggleActions: "play none none none"
    }
  });

  tl.from(heading, {
    opacity: 0,
    y: 20,
    duration: 0.6
  })
  .from(cards, {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.3");

  return tl;
};

// Animation for the Featured Stocks section
export const animateFeaturedStocks = (stocksRef) => {
  if (!stocksRef.current) return;

  const stocksSection = stocksRef.current;
  const heading = stocksSection.querySelector('h2');
  const linkElement = stocksSection.querySelector('a');
  const cards = stocksSection.querySelectorAll('.stock-card');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stocksSection,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(heading, {
    opacity: 0,
    x: -20,
    duration: 0.5
  })
  .from(linkElement, {
    opacity: 0,
    x: 20,
    duration: 0.5
  }, "-=0.5")
  .from(cards, {
    opacity: 0,
    y: 40,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.2");

  return tl;
};

// Animation for the IPO Section
export const animateIpoSection = (ipoRef) => {
  if (!ipoRef.current) return;

  const ipoSection = ipoRef.current;
  const heading = ipoSection.querySelector('h2');
  const linkElement = ipoSection.querySelector('a');
  const ipoItems = ipoSection.querySelectorAll('.ipo-item, .card');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ipoSection,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(heading, {
    opacity: 0,
    x: -20,
    duration: 0.5
  })
  .from(linkElement, {
    opacity: 0,
    x: 20,
    duration: 0.5
  }, "-=0.5")
  .from(ipoItems, {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.6,
    ease: "power2.out"
  }, "-=0.2");

  return tl;
};

// Animation for the Latest News section
export const animateLatestNews = (newsRef) => {
  if (!newsRef.current) return;

  const newsSection = newsRef.current;
  const heading = newsSection.querySelector('h2');
  const linkElement = newsSection.querySelector('a');
  const newsItems = newsSection.querySelectorAll('.news-item, article');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: newsSection,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(heading, {
    opacity: 0,
    x: -20,
    duration: 0.5
  })
  .from(linkElement, {
    opacity: 0,
    x: 20,
    duration: 0.5
  }, "-=0.5")
  .from(newsItems, {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.2");

  return tl;
};

// Animation for the Analysis Features section
export const animateAnalysisFeatures = (featuresRef) => {
  if (!featuresRef.current) return;

  const featuresSection = featuresRef.current;
  const heading = featuresSection.querySelector('h2');
  const description = featuresSection.querySelector('p');
  const cards = featuresSection.querySelectorAll('.feature-card, .card');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: featuresSection,
      start: "top 75%",
      toggleActions: "play none none none"
    }
  });

  tl.from(heading, {
    opacity: 0,
    y: 20,
    duration: 0.6
  })
  .from(description, {
    opacity: 0,
    y: 20,
    duration: 0.6
  }, "-=0.4")
  .from(cards, {
    opacity: 0,
    y: 40,
    stagger: 0.08,
    duration: 0.7,
    ease: "power2.out"
  }, "-=0.3");

  return tl;
};

// Animation for the CTA Section
export const animateCtaSection = (ctaRef) => {
  if (!ctaRef.current) return;

  const ctaSection = ctaRef.current;
  const heading = ctaSection.querySelector('h3, h2');
  const paragraph = ctaSection.querySelector('p');
  const button = ctaSection.querySelector('a');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ctaSection,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  tl.from(ctaSection, {
    opacity: 0,
    scale: 0.95,
    duration: 0.7,
    ease: "power2.out"
  })
  .from(heading, {
    opacity: 0,
    y: 20,
    duration: 0.6
  }, "-=0.5")
  .from(paragraph, {
    opacity: 0,
    y: 15,
    duration: 0.6
  }, "-=0.4")
  .from(button, {
    opacity: 0,
    y: 10,
    scale: 0.9,
    duration: 0.5,
    ease: "back.out(1.7)"
  }, "-=0.3");

  return tl;
};

// Initialize all Home page animations
export const initHomePageAnimations = (refs) => {
  const {
    heroRef,
    marketOverviewRef,
    featuredStocksRef,
    ipoSectionRef,
    latestNewsRef,
    analysisFeaturesRef,
    ctaSectionRef
  } = refs;

  // Initial loading sequence
  const masterTimeline = gsap.timeline();
  
  // Animate the hero section first
  if (heroRef?.current) {
    const heroTl = animateHeroSection(heroRef);
    masterTimeline.add(heroTl);
  }
  
  // Setup scroll triggered animations for other sections
  if (marketOverviewRef?.current) {
    animateMarketOverview(marketOverviewRef);
  }
  
  if (featuredStocksRef?.current) {
    animateFeaturedStocks(featuredStocksRef);
  }
  
  if (ipoSectionRef?.current) {
    animateIpoSection(ipoSectionRef);
  }
  
  if (latestNewsRef?.current) {
    animateLatestNews(latestNewsRef);
  }
  
  if (analysisFeaturesRef?.current) {
    animateAnalysisFeatures(analysisFeaturesRef);
  }
  
  if (ctaSectionRef?.current) {
    animateCtaSection(ctaSectionRef);
  }

  // Return the master timeline
  return masterTimeline;
};

export default {
  animateHeroSection,
  animateMarketOverview,
  animateFeaturedStocks,
  animateIpoSection,
  animateLatestNews,
  animateAnalysisFeatures,
  animateCtaSection,
  initHomePageAnimations
}; 