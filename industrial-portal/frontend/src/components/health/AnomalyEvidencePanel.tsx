import React from 'react';
import { AssetHealthItem } from '../../types';

interface AnomalyEvidencePanelProps {
  asset: AssetHealthItem;
}

export const AnomalyEvidencePanel: React.FC<AnomalyEvidencePanelProps> = ({ asset }) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1e2a38]">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            ANOMALY EVIDENCE BREAKDOWN
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            TRANSPARENT SCORING
          </span>
        </div>

        <p className="text-xs text-[#94a3b8] mb-4">
          Anomaly scoring is explainable and isolates contributing signals from unimpacted process variables.
        </p>

        {/* Contributing Signals */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[#f87171] uppercase">
            <span>⚠ CONTRIBUTING SIGNALS</span>
            <span className="text-[10px] text-[#7e90a5]">
              ({asset.contributingSignals.length} DETECTED)
            </span>
          </div>
          {asset.contributingSignals.length > 0 ? (
            <ul className="space-y-1.5 font-mono text-xs">
              {asset.contributingSignals.map((signal, idx) => (
                <li
                  key={idx}
                  className="bg-[#2a1317]/60 border border-[#7f1d1d] text-red-200 px-3 py-2 rounded flex items-center gap-2"
                >
                  <span className="text-[#ef4444] font-bold">+</span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-[#151c26] text-[#64748b] text-xs font-mono p-2.5 rounded border border-[#223142]">
              No active anomaly contributors identified. All channels nominal.
            </div>
          )}
        </div>

        {/* Normal / Mitigating Signals */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[#34d399] uppercase">
            <span>✔ NORMAL / MITIGATING SIGNALS</span>
            <span className="text-[10px] text-[#7e90a5]">
              ({asset.mitigatingSignals.length} VERIFIED)
            </span>
          </div>
          <ul className="space-y-1.5 font-mono text-xs">
            {asset.mitigatingSignals.map((signal, idx) => (
              <li
                key={idx}
                className="bg-[#0b1b15]/60 border border-[#065f46] text-emerald-200 px-3 py-2 rounded flex items-center gap-2"
              >
                <span className="text-[#10b981] font-bold">✓</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#1e2a38] text-[10px] font-mono text-[#64748b]">
        EVALUATION PROTOCOL: EXPLICIT EVIDENCE TRACEABILITY • ZERO BLACK-BOX ML CLAIMS
      </div>
    </div>
  );
};
