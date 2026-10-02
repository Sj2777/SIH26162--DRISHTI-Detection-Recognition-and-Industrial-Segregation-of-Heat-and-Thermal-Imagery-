import React, { useEffect, useState } from 'react';
import { IncidentRecord } from '../types';
import {
  fetchIncidentById,
  acknowledgeIncident,
  performIncidentAction,
  submitIncidentEvidence,
  escalateIncident,
  resolveIncident,
  closeIncident,
} from '../services/api';
import { IncidentHeader } from '../components/incidents/IncidentHeader';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { IncidentActions } from '../components/incidents/IncidentActions';
import { EvidencePanel } from '../components/incidents/EvidencePanel';
import { IncidentResolution } from '../components/incidents/IncidentResolution';

export const IncidentResponse: React.FC = () => {
  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncident = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidentById('ALT-2026-0891');
      setIncident(data);
    } catch (err) {
      console.error('Error fetching incident record:', err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve incident workflow record');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, []);

  const handleAcknowledge = async () => {
    if (!incident) return;
    const updated = await acknowledgeIncident(incident.id);
    setIncident(updated);
  };

  const handleAction = async (type: string, note: string) => {
    if (!incident) return;
    const updated = await performIncidentAction(incident.id, type, note);
    setIncident(updated);
  };

  const handleSubmitEvidence = async (type: string, description: string, source: string) => {
    if (!incident) return;
    const updated = await submitIncidentEvidence(incident.id, type, description, source);
    setIncident(updated);
  };

  const handleEscalate = async (reason: string) => {
    if (!incident) return;
    const updated = await escalateIncident(incident.id, reason);
    setIncident(updated);
  };

  const handleResolve = async (details: {
    observedFinding: string;
    rootCause: string;
    correctiveAction: string;
    resolution: string;
  }) => {
    if (!incident) return;
    const updated = await resolveIncident(incident.id, details);
    setIncident(updated);
  };

  const handleClose = async (details: {
    rootCause: string;
    correctiveAction: string;
    closureNote: string;
  }) => {
    if (!incident) return;
    const updated = await closeIncident(incident.id, details);
    setIncident(updated);
  };

  const handleScrollToEvidence = () => {
    const el = document.getElementById('facility-evidence-panel');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToResolve = () => {
    const el = document.getElementById('incident-resolution-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Loading state */}
      {loading && !incident && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[#ef4444] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono text-[#7e90a5]">
            Loading Government Incident ALT-2026-0891 Response Workflow...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-[#450a0a]/80 border border-[#dc2626] rounded p-4 text-xs font-mono text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-400">WORKFLOW ERROR:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadIncident()}
            className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-[11px] font-semibold tracking-wider uppercase transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {incident && (
        <>
          {/* 1. Header with Snapshot Summary */}
          <IncidentHeader incident={incident} />

          {/* 2. Interactive Operator Action Console */}
          <IncidentActions
            incident={incident}
            onAcknowledge={handleAcknowledge}
            onAction={handleAction}
            onEscalate={handleEscalate}
            onAddEvidenceClick={handleScrollToEvidence}
            onResolveClick={handleScrollToResolve}
          />

          {/* 3. Workflow Stepper & Demo Audit Timeline */}
          <IncidentTimeline incident={incident} />

          {/* 4. Facility Evidence Panel */}
          <div id="facility-evidence-panel">
            <EvidencePanel
              evidenceList={incident.evidenceList || []}
              onSubmitEvidence={handleSubmitEvidence}
            />
          </div>

          {/* 5. Incident Resolution & Closure Console */}
          <div id="incident-resolution-section">
            <IncidentResolution
              incident={incident}
              onResolve={handleResolve}
              onClose={handleClose}
            />
          </div>

          {/* 6. Demo Governance Disclaimer */}
          <div className="bg-[#10141b] border border-[#1e2a38] rounded p-3 text-center text-xs font-mono text-[#64748b]">
            <span className="text-amber-400 font-bold uppercase tracking-wider mr-2">
              REGULATORY GOVERNANCE NOTICE:
            </span>
            <span>
              All incident actions, district escalations, and evidence entries are simulated for this demonstration. Deletion or suppression of regulatory records is prohibited by protocol.
            </span>
          </div>
        </>
      )}
    </div>
  );
};
