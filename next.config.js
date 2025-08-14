// next.config.js

const nextConfig = {
  // Enable experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      // Add specific domains for better security in production
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // 24 hours
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API responses (short-term)
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
    ]
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/',
        permanent: false,
      },
    ]
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      },
    }

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    // Bundle analyzer (only in development with ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
      config.plugins.push(new BundleAnalyzerPlugin())
    }

    return config
  },

  // Environment variables (for build-time configuration)
  env: {
    BUILD_TIME: new Date().toISOString(),
    BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'development',
  },

  // Output configuration
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Run ESLint during build
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  // Compression
  compress: true,

  // Enable React strict mode
  reactStrictMode: true,

  // Enable SWC minification
  swcMinify: true,

  // Power optimizations
  poweredByHeader: false,

  // Generate ETags for caching
  generateEtags: true,

  // HTTP keep alive for better performance
  httpAgentOptions: {
    keepAlive: true,
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Development configuration
  ...(process.env.NODE_ENV === 'development' && {
    // Enable webpack build worker in development
    experimental: {
      ...nextConfig.experimental,
      webpackBuildWorker: true,
    },
  }),

  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    // Reduce JavaScript bundle size in production
    compiler: {
      // Remove console.log in production
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    },
    
    // Enable gzip compression
    compress: true,
    
    // Optimize images more aggressively
    images: {
      ...nextConfig.images,
      unoptimized: false,
    },
  }),
}

export default nextConfig