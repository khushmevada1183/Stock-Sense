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
  // Error handling improvements
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  output: 'standalone',
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5005'
  }
};

module.exports = nextConfig;