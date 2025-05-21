"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortfolio, updatePortfolio, getStockDetails } from '@/services/stockService';
import { X, PlusCircle, Save } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

interface Stock {
  symbol: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
}

interface PortfolioFormProps {
  portfolioId?: number;
  initialData?: {
    portfolioName: string;
    stocks: Stock[];
  };
  userId?: string;
}

const PortfolioForm = ({ 
  portfolioId, 
  initialData = { portfolioName: '', stocks: [] },
  userId = '1'
}: PortfolioFormProps) => {
  const router = useRouter();
  const [portfolioName, setPortfolioName] = useState(initialData.portfolioName);
  const [stocks, setStocks] = useState<Stock[]>(initialData.stocks);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [newStock, setNewStock] = useState<Stock>({
    symbol: '',
    quantity: 0,
    buyPrice: 0,
    buyDate: new Date().toISOString().split('T')[0]
  });
  const [symbolSearchResults, setSymbolSearchResults] = useState<{symbol: string, name: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isEditing = !!portfolioId;

  // Function to validate the form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!portfolioName.trim()) {
      newErrors.portfolioName = 'Portfolio name is required';
    }
    
    if (stocks.length === 0) {
      newErrors.stocks = 'Add at least one stock to your portfolio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle stock symbol search with real API
  const handleSymbolSearch = async (query: string) => {
    if (!query.trim()) {
      setSymbolSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Call the real API endpoint to search for stocks
      const response = await axios.get(`${API_URL}/stocks/search?query=${encodeURIComponent(query)}`);
      
      if (response.data && response.data.data) {
        const results = response.data.data.map((stock: any) => ({
          symbol: stock.symbol || stock.tickerId,
          name: stock.company_name || stock.companyName
        })).slice(0, 5);
        
        setSymbolSearchResults(results);
      } else {
        setSymbolSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching for symbols:', err);
      setSymbolSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to add a stock to the portfolio
  const addStock = () => {
    if (!newStock.symbol) {
      setErrors({...errors, newStock: 'Stock symbol is required'});
      return;
    }
    
    if (!newStock.quantity || newStock.quantity <= 0) {
      setErrors({...errors, newStock: 'Quantity must be greater than 0'});
      return;
    }
    
    if (!newStock.buyPrice || newStock.buyPrice <= 0) {
      setErrors({...errors, newStock: 'Buy price must be greater than 0'});
      return;
    }
    
    if (!newStock.buyDate) {
      setErrors({...errors, newStock: 'Buy date is required'});
      return;
    }
    
    // Check if stock already exists in portfolio
    if (stocks.some(stock => stock.symbol === newStock.symbol)) {
      setErrors({...errors, newStock: 'This stock is already in your portfolio'});
      return;
    }
    
    setStocks([...stocks, { ...newStock }]);
    setErrors({...errors, stocks: '', newStock: ''});
    
    // Reset new stock form
    setNewStock({
      symbol: '',
      quantity: 0,
      buyPrice: 0,
      buyDate: new Date().toISOString().split('T')[0]
    });
    
    setSymbolSearchResults([]);
  };

  // Function to remove a stock from the portfolio
  const removeStock = (index: number) => {
    const updatedStocks = [...stocks];
    updatedStocks.splice(index, 1);
    setStocks(updatedStocks);
    
    if (updatedStocks.length === 0) {
      setErrors({...errors, stocks: 'Add at least one stock to your portfolio'});
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const portfolioData = {
        userId,
        portfolioName,
        stocks
      };
      
      let response;
      
      if (isEditing) {
        response = await updatePortfolio(portfolioId, portfolioData);
      } else {
        response = await createPortfolio(portfolioData);
      }
      
      if (response) {
        router.push('/portfolio');
      } else {
        setErrors({
          submit: `Failed to ${isEditing ? 'update' : 'create'} portfolio. Please try again.`
        });
      }
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} portfolio:`, err);
      setErrors({
        submit: `An error occurred while ${isEditing ? 'updating' : 'creating'} the portfolio.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? 'Edit Portfolio' : 'Create New Portfolio'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Portfolio Name */}
        <div>
          <label htmlFor="portfolioName" className="block text-sm font-medium mb-1">
            Portfolio Name
          </label>
          <input
            type="text"
            id="portfolioName"
            value={portfolioName}
            onChange={(e) => {
              setPortfolioName(e.target.value);
              if (errors.portfolioName) {
                setErrors({...errors, portfolioName: ''});
              }
            }}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     dark:bg-gray-800"
            placeholder="e.g., Long-term Investments"
          />
          {errors.portfolioName && (
            <p className="mt-1 text-red-600 dark:text-red-400 text-sm">{errors.portfolioName}</p>
          )}
        </div>
        
        {/* Stocks List */}
        <div>
          <h2 className="text-lg font-medium mb-3">Stocks in Portfolio</h2>
          
          {stocks.length > 0 ? (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden mb-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Buy Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Buy Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {stocks.map((stock, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        {stock.symbol}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {stock.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        ₹{stock.buyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {new Date(stock.buyDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <button
                          type="button"
                          onClick={() => removeStock(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center mb-4">
              <p className="text-gray-500 dark:text-gray-400">No stocks added yet</p>
            </div>
          )}
          
          {errors.stocks && (
            <p className="mt-1 text-red-600 dark:text-red-400 text-sm mb-4">{errors.stocks}</p>
          )}
          
          {/* Add New Stock Form */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <h3 className="text-md font-medium mb-3">Add Stock</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label htmlFor="symbol" className="block text-sm font-medium mb-1">
                  Stock Symbol
                </label>
                <input
                  type="text"
                  id="symbol"
                  value={newStock.symbol}
                  onChange={(e) => {
                    setNewStock({...newStock, symbol: e.target.value.toUpperCase()});
                    handleSymbolSearch(e.target.value);
                    if (errors.newStock) {
                      setErrors({...errors, newStock: ''});
                    }
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800"
                  placeholder="e.g., RELIANCE"
                />
                
                {/* Symbol Search Results */}
                {symbolSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg">
                    {isSearching ? (
                      <div className="p-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                        Searching...
                      </div>
                    ) : (
                      <ul>
                        {symbolSearchResults.map((result) => (
                          <li 
                            key={result.symbol} 
                            className="p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setNewStock({...newStock, symbol: result.symbol});
                              setSymbolSearchResults([]);
                            }}
                          >
                            <strong>{result.symbol}</strong>: {result.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={newStock.quantity || ''}
                  onChange={(e) => {
                    setNewStock({...newStock, quantity: parseInt(e.target.value) || 0});
                    if (errors.newStock) {
                      setErrors({...errors, newStock: ''});
                    }
                  }}
                  min="1"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800"
                  placeholder="e.g., 10"
                />
              </div>
              
              <div>
                <label htmlFor="buyPrice" className="block text-sm font-medium mb-1">
                  Buy Price (₹)
                </label>
                <input
                  type="number"
                  id="buyPrice"
                  value={newStock.buyPrice || ''}
                  onChange={(e) => {
                    setNewStock({...newStock, buyPrice: parseFloat(e.target.value) || 0});
                    if (errors.newStock) {
                      setErrors({...errors, newStock: ''});
                    }
                  }}
                  min="0.01"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800"
                  placeholder="e.g., 2500.50"
                />
              </div>
              
              <div>
                <label htmlFor="buyDate" className="block text-sm font-medium mb-1">
                  Buy Date
                </label>
                <input
                  type="date"
                  id="buyDate"
                  value={newStock.buyDate}
                  onChange={(e) => {
                    setNewStock({...newStock, buyDate: e.target.value});
                    if (errors.newStock) {
                      setErrors({...errors, newStock: ''});
                    }
                  }}
                  className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           dark:bg-gray-800"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {errors.newStock && (
              <p className="mt-2 text-red-600 dark:text-red-400 text-sm">{errors.newStock}</p>
            )}
            
            <button
              type="button"
              onClick={addStock}
              className="mt-4 inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <PlusCircle className="mr-1.5 h-4 w-4" />
              Add Stock
            </button>
          </div>
        </div>
        
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-red-600 dark:text-red-400">
            {errors.submit}
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/portfolio')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                {isEditing ? 'Update Portfolio' : 'Create Portfolio'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PortfolioForm; 