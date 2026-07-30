/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Webpack configuration for Phaser
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Phaser aliasing for better imports
      phaser: 'phaser/dist/phaser.js',
    };
    return config;
  },
  
  // Image optimization
  images: {
    domains: [
      'ipfs.io',
      'gateway.pinata.cloud',
      'nftstorage.link',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  },
};

module.exports = nextConfig;
