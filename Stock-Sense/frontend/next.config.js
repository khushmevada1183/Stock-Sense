/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* config options here */
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  // Using optimized webpack configuration for builds
  webpack: (config, { isServer }) => {
    // Optimize handling for large pages
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000
    };

    // Add production optimizations
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.optimization.minimize = true;
      config.optimization.moduleIds = 'deterministic';
    }
    
    return config;
  },
  // Increase build memory limit
  experimental: {
    largePageDataBytes: 512 * 1000, // 512KB
    optimizeCss: true, // Enable CSS optimization
    scrollRestoration: true, // Improve scroll handling
  },
  // Error handling improvements
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  // Ensure we use standalone for production
  output: 'standalone',
  // Configure image handling
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com'],
    unoptimized: process.env.NODE_ENV === 'development',
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
  },
  // Set CORS headers for API requests
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          // Add caching headers for static assets
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'development'
  },
  // Add compression
  compress: true,
  // Enable powered by header
  poweredByHeader: false,
};

module.exports = nextConfig;