import React, { useEffect, useRef, useState } from 'react';
import { AlertItem } from '../../types';

interface ActiveAlertCardProps {
  alerts: AlertItem[];
}

export const ActiveAlertCard: React.FC<ActiveAlertCardProps> = ({ alerts }) => {
  const [investigateFeedback, setInvestigateFeedback] = useState<string | null>(null);
  const feedbackTimeout = useRef<number | null>(null);

  useEffect(() => () => {
    if (feedbackTimeout.current !== null) window.clearTimeout(feedbackTimeout.current);
  }, []);

  const primaryAlert = alerts[0];

  const handleInvestigateClick = () => {
    setInvestigateFeedback('Investigation workflow coming in Phase 5');
    if (feedbackTimeout.current !== null) window.clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = window.setTimeout(() => {
      setInvestigateFeedback(null);
      feedbackTimeout.current = null;
    }, 3500);
  };

  if (!primaryAlert) {
    return (
      <div className="bg-[#121820] border border-[#233140] rounded p-5 h-[460px] flex items-center justify-center text-center">
        <p className="text-xs text-[#64748b]">No active critical alerts detected in queue.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#121820] border border-[#233140] rounded flex flex-col h-[460px] relative overflow-hidden">
      {/* Alert Header */}
      <div className="bg-[#1c181f] border-b border-[#3b1f24] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
          <span className="text-xs font-bold tracking-wider text-[#f87171] uppercase">
            Active Priority Alert
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#450a0a] text-[#fca5a5] border border-[#991b1b]">
          {primaryAlert.severity} PRIORITY
        </span>
      </div>

      {/* Alert Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Alert Title & Type */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-mono tracking-widest text-[#f97316] uppercase font-semibold">
                {primaryAlert.type}
              </span>
              <h2 className="text-lg font-bold text-slate-100 mt-0.5">
                Thermal anomaly detected
              </h2>
            </div>
            <span className="text-xs font-mono text-[#64748b] bg-[#0b0f15] px-2 py-1 rounded border border-[#1e2a38]">
              {primaryAlert.id}
            </span>
          </div>

          {/* Target Asset Box */}
          <div className="mt-4 bg-[#18212c] border border-[#28384a] rounded p-3">
            <div className="text-[10px] uppercase font-mono text-[#7e90a5] font-semibold">
              Impacted Target Asset
            </div>
            <div className="text-base font-bold text-slate-100 mt-0.5 flex items-center justify-between">
              <span>{primaryAlert.assetName}</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#450a0a]/80 text-[#fca5a5] border border-[#dc2626]">
                CRITICAL
              </span>
            </div>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-[#10151c] border border-[#1e2a38] rounded p-2.5">
              <span className="text-[10px] uppercase font-mono text-[#64748b]">
                Thermal Intensity
              </span>
              <div className="text-sm font-bold font-mono text-[#fb923c] mt-0.5">
                {primaryAlert.thermalIntensity}
              </div>
            </div>

            <div className="bg-[#10151c] border border-[#1e2a38] rounded p-2.5">
              <span className="text-[10px] uppercase font-mono text-[#64748b]">
                Detected Time
              </span>
              <div className="text-sm font-bold font-mono text-slate-200 mt-0.5">
                {primaryAlert.detectedAt} UTC
              </div>
            </div>
          </div>

          {/* Status & Description */}
          <div className="mt-3 bg-[#10151c] border border-[#1e2a38] rounded p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono text-[#64748b]">
                Current Disposition
              </span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#311313] text-[#fca5a5] border border-[#7f1d1d]">
                {primaryAlert.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {primaryAlert.description}
            </p>
          </div>
        </div>

        {/* Action Button & Feedback */}
        <div className="mt-4 pt-3 border-t border-[#1e2a38]">
          <button
            onClick={handleInvestigateClick}
            className="w-full py-2.5 px-4 rounded bg-[#b91c1c] hover:bg-[#dc2626] active:bg-[#991b1b] text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span>INVESTIGATE ANOMALY</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>

          {investigateFeedback && (
            <div className="mt-2 text-center text-[11px] font-mono text-[#fbbf24] bg-[#291e0a] border border-[#78350f] py-1.5 px-2 rounded animate-fade-in">
              ℹ {investigateFeedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
