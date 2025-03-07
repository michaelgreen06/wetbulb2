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
      {
        source: '/sitemap-categories.xml',
        destination: '/api/sitemap-categories.xml',
      },
      {
        // For country sitemaps with pagination
        source: '/sitemap-country-:country(.*)-:part(\\d+).xml',
        destination: '/api/sitemap-country.xml?country=:country&part=:part',
      },
      {
        // For country sitemaps without pagination
        source: '/sitemap-country-:country.xml',
        destination: '/api/sitemap-country.xml?country=:country',
      },
    ];
  },
}

export default nextConfig;
