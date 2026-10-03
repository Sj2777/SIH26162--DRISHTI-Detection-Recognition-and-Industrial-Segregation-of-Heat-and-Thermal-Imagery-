import express, { Application, ErrorRequestHandler } from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import facilityRouter from './routes/facility';
import assetsRouter from './routes/assets';
import alertsRouter from './routes/alerts';
import thermalEventsRouter from './routes/thermalEvents';
import telemetryRouter from './routes/telemetry';
import assetHealthRouter from './routes/assetHealth';
import incidentsRouter from './routes/incidents';
import satelliteVsReportedRouter from './routes/satelliteVsReported';
import notificationsRouter from './routes/notifications';

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
app.use('/api', satelliteVsReportedRouter);
app.use('/api/notifications', notificationsRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

const jsonParseErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const isMalformedJson =
    error instanceof SyntaxError &&
    'status' in error &&
    error.status === 400 &&
    'type' in error &&
    error.type === 'entity.parse.failed';

  if (req.path.startsWith('/api') && isMalformedJson) {
    res.status(400).json({ error: 'Malformed JSON request body' });
    return;
  }

  next(error);
};

app.use(jsonParseErrorHandler);

export default app;
