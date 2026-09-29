import React from 'react';
import { HistoricalIncident } from '../../types';

interface HistoricalMatchPanelProps {
  incidents: HistoricalIncident[];
  selectedAssetId: string;
}

export const HistoricalMatchPanel: React.FC<HistoricalMatchPanelProps> = ({
  incidents,
  selectedAssetId,
}) => {
  // Filter or prioritize incidents matching the selected asset, or top 3 matches
  const relevantIncidents = incidents
    .filter((inc) => inc.applicableAssetIds.includes(selectedAssetId))
    .slice(0, 3);

  const displayIncidents =
    relevantIncidents.length > 0 ? relevantIncidents : incidents.slice(0, 3);

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1e2a38]">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            SIMULATED HISTORICAL CASE MATCHES
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            PATTERN SIMILARITY INDEX
          </span>
        </div>

        <p className="text-xs text-[#94a3b8] mb-3">
          Cross-referencing current thermal and telemetry signatures against facility incident archive.
        </p>

        <div className="space-y-3">
          {displayIncidents.map((item) => (
            <div
              key={item.caseId}
              className="bg-[#16202c] border border-[#243242] rounded p-3 text-xs"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 pb-2 mb-2 border-b border-[#1e2a38]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#38bdf8]">{item.caseId}</span>
                    <span className="text-[#64748b]">•</span>
                    <span className="font-semibold text-slate-200">{item.asset}</span>
                  </div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5">{item.incidentType}</div>
                </div>

                <div className="text-right">
                  <span className="inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#1e293b] text-[#fcd34d] border border-[#b45309]/50">
                    {item.patternSimilarity} PATTERN SIMILARITY
                  </span>
                </div>
              </div>

              {/* Observed Pattern */}
              <div className="mb-2">
                <span className="text-[10px] font-mono uppercase text-[#7e90a5] block">
                  Observed Pattern:
                </span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {item.observedPattern}
                </span>
              </div>

              {/* Root Cause & Corrective Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mt-2 pt-2 border-t border-[#1e2a38]/60">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#fca5a5] block font-semibold">
                    Historical Root Cause:
                  </span>
                  <span className="text-slate-200">{item.rootCause}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#6ee7b7] block font-semibold">
                    Corrective Action Taken:
                  </span>
                  <span className="text-slate-200">{item.correctiveAction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#1e2a38] text-[10px] font-mono text-[#64748b]">
        DISCLAIMER: Historical cases shown are simulated demonstration records for signature matching.
      </div>
    </div>
  );
};
