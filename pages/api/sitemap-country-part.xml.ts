import { NextApiRequest, NextApiResponse } from 'next';
import { generateCountrySitemap } from '../../lib/utils/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    // Get the country and part from the query parameters
    const { country, part } = req.query;
    
    if (!country || Array.isArray(country)) {
      return res.status(400).send('Country parameter is required');
    }
    
    if (!part || Array.isArray(part) || !/^\d+$/.test(part)) {
      return res.status(400).send('Part parameter must be a number');
    }
    
    // Convert the country slug to a name and parse the part number
    const countryName = country.replace(/-/g, ' ');
    const partNumber = parseInt(part, 10);
    
    console.log(`Generating sitemap for country: ${countryName}, part: ${partNumber}`);
    
    const xml = await generateCountrySitemap(countryName, partNumber);
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Error generating country sitemap:', error);
    res.status(500).send(`Error generating country sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
