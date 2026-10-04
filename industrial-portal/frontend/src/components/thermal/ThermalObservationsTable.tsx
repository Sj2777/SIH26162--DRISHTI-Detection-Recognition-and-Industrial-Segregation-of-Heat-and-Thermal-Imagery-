import React from 'react';
import { ThermalObservation } from '../../types';

interface ThermalObservationsTableProps {
  observations: ThermalObservation[];
}

export const ThermalObservationsTable: React.FC<ThermalObservationsTableProps> = ({
  observations,
}) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mt-6">
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Recent Thermal Observations & Radiometric Log
          </span>
          <span className="text-[10px] font-mono text-[#7e90a5] bg-[#0b0f15] px-2 py-0.5 rounded border border-[#233140]">
            {observations.length} RECORDED ENTRIES
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#64748b]">
          CALIBRATED RADIOMETRIC INDEX
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1e2a38] bg-[#0e131a] text-[#7e90a5] font-mono uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4">Observation Time</th>
              <th className="py-2.5 px-4">Intensity Index</th>
              <th className="py-2.5 px-4">Coordinates (Lat / Lng)</th>
              <th className="py-2.5 px-4">Thermal Source Entity</th>
              <th className="py-2.5 px-4">Solar Period</th>
              <th className="py-2.5 px-4">Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a232f]">
            {observations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-xs text-[#94a3b8]">
                  No thermal observations are available.
                </td>
              </tr>
            ) : observations.map((obs, idx) => {
              return (
                <tr
                  key={idx}
                  className={`hover:bg-[#16202c]/80 transition-colors ${
                    obs.isAnomaly ? 'bg-[#3b1219]/30' : ''
                  }`}
                >
                  {/* Time */}
                  <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                    <div className="flex items-center gap-2">
                      {obs.isAnomaly && (
                        <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                      )}
                      <span>{obs.time}</span>
                    </div>
                  </td>

                  {/* Intensity */}
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={obs.isAnomaly ? 'text-[#ef4444]' : 'text-slate-300'}>
                      {obs.intensity}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3 px-4 font-mono text-[11px] text-[#94a3b8]">
                    {obs.latitude.toFixed(4)}, {obs.longitude.toFixed(4)}
                  </td>

                  {/* Source */}
                  <td className="py-3 px-4 text-slate-200 font-medium">
                    {obs.source}
                  </td>

                  {/* Day / Night */}
                  <td className="py-3 px-4 font-mono text-[11px]">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border ${
                        obs.dayNight === 'DAY'
                          ? 'bg-[#291e0a] text-amber-300 border-[#78350f]'
                          : 'bg-[#0f172a] text-blue-300 border-[#1e3a8a]'
                      }`}
                    >
                      {obs.dayNight === 'DAY' ? '☀ DAY' : '🌙 NIGHT'}
                    </span>
                  </td>

                  {/* Classification */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block font-mono text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        obs.classification === 'ABNORMAL'
                          ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                          : 'bg-[#064e3b]/80 text-[#6ee7b7] border-[#059669]/60'
                      }`}
                    >
                      {obs.classification}
                    </span>
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
