// Mock Portfolio Data Service
// This service provides mock data for portfolio visualization

export interface StockHolding {
  symbol: string;
  name: string;
  quantity: number;
  lastPrice: number;
  change: number;
  changePercent: number;
  marketValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  eps: number;
  pe: number;
  bookValue: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  dayGain: number;
  dayGainPercent: number;
  riskProfile: 'Low' | 'Moderately Aggressive' | 'Aggressive' | 'Very Aggressive';
  valuationScore: number;
  sectorAllocation: {
    name: string;
    percentage: number;
  }[];
}

// Mock portfolio holdings based on the image (converted to Indian stocks)
export const getMockHoldings = (): StockHolding[] => {
  return [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      quantity: 200,
      lastPrice: 2482.88,
      change: 49.80,
      changePercent: 2.07,
      marketValue: 496576.00,
      totalCost: 460000.00,
      profitLoss: 36576.00,
      profitLossPercent: 7.31,
      dayChange: 9960.00,
      dayChangePercent: 2.07,
      eps: 75.92,
      pe: 32.54,
      bookValue: 821.17
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd',
      quantity: 300,
      lastPrice: 1578.06,
      change: 42.24,
      changePercent: 2.96,
      marketValue: 473416.50,
      totalCost: 421000.00,
      profitLoss: 52416.50,
      profitLossPercent: 11.51,
      dayChange: 12672.00,
      dayChangePercent: 2.96,
      eps: 65.51,
      pe: 24.86,
      bookValue: 212.82
    },
    {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Ltd',
      quantity: 500,
      lastPrice: 946.15,
      change: 9.45,
      changePercent: 0.98,
      marketValue: 473075.00,
      totalCost: 390000.00,
      profitLoss: 83075.00,
      profitLossPercent: 21.45,
      dayChange: 4725.00,
      dayChangePercent: 0.98,
      eps: 32.49,
      pe: 28.53,
      bookValue: 218.30
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      quantity: 20,
      lastPrice: 3514.95,
      change: 121.03,
      changePercent: 4.26,
      marketValue: 70299.00,
      totalCost: 58400.00,
      profitLoss: 11899.00,
      profitLossPercent: 22.61,
      dayChange: 2420.60,
      dayChangePercent: 4.26,
      eps: 115.44,
      pe: 30.59,
      bookValue: 222.55
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      quantity: 20,
      lastPrice: 1612.28,
      change: 54.06,
      changePercent: 3.75,
      marketValue: 32245.60,
      totalCost: 36600.00,
      profitLoss: -4354.40,
      profitLossPercent: -13.63,
      dayChange: 1081.20,
      dayChangePercent: 3.75,
      eps: 83.30,
      pe: 19.07,
      bookValue: 504.22
    },
    {
      symbol: 'ICICIBANK',
      name: 'ICICI Bank Ltd',
      quantity: 100,
      lastPrice: 1007.82,
      change: 24.63,
      changePercent: 2.28,
      marketValue: 100782.00,
      totalCost: 88000.00,
      profitLoss: 12782.00,
      profitLossPercent: 15.46,
      dayChange: 2463.00,
      dayChangePercent: 2.28,
      eps: 45.76,
      pe: 22.08,
      bookValue: 315.63
    }
  ];
};

// Mock portfolio summary based on the image (converted to INR)
export const getMockPortfolioSummary = (): PortfolioSummary => {
  return {
    totalValue: 1646394.10,
    totalCost: 1454000.00,
    totalProfitLoss: 192394.10,
    totalProfitLossPercent: 10.94,
    dayGain: 33320.30,
    dayGainPercent: 2.21,
    riskProfile: 'Moderately Aggressive',
    valuationScore: 1, // 1 = Near Fair Value, 5 = Overvalued
    sectorAllocation: [
      { name: 'Communication Services', percentage: 28.8 },
      { name: 'Technology', percentage: 39.2 },
      { name: 'Financial Services', percentage: 32.0 }
    ]
  };
}; 