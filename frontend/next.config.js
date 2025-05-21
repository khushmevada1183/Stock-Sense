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
    
    return config;
  },
  // Increase build memory limit
  experimental: {
    largePageDataBytes: 512 * 1000, // 512KB
  },
  // Configure for dynamic rendering
  output: 'standalone',
  // Configure image handling
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com', 'localhost'],
    unoptimized: false
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'development'
  },
  // Proper API routing
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*' || 'http://localhost:10000/api/:path*'
      }
    ];
  }
};

module.exports = nextConfig;