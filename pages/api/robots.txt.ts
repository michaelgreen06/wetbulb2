import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'text/plain');
  
  // Always use www subdomain since the site redirects there
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace('https://wetbulb35.com', 'https://www.wetbulb35.com') || 'https://www.wetbulb35.com';
  
  const content = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap-index.xml`;

  res.write(content);
  res.end();
}
