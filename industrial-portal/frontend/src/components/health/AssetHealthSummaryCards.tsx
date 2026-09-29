import React from 'react';
import { AssetHealthSummary } from '../../types';

interface AssetHealthSummaryCardsProps {
  summary: AssetHealthSummary;
}

export const AssetHealthSummaryCards: React.FC<AssetHealthSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Assets Monitored */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Assets Monitored
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-100">
            {summary.assetsMonitored}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e293b] text-[#38bdf8] border border-[#0284c7]/40">
            HEALTH INDEX
          </span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Full plant footprint</span>
      </div>

      {/* 2. Normal */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Normal Condition
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#10b981]">
            {summary.normal}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Health score &gt;90</span>
      </div>

      {/* 3. Attention */}
      <div className="bg-[#1a140f] border border-[#522504] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#fcd34d] uppercase">
          Requires Attention
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#f59e0b]">
            {summary.attention}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#451a03] text-[#fcd34d] border border-[#b45309]">
            ACTIONABLE
          </span>
        </div>
        <span className="text-[10px] text-[#b45309] mt-1">TF-04, CP-17 flagged</span>
      </div>

      {/* 4. Critical */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Critical Faults
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-300">
            {summary.critical}
          </span>
          <span className="text-[10px] font-mono text-[#10b981]">ZERO</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">No emergency shutoffs</span>
      </div>

      {/* 5. High Anomaly Index */}
      <div className="bg-[#1c1214] border border-[#4c1d25] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#fca5a5] uppercase">
          Peak Anomaly Index
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#ef4444]">
            {summary.highAnomalyIndex}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#450a0a] text-[#fca5a5] border border-[#dc2626]">
            / 100
          </span>
        </div>
        <span className="text-[10px] text-[#dc2626] mt-1">Tank Farm 04 composite</span>
      </div>

      {/* 6. Inspection Due */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Inspection Due
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#f59e0b]">
            {summary.inspectionDue}
          </span>
          <span className="text-[10px] font-mono text-[#fbbf24]">QUEUED</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Physical review required</span>
      </div>
    </div>
  );
};
