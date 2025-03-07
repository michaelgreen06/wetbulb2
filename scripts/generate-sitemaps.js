import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream } from 'fs';
import JSONStream from 'JSONStream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SITEMAPS_DIR = path.join(PUBLIC_DIR, 'sitemaps');

// Ensure directories exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR);
}
if (!fs.existsSync(SITEMAPS_DIR)) {
  fs.mkdirSync(SITEMAPS_DIR);
}

// Maximum URLs per sitemap (keeping under 10,000 as requested)
const MAX_URLS_PER_SITEMAP = 9999;

// Helper function to convert a string to a URL-friendly slug
function toSlug(str) {
  return encodeURIComponent(str.toLowerCase().replace(/\s+/g, '-'));
}

// Get a list of all countries from the dataset
async function getAllCountries() {
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const citiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Extract unique country names
    const countries = new Set();
    citiesData.forEach((city) => {
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

// Count cities in a country to determine how many sitemap parts are needed
async function countCitiesInCountry(countryName) {
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const citiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    let count = 0;
    citiesData.forEach((city) => {
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
async function getSitemapPartsForCountry(countryName) {
  const cityCount = await countCitiesInCountry(countryName);
  return Math.ceil(cityCount / MAX_URLS_PER_SITEMAP);
}

async function generateSitemapIndex() {
  console.log('Generating sitemap index...');
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
  const countries = await getAllCountries();
  
  // Start with the main sitemap and category sitemap
  const sitemaps = [
    `${baseUrl}/sitemaps/sitemap-main.xml`,
    `${baseUrl}/sitemaps/sitemap-categories.xml`
  ];

  console.log(`Processing ${countries.length} countries...`);
  
  // Process countries in batches to avoid memory issues
  const BATCH_SIZE = 50;
  const allCountrySitemaps = [];
  
  for (let i = 0; i < countries.length; i += BATCH_SIZE) {
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(countries.length/BATCH_SIZE)}...`);
    
    const countryBatch = countries.slice(i, i + BATCH_SIZE);
    
    // Process this batch in parallel
    const batchPromises = countryBatch.map(async (country) => {
      const countrySlug = encodeURIComponent(country.toLowerCase().replace(/\s+/g, '-'));
      const partsCount = await getSitemapPartsForCountry(country);
      
      const countrySitemaps = [];
      // Use consistent naming pattern for all country sitemaps
      for (let i = 1; i <= partsCount; i++) {
        const suffix = i > 1 ? `-${i}` : '';
        countrySitemaps.push(`${baseUrl}/sitemaps/sitemap-country-${countrySlug}${suffix}.xml`);
      }
      return countrySitemaps;
    });
    
    // Wait for this batch to complete
    const batchResults = await Promise.all(batchPromises);
    allCountrySitemaps.push(...batchResults.flat());
  }
  
  // Flatten the array of arrays into a single array
  const countrySitemaps = allCountrySitemaps;
  
  // Add all country sitemaps to the main sitemaps array
  sitemaps.push(...countrySitemaps);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.map(url => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('')}
</sitemapindex>`;

  // Write the sitemap index to the public directory
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log('Sitemap index generated successfully!');
}

// Generate the main sitemap with top-level pages
async function generateMainSitemap() {
  console.log('Generating main sitemap...');
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  // Add homepage
  xml += `  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
  
  // Add about page
  xml += `  <url>
    <loc>${baseUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
  
  // Add wetbulb temperature main page
  xml += `  <url>
    <loc>${baseUrl}/wetbulb-temperature</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>\n`;
  
  xml += '</urlset>';
  
  fs.writeFileSync(path.join(SITEMAPS_DIR, 'sitemap-main.xml'), xml);
  console.log('Main sitemap generated successfully!');
}

// Generate the categories sitemap with country and state pages
async function generateCategorySitemap() {
  console.log('Generating categories sitemap...');
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wetbulb35.com';
  const countries = await getAllCountries();
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
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
  
  fs.writeFileSync(path.join(SITEMAPS_DIR, 'sitemap-categories.xml'), xml);
  console.log('Categories sitemap generated successfully!');
}

// Generate country-specific sitemaps
async function generateCountrySitemaps() {
  console.log('Generating country sitemaps...');
  
  const countries = await getAllCountries();
  console.log(`Found ${countries.length} countries to process...`);
  
  // Process countries in batches to avoid memory issues
  const BATCH_SIZE = 10; // Process 10 countries at a time
  
  for (let i = 0; i < countries.length; i += BATCH_SIZE) {
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(countries.length/BATCH_SIZE)}...`);
    
    const countryBatch = countries.slice(i, i + BATCH_SIZE);
    const batchPromises = countryBatch.map(country => generateCountrySitemapFiles(country));
    
    await Promise.all(batchPromises);
  }
  
  console.log('Country sitemaps generated successfully!');
}

// Generate sitemap files for a specific country
async function generateCountrySitemapFiles(countryName) {
  try {
    const partsCount = await getSitemapPartsForCountry(countryName);
    const countrySlug = toSlug(countryName);
    
    // If there are multiple parts, generate each part
    if (partsCount > 1) {
      for (let i = 1; i <= partsCount; i++) {
        await generateCountrySitemap(countryName, i);
      }
    } else {
      // Otherwise just generate a single sitemap
      await generateCountrySitemap(countryName);
    }
    
    return true;
  } catch (error) {
    console.error(`Error generating sitemap for ${countryName}:`, error);
    return false;
  }
}

// Generate a sitemap for a specific country
async function generateCountrySitemap(countryName, partNumber = 1) {
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

    return await new Promise((resolve, reject) => {
      jsonStream.on('data', (city) => {
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
          
          // Use the URL structure: /country/state/city
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
        xml += '</urlset>';
        
        // Always use a consistent naming pattern for all sitemap parts
        const countrySlug = toSlug(countryName);
        const filename = `sitemap-country-${countrySlug}${partNumber > 1 ? `-${partNumber}` : ''}.xml`;
        
        fs.writeFileSync(path.join(SITEMAPS_DIR, filename), xml);
        console.log(`Generated sitemap for ${countryName} part ${partNumber}: Included ${includedCities} URLs`);
        resolve(true);
      });

      jsonStream.on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error(`Error generating sitemap for ${countryName}:`, error);
    throw error;
  }
}

// Get a list of states in a country
async function getStatesInCountry(countryName) {
  try {
    const dataPath = path.join(process.cwd(), 'scripts', 'resolved_cities.json');
    const citiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    // Extract unique state names for the country
    const states = new Set();
    citiesData.forEach((city) => {
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

// Main function to run the script
async function main() {
  try {
    console.log('Starting sitemap generation...');
    await generateMainSitemap();
    await generateCategorySitemap();
    await generateCountrySitemaps();
    await generateSitemapIndex();
    console.log('All sitemaps generated successfully!');
  } catch (error) {
    console.error('Error generating sitemaps:', error);
    process.exit(1);
  }
}

main();
