import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getIncidentStore } from './incidents';

const router = Router();
const thermalFilePath = path.join(__dirname, '../../data/thermal-events.json');
const assetsFilePath = path.join(__dirname, '../../data/assets.json');
const telemetryFilePath = path.join(__dirname, '../../data/telemetry.json');

export const ASSET_MATCH_RADIUS_METERS = 150;

const LIMITATIONS = [
  'Satellite revisit intervals may miss short-lived or between-pass activity.',
  'Satellite pixel resolution cannot identify individual equipment or confirm source attribution.',
  'Cloud cover and atmospheric conditions may affect detectability.',
  'Satellite and facility timestamps may not align; observation times are incomplete or rounded.',
  'Demo fixture and in-memory incident data are illustrative and are not operational evidence.'
];

const REPORTED_ACTIVITY_ACTIONS = new Set([
  'CONFIRM_ROUTINE',
  'PLANNED_MAINTENANCE',
  'REPORT_SUSPECTED_LEAK',
  'REPORT_SUSPECTED_FIRE'
]);
const REPORT_ACTIONS = new Set([...REPORTED_ACTIVITY_ACTIONS, 'DISPUTE_ALERT']);

interface ThermalObservation {
  time: string;
  intensity: string;
  latitude: number;
  longitude: number;
  source: string;
}

interface ThermalFixture {
  recentObservations: ThermalObservation[];
}

interface Asset {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface TelemetryAsset {
  assetId: string;
  assetName: string;
  status: string;
  equipmentMode: string;
  maintenanceState: string;
}

interface TelemetryFixture {
  timestamp: string;
  assets: TelemetryAsset[];
}

interface ActivityReport {
  action: string;
  source: string;
  recordedAt: string | null;
}

const readJson = <T,>(filePath: string): T =>
  JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;

const normalizeName = (value: string | undefined): string =>
  (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const haversineDistanceMeters = (
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): number => {
  const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
  const latitudeDifference = toRadians(latitude2 - latitude1);
  const longitudeDifference = toRadians(longitude2 - longitude1);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
      Math.cos(toRadians(latitude2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 2 * 6371000 * Math.asin(Math.sqrt(haversine));
};

const parseIntensity = (intensity: string): number => {
  const value = Number.parseFloat(intensity);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid thermal intensity value: ${intensity}`);
  }
  return value;
};

const getLatestReport = (
  asset: Asset,
  telemetryAsset: TelemetryAsset | undefined
): ActivityReport | null => {
  const matches = getIncidentStore().filter((incident) => {
    const sameId = telemetryAsset && incident.assetId === telemetryAsset.assetId;
    const sameName =
      normalizeName(incident.assetName) === normalizeName(asset.name);
    return sameId || sameName;
  });
  const reports: ActivityReport[] = [];

  for (const incident of matches) {
    const auditTrail = Array.isArray(incident.auditTrail) ? incident.auditTrail : [];
    for (const auditEvent of auditTrail) {
      const action = auditEvent.eventType ?? auditEvent.type;
      if (typeof action === 'string' && REPORT_ACTIONS.has(action)) {
        reports.push({
          action,
          source: `Incident ${incident.alertId ?? incident.id} action`,
          recordedAt: auditEvent.isoTimestamp ?? null
        });
      }
    }

    if (
      typeof incident.feedbackAction === 'string' &&
      REPORT_ACTIONS.has(incident.feedbackAction) &&
      !reports.some((report) => report.action === incident.feedbackAction)
    ) {
      reports.push({
        action: incident.feedbackAction,
        source: `Incident ${incident.alertId ?? incident.id} feedback`,
        recordedAt: incident.lastUpdated ?? null
      });
    }
  }

  reports.sort((first, second) => {
    const firstTime = first.recordedAt ? Date.parse(first.recordedAt) : 0;
    const secondTime = second.recordedAt ? Date.parse(second.recordedAt) : 0;
    return firstTime - secondTime;
  });
  return reports[reports.length - 1] ?? null;
};

const getIndicator = (
  satelliteCount: number,
  report: ActivityReport | null
): { indicator: string; explanation: string } => {
  const hasActivityReport = report && REPORTED_ACTIVITY_ACTIONS.has(report.action);

  if (satelliteCount > 0 && hasActivityReport) {
    return {
      indicator: 'CONSISTENT',
      explanation:
        'Satellite observations and a facility activity report are both present in this fixture window. This screening indicator does not establish a cause or verify either record.'
    };
  }

  if (satelliteCount > 0 && report?.action === 'DISPUTE_ALERT') {
    return {
      indicator: 'INSUFFICIENT_DATA',
      explanation:
        'Satellite observations and a facility alert-dispute action are present, but the available records do not provide comparable activity status.'
    };
  }

  if (satelliteCount > 0) {
    return {
      indicator: 'SATELLITE_ACTIVITY_NOT_REPORTED',
      explanation:
        'Satellite observations are matched to this asset, but no facility activity report is on record. This discrepancy indicator is for review prioritization only.'
    };
  }

  if (hasActivityReport) {
    return {
      indicator: 'REPORTED_ACTIVITY_NOT_OBSERVED',
      explanation:
        'A facility activity report is on record, but no satellite observation is matched to this asset in the fixture window. This does not establish whether activity occurred.'
    };
  }

  return {
    indicator: 'INSUFFICIENT_DATA',
    explanation:
      'The available location, report, or timing details are not sufficient for a reliable comparison.'
  };
};

router.get('/satellite-vs-reported', (_req: Request, res: Response) => {
  try {
    const thermalData = readJson<ThermalFixture>(thermalFilePath);
    const assets = readJson<Asset[]>(assetsFilePath);
    const telemetryData = readJson<TelemetryFixture>(telemetryFilePath);
    let unmatchedObservationCount = 0;

    const items = assets.map((asset) => {
      const matchedObservations = thermalData.recentObservations
        .map((observation) => ({
          observation,
          distanceMeters: haversineDistanceMeters(
            observation.latitude,
            observation.longitude,
            asset.latitude,
            asset.longitude
          )
        }))
        .filter(({ distanceMeters }) => distanceMeters <= ASSET_MATCH_RADIUS_METERS);
      const telemetryAsset = telemetryData.assets.find(
        (candidate) =>
          normalizeName(candidate.assetName) === normalizeName(asset.name)
      );
      const report = getLatestReport(asset, telemetryAsset);
      const status = getIndicator(matchedObservations.length, report);
      const intensityValues = matchedObservations.map(({ observation }) =>
        parseIntensity(observation.intensity)
      );
      const latestDetectionTime =
        matchedObservations
          .map(({ observation }) => observation.time)
          .sort((first, second) => second.localeCompare(first))[0] ?? null;
      const nearestDistance =
        matchedObservations.length > 0
          ? Math.min(...matchedObservations.map(({ distanceMeters }) => distanceMeters))
          : null;
      const telemetryContext = telemetryAsset
        ? `${telemetryAsset.status}; mode ${telemetryAsset.equipmentMode}; maintenance ${telemetryAsset.maintenanceState} (telemetry ${telemetryData.timestamp})`
        : null;

      return {
        assetId: asset.id,
        assetName: asset.name,
        matchingDistanceMeters:
          nearestDistance === null ? null : Math.round(nearestDistance),
        satelliteObserved: {
          count: matchedObservations.length,
          peakIntensity:
            intensityValues.length > 0 ? Math.max(...intensityValues) : null,
          latestDetectionTime
        },
        facilityReported: {
          status: report?.action ?? 'No facility report on record',
          source: report?.source ?? null,
          recordedAt: report?.recordedAt ?? null,
          telemetryContext
        },
        indicator: status.indicator,
        explanation: status.explanation
      };
    });

    for (const observation of thermalData.recentObservations) {
      const isMatched = assets.some(
        (asset) =>
          haversineDistanceMeters(
            observation.latitude,
            observation.longitude,
            asset.latitude,
            asset.longitude
          ) <= ASSET_MATCH_RADIUS_METERS
      );
      if (!isMatched) unmatchedObservationCount += 1;
    }

    res.status(200).json({
      matchingRadiusMeters: ASSET_MATCH_RADIUS_METERS,
      unmatchedObservationCount,
      items,
      limitations: LIMITATIONS
    });
  } catch (error) {
    console.error('Error building satellite vs reported comparison:', error);
    res.status(500).json({
      error: 'Failed to build satellite vs reported comparison',
      limitations: LIMITATIONS
    });
  }
});

export default router;
