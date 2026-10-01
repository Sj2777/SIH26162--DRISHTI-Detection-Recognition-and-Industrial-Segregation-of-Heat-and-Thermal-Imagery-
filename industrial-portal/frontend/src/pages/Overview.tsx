import React, { useEffect, useState } from 'react';
import { FacilityData, Asset, AlertItem } from '../types';
import { fetchFacilityData, fetchAssets, fetchAlerts } from '../services/api';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { KpiCards } from '../components/facility/KpiCard';
import { FacilityMap } from '../components/map/FacilityMap';
import { ActiveAlertCard } from '../components/alerts/ActiveAlertCard';
import { AssetTable } from '../components/assets/AssetTable';

interface OverviewProps {
  facility?: FacilityData | null;
  hideLayout?: boolean;
}

export const Overview: React.FC<OverviewProps> = ({ facility: propFacility, hideLayout = true }) => {
  const [facility, setFacility] = useState<FacilityData | null>(propFacility || null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const promises: [Promise<FacilityData | null>, Promise<Asset[]>, Promise<AlertItem[]>] = [
          propFacility ? Promise.resolve(propFacility) : fetchFacilityData(),
          fetchAssets(),
          fetchAlerts(),
        ];

        const [facilityRes, assetsRes, alertsRes] = await Promise.all(promises);

        if (isMounted) {
          if (facilityRes) setFacility(facilityRes);
          setAssets(assetsRes);
          setAlerts(alertsRes);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading dashboard data:', err);
          setError(
            err instanceof Error ? err.message : 'Failed to connect to backend telemetry service'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [propFacility]);

  const content = (
    <div className="space-y-6">
      {/* Error banner if backend is unreachable */}
      {error && (
        <div className="bg-[#450a0a]/80 border border-[#dc2626] rounded p-4 text-xs font-mono text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-red-400">TELEMETRY ERROR:</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded text-[11px] font-semibold tracking-wider uppercase transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Loading state skeleton */}
      {loading && !facility && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono text-[#7e90a5]">Initializing Industrial Safety Telemetry...</p>
        </div>
      )}

      {/* Dashboard Content */}
      {(!loading || facility) && (
        <>
          {/* Top 6 KPI Cards */}
          <KpiCards facility={facility} />

          {/* Main Content: Left Map, Right Active Alert */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Spatial Facility Map (8 cols on lg) */}
            <div className="lg:col-span-8">
              <FacilityMap facility={facility} assets={assets} />
            </div>

            {/* Right Column: Active Alert Card (4 cols on lg) */}
            <div className="lg:col-span-4">
              <ActiveAlertCard alerts={alerts} />
            </div>
          </div>

          {/* Asset Health Table */}
          <AssetTable assets={assets} />
        </>
      )}
    </div>
  );

  if (hideLayout) {
    return content;
  }

  return (
    <div className="min-h-screen bg-[#0a0d12] text-slate-100 flex flex-col font-sans">
      <Header facility={facility} activeTab="overview" onTabChange={() => {}} />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-5 pb-8">
        {content}
      </main>
      <Footer />
    </div>
  );
};

