import express, { Application } from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import facilityRouter from './routes/facility';
import assetsRouter from './routes/assets';
import alertsRouter from './routes/alerts';
import thermalEventsRouter from './routes/thermalEvents';
import telemetryRouter from './routes/telemetry';
import assetHealthRouter from './routes/assetHealth';
import incidentsRouter from './routes/incidents';

const app: Application = express();

// Configure CORS for local development
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());

// API Routes
app.use('/api', healthRouter);
app.use('/api', facilityRouter);
app.use('/api', assetsRouter);
app.use('/api', alertsRouter);
app.use('/api', thermalEventsRouter);
app.use('/api', telemetryRouter);
app.use('/api', assetHealthRouter);
app.use('/api', incidentsRouter);

export default app;
