import React from 'react';
import { ThermalSummary } from '../../types';

interface ThermalSummaryCardsProps {
  summary: ThermalSummary;
}

export const ThermalSummaryCards: React.FC<ThermalSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Current Intensity */}
      <div className="bg-[#191113] border border-[#4a1d24] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#fca5a5] uppercase">
          Current Intensity
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#ef4444]">
            {summary.currentIntensity}×
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#450a0a] text-[#fca5a5] border border-[#dc2626]">
            ANOMALY
          </span>
        </div>
        <span className="text-[10px] text-[#991b1b] mt-1">vs 1.0× standard baseline</span>
      </div>

      {/* 2. Facility Baseline */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Facility Baseline
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-slate-200">
            {summary.baselineIntensity.toFixed(1)}×
          </span>
          <span className="text-[10px] font-mono text-[#64748b]">INDEX</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Facility calibrated reference</span>
      </div>

      {/* 3. Normal Operating Range */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Normal Range
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#10b981]">
            {summary.normalRangeMin}× — {summary.normalRangeMax}×
          </span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Expected operational envelope</span>
      </div>

      {/* 4. Spatial Location Shift */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Location Shift
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#f59e0b]">
            {summary.locationShift}
          </span>
          <span className="text-[10px] font-mono text-[#fbbf24]">DEVIATION</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Displaced from flare stack</span>
      </div>

      {/* 5. Recurrence Frequency */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Recurrence
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#38bdf8]">
            {summary.recurrence}
          </span>
          <span className="text-[10px] font-mono text-[#0284c7]">ISOLATED</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">First occurrence in 90 days</span>
      </div>

      {/* 6. Classification */}
      <div className="bg-[#1c1214] border border-[#4c1d25] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#fca5a5] uppercase">
          Classification
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold tracking-tight text-[#ef4444]">
            {summary.classification}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-pulse" />
        </div>
        <span className="text-[10px] text-[#dc2626] mt-1">Requires physical inspection</span>
      </div>
    </div>
  );
};
