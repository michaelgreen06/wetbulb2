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
  const countryList = await csv().fromFile(countryCodesFile);
  
  for (const country of countryList) {
    const code = country.Code.toLowerCase();
    countryCodes.set(code, country.Name);
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
        
        // Get the raw country name from the CSV file
        let rawCountryName = countryCodes.get(countryCode) || null;
        
        // Apply normalization to the country name
        let countryName = null;
        
        if (rawCountryName) {
          // Direct mapping for problematic country names
          const countryNameMap = {
            // Map from the raw CSV name to the normalized name
            'Macedonia, the Former Yugoslav Republic of': 'North Macedonia',
            'Iran, Islamic Republic of': 'Iran',
            'Korea, Democratic People\'s Republic of': 'North Korea',
            'Korea, Republic of': 'South Korea',
            'Viet Nam': 'Vietnam',
            'Taiwan, Province of China': 'Taiwan',
            'Holy See (Vatican City State)': 'Vatican City',
            'Russian Federation': 'Russia',
            'Bolivia, Plurinational State of': 'Bolivia',
            'Venezuela, Bolivarian Republic of': 'Venezuela',
            'Congo, the Democratic Republic of the': 'DR Congo',
            'Congo': 'Republic of Congo',
            'Lao People\'s Democratic Republic': 'Laos',
            'Micronesia, Federated States of': 'Micronesia',
            'Moldova, Republic of': 'Moldova',
            'Palestine, State of': 'Palestine',
            'Saint Vincent and the Grenadines': 'St Vincent and Grenadines',
            'Brunei Darussalam': 'Brunei',
            'Syrian Arab Republic': 'Syria',
            'Tanzania, United Republic of': 'Tanzania',
            'Virgin Islands, British': 'British Virgin Islands',
            'Virgin Islands, U.S.': 'US Virgin Islands',
            'Timor-Leste': 'East Timor',
            'Côte d\'Ivoire': 'Ivory Coast',
            'Falkland Islands (Malvinas)': 'Falkland Islands',
            'Saint Kitts and Nevis': 'St Kitts and Nevis',
            'Bosnia and Herzegovina': 'Bosnia',
            'Czech Republic': 'Czechia',
            'Bonaire, Sint Eustatius and Saba': 'Caribbean Netherlands',
            'Cocos (Keeling) Islands': 'Cocos Islands',
            'Eswatini': 'Swaziland',
            'Heard Island and McDonald Islands': 'Heard and McDonald Islands',
            'Saint Helena, Ascension and Tristan da Cunha': 'Saint Helena',
            'Saint Pierre and Miquelon': 'St Pierre and Miquelon',
            'Saint Lucia': 'St Lucia',
            'Saint Martin (French part)': 'St Martin',
            'Saint Barthélemy': 'St Barthelemy',
            'Svalbard and Jan Mayen': 'Svalbard',
            'Turks and Caicos Islands': 'Turks and Caicos',
            'Wallis and Futuna': 'Wallis and Futuna Islands',
            'United States Minor Outlying Islands': 'US Minor Outlying Islands',
            'South Georgia and the South Sandwich Islands': 'South Georgia',
            'Sao Tome and Principe': 'Sao Tome',
            'Réunion': 'Reunion',
            'Western Sahara': 'Western Sahara',
            'Sint Maarten (Dutch part)': 'Sint Maarten'
          };
          
          // Check if we have a direct mapping for this country name
          if (countryNameMap[rawCountryName]) {
            countryName = countryNameMap[rawCountryName];
          } else {
            // Apply general cleanup rules
            countryName = rawCountryName
              .replace(/^the /i, '')
              .replace(/ of$/, '')
              .replace(/,.*$/, '')
              .replace(/ \(.*\)$/, '')
              .replace(/^.*\s+of\s+/, '')
              .replace(/^.*\s+and\s+/, '')
              .trim();
          }
        }
        
        const resolvedCity = {
          name: city.name,
          resolvedCountryName: countryName,
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