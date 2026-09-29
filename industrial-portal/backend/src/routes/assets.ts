import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataFilePath = path.join(__dirname, '../../data/assets.json');

router.get('/assets', (_req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const assetsData = JSON.parse(rawData);
    res.status(200).json(assetsData);
  } catch (error) {
    console.error('Error reading assets data:', error);
    res.status(500).json({ error: 'Failed to read assets data' });
  }
});

export default router;
