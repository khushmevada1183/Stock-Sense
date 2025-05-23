import express from 'express';
import compression from 'compression';
import stockRoutes from './routes/stockRoutes';
import { 
  corsMiddleware, 
  securityMiddleware, 
  rateLimitMiddleware, 
  errorMiddleware,
  requestLoggerMiddleware
} from './middleware/securityMiddleware';

// Load environment variables if .env exists
try {
  require('dotenv').config();
} catch (err) {
  console.log('No .env file found, using default values');
}

// Create Express app
const app = express();

// Apply middleware
app.use(requestLoggerMiddleware);
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(rateLimitMiddleware);
app.use(compression()); // Compress all responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('[HEALTH CHECK] /api/health endpoint hit');
  res.status(200).json({
      status: 'success',
    data: {
      status: 'UP',
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API key config - returns masked API key for display purposes
app.get('/api/config', (req, res) => {
  const apiKey = process.env.STOCK_API_KEY || '';
  const maskedKey = apiKey 
    ? `sk-live-${'*'.repeat(Math.max(0, apiKey.length - 15))}${apiKey.substring(Math.max(0, apiKey.length - 4))}`
    : 'Not configured';
  
  res.status(200).json({
    status: 'success',
    data: {
      apiKey: maskedKey,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// API routes
app.use('/api', stockRoutes);

// Error handling middleware should be last
app.use(errorMiddleware);

export default app; 