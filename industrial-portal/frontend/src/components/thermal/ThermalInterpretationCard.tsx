import React from 'react';
import { ThermalSummary } from '../../types';

interface ThermalInterpretationCardProps {
  summary: ThermalSummary;
}

export const ThermalInterpretationCard: React.FC<ThermalInterpretationCardProps> = ({ summary }) => {
  return (
    <div className="av-card bg-[#181216] border-[#5c1d27] flex flex-col justify-between p-4 relative">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#3d1a22]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
            <span className="text-xs font-bold tracking-wider text-[#f87171] uppercase">
              THERMAL BEHAVIOR FINGERPRINT
            </span>
          </div>
          <span className="av-badge av-badge-danger">
            CRITICAL EVALUATION
          </span>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div>
            <span className="text-slate-400">Current thermal intensity:</span>{' '}
            <span className="text-red-400 font-bold">{summary.currentIntensity}x normal baseline</span>
          </div>
          <div>
            <span className="text-slate-400">Normal source location:</span>{' '}
            <span className="text-slate-200 font-bold">Flare F-01</span>
          </div>
          <div>
            <span className="text-slate-400">Current source location:</span>{' '}
            <span className="text-amber-300 font-bold">{summary.locationShift}</span>
          </div>
          <div className="bg-[#2e1117] border border-red-500/30 p-2 rounded mt-2">
            <span className="text-slate-400">Interpretation:</span>{' '}
            <span className="text-red-400 font-bold">Unusual thermal deviation ({summary.classification})</span>
          </div>
        </div>

        <div className="mt-4 bg-[#dc2626]/20 border border-[#dc2626]/70 p-3 rounded">
          <span className="text-[10px] font-mono uppercase text-[#fca5a5] block font-bold tracking-wider">
            RECOMMENDED ACTION:
          </span>
          <span className="text-xs font-semibold text-white mt-0.5 block">
            {summary.recommendedAction}
          </span>
        </div>
      </div>
    </div>
  );
};
