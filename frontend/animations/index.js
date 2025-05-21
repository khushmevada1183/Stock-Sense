// Re-export animation context
export * from './shared/AnimationContext';

// Re-export GSAP config and utilities
export * from './shared/gsapConfig';
export * from './shared/AnimationUtils';
export * from './shared/useGSAP';

// Page animations
import homeAnimations from './pages/homeAnimations';
import stocksAnimations from './pages/stocksAnimations';
import marketAnimations from './pages/marketAnimations';
import ipoAnimations from './pages/ipoAnimations';
import newsAnimations from './pages/newsAnimations';
import dashboardAnimations from './pages/dashboardAnimations';

// Component animations
import FeaturedStocksAnimations from './components/FeaturedStocksAnimations';
import IpoSectionAnimations from './components/IpoSectionAnimations';
import MarketOverviewAnimations from './components/MarketOverviewAnimations';
import NewsAnimations from './components/NewsAnimations';

// Layout animations
import NavigationAnimations from './layout/navigationAnimations';

// Export page animations
export const pages = {
  home: homeAnimations,
  stocks: stocksAnimations,
  market: marketAnimations,
  ipo: ipoAnimations,
  news: newsAnimations,
  dashboard: dashboardAnimations
};

// Export component animations
export const components = {
  FeaturedStocks: FeaturedStocksAnimations,
  IpoSection: IpoSectionAnimations,
  MarketOverview: MarketOverviewAnimations,
  News: NewsAnimations
};

// Export layout animations
export const layout = {
  Navigation: NavigationAnimations
};

// Default export of all animations
export default {
  pages,
  components,
  layout
}; 