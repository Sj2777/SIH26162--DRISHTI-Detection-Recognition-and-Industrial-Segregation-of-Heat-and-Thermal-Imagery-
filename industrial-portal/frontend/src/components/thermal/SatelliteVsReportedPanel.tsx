import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SatelliteReportedIndicator,
  SatelliteVsReportedData,
  SatelliteVsReportedItem
} from '../../types';
import { fetchSatelliteVsReported } from '../../services/api';
import { getUserFacingErrorMessage } from '../../utils/errorMessage';

const indicatorLabels: Record<SatelliteReportedIndicator, string> = {
  CONSISTENT: 'Activity appears in both records',
  SATELLITE_ACTIVITY_NOT_REPORTED: 'Satellite activity not reported',
  REPORTED_ACTIVITY_NOT_OBSERVED: 'Reported activity not observed',
  INSUFFICIENT_DATA: 'Insufficient data'
};

const indicatorClasses: Record<SatelliteReportedIndicator, string> = {
  CONSISTENT: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  SATELLITE_ACTIVITY_NOT_REPORTED: 'bg-amber-950 text-amber-300 border-amber-800',
  REPORTED_ACTIVITY_NOT_OBSERVED: 'bg-sky-950 text-sky-300 border-sky-800',
  INSUFFICIENT_DATA: 'bg-slate-800 text-slate-300 border-slate-700'
};

const AssetComparison: React.FC<{ item: SatelliteVsReportedItem }> = ({ item }) => (
  <article className="bg-[#0e131a] border border-[#233140] rounded p-4 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{item.assetName}</h3>
        <p className="text-[10px] font-mono text-[#7e90a5] mt-1">{item.assetId}</p>
      </div>
      <span
        className={`inline-flex rounded border px-2 py-1 text-[10px] font-semibold tracking-wide ${indicatorClasses[item.indicator]}`}
      >
        {indicatorLabels[item.indicator]}
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <section className="rounded border border-[#233140] bg-[#121820] p-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
          Satellite observed
        </h4>
        {item.satelliteObserved.count > 0 ? (
          <dl className="mt-2 space-y-1 text-xs text-slate-300">
            <div className="flex justify-between gap-3">
              <dt>Matched observations</dt>
              <dd className="font-mono">{item.satelliteObserved.count}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Peak intensity</dt>
              <dd className="font-mono">
                {item.satelliteObserved.peakIntensity?.toFixed(2)}× baseline
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Latest detection</dt>
              <dd className="font-mono">{item.satelliteObserved.latestDetectionTime}</dd>
            </div>
            {item.matchingDistanceMeters !== null && (
              <div className="flex justify-between gap-3">
                <dt>Nearest match</dt>
                <dd className="font-mono">{item.matchingDistanceMeters} m</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="mt-2 text-xs text-[#94a3b8]">No matched satellite observation.</p>
        )}
      </section>

      <section className="rounded border border-[#233140] bg-[#121820] p-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
          Facility reported
        </h4>
        <p className="mt-2 text-xs text-slate-200">{item.facilityReported.status}</p>
        <p className="mt-1 text-[10px] text-[#7e90a5]">
          Source: {item.facilityReported.source ?? 'None on record'}
          {item.facilityReported.recordedAt
            ? ` · ${item.facilityReported.recordedAt}`
            : ''}
        </p>
        {item.facilityReported.telemetryContext && (
          <p className="mt-2 text-[10px] text-[#94a3b8]">
            Telemetry context (not an activity report): {item.facilityReported.telemetryContext}
          </p>
        )}
      </section>
    </div>

    <p className="text-xs leading-relaxed text-[#94a3b8]">{item.explanation}</p>
  </article>
);

export const SatelliteVsReportedPanel: React.FC = () => {
  const [data, setData] = useState<SatelliteVsReportedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadComparison = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSatelliteVsReported();
      if (currentRequestId === requestId.current) setData(result);
    } catch (err) {
      console.error('Error fetching satellite vs reported comparison:', err);
      if (currentRequestId === requestId.current) {
        setError(
          getUserFacingErrorMessage(
            err,
            'Satellite comparison data could not be loaded. Try again.'
          )
        );
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadComparison();
    return () => {
      requestId.current += 1;
    };
  }, [loadComparison]);

  return (
    <section className="bg-[#121820] border border-[#233140] rounded overflow-hidden">
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3">
        <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
          Satellite vs Reported Activity
        </h2>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Screening indicator for review prioritization. Demo data.
        </p>
        {data && (
          <p className="mt-1 text-[10px] font-mono text-[#7e90a5]">
            Asset match radius: {data.matchingRadiusMeters} m · Unmatched observations:{' '}
            {data.unmatchedObservationCount}
          </p>
        )}
      </div>

      {loading && (
        <div className="px-4 py-8 text-center text-xs font-mono text-[#7e90a5]">
          Loading comparison data...
        </div>
      )}

      {!loading && error && (
        <div className="m-4 rounded border border-[#7f1d1d] bg-[#450a0a]/50 p-4 text-xs text-red-200">
          <p>Could not load the screening comparison: {error}</p>
          <button
            type="button"
            onClick={() => void loadComparison()}
            className="mt-3 rounded border border-red-800 px-3 py-1 text-[11px] font-semibold hover:bg-red-950"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {data.items.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-[#94a3b8]">
              No asset comparison records are available.
            </p>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-4">
              {data.items.map((item) => (
                <AssetComparison key={item.assetId} item={item} />
              ))}
            </div>
          )}

          <details className="border-t border-[#233140] px-4 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-300">
              Limitations
            </summary>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[11px] leading-relaxed text-[#94a3b8]">
              {data.limitations.map((limitation) => (
                <li key={limitation}>{limitation}</li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
};
