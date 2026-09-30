import React from 'react';
import { TelemetryAsset } from '../../types';

interface EquipmentStatePanelProps {
  asset: TelemetryAsset;
}

export const EquipmentStatePanel: React.FC<EquipmentStatePanelProps> = ({ asset }) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1e2a38]">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            Equipment Operating State Console
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            DCS RELAY LOGIC
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {/* Valve State */}
          <div className="bg-[#16202c] border border-[#243242] p-2.5 rounded flex items-center justify-between">
            <span className="text-[#94a3b8]">VALVE STATE:</span>
            <span className="font-bold text-slate-100 px-2 py-0.5 rounded bg-[#10151d] border border-[#2c3d52]">
              {asset.valveState}
            </span>
          </div>

          {/* Equipment Mode */}
          <div className="bg-[#16202c] border border-[#243242] p-2.5 rounded flex items-center justify-between">
            <span className="text-[#94a3b8]">EQUIPMENT MODE:</span>
            <span className="font-bold text-slate-100 px-2 py-0.5 rounded bg-[#10151d] border border-[#2c3d52]">
              {asset.equipmentMode}
            </span>
          </div>

          {/* Smoke / Flame */}
          <div className="bg-[#16202c] border border-[#243242] p-2.5 rounded flex items-center justify-between">
            <span className="text-[#94a3b8]">SMOKE / FLAME:</span>
            <span className="font-bold text-[#10b981] px-2 py-0.5 rounded bg-[#064e3b]/40 border border-[#059669]/60">
              {asset.smokeFlame.replace(/_/g, ' ')}
            </span>
          </div>

          {/* SCADA / DCS */}
          <div className="bg-[#16202c] border border-[#243242] p-2.5 rounded flex items-center justify-between">
            <span className="text-[#94a3b8]">SCADA / DCS:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded border ${
                asset.scadaAlarm !== 'NONE'
                  ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                  : 'bg-[#10151d] text-[#10b981] border-[#2c3d52]'
              }`}
            >
              {asset.scadaAlarm.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Maintenance */}
          <div className="bg-[#16202c] border border-[#243242] p-2.5 rounded flex items-center justify-between">
            <span className="text-[#94a3b8]">MAINTENANCE:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded border ${
                asset.maintenanceState === 'INSPECTION_DUE'
                  ? 'bg-[#451a03] text-[#fcd34d] border-[#b45309]'
                  : 'bg-[#10151d] text-[#10b981] border-[#2c3d52]'
              }`}
            >
              {asset.maintenanceState.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#1e2a38] text-[10px] font-mono text-[#64748b]">
        INTERLOCK STATUS: LATCHED • FIELD BUS: OPTICAL NOMINAL
      </div>
    </div>
  );
};
