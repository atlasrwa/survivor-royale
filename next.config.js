/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Static export for Capacitor (Android APK wrapping)
  output: 'export',
  
  // Webpack configuration for Phaser
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Phaser aliasing for better imports
      phaser: 'phaser/dist/phaser.js',
    };

    // Prevent Phaser from being bundled server-side
    if (isServer) {
      config.externals = [...(config.externals || []), 'phaser'];
    }

    return config;
  },
  
  // Image optimization disabled for static export
  images: {
    unoptimized: true,
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
  },
};

module.exports = nextConfig;
