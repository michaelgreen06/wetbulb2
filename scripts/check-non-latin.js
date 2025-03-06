// Script to check for non-Latin scripts in resolved_cities.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

// Get current file path (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the cities data
const citiesPath = path.join(__dirname, 'resolved_cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

console.log(`Analyzing ${cities.length} cities for non-Latin scripts...`);

// Function to check if a string contains non-Latin scripts
function containsNonLatinScripts(str) {
  // Check for scripts like Chinese, Japanese, Korean, Arabic, Thai, etc.
  const nonLatinRegex = /[\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0E00-\u0E7F\u0900-\u097F]/;
  return nonLatinRegex.test(str);
}

// Function to test slugify on a string
function testSlugify(str) {
  const slugified = slugify(str, {
    lower: true,
    strict: true,
    locale: 'en',
    trim: true
  });
  
  return {
    original: str,
    slugified: slugified,
    isEmpty: !slugified
  };
}

// Track cities with non-Latin scripts
const nonLatinCities = [];
const emptySlugCities = [];

// Check each city
cities.forEach(city => {
  const cityName = city.name || '';
  const countryName = city.resolvedCountryName || '';
  const adminName = city.resolvedAdmin1Code || '';
  
  const fullName = `${cityName}, ${adminName}, ${countryName}`;
  
  // Check if any part contains non-Latin scripts
  if (
    containsNonLatinScripts(cityName) || 
    containsNonLatinScripts(countryName) || 
    containsNonLatinScripts(adminName)
  ) {
    nonLatinCities.push({
      fullName,
      city: cityName,
      admin: adminName,
      country: countryName
    });
  }
  
  // Test slugify on each part
  const citySlug = testSlugify(cityName);
  const adminSlug = testSlugify(adminName);
  const countrySlug = testSlugify(countryName);
  
  // Check if any slugification results in an empty string
  if (citySlug.isEmpty || adminSlug.isEmpty || countrySlug.isEmpty) {
    emptySlugCities.push({
      fullName,
      city: citySlug,
      admin: adminSlug,
      country: countrySlug
    });
  }
});

console.log(`Found ${nonLatinCities.length} cities with non-Latin scripts.`);
console.log(`Found ${emptySlugCities.length} cities that produce empty slugs.`);

// Output detailed results if any issues found
if (nonLatinCities.length > 0) {
  console.log('\nCities with non-Latin scripts (first 10):');
  nonLatinCities.slice(0, 10).forEach(city => {
    console.log(`- ${city.fullName}`);
  });
}

if (emptySlugCities.length > 0) {
  console.log('\nCities that produce empty slugs (first 10):');
  emptySlugCities.slice(0, 10).forEach(city => {
    console.log(`- ${city.fullName}`);
    console.log(`  City: "${city.city.original}" → "${city.city.slugified}"`);
    console.log(`  Admin: "${city.admin.original}" → "${city.admin.slugified}"`);
    console.log(`  Country: "${city.country.original}" → "${city.country.slugified}"`);
  });
}
