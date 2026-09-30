import React from 'react';
import { FacilityData } from '../../types';

interface KpiCardsProps {
  facility: FacilityData | null;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ facility }) => {
  if (!facility) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#121820] border border-[#1e2a38] rounded p-3 h-20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Overall Risk */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Overall Risk
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span
            className={`text-xl font-bold tracking-tight ${
              facility.overallRisk === 'HIGH'
                ? 'text-[#ef4444]'
                : facility.overallRisk === 'MEDIUM'
                ? 'text-[#f59e0b]'
                : 'text-[#10b981]'
            }`}
          >
            {facility.overallRisk}
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] animate-ping" />
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Industrial severity rating</span>
      </div>

      {/* 2. Active Thermal Events */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Thermal Events
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#f97316]">
            {facility.activeThermalEvents}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded font-mono bg-[#431407]/60 text-[#fb923c] border border-[#9a3412]/50">
            ACTIVE
          </span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Exceeding baseline</span>
      </div>

      {/* 3. Open Maintenance Anomalies */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Maint. Anomalies
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#f59e0b]">
            {facility.openMaintenanceAnomalies}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded font-mono bg-[#451a03]/50 text-[#fcd34d] border border-[#b45309]/50">
            OPEN
          </span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Requires inspection</span>
      </div>

      {/* 4. Unresolved Alerts */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Unresolved Alerts
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#ef4444]">
            {facility.unresolvedAlerts}
          </span>
          <span className="text-[11px] px-1.5 py-0.5 rounded font-mono bg-[#450a0a]/60 text-[#fca5a5] border border-[#dc2626]/50">
            PENDING
          </span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Priority queue</span>
      </div>

      {/* 5. Operating Mode */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Operating Mode
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold tracking-tight text-[#10b981]">
            {facility.operatingMode}
          </span>
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Standard run profile</span>
      </div>

      {/* 6. Data Quality */}
      <div className="bg-[#131922] border border-[#233140] rounded p-3 flex flex-col justify-between">
        <span className="text-[11px] font-medium tracking-wider text-[#7e90a5] uppercase">
          Data Quality
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-xl font-bold font-mono text-[#38bdf8]">
            {facility.dataQuality}%
          </span>
          <span className="text-[11px] font-mono text-[#0284c7]">STABLE</span>
        </div>
        <span className="text-[10px] text-[#55697d] mt-1">Telemetry integrity</span>
      </div>
    </div>
  );
};
