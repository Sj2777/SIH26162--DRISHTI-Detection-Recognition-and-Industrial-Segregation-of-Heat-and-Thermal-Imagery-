import { useState, useEffect } from 'react';
import { FacilityData } from './types';
import { fetchFacilityData } from './services/api';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Overview } from './pages/Overview';
import { ThermalIntelligence } from './pages/ThermalIntelligence';
import { LiveTelemetry } from './pages/LiveTelemetry';
import { AssetHealth } from './pages/AssetHealth';
import { IncidentResponse } from './pages/IncidentResponse';
import LoginPage from './pages/LoginPage';

// Simple session helpers
const SESSION_KEY = 'agni_industry_session';
function readSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function writeSession(data: object) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [session, setSession] = useState<object | null>(readSession);
  const [activeTab, setActiveTab] = useState<'overview' | 'thermal' | 'telemetry' | 'health' | 'incident'>('overview');
  const [facility, setFacility] = useState<FacilityData | null>(null);

  useEffect(() => {
    if (!session) return;
    fetchFacilityData()
      .then(setFacility)
      .catch((err) => console.error('Error fetching facility metadata for Header:', err));
  }, [session]);

  const handleLogin = (userData: object) => {
    writeSession(userData);
    setSession(userData);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setFacility(null);
    setActiveTab('overview');
  };

  // Show login page if not authenticated
  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0d12] text-slate-100 flex flex-col font-sans">
      <Header
        facility={facility}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-5 pb-8">
        {activeTab === 'overview' && (
          <Overview facility={facility} hideLayout={true} />
        )}
        {activeTab === 'thermal' && (
          <ThermalIntelligence />
        )}
        {activeTab === 'telemetry' && (
          <LiveTelemetry />
        )}
        {activeTab === 'health' && (
          <AssetHealth />
        )}
        {activeTab === 'incident' && (
          <IncidentResponse />
        )}
      </main>

      <Footer />
    </div>
  );
}
