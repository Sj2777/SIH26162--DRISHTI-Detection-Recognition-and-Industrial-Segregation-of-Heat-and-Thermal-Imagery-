import React from 'react';
import { TelemetryAsset } from '../../types';

interface SelectedAssetMetricsProps {
  asset: TelemetryAsset;
}

export const SelectedAssetMetrics: React.FC<SelectedAssetMetricsProps> = ({ asset }) => {
  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden">
      {/* Header */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-slate-100 uppercase font-mono">
              CHANNEL TELEMETRY DIAGNOSTIC
            </span>
            <span className="text-[#3b4c60] text-xs">/</span>
            <span className="text-xs font-bold text-[#38bdf8] uppercase">
              {asset.assetName}
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#7e90a5] mt-0.5">
            Node ID: {asset.assetId} • Classification: {asset.assetType}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#7e90a5]">OPERATING STATE:</span>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
              asset.status === 'CRITICAL'
                ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                : asset.status === 'WARNING'
                ? 'bg-[#451a03] text-[#fcd34d] border-[#b45309]'
                : 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
            }`}
          >
            {asset.status}
          </span>
        </div>
      </div>

      {/* Grid of 8 Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {/* 1. Temperature */}
        <div
          className={`border rounded p-3 flex flex-col justify-between ${
            asset.temperature.status === 'HIGH'
              ? 'bg-[#291316]/50 border-[#7f1d1d]'
              : 'bg-[#151c26] border-[#223142]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Temperature</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                asset.temperature.status === 'HIGH'
                  ? 'bg-[#dc2626] text-white'
                  : 'bg-[#064e3b] text-[#34d399]'
              }`}
            >
              {asset.temperature.status || 'NORMAL'}
            </span>
          </div>
          <div className="my-2">
            <span
              className={`text-xl font-bold font-mono ${
                asset.temperature.status === 'HIGH' ? 'text-[#ef4444]' : 'text-slate-100'
              }`}
            >
              {asset.temperature.value.toFixed(1)} {asset.temperature.unit}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">
            Normal: {asset.temperature.normalMin}–{asset.temperature.normalMax} {asset.temperature.unit}
          </div>
        </div>

        {/* 2. Pressure */}
        <div
          className={`border rounded p-3 flex flex-col justify-between ${
            asset.pressure.status === 'HIGH'
              ? 'bg-[#291316]/50 border-[#7f1d1d]'
              : 'bg-[#151c26] border-[#223142]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Pressure</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                asset.pressure.status === 'HIGH'
                  ? 'bg-[#dc2626] text-white'
                  : 'bg-[#064e3b] text-[#34d399]'
              }`}
            >
              {asset.pressure.status || 'NORMAL'}
            </span>
          </div>
          <div className="my-2">
            <span
              className={`text-xl font-bold font-mono ${
                asset.pressure.status === 'HIGH' ? 'text-[#ef4444]' : 'text-slate-100'
              }`}
            >
              {asset.pressure.value.toFixed(1)} {asset.pressure.unit}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">
            Normal: {asset.pressure.normalMin}–{asset.pressure.normalMax} {asset.pressure.unit}
          </div>
        </div>

        {/* 3. Gas Concentration */}
        <div
          className={`border rounded p-3 flex flex-col justify-between ${
            asset.gas.status === 'HIGH'
              ? 'bg-[#291316]/50 border-[#7f1d1d]'
              : 'bg-[#151c26] border-[#223142]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Gas Concentration</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                asset.gas.status === 'HIGH'
                  ? 'bg-[#dc2626] text-white'
                  : 'bg-[#064e3b] text-[#34d399]'
              }`}
            >
              {asset.gas.status || 'NORMAL'}
            </span>
          </div>
          <div className="my-2">
            <span
              className={`text-xl font-bold font-mono ${
                asset.gas.status === 'HIGH' ? 'text-[#ef4444]' : 'text-slate-100'
              }`}
            >
              {asset.gas.value.toFixed(1)} {asset.gas.unit}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">
            Normal: &lt;{asset.gas.normalMax} {asset.gas.unit}
          </div>
        </div>

        {/* 4. Flow */}
        <div className="bg-[#151c26] border border-[#223142] rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Volumetric Flow</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#064e3b] text-[#34d399]">
              NOMINAL
            </span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold font-mono text-slate-100">
              {asset.flow.value.toFixed(0)} {asset.flow.unit}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">Continuous flow loop</div>
        </div>

        {/* 5. Vibration */}
        <div
          className={`border rounded p-3 flex flex-col justify-between ${
            asset.vibration.status === 'HIGH'
              ? 'bg-[#291316]/50 border-[#7f1d1d]'
              : 'bg-[#151c26] border-[#223142]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Vibration</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                asset.vibration.status === 'HIGH'
                  ? 'bg-[#b45309] text-white'
                  : 'bg-[#064e3b] text-[#34d399]'
              }`}
            >
              {asset.vibration.status || 'NORMAL'}
            </span>
          </div>
          <div className="my-2">
            <span
              className={`text-xl font-bold font-mono ${
                asset.vibration.status === 'HIGH' ? 'text-[#f59e0b]' : 'text-slate-100'
              }`}
            >
              {asset.vibration.value.toFixed(1)} {asset.vibration.unit}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">
            Normal: &lt;{asset.vibration.normalMax} {asset.vibration.unit}
          </div>
        </div>

        {/* 6. Valve State */}
        <div className="bg-[#151c26] border border-[#223142] rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Valve State</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#1e293b] text-[#38bdf8]">
              ACTUATED
            </span>
          </div>
          <div className="my-2">
            <span className="text-xl font-bold font-mono text-slate-100">
              {asset.valveState}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">Interlock verified</div>
        </div>

        {/* 7. Smoke / Flame */}
        <div className="bg-[#151c26] border border-[#223142] rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Smoke / Flame</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#064e3b] text-[#34d399]">
              UV/IR SENSOR
            </span>
          </div>
          <div className="my-2">
            <span className="text-base font-bold font-mono text-[#10b981]">
              {asset.smokeFlame.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">Optical detector clean</div>
        </div>

        {/* 8. Equipment Mode */}
        <div className="bg-[#151c26] border border-[#223142] rounded p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#7e90a5]">Equipment Mode</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#1e293b] text-[#94a3b8]">
              LOGIC
            </span>
          </div>
          <div className="my-2">
            <span className="text-base font-bold font-mono text-slate-200">
              {asset.equipmentMode}
            </span>
          </div>
          <div className="text-[10px] font-mono text-[#64748b]">DCS profile active</div>
        </div>
      </div>
    </div>
  );
};
