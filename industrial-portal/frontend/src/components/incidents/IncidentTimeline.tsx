import React from 'react';
import { IncidentRecord, IncidentWorkflowState } from '../../types';

interface IncidentTimelineProps {
  incident: IncidentRecord;
}

const WORKFLOW_STEPS: { state: IncidentWorkflowState; label: string }[] = [
  { state: 'ALERTED', label: 'ALERTED' },
  { state: 'ACKNOWLEDGED', label: 'ACKNOWLEDGED' },
  { state: 'INVESTIGATING', label: 'INVESTIGATING' },
  { state: 'INSPECTION', label: 'INSPECTION' },
  { state: 'ESCALATED', label: 'ESCALATED' },
  { state: 'RESOLVED', label: 'RESOLVED' },
  { state: 'CLOSED', label: 'CLOSED' },
];

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ incident }) => {
  const getStepStatus = (stepState: IncidentWorkflowState) => {
    // If the incident is CLOSED, all states should appear completed
    if (incident.state === 'CLOSED') {
      return 'completed';
    }

    if (stepState === incident.state) {
      return 'current';
    }

    const stateOrder: IncidentWorkflowState[] = [
      'ALERTED',
      'ACKNOWLEDGED',
      'INVESTIGATING',
      'INSPECTION',
      'ESCALATED',
      'RESOLVED',
      'CLOSED',
    ];

    const currentIndex = stateOrder.indexOf(incident.state);
    const stepIndex = stateOrder.indexOf(stepState);

    // If escalated, investigating and inspection are completed
    if (incident.state === 'ESCALATED' && (stepState === 'INVESTIGATING' || stepState === 'INSPECTION')) {
      return 'completed';
    }

    // If resolved without escalation, ESCALATED was not traversed
    if (incident.state === 'RESOLVED' && stepState === 'ESCALATED' && !incident.escalatedAt) {
      return 'future';
    }

    if (stepIndex < currentIndex) {
      return 'completed';
    }

    return 'future';
  };

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mb-6">
      {/* Horizontal Workflow Stepper */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-slate-200 uppercase font-mono">
          WORKFLOW PROGRESSION LIFECYCLE
        </span>
        <span className="text-[10px] font-mono text-[#7e90a5]">
          CURRENT STAGE: <span className="text-amber-400 font-bold">{incident.state}</span>
        </span>
      </div>

      <div className="p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] gap-2">
          {WORKFLOW_STEPS.map((step, idx) => {
            const status = getStepStatus(step.state);

            return (
              <React.Fragment key={step.state}>
                {/* Node */}
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all ${
                      status === 'current'
                        ? 'bg-[#451a03] border-[#f59e0b] text-[#fcd34d] shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : status === 'completed'
                        ? 'bg-[#064e3b] border-[#10b981] text-[#6ee7b7]'
                        : 'bg-[#151c26] border-[#2b3a4c] text-[#64748b]'
                    }`}
                  >
                    {status === 'completed' ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-mono mt-1.5 font-semibold ${
                      status === 'current'
                        ? 'text-amber-400'
                        : status === 'completed'
                        ? 'text-emerald-400'
                        : 'text-[#64748b]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      getStepStatus(WORKFLOW_STEPS[idx + 1].state) === 'completed' ||
                      status === 'completed'
                        ? 'bg-[#059669]'
                        : 'bg-[#233140]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Append-only Demo Audit Trail */}
      <div className="border-t border-[#1e2a38] p-4 bg-[#0e131a]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono uppercase text-slate-200">
              APPEND-ONLY DEMO AUDIT TRAIL
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#151c26] text-[#7e90a5] border border-[#233140]">
              {incident.auditTrail.length} RECORDS
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">
            Audit events are retained for the current demo session.
          </span>
        </div>

        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {incident.auditTrail.map((ev) => (
            <div
              key={ev.id}
              className="bg-[#141b24] border border-[#223142] rounded p-3 text-xs font-mono"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#38bdf8] font-bold">{ev.timestamp}</span>
                  <span className="text-[#64748b]">•</span>
                  <span className="text-slate-100 font-bold">{ev.title}</span>
                </div>
                <span className="text-[10px] text-[#7e90a5] bg-[#0b0f15] px-1.5 py-0.5 rounded border border-[#1e2a38]">
                  {ev.actor}
                </span>
              </div>
              <p className="text-[#94a3b8] font-sans text-xs mt-0.5 leading-relaxed">
                {ev.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
