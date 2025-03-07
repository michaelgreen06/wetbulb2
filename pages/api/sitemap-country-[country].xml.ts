import { NextApiRequest, NextApiResponse } from 'next';
import { generateCountrySitemap } from '../../lib/utils/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    // Get the country parameter from the URL
    const { country } = req.query;
    
    if (!country || Array.isArray(country)) {
      throw new Error('Invalid country parameter');
    }
    
    // Convert country slug to name
    const countryName = decodeURIComponent(country).replace(/-/g, ' ');
    
    console.log(`Generating sitemap for country: ${countryName}`);
    
    const xml = await generateCountrySitemap(countryName);
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Error generating country sitemap:', error);
    res.status(500).send(`Error generating country sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
