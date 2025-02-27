import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { createReadStream } from 'fs';
import JSONStream from 'JSONStream';

// Define types for our city data
interface CityData {
  name: string;
  resolvedAdmin1Code: string;
  resolvedCountryName: string;
  latitude: number;
  longitude: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set up streaming from the JSON file
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const jsonStream = createReadStream(dataPath).pipe(JSONStream.parse('*'));

    // Set the content header and start streaming
    res.setHeader('Content-Type', 'application/xml');
    
    // Write the XML header
    res.write(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>`);

    // Create a promise to handle the stream events
    await new Promise<void>((resolve, reject) => {
      jsonStream.on('data', (city: CityData) => {
        try {
          // Skip if missing required fields
          if (!city.name || !city.resolvedAdmin1Code || !city.resolvedCountryName) return;

          // Format each part of the path
          const citySlug = city.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
          const stateSlug = city.resolvedAdmin1Code.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
          const countrySlug = city.resolvedCountryName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

          const locationXml = `
          <url>
            <loc>${process.env.NEXT_PUBLIC_SITE_URL}/wetbulb-temperature/${citySlug}/${stateSlug}/${countrySlug}</loc>
            <changefreq>hourly</changefreq>
            <priority>0.8</priority>
          </url>`;

          res.write(locationXml);
        } catch (err) {
          console.error('Error processing city:', err);
        }
      });

      jsonStream.on('end', () => {
        res.write('\n    </urlset>');
        res.end();
        resolve();
      });

      jsonStream.on('error', (error: Error) => {
        console.error('Error generating sitemap:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Error generating sitemap' });
  }
}
