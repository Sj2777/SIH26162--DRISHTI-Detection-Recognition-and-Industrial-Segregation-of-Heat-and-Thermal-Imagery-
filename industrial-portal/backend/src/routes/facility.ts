import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const dataFilePath = path.join(__dirname, '../../data/facility.json');

router.get('/facility', (_req: Request, res: Response) => {
  try {
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    const facilityData = JSON.parse(rawData);
    res.status(200).json(facilityData);
  } catch (error) {
    console.error('Error reading facility data:', error);
    res.status(500).json({ error: 'Failed to read facility data' });
  }
});

export default router;
