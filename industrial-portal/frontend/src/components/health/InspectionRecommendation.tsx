import React, { useState } from 'react';
import { AssetHealthItem } from '../../types';

interface InspectionRecommendationProps {
  asset: AssetHealthItem;
}

export const InspectionRecommendation: React.FC<InspectionRecommendationProps> = ({ asset }) => {
  const [showChecklist, setShowChecklist] = useState<boolean>(true);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const isAttention = asset.healthStatus === 'ATTENTION';

  return (
    <div className="bg-[#181216] border border-[#5c1d27] rounded overflow-hidden flex flex-col justify-between p-4">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#3d1a22]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAttention ? 'bg-[#ef4444] animate-ping' : 'bg-[#10b981]'
              }`}
            />
            <span className="text-xs font-bold tracking-wider text-[#f87171] uppercase font-mono">
              OBSERVED CONDITION & RECOMMENDED ACTION
            </span>
          </div>
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              asset.inspectionPriority === 'HIGH'
                ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                : asset.inspectionPriority === 'MEDIUM'
                ? 'bg-[#451a03] text-[#fcd34d] border-[#b45309]'
                : 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
            }`}
          >
            {asset.inspectionPriority} PRIORITY
          </span>
        </div>

        {/* Observed Condition */}
        <div className="mb-4">
          <div className="text-[10px] font-mono uppercase text-[#7e90a5] font-semibold">
            OBSERVED CONDITION:
          </div>
          <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
            {asset.likelyCondition}
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            {asset.supportingObservation}
          </p>
        </div>

        {/* Recommended Inspection */}
        <div className="p-3 bg-[#241014] border border-[#991b1b]/70 rounded mb-4">
          <div className="text-[10px] font-mono uppercase text-[#fca5a5] font-bold">
            RECOMMENDED INSPECTION:
          </div>
          <div className="text-xs font-bold text-white mt-0.5">
            {asset.suggestedInspection}
          </div>
          <div className="text-[11px] font-mono text-slate-300 mt-1.5 pt-1.5 border-t border-[#4a181e]">
            <span className="text-[#fca5a5]">RATIONALE: </span>
            <span>{asset.inspectionReason}</span>
          </div>
        </div>

        {/* Inspection Checklist Button & Content */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-[#fcd34d] uppercase">
              FIELD INSPECTION PROCEDURE
            </span>
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e293b] hover:bg-[#2d3f54] text-slate-200 border border-[#3b4c60] transition-colors"
            >
              {showChecklist ? 'HIDE CHECKLIST' : 'VIEW INSPECTION CHECKLIST'}
            </button>
          </div>

          {showChecklist && (
            <div className="bg-[#120e14] border border-[#38161b] rounded p-3 space-y-2">
              <div className="text-[10px] font-mono text-[#7e90a5] mb-1">
                OPERATIONAL VERIFICATION STEPS:
              </div>
              {asset.checklist.map((step, idx) => {
                const isChecked = !!checkedItems[idx];
                return (
                  <label
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className="flex items-start gap-2.5 cursor-pointer text-xs font-mono text-slate-200 hover:text-white select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 accent-[#ef4444] rounded cursor-pointer"
                    />
                    <span className={isChecked ? 'line-through text-[#64748b]' : ''}>
                      {step}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-[#3d1a22] text-[10px] font-mono text-[#7e90a5]">
        VERIFICATION DISPATCH: LOCAL HACKATHON PROTOCOL • ZERO UNVERIFIED TIME-TO-FAILURE CLAIMS
      </div>
    </div>
  );
};
