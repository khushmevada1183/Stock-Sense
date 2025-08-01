module.exports = {
  // Optimize component rendering with Million.js
  auto: {
    threshold: 0.05,     // Optimize components that take >5% render time
    rsc: true,           // Enable React Server Component optimization
    skip: ['Navigation', 'Footer'], // Skip optimizing complex components if they cause issues
  },
  
  // Include specific performance optimizations
  options: {
    memoization: true,   // Enable component memoization
    minify: true,        // Minify component code
    mode: 'react',       // Target React framework
  },
  
  // Package compatibility settings
  packageJson: {
    skipParsing: false,  // Parse package.json dependencies for compatibility
  }
};
