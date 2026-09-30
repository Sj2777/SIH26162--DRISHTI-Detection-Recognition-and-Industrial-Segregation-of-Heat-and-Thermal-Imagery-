import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const healthFilePath = path.join(__dirname, '../../data/asset-health.json');
const incidentsFilePath = path.join(__dirname, '../../data/historical-incidents.json');

router.get('/asset-health', (_req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(healthFilePath, 'utf-8');
    const healthData = JSON.parse(rawData);
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Error reading asset health data:', error);
    res.status(500).json({ error: 'Failed to read asset health data' });
  }
});

router.get('/historical-incidents', (_req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(incidentsFilePath, 'utf-8');
    const incidentsData = JSON.parse(rawData);
    res.status(200).json(incidentsData);
  } catch (error) {
    console.error('Error reading historical incidents data:', error);
    res.status(500).json({ error: 'Failed to read historical incidents data' });
  }
});

export default router;
