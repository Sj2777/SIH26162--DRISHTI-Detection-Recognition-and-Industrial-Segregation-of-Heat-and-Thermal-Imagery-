import React from 'react';
import { AssetHealthItem } from '../../types';

interface AssetHealthDetailProps {
  asset: AssetHealthItem;
}

export const AssetHealthDetail: React.FC<AssetHealthDetailProps> = ({ asset }) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden">
      {/* Header */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-100 uppercase font-mono">
              ASSET HEALTH ASSESSMENT
            </span>
            <span className="text-[#3b4c60] text-xs">/</span>
            <span className="text-xs font-bold text-[#f59e0b] uppercase">
              {asset.assetName}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#7e90a5] mt-0.5">
            Asset ID: {asset.assetId} • Type: {asset.assetType}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0b0f15] border border-[#233140] px-2.5 py-1 rounded text-xs font-mono">
            <span className="text-[#64748b]">HEALTH STATUS:</span>
            <span
              className={`font-bold ${
                asset.healthStatus === 'ATTENTION'
                  ? 'text-[#f59e0b]'
                  : asset.healthStatus === 'CRITICAL'
                  ? 'text-[#ef4444]'
                  : 'text-[#10b981]'
              }`}
            >
              {asset.healthStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Score Overview Grid */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-[#1e2a38] bg-[#0e131a]">
        <div className="bg-[#151c26] border border-[#243242] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#7e90a5]">Operating Health Score</div>
            <div
              className={`text-2xl font-bold font-mono mt-0.5 ${
                asset.healthScore < 70 ? 'text-[#f59e0b]' : 'text-[#10b981]'
              }`}
            >
              {asset.healthScore} <span className="text-xs text-[#64748b]">/ 100</span>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-[#64748b]">
            <div>Standard: 100</div>
            <div>Degraded: &lt;75</div>
          </div>
        </div>

        <div className="bg-[#151c26] border border-[#243242] p-3 rounded flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#fca5a5]">Demo Anomaly Index</div>
            <div
              className={`text-2xl font-bold font-mono mt-0.5 ${
                asset.anomalyScore >= 70 ? 'text-[#ef4444]' : 'text-[#38bdf8]'
              }`}
            >
              {asset.anomalyScore} <span className="text-xs text-[#64748b]">/ 100</span>
            </div>
          </div>
          <div className="text-right text-[10px] font-mono text-[#64748b]">
            <div>Threshold: 50</div>
            <div>High Risk: &gt;70</div>
          </div>
        </div>
      </div>

      {/* Why This Asset is Flagged - Evidence Rows */}
      <div className="p-4">
        <div className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono mb-3 flex items-center justify-between">
          <span>WHY THIS ASSET IS FLAGGED</span>
          <span className="text-[10px] text-[#7e90a5] font-normal">PARAMETER DISPOSITION</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {asset.evidenceRows.map((row, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded border flex items-center justify-between transition-colors ${
                row.isAnomaly
                  ? 'bg-[#291316]/60 border-[#7f1d1d]'
                  : 'bg-[#151c26] border-[#223142]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    row.isAnomaly ? 'bg-[#ef4444] animate-pulse' : 'bg-[#10b981]'
                  }`}
                />
                <span className="font-semibold text-slate-300 w-28">{row.parameter}</span>
                <span className="text-slate-100 font-bold">{row.value}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  row.isAnomaly
                    ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                    : 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
                }`}
              >
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
