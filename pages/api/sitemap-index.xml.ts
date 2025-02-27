import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  // Always use www subdomain since the site redirects there
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://wetbulb35.com', 'https://www.wetbulb35.com') || 'https://www.wetbulb35.com';

  const sitemaps = [
    `${baseUrl}/sitemap-main.xml`,
    `${baseUrl}/sitemap-locations-1.xml`,
    `${baseUrl}/sitemap-locations-2.xml`,
    `${baseUrl}/sitemap-locations-3.xml`,
    `${baseUrl}/sitemap-locations-4.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

  res.write(xml);
  res.end();
}
