import { createReadStream, createWriteStream } from 'fs';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import csv from 'csvtojson';
import JSONStream from 'JSONStream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const admin1CodesFile = join(__dirname, 'admin1CodesASCII.txt');
const countryCodesFile = join(__dirname, 'countrycodes.csv');
const inputFile = join(__dirname, 'geonames_cities.json');
const outputFile = join(__dirname, 'resolved_cities.json');

// Read and parse admin1 codes
async function loadAdmin1Codes() {
  const admin1Codes = new Map();
  const fileStream = createReadStream(admin1CodesFile);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const [code, name] = line.split('\t');
    const [countryCode, adminCode] = code.split('.');
    const key = `${countryCode.toLowerCase()}.${adminCode}`;
    admin1Codes.set(key, name);
  }

  return admin1Codes;
}

// Read and parse country codes
async function loadCountryCodes() {
  const countryCodes = new Map();
  const countries = await csv().fromFile(countryCodesFile);
  
  for (const country of countries) {
    countryCodes.set(country.Code.toLowerCase(), country.Name);
  }

  return countryCodes;
}

// Process cities using JSONStream
async function processCities() {
  console.log('Loading admin1 codes and country codes...');
  const [admin1Codes, countryCodes] = await Promise.all([
    loadAdmin1Codes(),
    loadCountryCodes()
  ]);
  console.log('Codes loaded. Processing cities...');

  const parser = JSONStream.parse('*');
  const writeStream = createWriteStream(outputFile);
  writeStream.write('[\n');

  let isFirstItem = true;
  let processedCount = 0;
  let skippedCount = 0;

  await new Promise((resolve, reject) => {
    createReadStream(inputFile)
      .pipe(parser)
      .on('data', (city) => {
        const countryCode = city.countryCode.toLowerCase();
        const resolvedCity = {
          name: city.name,
          resolvedCountryName: countryCodes.get(countryCode) || null,
          resolvedAdmin1Code: city.admin1Code ? 
            admin1Codes.get(`${countryCode}.${city.admin1Code}`) || null : 
            null,
          latitude: parseFloat(city.latitude) || null,
          longitude: parseFloat(city.longitude) || null
        };

        // Skip cities with missing required data
        if (!resolvedCity.resolvedCountryName || 
            !resolvedCity.resolvedAdmin1Code || 
            resolvedCity.latitude === null || 
            resolvedCity.longitude === null) {
          skippedCount++;
          if (skippedCount % 10000 === 0) {
            console.log(`Skipped ${skippedCount} cities...`);
          }
          return;
        }

        if (!isFirstItem) {
          writeStream.write(',\n');
        }
        writeStream.write(JSON.stringify(resolvedCity, null, 2));
        isFirstItem = false;

        processedCount++;
        if (processedCount % 10000 === 0) {
          console.log(`Processed ${processedCount} cities...`);
        }
      })
      .on('error', reject)
      .on('end', () => {
        console.log(`\nFinal Statistics:
        - Total Processed: ${processedCount}
        - Total Skipped: ${skippedCount}
        - Success Rate: ${((processedCount / (processedCount + skippedCount)) * 100).toFixed(2)}%`);
        resolve();
      });
  });

  writeStream.write('\n]');
  writeStream.end();
  console.log('Processing complete. File saved to:', outputFile);
}

// Start processing
processCities().catch(console.error);