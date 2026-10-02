# Alert Integration Contract (Draft v0.1)

**Status: proposal only. Nothing in this document is integrated.** No endpoint, transport, authentication, or runtime behavior is implemented by this proposal.

Audience: teammates responsible for the National/District dashboard and municipal portal. This draft describes a shared alert/incident vocabulary for review; it is not a decision about deployment architecture.

The JSON examples reuse fixture values where available. Lifecycle responses describe hypothetical outcomes, not events recorded in the current fixture data.

## Flow

```text
National/District
      -- ALERT -->
Industrial Portal
      -- ACKNOWLEDGE | INVESTIGATING | INSPECTION | EVIDENCE | ESCALATE | RESOLVE | CLOSE -->
Shared incident state
```

`ALERT` creates or identifies an incident in the Industrial Portal. Outbound lifecycle messages report operator activity to the agreed shared incident state. `EVIDENCE` is an event on the incident and does not itself advance the incident state.

## Payload conventions

- JSON object properties use the exact camelCase spelling shown below.
- `schemaVersion` is the literal string `"0.1"` for this draft.
- All timestamps are ISO 8601 UTC strings ending in `Z`; examples use seconds precision. A local-time display string is not a contract timestamp.
- Coordinates use decimal degrees: `lat` is latitude and `lon` is longitude. The authoritative coordinates remain unresolved (see Location note).
- IDs are opaque strings in this draft; formats remain open.

### Inbound ALERT

Required payload:

```json
{
  "schemaVersion": "0.1",
  "alertId": "ALT-2026-0891",
  "incidentId": "ALT-2026-0891",
  "facilityId": "Tata Motors Ltd (Pimpri Plant)",
  "assetId": "ast-02",
  "thermalSeverity": "HIGH",
  "detectedAt": "2026-09-29T14:32:08Z",
  "location": { "lat": 18.6213, "lon": 73.809 },
  "source": "GOV_MONITORING_NETWORK",
  "currentStatus": "ALERTED"
}
```

`thermalSeverity` proposal values: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`. `currentStatus` must be `ALERTED` for a newly delivered alert. The example reuses the fixture's facility name in `facilityId` only as a placeholder: that fixture has no facility ID, and the name is not an approved identifier.

### Outbound lifecycle status updates

All seven payloads share this envelope:

```json
{
  "schemaVersion": "0.1",
  "messageId": "msg-opaque",
  "alertId": "ALT-2026-0891",
  "incidentId": "ALT-2026-0891",
  "status": "ACKNOWLEDGE",
  "occurredAt": "2026-09-29T14:36:12Z",
  "actor": "FACILITY_OPERATOR"
}
```

The event-specific properties are:

| `status` | Additional properties |
|---|---|
| `ACKNOWLEDGE` | Optional `note` |
| `INVESTIGATING` | Optional `note` |
| `INSPECTION` | Optional `inspectionId`, optional `note` |
| `EVIDENCE` | Required `evidence`: array of `{ evidenceType, description, source, uri? }` |
| `ESCALATE` | Required `target`, `reason` |
| `RESOLVE` | Required `observedFinding`, `rootCause`, `correctiveAction`, `resolution` |
| `CLOSE` | Required `rootCause`, `correctiveAction`, `closureNote` |

Example `EVIDENCE` item: `{ "evidenceType": "THERMAL_PHOTO", "description": "Field verification record", "source": "FIELD_OPERATOR", "uri": "https://..." }`. `uri` is an optional reference, not a requirement to embed evidence bytes. Handling sensitive evidence and the URI scheme need agreement.

### Responses

These are proposed response bodies, independent of the transport decision:

**Alert receipt / acknowledgement response** (returned for an accepted new alert or an idempotent duplicate):

```json
{
  "schemaVersion": "0.1",
  "alertId": "ALT-2026-0891",
  "incidentId": "ALT-2026-0891",
  "disposition": "ACCEPTED",
  "currentStatus": "ALERTED",
  "receivedAt": "2026-09-29T14:32:08Z"
}
```

`disposition` is `ACCEPTED` for first acceptance and `DUPLICATE_IGNORED` when the same `alertId` has already been accepted. A duplicate response returns the existing `incidentId` and state; it must not create or reset an incident.

**Escalation response:**

```json
{
  "schemaVersion": "0.1",
  "alertId": "ALT-2026-0891",
  "incidentId": "ALT-2026-0891",
  "accepted": true,
  "status": "ESCALATED",
  "target": "DISTRICT_SAFETY_OPERATIONS",
  "respondedAt": "2026-09-29T14:36:12Z"
}
```

`escalationId` is optional until its issuing system is agreed.

**Resolution response:**

```json
{
  "schemaVersion": "0.1",
  "alertId": "ALT-2026-0891",
  "incidentId": "ALT-2026-0891",
  "accepted": true,
  "status": "RESOLVED",
  "resolvedAt": "2026-09-29T14:36:12Z",
  "resolution": {
    "observedFinding": "Thermal anomaly at 2.7x facility baseline",
    "rootCause": "Planned operating activity",
    "correctiveAction": "Operating schedule verified and inspection record updated.",
    "resolution": "Thermal activity traced to planned tank heating operation."
  }
}
```

### Proposed transitions and idempotency

These are proposed contract rules, not enforced by the current demo routes:

| Current state | Allowed event / next state |
|---|---|
| `ALERTED` | `ACKNOWLEDGE` -> `ACKNOWLEDGED` |
| `ACKNOWLEDGED` | `INVESTIGATING` -> `INVESTIGATING` |
| `INVESTIGATING` | `INSPECTION` -> `INSPECTION`; `ESCALATE` -> `ESCALATED` |
| `INSPECTION` | `ESCALATE` -> `ESCALATED`; `RESOLVE` -> `RESOLVED` |
| `ESCALATED` | `INSPECTION` -> `INSPECTION`; `RESOLVE` -> `RESOLVED` |
| `RESOLVED` | `CLOSE` -> `CLOSED` |
| `ACKNOWLEDGED`, `INVESTIGATING`, `INSPECTION`, `ESCALATED`, `RESOLVED` | `EVIDENCE` appends evidence and leaves state unchanged |

No transition out of `CLOSED` is proposed. A repeated delivery of the same `alertId` is idempotent: return the existing incident and its current state; never create a duplicate. Reusing an `alertId` with conflicting immutable data (including a different `incidentId`) should return `ID_MISMATCH`, not overwrite the incident. Replayed lifecycle `messageId` values should likewise not apply an event twice; retention and replay-window policy are open.

**ID ownership proposal:** National/District generates and owns `alertId` and `incidentId` before sending `ALERT`; the Industrial Portal adopts both unchanged and uses `incidentId` as the shared key. Both remain immutable. This is a proposal for teammate review; the identifier formats and final ownership agreement are open.

### Error and response codes (proposal)

The HTTP status column is a suggested mapping only; the transport and exact response-code policy remain open.

| HTTP status (suggested) | `code` | Meaning / retry guidance |
|---:|---|---|
| 400 | `INVALID_PAYLOAD` | Malformed or missing fields; do not retry unchanged |
| 400 | `UNSUPPORTED_SCHEMA_VERSION` | Version is not supported; do not retry unchanged |
| 400 | `INVALID_TRANSITION` | Event is not allowed from current state; reconcile state before retry |
| 401 | `UNAUTHENTICATED` | Credentials missing/invalid; retry after authentication is corrected |
| 403 | `FORBIDDEN` | Sender is not authorized; do not retry unchanged |
| 404 | `UNKNOWN_ALERT` / `UNKNOWN_INCIDENT` | Referenced record is not known |
| 409 | `ID_MISMATCH` | Existing alert ID conflicts with the supplied incident identity or immutable data |
| 429 | `RATE_LIMITED` | Retry policy and backoff remain to be agreed |
| 500 | `INTERNAL_ERROR` | Retryability depends on delivery policy; response should identify a correlation ID |

Proposed error body: `{ "schemaVersion": "0.1", "code": "INVALID_PAYLOAD", "message": "...", "retryable": false, "correlationId": "..." }`. Never treat a transport timeout as proof that an operation failed; retry under the agreed policy with the same IDs/message ID so idempotency can be applied.

## Fixture mapping table

This table maps contract fields to the current fixtures and `backend/src/routes/incidents.ts`. “No equivalent yet” means the field does not currently exist in that source. Runtime naming/state is not silently changed by this proposal.

| Contract field | Current fixture / route equivalent | Notes |
|---|---|---|
| `schemaVersion` | No equivalent yet | Contract-only version marker. |
| `alertId` | `alerts.json`: `id`; `incident-workflow.json`: `alertId` | Both currently use `ALT-2026-0891`. |
| `incidentId` | `incident-workflow.json`: `id`; route lookup accepts `id` or `alertId` | Current fixture value is also `ALT-2026-0891`; separate ownership/identity is not represented. |
| `facilityId` | `facility.json`: `facilityName` | No facility identifier; do not treat this name as an ID without agreement. |
| `assetId` | `alerts.json`: `assetId` (`ast-02`); `assets.json`: `id` (`ast-02`); workflow fixture: `assetId` (`TF-04`) | The workflow asset code conflicts with the asset fixture identifier. |
| `thermalSeverity` | `alerts.json`: `severity` (`HIGH`); workflow fixture: `severity` (`HIGH`) | Equivalent severity value; contract property name is normalized. |
| `detectedAt` | `incident-workflow.json`: `detection.detectedAt` (`14:32:08 UTC`) and `createdAt` (`2026-09-29T14:32:08Z`); `alerts.json`: `detectedAt` (`14:32`) | Only ISO `createdAt` currently directly matches required format. |
| `location.lat`, `location.lon` | `alerts.json`: `locationCoordinates`; `assets.json`: `latitude`, `longitude`; `facility.json`: `coordinates.center`; thermal events: observation `latitude`, `longitude` | Facility/asset values are around `18.62`; thermal observations are around `22.31`. Authoritative location is unresolved. |
| `source` | `incident-workflow.json`: audit trail `actor` (`GOV_MONITORING_NETWORK`); `alerts.json`: `type` | Audit actor is the closest origin/source label; alert `type` instead describes the detection class. |
| `currentStatus` | `alerts.json`: `status` (`UNRESOLVED`); workflow fixture: `state` (`ALERTED`) | Proposed inbound initial value is `ALERTED`; existing alert status uses another vocabulary. |
| `messageId` | No equivalent yet | New per-status-message idempotency key. |
| `status` | Workflow `state`; route sets `ACKNOWLEDGED`, `INVESTIGATING`, `INSPECTION`, `ESCALATED`, `RESOLVED`, `CLOSED` | Contract action `ACKNOWLEDGE` maps to state `ACKNOWLEDGED`; `EVIDENCE` is an audit/evidence event and does not change state. |
| `occurredAt` | Route-generated `isoNow`; workflow timestamps such as `acknowledgedAt`, `investigationStartedAt`, `inspectionStartedAt`, `escalatedAt`, `resolvedAt`, `closedAt` | Route stores UTC ISO values in these fields; audit also stores `isoTimestamp`. |
| `actor` | Route request body `actor`; audit trail `actor` | Route uses defaults such as `FACILITY_OPERATOR` and `SAFETY_SUPERVISOR`. |
| `note` | Route `/action`: `note`; audit trail `description` | Closest equivalent; no dedicated note field in workflow. |
| `inspectionId` | No equivalent yet | Route stores `inspectionStartedAt`, not an inspection record ID. |
| `evidence[]` | Workflow `evidenceList`; route `/evidence` accepts `type`, `description`, `source` and creates `id`, `timestamp`, `isoTimestamp` | Contract renames `type` to `evidenceType`; URI is not currently represented. |
| `target`, `reason` | Route `/escalate`: `escalationDetails.target`, `.reason` | `target` and reason exist in the in-memory record; target is currently demo-configured. |
| `escalationId` | No equivalent yet | Current route creates no separate escalation identifier. |
| `observedFinding`, `rootCause`, `correctiveAction`, `resolution` | Route `/resolve` request body and `resolutionDetails` | These fields are already represented by the demo workflow. |
| `closureNote` | Route `/close` request body and `closureDetails.closureNote` | Already represented by the demo workflow. |
| `receivedAt`, `respondedAt`, `resolvedAt` | Workflow UTC timestamps / route-generated ISO timestamps | Response envelopes are proposed; there are no integration response records today. |
| `disposition`, `accepted`, `code`, `retryable`, `correlationId` | No equivalent yet | Contract response metadata only. |

## Location note

Fixture coordinates are currently inconsistent: facility/assets and the alert location are approximately `18.62`, while thermal-event observations are approximately `22.31`. The contract's `location` value is blocked on deciding which source/location is authoritative and correcting or explicitly reconciling the fixtures. Example coordinates are illustrative only, not a claim that this decision has been made.

## Open questions for teammates

- Should delivery use REST, webhook, polling, or another transport?
- What authentication, authorization, and credential rotation model should be used?
- What formats and namespaces should `alertId`, `incidentId`, `facilityId`, `assetId`, `messageId`, and optional `escalationId` use?
- Is the proposed National/District ownership of `incidentId` acceptable, or should another system assign it?
- Which system owns the authoritative shared incident state, and how are concurrent updates reconciled?
- What retry policy, backoff, retention window, and duplicate/replay policy should apply?
- Which facility coordinates and source should populate `location`?
- What evidence URI rules, access controls, and retention requirements apply?
- Which HTTP status mappings and response/error codes are acceptable for the selected transport?

**Nothing is integrated:** this is a draft contract only. The Industrial Portal does not currently receive National/District alerts or publish lifecycle updates to a shared system.
