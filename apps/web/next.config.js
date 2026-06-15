/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jobpilot/ui"],
  // Disable static export on Vercel to allow standard dynamic SSR/routing
  output: isVercel ? undefined : 'export',
  // Disable basePath on Vercel since it hosts at root domain
  basePath: (isProd && !isVercel) ? '/JobPortalAI' : '',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
