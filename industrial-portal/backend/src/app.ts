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

// Configure CORS for local development (allow all localhost ports since we proxy through vite)
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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
