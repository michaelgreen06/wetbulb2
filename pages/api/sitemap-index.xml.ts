import { NextApiRequest, NextApiResponse } from 'next';
import { getAllCountries, getSitemapPartsForCountry } from '../../lib/utils/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
    const countries = await getAllCountries();
    
    // Start with the main sitemap and category sitemap
    const sitemaps = [
      `${baseUrl}/api/sitemap-main.xml`,
      `${baseUrl}/api/sitemap-categories.xml`
    ];

    // Add country sitemaps
    for (const country of countries) {
      const countrySlug = encodeURIComponent(country.toLowerCase().replace(/\s+/g, '-'));
      const partsCount = await getSitemapPartsForCountry(country);
      
      // If there are multiple parts for a country, add each part
      if (partsCount > 1) {
        for (let i = 1; i <= partsCount; i++) {
          sitemaps.push(`${baseUrl}/api/sitemap-country-${countrySlug}-${i}.xml`);
        }
      } else {
        // Otherwise just add the single country sitemap
        sitemaps.push(`${baseUrl}/api/sitemap-country-${countrySlug}.xml`);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
}
