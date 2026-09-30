const fs = require('fs');
const code = 
import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Asset, FacilityData } from '../../types';

interface FacilityMapProps {
  facility: FacilityData | null;
  assets: Asset[];
}

export const FacilityMap: React.FC<FacilityMapProps> = ({ facility, assets }) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const center: [number, number] = facility ? facility.coordinates.center : [18.6225, 73.8058];
  const zoom: number = facility ? facility.coordinates.zoom : 16;

  return (
    <div className="bg-[#121820] border border-[#233140] rounded overflow-hidden flex flex-col h-[460px] relative">
      <div className="bg-[#16202c] border-b border-[#233140] px-4 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-200 uppercase">
            Facility Spatial Boundary & Asset Telemetry
          </span>
        </div>
      </div>

      <div className="w-full relative" style={{ minHeight: '400px', flex: 1 }}>
        <Map
          initialViewState={{
            longitude: center[1],
            latitude: center[0],
            zoom: zoom,
          }}
          mapStyle={{
            version: 8,
            sources: {
              'gmap-hybrid': {
                type: 'raster',
                tiles: ['https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'],
                tileSize: 256,
              },
            },
            layers: [
              {
                id: 'satellite-layer',
                type: 'raster',
                source: 'gmap-hybrid',
                minzoom: 0,
                maxzoom: 22,
              },
            ],
          }}
          style={{ width: '100%', height: '100%' }}
        >
          {assets.map((asset) => {
            let bg = '#10b981';
            let border = '#34d399';
            let shadow = 'rgba(16, 185, 129, 0.4)';

            if (asset.isThermalEvent) {
              return (
                <Marker
                  key={asset.id}
                  longitude={asset.longitude}
                  latitude={asset.latitude}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedAsset(asset);
                  }}
                >
                  <div style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <div style={{ position: 'absolute', width: '26px', height: '26px', background: 'rgba(249, 115, 22, 0.3)', transform: 'rotate(45deg)', borderRadius: '4px' }} className="animate-ping"></div>
                    <div style={{ position: 'relative', width: '18px', height: '18px', background: '#ea580c', border: '2px solid #fff', transform: 'rotate(45deg)', borderRadius: '3px', boxShadow: '0 0 10px #f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '6px', height: '6px', background: '#ffffff', borderRadius: '50%' }}></div>
                    </div>
                  </div>
                </Marker>
              );
            }

            if (asset.status === 'CRITICAL') {
              bg = '#ef4444';
              border = '#fca5a5';
              shadow = 'rgba(239, 68, 68, 0.6)';
            } else if (asset.status === 'WARNING') {
              bg = '#f59e0b';
              border = '#fde68a';
              shadow = 'rgba(245, 158, 11, 0.5)';
            }

            return (
              <Marker
                key={asset.id}
                longitude={asset.longitude}
                latitude={asset.latitude}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedAsset(asset);
                }}
              >
                <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {asset.status === 'CRITICAL' && (
                    <div style={{ position: 'absolute', width: '24px', height: '24px', background: shadow, borderRadius: '50%' }} className="animate-ping"></div>
                  )}
                  <div style={{ width: '14px', height: '14px', background: bg, border: '2px solid ' + border, borderRadius: '50%', boxShadow: '0 0 8px ' + shadow }}></div>
                </div>
              </Marker>
            );
          })}

          {selectedAsset && (
            <Popup
              longitude={selectedAsset.longitude}
              latitude={selectedAsset.latitude}
              anchor="bottom"
              onClose={() => setSelectedAsset(null)}
              closeOnClick={false}
            >
              <div className="text-xs text-black p-2 rounded">
                <div className="font-bold border-b pb-1 mb-1.5 flex items-center justify-between gap-4">
                  <span>{selectedAsset.name}</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between gap-3">
                    <span>STATUS:</span>
                    <span className="font-semibold">
                      {selectedAsset.status}
                    </span>
                  </div>
                  <div className="mt-1.5 pt-1 border-t text-[10px] max-w-[200px]">
                    {selectedAsset.condition}
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </div>
  );
};
;
fs.writeFileSync('src/components/map/FacilityMap.tsx', code);
