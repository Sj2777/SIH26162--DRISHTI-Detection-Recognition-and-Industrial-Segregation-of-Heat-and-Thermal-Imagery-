import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ThermalData } from '../types';
import { fetchThermalEvents } from '../services/api';
import { ThermalSummaryCards } from '../components/thermal/ThermalSummaryCards';
import { ThermalProfile24hChart } from '../components/thermal/ThermalProfile24hChart';
import { ThermalTrend7dChart } from '../components/thermal/ThermalTrend7dChart';
import { ThermalBaseline30dChart } from '../components/thermal/ThermalBaseline30dChart';
import { DayNightComparisonCard } from '../components/thermal/DayNightComparisonCard';
import { ThermalInterpretationCard } from '../components/thermal/ThermalInterpretationCard';
import { ThermalObservationsTable } from '../components/thermal/ThermalObservationsTable';
import { SatelliteVsReportedPanel } from '../components/thermal/SatelliteVsReportedPanel';
import { RetryableError } from '../components/layout/RetryableError';
import { getUserFacingErrorMessage } from '../utils/errorMessage';

export const ThermalIntelligence: React.FC = () => {
  const [data, setData] = useState<ThermalData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadThermalData = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchThermalEvents();
      if (currentRequestId === requestId.current) setData(res);
    } catch (err) {
      if (currentRequestId === requestId.current) {
        console.error('Error fetching thermal events:', err);
        setError(
          getUserFacingErrorMessage(err, 'Thermal observations could not be loaded. Try again.')
        );
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThermalData();
    return () => {
      requestId.current += 1;
    };
  }, [loadThermalData]);

  return (
    <div className="space-y-6">
      {/* Subheader / Module Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121820] border border-[#233140] px-4 py-3 rounded">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">
              Thermal Intelligence & Baseline Anomaly Analysis
            </h2>
          </div>
          <p className="text-xs text-[#7e90a5] mt-0.5">
            Continuous radiometric comparison against facility-specific historical baseline.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] border border-[#0284c7]/40">
            SIMULATED THERMAL HISTORY
          </span>
          <span className="px-2 py-0.5 rounded bg-[#291e0a] text-amber-300 border border-[#78350f]">
            CALIBRATION: 90-DAY COMPOSITE
          </span>
        </div>
      </div>

      <SatelliteVsReportedPanel />

      {/* Error Banner */}
      {error && (
        <RetryableError
          title="Thermal data unavailable"
          message={error}
          retrying={loading}
          onRetry={() => void loadThermalData()}
        />
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono text-[#7e90a5]">
            Synthesizing Radiometric Baseline & Trend Envelopes...
          </p>
        </div>
      )}

      {/* Main Content */}
      {(!loading || data) && data && (
        <>
          {/* 1. Thermal Status Summary (6 KPI Cards) */}
          <ThermalSummaryCards summary={data.summary} />

          {/* 2. 24-Hour Diurnal Thermal Profile (ECharts) */}
          {data.profile24h.length > 0 ? (
            <ThermalProfile24hChart data={data.profile24h} />
          ) : (
            <p className="rounded border border-[#233140] bg-[#121820] p-5 text-center text-xs text-[#94a3b8]">
              No 24-hour thermal profile data is available.
            </p>
          )}

          {/* 3. Mid-Section: 7-Day Trend & 30-Day Fingerprint Baseline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {data.trend7d.length > 0 ? (
              <ThermalTrend7dChart data={data.trend7d} />
            ) : (
              <p className="rounded border border-[#233140] bg-[#121820] p-5 text-center text-xs text-[#94a3b8]">
                No seven-day thermal trend data is available.
              </p>
            )}
            {data.baseline30d.length > 0 ? (
              <ThermalBaseline30dChart data={data.baseline30d} />
            ) : (
              <p className="rounded border border-[#233140] bg-[#121820] p-5 text-center text-xs text-[#94a3b8]">
                No 30-day baseline data is available.
              </p>
            )}
          </div>

          {/* 4. Lower-Section: Day/Night Behaviour & Interpretation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
            <DayNightComparisonCard dayNight={data.summary.dayNight} />
            <ThermalInterpretationCard summary={data.summary} />
          </div>

          {/* 5. Thermal Observations Radiometric Log Table */}
          <ThermalObservationsTable observations={data.recentObservations} />
        </>
      )}
    </div>
  );
};
