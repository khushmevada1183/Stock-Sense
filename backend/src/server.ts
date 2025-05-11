import app from './app';
import env from './config/env';

const PORT = env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
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