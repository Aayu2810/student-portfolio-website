/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['farmui.vercel.app'],
  },
  // Production optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;