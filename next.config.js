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
    // Optimize handling for large pages
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000
    };
    
    // Fix for handling CommonJS modules in ESM
    config.module.rules.push({
      test: /\.js$/,
      include: /api/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false
      }
    });
    
    return config;
  },
  serverActions: true,
  serverExternalPackages: [],
  // Experimental features and memory limits
  experimental: {
    largePageDataBytes: 512 * 1000, // 512KB
    optimizeCss: true,
    // Enable webpack cache for faster builds
    webpackBuildWorker: true,
  },
  // Enable caching for better performance
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 5,
  },
  transpilePackages: ['@radix-ui/react-accordion'],
  // Configure for dynamic rendering with standalone output
  output: 'standalone',
  // Configure image handling
  images: {
    domains: ['avatars.githubusercontent.com', 'images.unsplash.com', 'localhost'],
    unoptimized: process.env.NODE_ENV === 'production'
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV || 'development'
  },
  // Proper API routing
  async rewrites() {
    let apiUrl;
    if (process.env.RENDER_EXTERNAL_URL) {
      // We are on Render, construct the URL
      apiUrl = `${process.env.RENDER_EXTERNAL_URL}/api`;
    } else {
      // Fallback for other environments (like Vercel or local)
      // Ensure NEXT_PUBLIC_API_URL is a full URL in those environments
      apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';
    }
    
    console.log(`Configuring API rewrites to: ${apiUrl}`);
    
    if (!apiUrl || (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://'))) {
      console.error('Error: Invalid apiUrl for rewrites. It must be a full URL. apiUrl:', apiUrl);
      // Return an empty array or a default valid rewrite to avoid build failure
      return []; 
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`
      }
    ];
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;