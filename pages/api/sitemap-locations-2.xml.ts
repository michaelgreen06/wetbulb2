import { NextApiRequest, NextApiResponse } from 'next';
import { generateLocationSitemap } from '../../lib/utils/sitemap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await generateLocationSitemap(res, 2);
}