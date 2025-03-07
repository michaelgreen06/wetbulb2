import { NextApiRequest, NextApiResponse } from 'next';
import { generateCountrySitemap } from '../../lib/utils/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    const countryName = 'United States';
    const partNumber = 2;
    
    console.log(`Generating sitemap for ${countryName}, part ${partNumber}`);
    
    const xml = await generateCountrySitemap(countryName, partNumber);
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Error generating country sitemap:', error);
    res.status(500).send(`Error generating country sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
