import app from './app';
import { stockApiService } from './services/stockApiService';

// Get port from environment or use default
const PORT = process.env.PORT || 5001;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base URL: http://localhost:${PORT}/api`);
  
  // Validate API connection on startup
  validateApiConnection().then(isValid => {
    if (isValid) {
      console.log('✅ API connection validated successfully');
    } else {
      console.warn('⚠️ API connection validation failed. Some features may not work correctly.');
    }
  });
});

// Function to validate API connection
async function validateApiConnection(): Promise<boolean> {
  try {
    // Try to get some data to validate connection
    try {
      await stockApiService.searchStocks('RELIANCE');
      console.log(`✅ SUCCESS for search endpoint`);
      return true;
    } catch (error) {
      console.log(`❌ FAILED for search endpoint`);
    }
    
    return false;
  } catch (error) {
    console.error('API validation failed:', error);
    return false;
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('⚠️ UNHANDLED REJECTION:', err);
  // Don't crash the server on unhandled promise rejections
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error('⚠️ UNCAUGHT EXCEPTION:', err);
  // Exit process on critical errors
  process.exit(1);
}); 