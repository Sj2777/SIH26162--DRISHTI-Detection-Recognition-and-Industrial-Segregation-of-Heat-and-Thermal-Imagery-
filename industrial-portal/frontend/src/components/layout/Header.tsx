import React from 'react';
import { FacilityData } from '../../types';

interface HeaderProps {
  facility: FacilityData | null;
  activeTab: 'overview' | 'thermal' | 'telemetry' | 'health' | 'incident';
  onTabChange: (tab: 'overview' | 'thermal' | 'telemetry' | 'health' | 'incident') => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ facility, activeTab, onTabChange, onLogout }) => {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'rgba(14, 17, 23, 0.92)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.12)',
      padding: '8px 20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
    }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

        {/* Left: Logo + Nav */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, rgba(255,69,0,0.2), rgba(249,115,22,0.2))',
              border: '1px solid rgba(255,69,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 11, color: '#f97316', letterSpacing: 1
            }}>AV</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#f97316', textTransform: 'uppercase' }}>AGNI-VISION</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>/</span>
                <span style={{ fontFamily: 'Lexend, sans-serif', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Industrial Portal</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <h1 style={{ margin: 0, fontFamily: 'Lexend, sans-serif', fontSize: 14, fontWeight: 600, color: '#fff' }}>
                  {facility ? facility.facilityName : 'Connecting...'}
                </h1>
                <span className="av-badge av-badge-green" style={{ padding: '1px 7px' }}>
                  <span className="av-pulse" style={{ width: 5, height: 5 }}></span>
                  LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Tab Nav */}
          <nav className="av-tab-bar">
            <button className={`av-tab${activeTab === 'overview' ? ' active' : ''}`} onClick={() => onTabChange('overview')}>
              Overview
            </button>
            <button className={`av-tab${activeTab === 'thermal' ? ' active' : ''}`}
              style={activeTab === 'thermal' ? { background: 'rgba(249,115,22,0.15)', color: '#fb923c', borderColor: 'rgba(249,115,22,0.4)' } : {}}
              onClick={() => onTabChange('thermal')}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f97316', display: 'inline-block' }}></span>
              Thermal
            </button>
            <button className={`av-tab${activeTab === 'telemetry' ? ' active' : ''}`} onClick={() => onTabChange('telemetry')}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }}></span>
              Telemetry
            </button>
            <button className={`av-tab${activeTab === 'health' ? ' active' : ''}`}
              style={activeTab === 'health' ? { background: 'rgba(245,158,11,0.15)', color: '#fcd34d', borderColor: 'rgba(245,158,11,0.4)' } : {}}
              onClick={() => onTabChange('health')}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
              Asset Health
            </button>
            <button className={`av-tab${activeTab === 'incident' ? ' active' : ''}`}
              style={activeTab === 'incident' ? { background: 'rgba(239,68,68,0.15)', color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' } : {}}
              onClick={() => onTabChange('incident')}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'av-pulse 2s infinite' }}></span>
              Incidents
            </button>
          </nav>
        </div>

        {/* Right: Facility Health + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}>
          <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', padding: '5px 10px', borderRadius: 6, display: 'flex', gap: 6 }}>
            <span style={{ color: '#fcd34d' }}>RISK:</span>
            <span style={{ color: '#fff', fontWeight: 700 }}>WATCH</span>
          </div>
          <div style={{ background: 'rgba(11,15,21,0.85)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: 6, display: 'flex', gap: 6 }}>
            <span style={{ color: '#64748b' }}>ANOMALIES:</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>3</span>
          </div>
          <div style={{ background: 'rgba(11,15,21,0.85)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: 6, display: 'flex', gap: 6 }}>
            <span style={{ color: '#64748b' }}>SATELLITE:</span>
            <span style={{ color: '#e2e8f0', fontWeight: 600 }}>18:20 IST</span>
          </div>
          <button
            onClick={onLogout}
            className="av-btn av-btn-danger"
            style={{ fontFamily: 'Lexend, sans-serif', fontSize: 11, letterSpacing: 1 }}
          >
            ⏻ LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
};
