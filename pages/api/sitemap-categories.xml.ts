import { NextApiRequest, NextApiResponse } from 'next';
import { generateCategorySitemap } from '../../lib/utils/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    const xml = await generateCategorySitemap();
    res.write(xml);
    res.end();
  } catch (error) {
    console.error('Error generating category sitemap:', error);
    res.status(500).send('Error generating category sitemap');
  }
}
