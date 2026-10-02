import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

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

// GET /api/incidents
router.get('/incidents', (_req: Request, res: Response) => {
  res.status(200).json(incidentsStore);
});

// GET /api/incidents/:id
router.get('/incidents/:id', (req: Request, res: Response) => {
  const incident = incidentsStore.find((i) => i.id === req.params.id || i.alertId === req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident record not found' });
  }
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
    note: 'Demo escalation record created for district operations.'
  };

  incident.auditTrail.push({
    id: `aud-${Date.now()}`,
    timestamp: nowTime,
    isoTimestamp: isoNow,
    actor,
    type: 'DISTRICT_ESCALATION',
    title: 'Facility escalated incident to district operations',
      eventType: 'DISTRICT_ESCALATION',
    description: `District escalation record submitted. Reason: ${reason} (Demo handoff only).`
  });

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

  res.status(200).json(incident);
});

export default router;
