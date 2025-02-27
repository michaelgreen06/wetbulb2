import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/robots.txt',
        destination: '/api/robots.txt',
      },
      {
        source: '/sitemap-index.xml',
        destination: '/api/sitemap-index.xml',
      },
      {
        source: '/sitemap-main.xml',
        destination: '/api/sitemap-main.xml',
      },
      {
        source: '/sitemap-locations-:part.xml',
        destination: '/api/sitemap-locations-:part.xml',
      },
    ];
  },
}

export default nextConfig;
