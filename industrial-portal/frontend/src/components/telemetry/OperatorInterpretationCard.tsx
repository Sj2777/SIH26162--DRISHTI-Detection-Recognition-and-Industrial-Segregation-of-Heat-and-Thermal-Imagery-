import React from 'react';
import { TelemetryAsset } from '../../types';

interface OperatorInterpretationCardProps {
  asset: TelemetryAsset;
}

export const OperatorInterpretationCard: React.FC<OperatorInterpretationCardProps> = ({ asset }) => {
  const isTankFarm = asset.assetId === 'TF-04';

  return (
    <div className="bg-[#181216] border border-[#5c1d27] rounded overflow-hidden flex flex-col justify-between p-4 relative">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#3d1a22]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
            <span className="text-xs font-bold tracking-wider text-[#f87171] uppercase font-mono">
              TELEMETRY OBSERVATION
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#450a0a] text-[#fca5a5] border border-[#dc2626]">
            OPERATOR EVALUATION
          </span>
        </div>

        {isTankFarm ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-200 leading-relaxed">
              Current telemetry shows <span className="text-[#ef4444] font-semibold">elevated temperature</span> and{' '}
              <span className="text-[#ef4444] font-semibold">gas concentration</span> while pressure and vibration remain within their configured operating ranges. No smoke/flame signal is currently detected.
            </p>

            <div className="p-3 bg-[#241014] border border-[#991b1b]/60 rounded text-xs text-red-200 font-medium leading-relaxed">
              Combined with the thermal anomaly detected at 14:32 UTC, operator inspection is recommended.
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#cbd5e1]">
              <div className="bg-[#130d10] border border-[#38161b] p-2 rounded">
                <span className="text-[#7e90a5] block text-[10px]">CORRELATION:</span>
                <span>Thermal + Gas Coincidence</span>
              </div>
              <div className="bg-[#130d10] border border-[#38161b] p-2 rounded">
                <span className="text-[#7e90a5] block text-[10px]">DISPOSITION:</span>
                <span className="text-[#fca5a5] font-semibold">Field Verification Queued</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-200 leading-relaxed">
              {asset.interpretation ||
                'Telemetry channels for this equipment node reflect operating parameters within standard engineering boundaries.'}
            </p>
            <div className="p-3 bg-[#121a24] border border-[#233140] rounded text-xs text-[#94a3b8] font-mono">
              Status: {asset.status} • SCADA Alarm: {asset.scadaAlarm} • Maintenance: {asset.maintenanceState}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-[#3d1a22] flex items-center justify-between text-[10px] font-mono text-[#7e90a5]">
        <span>OBSERVATIONAL TELEMETRY LOG</span>
        <span>ENGINEERING DISPATCH</span>
      </div>
    </div>
  );
};
