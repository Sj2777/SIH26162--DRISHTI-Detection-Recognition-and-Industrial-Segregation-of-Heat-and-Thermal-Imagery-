import React, { useEffect, useState } from 'react';
import { AssetHealthData, HistoricalIncident } from '../types';
import { fetchAssetHealth, fetchHistoricalIncidents } from '../services/api';
import { AssetHealthSummaryCards } from '../components/health/AssetHealthSummaryCards';
import { AssetHealthTable } from '../components/health/AssetHealthTable';
import { AssetHealthDetail } from '../components/health/AssetHealthDetail';
import { AnomalyEvidencePanel } from '../components/health/AnomalyEvidencePanel';
import { HistoricalMatchPanel } from '../components/health/HistoricalMatchPanel';
import { InspectionRecommendation } from '../components/health/InspectionRecommendation';

export const AssetHealth: React.FC = () => {
  const [data, setData] = useState<AssetHealthData | null>(null);
  const [incidents, setIncidents] = useState<HistoricalIncident[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('TF-04');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadHealthData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [healthRes, incidentsRes] = await Promise.all([
          fetchAssetHealth(),
          fetchHistoricalIncidents(),
        ]);
        if (isMounted) {
          setData(healthRes);
          setIncidents(incidentsRes);
          if (healthRes.assets.some((a) => a.assetId === 'TF-04')) {
            setSelectedAssetId('TF-04');
          } else if (healthRes.assets.length > 0) {
            setSelectedAssetId(healthRes.assets[0].assetId);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching asset health data:', err);
          setError(
            err instanceof Error ? err.message : 'Failed to retrieve asset health evaluation'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadHealthData();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedAsset =
    data?.assets.find((a) => a.assetId === selectedAssetId) || data?.assets[0];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121820] border border-[#233140] px-4 py-3 rounded">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
              ASSET HEALTH & ANOMALY ANALYSIS
            </h2>
          </div>
          <p className="text-xs text-[#7e90a5] mt-0.5">
            Cross-signal assessment of facility equipment condition.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#291e0a] text-amber-300 border border-[#78350f] font-bold">
            SIMULATED ASSESSMENT
          </span>
          <span className="px-2 py-0.5 rounded bg-[#0b0f15] text-[#94a3b8] border border-[#233140]">
            6 ASSETS MONITORED
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#450a0a]/80 border border-[#dc2626] rounded p-4 text-xs font-mono text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-400">HEALTH ASSESSMENT ERROR:</span>
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
          <div className="inline-block w-8 h-8 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono text-[#7e90a5]">
            Evaluating Multi-Sensor Telemetry & Thermal Baseline Deviation Signatures...
          </p>
        </div>
      )}

      {/* Main Content */}
      {(!loading || data) && data && (
        <>
          {/* 2. Facility Health Summary KPI Cards */}
          <AssetHealthSummaryCards summary={data.summary} />

          {/* 3. Asset Health Matrix Table */}
          <AssetHealthTable
            assets={data.assets}
            selectedAssetId={selectedAssetId}
            onSelectAsset={(id) => setSelectedAssetId(id)}
          />

          {/* 4. Selected Asset Detail */}
          {selectedAsset && (
            <>
              <AssetHealthDetail asset={selectedAsset} />

              {/* 5 & 6: Anomaly Evidence Breakdown & Historical Case Matches */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                <AnomalyEvidencePanel asset={selectedAsset} />
                <HistoricalMatchPanel
                  incidents={incidents}
                  selectedAssetId={selectedAssetId}
                />
              </div>

              {/* 7. Observed Condition & Recommended Inspection Action */}
              <InspectionRecommendation asset={selectedAsset} />
            </>
          )}

          {/* 8. Demo Data Notice */}
          <div className="bg-[#10141b] border border-[#1e2a38] rounded p-3 text-center text-xs font-mono text-[#64748b]">
            <span className="text-amber-400 font-bold uppercase tracking-wider mr-2">
              DEMO ASSESSMENT NOTICE:
            </span>
            <span>
              Asset health scoring and anomaly indices shown are simulated demonstration assessments and do not claim unverified statistical time-to-failure predictions.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
