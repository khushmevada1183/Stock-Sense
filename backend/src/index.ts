import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import env from './config/env';
import pool from './db';
import { initializeDatabase } from './db/init';
import { logger } from './utils/logger';

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
  logger.error(`Error: ${err.message}`);
  
  res.status(statusCode).json({ 
    status: 'error',
    message: err.message,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Start server
const PORT = env.PORT;

// Initialize the database then start the server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
      
      // Check database connection
      pool.query('SELECT NOW()', (err) => {
        if (err) {
          logger.error('Database connection error:', err.message);
        } else {
          logger.info('Database connection successful');
        }
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  logger.error('UNHANDLED REJECTION:', err);
  // Don't crash the server on unhandled promise rejections
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  logger.error('UNCAUGHT EXCEPTION:', err);
  // Exit process on critical errors
  process.exit(1);
});

export default app; 