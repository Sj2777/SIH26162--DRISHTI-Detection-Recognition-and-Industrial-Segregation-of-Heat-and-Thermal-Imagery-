import React from 'react';
import { TelemetryAsset } from '../../types';

interface TelemetrySummaryCardsProps {
  assets: TelemetryAsset[];
}

export const TelemetrySummaryCards: React.FC<TelemetrySummaryCardsProps> = ({ assets }) => {
  const totalAssets = assets.length;
  const normalCount = assets.filter((a) => a.status === 'NORMAL').length;
  const warningCount = assets.filter((a) => a.status === 'WARNING').length;
  const criticalCount = assets.filter((a) => a.status === 'CRITICAL').length;
  const activeAlarms = assets.filter((a) => a.scadaAlarm && a.scadaAlarm !== 'NONE').length;
  const inspectionDue = assets.filter((a) => a.maintenanceState === 'INSPECTION_DUE').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Assets Monitored */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Assets Monitored
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-100">
            {totalAssets}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] border border-[#0284c7]/40">
            DCS NODES
          </span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Telemetry stream active</span>
      </div>

      {/* 2. Normal */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Nominal Operating
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#10b981]">
            {normalCount}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Within baseline limits</span>
      </div>

      {/* 3. Warning */}
      <div className="bg-[#191410] border border-[#451a03] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#fcd34d] uppercase">
          Warning State
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#f59e0b]">
            {warningCount}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#451a03] text-[#fcd34d] border border-[#b45309]">
            ATTENTION
          </span>
        </div>
        <span className="text-[10px] text-[#b45309] mt-1">Parameter deviations</span>
      </div>

      {/* 4. Critical */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Critical Faults
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-300">
            {criticalCount}
          </span>
          <span className="text-[10px] font-mono text-[#10b981]">CLEAR</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">No emergency trips</span>
      </div>

      {/* 5. Active SCADA Alarms */}
      <div className="bg-[#1c1214] border border-[#4c1d25] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#fca5a5] uppercase">
          SCADA Alarms
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#ef4444]">
            {activeAlarms}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse"></span>
        </div>
        <span className="text-[10px] text-[#dc2626] mt-1">High temp & vibration</span>
      </div>

      {/* 6. Inspection Due */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Inspection Due
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#f59e0b]">
            {inspectionDue}
          </span>
          <span className="text-[10px] font-mono text-[#fbbf24]">QUEUED</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Physical verification</span>
      </div>
    </div>
  );
};
