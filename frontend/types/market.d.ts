/**
 * Type definitions for market-related interfaces
 */

// Base market index interface
export interface BaseMarketIndex {
  symbol: string;
  name: string;
  value: number | string;
  change?: number | string;
}

// Market index with required changePercent property
export interface IndexData extends BaseMarketIndex {
  changePercent: number | string;
}

// Market index from API response
export interface MarketIndex extends BaseMarketIndex {
  change_percent?: number | string;
  percent_change?: number | string;
  change_direction?: 'up' | 'down' | 'neutral';
  last_updated?: string;
}

// Type assertion function to convert MarketIndex to IndexData
export function asIndexData(marketIndex: MarketIndex): IndexData {
  return {
    ...marketIndex,
    changePercent: marketIndex.change_percent || marketIndex.percent_change || 0,
  };
} 