import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TelemetryData } from '../types';
import { fetchTelemetry } from '../services/api';
import { TelemetrySummaryCards } from '../components/telemetry/TelemetrySummaryCards';
import { AssetTelemetryTable } from '../components/telemetry/AssetTelemetryTable';
import { SelectedAssetMetrics } from '../components/telemetry/SelectedAssetMetrics';
import { TelemetryTrendChart } from '../components/telemetry/TelemetryTrendChart';
import { EquipmentStatePanel } from '../components/telemetry/EquipmentStatePanel';
import { OperatorInterpretationCard } from '../components/telemetry/OperatorInterpretationCard';
import { RetryableError } from '../components/layout/RetryableError';
import { getUserFacingErrorMessage } from '../utils/errorMessage';

export const LiveTelemetry: React.FC = () => {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('TF-04');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadTelemetryData = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchTelemetry();
      if (currentRequestId === requestId.current) {
        setData(res);
        if (res.assets.some((a) => a.assetId === 'TF-04')) {
          setSelectedAssetId('TF-04');
        } else if (res.assets.length > 0) {
          setSelectedAssetId(res.assets[0].assetId);
        }
      }
    } catch (err) {
      if (currentRequestId === requestId.current) {
        console.error('Error fetching live telemetry data:', err);
        setError(
          getUserFacingErrorMessage(err, 'Telemetry data could not be loaded. Try again.')
        );
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTelemetryData();
    return () => {
      requestId.current += 1;
    };
  }, [loadTelemetryData]);

  const selectedAsset = data?.assets.find((a) => a.assetId === selectedAssetId) || data?.assets[0];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121820] border border-[#233140] px-4 py-3 rounded">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
              EQUIPMENT TELEMETRY SNAPSHOT
            </h2>
          </div>
          <p className="text-xs text-[#7e90a5] mt-0.5">
            Simulated facility telemetry and equipment operating state.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] border border-[#0284c7]/40 font-bold">
            SIMULATED TELEMETRY
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0b0f15] text-[#94a3b8] border border-[#233140]">
            FIXTURE SNAPSHOT
          </span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <RetryableError
          title="Telemetry data unavailable"
          message={error}
          retrying={loading}
          onRetry={() => void loadTelemetryData()}
        />
      )}

      {/* Loading State */}
      {loading && !data && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[#0284c7] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono text-[#7e90a5]">
            Polling Field Sensor Bus & DCS Subsystems...
          </p>
        </div>
      )}

      {/* Main Content */}
      {(!loading || data) && data && data.assets.length === 0 && !error && (
        <p className="rounded border border-[#233140] bg-[#121820] p-6 text-center text-xs text-[#94a3b8]">
          No equipment telemetry is available.
        </p>
      )}

      {(!loading || data) && data && data.assets.length > 0 && (
        <>
          {/* 2. Facility Telemetry Summary (6 KPI cards) */}
          <TelemetrySummaryCards assets={data.assets} />

          {/* 3. Asset Telemetry Matrix Table */}
          <AssetTelemetryTable
            assets={data.assets}
            selectedAssetId={selectedAssetId}
            onSelectAsset={(id) => setSelectedAssetId(id)}
          />

          {/* 4. Selected Asset Telemetry & Diagnostics */}
          {selectedAsset && (
            <>
              {/* Selected Asset 8 Metrics Grid */}
              <SelectedAssetMetrics asset={selectedAsset} />

              {/* 5. Telemetry Trend Time-Series Chart */}
              <TelemetryTrendChart asset={selectedAsset} />

              {/* 6 & 7: Equipment State Console & Operator Interpretation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                <EquipmentStatePanel asset={selectedAsset} />
                <OperatorInterpretationCard asset={selectedAsset} />
              </div>
            </>
          )}

          {/* 8. Demo Data Disclaimer */}
          <div className="bg-[#10141b] border border-[#1e2a38] rounded p-3 text-center text-xs font-mono text-[#64748b]">
            <span className="text-amber-400 font-bold uppercase tracking-wider mr-2">
              DEMO DATA NOTICE:
            </span>
            <span>
              Telemetry shown on this page is simulated demonstration data and does not represent live SCADA/DCS measurements.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
