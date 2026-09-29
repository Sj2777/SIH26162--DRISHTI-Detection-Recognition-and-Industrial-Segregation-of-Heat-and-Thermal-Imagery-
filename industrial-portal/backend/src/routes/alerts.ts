import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataFilePath = path.join(__dirname, '../../data/alerts.json');

router.get('/alerts', (_req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const alertsData = JSON.parse(rawData);
    res.status(200).json(alertsData);
  } catch (error) {
    console.error('Error reading alerts data:', error);
    res.status(500).json({ error: 'Failed to read alerts data' });
  }
});

export default router;
