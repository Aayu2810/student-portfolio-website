/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['farmui.vercel.app'],
  },
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Ensure dynamic routes work properly
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  // Output standalone for better deployment compatibility
  output: 'standalone',
};

module.exports = nextConfig;