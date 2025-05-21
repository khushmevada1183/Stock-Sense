/**
 * Interface for IPO data
 */
export interface IpoItem {
  company_name?: string;
  name?: string; // API uses 'name' instead of 'company_name'
  symbol: string;
  logo: string | null;
  price_range?: string;
  issue_size?: string;
  issue_type?: string;
  open?: string;
  close?: string;
  listing_date?: string;
  subscription_status?: string;
  status?: string; // API may use 'status' instead of 'subscription_status'
  ipo_price?: string;
  issue_price?: number; // API uses 'issue_price' as number instead of 'ipo_price' as string
  listing_price?: string | number; // Could be either string or number
  listing_gain?: string;
  listing_gains?: string; // API uses 'listing_gains' instead of 'listing_gain'
  current_price?: string;
  current_return?: string;
  min_price?: number; // API field
  max_price?: number; // API field
  rhpLink?: string | null;
  drhpLink?: string | null;
  document_url?: string; // API field for documents
  description?: string;
  lot_size?: string | number; // Could be either string or number
  min_amount?: string;
  exchange?: string;
  registrar?: string;
  listingGainPercentage?: string;
  gmp?: string; // Grey Market Premium
  subscriptionRate?: string;
  retailSubscriptionRate?: string;
  qibSubscriptionRate?: string;
  niiSubscriptionRate?: string;
  is_sme?: boolean; // API field
  bidding_start_date?: string; // API field
  bidding_end_date?: string; // API field
  additional_text?: string; // API field for additional information
}

/**
 * Interface for upcoming IPO data
 * Contains fields specific to upcoming IPOs
 */
export interface UpcomingIpo extends IpoItem {
  // Additional fields specific to upcoming IPOs can be added here
}

/**
 * Interface for listed IPO data
 * Contains fields specific to already listed IPOs
 */
export interface ListedIpo extends IpoItem {
  ipo_price: string;
  listing_price: string | number;
  listing_gain: string;
  current_price: string;
  current_return: string;
}

/**
 * Interface for IPO statistics
 */
export interface IpoStatistics {
  upcoming: number;
  active: number;
  recentlyListed: number;
}

/**
 * Interface for processed IPO API response
 */
export interface ProcessedIpoData {
  statistics: IpoStatistics;
  upcomingIPOs: IpoItem[];
  activeIPOs: IpoItem[];
  recentlyListedIPOs: IpoItem[];
} 