import React, { useState } from 'react';
import { IncidentRecord } from '../../types';

interface IncidentResolutionProps {
  incident: IncidentRecord;
  onResolve: (details: {
    observedFinding: string;
    rootCause: string;
    correctiveAction: string;
    resolution: string;
  }) => Promise<void>;
  onClose: (details: {
    rootCause: string;
    correctiveAction: string;
    closureNote: string;
  }) => Promise<void>;
}

export const IncidentResolution: React.FC<IncidentResolutionProps> = ({
  incident,
  onResolve,
  onClose,
}) => {
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);

  // Form states for Resolution
  const [observedFinding, setObservedFinding] = useState<string>(
    'Thermal activity traced to scheduled tank heating cycle.'
  );
  const [rootCause, setRootCause] = useState<string>('Planned operating activity');
  const [correctiveAction, setCorrectiveAction] = useState<string>(
    'Operating schedule recorded and inspection completed.'
  );

  // Form states for Closure
  const [closureNote, setClosureNote] = useState<string>(
    'Field inspection and regulatory verification completed. Unit operating nominal.'
  );

  const [loading, setLoading] = useState<boolean>(false);

  const isResolved = incident.state === 'RESOLVED';
  const isClosed = incident.state === 'CLOSED';
  const canResolve = incident.state === 'INSPECTION' || incident.state === 'ESCALATED';

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onResolve({
        observedFinding,
        rootCause,
        correctiveAction,
        resolution: observedFinding,
      });
      setShowResolveModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onClose({
        rootCause,
        correctiveAction,
        closureNote,
      });
      setShowCloseModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            INCIDENT RESOLUTION & ADMINISTRATIVE CLOSURE
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            FINAL STAGES
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canResolve && !isResolved && !isClosed && (
            <button
              onClick={() => setShowResolveModal(true)}
              className="px-4 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              RESOLVE INCIDENT
            </button>
          )}

          {isResolved && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-4 py-1.5 rounded bg-[#059669] hover:bg-[#047857] text-white font-mono text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              CLOSE INCIDENT
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* If Still in Pre-Resolution States */}
        {!isResolved && !isClosed && (
          <div className="text-xs font-mono text-[#94a3b8] flex items-center justify-between p-3 bg-[#151c26] border border-[#233140] rounded">
            <span>
              Current Status: <span className="text-amber-400 font-bold">{incident.state}</span>. {canResolve ? 'Field inspection completed. Ready to record formal resolution findings.' : 'Field inspection must be initiated before incident resolution can be performed.'}
            </span>
            {canResolve && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-3 py-1 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-[11px] font-mono font-bold uppercase"
              >
                BEGIN RESOLUTION
              </button>
            )}
          </div>
        )}

        {/* If Resolved */}
        {isResolved && incident.resolutionDetails && (
          <div className="bg-[#101b24] border border-[#0284c7]/60 rounded p-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1e2a38]">
              <span className="text-[#38bdf8] font-bold text-xs uppercase">
                INCIDENT RESOLUTION RECORDED
              </span>
              <span className="text-[10px] text-[#7e90a5]">
                RESOLVED AT: {incident.resolutionDetails.resolvedAt}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div className="bg-[#0b131a] p-2.5 rounded border border-[#1e2a38]">
                <span className="text-[10px] text-[#7e90a5] block uppercase">Observed Finding:</span>
                <span className="text-slate-100">{incident.resolutionDetails.observedFinding}</span>
              </div>
              <div className="bg-[#0b131a] p-2.5 rounded border border-[#1e2a38]">
                <span className="text-[10px] text-[#7e90a5] block uppercase">Root Cause:</span>
                <span className="text-slate-100">{incident.resolutionDetails.rootCause}</span>
              </div>
              <div className="bg-[#0b131a] p-2.5 rounded border border-[#1e2a38]">
                <span className="text-[10px] text-[#7e90a5] block uppercase">Corrective Action:</span>
                <span className="text-slate-100">{incident.resolutionDetails.correctiveAction}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#1e2a38]">
              <span className="text-[11px] text-amber-300">
                ⚠ Ready for administrative sign-off. Click "CLOSE INCIDENT" to lock workflow.
              </span>
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-1.5 rounded bg-[#059669] hover:bg-[#047857] text-white font-bold uppercase text-[11px]"
              >
                PROCEED TO CLOSURE
              </button>
            </div>
          </div>
        )}

        {/* If Closed */}
        {isClosed && (
          <div className="bg-[#0b1b15] border border-[#065f46] rounded p-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#065f46]/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span className="text-[#6ee7b7] font-bold text-xs uppercase">
                  INCIDENT CLOSED — REGULATORY RECORD LOCKED
                </span>
              </div>
              <span className="text-[10px] text-[#6ee7b7]">
                CLOSED AT: {incident.closedAt ? new Date(incident.closedAt).toLocaleTimeString() : 'RECENT'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#06241a] p-2.5 rounded border border-[#065f46]/40">
                <span className="text-[10px] text-[#6ee7b7] block uppercase">Final Root Cause:</span>
                <span className="text-white font-bold">{incident.closureDetails?.rootCause || 'Planned tank heating operation'}</span>
              </div>
              <div className="bg-[#06241a] p-2.5 rounded border border-[#065f46]/40">
                <span className="text-[10px] text-[#6ee7b7] block uppercase">Corrective Action Taken:</span>
                <span className="text-white font-bold">{incident.closureDetails?.correctiveAction || 'Operating schedule recorded'}</span>
              </div>
              <div className="bg-[#06241a] p-2.5 rounded border border-[#065f46]/40">
                <span className="text-[10px] text-[#6ee7b7] block uppercase">Closure Sign-Off Note:</span>
                <span className="text-white font-bold">{incident.closureDetails?.closureNote || 'Confirmed nominal.'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121820] border border-[#3b4c60] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
              RESOLVE INCIDENT
            </h3>
            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Observed Finding
                </label>
                <textarea
                  value={observedFinding}
                  onChange={(e) => setObservedFinding(e.target.value)}
                  required
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7] h-16"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Root Cause
                </label>
                <input
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  required
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Corrective Action
                </label>
                <input
                  type="text"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  required
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#233140]">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-mono font-bold uppercase"
                >
                  {loading ? 'SUBMITTING...' : 'RECORD RESOLUTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121820] border border-[#3b4c60] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
              FORMALLY CLOSE INCIDENT
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Closing this incident marks the workflow record as complete. Audit events and evidence records remain available while the backend process is running.
            </p>
            <form onSubmit={handleCloseSubmit} className="space-y-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Verified Root Cause
                </label>
                <input
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  required
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Corrective Action
                </label>
                <input
                  type="text"
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  required
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#7e90a5] uppercase block mb-1">
                  Closure Sign-off Note
                </label>
                <textarea
                  value={closureNote}
                  onChange={(e) => setClosureNote(e.target.value)}
                  required
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-slate-200 focus:outline-none focus:border-[#0284c7] h-16"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-[#233140]">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded bg-[#059669] hover:bg-[#047857] text-white text-xs font-mono font-bold uppercase"
                >
                  {loading ? 'CLOSING...' : 'CONFIRM CLOSURE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
