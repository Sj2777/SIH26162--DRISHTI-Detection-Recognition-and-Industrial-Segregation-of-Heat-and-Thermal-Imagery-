import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IncidentRecord, IncidentReport } from '../types';
import {
  fetchIncidentById,
  fetchEscalationConfig,
  acknowledgeIncident,
  performIncidentAction,
  submitIncidentEvidence,
  escalateIncident,
  resolveIncident,
  closeIncident,
  generateIncidentReport,
  updateEscalationConfig,
  startIncidentEscalationTimer,
} from '../services/api';
import { IncidentHeader } from '../components/incidents/IncidentHeader';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { IncidentActions } from '../components/incidents/IncidentActions';
import { EvidencePanel } from '../components/incidents/EvidencePanel';
import { IncidentResolution } from '../components/incidents/IncidentResolution';
import { IncidentReportPanel } from '../components/incidents/IncidentReportPanel';
import { RetryableError } from '../components/layout/RetryableError';
import { getUserFacingErrorMessage } from '../utils/errorMessage';

const AUTO_ESCALATION_REASON = 'AUTO-ESCALATED: No facility acknowledgement within configured response window.';

const formatCountdown = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

export const IncidentResponse: React.FC = () => {
  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<IncidentReport | null>(null);
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [responseWindowSeconds, setResponseWindowSeconds] = useState<number>(300);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [timerBusy, setTimerBusy] = useState<boolean>(false);
  const [timerError, setTimerError] = useState<string | null>(null);
  const incidentRequestId = useRef(0);
  const configRequestId = useRef(0);

  const timerCanRun = Boolean(
    incident &&
    !incident.acknowledgedAt &&
    incident.state !== 'ACKNOWLEDGED' &&
    !incident.escalatedAt &&
    incident.state !== 'ESCALATED' &&
    !incident.autoEscalated &&
    !incident.resolvedAt &&
    incident.state !== 'RESOLVED' &&
    !incident.closedAt &&
    incident.state !== 'CLOSED'
  );
  const countdownActive = Boolean(timerCanRun && incident?.ackDueAt);

  const loadIncident = useCallback(async () => {
    const currentRequestId = ++incidentRequestId.current;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidentById('ALT-2026-0891');
      if (currentRequestId === incidentRequestId.current) setIncident(data);
    } catch (err) {
      if (currentRequestId === incidentRequestId.current) {
        console.error('Error fetching incident record:', err);
        setError(
          getUserFacingErrorMessage(err, 'Incident workflow could not be loaded. Try again.')
        );
      }
    } finally {
      if (currentRequestId === incidentRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIncident();
    return () => {
      incidentRequestId.current += 1;
    };
  }, [loadIncident]);

  const loadEscalationConfig = useCallback(async () => {
    const currentRequestId = ++configRequestId.current;
    try {
      const config = await fetchEscalationConfig();
      if (currentRequestId === configRequestId.current) {
        setResponseWindowSeconds(config.responseWindowSeconds);
        setTimerError(null);
      }
    } catch (err) {
      if (currentRequestId === configRequestId.current) {
        setTimerError(
          getUserFacingErrorMessage(err, 'Demo timer configuration could not be loaded.')
        );
      }
    }
  }, []);

  useEffect(() => {
    void loadEscalationConfig();
    return () => {
      configRequestId.current += 1;
    };
  }, [loadEscalationConfig]);

  useEffect(() => {
    if (!incident || !countdownActive || !incident.ackDueAt) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const dueAt = Date.parse(incident.ackDueAt as string);
      setRemainingSeconds(Number.isFinite(dueAt)
        ? Math.max(0, Math.ceil((dueAt - Date.now()) / 1000))
        : null);
    };

    let mounted = true;
    let requestInFlight = false;
    const refreshIncident = async () => {
      if (!mounted || document.visibilityState !== 'visible' || requestInFlight) return;
      requestInFlight = true;
      try {
        const latest = await fetchIncidentById(incident.id);
        if (mounted) {
          setIncident(latest);
          setTimerError(null);
        }
      } catch (err) {
        if (mounted) {
          setTimerError(
            getUserFacingErrorMessage(err, 'Unable to refresh the simulated acknowledgement timer.')
          );
        }
      } finally {
        requestInFlight = false;
      }
    };

    const refreshTimer = () => {
      if (document.visibilityState !== 'visible') return;
      updateRemaining();
      void refreshIncident();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshTimer();
    };

    updateRemaining();
    const interval = window.setInterval(refreshTimer, 2000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [incident?.id, incident?.ackDueAt, countdownActive]);

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

  const handleGenerateReport = async () => {
    if (!incident) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const generatedReport = await generateIncidentReport(incident.id);
      setReport(generatedReport);
      setIncident((current) => current
        ? { ...current, auditTrail: generatedReport.timeline }
        : current);
    } catch (err) {
      setReportError(
        getUserFacingErrorMessage(err, 'Incident report could not be generated. Try again.')
      );
    } finally {
      setReportLoading(false);
    }
  };

  const handleRestartTimer = async () => {
    if (!incident || !timerCanRun) return;
    setTimerBusy(true);
    setTimerError(null);
    try {
      const config = await updateEscalationConfig(responseWindowSeconds);
      setResponseWindowSeconds(config.responseWindowSeconds);
      const updated = await startIncidentEscalationTimer(incident.id);
      setIncident(updated);
    } catch (err) {
      setTimerError(getUserFacingErrorMessage(err, 'Demo timer could not be restarted.'));
    } finally {
      setTimerBusy(false);
    }
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
        <RetryableError
          title="Incident workflow unavailable"
          message={error}
          retrying={loading}
          onRetry={() => void loadIncident()}
        />
      )}

      {!loading && !error && !incident && (
        <p className="rounded border border-[#233140] bg-[#121820] p-6 text-center text-xs text-[#94a3b8]">
          No incident record is available.
        </p>
      )}

      {incident && (
        <>
          {/* 1. Header with Snapshot Summary */}
          <IncidentHeader incident={incident} />

          {incident.autoEscalated && (
            <div role="alert" className="bg-[#450a0a]/80 border border-[#dc2626] rounded p-4">
              <p className="text-sm font-bold font-mono uppercase text-red-300">AUTO-ESCALATED</p>
              <p className="text-xs font-mono text-red-100 mt-1">
                {incident.escalationDetails?.reason || AUTO_ESCALATION_REASON}
              </p>
              <p className="text-[11px] font-mono text-red-200/80 mt-2">
                This is a demo handoff; no external notification is sent.
              </p>
            </div>
          )}

          <section className="bg-[#121820] border border-[#233140] rounded p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-xs font-bold font-mono uppercase text-slate-200">Demo timer (simulated)</h2>
                {countdownActive && remainingSeconds !== null && (
                  <p role="status" className="text-sm font-mono text-amber-300 mt-2">
                    Acknowledgement due in {formatCountdown(remainingSeconds)}
                  </p>
                )}
                {!timerCanRun && !incident.autoEscalated && (
                  <p className="text-[11px] font-mono text-[#7e90a5] mt-2">
                    Timer unavailable after acknowledgement, escalation, resolution, or closure.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <label className="text-[10px] font-mono uppercase text-[#9aabba]">
                  Response window (seconds)
                  <input
                    type="number"
                    min={5}
                    max={3600}
                    step={1}
                    value={responseWindowSeconds}
                    onChange={(event) => setResponseWindowSeconds(Number(event.target.value))}
                    disabled={!timerCanRun || timerBusy}
                    className="block w-28 mt-1 bg-[#0b0f15] border border-[#334155] rounded px-2 py-1.5 text-xs text-white disabled:opacity-50"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRestartTimer}
                  disabled={!timerCanRun || timerBusy || !Number.isInteger(responseWindowSeconds) || responseWindowSeconds < 5 || responseWindowSeconds > 3600}
                  className="px-3 py-2 bg-[#1d4ed8] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-[11px] font-mono font-semibold transition-colors"
                >
                  {timerBusy ? 'Updating...' : 'Save window and restart'}
                </button>
              </div>
            </div>
            {timerError && (
              <div role="alert" className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-mono text-red-300">
                <span>{timerError}</span>
                <button
                  type="button"
                  onClick={() => {
                    void loadEscalationConfig();
                    void loadIncident();
                  }}
                  className="rounded border border-red-800 px-2 py-1 hover:bg-red-950"
                >
                  Retry timer data
                </button>
              </div>
            )}
          </section>

          <IncidentReportPanel
            report={report}
            loading={reportLoading}
            error={reportError}
            onGenerate={handleGenerateReport}
          />

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
