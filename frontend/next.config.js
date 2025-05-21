/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  /* config options here */
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  // Using optimized webpack configuration for builds
  webpack: (config, { isServer }) => {
    // Optimize for memory efficiency
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 10,
      minSize: 50000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: -10
        }
      }
    };
    
    // Disable dev features in production
    if (!isServer && process.env.NODE_ENV === 'production') {
      // Reduce memory usage
      config.optimization.minimize = true;
      config.optimization.runtimeChunk = false;
    }
    
    return config;
  },
  // Increase build memory limit - reduced for low resource environment
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB (reduced from 512KB)
  },
  // Moved from experimental to top level as required by Next.js 15.3.2
  transpilePackages: ['@radix-ui/react-accordion'],
  // Configure for dynamic rendering with standalone output
  output: 'standalone',
  // Configure image handling - optimize for memory
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com', 'localhost'],
    unoptimized: process.env.NODE_ENV === 'production',
    minimumCacheTTL: 3600, // 1 hour to reduce builds
  },
  // Reduce build frequency
  swcMinify: true,
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'development'
  },
  // Proper API routing
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';
    console.log(`Configuring API rewrites to: ${apiUrl}`);
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`
      }
    ];
  }
};

module.exports = nextConfig;