import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataFilePath = path.join(__dirname, '../../data/thermal-events.json');

router.get('/thermal-events', (_req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const thermalData = JSON.parse(rawData);
    res.status(200).json(thermalData);
  } catch (error) {
    console.error('Error reading thermal events data:', error);
    res.status(500).json({ error: 'Failed to read thermal events data' });
  }
});

export default router;
