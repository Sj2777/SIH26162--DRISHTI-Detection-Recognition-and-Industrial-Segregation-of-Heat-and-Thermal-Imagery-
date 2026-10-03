import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FacilityData, Asset, AlertItem } from '../types';
import { fetchFacilityData, fetchAssets, fetchAlerts } from '../services/api';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { KpiCards } from '../components/facility/KpiCard';
import { FacilityMap } from '../components/map/FacilityMap';
import { ActiveAlertCard } from '../components/alerts/ActiveAlertCard';
import { AssetTable } from '../components/assets/AssetTable';
import { RetryableError } from '../components/layout/RetryableError';
import { getUserFacingErrorMessage } from '../utils/errorMessage';

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
  const requestId = useRef(0);

  const loadDashboardData = useCallback(async () => {
    const currentRequestId = ++requestId.current;
    try {
      setLoading(true);
      setError(null);

      const promises: [Promise<FacilityData | null>, Promise<Asset[]>, Promise<AlertItem[]>] = [
        propFacility ? Promise.resolve(propFacility) : fetchFacilityData(),
        fetchAssets(),
        fetchAlerts(),
      ];

      const [facilityRes, assetsRes, alertsRes] = await Promise.all(promises);
      if (currentRequestId === requestId.current) {
        if (facilityRes) setFacility(facilityRes);
        setAssets(assetsRes);
        setAlerts(alertsRes);
      }
    } catch (err) {
      if (currentRequestId === requestId.current) {
        console.error('Error loading dashboard data:', err);
        setError(
          getUserFacingErrorMessage(err, 'Dashboard data could not be loaded. Try again.')
        );
      }
    } finally {
      if (currentRequestId === requestId.current) setLoading(false);
    }
  }, [propFacility]);

  useEffect(() => {
    void loadDashboardData();
    return () => {
      requestId.current += 1;
    };
  }, [loadDashboardData]);

  const content = (
    <div className="space-y-6">
      {/* Error banner if backend is unreachable */}
      {error && (
        <RetryableError
          title="Dashboard data unavailable"
          message={error}
          retrying={loading}
          onRetry={() => void loadDashboardData()}
        />
      )}

      {/* Loading state skeleton */}
      {loading && !facility && (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono text-[#7e90a5]">Initializing Industrial Safety Telemetry...</p>
        </div>
      )}

      {/* Dashboard Content */}
      {!error && (!loading || facility) && (
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
