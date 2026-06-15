/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jobpilot/ui"],
};

module.exports = nextConfig;
// Wait! Next 15 prefers standard ES module or CommonJS configurations. This is perfect and robust.
