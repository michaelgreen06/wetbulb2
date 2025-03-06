// Script to test URL slug generation for location routes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';

// Implement the improved toSlug function with mixed-script handling
function containsNonLatinScripts(str) {
  // Check for common non-Latin scripts: Arabic, CJK, Cyrillic, Thai, etc.
  const nonLatinRegex = /[\u0600-\u06FF\u0750-\u077F\u1100-\u11FF\u3040-\u309F\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF\u0E00-\u0E7F\u0900-\u097F]/;
  return nonLatinRegex.test(str);
}

function extractLatinPortion(str) {
  // If there's no non-Latin script, return the original string
  if (!containsNonLatinScripts(str)) return str;
  
  // Split by common separators that might divide Latin and non-Latin portions
  const parts = str.split(/[,\(\)\[\]\{\}\s]+/);
  
  // Find the longest sequence of Latin-only parts
  let latinParts = [];
  let currentLatinSequence = [];
  
  for (const part of parts) {
    if (part.trim() === '') continue;
    
    if (!containsNonLatinScripts(part)) {
      currentLatinSequence.push(part);
    } else {
      if (currentLatinSequence.length > latinParts.length) {
        latinParts = [...currentLatinSequence];
      }
      currentLatinSequence = [];
    }
  }
  
  // Check the last sequence
  if (currentLatinSequence.length > latinParts.length) {
    latinParts = [...currentLatinSequence];
  }
  
  // If we found Latin parts, join them; otherwise return the original string
  return latinParts.length > 0 ? latinParts.join(' ') : str;
}

function toSlug(str) {
  if (!str) return '';
  
  // Process the string to prioritize Latin script if mixed scripts are present
  const processedStr = extractLatinPortion(str);
  
  return slugify(processedStr, {
    lower: true,
    strict: true,
    locale: 'en',
    trim: true
  });
}

// Get current file path (ES modules don't have __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the cities data
const citiesPath = path.join(__dirname, 'resolved_cities.json');
const cities = JSON.parse(fs.readFileSync(citiesPath, 'utf8'));

console.log('Testing URL slug generation for sample cities...\n');

// Function to generate a location route
function generateRoute(city) {
  const citySlug = toSlug(city.name);
  const stateSlug = toSlug(city.resolvedAdmin1Code);
  const countrySlug = toSlug(city.resolvedCountryName);
  
  return {
    original: {
      city: city.name,
      state: city.resolvedAdmin1Code,
      country: city.resolvedCountryName
    },
    slugs: {
      city: citySlug,
      state: stateSlug,
      country: countrySlug
    },
    route: `/wetbulb-temperature/${citySlug}/${stateSlug}/${countrySlug}`
  };
}

// Select a diverse set of cities to test
const testCities = [
  // Cities with diacritics
  cities.find(city => city.name === 'Sant Julià de Lòria'),
  
  // Cities with non-Latin scripts (Arabic)
  cities.find(city => city.name.includes('سيدي')),
  cities.find(city => city.name.includes('قرية')),
  
  // Common cities from different regions
  cities.find(city => city.name === 'New York'),
  cities.find(city => city.name === 'Tokyo'),
  cities.find(city => city.name === 'Paris'),
  cities.find(city => city.name === 'Cairo'),
  cities.find(city => city.name === 'São Paulo'),
  cities.find(city => city.name === 'München'), // Munich with umlaut
  
  // Cities with spaces and special characters
  cities.find(city => city.name.includes('-')),
  cities.find(city => city.name.includes('&')),
  cities.find(city => city.name.includes("'"))
].filter(Boolean); // Remove any undefined entries

// Add a few random cities to ensure diversity
for (let i = 0; i < 5; i++) {
  const randomIndex = Math.floor(Math.random() * cities.length);
  if (!testCities.some(city => city && city.name === cities[randomIndex].name)) {
    testCities.push(cities[randomIndex]);
  }
}

// Generate and display routes
testCities.forEach(city => {
  if (!city) return;
  
  const routeInfo = generateRoute(city);
  
  console.log(`City: ${routeInfo.original.city}, ${routeInfo.original.state}, ${routeInfo.original.country}`);
  console.log(`Slugs: ${routeInfo.slugs.city}/${routeInfo.slugs.state}/${routeInfo.slugs.country}`);
  console.log(`Route: ${routeInfo.route}`);
  console.log('---');
});

// Count how many cities would have duplicate routes
const routeMap = new Map();
const duplicateRoutes = [];

cities.forEach(city => {
  const routeInfo = generateRoute(city);
  const routeKey = routeInfo.route;
  
  if (routeMap.has(routeKey)) {
    duplicateRoutes.push({
      route: routeKey,
      cities: [routeMap.get(routeKey), city]
    });
  } else {
    routeMap.set(routeKey, city);
  }
});

console.log(`\nFound ${duplicateRoutes.length} potential duplicate routes out of ${cities.length} cities.`);

if (duplicateRoutes.length > 0) {
  console.log('\nSample duplicate routes:');
  duplicateRoutes.slice(0, 5).forEach(dup => {
    console.log(`\nRoute: ${dup.route}`);
    dup.cities.forEach(city => {
      console.log(`- ${city.name}, ${city.resolvedAdmin1Code}, ${city.resolvedCountryName} (${city.latitude}, ${city.longitude})`);
    });
  });
}
