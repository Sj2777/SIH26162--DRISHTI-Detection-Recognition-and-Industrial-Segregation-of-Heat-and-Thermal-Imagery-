import React from 'react';
import { FacilityData } from '../../types';

interface HeaderProps {
  facility: FacilityData | null;
  activeTab: 'overview' | 'thermal' | 'telemetry' | 'health' | 'incident';
  onTabChange: (tab: 'overview' | 'thermal' | 'telemetry' | 'health' | 'incident') => void;
}

export const Header: React.FC<HeaderProps> = ({ facility, activeTab, onTabChange }) => {
  return (
    <header className="border-b border-[#223142] bg-[#111721] px-5 py-2.5 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding, Facility Name & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-[#1e2a3b] border border-[#ff5722]/50 text-[#ff5722] font-black text-xs tracking-wider shadow-inner">
              AV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-[#f97316] uppercase">
                  AGNI-VISION
                </span>
                <span className="text-[#3b4c60] text-xs">/</span>
                <span className="text-xs text-[#94a3b8] font-medium tracking-wide">
                  Industrial Safety Portal
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <h1 className="text-sm md:text-base font-semibold text-slate-100 tracking-tight">
                  {facility ? facility.facilityName : 'Loading Facility...'}
                </h1>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#064e3b]/40 text-[#34d399] border border-[#059669]/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                  MONITORING ACTIVE
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Mode Selector */}
          <nav className="flex items-center bg-[#0b0f15] border border-[#1e2a38] p-1 rounded">
            <button
              onClick={() => onTabChange('overview')}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors ${
                activeTab === 'overview'
                  ? 'bg-[#1e293b] text-white border border-[#3b82f6]/40 shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => onTabChange('thermal')}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'thermal'
                  ? 'bg-[#2a1b14] text-[#fb923c] border border-[#f97316]/50 shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></span>
              THERMAL INTELLIGENCE
            </button>
            <button
              onClick={() => onTabChange('telemetry')}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'telemetry'
                  ? 'bg-[#132338] text-[#38bdf8] border border-[#0284c7]/50 shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7]"></span>
              LIVE TELEMETRY
            </button>
            <button
              onClick={() => onTabChange('health')}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'health'
                  ? 'bg-[#2b1c11] text-[#fcd34d] border border-[#f59e0b]/50 shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
              ASSET HEALTH
            </button>
            <button
              onClick={() => onTabChange('incident')}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'incident'
                  ? 'bg-[#311116] text-[#fca5a5] border border-[#ef4444]/60 shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse"></span>
              INCIDENT RESPONSE
            </button>
          </nav>
        </div>

        {/* Right: Operational Telemetry Stream */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#0b0f15] border border-[#1e2a38] px-2.5 py-1.5 rounded flex items-center gap-2">
            <span className="text-[#64748b]">SATELLITE:</span>
            <span className="text-slate-200 font-semibold">
              {facility?.satelliteUpdate ?? '--'}
            </span>
          </div>

          <div className="bg-[#0b0f15] border border-[#1e2a38] px-2.5 py-1.5 rounded flex items-center gap-2">
            <span className="text-[#64748b]">TELEMETRY:</span>
            <span className="text-slate-200 font-semibold">
              {facility?.telemetryUpdate ?? '--'}
            </span>
          </div>

          <div className="bg-[#0b0f15] border border-[#1e2a38] px-2.5 py-1.5 rounded flex items-center gap-2">
            <span className="text-[#64748b]">DATA QUALITY:</span>
            <span className="text-[#10b981] font-semibold">
              {facility ? `${facility.dataQuality}%` : '--'}
            </span>
          </div>

          <div className="hidden sm:flex bg-[#0b0f15] border border-[#1e2a38] px-2.5 py-1.5 rounded items-center gap-2">
            <span className="text-[#64748b]">WIND:</span>
            <span className="text-slate-200 font-semibold">
              {facility ? `${facility.wind.direction} ${facility.wind.speed}` : '--'}
            </span>
          </div>

          <a href="/" className="bg-[#ef4444]/10 border border-[#ef4444]/40 hover:bg-[#ef4444]/20 text-[#ef4444] px-3 py-1.5 rounded font-bold uppercase tracking-wider transition-colors no-underline">
            Log Out
          </a>
        </div>
      </div>
    </header>
  );
};
