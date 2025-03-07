import { NextApiRequest, NextApiResponse } from 'next';
import { getAllCountries, getSitemapPartsForCountry } from '../../lib/utils/sitemap';

// Simple in-memory cache with 1-hour expiration
let sitemapCache: {
  data: string;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');

  try {
    // Check if we have a valid cached response
    const now = Date.now();
    if (sitemapCache && (now - sitemapCache.timestamp) < CACHE_DURATION) {
      res.write(sitemapCache.data);
      res.end();
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
    const countries = await getAllCountries();
    
    // Start with the main sitemap and category sitemap
    const sitemaps = [
      `${baseUrl}/sitemap-main.xml`,
      `${baseUrl}/sitemap-categories.xml`
    ];

    // Process all countries in parallel instead of sequentially
    const countryPromises = countries.map(async (country) => {
      const countrySlug = encodeURIComponent(country.toLowerCase().replace(/\s+/g, '-'));
      const partsCount = await getSitemapPartsForCountry(country);
      
      const countrySitemaps = [];
      // If there are multiple parts for a country, add each part
      if (partsCount > 1) {
        for (let i = 1; i <= partsCount; i++) {
          countrySitemaps.push(`${baseUrl}/sitemap-country-${countrySlug}-${i}.xml`);
        }
      } else {
        // Otherwise just add the single country sitemap
        countrySitemaps.push(`${baseUrl}/sitemap-country-${countrySlug}.xml`);
      }
      return countrySitemaps;
    });

    // Wait for all country processing to complete
    const countryResults = await Promise.all(countryPromises);
    
    // Flatten the array of arrays into a single array
    const countrySitemaps = countryResults.flat();
    
    // Add all country sitemaps to the main sitemaps array
    sitemaps.push(...countrySitemaps);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    // Cache the result
    sitemapCache = {
      data: xml,
      timestamp: now
    };

    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Error generating sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
}
