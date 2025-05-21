import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// This is a mock component for testing purposes
// In a real implementation, you would import your actual component
const StockCard = ({ stock }) => (
  <div data-testid="stock-card">
    <h3 data-testid="stock-name">{stock.name}</h3>
    <p data-testid="stock-price">₹{stock.price}</p>
    <p data-testid="stock-change" className={stock.change >= 0 ? 'positive' : 'negative'}>
      {stock.change >= 0 ? '+' : ''}{stock.change} ({stock.percentChange}%)
    </p>
  </div>
);

describe('StockCard Component', () => {
  const mockStock = {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2500.75,
    change: 15.25,
    percentChange: 0.61
  };

  it('renders stock information correctly', () => {
    render(<StockCard stock={mockStock} />);
    
    expect(screen.getByTestId('stock-card')).toBeInTheDocument();
    expect(screen.getByTestId('stock-name')).toHaveTextContent('Reliance Industries Ltd.');
    expect(screen.getByTestId('stock-price')).toHaveTextContent('₹2500.75');
    expect(screen.getByTestId('stock-change')).toHaveTextContent('+15.25 (0.61%)');
    expect(screen.getByTestId('stock-change')).toHaveClass('positive');
  });

  it('applies negative class for stocks with negative change', () => {
    const negativeStock = { ...mockStock, change: -10.5, percentChange: -0.42 };
    render(<StockCard stock={negativeStock} />);
    
    expect(screen.getByTestId('stock-change')).toHaveTextContent('-10.5 (-0.42%)');
    expect(screen.getByTestId('stock-change')).toHaveClass('negative');
  });
}); 