import csv from 'csvtojson';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputFile = join(__dirname, 'allCountries.txt');
const outputFile = join(__dirname, 'geonames_cities.json');

// Define headers as per GeoNames documentation
const headers = [
  'geonameid',
  'name',
  'asciiname',
  'alternatenames',
  'latitude',
  'longitude',
  'featureClass',
  'featureCode',
  'countryCode',
  'cc2',
  'admin1Code',
  'admin2Code',
  'admin3Code',
  'admin4Code',
  'population',
  'elevation',
  'dem',
  'timezone',
  'modificationDate'
];

const MIN_POPULATION = 1000;

const writeStream = createWriteStream(outputFile);
writeStream.write('[\n');

let isFirstItem = true;
let processedCount = 0;
let skippedCount = 0;

csv({
  delimiter: '\t',
  noheader: false,
  headers: headers
})
  .fromFile(inputFile)
  .subscribe((item) => {
    return new Promise((resolve, reject) => {
      // Only include populated places (P) with population >= 1000
      if (item.featureClass === 'P' && parseInt(item.population) >= MIN_POPULATION) {
        const filteredItem = {
          name: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          countryCode: item.countryCode,
          admin1Code: item.admin1Code
        };

        const jsonString = JSON.stringify(filteredItem, null, 2);
        if (!isFirstItem) {
          writeStream.write(',\n');
        }
        writeStream.write(jsonString);
        isFirstItem = false;
        processedCount++;
        
        if (processedCount % 1000 === 0) {
          console.log(`Processed ${processedCount} cities...`);
        }
      } else {
        skippedCount++;
        if (skippedCount % 10000 === 0) {
          console.log(`Skipped ${skippedCount} locations...`);
        }
      }
      resolve();
    });
  }, 
  (error) => {
    console.error(error);
    writeStream.end();
  },
  () => {
    writeStream.write('\n]');
    writeStream.end();
    console.log(`\nFinal Statistics:
    - Total Processed: ${processedCount}
    - Total Skipped: ${skippedCount}
    - Success Rate: ${((processedCount / (processedCount + skippedCount)) * 100).toFixed(2)}%`);
  });