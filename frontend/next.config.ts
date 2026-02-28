import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Disable Turbopack for production builds to avoid native module issues */
  experimental: {
    turbopack: false,
  },
  /* Suppress hydration warnings during development */
  suppressHydrationWarning: true,
  /* Allow dynamic imports */
  dynamic: 'force-dynamic',
  /* Configure image optimization */
  images: {
    unoptimized: true,
    domains: ['localhost', '127.0.0.1'],
  },
  /* Ensure all pages are pre-rendered */
  output: undefined, // Use default (not 'export' for API routes)
  /* React strict mode for development */
  reactStrictMode: true,
};

export default nextConfig;
