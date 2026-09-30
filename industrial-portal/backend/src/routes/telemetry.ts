import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataFilePath = path.join(__dirname, '../../data/telemetry.json');

router.get('/telemetry', (_req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const telemetryData = JSON.parse(rawData);
    res.status(200).json(telemetryData);
  } catch (error) {
    console.error('Error reading telemetry data:', error);
    res.status(500).json({ error: 'Failed to read telemetry data' });
  }
});

export default router;
