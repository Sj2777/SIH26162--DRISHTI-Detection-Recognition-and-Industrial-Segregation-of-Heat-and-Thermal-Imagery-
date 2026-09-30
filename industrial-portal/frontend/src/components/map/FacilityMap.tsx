import React from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Asset, FacilityData } from '../../types';

interface FacilityMapProps {
  facility: FacilityData | null;
  assets: Asset[];
}

// Function to generate customized SVG DivIcons for Leaflet
const createAssetIcon = (asset: Asset) => {
  if (asset.isThermalEvent) {
    // Thermal Event: Pulsing flame-orange diamond
    return L.divIcon({
      className: 'custom-thermal-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 26px; height: 26px; background: rgba(249, 115, 22, 0.3); transform: rotate(45deg); border-radius: 4px;" class="map-marker-pulse"></div>
          <div style="position: relative; width: 18px; height: 18px; background: #ea580c; border: 2px solid #fff; transform: rotate(45deg); border-radius: 3px; box-shadow: 0 0 10px #f97316; display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; background: #ffffff; border-radius: 50%;"></div>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  }

  // Normal, Warning, Critical Circular Markers
  let bg = '#10b981';
  let border = '#34d399';
  let shadow = 'rgba(16, 185, 129, 0.4)';
  let isPulsing = false;

  if (asset.status === 'CRITICAL') {
    bg = '#ef4444';
    border = '#fca5a5';
    shadow = 'rgba(239, 68, 68, 0.6)';
    isPulsing = true;
  } else if (asset.status === 'WARNING') {
    bg = '#f59e0b';
    border = '#fde68a';
    shadow = 'rgba(245, 158, 11, 0.5)';
  }

  return L.divIcon({
    className: 'custom-asset-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        ${isPulsing ? `<div style="position: absolute; width: 24px; height: 24px; background: ${shadow}; border-radius: 50%;" class="map-marker-pulse"></div>` : ''}
        <div style="width: 14px; height: 14px; background: ${bg}; border: 2px solid ${border}; border-radius: 50%; box-shadow: 0 0 8px ${shadow};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

export const FacilityMap: React.FC<FacilityMapProps> = ({ facility, assets }) => {
  const center: [number, number] = facility ? facility.coordinates.center : [22.3150, 73.1750];
  const zoom: number = facility ? facility.coordinates.zoom : 16;
  const boundary = facility?.coordinates.boundary || [];

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col h-[460px] relative">
      {/* Map Header & Controls */}
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Facility Spatial Boundary & Asset Telemetry
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0f15] border border-[#233140] text-[#7e90a5]">
            GRID SECTOR-07
          </span>
        </div>

        {/* Wind direction indicator on top right */}
        {facility && (
          <div className="flex items-center gap-2 text-xs font-mono bg-[#0b0f15] px-2.5 py-1 rounded border border-[#233140]">
            <span className="text-[#64748b]">SURFACE WIND:</span>
            <span className="text-amber-400 font-semibold">{facility.wind.direction}</span>
            <span className="text-slate-300">@{facility.wind.speed}</span>
          </div>
        )}
      </div>

      {/* React-Leaflet Map */}
      <div className="flex-1 w-full relative">
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Fictional Facility Boundary Polygon */}
          {boundary.length > 0 && (
            <Polygon
              positions={boundary}
              pathOptions={{
                color: '#0284c7',
                weight: 1.5,
                dashArray: '5, 5',
                fillColor: '#0369a1',
                fillOpacity: 0.12,
              }}
            />
          )}

          {/* Asset Markers */}
          {assets.map((asset) => (
            <Marker
              key={asset.id}
              position={[asset.latitude, asset.longitude]}
              icon={createAssetIcon(asset)}
            >
              <Popup>
                <div className="text-xs">
                  <div className="font-bold text-slate-100 border-b border-[#2d3f54] pb-1 mb-1.5 flex items-center justify-between gap-2">
                    <span>{asset.name}</span>
                    <span className="text-[10px] text-[#7e90a5] font-mono">[{asset.type}]</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between gap-3">
                      <span className="text-[#64748b]">STATUS:</span>
                      <span
                        className={`font-semibold ${
                          asset.status === 'CRITICAL'
                            ? 'text-red-400'
                            : asset.status === 'WARNING'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-[#64748b]">RISK:</span>
                      <span
                        className={`font-semibold ${
                          asset.risk === 'HIGH'
                            ? 'text-red-400'
                            : asset.risk === 'MEDIUM'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {asset.risk}
                      </span>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-[#233140] text-[10px] text-slate-300 font-sans">
                      {asset.condition}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#101620]/95 backdrop-blur-sm border border-[#233140] rounded px-3 py-2 text-[11px] shadow-lg">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748b] mb-1.5 font-bold">
            Telemetry Legend
          </div>
          <div className="flex flex-wrap items-center gap-3 text-slate-300 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span>Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rotate-45 bg-[#ea580c] border border-white/60" />
              <span className="text-[#fb923c]">Thermal Event</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
