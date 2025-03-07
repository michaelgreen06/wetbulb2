import { NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';
import { createReadStream } from 'fs';
import JSONStream from 'JSONStream';
import { toSlug } from './string';

export interface CityData {
  name: string;
  resolvedAdmin1Code: string;
  resolvedCountryName: string;
  latitude: number;
  longitude: number;
}

// Maximum URLs per sitemap (keeping under 10,000 as requested)
const MAX_URLS_PER_SITEMAP = 9999;

// Get a list of all countries from the dataset
export async function getAllCountries(): Promise<string[]> {
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const citiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Extract unique country names
    const countries = new Set<string>();
    citiesData.forEach((city: CityData) => {
      if (city.resolvedCountryName) {
        countries.add(city.resolvedCountryName);
      }
    });
    
    return Array.from(countries).sort();
  } catch (error) {
    console.error('Error getting countries:', error);
    return [];
  }
}

// Get a list of all states in a country
export async function getStatesInCountry(countryName: string): Promise<string[]> {
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const citiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Extract unique state names for the country
    const states = new Set<string>();
    citiesData.forEach((city: CityData) => {
      if (city.resolvedCountryName === countryName && city.resolvedAdmin1Code) {
        states.add(city.resolvedAdmin1Code);
      }
    });
    
    return Array.from(states).sort();
  } catch (error) {
    console.error(`Error getting states for ${countryName}:`, error);
    return [];
  }
}

// Generate a sitemap for category pages (countries and states)
export async function generateCategorySitemap(): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
    const countries = await getAllCountries();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add main wetbulb temperature page
    xml += `  <url>
    <loc>${baseUrl}/wetbulb-temperature</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
    
    // Add country pages
    for (const country of countries) {
      const countrySlug = toSlug(country);
      xml += `  <url>
    <loc>${baseUrl}/wetbulb-temperature/${countrySlug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\n`;
      
      // Add state pages for each country
      const states = await getStatesInCountry(country);
      for (const state of states) {
        const stateSlug = toSlug(state);
        xml += `  <url>
    <loc>${baseUrl}/wetbulb-temperature/${countrySlug}/${stateSlug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      }
    }
    
    xml += '</urlset>';
    return xml;
    
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    throw error;
  }
}

// Generate a sitemap for a specific country
export async function generateCountrySitemap(
  countryName: string,
  partNumber: number = 1
): Promise<string> {
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const jsonStream = createReadStream(dataPath).pipe(JSONStream.parse('*'));
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
    let cityCount = 0;
    let includedCities = 0;
    
    // Calculate the start and end index for pagination within a country
    const startIndex = (partNumber - 1) * MAX_URLS_PER_SITEMAP;
    const endIndex = partNumber * MAX_URLS_PER_SITEMAP;
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    return await new Promise<string>((resolve, reject) => {
      jsonStream.on('data', (city: CityData) => {
        try {
          // Only process cities for the specified country
          if (city.resolvedCountryName !== countryName) {
            return;
          }
          
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

          if (!city.name || !city.resolvedAdmin1Code) {
            cityCount++;
            return;
          }
          
          const countrySlug = toSlug(city.resolvedCountryName);
          const stateSlug = toSlug(city.resolvedAdmin1Code);
          const citySlug = toSlug(city.name);
          
          // Use the new URL structure: /country/state/city
          const urlXml = `  <url>
    <loc>${baseUrl}/wetbulb-temperature/${countrySlug}/${stateSlug}/${citySlug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.7</priority>
  </url>\n`;

          xml += urlXml;
          cityCount++;
          includedCities++;
        } catch (err) {
          console.error('Error processing city:', err);
        }
      });

      jsonStream.on('end', () => {
        console.log(`Sitemap for ${countryName} part ${partNumber}: Included ${includedCities} URLs`);
        xml += '</urlset>';
        resolve(xml);
      });

      jsonStream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error(`Error generating sitemap for ${countryName}:`, error);
    throw error;
  }
}

// Count cities in a country to determine how many sitemap parts are needed
export async function countCitiesInCountry(countryName: string): Promise<number> {
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const citiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    let count = 0;
    citiesData.forEach((city: CityData) => {
      if (city.resolvedCountryName === countryName) {
        count++;
      }
    });
    
    return count;
  } catch (error) {
    console.error(`Error counting cities for ${countryName}:`, error);
    return 0;
  }
}

// Calculate how many sitemap parts are needed for a country
export async function getSitemapPartsForCountry(countryName: string): Promise<number> {
  const cityCount = await countCitiesInCountry(countryName);
  return Math.ceil(cityCount / MAX_URLS_PER_SITEMAP);
}
