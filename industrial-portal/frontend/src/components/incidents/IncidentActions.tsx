import React, { useState } from 'react';
import { IncidentRecord } from '../../types';

interface IncidentActionsProps {
  incident: IncidentRecord;
  onAcknowledge: () => Promise<void>;
  onAction: (type: string, note: string) => Promise<void>;
  onEscalate: (reason: string) => Promise<void>;
  onAddEvidenceClick?: () => void;
  onResolveClick?: () => void;
}

const CHECKLIST_ITEMS = [
  'Verify thermal source location',
  'Inspect Tank Farm 04 perimeter',
  'Check gas detection readings',
  'Verify valve/venting state',
  'Review recent maintenance activity',
];

export const IncidentActions: React.FC<IncidentActionsProps> = ({
  incident,
  onAcknowledge,
  onAction,
  onEscalate,
  onAddEvidenceClick,
  onResolveClick,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  const toggleChecklist = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const isAlerted = incident.state === 'ALERTED';
  const isAcknowledged = incident.state === 'ACKNOWLEDGED';
  const isInvestigating = incident.state === 'INVESTIGATING';
  const isInspection = incident.state === 'INSPECTION';
  const isEscalated = incident.state === 'ESCALATED';
  const isResolved = incident.state === 'RESOLVED';
  const isClosed = incident.state === 'CLOSED';

  const handleConfirmAcknowledge = async () => {
    try {
      setLoading(true);
      await onAcknowledge();
      setActiveModal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async (type: string) => {
    try {
      setLoading(true);
      await onAction(type, actionNote);
      setActionNote('');
      setActiveModal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEscalate = async () => {
    try {
      setLoading(true);
      await onEscalate(actionNote || 'Cross-signal thermal and gas elevation requires district oversight.');
      setActionNote('');
      setActiveModal(null);
    } finally {
      setLoading(false);
    }
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
            OPERATOR RESPONSE & INTERVENTION ACTIONS
          </span>
          <span className="text-[10px] font-mono text-[#7e90a5] bg-[#0b0f15] px-2 py-0.5 rounded border border-[#233140]">
            GOVERNANCE COMPLIANT
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#64748b]">
          NO SUPPRESSION / DELETION PERMITTED
        </div>
      </div>

      <div className="p-4">
        {/* Step 1: When ALERTED */}
        {isAlerted && (
          <div className="bg-[#291316]/50 border border-[#7f1d1d] rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                <span className="font-bold text-sm text-[#fca5a5] font-mono uppercase">
                  Government Alert Pending Operator Acknowledgement
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Regulatory protocol mandates immediate review of alert ALT-2026-0891. Acknowledge receipt to initiate local triage and physical inspection.
              </p>
            </div>

            <button
              onClick={() => setActiveModal('ACKNOWLEDGE')}
              className="px-5 py-2.5 rounded bg-[#dc2626] hover:bg-[#b91c1c] active:bg-[#991b1b] text-white font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow-lg whitespace-nowrap"
            >
              ACKNOWLEDGE ALERT
            </button>
          </div>
        )}

        {/* Step 2: When ACKNOWLEDGED */}
        {isAcknowledged && (
          <div className="bg-[#16202c] border border-[#233140] rounded p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span className="font-bold text-sm text-slate-100 font-mono uppercase">
                  Alert Acknowledged • Awaiting Field Investigation
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Alert confirmed received. Begin inspection to dispatch operations team and advance workflow to INVESTIGATING.
              </p>
            </div>

            <button
              onClick={() => setActiveModal('BEGIN_INSPECTION')}
              className="px-5 py-2.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow-lg whitespace-nowrap flex items-center gap-2"
            >
              <span>🔍</span> BEGIN INSPECTION
            </button>
          </div>
        )}

        {/* Step 3: When INVESTIGATING */}
        {isInvestigating && (
          <div className="bg-[#16202c] border border-[#243242] rounded p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#233140]">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded bg-[#1e293b] border border-[#3b82f6] text-[#93c5fd] font-mono text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse"></span>
                  FIELD INVESTIGATION INITIATED
                </div>
                <span className="text-xs text-slate-300 font-mono">
                  Dispatch confirmed. Ready to start physical site inspection.
                </span>
              </div>

              <button
                onClick={() => setActiveModal('START_FIELD_INSPECTION')}
                className="px-5 py-2.5 rounded bg-[#f59e0b] hover:bg-[#d97706] text-black font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow-lg whitespace-nowrap flex items-center gap-2"
              >
                <span>📋</span> START FIELD INSPECTION
              </button>
            </div>

            {/* Quick Actions during investigation */}
            <div>
              <div className="text-[10px] font-mono uppercase text-[#7e90a5] font-semibold mb-2">
                PRE-INSPECTION ACTIONS & LOGGING:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  onClick={() => onAddEvidenceClick && onAddEvidenceClick()}
                  className="px-3 py-1.5 rounded bg-[#151c26] hover:bg-[#1e2a38] text-slate-200 border border-[#2b3d52] transition-colors flex items-center gap-1.5"
                >
                  <span>📷</span> ADD EVIDENCE
                </button>
                <button
                  onClick={() => setActiveModal('CONFIRM_ROUTINE')}
                  className="px-3 py-1.5 rounded bg-[#151c26] hover:bg-[#1e2a38] text-slate-200 border border-[#2b3d52] transition-colors"
                >
                  CONFIRM ROUTINE
                </button>
                <button
                  onClick={() => setActiveModal('PLANNED_MAINTENANCE')}
                  className="px-3 py-1.5 rounded bg-[#151c26] hover:bg-[#1e2a38] text-slate-200 border border-[#2b3d52] transition-colors"
                >
                  PLANNED MAINTENANCE
                </button>
                <button
                  onClick={() => setActiveModal('DISPUTE_ALERT')}
                  className="px-3 py-1.5 rounded bg-[#151c26] hover:bg-[#1e2a38] text-slate-300 border border-[#374151] transition-colors"
                >
                  DISPUTE ALERT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: When INSPECTION */}
        {isInspection && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#233140]">
              <div className="px-3 py-1.5 rounded bg-[#0b2416] border border-[#059669] text-[#6ee7b7] font-mono text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
                FIELD INSPECTION ACTIVE
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Escalate button */}
                <button
                  onClick={() => setActiveModal('ESCALATE')}
                  className="px-4 py-2 rounded bg-[#7c2d12] hover:bg-[#9a3412] text-amber-200 border border-[#ea580c] font-mono font-semibold text-xs tracking-wider uppercase transition-colors"
                >
                  ESCALATE TO DISTRICT OPERATIONS
                </button>

                {/* Resolve directly from inspection */}
                <button
                  onClick={() => onResolveClick && onResolveClick()}
                  className="px-4 py-2 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow"
                >
                  RESOLVE INCIDENT
                </button>
              </div>
            </div>

            {/* Inspection Checklist */}
            <div className="bg-[#0b141d] border border-[#1e2e3e] rounded p-3">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1b2735]">
                <span className="text-[11px] font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
                  <span>📋</span> FIELD INSPECTION CHECKLIST (TANK FARM 04)
                </span>
                <span className="text-[10px] font-mono text-[#7e90a5]">
                  {checkedCount}/5 VERIFIED
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                {CHECKLIST_ITEMS.map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white bg-[#0e1622] p-2 rounded border border-[#1a2533] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedItems[idx]}
                      onChange={() => toggleChecklist(idx)}
                      className="rounded bg-[#121820] border-[#33475b] text-[#0284c7] focus:ring-0"
                    />
                    <span className={checkedItems[idx] ? 'line-through text-slate-500' : ''}>
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Available Actions in INSPECTION */}
            <div>
              <div className="text-[10px] font-mono uppercase text-[#7e90a5] font-semibold mb-2">
                AVAILABLE OPERATOR ACTIONS & FEEDBACK:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  onClick={() => onAddEvidenceClick && onAddEvidenceClick()}
                  className="px-3 py-1.5 rounded bg-[#0284c7]/20 hover:bg-[#0284c7]/30 text-[#38bdf8] border border-[#0284c7]/40 transition-colors flex items-center gap-1.5"
                >
                  <span>📷</span> ADD EVIDENCE
                </button>

                <button
                  onClick={() => setActiveModal('CONFIRM_ROUTINE')}
                  className="px-3 py-1.5 rounded bg-[#16202c] hover:bg-[#1e2a38] text-slate-200 border border-[#2b3d52] transition-colors"
                >
                  CONFIRM ROUTINE
                </button>

                <button
                  onClick={() => setActiveModal('PLANNED_MAINTENANCE')}
                  className="px-3 py-1.5 rounded bg-[#16202c] hover:bg-[#1e2a38] text-slate-200 border border-[#2b3d52] transition-colors"
                >
                  PLANNED MAINTENANCE
                </button>

                <button
                  onClick={() => setActiveModal('REPORT_SUSPECTED_LEAK')}
                  className="px-3 py-1.5 rounded bg-[#291316] hover:bg-[#451a03] text-amber-200 border border-[#78350f] transition-colors"
                >
                  REPORT SUSPECTED LEAK
                </button>

                <button
                  onClick={() => setActiveModal('REPORT_SUSPECTED_FIRE')}
                  className="px-3 py-1.5 rounded bg-[#381014] hover:bg-[#521319] text-[#fca5a5] border border-[#991b1b] transition-colors"
                >
                  REPORT SUSPECTED FIRE
                </button>

                <button
                  onClick={() => setActiveModal('DISPUTE_ALERT')}
                  className="px-3 py-1.5 rounded bg-[#1a1c24] hover:bg-[#252834] text-slate-300 border border-[#374151] transition-colors"
                >
                  DISPUTE ALERT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: When ESCALATED */}
        {isEscalated && (
          <div className="space-y-4">
            <div className="bg-[#33180b] border border-[#ea580c] rounded p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                <div className="px-3 py-1 rounded bg-[#451a03] text-amber-300 font-mono text-xs font-bold border border-[#b45309]">
                  DISTRICT ESCALATION: SUBMITTED
                </div>
                <button
                  onClick={() => onResolveClick && onResolveClick()}
                  className="px-4 py-2 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white font-mono font-bold text-xs tracking-wider uppercase transition-colors shadow"
                >
                  RESOLVE INCIDENT
                </button>
              </div>
              <p className="text-xs text-amber-200/90 font-mono">
                Demo escalation record created for district operations. No external notification is sent.
              </p>
            </div>

            {/* Also allow evidence or feedback while escalated */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                onClick={() => onAddEvidenceClick && onAddEvidenceClick()}
                className="px-3 py-1.5 rounded bg-[#16202c] hover:bg-[#1e2a38] text-slate-200 border border-[#2b3d52] transition-colors flex items-center gap-1.5"
              >
                <span>📷</span> ADD EVIDENCE
              </button>
              <button
                onClick={() => setActiveModal('CONFIRM_ROUTINE')}
                className="px-3 py-1.5 rounded bg-[#16202c] hover:bg-[#1e2a38] text-slate-200 border border-[#2b3d52] transition-colors"
              >
                CONFIRM ROUTINE
              </button>
              <button
                onClick={() => setActiveModal('DISPUTE_ALERT')}
                className="px-3 py-1.5 rounded bg-[#16202c] hover:bg-[#1e2a38] text-slate-300 border border-[#374151] transition-colors"
              >
                DISPUTE ALERT
              </button>
            </div>
          </div>
        )}

        {/* Step 6: When RESOLVED */}
        {isResolved && (
          <div className="bg-[#101b24] border border-[#0284c7]/50 p-3 rounded text-xs font-mono text-cyan-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">STATUS: INCIDENT RESOLVED</span>
              <span className="text-[#38bdf8]">— Findings documented. Awaiting formal administrative closure.</span>
            </div>
          </div>
        )}

        {/* Step 7: When CLOSED */}
        {isClosed && (
          <div className="bg-[#0b1b15] border border-[#065f46] p-3 rounded text-xs font-mono text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">STATUS: INCIDENT CLOSED</span>
              <span className="text-[#6ee7b7]">— All corrective actions documented; incident workflow closed.</span>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#121820] border border-[#3b4c60] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            {/* Modal: Acknowledge */}
            {activeModal === 'ACKNOWLEDGE' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  ACKNOWLEDGE GOVERNMENT-ROUTED ALERT?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Acknowledgement confirms that the facility has received and reviewed the alert. It does not indicate that the alert is false or resolved.
                </p>
                <div className="flex justify-end gap-2.5 mt-5">
                  <button
                    onClick={() => setActiveModal(null)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleConfirmAcknowledge}
                    disabled={loading}
                    className="px-4 py-1.5 rounded bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-mono font-bold uppercase"
                  >
                    {loading ? 'RECORDING...' : 'ACKNOWLEDGE'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Begin Inspection */}
            {activeModal === 'BEGIN_INSPECTION' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  INITIATE FIELD INVESTIGATION?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  This will initiate investigation procedures for Tank Farm 04 and update workflow status to INVESTIGATING.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Optional operator dispatch note..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirmAction('BEGIN_INSPECTION')}
                    disabled={loading}
                    className="px-4 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-mono font-bold uppercase"
                  >
                    {loading ? 'DISPATCHING...' : 'CONFIRM INVESTIGATION'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Start Field Inspection */}
            {activeModal === 'START_FIELD_INSPECTION' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  START FIELD INSPECTION?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  This will deploy field personnel for physical inspection of Tank Farm 04 and transition the workflow to the INSPECTION state.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Field inspection assignment details..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirmAction('START_FIELD_INSPECTION')}
                    disabled={loading}
                    className="px-4 py-1.5 rounded bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-mono font-bold uppercase"
                  >
                    {loading ? 'STARTING...' : 'START FIELD INSPECTION'}
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Confirm Routine */}
            {activeModal === 'CONFIRM_ROUTINE' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  CONFIRM ROUTINE OPERATING CONDITION?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  This records the facility's assessment that the observed activity is routine or planned. The original alert remains in this incident's demo record.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter engineering rationale for routine determination..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirmAction('CONFIRM_ROUTINE')}
                    className="px-4 py-1.5 rounded bg-[#059669] hover:bg-[#047857] text-white text-xs font-mono font-bold uppercase"
                  >
                    SUBMIT ROUTINE RECORD
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Planned Maintenance */}
            {activeModal === 'PLANNED_MAINTENANCE' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  LOG PLANNED MAINTENANCE ACTIVITY?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Record that the observed thermal activity is associated with planned maintenance or operating activity.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Reference work order or scheduled maintenance ticket..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirmAction('PLANNED_MAINTENANCE')}
                    className="px-4 py-1.5 rounded bg-[#f59e0b] hover:bg-[#d97706] text-black text-xs font-mono font-bold uppercase"
                  >
                    RECORD PLANNED ACTIVITY
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Dispute Alert */}
            {activeModal === 'DISPUTE_ALERT' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  DISPUTE REGULATORY ALERT?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Submit facility evidence indicating that the alert may not represent an abnormal facility condition. Note: This action does not delete or suppress the alert from the incident's demo record.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Detail grounds for dispute (e.g., ground flare reflection, solar angle)..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirmAction('DISPUTE_ALERT')}
                    className="px-4 py-1.5 rounded bg-[#4b5563] hover:bg-[#374151] text-white text-xs font-mono font-bold uppercase"
                  >
                    SUBMIT FORMAL DISPUTE
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Suspected Leak */}
            {activeModal === 'REPORT_SUSPECTED_LEAK' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  REPORT SUSPECTED HYDROCARBON LEAK?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Flags localized vapor concentration spike for hazardous containment response.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter details on detected odor, visual sheen, or sniffer reading..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirmAction('REPORT_SUSPECTED_LEAK')}
                    className="px-4 py-1.5 rounded bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-mono font-bold uppercase"
                  >
                    LOG SUSPECTED LEAK
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Suspected Fire */}
            {activeModal === 'REPORT_SUSPECTED_FIRE' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  REPORT SUSPECTED FIRE HAZARD?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Immediately logs high-priority thermal hazard for site emergency response and fire-watch inspection.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter visual confirmation or thermal observation details..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() => handleConfirmAction('REPORT_SUSPECTED_FIRE')}
                    className="px-4 py-1.5 rounded bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-mono font-bold uppercase"
                  >
                    LOG FIRE HAZARD
                  </button>
                </div>
              </div>
            )}

            {/* Modal: Escalate */}
            {activeModal === 'ESCALATE' && (
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-100 uppercase pb-2 mb-3 border-b border-[#233140]">
                  ESCALATE TO DISTRICT OPERATIONS?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Escalation creates a demo district-operations handoff record. No external notification is sent.
                </p>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Reason for district escalation (e.g., cross-signal thermal and gas elevation)..."
                  className="w-full bg-[#0b0f15] border border-[#243242] rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-[#0284c7] h-20 mb-4"
                />
                <div className="flex justify-end gap-2.5">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:bg-[#1a232f] border border-[#2b3a4c]"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleConfirmEscalate}
                    className="px-4 py-1.5 rounded bg-[#9a3412] hover:bg-[#7c2d12] text-white text-xs font-mono font-bold uppercase"
                  >
                    SUBMIT ESCALATION
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
