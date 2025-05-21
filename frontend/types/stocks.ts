// Stock Types

export interface Stock {
  id: number;
  symbol: string;
  company_name: string;
  sector_name?: string;
  current_price: number;
  price_change_percentage: number;
  price_change?: number;
  volume?: number;
  market_cap?: number;
  pe_ratio?: number;
  eps?: number;
  dividend_yield?: number;
  year_high?: number;
  year_low?: number;
  description?: string;
}

export interface StockSearchResult {
  results: Stock[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface StockDetail extends Stock {
  financial_ratios?: {
    pe_ratio?: number;
    pb_ratio?: number;
    roe?: number;
    debt_to_equity?: number;
    current_ratio?: number;
    profit_margin?: number;
    dividend_yield?: number;
  };
  company_info?: {
    description?: string;
    founded?: string;
    ceo?: string;
    headquarters?: string;
    employees?: number;
    website?: string;
  };
  historical_data?: HistoricalDataPoint[];
}

export interface HistoricalDataPoint {
  date: string;
  price: number;
  volume?: number;
}

export interface StockNews {
  id: string | number;
  title: string;
  description: string;
  url: string;
  date: string;
  source?: string;
  imageUrl?: string;
} 