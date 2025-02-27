import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Generate robots.txt content
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap.xml`;

  // Set the content header and send response
  res.setHeader('Content-Type', 'text/plain');
  res.write(robotsTxt);
  res.end();
}
