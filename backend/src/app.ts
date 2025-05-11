import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import env from './config/env';

// Import routes
import authRoutes from './routes/auth.routes';
import stockRoutes from './routes/stock.routes';

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);

// Add routes for IPO and market-indices
app.get('/api/ipo', async (req, res) => {
  try {
    const stockApiService = require('../services/stockApi');
    const ipoData = await stockApiService.getIpoData();
    
    res.json({
      status: 'success',
      data: ipoData
    });
  } catch (error) {
    console.error('Error in /api/ipo:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch IPO data',
      error: (error as Error).message
    });
  }
});

app.get('/api/market-indices', async (req, res) => {
  try {
    const stockApiService = require('../services/stockApi');
    const indicesData = await stockApiService.getMarketIndices();
    
    res.json({
      status: 'success',
      data: indicesData
    });
  } catch (error) {
    console.error('Error in /api/market-indices:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch market indices data',
      error: (error as Error).message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: `Cannot ${req.method} ${req.url}` 
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error('❌ Error:', err.message);
  
  res.status(statusCode).json({ 
    status: 'error',
    message: err.message,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

export default app; 