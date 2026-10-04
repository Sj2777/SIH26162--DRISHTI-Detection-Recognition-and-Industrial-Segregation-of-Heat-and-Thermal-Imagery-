import React from 'react';
import { TelemetryAsset } from '../../types';

interface AssetTelemetryTableProps {
  assets: TelemetryAsset[];
  selectedAssetId: string;
  onSelectAsset: (assetId: string) => void;
}

export const AssetTelemetryTable: React.FC<AssetTelemetryTableProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
}) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mb-6">
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Facility Equipment Telemetry Matrix
          </span>
          <span className="text-[10px] font-mono text-[#7e90a5] bg-[#0b0f15] px-2 py-0.5 rounded border border-[#233140]">
            SELECT ROW FOR DETAILED CHANNELS
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#64748b] hidden sm:block">
          ON-DEMAND FIXTURE DATA
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2a38] bg-[#0e131a] text-[#7e90a5] font-mono uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4">Asset</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Temperature</th>
              <th className="py-2.5 px-3 text-right">Pressure</th>
              <th className="py-2.5 px-3 text-right">Gas Conc.</th>
              <th className="py-2.5 px-3 text-right">Flow Rate</th>
              <th className="py-2.5 px-3 text-right">Vibration</th>
              <th className="py-2.5 px-3">Equip Mode</th>
              <th className="py-2.5 px-3">SCADA Alarm</th>
              <th className="py-2.5 px-4">Maintenance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a232f]">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 px-4 text-center text-xs text-[#94a3b8]">
                  No equipment telemetry is available.
                </td>
              </tr>
            ) : assets.map((asset) => {
              const isSelected = asset.assetId === selectedAssetId;
              const isWarning = asset.status === 'WARNING';
              const isCritical = asset.status === 'CRITICAL';

              return (
                <tr
                  key={asset.assetId}
                  onClick={() => onSelectAsset(asset.assetId)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#1e2d42] border-l-4 border-l-[#0284c7]'
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
                            : isWarning
                            ? 'bg-[#f59e0b]'
                            : 'bg-[#10b981]'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                          {asset.assetName}
                          {isSelected && (
                            <span className="text-[9px] font-mono px-1 py-0.2 bg-[#0284c7] text-white rounded">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[#64748b]">
                          {asset.assetId} • {asset.assetType}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isCritical
                          ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                          : isWarning
                          ? 'bg-[#451a03] text-[#fcd34d] border-[#b45309]'
                          : 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
                      }`}
                    >
                      {asset.status}
                    </span>
                  </td>

                  {/* Temperature */}
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        asset.temperature.status === 'HIGH'
                          ? 'text-[#ef4444] bg-[#450a0a]/60 px-1 py-0.5 rounded'
                          : 'text-slate-200'
                      }`}
                    >
                      {asset.temperature.value.toFixed(1)} {asset.temperature.unit}
                    </span>
                  </td>

                  {/* Pressure */}
                  <td className="py-3 px-3 text-right font-mono">
                    <span className="text-slate-200">
                      {asset.pressure.value.toFixed(1)} {asset.pressure.unit}
                    </span>
                  </td>

                  {/* Gas */}
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        asset.gas.status === 'HIGH'
                          ? 'text-[#ef4444] bg-[#450a0a]/60 px-1 py-0.5 rounded'
                          : 'text-slate-200'
                      }`}
                    >
                      {asset.gas.value.toFixed(1)} {asset.gas.unit}
                    </span>
                  </td>

                  {/* Flow */}
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {asset.flow.value.toFixed(0)} {asset.flow.unit}
                  </td>

                  {/* Vibration */}
                  <td className="py-3 px-3 text-right font-mono">
                    <span
                      className={`font-semibold ${
                        asset.vibration.status === 'HIGH'
                          ? 'text-[#f59e0b] bg-[#451a03]/60 px-1 py-0.5 rounded'
                          : 'text-slate-200'
                      }`}
                    >
                      {asset.vibration.value.toFixed(1)} {asset.vibration.unit}
                    </span>
                  </td>

                  {/* Equipment Mode */}
                  <td className="py-3 px-3 font-mono text-[11px] text-[#94a3b8]">
                    {asset.equipmentMode}
                  </td>

                  {/* SCADA Alarm */}
                  <td className="py-3 px-3">
                    {asset.scadaAlarm !== 'NONE' ? (
                      <span className="inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#450a0a] text-[#fca5a5] border border-[#dc2626]">
                        {asset.scadaAlarm.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-[#64748b]">NORMAL</span>
                    )}
                  </td>

                  {/* Maintenance */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {asset.maintenanceState === 'INSPECTION_DUE' ? (
                      <span className="text-[#f59e0b] font-semibold">INSPECTION DUE</span>
                    ) : (
                      <span className="text-[#10b981]">CURRENT</span>
                    )}
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
