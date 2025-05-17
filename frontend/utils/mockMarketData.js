/**
 * Mock data for Indian stock market dashboard
 * For development and demonstration purposes only
 */

// Sector data including growth percentage and market cap percentage
export const sectorData = [
  { sector: 'Financial Services', growth: 8.7, marketCap: 26.5 },
  { sector: 'IT & Technology', growth: 12.5, marketCap: 22.3 },
  { sector: 'Oil & Gas', growth: -4.2, marketCap: 15.8 },
  { sector: 'Pharmaceuticals', growth: 7.3, marketCap: 12.9 },
  { sector: 'FMCG', growth: 5.1, marketCap: 10.5 },
  { sector: 'Automobile', growth: 3.8, marketCap: 8.7 },
  { sector: 'Metals & Mining', growth: -2.6, marketCap: 3.3 }
];

// Market metrics with overall market statistics
export const marketMetrics = {
  marketCap: 375.42, // in trillion rupees
  peRatio: 22.4,
  volume: 1.57, // in trillion rupees
  volatility: 16.8,
  gainers: 1253,
  losers: 813,
  unchanged: 187,
  recentHighs: 182,
  recentLows: 94,
};

// Major Indian market indices
export const indices = [
  { name: 'Sensex', value: 81354.32, change: 1.23 },
  { name: 'Nifty 50', value: 24628.75, change: 1.15 },
  { name: 'Nifty Bank', value: 48721.65, change: 0.89 },
  { name: 'Nifty IT', value: 32145.82, change: -0.56 },
  { name: 'Nifty Midcap 100', value: 46782.15, change: 1.32 },
  { name: 'Nifty Smallcap 100', value: 15938.47, change: 1.48 },
];

// Mock stock data for top companies
export const topIndianStocks = [
  {
    id: 1,
    symbol: 'RELIANCE',
    company_name: 'Reliance Industries Ltd.',
    sector_name: 'Oil & Gas',
    current_price: 2953.75,
    price_change_percentage: 1.27,
    volume: 2536789,
    day_high: 2975.30,
    day_low: 2941.10
  },
  {
    id: 2,
    symbol: 'TCS',
    company_name: 'Tata Consultancy Services Ltd.',
    sector_name: 'IT & Technology',
    current_price: 3856.45,
    price_change_percentage: -0.89,
    volume: 1236547,
    day_high: 3890.15,
    day_low: 3842.30
  },
  {
    id: 3,
    symbol: 'HDFCBANK',
    company_name: 'HDFC Bank Ltd.',
    sector_name: 'Financial Services',
    current_price: 1676.80,
    price_change_percentage: 0.74,
    volume: 3214569,
    day_high: 1683.25,
    day_low: 1662.90
  },
  {
    id: 4,
    symbol: 'INFY',
    company_name: 'Infosys Ltd.',
    sector_name: 'IT & Technology',
    current_price: 1587.35,
    price_change_percentage: -1.21,
    volume: 1876543,
    day_high: 1604.55,
    day_low: 1581.10
  },
  {
    id: 5,
    symbol: 'ICICIBANK',
    company_name: 'ICICI Bank Ltd.',
    sector_name: 'Financial Services',
    current_price: 1123.50,
    price_change_percentage: 0.93,
    volume: 2654321,
    day_high: 1127.80,
    day_low: 1115.40
  },
  {
    id: 6,
    symbol: 'HINDUNILVR',
    company_name: 'Hindustan Unilever Ltd.',
    sector_name: 'FMCG',
    current_price: 2546.70,
    price_change_percentage: 0.56,
    volume: 987654,
    day_high: 2558.90,
    day_low: 2535.10
  },
  {
    id: 7,
    symbol: 'SUNPHARMA',
    company_name: 'Sun Pharmaceutical Industries Ltd.',
    sector_name: 'Pharmaceuticals',
    current_price: 1278.25,
    price_change_percentage: 2.34,
    volume: 1234567,
    day_high: 1285.40,
    day_low: 1249.80
  },
  {
    id: 8,
    symbol: 'MARUTI',
    company_name: 'Maruti Suzuki India Ltd.',
    sector_name: 'Automobile',
    current_price: 10875.40,
    price_change_percentage: 1.78,
    volume: 345678,
    day_high: 10924.60,
    day_low: 10820.15
  },
  {
    id: 9,
    symbol: 'TATASTEEL',
    company_name: 'Tata Steel Ltd.',
    sector_name: 'Metals & Mining',
    current_price: 147.65,
    price_change_percentage: -0.83,
    volume: 5678901,
    day_high: 149.80,
    day_low: 146.90
  },
  {
    id: 10,
    symbol: 'WIPRO',
    company_name: 'Wipro Ltd.',
    sector_name: 'IT & Technology',
    current_price: 478.25,
    price_change_percentage: -1.45,
    volume: 1987654,
    day_high: 486.70,
    day_low: 476.90
  }
];

// Mock trading volume data (in trillions) for the last 7 days
export const weeklyVolumeData = [
  { date: '12 Aug', volume: 1.42 },
  { date: '13 Aug', volume: 1.38 },
  { date: '14 Aug', volume: 1.57 },
  { date: '15 Aug', volume: 1.49 },
  { date: '16 Aug', volume: 1.64 },
  { date: '17 Aug', volume: 1.53 },
  { date: '18 Aug', volume: 1.61 }
];

// Export all mock data together
export default {
  sectorData,
  marketMetrics,
  indices,
  topIndianStocks,
  weeklyVolumeData
}; 