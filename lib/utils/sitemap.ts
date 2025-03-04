import { NextApiResponse } from 'next';
import path from 'path';
import { createReadStream } from 'fs';
import JSONStream from 'JSONStream';
import { toSlug } from './string';

export interface CityData {
  name: string;
  resolvedAdmin1Code: string;
  resolvedCountryName: string;
}

const CITIES_PER_FILE = 10000;

export async function generateLocationSitemap(
  res: NextApiResponse,
  partNumber: number,
  totalParts: number = 14
) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const jsonStream = createReadStream(dataPath).pipe(JSONStream.parse('*'));
    
    let cityCount = 0;
    let includedCities = 0;
    const startIndex = (partNumber - 1) * CITIES_PER_FILE;
    const endIndex = partNumber * CITIES_PER_FILE;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
    
    res.write('<?xml version="1.0" encoding="UTF-8"?>\n');
    res.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');

    await new Promise<void>((resolve, reject) => {
      jsonStream.on('data', (city: CityData) => {
        try {
          // Skip cities until we reach our section
          if (cityCount < startIndex) {
            cityCount++;
            return;
          }

          // Stop if we've reached our limit
          if (cityCount >= endIndex) {
            cityCount++;
            return;
          }

          if (!city.name || !city.resolvedAdmin1Code || !city.resolvedCountryName) {
            cityCount++;
            return;
          }
          
          const citySlug = toSlug(city.name);
          const stateSlug = toSlug(city.resolvedAdmin1Code);
          const countrySlug = toSlug(city.resolvedCountryName);
          
          const urlXml = `  <url>
    <loc>${baseUrl}/wetbulb-temperature/${citySlug}/${stateSlug}/${countrySlug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>\n`;

          res.write(urlXml);
          cityCount++;
          includedCities++;
        } catch (err) {
          console.error('Error processing city:', err);
        }
      });

      jsonStream.on('end', () => {
        console.log(`Sitemap part ${partNumber}: Processed ${cityCount} cities, included ${includedCities} URLs`);
        res.write('</urlset>');
        res.end();
        resolve();
      });

      jsonStream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    if (!res.writableEnded) {
      res.status(500).send('Error generating sitemap');
    }
  }
}
