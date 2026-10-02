import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { notify } from '../notifications/notificationService';

const router = Router();
const seedFilePath = path.join(__dirname, '../../data/incident-workflow.json');

// In-memory incident store seeded from JSON file
let incidentsStore: any[] = [];

try {
  const rawData = fs.readFileSync(seedFilePath, 'utf-8');
  incidentsStore = JSON.parse(rawData);
} catch (error) {
  console.error('Error seeding incident workflow data:', error);
}

// Helper to format local current time for audit stamps
const getFormattedTime = () => {
  const d = new Date();
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d
    .getUTCMinutes()
    .toString()
    .padStart(2, '0')}:${d.getUTCSeconds().toString().padStart(2, '0')} UTC`;
};

  const recognizedActionTypes = new Set([
    'BEGIN_INSPECTION',
    'START_FIELD_INSPECTION',
    'START_INSPECTION',
    'CONFIRM_ROUTINE',
    'PLANNED_MAINTENANCE',
    'DISPUTE_ALERT',
    'REPORT_SUSPECTED_LEAK',
    'REPORT_SUSPECTED_FIRE'
  ]);

const AUTO_ESCALATION_REASON = 'AUTO-ESCALATED: No facility acknowledgement within configured response window.';
let escalationConfig = { responseWindowSeconds: 300 };

const notifyIncidentEvent = (
  incident: any,
  eventId: string,
  createdAt: string,
  severity: 'critical' | 'warning' | 'info' | 'success',
  title: string,
  message: string
) => {
  void notify({
    id: `incident-event:${eventId}`,
    createdAt,
    severity,
    title,
    message,
    incidentId: String(incident.id || incident.alertId),
    ...(incident.facilityId ? { facilityId: String(incident.facilityId) } : {}),
    ...(incident.assetId ? { assetId: String(incident.assetId) } : {}),
    read: false,
    channel: 'DEMO_IN_APP'
  });
};

const escalateIncidentRecord = (
  incident: any,
  reason: string,
  actor: string,
  automatic = false
) => {
  const nowTime = getFormattedTime();
  const isoNow = new Date().toISOString();

  incident.state = 'ESCALATED';
  incident.escalatedAt = isoNow;
  incident.lastUpdated = isoNow;
  incident.escalationDetails = {
    status: 'SUBMITTED',
    target: 'DISTRICT_SAFETY_OPERATIONS',
    reason,
    timestamp: nowTime,
    note: automatic
      ? 'Demo handoff; no external notification is sent.'
      : 'Demo escalation record created for district operations.'
  };

  if (automatic) incident.autoEscalated = true;
  if (!Array.isArray(incident.auditTrail)) incident.auditTrail = [];
  const auditEventId = `aud-${Date.now()}`;
  incident.auditTrail.push({
    id: auditEventId,
    timestamp: nowTime,
    isoTimestamp: isoNow,
    actor,
    type: automatic ? 'AUTO_ESCALATION' : 'DISTRICT_ESCALATION',
    title: automatic ? 'Incident auto-escalated due to missing acknowledgement' : 'Facility escalated incident to district operations',
    eventType: automatic ? 'AUTO_ESCALATION' : 'DISTRICT_ESCALATION',
    description: automatic
      ? `${reason} This is a demo handoff; no external notification is sent.`
      : `District escalation record submitted. Reason: ${reason} (Demo handoff only).`
  });
  notifyIncidentEvent(
    incident,
    auditEventId,
    isoNow,
    'critical',
    automatic ? 'Incident auto-escalated' : 'Incident escalated',
    reason
  );
};

const isAcknowledgedOrTerminal = (incident: any): boolean => Boolean(
  incident.acknowledgedAt ||
  incident.state === 'ACKNOWLEDGED' ||
  incident.escalatedAt ||
  incident.state === 'ESCALATED' ||
  incident.autoEscalated ||
  incident.resolvedAt ||
  incident.state === 'RESOLVED' ||
  incident.closedAt ||
  incident.state === 'CLOSED'
);

const evaluateIncidentExpiry = (incident: any) => {
  if (isAcknowledgedOrTerminal(incident)) return;

  if (!incident.ackDueAt) {
    const now = Date.now();
    const raisedAt = Date.parse(incident.createdAt);
    const responseWindowMs = escalationConfig.responseWindowSeconds * 1000;
    // Historical demo fixtures get a fresh simulated window on their first read.
    const timerStartedAt = Number.isFinite(raisedAt) && raisedAt <= now && now - raisedAt < responseWindowMs
      ? raisedAt
      : now;
    incident.ackDueAt = new Date(timerStartedAt + responseWindowMs).toISOString();
  }

  const dueAt = Date.parse(incident.ackDueAt);
  if (Number.isFinite(dueAt) && dueAt <= Date.now()) {
    escalateIncidentRecord(incident, AUTO_ESCALATION_REASON, 'SYSTEM', true);
  }
};

// GET /api/escalation-config
router.get('/escalation-config', (_req: Request, res: Response) => {
  res.status(200).json(escalationConfig);
});

// PUT /api/escalation-config
router.put('/escalation-config', (req: Request, res: Response) => {
  const responseWindowSeconds = req.body?.responseWindowSeconds;
  if (!Number.isInteger(responseWindowSeconds) || responseWindowSeconds < 5 || responseWindowSeconds > 3600) {
    return res.status(400).json({ error: 'responseWindowSeconds must be an integer between 5 and 3600' });
  }

  escalationConfig = { responseWindowSeconds };
  return res.status(200).json(escalationConfig);
});

// GET /api/incidents
router.get('/incidents', (_req: Request, res: Response) => {
  incidentsStore.forEach(evaluateIncidentExpiry);
  res.status(200).json(incidentsStore);
});

// GET /api/incidents/:id
router.get('/incidents/:id', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }
  evaluateIncidentExpiry(incident);
  res.status(200).json(incident);
});

// POST /api/incidents/:id/escalation-timer/start
router.post('/incidents/:id/escalation-timer/start', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }
  if (isAcknowledgedOrTerminal(incident)) {
    return res.status(400).json({ error: 'Timer can only be started for an unacknowledged, open incident' });
  }

  incident.ackDueAt = new Date(Date.now() + escalationConfig.responseWindowSeconds * 1000).toISOString();
  incident.autoEscalated = false;
  incident.lastUpdated = new Date().toISOString();
  res.status(200).json(incident);
});

// POST /api/incidents/:id/acknowledge
router.post('/incidents/:id/acknowledge', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }

  const nowTime = getFormattedTime();
  const isoNow = new Date().toISOString();

  incident.state = 'ACKNOWLEDGED';
  incident.acknowledgedAt = isoNow;
  incident.lastUpdated = isoNow;

  incident.auditTrail.push({
    id: `aud-${Date.now()}`,
    timestamp: nowTime,
    isoTimestamp: isoNow,
    actor: req.body.actor || 'FACILITY_OPERATOR',
    type: 'ACKNOWLEDGEMENT',
    title: 'Facility operator acknowledged alert',
      eventType: 'ACKNOWLEDGEMENT',
    description: 'Alert confirmed received and under active review. Notice does not indicate false alarm or premature closure.'
  });

  res.status(200).json(incident);
});

// POST /api/incidents/:id/action
router.post('/incidents/:id/action', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }

  const { type, note, actor = 'FACILITY_OPERATOR' } = req.body;
    if (!recognizedActionTypes.has(type)) {
      return res.status(400).json({ error: 'Invalid incident action type' });
    }

  const nowTime = getFormattedTime();
  const isoNow = new Date().toISOString();

  incident.lastUpdated = isoNow;

  if (type === 'BEGIN_INSPECTION') {
    incident.state = 'INVESTIGATING';
    incident.investigationStartedAt = isoNow;
    incident.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: nowTime,
      isoTimestamp: isoNow,
      actor,
      type: 'INVESTIGATION_START',
      title: 'Field investigation initiated',
        eventType: 'BEGIN_INSPECTION',
      description: note || 'Field investigation initiated for Tank Farm 04.'
    });
    const auditEvent = incident.auditTrail[incident.auditTrail.length - 1];
    notifyIncidentEvent(incident, auditEvent.id, isoNow, 'warning', 'Inspection required', auditEvent.description);
  } else if (type === 'START_FIELD_INSPECTION' || type === 'START_INSPECTION') {
    incident.state = 'INSPECTION';
    incident.inspectionStartedAt = isoNow;
    incident.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: nowTime,
      isoTimestamp: isoNow,
      actor,
      type: 'FIELD_INSPECTION_START',
      title: 'Field inspection started for Tank Farm 04.',
        eventType: 'START_FIELD_INSPECTION',
      description: note || 'Field inspection started for Tank Farm 04.'
    });
    const auditEvent = incident.auditTrail[incident.auditTrail.length - 1];
    notifyIncidentEvent(incident, auditEvent.id, isoNow, 'warning', 'Inspection started', auditEvent.description);
  } else if (type === 'CONFIRM_ROUTINE') {
    incident.feedbackAction = 'CONFIRM_ROUTINE';
    incident.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: nowTime,
      isoTimestamp: isoNow,
      actor,
      type: 'OPERATOR_FEEDBACK',
      title: 'Facility confirmed activity as routine',
        eventType: 'CONFIRM_ROUTINE',
      description: note || 'Operator recorded assessment that observed thermal activity corresponds with routine operations. Regulatory alert preserved.'
    });
  } else if (type === 'PLANNED_MAINTENANCE') {
    incident.feedbackAction = 'PLANNED_MAINTENANCE';
    incident.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: nowTime,
      isoTimestamp: isoNow,
      actor,
      type: 'OPERATOR_FEEDBACK',
      title: 'Activity marked as planned maintenance',
        eventType: 'PLANNED_MAINTENANCE',
      description: note || 'Observed thermal footprint associated with approved scheduled operating/maintenance window.'
    });
  } else if (type === 'DISPUTE_ALERT') {
    incident.feedbackAction = 'DISPUTE_ALERT';
    incident.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: nowTime,
      isoTimestamp: isoNow,
      actor,
      type: 'DISPUTE_SUBMITTED',
      title: 'Facility disputed regulatory alert',
        eventType: 'DISPUTE_ALERT',
      description: note || 'Operator logged formal contestation indicating sensor measurements may reflect reflection or flare background artifact.'
    });
  } else if (type === 'REPORT_SUSPECTED_LEAK') {
    incident.feedbackAction = 'REPORT_SUSPECTED_LEAK';
    incident.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: nowTime,
      isoTimestamp: isoNow,
      actor,
      type: 'SUSPECTED_LEAK',
      title: 'Suspected hydrocarbon vapor leak reported',
        eventType: 'REPORT_SUSPECTED_LEAK',
      description: note || 'Operator flagged elevated gas concentrations coinciding with localized thermal elevation.'
    });
  } else if (type === 'REPORT_SUSPECTED_FIRE') {
    incident.feedbackAction = 'REPORT_SUSPECTED_FIRE';
    incident.auditTrail.push({
      id: `aud-${Date.now()}`,
      timestamp: nowTime,
      isoTimestamp: isoNow,
      actor,
      type: 'SUSPECTED_FIRE',
      title: 'Suspected thermal/fire condition reported',
        eventType: 'REPORT_SUSPECTED_FIRE',
      description: note || 'Operator flagged acute thermal signature for emergency fire-watch monitoring.'
    });
  } else {
  }

  res.status(200).json(incident);
});

// POST /api/incidents/:id/evidence
router.post('/incidents/:id/evidence', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }

  const { type = 'THERMAL_PHOTO', description, source = 'FIELD_OPERATOR' } = req.body;
  const nowTime = getFormattedTime();
  const isoNow = new Date().toISOString();

  const evidenceItem = {
    id: `ev-${Date.now()}`,
    type,
    description: description || 'Field verification record',
    source,
    timestamp: nowTime,
    isoTimestamp: isoNow
  };

  if (!incident.evidenceList) {
    incident.evidenceList = [];
  }
  incident.evidenceList.push(evidenceItem);
  incident.lastUpdated = isoNow;

  incident.auditTrail.push({
    id: `aud-${Date.now()}`,
    timestamp: nowTime,
    isoTimestamp: isoNow,
    actor: source,
    type: 'EVIDENCE_SUBMITTED',
    title: `Evidence Submitted: ${type.replace(/_/g, ' ')}`,
      eventType: 'EVIDENCE_SUBMITTED',
      description: `${description || 'Field verification record'} (Source: ${source})`
  });

  res.status(200).json(incident);
});

// POST /api/incidents/:id/escalate
router.post('/incidents/:id/escalate', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }

  const { reason = 'Cross-signal thermal and gas elevation requires district oversight.', actor = 'FACILITY_OPERATOR' } = req.body;
  escalateIncidentRecord(incident, reason, actor);

  res.status(200).json(incident);
});

// POST /api/incidents/:id/resolve
router.post('/incidents/:id/resolve', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }

  // Do not allow resolution directly from ALERTED, ACKNOWLEDGED, or INVESTIGATING
  if (incident.state !== 'INSPECTION' && incident.state !== 'ESCALATED' && !incident.inspectionStartedAt) {
    return res.status(400).json({
      error: 'Resolution requires field inspection or escalation prior to resolution.'
    });
  }

  const {
    observedFinding = 'Thermal anomaly verified as controlled tank heating cycle.',
    rootCause = 'Planned operating activity',
    correctiveAction = 'Operating schedule verified and inspection record updated.',
    resolution = 'Thermal activity traced to planned tank heating operation.'
  } = req.body;

  const nowTime = getFormattedTime();
  const isoNow = new Date().toISOString();

  incident.state = 'RESOLVED';
  incident.resolvedAt = isoNow;
  incident.lastUpdated = isoNow;
  incident.resolutionDetails = {
    observedFinding,
    rootCause,
    correctiveAction,
    resolution,
    resolvedAt: nowTime
  };

  incident.auditTrail.push({
    id: `aud-${Date.now()}`,
    timestamp: nowTime,
    isoTimestamp: isoNow,
    actor: req.body.actor || 'FACILITY_OPERATOR',
    type: 'RESOLUTION',
    title: 'Incident marked as resolved',
      eventType: 'RESOLUTION',
    description: `Finding: ${observedFinding}. Root Cause: ${rootCause}. Corrective Action: ${correctiveAction}. Awaiting final administrative closure.`
  });
  const auditEvent = incident.auditTrail[incident.auditTrail.length - 1];
  notifyIncidentEvent(incident, auditEvent.id, isoNow, 'success', 'Incident resolved', resolution);

  res.status(200).json(incident);
});

// POST /api/incidents/:id/close
router.post('/incidents/:id/close', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }

  const {
    rootCause = incident.resolutionDetails?.rootCause || 'Planned tank heating operation',
    correctiveAction = incident.resolutionDetails?.correctiveAction || 'Updated operating schedule and maintenance log',
    closureNote = 'Inspection completed and confirmed nominal.'
  } = req.body;

  const nowTime = getFormattedTime();
  const isoNow = new Date().toISOString();

  incident.state = 'CLOSED';
  incident.closedAt = isoNow;
  incident.lastUpdated = isoNow;
  incident.closureDetails = {
    rootCause,
    correctiveAction,
    closureNote,
    closedAt: nowTime
  };

  incident.auditTrail.push({
    id: `aud-${Date.now()}`,
    timestamp: nowTime,
    isoTimestamp: isoNow,
    actor: req.body.actor || 'SAFETY_SUPERVISOR',
    type: 'CLOSURE',
    title: 'Incident formally closed',
      eventType: 'CLOSURE',
      description: `Incident closed. Root cause: ${rootCause}. Corrective action: ${correctiveAction}. Demo session record is held in memory and resets when the backend restarts.`
  });
  const auditEvent = incident.auditTrail[incident.auditTrail.length - 1];
  notifyIncidentEvent(incident, auditEvent.id, isoNow, 'info', 'Incident closed', closureNote);

  res.status(200).json(incident);
});

const reportText = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return String(value);
  return 'Not recorded';
};

const readReportFixture = (fileName: string): any => {
  const fixturePath = path.join(__dirname, '../../data', fileName);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
};

const reportMetric = (metric: any): string => {
  if (!metric || metric.value === undefined || metric.value === null) return 'Not recorded';
  return `${reportText(metric.value)} ${reportText(metric.unit)}`;
};

const reportCoordinates = (latitude: unknown, longitude: unknown): string => {
  if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
    return 'Not recorded';
  }
  return `${reportText(latitude)}, ${reportText(longitude)}`;
};

const reportTimeline = (events: any[]) => events.map((event: any) => ({
  id: reportText(event.id),
  timestamp: reportText(event.timestamp || event.isoTimestamp),
  isoTimestamp: reportText(event.isoTimestamp || event.timestamp),
  actor: reportText(event.actor),
  type: reportText(event.type || event.eventType),
  eventType: reportText(event.eventType || event.type),
  title: reportText(event.title),
  description: reportText(event.description)
}));

// POST /api/incidents/:id/report
router.post('/incidents/:id/report', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }

  try {
    const facility = readReportFixture('facility.json');
    const assets = readReportFixture('assets.json') as any[];
    const thermalData = readReportFixture('thermal-events.json');
    const telemetryData = readReportFixture('telemetry.json');
    const asset = assets.find((item: any) => item.id === incident.assetId || item.name === incident.assetName);
    const telemetryAssets = Array.isArray(telemetryData.assets) ? telemetryData.assets : [];
    const telemetryAsset = telemetryAssets.find(
      (item: any) => item.assetId === incident.assetId || item.assetName === incident.assetName
    );
    const observations = Array.isArray(thermalData.recentObservations)
      ? thermalData.recentObservations
      : [];
    const thermalObservation = observations.find((item: any) => item.isAnomaly) || observations[0];
    const auditTrail = Array.isArray(incident.auditTrail) ? incident.auditTrail : [];
    const actionsTaken = auditTrail
      .filter((event: any) => event.type !== 'DETECTION' && event.type !== 'ALERT_DISPATCH')
      .map((event: any) => `${reportText(event.timestamp || event.isoTimestamp)} - ${reportText(event.title)}: ${reportText(event.description)}`);
    const generatedAt = new Date().toISOString();
    const reportStatus = incident.state === 'CLOSED'
      ? 'FINAL - incident closed'
      : 'DRAFT - incident open';

    const report = {
      incidentId: reportText(incident.id || incident.alertId),
      facilityAndAsset: {
        facilityName: reportText(facility.facilityName),
        facilityType: reportText(facility.facilityType),
        facilityLocation: reportText(facility.location),
        facilityCoordinates: reportCoordinates(
          facility.coordinates?.center?.[0],
          facility.coordinates?.center?.[1]
        ),
        assetId: reportText(incident.assetId || asset?.id),
        assetName: reportText(asset?.name || incident.assetName),
        assetType: reportText(asset?.type || incident.assetType),
        assetStatus: reportText(asset?.status),
        assetRisk: reportText(asset?.risk),
        assetCondition: reportText(asset?.condition),
        assetCoordinates: reportCoordinates(asset?.latitude, asset?.longitude)
      },
      thermalObservation: {
        type: reportText(incident.detection?.type || thermalData.summary?.classification),
        severity: reportText(incident.severity),
        intensity: reportText(thermalObservation?.intensity || incident.detection?.intensity || thermalData.summary?.currentIntensity),
        baseline: reportText(incident.detection?.baseline || thermalData.summary?.baselineIntensity),
        detectedAt: reportText(thermalObservation?.time || incident.createdAt || incident.detection?.detectedAt),
        locationShift: reportText(incident.detection?.locationShift || thermalData.summary?.locationShift),
        source: reportText(thermalObservation?.source),
        classification: reportText(thermalObservation?.classification || thermalData.summary?.classification),
        coordinates: reportCoordinates(thermalObservation?.latitude, thermalObservation?.longitude),
        recommendedAction: reportText(thermalData.summary?.recommendedAction)
      },
      telemetryEvidence: {
        timestamp: reportText(telemetryData.timestamp),
        assetId: reportText(telemetryAsset?.assetId || incident.assetId),
        assetName: reportText(telemetryAsset?.assetName || incident.assetName),
        temperature: reportMetric(telemetryAsset?.temperature),
        temperatureStatus: reportText(telemetryAsset?.temperature?.status),
        gas: reportMetric(telemetryAsset?.gas),
        gasStatus: reportText(telemetryAsset?.gas?.status),
        pressure: reportMetric(telemetryAsset?.pressure),
        pressureStatus: reportText(telemetryAsset?.pressure?.status),
        flow: reportMetric(telemetryAsset?.flow),
        vibration: reportMetric(telemetryAsset?.vibration),
        vibrationStatus: reportText(telemetryAsset?.vibration?.status),
        smokeFlame: reportText(telemetryAsset?.smokeFlame),
        valveState: reportText(telemetryAsset?.valveState),
        equipmentMode: reportText(telemetryAsset?.equipmentMode),
        scadaAlarm: reportText(telemetryAsset?.scadaAlarm),
        maintenanceState: reportText(telemetryAsset?.maintenanceState),
        interpretation: reportText(telemetryAsset?.interpretation)
      },
      timeline: reportTimeline(auditTrail),
      actionsTaken: actionsTaken.length ? actionsTaken : ['Not recorded'],
      uploadedEvidence: Array.isArray(incident.evidenceList) && incident.evidenceList.length
        ? incident.evidenceList.map((evidence: any) =>
          `${reportText(evidence.type)} - ${reportText(evidence.description)} (Source: ${reportText(evidence.source)}; Recorded: ${reportText(evidence.timestamp || evidence.isoTimestamp)})`
        )
        : ['Not recorded'],
      escalationStatus: {
        status: reportText(incident.escalationDetails?.status || (incident.escalatedAt ? incident.state : undefined)),
        target: reportText(incident.escalationDetails?.target),
        reason: reportText(incident.escalationDetails?.reason),
        escalatedAt: reportText(incident.escalatedAt),
        note: reportText(incident.escalationDetails?.note)
      },
      rootCause: reportText(incident.resolutionDetails?.rootCause || incident.closureDetails?.rootCause),
      correctiveAction: reportText(incident.resolutionDetails?.correctiveAction || incident.closureDetails?.correctiveAction),
      finalResolution: reportText(incident.resolutionDetails?.resolution || incident.closureDetails?.closureNote),
      generatedAt,
      reportStatus
    };

    const requestedActor = req.body?.actor;
    const actor = typeof requestedActor === 'string' && requestedActor.trim()
      ? requestedActor.trim()
      : 'FACILITY_OPERATOR';
    const timestamp = getFormattedTime();
    const auditEvent = {
      id: `aud-${Date.now()}`,
      timestamp,
      isoTimestamp: generatedAt,
      actor,
      type: 'REPORT_GENERATED',
      eventType: 'REPORT_GENERATED',
      title: 'Incident report generated',
      description: `Incident/root-cause report generated for ${report.incidentId}. ${reportStatus}.`
    };

    report.timeline = reportTimeline([...auditTrail, auditEvent]);
    incident.auditTrail = auditTrail;
    incident.auditTrail.push(auditEvent);

    return res.status(200).json(report);
  } catch (error) {
    console.error('Error generating incident report:', error);
    return res.status(500).json({ error: 'Failed to generate incident report' });
  }
});

export default router;
