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

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'thermal' | 'telemetry' | 'health' | 'incident'>('overview');
  const [facility, setFacility] = useState<FacilityData | null>(null);

  useEffect(() => {
    fetchFacilityData()
      .then(setFacility)
      .catch((err) => console.error('Error fetching facility metadata for Header:', err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0d12] text-slate-100 flex flex-col font-sans">
      <Header
        facility={facility}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
