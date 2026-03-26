/**
 * normalizeStock.ts
 * 
 * Normalizes the NSE India API response (from stock-nse-india package) into a
 * flat, consistent shape that all frontend components expect.
 *
 * NSE India response shape (getEquityDetails):
 * {
 *   success: true,
 *   data: {
 *     info: {
 *       symbol, companyName, industry, isin, listingDate, ...
 *     },
 *     priceInfo: {
 *       lastPrice, change, pChange, previousClose, open, close, vwap,
 *       upperCP, lowerCP, pPriceBand, basePrice,
 *       intraDayHighLow: { min, max, value },
 *       weekHighLow: { min, max, minDate, maxDate, value }
 *     },
 *     industryInfo: { industry, sector, macro, basicIndustry },
 *     metadata: { series, symbol, isinid, listingDate, purpose, status,
 *                 tradingStatus, lastUpdateTime, pdSectorPe, pdSymbolPe,
 *                 pdSectorInd, ... },
 *     securityInfo: { boardStatus, tradingStatus, tradingUnit, tempSuspendedSeries,
 *                     isETFSec, isDelisted, isin, ... },
 *     sddDetails: { SDDAuditor, SDDStatus },
 *     currentMarketType: string,
 *     preOpenMarket: { ... }
 *   }
 * }
 */

export interface NormalizedStock {
  // Identifiers
  symbol: string;
  companyName: string;
  isin: string;
  series: string;
  
  // Price data
  price: number;
  lastPrice: number;
  change: number;
  pChange: number; // percent change
  previousClose: number;
  open: number;
  close: number;
  vwap: number;
  
  // Intraday range
  dayHigh: number;
  dayLow: number;
  
  // 52-week range
  yearHigh: number;
  yearLow: number;
  yearHighDate: string;
  yearLowDate: string;
  
  // Circuit limits
  upperCircuit: string;
  lowerCircuit: string;
  priceBand: string;
  
  // Industry
  industry: string;
  sector: string;
  macro: string;
  basicIndustry: string;
  
  // Metadata
  listingDate: string;
  tradingStatus: string;
  lastUpdateTime: string;
  
  // P/E data (from metadata)
  sectorPE: number | string;
  symbolPE: number | string;
  
  isPositive: boolean;
  marketStatus: string;
  marketCap: number;
  volume: number;
  
  // Raw data preserved for advanced components
  _raw: any;
}

/**
 * Safely parse a number from any value
 */
function safeNum(val: any, fallback: number = 0): number {
  if (val === null || val === undefined || val === '' || val === '-') return fallback;
  const n = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(n) ? fallback : n;
}

/**
 * Normalize the raw API response into a consistent NormalizedStock object.
 * Handles both the wrapped { success, data } format and the raw data object.
 */
export function normalizeStockData(raw: any): NormalizedStock | null {
  if (!raw) return null;
  
  // Unwrap { success, data } envelope if present
  const data = raw?.success !== undefined ? raw.data : raw;
  if (!data) return null;
  
  // Extract sub-objects
  const info = data.info || {};
  const priceInfo = data.priceInfo || {};
  const industryInfo = data.industryInfo || {};
  const metadata = data.metadata || {};
  const securityInfo = data.securityInfo || {};
  
  // Price fields
  const lastPrice = safeNum(priceInfo.lastPrice);
  const change = safeNum(priceInfo.change);
  const pChange = safeNum(priceInfo.pChange);
  const previousClose = safeNum(priceInfo.previousClose);
  const open = safeNum(priceInfo.open);
  const close = safeNum(priceInfo.close);
  const vwap = safeNum(priceInfo.vwap);
  
  // Intraday range
  const intraDayHL = priceInfo.intraDayHighLow || {};
  const dayHigh = safeNum(intraDayHL.max);
  const dayLow = safeNum(intraDayHL.min);
  
  // 52-week range
  const weekHL = priceInfo.weekHighLow || {};
  const yearHigh = safeNum(weekHL.max);
  const yearLow = safeNum(weekHL.min);
  
  // Industry
  const industry = industryInfo.industry || info.industry || metadata.pdSectorInd || 'N/A';
  const sector = industryInfo.sector || 'N/A';
  const macro = industryInfo.macro || 'N/A';
  const basicIndustry = industryInfo.basicIndustry || 'N/A';
  
  // Symbol/company
  const symbol = info.symbol || metadata.symbol || '';
  const companyName = info.companyName || metadata.companyName || symbol;
  const isin = info.isin || securityInfo.isin || '';
  // PE data from metadata
  const symbolPE = safeNum(metadata.pdSymbolPe) || metadata.pdSymbolPe || 'N/A';
  const sectorPE = safeNum(metadata.pdSectorPe) || metadata.pdSectorPe || 'N/A';
  
  // Calculate Market Cap & Volume
  const issuedSize = safeNum(securityInfo.issuedSize);
  const marketCap = lastPrice && issuedSize ? lastPrice * issuedSize : 0;
  
  // NSE volume can be scattered depending on time of day
  const preOpenVolume = safeNum(data.preOpenMarket?.totalTradedVolume);
  const priceInfoVolume = safeNum(priceInfo.totalTradedVolume) || safeNum(priceInfo.volume) || safeNum(priceInfo.quantityTraded);
  const volume = priceInfoVolume || preOpenVolume || 0;
  
  return {
    symbol,
    companyName,
    isin,
    series: metadata.series || info.series || 'EQ',
    
    price: lastPrice,
    lastPrice,
    change,
    pChange,
    previousClose,
    open,
    close,
    vwap,
    
    dayHigh,
    dayLow,
    
    yearHigh,
    yearLow,
    yearHighDate: weekHL.maxDate || '',
    yearLowDate: weekHL.minDate || '',
    
    upperCircuit: priceInfo.upperCP || 'N/A',
    lowerCircuit: priceInfo.lowerCP || 'N/A',
    priceBand: priceInfo.pPriceBand || 'N/A',
    
    industry,
    sector,
    macro,
    basicIndustry,
    
    listingDate: metadata.listingDate || info.listingDate || 'N/A',
    tradingStatus: metadata.tradingStatus || securityInfo.tradingStatus || 'Active',
    lastUpdateTime: metadata.lastUpdateTime || 'N/A',
    
    symbolPE,
    sectorPE,
    isPositive: pChange >= 0,
    marketStatus: data.currentMarketType || 'N/A',
    marketCap,
    volume,
    
    _raw: data,
  };
}

/**
 * Format price with rupee symbol and locale formatting
 */
export function formatPrice(price: number | string): string {
  const n = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(n)) return '₹N/A';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format large numbers into Cr / L / K notation
 */
export function formatLargeNumber(val: number | string): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n) || n === 0) return 'N/A';
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(2)} K`;
  return `₹${n.toFixed(2)}`;
}

/**
 * Format percent change with sign
 */
export function formatPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}
