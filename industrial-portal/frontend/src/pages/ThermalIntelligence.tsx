import React, { useEffect, useState } from 'react';
import { ThermalData } from '../types';
import { fetchThermalEvents } from '../services/api';
import { ThermalSummaryCards } from '../components/thermal/ThermalSummaryCards';
import { ThermalProfile24hChart } from '../components/thermal/ThermalProfile24hChart';
import { ThermalTrend7dChart } from '../components/thermal/ThermalTrend7dChart';
import { ThermalBaseline30dChart } from '../components/thermal/ThermalBaseline30dChart';
import { DayNightComparisonCard } from '../components/thermal/DayNightComparisonCard';
import { ThermalInterpretationCard } from '../components/thermal/ThermalInterpretationCard';
import { ThermalObservationsTable } from '../components/thermal/ThermalObservationsTable';

export const ThermalIntelligence: React.FC = () => {
  const [data, setData] = useState<ThermalData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadThermalData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchThermalEvents();
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching thermal events:', err);
          setError(
            err instanceof Error ? err.message : 'Failed to retrieve thermal intelligence telemetry'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadThermalData();

    return () => {
      isMounted = false;
    };
  }, []);

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

      {/* Error Banner */}
      {error && (
        <div className="bg-[#450a0a]/80 border border-[#dc2626] rounded p-4 text-xs font-mono text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-400">TELEMETRY ERROR:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-[11px] font-semibold tracking-wider uppercase transition-colors"
          >
            Retry Connection
          </button>
        </div>
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
          <ThermalProfile24hChart data={data.profile24h} />

          {/* 3. Mid-Section: 7-Day Trend & 30-Day Fingerprint Baseline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ThermalTrend7dChart data={data.trend7d} />
            <ThermalBaseline30dChart data={data.baseline30d} />
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
