/**
 * Type definitions for IPO-related interfaces
 */

// Comprehensive IPO Item interface that covers all possible fields
export interface IpoItem {
  id?: number;
  company_name: string;
  symbol?: string;
  
  // Issue details
  issue_size?: string;
  price_range?: string;
  issue_price?: string;
  ipo_price?: string;
  issue_date?: string;
  issue_type?: string;
  
  // Listing details
  listing_date?: string;
  listing_price?: string;
  listing_gain?: string;
  
  // Current status
  open?: string;
  close?: string;
  subscription_status?: string;
  status?: string;
  
  // Current performance
  current_price?: string;
  current_return?: string;
  gmp?: string; // Grey Market Premium
  
  // UI elements
  logo?: string;
  
  // Documents
  rhpLink?: string;
  drhpLink?: string;
}

// Interface for upcoming IPOs
export interface UpcomingIpo extends IpoItem {
  // Additional fields specific to upcoming IPOs
}

// Interface for listed IPOs
export interface ListedIpo extends IpoItem {
  // Additional fields specific to listed IPOs
} 