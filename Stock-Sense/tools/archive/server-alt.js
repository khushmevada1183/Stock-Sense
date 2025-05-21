const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const stockApiService = require('./services/stockApi');

// Create Express app
const app = express();
const PORT = 5002; // Changed from 5001 to 5002

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Function to validate API connection
async function validateApiConnection() {
  try {
    // Create a test client with the correct header configuration
    const testClient = axios.create({
      baseURL: 'https://stock.indianapi.in',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'sk-live-0KwlkkkbLj6KxWuyNimN0gkigsRck7mYP1CTq3Zq'
      }
    });

    // Try the /stock endpoint with a sample name
    try {
      const stockResponse = await testClient.get('/stock', {
        params: { name: 'Reliance' }
      });
      console.log(`✅ SUCCESS for /stock endpoint: ${stockResponse.status}`);
      return true;
    } catch (stockError) {
      console.log(`❌ FAILED for /stock endpoint: ${stockError.message}`);
      if (stockError.response) {
        console.log(`  Status: ${stockError.response.status}`);
        console.log(`  Data: ${JSON.stringify(stockError.response.data)}`);
      }
    }

    // Try the /trending endpoint
    try {
      const trendingResponse = await testClient.get('/trending');
      console.log(`✅ SUCCESS for /trending endpoint: ${trendingResponse.status}`);
      return true;
    } catch (trendingError) {
      console.log(`❌ FAILED for /trending endpoint: ${trendingError.message}`);
      if (trendingError.response) {
        console.log(`  Status: ${trendingError.response.status}`);
        console.log(`  Data: ${JSON.stringify(trendingError.response.data)}`);
      }
    }

    console.log('❌ All API connection tests failed. Check API key and endpoints.');
    return false;
  } catch (error) {
    console.error('API validation failed:', error.message);
    return false;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Config endpoint - returns masked API key for display purposes
app.get('/api/config', (req, res) => {
  // Only expose masked version of the API key for security
  const apiKey = process.env.STOCK_API_KEY || '';
  const maskedKey = apiKey ? `sk-live-${'*'.repeat(apiKey.length - 15)}${apiKey.substring(apiKey.length - 4)}` : 'Not configured';
  
  res.status(200).json({
    apiKey: maskedKey,
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes for stocks
app.get('/api/stocks', async (req, res) => {
  try {
    const stocksData = await stockApiService.getAllStocks();
    res.json({
      status: 'success',
      data: stocksData
    });
  } catch (error) {
    console.error('Error in /api/stocks:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch stocks data',
      error: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  
  // Validate API connection
  validateApiConnection()
    .then(isValid => {
      if (isValid) {
        console.log('✅ API connection validated successfully');
      } else {
        console.log('⚠️ API connection validation failed');
      }
    })
    .catch(error => {
      console.error('API validation error:', error.message);
    });
}); 