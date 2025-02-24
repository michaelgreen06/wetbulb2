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

const writeStream = createWriteStream(outputFile);
writeStream.write('[\n');

let isFirstItem = true;
let processedCount = 0;

csv({
  delimiter: '\t',
  noheader: false,
  headers: headers
})
  .fromFile(inputFile)
  .subscribe((item) => {
    return new Promise((resolve, reject) => {
      if (item.featureClass === 'P') {
        const filteredItem = {
          name: item.name,
          alternatenames: item.alternatenames,
          latitude: item.latitude,
          longitude: item.longitude,
          countryCode: item.countryCode,
          cc2: item.cc2,
          admin1Code: item.admin1Code,
          admin2Code: item.admin2Code,
          admin3Code: item.admin3Code,
          admin4Code: item.admin4Code,
          population: item.population
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
    console.log(`Processing complete. Total cities processed: ${processedCount}`);
  });
