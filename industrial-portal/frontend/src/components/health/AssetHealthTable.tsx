import React from 'react';
import { AssetHealthItem } from '../../types';

interface AssetHealthTableProps {
  assets: AssetHealthItem[];
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
}

export const AssetHealthTable: React.FC<AssetHealthTableProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
}) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mb-6">
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Facility Asset Health & Anomaly Assessment Index
          </span>
          <span className="text-[10px] font-mono text-[#7e90a5] bg-[#0b0f15] px-2 py-0.5 rounded border border-[#233140]">
            SELECT ASSET TO INSPECT EVIDENCE
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#64748b] hidden sm:block">
          EVALUATION MODE: CROSS-SIGNAL SYNTHESIS
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2a38] bg-[#0e131a] text-[#7e90a5] font-mono uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4">Asset</th>
              <th className="py-2.5 px-3">Health Status</th>
              <th className="py-2.5 px-3 text-right">Health Score</th>
              <th className="py-2.5 px-3 text-right">Demo Anomaly Index</th>
              <th className="py-2.5 px-4">Primary Signal</th>
              <th className="py-2.5 px-3">Maintenance</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a232f]">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-xs text-[#94a3b8]">
                  No asset health assessments are available.
                </td>
              </tr>
            ) : assets.map((asset) => {
              const isSelected = asset.assetId === selectedAssetId;
              const isAttention = asset.healthStatus === 'ATTENTION';
              const isCritical = asset.healthStatus === 'CRITICAL';

              return (
                <tr
                  key={asset.assetId}
                  onClick={() => onSelectAsset(asset.assetId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1e2d42] border-l-4 border-l-[#f59e0b]'
                      : 'hover:bg-[#16202c]/80'
                  }`}
                >
                  {/* Asset */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isCritical
                            ? 'bg-[#ef4444]'
                            : isAttention
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#10b981]'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          {asset.assetName}
                          {isSelected && (
                            <span className="text-[9px] font-mono px-1 py-0.2 bg-[#f59e0b] text-black font-bold rounded">
                              SELECTED
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[#64748b]">
                          {asset.assetId} • {asset.assetType}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Health */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                          : isAttention
                          ? 'bg-[#451a03] text-[#fcd34d] border-[#b45309]'
                          : 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
                      }`}
                    >
                      {asset.healthStatus}
                    </span>
                  </td>

                  {/* Health Score */}
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={`font-bold ${
                        asset.healthScore < 70
                          ? 'text-[#ef4444]'
                          : asset.healthScore < 85
                          ? 'text-[#f59e0b]'
                          : 'text-[#10b981]'
                      }`}
                    >
                      {asset.healthScore} / 100
                    </span>
                  </td>

                  {/* Anomaly Index */}
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={`font-bold ${
                        asset.anomalyScore >= 70
                          ? 'text-[#ef4444]'
                          : asset.anomalyScore >= 40
                          ? 'text-[#f59e0b]'
                          : 'text-[#64748b]'
                      }`}
                    >
                      {asset.anomalyScore}
                    </span>
                  </td>

                  {/* Primary Signal */}
                  <td className="py-3 px-4 font-mono font-semibold">
                    <span
                      className={
                        asset.primarySignal === 'THERMAL + GAS'
                          ? 'text-[#f97316]'
                          : asset.primarySignal === 'VIBRATION'
                          ? 'text-[#fbbf24]'
                          : 'text-[#94a3b8]'
                      }
                    >
                      {asset.primarySignal}
                    </span>
                  </td>

                  {/* Maintenance */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {asset.maintenanceState === 'INSPECTION_DUE' ? (
                      <span className="text-[#f59e0b] font-semibold">INSPECTION DUE</span>
                    ) : (
                      <span className="text-[#10b981]">CURRENT</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAsset(asset.assetId);
                      }}
                      className={`px-3 py-1 rounded text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors border ${
                        isSelected
                          ? 'bg-[#f59e0b] text-black border-[#f59e0b]'
                          : isAttention
                          ? 'bg-[#2b180d] hover:bg-[#451a03] text-[#fcd34d] border-[#b45309]'
                          : 'bg-[#151c26] hover:bg-[#1e293b] text-slate-300 border-[#2b3a4c]'
                      }`}
                    >
                      INSPECT
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
