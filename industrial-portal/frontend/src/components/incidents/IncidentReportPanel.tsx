import React from 'react';
import { IncidentReport } from '../../types';

interface IncidentReportPanelProps {
  report: IncidentReport | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
}

const DEMO_REPORT_LABEL = 'Demo report - generated from in-memory demo session data';

const buildMarkdown = (report: IncidentReport): string => {
  const lines = [
    '# Incident / Root-Cause Report',
    '',
    DEMO_REPORT_LABEL,
    '',
    `**Incident ID:** ${report.incidentId}`,
    `**Report status:** ${report.reportStatus}`,
    `**Generated at:** ${report.generatedAt}`,
    '',
    '## Facility and asset',
    `- Facility: ${report.facilityAndAsset.facilityName}`,
    `- Facility type: ${report.facilityAndAsset.facilityType}`,
    `- Facility location: ${report.facilityAndAsset.facilityLocation}`,
    `- Facility coordinates: ${report.facilityAndAsset.facilityCoordinates}`,
    `- Asset ID: ${report.facilityAndAsset.assetId}`,
    `- Asset name: ${report.facilityAndAsset.assetName}`,
    `- Asset type: ${report.facilityAndAsset.assetType}`,
    `- Asset status / risk: ${report.facilityAndAsset.assetStatus} / ${report.facilityAndAsset.assetRisk}`,
    `- Asset condition: ${report.facilityAndAsset.assetCondition}`,
    `- Asset coordinates: ${report.facilityAndAsset.assetCoordinates}`,
    '',
    '## Thermal observation',
    `- Type / severity: ${report.thermalObservation.type} / ${report.thermalObservation.severity}`,
    `- Intensity / baseline: ${report.thermalObservation.intensity} / ${report.thermalObservation.baseline}`,
    `- Detected at: ${report.thermalObservation.detectedAt}`,
    `- Location shift: ${report.thermalObservation.locationShift}`,
    `- Source / classification: ${report.thermalObservation.source} / ${report.thermalObservation.classification}`,
    `- Coordinates: ${report.thermalObservation.coordinates}`,
    `- Recommended action: ${report.thermalObservation.recommendedAction}`,
    '',
    '## Telemetry evidence',
    `- Observation time: ${report.telemetryEvidence.timestamp}`,
    `- Asset: ${report.telemetryEvidence.assetName} (${report.telemetryEvidence.assetId})`,
    `- Temperature: ${report.telemetryEvidence.temperature} (${report.telemetryEvidence.temperatureStatus})`,
    `- Gas: ${report.telemetryEvidence.gas} (${report.telemetryEvidence.gasStatus})`,
    `- Pressure: ${report.telemetryEvidence.pressure} (${report.telemetryEvidence.pressureStatus})`,
    `- Flow: ${report.telemetryEvidence.flow}`,
    `- Vibration: ${report.telemetryEvidence.vibration} (${report.telemetryEvidence.vibrationStatus})`,
    `- Smoke / flame: ${report.telemetryEvidence.smokeFlame}`,
    `- Valve state / equipment mode: ${report.telemetryEvidence.valveState} / ${report.telemetryEvidence.equipmentMode}`,
    `- SCADA alarm / maintenance state: ${report.telemetryEvidence.scadaAlarm} / ${report.telemetryEvidence.maintenanceState}`,
    `- Interpretation: ${report.telemetryEvidence.interpretation}`,
    '',
    '## Timeline',
    ...report.timeline.map((entry) => `- ${entry.timestamp} | ${entry.actor} | ${entry.title}: ${entry.description}`),
    '',
    '## Actions taken',
    ...report.actionsTaken.map((action) => `- ${action}`),
    '',
    '## Uploaded evidence',
    ...report.uploadedEvidence.map((item) => `- ${item}`),
    '',
    '## Escalation status',
    `- Status: ${report.escalationStatus.status}`,
    `- Target: ${report.escalationStatus.target}`,
    `- Reason: ${report.escalationStatus.reason}`,
    `- Escalated at: ${report.escalationStatus.escalatedAt}`,
    `- Note: ${report.escalationStatus.note}`,
    '',
    '## Root cause and corrective action',
    `- Root cause: ${report.rootCause}`,
    `- Corrective action: ${report.correctiveAction}`,
    '',
    '## Final resolution',
    report.finalResolution,
    '',
    `**${DEMO_REPORT_LABEL}**`,
    '',
  ];
  return lines.join('\n');
};

export const IncidentReportPanel: React.FC<IncidentReportPanelProps> = ({
  report,
  loading,
  error,
  onGenerate,
}) => {
  const handleDownload = () => {
    if (!report) return;
    const blob = new Blob([buildMarkdown(report)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeIncidentId = report.incidentId.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.download = `incident-report-${safeIncidentId}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#121820] border border-[#233140] rounded p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold font-mono text-slate-100">Incident report</h2>
          <p className="text-[11px] font-mono text-[#7e90a5] mt-1">Root-cause summary from this demo incident</p>
        </div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-wait text-[#111827] rounded text-xs font-bold font-mono transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {loading && (
        <p role="status" className="text-xs font-mono text-amber-300">Building report from incident and fixture data...</p>
      )}

      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 bg-[#450a0a]/70 border border-[#dc2626] rounded p-3 text-xs font-mono text-red-200">
          <span>Report generation failed: {error}</span>
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="rounded border border-red-700 px-2 py-1 font-semibold hover:bg-red-900 disabled:opacity-60"
          >
            Retry report generation
          </button>
        </div>
      )}

      {report && (
        <article id="incident-report-print" className="border border-[#293849] rounded bg-[#0d131a] p-5 space-y-5 text-slate-200">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #incident-report-print, #incident-report-print * { visibility: visible !important; }
              #incident-report-print {
                position: absolute;
                inset: 0;
                width: 100%;
                color: #111 !important;
                background: #fff !important;
                border: 0 !important;
                box-shadow: none !important;
              }
              #incident-report-print * {
                color: #111 !important;
                background: #fff !important;
                border-color: #bbb !important;
                box-shadow: none !important;
              }
              #incident-report-print .report-actions { display: none !important; }
              #incident-report-print .report-section { break-inside: avoid; }
            }
          `}</style>

          <div className="report-actions flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 border border-[#405268] hover:border-slate-300 text-slate-100 rounded text-xs font-mono transition-colors"
            >
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-2 border border-[#405268] hover:border-slate-300 text-slate-100 rounded text-xs font-mono transition-colors"
            >
              Download .md
            </button>
          </div>

          <header className="border-b border-[#293849] pb-4">
            <p className="text-[10px] font-bold font-mono uppercase text-amber-300">{DEMO_REPORT_LABEL}</p>
            <h3 className="text-xl font-bold font-mono text-white mt-2">Incident / Root-Cause Report</h3>
            <p className="text-xs font-mono mt-2">Incident ID: {report.incidentId}</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-[#9aabba] mt-2">
              <span>Status: {report.reportStatus}</span>
              <span>Generated: {report.generatedAt}</span>
            </div>
          </header>

          <ReportSection title="Facility and asset">
            <ReportRow label="Facility" value={`${report.facilityAndAsset.facilityName} (${report.facilityAndAsset.facilityType})`} />
            <ReportRow label="Facility location / coordinates" value={`${report.facilityAndAsset.facilityLocation} / ${report.facilityAndAsset.facilityCoordinates}`} />
            <ReportRow label="Asset" value={`${report.facilityAndAsset.assetName} (${report.facilityAndAsset.assetId})`} />
            <ReportRow label="Asset type / status / risk" value={`${report.facilityAndAsset.assetType} / ${report.facilityAndAsset.assetStatus} / ${report.facilityAndAsset.assetRisk}`} />
            <ReportRow label="Asset condition / coordinates" value={`${report.facilityAndAsset.assetCondition} / ${report.facilityAndAsset.assetCoordinates}`} />
          </ReportSection>

          <ReportSection title="Thermal observation">
            <ReportRow label="Type / severity" value={`${report.thermalObservation.type} / ${report.thermalObservation.severity}`} />
            <ReportRow label="Intensity / baseline" value={`${report.thermalObservation.intensity} / ${report.thermalObservation.baseline}`} />
            <ReportRow label="Detected / source" value={`${report.thermalObservation.detectedAt} / ${report.thermalObservation.source}`} />
            <ReportRow label="Classification / coordinates" value={`${report.thermalObservation.classification} / ${report.thermalObservation.coordinates}`} />
            <ReportRow label="Location shift / recommended action" value={`${report.thermalObservation.locationShift} / ${report.thermalObservation.recommendedAction}`} />
          </ReportSection>

          <ReportSection title="Telemetry evidence">
            <ReportRow label="Telemetry time / asset" value={`${report.telemetryEvidence.timestamp} / ${report.telemetryEvidence.assetName} (${report.telemetryEvidence.assetId})`} />
            <ReportRow label="Temperature / status" value={`${report.telemetryEvidence.temperature} / ${report.telemetryEvidence.temperatureStatus}`} />
            <ReportRow label="Gas / status" value={`${report.telemetryEvidence.gas} / ${report.telemetryEvidence.gasStatus}`} />
            <ReportRow label="Pressure / status" value={`${report.telemetryEvidence.pressure} / ${report.telemetryEvidence.pressureStatus}`} />
            <ReportRow label="Flow / vibration / status" value={`${report.telemetryEvidence.flow} / ${report.telemetryEvidence.vibration} / ${report.telemetryEvidence.vibrationStatus}`} />
            <ReportRow label="Smoke/flame / valve / equipment mode" value={`${report.telemetryEvidence.smokeFlame} / ${report.telemetryEvidence.valveState} / ${report.telemetryEvidence.equipmentMode}`} />
            <ReportRow label="SCADA / maintenance" value={`${report.telemetryEvidence.scadaAlarm} / ${report.telemetryEvidence.maintenanceState}`} />
            <ReportRow label="Interpretation" value={report.telemetryEvidence.interpretation} />
          </ReportSection>

          <ReportSection title="Timeline">
            <ul className="space-y-2">
              {report.timeline.map((entry) => (
                <li key={entry.id} className="border-l-2 border-[#405268] pl-3">
                  <p className="text-xs font-mono text-cyan-300">{entry.timestamp} · {entry.actor} · {entry.title}</p>
                  <p className="text-xs text-[#aab8c7] mt-1">{entry.description}</p>
                </li>
              ))}
            </ul>
          </ReportSection>

          <ReportSection title="Actions taken">
            <StringList values={report.actionsTaken} />
          </ReportSection>

          <ReportSection title="Uploaded evidence">
            <StringList values={report.uploadedEvidence} />
          </ReportSection>

          <ReportSection title="Escalation status">
            <ReportRow label="Status / target" value={`${report.escalationStatus.status} / ${report.escalationStatus.target}`} />
            <ReportRow label="Reason" value={report.escalationStatus.reason} />
            <ReportRow label="Escalated at / note" value={`${report.escalationStatus.escalatedAt} / ${report.escalationStatus.note}`} />
          </ReportSection>

          <ReportSection title="Root cause and corrective action">
            <ReportRow label="Root cause" value={report.rootCause} />
            <ReportRow label="Corrective action" value={report.correctiveAction} />
          </ReportSection>

          <ReportSection title="Final resolution">
            <p className="text-sm text-[#cbd5e1]">{report.finalResolution}</p>
          </ReportSection>
        </article>
      )}
    </div>
  );
};

const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="report-section border border-[#263646] rounded p-3 space-y-2">
    <h4 className="text-xs font-bold font-mono uppercase tracking-wide text-slate-100">{title}</h4>
    {children}
  </section>
);

const ReportRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <p className="text-xs leading-relaxed">
    <span className="text-[#8292a5]">{label}: </span>
    <span className="text-[#d6dee8]">{value}</span>
  </p>
);

const StringList: React.FC<{ values: string[] }> = ({ values }) => (
  <ul className="list-disc pl-5 space-y-1 text-xs text-[#cbd5e1]">
    {values.map((value, index) => <li key={`${index}-${value}`}>{value}</li>)}
  </ul>
);