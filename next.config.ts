import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots.txt',
      },
    ];
  },
}

export default nextConfig;
