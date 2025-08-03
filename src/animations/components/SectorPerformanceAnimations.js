import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register the plugin
gsap.registerPlugin(ScrollTrigger);

// Animation for the Sector Performance section
export const animateSectorPerformance = (sectorRef) => {
  if (!sectorRef.current) return;

  const sectorSection = sectorRef.current;
  const heading = sectorSection.querySelector('h2');
  const linkElement = sectorSection.querySelector('a');
  const sectorCards = sectorSection.querySelectorAll('div[class*="bg-gray-900"]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectorSection,
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
  .from(sectorCards, {
    opacity: 0,
    y: 20,
    stagger: 0.05,
    duration: 0.4,
    ease: "power2.out"
  }, "-=0.3");

  return tl;
};
