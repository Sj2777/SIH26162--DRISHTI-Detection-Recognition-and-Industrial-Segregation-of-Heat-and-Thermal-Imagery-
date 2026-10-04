export type AlertContractSchemaVersion = "0.1";

export type IncidentState =
  | "ALERTED"
  | "ACKNOWLEDGED"
  | "INVESTIGATING"
  | "INSPECTION"
  | "ESCALATED"
  | "RESOLVED"
  | "CLOSED";

export type AlertThermalSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AlertLocation {
  lat: number;
  lon: number;
}

export interface InboundAlert {
  schemaVersion: AlertContractSchemaVersion;
  alertId: string;
  incidentId: string;
  facilityId: string;
  assetId: string;
  thermalSeverity: AlertThermalSeverity;
  detectedAt: string;
  location: AlertLocation;
  source: string;
  currentStatus: "ALERTED";
}

export type AlertReceiptDisposition = "ACCEPTED" | "DUPLICATE_IGNORED";

export interface AcknowledgementResponse {
  schemaVersion: AlertContractSchemaVersion;
  alertId: string;
  incidentId: string;
  disposition: AlertReceiptDisposition;
  currentStatus: IncidentState;
  receivedAt: string;
}

export interface StatusUpdateBase {
  schemaVersion: AlertContractSchemaVersion;
  messageId: string;
  alertId: string;
  incidentId: string;
  status: LifecycleStatus;
  occurredAt: string;
  actor: string;
}

export interface AcknowledgeStatusUpdate extends StatusUpdateBase {
  status: "ACKNOWLEDGE";
  note?: string;
}

export interface InvestigatingStatusUpdate extends StatusUpdateBase {
  status: "INVESTIGATING";
  note?: string;
}

export interface InspectionStatusUpdate extends StatusUpdateBase {
  status: "INSPECTION";
  inspectionId?: string;
  note?: string;
}

export interface EvidenceItem {
  evidenceType: string;
  description: string;
  source: string;
  uri?: string;
}

export interface EvidenceStatusUpdate extends StatusUpdateBase {
  status: "EVIDENCE";
  evidence: EvidenceItem[];
}

export interface EscalateStatusUpdate extends StatusUpdateBase {
  status: "ESCALATE";
  target: string;
  reason: string;
}

export interface ResolveStatusUpdate extends StatusUpdateBase {
  status: "RESOLVE";
  observedFinding: string;
  rootCause: string;
  correctiveAction: string;
  resolution: string;
}

export interface CloseStatusUpdate extends StatusUpdateBase {
  status: "CLOSE";
  rootCause: string;
  correctiveAction: string;
  closureNote: string;
}

export type LifecycleStatus =
  | "ACKNOWLEDGE"
  | "INVESTIGATING"
  | "INSPECTION"
  | "EVIDENCE"
  | "ESCALATE"
  | "RESOLVE"
  | "CLOSE";

export type OutboundStatusUpdate =
  | AcknowledgeStatusUpdate
  | InvestigatingStatusUpdate
  | InspectionStatusUpdate
  | EvidenceStatusUpdate
  | EscalateStatusUpdate
  | ResolveStatusUpdate
  | CloseStatusUpdate;

export interface EscalationResponse {
  schemaVersion: AlertContractSchemaVersion;
  alertId: string;
  incidentId: string;
  accepted: boolean;
  status: "ESCALATED";
  target: string;
  escalationId?: string;
  respondedAt: string;
}

export interface ResolutionResponse {
  schemaVersion: AlertContractSchemaVersion;
  alertId: string;
  incidentId: string;
  accepted: boolean;
  status: "RESOLVED";
  resolvedAt: string;
  resolution: Pick<ResolveStatusUpdate, "observedFinding" | "rootCause" | "correctiveAction" | "resolution">;
}

export type AlertContractErrorCode =
  | "INVALID_PAYLOAD"
  | "UNSUPPORTED_SCHEMA_VERSION"
  | "INVALID_TRANSITION"
  | "UNKNOWN_ALERT"
  | "UNKNOWN_INCIDENT"
  | "ID_MISMATCH"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface AlertContractErrorResponse {
  schemaVersion: AlertContractSchemaVersion;
  code: AlertContractErrorCode;
  message: string;
  retryable: boolean;
  correlationId?: string;
}
