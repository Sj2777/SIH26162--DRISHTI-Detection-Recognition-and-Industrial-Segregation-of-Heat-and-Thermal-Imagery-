import React from 'react';
import { ThermalDayNight } from '../../types';

interface DayNightComparisonCardProps {
  dayNight: ThermalDayNight;
}

export const DayNightComparisonCard: React.FC<DayNightComparisonCardProps> = ({ dayNight }) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1e2a38]">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Diurnal Envelope Comparison
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            DAY vs NIGHT SIGNATURE
          </span>
        </div>

        <p className="text-xs text-[#94a3b8] mb-3">
          Expected thermal radiation fluctuates due to ambient solar loading and daytime throughput cycles.
        </p>

        <div className="space-y-2.5 font-mono text-xs">
          {/* Daytime */}
          <div className="bg-[#16202c] border border-[#243242] p-2.5 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">☀</span>
              <span className="text-slate-300">Daytime Baseline:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">{dayNight.daytime}×</span>
              <span className="text-[10px] text-[#64748b]">(Nominal)</span>
            </div>
          </div>

          {/* Nighttime */}
          <div className="bg-[#16202c] border border-[#243242] p-2.5 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-400">🌙</span>
              <span className="text-slate-300">Nighttime Baseline:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">{dayNight.nighttime}×</span>
              <span className="text-[10px] text-[#64748b]">(Reduced ambient)</span>
            </div>
          </div>

          {/* Current Observation */}
          <div className="bg-[#2a1317] border border-[#7f1d1d] p-2.5 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping"></span>
              <span className="text-red-300 font-semibold">Current Observation:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-400 text-sm">{dayNight.current}×</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#450a0a] text-[#fca5a5]">
                +145% OVER DAY
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#1e2a38] text-[11px] text-[#64748b]">
        Deviation cannot be explained by diurnal solar irradiance or atmospheric temperature delta.
      </div>
    </div>
  );
};
