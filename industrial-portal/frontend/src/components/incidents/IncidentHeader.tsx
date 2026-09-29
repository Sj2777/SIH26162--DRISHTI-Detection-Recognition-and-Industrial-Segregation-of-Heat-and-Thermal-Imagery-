import React from 'react';
import { IncidentRecord } from '../../types';

interface IncidentHeaderProps {
  incident: IncidentRecord;
}

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({ incident }) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden mb-6">
      {/* Top Banner */}
      <div className="bg-[#191114] border-b border-[#3b171e] px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping"></span>
            <h1 className="text-sm md:text-base font-bold tracking-wider text-slate-100 uppercase font-mono">
              INCIDENT RESPONSE
            </h1>
            <span className="text-[#3b4c60] text-xs">/</span>
            <span className="text-xs font-mono font-bold text-[#fca5a5]">
              ALERT ID: {incident.alertId}
            </span>
          </div>
          <p className="text-xs text-[#7e90a5] mt-0.5">
            Facility response and verification workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded bg-[#450a0a] text-[#fca5a5] border border-[#dc2626] text-xs font-mono font-bold">
            {incident.severity} SEVERITY
          </span>

          <span
            className={`px-3 py-1 rounded text-xs font-mono font-bold border ${
              incident.state === 'CLOSED'
                ? 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
                : incident.state === 'RESOLVED'
                ? 'bg-[#0284c7]/30 text-[#38bdf8] border-[#0284c7]'
                : incident.state === 'ESCALATED'
                ? 'bg-[#451a03] text-[#fcd34d] border-[#b45309]'
                : incident.state === 'INSPECTION'
                ? 'bg-[#0b2416] text-[#6ee7b7] border-[#059669]'
                : incident.state === 'INVESTIGATING'
                ? 'bg-[#291e0a] text-amber-300 border-[#78350f]'
                : incident.state === 'ACKNOWLEDGED'
                ? 'bg-[#0c2333] text-[#38bdf8] border-[#0284c7]'
                : 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
            }`}
          >
            STATUS: {incident.state}
          </span>

          <span className="hidden sm:inline-block px-2.5 py-1 rounded bg-[#1e293b] text-[#38bdf8] border border-[#0284c7]/40 text-xs font-mono font-semibold">
            FACILITY RESPONSE CONSOLE
          </span>
        </div>
      </div>

      {/* Target Asset & Core Telemetry Summary Grid */}
      <div className="p-4 bg-[#0e131a]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="text-xs font-mono font-bold text-slate-200">
            IMPACTED ASSET: <span className="text-amber-400">{incident.assetName}</span>{' '}
            <span className="text-[#64748b]">({incident.assetId} • {incident.assetType})</span>
          </div>
          <div className="text-[11px] font-mono text-[#7e90a5]">
            DETECTION: {incident.detection.intensity} ({incident.detection.locationShift}) @ {incident.detection.detectedAt}
          </div>
        </div>

        {/* Diagnostic Snapshot of signals that triggered the alert */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono">
          {/* Thermal */}
          <div className="bg-[#1f1114] border border-[#521b23] p-2 rounded">
            <span className="text-[10px] text-[#fca5a5] block uppercase">Thermal Deviation</span>
            <span className="font-bold text-[#ef4444] text-sm">2.7× BASELINE</span>
          </div>

          {/* Temperature */}
          <div className="bg-[#1f1114] border border-[#521b23] p-2 rounded">
            <span className="text-[10px] text-[#fca5a5] block uppercase">Temperature</span>
            <span className="font-bold text-[#ef4444] text-sm">86.4 °C</span>
          </div>

          {/* Gas */}
          <div className="bg-[#1f1114] border border-[#521b23] p-2 rounded">
            <span className="text-[10px] text-[#fca5a5] block uppercase">Gas Concentration</span>
            <span className="font-bold text-[#ef4444] text-sm">18.7 ppm</span>
          </div>

          {/* Pressure */}
          <div className="bg-[#121924] border border-[#233345] p-2 rounded">
            <span className="text-[10px] text-[#7e90a5] block uppercase">Pressure</span>
            <span className="font-bold text-slate-100 text-sm">3.8 bar — NORMAL</span>
          </div>

          {/* Vibration */}
          <div className="bg-[#121924] border border-[#233345] p-2 rounded">
            <span className="text-[10px] text-[#7e90a5] block uppercase">Vibration</span>
            <span className="font-bold text-slate-100 text-sm">2.1 mm/s — NORMAL</span>
          </div>

          {/* SCADA */}
          <div className="bg-[#1f1114] border border-[#521b23] p-2 rounded">
            <span className="text-[10px] text-[#fca5a5] block uppercase">SCADA Alarm</span>
            <span className="font-bold text-[#ef4444] text-xs">HIGH TEMPERATURE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
