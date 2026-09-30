import React from 'react';
import { ThermalSummary } from '../../types';

interface ThermalInterpretationCardProps {
  summary: ThermalSummary;
}

export const ThermalInterpretationCard: React.FC<ThermalInterpretationCardProps> = ({ summary }) => {
  return (
    <div className="bg-[#181216] border border-[#5c1d27] rounded overflow-hidden flex flex-col justify-between p-4 relative">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#3d1a22]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
            <span className="text-xs font-bold tracking-wider text-[#f87171] uppercase">
              ABNORMAL THERMAL BEHAVIOUR
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#450a0a] text-[#fca5a5] border border-[#dc2626]">
            CRITICAL EVALUATION
          </span>
        </div>

        <p className="text-sm font-semibold text-slate-100 leading-snug">
          Current thermal intensity is{' '}
          <span className="text-[#ef4444] font-mono font-bold">
            {summary.currentIntensity}×
          </span>{' '}
          the facility baseline.
        </p>

        <p className="text-xs text-[#cbd5e1] mt-2 leading-relaxed">
          The observed thermal source has shifted approximately{' '}
          <span className="text-amber-300 font-mono font-bold">
            {summary.locationShift}
          </span>{' '}
          from the historical source location (Flare Stack 01).
        </p>

        <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
          <div className="bg-[#120e14] border border-[#3b1922] p-2 rounded">
            <span className="text-[#7e90a5] text-[10px] block">RECURRENCE:</span>
            <span className="text-slate-200 font-bold">{summary.recurrence}</span>
          </div>

          <div className="bg-[#120e14] border border-[#3b1922] p-2 rounded">
            <span className="text-[#7e90a5] text-[10px] block">CLASSIFICATION:</span>
            <span className="text-red-400 font-bold">ROUTINE → {summary.classification}</span>
          </div>
        </div>

        <div className="mt-4 bg-[#2e1117] border border-[#dc2626]/70 p-3 rounded">
          <span className="text-[10px] font-mono uppercase text-[#fca5a5] block font-bold tracking-wider">
            RECOMMENDED ACTION:
          </span>
          <span className="text-xs font-semibold text-white mt-0.5 block">
            {summary.recommendedAction}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#3d1a22] flex items-center justify-between text-[10px] font-mono text-[#7e90a5]">
        <span>SIMULATED DEMONSTRATION INTERPRETATION</span>
        <span>HACKATHON PROTOCOL</span>
      </div>
    </div>
  );
};
