export interface WindInfo {
  direction: string;
  speed: string;
}

export interface FacilityCoordinates {
  center: [number, number];
  zoom: number;
  boundary: [number, number][];
}

export interface FacilityData {
  facilityName: string;
  facilityType: string;
  location: string;
  operatingMode: string;
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  activeThermalEvents: number;
  openMaintenanceAnomalies: number;
  unresolvedAlerts: number;
  satelliteUpdate: string;
  telemetryUpdate: string;
  dataQuality: number;
  wind: WindInfo;
  coordinates: FacilityCoordinates;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  latitude: number;
  longitude: number;
  condition: string;
  isThermalEvent?: boolean;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  assetId: string;
  assetName: string;
  thermalIntensity: string;
  detectedAt: string;
  status: 'UNRESOLVED' | 'INVESTIGATING' | 'RESOLVED';
  description: string;
  locationCoordinates?: [number, number];
}

// Phase 2: Thermal Intelligence Types
export interface ThermalDayNight {
  daytime: number;
  nighttime: number;
  current: number;
}

export interface ThermalSummary {
  currentIntensity: number;
  baselineIntensity: number;
  normalRangeMin: number;
  normalRangeMax: number;
  locationShift: string;
  recurrence: string;
  classification: string;
  recommendedAction: string;
  dayNight: ThermalDayNight;
  historicalBaselineDescription?: string;
}

export interface ThermalPoint24h {
  time: string;
  intensity: number;
  baseline: number;
  isAnomaly: boolean;
}

export interface ThermalTrend7dPoint {
  date: string;
  avgIntensity: number;
  maxIntensity: number;
  baseline: number;
}

export interface ThermalBaseline30dPoint {
  day: string;
  intensity: number;
  baseline: number;
}

export interface ThermalObservation {
  time: string;
  intensity: string;
  latitude: number;
  longitude: number;
  source: string;
  dayNight: 'DAY' | 'NIGHT';
  classification: 'ROUTINE' | 'ABNORMAL';
  isAnomaly: boolean;
}

export interface ThermalData {
  summary: ThermalSummary;
  profile24h: ThermalPoint24h[];
  trend7d: ThermalTrend7dPoint[];
  baseline30d: ThermalBaseline30dPoint[];
  recentObservations: ThermalObservation[];
}

// Phase 3: Live Telemetry Types
export interface TelemetryMetric {
  value: number;
  unit: string;
  normalMin?: number;
  normalMax?: number;
  status?: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
}

export interface TelemetryHistoryPoint {
  timestamp: string;
  temperature: number;
  pressure: number;
  gas: number;
  vibration: number;
}

export interface EnvironmentTelemetry {
  windDirection: string;
  windSpeed: number;
  temperature: number;
}

export interface TelemetryAsset {
  assetId: string;
  assetName: string;
  assetType: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  temperature: TelemetryMetric;
  pressure: TelemetryMetric;
  gas: TelemetryMetric;
  flow: TelemetryMetric;
  vibration: TelemetryMetric;
  smokeFlame: string;
  valveState: string;
  equipmentMode: string;
  scadaAlarm: string;
  maintenanceState: string;
  interpretation?: string;
  history: TelemetryHistoryPoint[];
}

export interface TelemetryData {
  timestamp: string;
  facility: {
    id: string;
    name: string;
  };
  environment: EnvironmentTelemetry;
  assets: TelemetryAsset[];
}

// Phase 4: Asset Health & Anomaly Analysis Types
export interface EvidenceRow {
  parameter: string;
  value: string;
  status: string;
  isAnomaly: boolean;
}

export interface AssetHealthItem {
  assetId: string;
  assetName: string;
  assetType: string;
  healthStatus: 'NORMAL' | 'ATTENTION' | 'CRITICAL';
  healthScore: number;
  anomalyScore: number;
  primarySignal: string;
  maintenanceState: string;
  evidenceRows: EvidenceRow[];
  contributingSignals: string[];
  mitigatingSignals: string[];
  likelyCondition: string;
  supportingObservation: string;
  suggestedInspection: string;
  inspectionPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  inspectionReason: string;
  checklist: string[];
}

export interface AssetHealthSummary {
  assetsMonitored: number;
  normal: number;
  attention: number;
  critical: number;
  highAnomalyIndex: number;
  inspectionDue: number;
  evaluationTime: string;
  disclaimer: string;
}

export interface AssetHealthData {
  summary: AssetHealthSummary;
  assets: AssetHealthItem[];
}

export interface HistoricalIncident {
  caseId: string;
  asset: string;
  applicableAssetIds: string[];
  incidentType: string;
  similarity: number;
  patternSimilarity: string;
  observedPattern: string;
  rootCause: string;
  correctiveAction: string;
  resolutionOutcome?: string;
}

// Phase 5: Incident Workflow Types
export type IncidentWorkflowState =
  | 'ALERTED'
  | 'ACKNOWLEDGED'
  | 'INVESTIGATING'
  | 'INSPECTION'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED';

export interface AuditEventItem {
  id: string;
  timestamp: string;
  isoTimestamp: string;
  actor: string;
  type: string;
    eventType?: string;
  title: string;
  description: string;
}

export interface EvidenceItem {
  id: string;
  type: 'THERMAL_PHOTO' | 'FIELD_PHOTO' | 'SENSOR_READING' | 'INSPECTION_NOTE' | 'MAINTENANCE_RECORD';
  description: string;
  source: string;
  timestamp: string;
  isoTimestamp: string;
}

export interface ResolutionDetails {
  observedFinding: string;
  rootCause: string;
  correctiveAction: string;
  resolution: string;
  resolvedAt: string;
}

export interface ClosureDetails {
  rootCause: string;
  correctiveAction: string;
  closureNote: string;
  closedAt: string;
}

export interface EscalationDetails {
  status: string;
  target: string;
  reason: string;
  timestamp: string;
  note: string;
}

export interface IncidentRecord {
  id: string;
  alertId: string;
  assetId: string;
  assetName: string;
  assetType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  state: IncidentWorkflowState;
  detection: {
    type: string;
    intensity: string;
    baseline: string;
    locationShift: string;
    detectedAt: string;
  };
  telemetry: {
    temperature: string;
    temperatureStatus: string;
    gas: string;
    gasStatus: string;
    pressure: string;
    vibration: string;
    scadaAlarm: string;
    smokeFlame: string;
  };
  createdAt: string;
  lastUpdated: string;
  acknowledgedAt: string | null;
  investigationStartedAt: string | null;
  inspectionStartedAt: string | null;
  escalatedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  resolutionDetails: ResolutionDetails | null;
  closureDetails: ClosureDetails | null;
  feedbackAction: string | null;
  escalationDetails: EscalationDetails | null;
  evidenceList: EvidenceItem[];
  auditTrail: AuditEventItem[];
  ackDueAt?: string;
  autoEscalated?: boolean;
}

export interface EscalationConfig {
  responseWindowSeconds: number;
}

export type NotificationSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface PortalNotification {
  id: string;
  createdAt: string;
  severity: NotificationSeverity;
  title: string;
  message: string;
  incidentId: string;
  facilityId?: string;
  assetId?: string;
  read: boolean;
  channel: 'DEMO_IN_APP';
}

export interface IncidentReport {
  incidentId: string;
  facilityAndAsset: {
    facilityName: string;
    facilityType: string;
    facilityLocation: string;
    facilityCoordinates: string;
    assetId: string;
    assetName: string;
    assetType: string;
    assetStatus: string;
    assetRisk: string;
    assetCondition: string;
    assetCoordinates: string;
  };
  thermalObservation: {
    type: string;
    severity: string;
    intensity: string;
    baseline: string;
    detectedAt: string;
    locationShift: string;
    source: string;
    classification: string;
    coordinates: string;
    recommendedAction: string;
  };
  telemetryEvidence: {
    timestamp: string;
    assetId: string;
    assetName: string;
    temperature: string;
    temperatureStatus: string;
    gas: string;
    gasStatus: string;
    pressure: string;
    pressureStatus: string;
    flow: string;
    vibration: string;
    vibrationStatus: string;
    smokeFlame: string;
    valveState: string;
    equipmentMode: string;
    scadaAlarm: string;
    maintenanceState: string;
    interpretation: string;
  };
  timeline: AuditEventItem[];
  actionsTaken: string[];
  uploadedEvidence: string[];
  escalationStatus: {
    status: string;
    target: string;
    reason: string;
    escalatedAt: string;
    note: string;
  };
  rootCause: string;
  correctiveAction: string;
  finalResolution: string;
  generatedAt: string;
  reportStatus: 'DRAFT - incident open' | 'FINAL - incident closed';
}
