import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  const sitemaps = [
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap-main.xml`,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap-locations-1.xml`,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap-locations-2.xml`,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap-locations-3.xml`,
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap-locations-4.xml`,
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
