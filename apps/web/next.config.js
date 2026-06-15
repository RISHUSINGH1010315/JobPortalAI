/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jobpilot/ui"],
  output: 'export',
  basePath: isProd ? '/JobPortalAI' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
