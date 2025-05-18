/**
 * Data Normalizers
 * Utility functions to normalize API responses to consistent formats
 */
import { StockDetails, HistoricalDataPoint } from '../types';

/**
 * Normalize stock details to a consistent format
 * @param stock Stock details from any API
 * @returns Normalized stock details
 */
export function normalizeStockDetails(stock: any): StockDetails {
  if (!stock) {
    return {} as StockDetails;
  }
  
  return {
    // Use standard fields or their alternatives
    symbol: stock.symbol,
    name: stock.name || stock.companyName || stock.company_name,
    companyName: stock.companyName || stock.company_name || stock.name,
    company_name: stock.company_name || stock.companyName || stock.name,
    
    // Price information
    current_price: stock.current_price || stock.price || stock.lastPrice || stock.last_price,
    price: stock.price || stock.current_price || stock.lastPrice || stock.last_price,
    lastPrice: stock.lastPrice || stock.last_price || stock.current_price || stock.price,
    last_price: stock.last_price || stock.lastPrice || stock.current_price || stock.price,
    
    // Change information
    change: stock.change || 0,
    percent_change: stock.percent_change || stock.changePercent || 0,
    changePercent: stock.changePercent || stock.percent_change || 0,
    
    // Market information
    market_cap: stock.market_cap || stock.marketCap,
    pe_ratio: stock.pe_ratio || stock.peRatio,
    eps: stock.eps,
    dividend_yield: stock.dividend_yield || stock.dividendYield,
    
    // Volume information
    volume: stock.volume || 0,
    average_volume: stock.average_volume || stock.averageVolume || 0,
    
    // 52-week information
    year_high: stock.year_high || stock.yearHigh || stock['52WeekHigh'],
    year_low: stock.year_low || stock.yearLow || stock['52WeekLow'],
    
    // Exchange information
    bse_price: stock.bse_price || stock.bsePrice,
    nse_price: stock.nse_price || stock.nsePrice,
    
    // Classification
    sector: stock.sector,
    industry: stock.industry,
    
    // Additional fields
    tickerId: stock.tickerId || stock.ticker_id,
    
    // Preserve any other fields
    ...stock
  };
}

/**
 * Normalize historical data to a consistent format
 * @param data Historical data from any API
 * @returns Normalized historical data points
 */
export function normalizeHistoricalData(data: any): HistoricalDataPoint[] {
  if (!data) {
    return [];
  }
  
  // Handle different response formats
  
  // Format 1: Array of objects with date and price
  if (Array.isArray(data)) {
    return data.map(point => ({
      date: point.date || point.timestamp,
      price: parseFloat(point.price || point.close || point.value || '0'),
      volume: point.volume ? parseInt(point.volume, 10) : undefined
    }));
  }
  
  // Format 2: Object with dates as keys and prices as values
  if (typeof data === 'object' && !Array.isArray(data)) {
    // Check if it's a nested structure with data property
    const dataPoints = data.data || data.prices || data.history || data;
    
    if (Array.isArray(dataPoints)) {
      return normalizeHistoricalData(dataPoints);
    }
    
    // Handle object format with dates as keys
    return Object.entries(dataPoints).map(([date, value]) => {
      // Handle case where value is an object
      const price = typeof value === 'object' 
        ? (value as any).price || (value as any).close || (value as any).value
        : value;
        
      return {
        date,
        price: parseFloat(price as string || '0'),
        volume: typeof value === 'object' ? parseInt((value as any).volume, 10) : undefined
      };
    });
  }
  
  // Unknown format
  console.error('Unknown historical data format:', data);
  return [];
}

/**
 * Normalize news items to a consistent format
 * @param news News items from any API
 * @returns Normalized news items
 */
export function normalizeNewsItems(news: any[]): any[] {
  if (!news || !Array.isArray(news)) {
    return [];
  }
  
  return news.map(item => ({
    id: item.id || item.news_id || item.articleId || generateId(),
    title: item.title || item.headline || '',
    description: item.description || item.summary || item.content || '',
    url: item.url || item.link || '',
    date: item.date || item.published_at || item.publishedAt || new Date().toISOString(),
    source: item.source || item.publisher || '',
    imageUrl: item.imageUrl || item.image_url || item.image || ''
  }));
}

/**
 * Generate a random ID for items that don't have one
 * @returns Random ID string
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
} 