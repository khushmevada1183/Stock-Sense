# GSAP Animation System for Stock Analyzer

This animation system provides a structured way to implement rich, interactive animations throughout the Stock Analyzer application using GreenSock Animation Platform (GSAP).

## Implementation Status

We have successfully implemented the following components:

1. **Core Animation Structure**
   - Created animation contexts and utilities
   - Implemented reusable animations for pages and components
   - Added animation hooks for React integration

2. **Component Animations**
   - FeaturedStocks component with card animations
   - IPO Section with enhanced 3D card effects
   - Market Overview with chart drawing animations
   - News component with staggered item animations

3. **Layout Animations**
   - Navigation menu animations
   - Page transitions
   - Header scroll effects

4. **Animation Utilities**
   - Card hover effects
   - Button hover animations
   - Shimmer loading effects
   - SVG path drawing animations

## Folder Structure

- `/animations` - Root animation directory
  - `/shared` - Core utilities and shared configurations
    - `gsapConfig.js` - GSAP setup, defaults, and utility functions
    - `useGSAP.js` - React hooks for GSAP animations
    - `AnimationContext.js` - React context for GSAP global state
    - `AnimationUtils.js` - Reusable animation effects
  - `/components` - Component-specific animations
    - `FeaturedStocksAnimations.js` - Animations for stock cards
    - `IpoSectionAnimations.js` - Animations for IPO cards
    - `MarketOverviewAnimations.js` - Animations for market charts
    - `NewsAnimations.js` - Animations for news items
  - `/pages` - Page-specific animations
    - `ipoAnimations.js` - Animations for the IPO page
    - `stocksAnimations.js` - Animations for the stocks page
    - `marketAnimations.js` - Animations for the market page
    - `homeAnimations.js` - Animations for the home page
  - `/layout` - Layout-related animations
    - `NavigationAnimations.js` - Animations for header and navigation

## Usage Guide

### Basic Usage in Components

Import the necessary hooks and utilities:

```jsx
import { useRef, useEffect } from 'react';
import { useAnimation } from '../animations/shared/AnimationContext';
import { gsap } from 'gsap';
```

Then use them in your component:

```jsx
const MyComponent = () => {
  const { isAnimationEnabled } = useAnimation();
  const elementRef = useRef(null);
  
  useEffect(() => {
    if (!isAnimationEnabled || !elementRef.current) return;
    
    gsap.from(elementRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8
    });
  }, [isAnimationEnabled]);
  
  return <div ref={elementRef}>Animated Content</div>;
};
```

### Using Component Animations

For more complex components, use the dedicated animation modules:

```jsx
import { useRef, useEffect } from 'react';
import { useAnimation } from '../../animations/shared/AnimationContext';
import { initIpoSectionAnimations } from '../../animations/components/IpoSectionAnimations';

const IpoSection = () => {
  const { isAnimationEnabled } = useAnimation();
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const ipoCardsRef = useRef(null);
  
  useEffect(() => {
    if (!isAnimationEnabled) return;
    
    const refs = {
      containerRef,
      titleRef,
      ipoCardsRef
    };
    
    const { cleanup } = initIpoSectionAnimations(refs);
    
    // Return cleanup function
    return cleanup;
  }, [isAnimationEnabled]);
  
  return (
    <div ref={containerRef}>
      <h2 ref={titleRef}>IPO Section</h2>
      <div ref={ipoCardsRef}>
        {/* IPO cards */}
      </div>
    </div>
  );
};
```

## Best Practices

1. **Use Timeline for chaining** - For complex sequences, use GSAP timelines to organize animations
2. **Stagger smartly** - Use stagger for groups of elements instead of animating each individually
3. **Always add ease** - Use appropriate easing functions to make animations feel natural
4. **Use matchMedia** - For responsive animations, use ScrollTrigger's matchMedia
5. **Use gsap.set()** - For initial states to prevent FOUC (Flash of unstyled content)
6. **Lazy-load heavy animations** - For better initial load performance
7. **Always clean up** - Make sure to return cleanup functions from useEffect hooks

## Animation Controls

We've implemented a global animation switch to enable/disable animations:

```jsx
const { isAnimationEnabled, setAnimationEnabled } = useAnimation();

// Toggle animations
<button onClick={() => setAnimationEnabled(!isAnimationEnabled)}>
  {isAnimationEnabled ? 'Disable Animations' : 'Enable Animations'}
</button>
```

## CSS Helpers

We've added CSS utility classes to help with animations:

- `.gpu-accelerated` - Hardware-accelerated elements
- `.shimmer` - Loading shimmer effect
- `.clip-text` - Text reveal clip path animation
- `.hover-underline` - Interactive underline effect
- `.card-3d` - 3D card perspective effect
- `.draw-path` - SVG path drawing animations

## Future Enhancements

- Add more complex timeline-based animations
- Implement scroll-based animations with parallax effects
- Add physics-based animations for more realistic movements
- Implement scroll-triggered animations with ScrollTrigger plugin

## Key Features

### ScrollTrigger Animations

Use the ScrollTrigger utility to create scroll-based animations:

```jsx
import { createScrollTrigger } from '../animations/shared/gsapConfig';

// In your component:
useEffect(() => {
  if (!sectionRef.current) return;
  
  const animation = gsap.from(sectionRef.current, {
    opacity: 0,
    y: 50,
    duration: 0.8
  });
  
  const trigger = createScrollTrigger(sectionRef.current, animation, {
    start: "top 75%"
  });
  
  return () => trigger.kill();
}, []);
```

### Magnetic Buttons

Create interactive magnetic button effects:

```jsx
import { useMagneticEffect } from '../animations/shared/useGSAP';

const MyButton = () => {
  const buttonRef = useMagneticEffect({ strength: 0.3 });
  
  return (
    <button ref={buttonRef} className="...">
      Hover Me
    </button>
  );
};
```

### Staggered Animations

Animate multiple elements with staggered timing:

```jsx
import { useStaggerAnimation } from '../animations/shared/useGSAP';

const CardGrid = () => {
  const gridRef = useStaggerAnimation(
    '.card', 
    { y: 30, opacity: 0 }, 
    { stagger: 0.1 },
    { trigger: 'self', start: "top 80%" }
  );
  
  return (
    <div ref={gridRef} className="grid">
      <div className="card">Card 1</div>
      <div className="card">Card 2</div>
      <div className="card">Card 3</div>
    </div>
  );
};
```

## Performance Best Practices

1. **Use Timeline for chaining** - For complex sequences, use GSAP timelines to organize animations
2. **Stagger smartly** - Use stagger for groups of elements instead of animating each individually
3. **Always add ease** - Use appropriate easing functions to make animations feel natural
4. **Use matchMedia** - For responsive animations, use ScrollTrigger's matchMedia
5. **Use gsap.set()** - For initial states to prevent FOUC (Flash of unstyled content)
6. **Lazy-load heavy animations** - For better initial load performance

## Adding New Animations

1. Determine if your animation is for a specific component, page, or layout element
2. Add animation logic to the appropriate folder
3. Create reusable functions that accept refs and return timelines or cleanup functions
4. Use in your components through hooks or direct imports

## Troubleshooting

- If animations don't trigger, check that `isAnimationEnabled` is true in the Animation Context
- For ScrollTrigger issues, use `refreshScrollTrigger()` from the Animation Context
- Ensure all animations have proper cleanup in useEffect returns
- Check browser console for GSAP-related errors 