/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap.xml'
      },
      {
        source: '/sitemap-index.xml',
        destination: '/sitemap.xml'
      },
      {
        source: '/sitemap-:path*.xml',
        destination: '/sitemaps/sitemap-:path*.xml'
      }
    ];
  }
};

export default nextConfig;
