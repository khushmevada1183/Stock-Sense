export interface StockData {
  id: string;
  symbol: string;
  company_name: string;
  sector_name: string;
  price_change_percentage: number;
  current_price: number;
}

export interface IpoData {
  name: string;
  symbol: string;
  date: string;
  priceRange: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl?: string;
}
