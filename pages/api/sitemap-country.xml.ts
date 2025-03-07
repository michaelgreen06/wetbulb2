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
    
    // Convert the country slug to a name and capitalize first letter of each word
    let countryName = decodeURIComponent(country)
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Special case for USA
    if (countryName.toLowerCase() === 'united states') {
      countryName = 'United States';
    }
    
    // Parse part number if provided
    let partNumber: number | undefined;
    if (part && !Array.isArray(part)) {
      partNumber = parseInt(part, 10);
      if (isNaN(partNumber)) {
        return res.status(400).send('Invalid part parameter');
      }
    }
    
    console.log(`Generating sitemap for country: ${countryName}${partNumber ? `, part: ${partNumber}` : ''}`);
    
    const xml = await generateCountrySitemap(countryName, partNumber);
    
    // Add debug info to the response for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log(`Country parameter: ${country}`);
      console.log(`Normalized country name: ${countryName}`);
    }
    
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Error generating country sitemap:', error);
    res.status(500).send(`Error generating country sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
