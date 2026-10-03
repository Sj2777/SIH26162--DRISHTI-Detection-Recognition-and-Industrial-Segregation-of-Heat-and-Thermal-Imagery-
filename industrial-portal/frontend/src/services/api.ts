import {
  FacilityData,
  Asset,
  AlertItem,
  ThermalData,
  SatelliteVsReportedData,
  TelemetryData,
  AssetHealthData,
  HistoricalIncident,
  IncidentRecord,
  IncidentReport,
  EscalationConfig,
  PortalNotification,
} from '../types';

const API_BASE = '/industry-api/api';

export const fetchFacilityData = async (): Promise<FacilityData> => {
  const response = await fetch(`${API_BASE}/facility`);
  if (!response.ok) {
    throw new Error(`Failed to fetch facility data: ${response.statusText}`);
  }
  return response.json();
};

export const fetchAssets = async (): Promise<Asset[]> => {
  const response = await fetch(`${API_BASE}/assets`);
  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.statusText}`);
  }
  return response.json();
};

export const fetchAlerts = async (): Promise<AlertItem[]> => {
  const response = await fetch(`${API_BASE}/alerts`);
  if (!response.ok) {
    throw new Error(`Failed to fetch alerts: ${response.statusText}`);
  }
  return response.json();
};

export const fetchHealth = async (): Promise<{ status: string; service: string }> => {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch health: ${response.statusText}`);
  }
  return response.json();
};

export const fetchThermalEvents = async (): Promise<ThermalData> => {
  const response = await fetch(`${API_BASE}/thermal-events`);
  if (!response.ok) {
    throw new Error(`Failed to fetch thermal events: ${response.statusText}`);
  }
  return response.json();
};

export const fetchSatelliteVsReported = async (): Promise<SatelliteVsReportedData> => {
  const response = await fetch(`${API_BASE}/satellite-vs-reported`);
  if (!response.ok) {
    throw new Error(`Failed to fetch satellite vs reported activity: ${response.statusText}`);
  }
  return response.json();
};

export const fetchTelemetry = async (): Promise<TelemetryData> => {
  const response = await fetch(`${API_BASE}/telemetry`);
  if (!response.ok) {
    throw new Error(`Failed to fetch telemetry data: ${response.statusText}`);
  }
  return response.json();
};

export const fetchAssetHealth = async (): Promise<AssetHealthData> => {
  const response = await fetch(`${API_BASE}/asset-health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset health data: ${response.statusText}`);
  }
  return response.json();
};

export const fetchHistoricalIncidents = async (): Promise<HistoricalIncident[]> => {
  const response = await fetch(`${API_BASE}/historical-incidents`);
  if (!response.ok) {
    throw new Error(`Failed to fetch historical incidents: ${response.statusText}`);
  }
  return response.json();
};

// Phase 5: Incident Workflow API calls
export const fetchIncidents = async (): Promise<IncidentRecord[]> => {
  const response = await fetch(`${API_BASE}/incidents`);
  if (!response.ok) {
    throw new Error(`Failed to fetch incidents: ${response.statusText}`);
  }
  return response.json();
};

export const fetchIncidentById = async (id: string): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch incident ${id}: ${response.statusText}`);
  }
  return response.json();
};

export const acknowledgeIncident = async (
  id: string,
  actor = 'FACILITY_OPERATOR'
): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${id}/acknowledge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor }),
  });
  if (!response.ok) {
    throw new Error(`Failed to acknowledge incident: ${response.statusText}`);
  }
  return response.json();
};

export const performIncidentAction = async (
  id: string,
  type: string,
  note?: string,
  actor = 'FACILITY_OPERATOR'
): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, note, actor }),
  });
  if (!response.ok) {
    throw new Error(`Failed to perform action ${type}: ${response.statusText}`);
  }
  return response.json();
};

export const submitIncidentEvidence = async (
  id: string,
  type: string,
  description: string,
  source = 'FIELD_OPERATOR'
): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${id}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, description, source }),
  });
  if (!response.ok) {
    throw new Error(`Failed to submit evidence: ${response.statusText}`);
  }
  return response.json();
};

export const escalateIncident = async (
  id: string,
  reason?: string,
  actor = 'FACILITY_OPERATOR'
): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${id}/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, actor }),
  });
  if (!response.ok) {
    throw new Error(`Failed to escalate incident: ${response.statusText}`);
  }
  return response.json();
};

export const resolveIncident = async (
  id: string,
  details: {
    observedFinding?: string;
    rootCause?: string;
    correctiveAction?: string;
    resolution?: string;
  }
): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  if (!response.ok) {
    throw new Error(`Failed to resolve incident: ${response.statusText}`);
  }
  return response.json();
};

export const closeIncident = async (
  id: string,
  details: {
    rootCause: string;
    correctiveAction: string;
    closureNote: string;
  }
): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${id}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
  if (!response.ok) {
    throw new Error(`Failed to close incident: ${response.statusText}`);
  }
  return response.json();
};

export const generateIncidentReport = async (
  id: string,
  actor = 'FACILITY_OPERATOR'
): Promise<IncidentReport> => {
  const response = await fetch(`${API_BASE}/incidents/${encodeURIComponent(id)}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate incident report: ${response.statusText}`);
  }
  return response.json();
};

export const fetchEscalationConfig = async (): Promise<EscalationConfig> => {
  const response = await fetch(`${API_BASE}/escalation-config`);
  if (!response.ok) {
    throw new Error(`Failed to fetch escalation config: ${response.statusText}`);
  }
  return response.json();
};

export const updateEscalationConfig = async (
  responseWindowSeconds: number
): Promise<EscalationConfig> => {
  const response = await fetch(`${API_BASE}/escalation-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responseWindowSeconds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update escalation config: ${response.statusText}`);
  }
  return response.json();
};

export const startIncidentEscalationTimer = async (id: string): Promise<IncidentRecord> => {
  const response = await fetch(`${API_BASE}/incidents/${encodeURIComponent(id)}/escalation-timer/start`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to start escalation timer: ${response.statusText}`);
  }
  return response.json();
};

export const fetchNotifications = async (): Promise<PortalNotification[]> => {
  const response = await fetch(`${API_BASE}/notifications`);
  if (!response.ok) {
    throw new Error(`Failed to fetch notifications: ${response.statusText}`);
  }
  return response.json();
};

export const markNotificationRead = async (id: string): Promise<PortalNotification> => {
  const response = await fetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to mark notification as read: ${response.statusText}`);
  }
  return response.json();
};

export const markAllNotificationsRead = async (): Promise<PortalNotification[]> => {
  const response = await fetch(`${API_BASE}/notifications/read-all`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
  }
  const result: { notifications: PortalNotification[] } = await response.json();
  return result.notifications;
};
