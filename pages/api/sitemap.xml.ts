import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { createReadStream } from 'fs';
import JSONStream from 'JSONStream';

interface CityData {
  name: string;
  resolvedAdmin1Code: string;
  resolvedCountryName: string;
  latitude: number;
  longitude: number;
}

function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set response headers for XML
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const jsonStream = createReadStream(dataPath).pipe(JSONStream.parse('*'));
    
    // Track if we've started writing URLs
    let hasStartedWriting = false;
    let hasError = false;
    
    // Write XML header
    res.write('<?xml version="1.0" encoding="UTF-8"?>\n');
    res.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n');
    
    // Write homepage URL
    res.write(`  <url>
    <loc>${process.env.NEXT_PUBLIC_SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`);

    await new Promise<void>((resolve, reject) => {
      jsonStream.on('data', (city: CityData) => {
        try {
          if (!city.name || !city.resolvedAdmin1Code || !city.resolvedCountryName) return;
          
          const citySlug = toSlug(city.name);
          const stateSlug = toSlug(city.resolvedAdmin1Code);
          const countrySlug = toSlug(city.resolvedCountryName);
          
          const url = `${process.env.NEXT_PUBLIC_SITE_URL}/wetbulb-temperature/${citySlug}/${stateSlug}/${countrySlug}`;
          
          const urlXml = `  <url>
    <loc>${url}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>\n`;

          hasStartedWriting = true;
          res.write(urlXml);
        } catch (err) {
          console.error('Error processing city:', err);
          hasError = true;
        }
      });

      jsonStream.on('end', () => {
        if (!hasError) {
          res.write('</urlset>');
          resolve();
        } else {
          reject(new Error('Error occurred while processing cities'));
        }
      });

      jsonStream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        hasError = true;
        reject(error);
      });
    });

    // Only end the response if we haven't encountered any errors
    if (!hasError) {
      res.end();
    } else {
      throw new Error('Error occurred during sitemap generation');
    }
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // If we haven't written any content yet, we can send an error response
    if (!res.writableEnded) {
      res.status(500).send('Error generating sitemap');
    }
  }
}
