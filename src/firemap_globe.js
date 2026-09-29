/**
 * FIREMAP 3D GLOBE ENGINE (firemap.live Architecture)
 * ===================================================
 * Implements Mapbox GL JS 3D Globe, starry space atmosphere,
 * dynamic FIRMS fire hotspot clusters, 3D satellite orbits,
 * live wind streamline particles, geodesic ruler measurement,
 * and seamless deep context inspection.
 */

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { INDIAN_DISTRICTS, getDistrictPolygon } from './districts.js';

// Public token used by firemap.live
mapboxgl.accessToken = 'pk.eyJ1IjoiZGlzYXN0ZXJkYiIsImEiOiJjbTB5NmkwdGgwam9lMnFweWRpaHV6cHlsIn0.w0q_y36YDqPW4yrr675Baw';

export class FireMapGlobe {
  constructor(options = {}) {
    this.containerId = options.containerId || 'map';
    this.onHotspotSelect = options.onHotspotSelect || (() => {});
    this.onHotspotInspect = options.onHotspotInspect || (() => {});
    this.map = null;
    this.activeHotspots = [];
    this.isGlobeProjection = true;
    this.currentBasemap = 'satellite';
    this.isWindActive = true;
    this.windSpeedKmh = 14;
    this.windBearingDeg = 240;
    this.windParticles = [];
    this.currentHazardHotspot = null;
    this.savedTerrain = null;
    this.windAnimationId = null;
    this.satellites = [
      // ── GEOSTATIONARY (GEO) CONSTELLATION (Altitude: 35,786 km, Fixed slot nadir) ──
      {
        id: 'sat-insat-3dr',
        name: 'INSAT-3DR',
        agency: 'ISRO',
        orbitType: 'GEO',
        altitudeKm: 35786,
        speedKmS: 3.075,
        speedKmh: 11070,
        slotLng: 74.0,
        color: '#38bdf8',
        sensor: 'Multi-Spectral Imager (6-Ch) & Sounder (19-Ch)',
        fireChannel: 'MIR 3.9 µm (4 km) & TIR 10.8 µm (4 km)',
        cadence: '15-Minute Continuous Scan',
        coverage: 'Full-Disk Indian Subcontinent & Indian Ocean',
        status: 'ACTIVE · PRIMARY ISRO GEO HAZARD SENTINEL'
      },
      {
        id: 'sat-insat-3d',
        name: 'INSAT-3D',
        agency: 'ISRO',
        orbitType: 'GEO',
        altitudeKm: 35786,
        speedKmS: 3.075,
        speedKmh: 11070,
        slotLng: 82.0,
        color: '#06b6d4',
        sensor: '6-Channel Imager & 19-Channel Sounder',
        fireChannel: 'Mid-Infrared 3.9 µm (4 km nadir)',
        cadence: '15-Minute Interleaved Scan',
        coverage: 'Eastern India, Bay of Bengal & South Asia',
        status: 'ACTIVE · COMPLEMENTARY ISRO SATELLITE'
      },
      {
        id: 'sat-msg-iodc',
        name: 'Meteosat-11 (MSG-IODC)',
        agency: 'EUMETSAT',
        orbitType: 'GEO',
        altitudeKm: 35786,
        speedKmS: 3.075,
        speedKmh: 11070,
        slotLng: 45.5,
        color: '#c084fc',
        sensor: 'SEVIRI (12 Spectral Channels)',
        fireChannel: 'IR 3.9 µm & IR 10.8 µm',
        cadence: '15-Minute Rapid Full-Disk Scan',
        coverage: 'Indian Ocean Data Coverage (45.5°E Slot)',
        status: 'ACTIVE · EUMETSAT IODC REPLACEMENT'
      },

      // ── NON-GEOSTATIONARY (LEO) POLAR CONSTELLATION (Altitude: 780-840 km) ──
      {
        id: 'sat-noaa-20',
        name: 'NOAA-20 (JPSS-1)',
        agency: 'NASA / NOAA',
        orbitType: 'LEO',
        altitudeKm: 824,
        speedKmS: 7.45,
        speedKmh: 26820,
        inclination: 98.7,
        periodMin: 101.4,
        phaseOffset: 0.18,
        swathKm: 3040,
        color: '#34d399',
        sensor: 'VIIRS (Visible Infrared Imaging Radiometer Suite)',
        fireChannel: 'I4 3.74 µm (375m) & I5 11.45 µm',
        cadence: '13:30 / 01:30 LT Polar Overpass',
        coverage: 'Global 3,040 km seamless swath',
        status: 'ACTIVE · CORE NASA FIRMS THERMAL SENSOR'
      },
      {
        id: 'sat-suomi-npp',
        name: 'Suomi-NPP',
        agency: 'NASA / NOAA',
        orbitType: 'LEO',
        altitudeKm: 834,
        speedKmS: 7.44,
        speedKmh: 26784,
        inclination: 98.7,
        periodMin: 101.5,
        phaseOffset: 0.52,
        swathKm: 3040,
        color: '#10b981',
        sensor: 'VIIRS (375m Active Fire & DNB)',
        fireChannel: '375m I-Bands + Nighttime Lights',
        cadence: '13:30 LT Overpass (~50m after NOAA-20)',
        coverage: 'Global 3,040 km swath',
        status: 'ACTIVE · VIIRS PATHFINDER MISSION'
      },
      {
        id: 'sat-noaa-21',
        name: 'NOAA-21 (JPSS-2)',
        agency: 'NASA / NOAA',
        orbitType: 'LEO',
        altitudeKm: 824,
        speedKmS: 7.45,
        speedKmh: 26820,
        inclination: 98.7,
        periodMin: 101.4,
        phaseOffset: 0.85,
        swathKm: 3040,
        color: '#4ade80',
        sensor: 'VIIRS Collection 2 (Latest Gen)',
        fireChannel: 'High-Saturation Fire Channels',
        cadence: '13:30 / 01:30 LT Polar Overpass',
        coverage: 'Global 3,040 km swath',
        status: 'ACTIVE · JPSS-2 OPERATIONAL SATELLITE'
      },
      {
        id: 'sat-sentinel-3a',
        name: 'Sentinel-3A',
        agency: 'ESA / Copernicus',
        orbitType: 'LEO',
        altitudeKm: 814,
        speedKmS: 7.48,
        speedKmh: 26928,
        inclination: 98.65,
        periodMin: 100.0,
        phaseOffset: 0.35,
        swathKm: 1420,
        color: '#f59e0b',
        sensor: 'SLSTR (Dual-View Conical Radiometer)',
        fireChannel: 'F1 3.74 µm (1km, 650K ceiling) & F2',
        cadence: '10:00 / 22:00 LT Overpass',
        coverage: '1,420 km wide swath',
        status: 'ACTIVE · COPERNICUS WILDFIRE SENSOR'
      },
      {
        id: 'sat-sentinel-5p',
        name: 'Sentinel-5P',
        agency: 'ESA / Copernicus',
        orbitType: 'LEO',
        altitudeKm: 824,
        speedKmS: 7.45,
        speedKmh: 26820,
        inclination: 98.7,
        periodMin: 101.0,
        phaseOffset: 0.68,
        swathKm: 2600,
        color: '#e879f9',
        sensor: 'TROPOMI (Atmospheric Gas Spectrometer)',
        fireChannel: 'Tropospheric NO₂, SO₂, CO & UVAI',
        cadence: '13:30 LT Daily Global Overpass',
        coverage: '2,600 km swath, daily complete coverage',
        status: 'ACTIVE · TOXIC GAS & SMOKE PLUME TRACKER'
      },
      {
        id: 'sat-sentinel-2a',
        name: 'Sentinel-2A',
        agency: 'ESA / Copernicus',
        orbitType: 'LEO',
        altitudeKm: 786,
        speedKmS: 7.50,
        speedKmh: 27000,
        inclination: 98.62,
        periodMin: 100.6,
        phaseOffset: 0.05,
        swathKm: 290,
        color: '#fb7185',
        sensor: 'MSI (Multi-Spectral Instrument 13 bands)',
        fireChannel: 'B8A (NIR 865nm) & B12 (SWIR 2190nm)',
        cadence: '5-Day Constellation Repeat (10m Resolution)',
        coverage: 'High-Resolution 290 km swath',
        status: 'ACTIVE · OPTICAL BURN SCAR CLASSIFIER'
      }
    ];
    this.satelliteMarkers = {};
    this.satellitePopup = null;
    this.showSatelliteOrbits = true;
    this.showSatelliteSwaths = true;
    this.showGeoBeams = true;
  }

  init() {
    const el = document.getElementById(this.containerId);
    if (!el) {
      console.error(`[FireMap] Container #${this.containerId} not found`);
      return;
    }

    this.map = new mapboxgl.Map({
      container: this.containerId,
      style: 'mapbox://styles/disasterdb/cmb7ma1cm00yn01rf2vtb9od5', // Satellite Streets 3D
      center: [78.9629, 20.5937], // India center
      zoom: 3.2,
      projection: 'globe',
      attributionControl: false
    });

    // Add Mapbox controls
    this.map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    this.map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    this.map.on('style.load', () => {
      this.configureAtmosphere();
      this.initHazardZoneLayer();
      this.initDistrictLayers();
      this.initHotspotLayers();
      this.initSatelliteOrbits();
      this.updateHotspots(this.activeHotspots);
      if (this.currentHazardHotspot) {
        this.updateHazardZone(this.currentHazardHotspot.lat, this.currentHazardHotspot.lon, this.windSpeedKmh, this.windBearingDeg);
      }
    });

    this.initWindCanvas();
    this.startSatelliteTracker();
    this.startClock();
  }

  // 1a. Interactive Clickable Districts & Boundaries Layer
  initDistrictLayers() {
    if (!this.map || this.map.getSource('india-districts-source')) return;

    const districtPoints = {
      type: 'FeatureCollection',
      features: INDIAN_DISTRICTS.map(d => ({
        type: 'Feature',
        properties: {
          name: d.name,
          state: d.state,
          lat: d.lat,
          lon: d.lon,
          bounds: JSON.stringify(d.bounds),
          zoom: d.zoom || 8.8
        },
        geometry: {
          type: 'Point',
          coordinates: [d.lon, d.lat]
        }
      }))
    };

    this.map.addSource('india-districts-source', {
      type: 'geojson',
      data: districtPoints
    });

    this.map.addSource('district-boundary-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    this.map.addLayer({
      id: 'district-boundary-fill',
      type: 'fill',
      source: 'district-boundary-source',
      paint: {
        'fill-color': '#0284c7',
        'fill-opacity': 0.12
      }
    });

    this.map.addLayer({
      id: 'district-boundary-line',
      type: 'line',
      source: 'district-boundary-source',
      paint: {
        'line-color': '#38bdf8',
        'line-width': 2.8,
        'line-opacity': 0.95
      }
    });

    this.map.addLayer({
      id: 'district-labels',
      type: 'symbol',
      source: 'india-districts-source',
      minzoom: 3.5,
      maxzoom: 10.5,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-size': [
          'interpolate', ['linear'], ['zoom'],
          4, 10,
          7, 12,
          9, 13
        ],
        'text-offset': [0, 1.1],
        'text-anchor': 'top',
        'text-allow-overlap': false
      },
      paint: {
        'text-color': '#e0f2fe',
        'text-halo-color': 'rgba(15, 23, 42, 0.95)',
        'text-halo-width': 1.8
      }
    });

    this.map.addLayer({
      id: 'district-points',
      type: 'circle',
      source: 'india-districts-source',
      minzoom: 4,
      maxzoom: 10,
      paint: {
        'circle-radius': 3.5,
        'circle-color': '#38bdf8',
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff'
      }
    });

    const handleDistrictClick = (e) => {
      const feat = e.features?.[0];
      if (!feat) return;
      const p = feat.properties;
      const district = {
        name: p.name,
        state: p.state,
        lat: Number(p.lat),
        lon: Number(p.lon),
        bounds: p.bounds ? JSON.parse(p.bounds) : null,
        zoom: Number(p.zoom) || 8.8
      };
      this.focusDistrict(district);
    };

    this.map.on('click', 'district-labels', handleDistrictClick);
    this.map.on('click', 'district-points', handleDistrictClick);
    this.map.on('mouseenter', 'district-labels', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'district-labels', () => { this.map.getCanvas().style.cursor = ''; });
  }

  focusDistrict(district) {
    if (!district || !this.map) return;
    const polygonFeature = getDistrictPolygon(district);
    const boundarySource = this.map.getSource('district-boundary-source');
    if (boundarySource) {
      boundarySource.setData({
        type: 'FeatureCollection',
        features: [polygonFeature]
      });
    }

    const b = district.bounds;
    const firesInDistrict = this.activeHotspots.filter(h => {
      const lat = Number(h.latitude);
      const lon = Number(h.longitude);
      if (b) {
        return lon >= b[0] && lat >= b[1] && lon <= b[2] && lat <= b[3];
      }
      const dx = (lat - district.lat) * 111;
      const dy = (lon - district.lon) * 111 * Math.cos(district.lat * Math.PI / 180);
      return Math.sqrt(dx * dx + dy * dy) <= 40;
    });

    this.map.flyTo({
      center: [district.lon, district.lat],
      zoom: district.zoom || 8.8,
      pitch: 42,
      bearing: 0,
      duration: 1800
    });

    if (window.showDistrictNotification) {
      window.showDistrictNotification(district, firesInDistrict);
    }

    if (firesInDistrict.length > 0) {
      const topFire = firesInDistrict.reduce((max, cur) => (cur.frp > max.frp ? cur : max), firesInDistrict[0]);
      setTimeout(() => {
        this.onHotspotSelect(topFire);
      }, 900);
    }
  }

  focusIndustry(facility) {
    if (!facility || !this.map) return;
    const lat = Number(facility.lat ?? facility.latitude);
    const lon = Number(facility.lon ?? facility.longitude);
    if (!lat || !lon) return;

    // 1. If facility has polygon boundary, render it; otherwise create a circular buffer boundary
    let polygonFeature = null;
    if (facility.boundary && Array.isArray(facility.boundary) && facility.boundary.length >= 3) {
      // GeoJSON expects [lon, lat]
      const coords = facility.boundary.map(pt => [pt[1], pt[0]]);
      if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
        coords.push(coords[0]);
      }
      polygonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        },
        properties: { name: facility.name }
      };
    } else {
      // 1.5 km circular boundary around plant
      const points = 32;
      const coords = [];
      const dLat = 1.5 / 111.0;
      const dLon = 1.5 / (111.0 * Math.cos(lat * Math.PI / 180));
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        coords.push([lon + dLon * Math.cos(theta), lat + dLat * Math.sin(theta)]);
      }
      polygonFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        },
        properties: { name: facility.name }
      };
    }

    // Reuse district-boundary-source to show glowing boundary
    const boundarySource = this.map.getSource('district-boundary-source');
    if (boundarySource && polygonFeature) {
      boundarySource.setData({
        type: 'FeatureCollection',
        features: [polygonFeature]
      });
    }

    // 2. Find any active thermal hotspots within 4 km of this industry
    const nearbyHotspots = this.activeHotspots.filter(h => {
      const hLat = Number(h.latitude);
      const hLon = Number(h.longitude);
      const dx = (hLat - lat) * 111;
      const dy = (hLon - lon) * 111 * Math.cos(lat * Math.PI / 180);
      return Math.sqrt(dx * dx + dy * dy) <= 4.0;
    });

    // 3. Smooth dramatic 3D fly to facility
    this.map.flyTo({
      center: [lon, lat],
      zoom: 14.2,
      pitch: 48,
      bearing: -20,
      duration: 2000,
      essential: true
    });

    // 4. Show Industry Notification HUD
    if (window.showIndustryNotification) {
      window.showIndustryNotification(facility, nearbyHotspots);
    }

    // 5. Show Mapbox Popup & details drawer
    if (nearbyHotspots.length > 0) {
      const topFire = nearbyHotspots.reduce((max, cur) => (cur.frp > max.frp ? cur : max), nearbyHotspots[0]);
      topFire.facility_name = facility.name;
      topFire.operator = facility.operator || topFire.operator;
      setTimeout(() => {
        this.onHotspotSelect(topFire);
      }, 1000);
    } else {
      setTimeout(() => {
        const isMine = facility.type === 'mine' || facility.name.toLowerCase().includes('mine');
        const badgeColor = isMine ? '#a855f7' : '#f97316';
        const badgeLabel = isMine ? 'OPEN-CAST COAL MINE' : 'REGISTERED INDUSTRY';

        const popupContent = `
          <div style="min-width: 280px; padding: 4px;">
            <div class="fmpop-header" style="margin-bottom: 8px;">
              <span class="fmpop-tag" style="background: ${badgeColor}25; color: ${badgeColor}; border: 1px solid ${badgeColor}80; font-weight: 700;">
                ${isMine ? '♨️' : '🏭'} ${badgeLabel}
              </span>
              <span style="font-size: 11px; color: #34d399; font-weight: 600;">CPCB ${facility.cpcb_category || 'Red'} Category</span>
            </div>
            <div class="fmpop-title" style="font-size: 15px; color: #fff; font-weight: 700; margin-bottom: 6px;">
              ${facility.name}
            </div>
            <div class="info-row" style="padding: 4px 0;">
              <span class="info-label">Operator:</span>
              <span class="info-value" style="color: #cbd5e1;">${facility.operator || 'Operating Corporation'}</span>
            </div>
            <div class="info-row" style="padding: 4px 0;">
              <span class="info-label">Location:</span>
              <span class="info-value">${facility.district || ''}, ${facility.state || ''}</span>
            </div>
            <div class="info-row" style="padding: 4px 0; border-bottom: none;">
              <span class="info-label">Coordinates:</span>
              <a href="https://maps.google.com/?q=${lat},${lon}" target="_blank" rel="noopener" class="gmaps-coord-link">
                📍 ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E ↗
              </a>
            </div>
            <div style="margin-top: 10px;">
              <button class="btn btn-primary btn-34" style="width: 100%; height: 34px !important; line-height: 34px !important; font-size: 12px; font-weight: 700; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border: none; cursor: pointer;"
                onclick="window.openIndustryOverviewModal('${facility.name.replace(/'/g, "\\'")}', '${facility.id || ''}', ${lat}, ${lon})">
                🏭 VIEW INDUSTRY
              </button>
            </div>
          </div>
        `;

        if (this.currentPopup) {
          this.currentPopup.remove();
        }
        if (window.mapboxgl) {
          this.currentPopup = new window.mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            maxWidth: '360px',
            className: 'custom-mapbox-popup'
          })
            .setLngLat([lon, lat])
            .setHTML(popupContent)
            .addTo(this.map);
        }
      }, 1000);
    }
  }

  flyToHotspot(h) {
    if (!h || !this.map) return;
    const lat = Number(h.latitude);
    const lon = Number(h.longitude);
    if (!lat || !lon) return;

    this.map.flyTo({
      center: [lon, lat],
      zoom: 14.5,
      pitch: 45,
      bearing: -15,
      duration: 1800,
      essential: true
    });

    setTimeout(() => {
      this.onHotspotSelect(h);
    }, 900);
  }

  // 1. Configure 3D Globe Deep Space & Atmosphere Glow
  configureAtmosphere() {
    try {
      this.map.setFog({
        color: 'rgb(5, 7, 14)', // Lower atmosphere
        'high-color': 'rgb(17, 24, 39)', // Upper atmosphere
        'horizon-blend': 0.12, // Atmosphere thickness at horizon
        'space-color': 'rgb(5, 7, 14)', // Deep starry space
        'star-intensity': 0.85 // Star brilliance
      });
    } catch (err) {
      console.warn('[FireMap] Fog configuration warning:', err);
    }
  }

  // 2. Dynamic 2x Retina Logo Badge Icons for each Fire Classification
  initFireTypeIcons() {
    const iconDefinitions = {
      'MINE': {
        color: '#a855f7',
        draw: (ctx) => {
          // Crossed mining pickaxes
          ctx.beginPath();
          ctx.moveTo(15, 35); ctx.lineTo(35, 15);
          ctx.moveTo(33, 12); ctx.lineTo(38, 17);
          ctx.moveTo(35, 35); ctx.lineTo(15, 15);
          ctx.moveTo(17, 12); ctx.lineTo(12, 17);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.6;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      },
      'WILDFIRE': {
        color: '#22c55e',
        draw: (ctx) => {
          // Pine tree / forest canopy
          ctx.beginPath();
          ctx.moveTo(25, 10);
          ctx.lineTo(33, 19);
          ctx.lineTo(29, 19);
          ctx.lineTo(36, 29);
          ctx.lineTo(14, 29);
          ctx.lineTo(21, 19);
          ctx.lineTo(17, 19);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          // Trunk
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(23, 29, 4, 6);
        }
      },
      'FACTORY': {
        color: '#f97316',
        draw: (ctx) => {
          // Factory building with tall chimney and smoke stack
          ctx.beginPath();
          ctx.moveTo(13, 35);
          ctx.lineTo(13, 22);
          ctx.lineTo(18, 22);
          ctx.lineTo(18, 14); // Tall chimney
          ctx.lineTo(23, 14);
          ctx.lineTo(23, 25);
          ctx.lineTo(29, 21);
          ctx.lineTo(29, 25);
          ctx.lineTo(37, 19);
          ctx.lineTo(37, 35);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          // Smoke puff from chimney stack
          ctx.beginPath();
          ctx.arc(20.5, 10, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
        }
      },
      'INDUSTRIAL_HIGH_ALERT': {
        color: '#ef4444',
        draw: (ctx) => {
          // Warning hazard triangle with exclamation mark
          ctx.beginPath();
          ctx.moveTo(25, 10);
          ctx.lineTo(38, 35);
          ctx.lineTo(12, 35);
          ctx.closePath();
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          // Exclamation mark
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(23.5, 18, 3, 9);
          ctx.beginPath();
          ctx.arc(25, 30.5, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      'CROP': {
        color: '#b45309',
        draw: (ctx) => {
          // Wheat / crop stubble stalk
          ctx.beginPath();
          ctx.moveTo(25, 36);
          ctx.lineTo(25, 12);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          // Grain kernels
          ctx.beginPath();
          ctx.arc(20.5, 17, 3.2, 0, Math.PI * 2);
          ctx.arc(29.5, 17, 3.2, 0, Math.PI * 2);
          ctx.arc(20.5, 24, 3.2, 0, Math.PI * 2);
          ctx.arc(29.5, 24, 3.2, 0, Math.PI * 2);
          ctx.arc(25, 11, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      },
      'HEAT_RING': {
        color: '#eab308',
        draw: (ctx) => {
          // Concentric thermal rings
          ctx.beginPath();
          ctx.arc(25, 25, 13, 0, Math.PI * 2);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.2;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(25, 25, 7.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(25, 25, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      },
      'UNKNOWN': {
        color: '#64748b',
        draw: (ctx) => {
          ctx.beginPath();
          ctx.arc(25, 25, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      }
    };

    Object.entries(iconDefinitions).forEach(([key, def]) => {
      const imgId = `fire-icon-${key}`;
      if (this.map.hasImage(imgId)) return;

      const size = 50;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Outer glow and badge circle
      ctx.shadowColor = def.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, 21, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.fill();

      // Colored solid rim
      ctx.shadowBlur = 0;
      ctx.lineWidth = 3.2;
      ctx.strokeStyle = def.color;
      ctx.stroke();

      // Custom icon inside
      def.draw(ctx);

      const imageData = ctx.getImageData(0, 0, size, size);
      this.map.addImage(imgId, imageData, { pixelRatio: 2 });
    });
  }

  // 3. Initialize Hotspot Cluster and Circle Layers
  initHotspotLayers() {
    if (this.map.getSource('fire-hotspots')) return;

    this.initFireTypeIcons();

    this.map.addSource('fire-hotspots', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterMaxZoom: 13,
      clusterRadius: 40
    });

    // A. Clustered Fire Glow
    this.map.addLayer({
      id: 'clusters-glow',
      type: 'circle',
      source: 'fire-hotspots',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          'rgba(245, 158, 11, 0.4)',
          10, 'rgba(249, 115, 22, 0.45)',
          50, 'rgba(239, 68, 68, 0.55)'
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          18,
          10, 24,
          50, 32
        ],
        'circle-blur': 0.4
      }
    });

    // B. Clustered Fire Center
    this.map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'fire-hotspots',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step', ['get', 'point_count'],
          '#f59e0b',
          10, '#f97316',
          50, '#ef4444'
        ],
        'circle-radius': [
          'step', ['get', 'point_count'],
          10,
          10, 14,
          50, 18
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // C. Cluster Count Label
    this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'fire-hotspots',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 11
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // D. Unclustered Individual Fire Outer Pulse
    this.map.addLayer({
      id: 'unclustered-pulse',
      type: 'circle',
      source: 'fire-hotspots',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'frp'],
          0, 9,
          50, 16,
          200, 26
        ],
        'circle-opacity': 0.45,
        'circle-blur': 0.45
      }
    });

    // E. Unclustered Individual Fire Core Base
    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'fire-hotspots',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'frp'],
          0, 4,
          50, 7,
          200, 11
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff'
      }
    });

    // F. Unclustered Individual Fire Distinct Logo Emblem Layer
    this.map.addLayer({
      id: 'unclustered-symbol',
      type: 'symbol',
      source: 'fire-hotspots',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': ['get', 'icon_id'],
        'icon-size': [
          'interpolate', ['linear'], ['zoom'],
          4, 0.45,
          7, 0.60,
          10, 0.78,
          13, 0.95,
          16, 1.15
        ],
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });

    // Click cluster: decisively zoom in to break apart points in one smooth animation
    const handleClusterClick = (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters', 'clusters-glow'] });
      if (!features || !features.length) return;
      const clusterId = features[0].properties.cluster_id;
      const coords = features[0].geometry.coordinates;
      this.map.getSource('fire-hotspots').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        const targetZoom = Math.max(zoom + 1.8, 12);
        this.map.flyTo({
          center: coords,
          zoom: targetZoom,
          speed: 1.4,
          curve: 1.1,
          essential: true
        });
      });
    };
    this.map.on('click', 'clusters', handleClusterClick);
    this.map.on('click', 'clusters-glow', handleClusterClick);

    // Click individual hotspot: smoothly fly to point and open detailed dossier
    const handlePointClick = (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['unclustered-symbol', 'unclustered-point', 'unclustered-pulse'] });
      if (!features || !features.length) return;
      const f = features[0];
      const p = f.properties;
      const coords = f.geometry.coordinates.slice();

      // Automatically zoom into point
      this.map.flyTo({
        center: coords,
        zoom: Math.max(this.map.getZoom(), 13.5),
        speed: 1.2,
        essential: true
      });

      const typeColor = p.color || '#22c55e';
      const typeLabel = (p.fire_type || 'THERMAL HOTSPOT').replace(/_/g, ' ');
      const title = p.facility_name || (typeColor === '#a855f7' ? 'Open-Cast Coal Mine' : `${typeLabel} Detection`);
      const operator = p.operator || (typeColor === '#a855f7' ? 'Coal India Limited' : 'Natural / Rural Area');

      const html = `
        <div style="min-width: 270px; padding: 2px;">
          <div class="fmpop-header">
            <span class="fmpop-tag" style="background: ${typeColor}25; color: ${typeColor}; border: 1px solid ${typeColor}80; font-weight: 700;">
              ${typeLabel}
            </span>
            <span style="font-size: 11px; color: #94a3b8; font-family: var(--fm-font-mono);">${p.satellite || 'VIIRS NOAA-20'}</span>
          </div>
          <div class="fmpop-title">
            ${title}
          </div>
          <div class="info-row">
            <span class="info-label">Radiative Power (FRP):</span>
            <span class="info-value val-frp">${Number(p.frp || 0).toFixed(1)} MW</span>
          </div>
          <div class="info-row">
            <span class="info-label">Detection Confidence:</span>
            <span class="info-value val-conf">${p.confidence || '75'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Coordinates:</span>
            <span class="info-value val-mono">${Number(coords[1]).toFixed(4)}°N, ${Number(coords[0]).toFixed(4)}°E</span>
          </div>
          <div class="info-row">
            <span class="info-label">Operator:</span>
            <span class="info-value" style="color: ${typeColor}; font-weight: 600;">${operator}</span>
          </div>
          <button class="fmpop-btn" onclick="window.inspectHotspotFromPopup('${p.id}'); if(window.event){window.event.stopPropagation();}">
            Inspect Full Dossier &rarr;
          </button>
        </div>
      `;

      new mapboxgl.Popup({ offset: 12, closeButton: true })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(this.map);

      // Update active hazard plume for this selected hotspot
      this.currentHazardHotspot = { lat: Number(coords[1]), lon: Number(coords[0]) };
      this.updateHazardZone(this.currentHazardHotspot.lat, this.currentHazardHotspot.lon, this.windSpeedKmh, this.windBearingDeg);

      const raw = this.activeHotspots.find(h => String(h.id) === String(p.id)) || p;
      this.onHotspotSelect(raw);
    };

    this.map.on('click', 'unclustered-symbol', handlePointClick);
    this.map.on('click', 'unclustered-point', handlePointClick);
    this.map.on('click', 'unclustered-pulse', handlePointClick);

    // Pointer cursors
    this.map.on('mouseenter', 'clusters', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'clusters', () => { this.map.getCanvas().style.cursor = ''; });
    this.map.on('mouseenter', 'clusters-glow', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'clusters-glow', () => { this.map.getCanvas().style.cursor = ''; });
    this.map.on('mouseenter', 'unclustered-symbol', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'unclustered-symbol', () => { this.map.getCanvas().style.cursor = ''; });
    this.map.on('mouseenter', 'unclustered-point', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'unclustered-point', () => { this.map.getCanvas().style.cursor = ''; });
    this.map.on('mouseenter', 'unclustered-pulse', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'unclustered-pulse', () => { this.map.getCanvas().style.cursor = ''; });
  }

  // Update hotspots dataset with authentic category colors
  updateHotspots(hotspots = []) {
    this.activeHotspots = hotspots;
    const source = this.map && this.map.getSource('fire-hotspots');
    if (!source) return;

    const features = hotspots.map(h => {
      const typeKey = (h.fire_type || h.classification || 'WILDFIRE').toUpperCase();
      let color = '#22c55e'; // Default Wildfire green
      let icon_id = 'fire-icon-WILDFIRE';

      if (typeKey.includes('MINE') || typeKey.includes('COLLIERY')) {
        color = '#a855f7'; // Purple - Coal Mine / Pit Mine
        icon_id = 'fire-icon-MINE';
      } else if (typeKey.includes('ALERT') || typeKey.includes('ACCIDENT')) {
        color = '#ef4444'; // Red - Industrial High Alert / Accidental Blaze
        icon_id = 'fire-icon-INDUSTRIAL_HIGH_ALERT';
      } else if (typeKey.includes('FACTORY') || typeKey.includes('INDUSTR') || typeKey.includes('CHIMNEY') || typeKey.includes('FLARE') || typeKey.includes('SMOKE')) {
        color = '#f97316'; // Orange - Factory / Industrial Chimney Stack Smoke
        icon_id = 'fire-icon-FACTORY';
      } else if (typeKey.includes('CROP') || typeKey.includes('STUBBLE') || typeKey.includes('AGRI')) {
        color = '#b45309'; // Brown / Amber - Crop Stubble
        icon_id = 'fire-icon-CROP';
      } else if (typeKey.includes('HEAT') || typeKey.includes('RING')) {
        color = '#ec4899'; // Pink - Heat Ring
        icon_id = 'fire-icon-HEAT_RING';
      } else if (typeKey.includes('WILD') || typeKey.includes('FOREST')) {
        color = '#22c55e'; // Green - Forest Wildfire
        icon_id = 'fire-icon-WILDFIRE';
      } else if (h.color) {
        color = h.color;
        icon_id = 'fire-icon-DEFAULT';
      }

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(h.longitude), Number(h.latitude)]
        },
        properties: {
          id: h.id,
          latitude: h.latitude,
          longitude: h.longitude,
          frp: Number(h.frp || h.brightness || 10),
          confidence: h.confidence || 'high',
          satellite: h.satellite || 'VIIRS NOAA-20',
          fire_type: h.fire_type || (color === '#a855f7' ? 'MINE' : color === '#f97316' ? 'FACTORY' : color === '#ef4444' ? 'INDUSTRIAL_HIGH_ALERT' : color === '#b45309' ? 'CROP' : 'WILDFIRE'),
          color: color,
          icon_id: icon_id,
          facility_name: h.facility_name || (color === '#a855f7' ? 'Open-Cast Coal Mine' : color === '#f97316' ? 'Industrial Facility' : color === '#ef4444' ? 'Industrial High-Alert Area' : 'Active Thermal Detection'),
          operator: h.operator || (color === '#a855f7' ? 'Coal India Limited' : color === '#f97316' ? (h.facility_name || 'Industrial Operator') : color === '#ef4444' ? (h.facility_name || 'Industrial Plant Operator') : 'Natural / Rural Area'),
          acq_date: h.acq_date || h.date || new Date().toISOString().slice(0, 10),
          acq_time: h.acq_time || '1200'
        }
      };
    });

    source.setData({
      type: 'FeatureCollection',
      features: features
    });
  }

  // =========================================================================
  // 3. SATELLITE CONSTELLATION ORBITS & TELEMETRY (GEO & LEO)
  // =========================================================================

  // Calculate high-precision instantaneous position of any satellite
  getSatellitePosition(sat, timestampSec) {
    if (sat.orbitType === 'GEO') {
      // Geostationary Equatorial: Fixed at designated longitude slot with authentic diurnal station-keeping analemma
      const dayFraction = (timestampSec % 86400) / 86400;
      const analemmaLat = 0.45 * Math.sin(dayFraction * 2 * Math.PI);
      const analemmaLng = sat.slotLng + 0.22 * Math.sin(dayFraction * 4 * Math.PI);
      return {
        lat: analemmaLat,
        lng: analemmaLng,
        altKm: sat.altitudeKm,
        speedKmS: sat.speedKmS,
        speedKmh: sat.speedKmh,
        isGeo: true
      };
    } else {
      // Non-Geostationary Low Earth Orbit (LEO) Sun-Synchronous Polar
      const periodSec = (sat.periodMin || 101.4) * 60;
      const omega = (2 * Math.PI) / periodSec;
      const earthOmega = (2 * Math.PI) / 86164.0905; // Earth sidereal rotation rate
      const inclRad = ((sat.inclination || 98.7) * Math.PI) / 180;

      // Argument of latitude u(t)
      const u = (omega * timestampSec + (sat.phaseOffset * 2 * Math.PI)) % (2 * Math.PI);

      // Spherical coordinate transformations
      const sinLat = Math.sin(inclRad) * Math.sin(u);
      const latRad = Math.asin(Math.max(-1, Math.min(1, sinLat)));
      const lat = (latRad * 180) / Math.PI;

      const ra = Math.atan2(Math.cos(inclRad) * Math.sin(u), Math.cos(u));
      const gha = earthOmega * timestampSec;
      let lng = ((ra - gha) * 180 / Math.PI) % 360;
      if (lng > 180) lng -= 360;
      if (lng < -180) lng += 360;

      return {
        lat: lat,
        lng: lng,
        altKm: sat.altitudeKm,
        speedKmS: sat.speedKmS,
        speedKmh: sat.speedKmh,
        isGeo: false
      };
    }
  }

  // Generate continuous ground track line segments (handling antimeridian wrap)
  createOrbitTrackLines(sat, currentSec) {
    const pastMinutes = 40;
    const futureMinutes = 55;
    const stepSec = 75;

    const pastCoords = [[]];
    const futureCoords = [[]];

    // Past track (solid line behind satellite)
    for (let t = currentSec - (pastMinutes * 60); t <= currentSec; t += stepSec) {
      const pos = this.getSatellitePosition(sat, t);
      const currentSegment = pastCoords[pastCoords.length - 1];
      if (currentSegment.length > 0) {
        const lastLng = currentSegment[currentSegment.length - 1][0];
        if (Math.abs(pos.lng - lastLng) > 180) {
          pastCoords.push([]);
        }
      }
      pastCoords[pastCoords.length - 1].push([pos.lng, pos.lat]);
    }

    // Future track (forecast path ahead of satellite)
    for (let t = currentSec; t <= currentSec + (futureMinutes * 60); t += stepSec) {
      const pos = this.getSatellitePosition(sat, t);
      const currentSegment = futureCoords[futureCoords.length - 1];
      if (currentSegment.length > 0) {
        const lastLng = currentSegment[currentSegment.length - 1][0];
        if (Math.abs(pos.lng - lastLng) > 180) {
          futureCoords.push([]);
        }
      }
      futureCoords[futureCoords.length - 1].push([pos.lng, pos.lat]);
    }

    return { pastCoords, futureCoords };
  }

  // Create spherical circle for Geostationary coverage horizon disk
  createGeoCircle(centerLng, radiusDeg = 76.0) {
    const coords = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * 2 * Math.PI;
      const lat = Math.sin(a) * (radiusDeg * 0.94);
      let lng = centerLng + Math.cos(a) * radiusDeg;
      if (lng > 180) lng -= 360;
      if (lng < -180) lng += 360;
      coords.push([lng, lat]);
    }
    return [coords];
  }

  // Initialize satellite orbit layers, footprints, and markers
  initSatelliteOrbits() {
    ['satellite-geo-fill', 'satellite-geo-line', 'satellite-orbit-past', 'satellite-orbit-future'].forEach(layerId => {
      if (this.map.getLayer(layerId)) this.map.removeLayer(layerId);
    });
    ['satellite-geo-source', 'satellite-orbit-past-source', 'satellite-orbit-future-source'].forEach(srcId => {
      if (this.map.getSource(srcId)) this.map.removeSource(srcId);
    });

    const nowSec = Date.now() / 1000;

    // 1. Build GeoJSON features for GEO coverage beams
    const geoFeatures = this.satellites.filter(s => s.orbitType === 'GEO').map(sat => ({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: this.createGeoCircle(sat.slotLng, 76.0) },
      properties: { id: sat.id, name: sat.name, color: sat.color }
    }));

    this.map.addSource('satellite-geo-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: geoFeatures }
    });

    this.map.addLayer({
      id: 'satellite-geo-fill',
      type: 'fill',
      source: 'satellite-geo-source',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.04
      }
    });

    this.map.addLayer({
      id: 'satellite-geo-line',
      type: 'line',
      source: 'satellite-geo-source',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.2,
        'line-dasharray': [4, 3],
        'line-opacity': 0.35
      }
    });

    // 2. Build GeoJSON features for LEO Past and Future orbit tracks
    const pastFeatures = [];
    const futureFeatures = [];

    this.satellites.filter(s => s.orbitType === 'LEO').forEach(sat => {
      const { pastCoords, futureCoords } = this.createOrbitTrackLines(sat, nowSec);
      pastCoords.filter(seg => seg.length >= 2).forEach(seg => {
        pastFeatures.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: seg },
          properties: { id: sat.id, name: sat.name, color: sat.color }
        });
      });
      futureCoords.filter(seg => seg.length >= 2).forEach(seg => {
        futureFeatures.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: seg },
          properties: { id: sat.id, name: sat.name, color: sat.color }
        });
      });
    });

    this.map.addSource('satellite-orbit-past-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: pastFeatures }
    });

    this.map.addSource('satellite-orbit-future-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: futureFeatures }
    });

    this.map.addLayer({
      id: 'satellite-orbit-past',
      type: 'line',
      source: 'satellite-orbit-past-source',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 2.0,
        'line-opacity': 0.65
      }
    });

    this.map.addLayer({
      id: 'satellite-orbit-future',
      type: 'line',
      source: 'satellite-orbit-future-source',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.3,
        'line-dasharray': [3, 3],
        'line-opacity': 0.4
      }
    });

    // 3. Create Interactive DOM Markers for every satellite
    Object.values(this.satelliteMarkers).forEach(m => m.remove());
    this.satelliteMarkers = {};

    this.satellites.forEach(sat => {
      const pos = this.getSatellitePosition(sat, nowSec);
      const isGeo = sat.orbitType === 'GEO';

      const el = document.createElement('div');
      el.className = `satellite-globe-marker ${isGeo ? 'is-geo' : 'is-leo'}`;
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:5px;background:rgba(11,17,32,0.92);padding:3px 7px;border-radius:6px;border:1px solid ${sat.color};color:#ffffff;font-size:10px;font-family:monospace;white-space:nowrap;box-shadow:0 0 12px ${sat.color}70;backdrop-filter:blur(6px);transition:transform 0.15s ease;">
          <span style="font-size:12px;">🛰️</span>
          <div>
            <div style="font-weight:700;color:${sat.color};line-height:1.1;">${sat.name.split(' ')[0]}</div>
            <div style="font-size:8px;color:#94a3b8;letter-spacing:0.04em;">${isGeo ? 'GEO · 35,786 km' : 'LEO · 7.45 km/s'}</div>
          </div>
        </div>
      `;

      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.15)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1.0)'; });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openSatelliteTelemetryPopup(sat);
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([pos.lng, pos.lat])
        .addTo(this.map);

      this.satelliteMarkers[sat.id] = marker;
    });
  }

  // Open detailed live telemetry card for clicked satellite
  openSatelliteTelemetryPopup(sat) {
    const nowSec = Date.now() / 1000;
    const pos = this.getSatellitePosition(sat, nowSec);
    const isGeo = sat.orbitType === 'GEO';

    const html = `
      <div style="min-width: 290px; padding: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">🛰️</span>
            <div>
              <div style="font-weight: 700; font-size: 13.5px; color: #fff;">${sat.name}</div>
              <div style="font-size: 10px; color: ${sat.color}; font-family: monospace;">${sat.agency} &middot; ${isGeo ? 'GEOSTATIONARY EQUATORIAL' : 'LEO SUN-SYNCHRONOUS'}</div>
            </div>
          </div>
          <span class="fmpop-tag" style="background: ${sat.color}20; color: ${sat.color}; border: 1px solid ${sat.color}80; font-size: 9.5px; font-weight: 700;">
            ${sat.orbitType}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
          <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: #94a3b8; font-size: 9px; text-transform: uppercase;">Orbit Altitude</div>
            <div style="color: #38bdf8; font-weight: 700; font-family: monospace; font-size: 12px;">${sat.altitudeKm.toLocaleString()} km</div>
          </div>
          <div style="background: rgba(15,23,42,0.6); padding: 6px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="color: #94a3b8; font-size: 9px; text-transform: uppercase;">Orbital Velocity</div>
            <div style="color: #34d399; font-weight: 700; font-family: monospace; font-size: 12px;">${sat.speedKmS} km/s (${sat.speedKmh.toLocaleString()} km/h)</div>
          </div>
        </div>

        <div class="info-row" style="margin-bottom: 4px; font-size: 11px;">
          <span class="info-label">Sub-Satellite Point:</span>
          <span class="info-value val-mono" style="color: #f59e0b; font-weight: 600;">
            ${pos.lat.toFixed(3)}°N, ${pos.lng.toFixed(3)}°E
          </span>
        </div>
        <div class="info-row" style="margin-bottom: 4px; font-size: 11px;">
          <span class="info-label">Core Instrument:</span>
          <span class="info-value" style="color: #cbd5e1;">${sat.sensor}</span>
        </div>
        <div class="info-row" style="margin-bottom: 4px; font-size: 11px;">
          <span class="info-label">Thermal Bands:</span>
          <span class="info-value" style="color: #e2e8f0;">${sat.fireChannel}</span>
        </div>
        <div class="info-row" style="margin-bottom: 4px; font-size: 11px;">
          <span class="info-label">Observation Cadence:</span>
          <span class="info-value" style="color: #38bdf8;">${sat.cadence}</span>
        </div>
        <div class="info-row" style="margin-bottom: 6px; font-size: 11px;">
          <span class="info-label">Coverage Horizon:</span>
          <span class="info-value" style="color: #94a3b8;">${sat.coverage}</span>
        </div>

        <button class="fmpop-btn" style="margin-top: 6px; width: 100%; font-size: 11px; padding: 7px 10px; cursor: pointer;" onclick="window.fireMapGlobe.flyToSatellite('${sat.id}')">
          🎯 Track &amp; Center Satellite on Globe
        </button>
      </div>
    `;

    if (this.satellitePopup) this.satellitePopup.remove();
    this.satellitePopup = new mapboxgl.Popup({ offset: 14, closeButton: true })
      .setLngLat([pos.lng, pos.lat])
      .setHTML(html)
      .addTo(this.map);
  }

  // Fly 3D Globe camera smoothly to track satellite
  flyToSatellite(satId) {
    const sat = this.satellites.find(s => s.id === satId);
    if (!sat) return;
    const nowSec = Date.now() / 1000;
    const pos = this.getSatellitePosition(sat, nowSec);
    this.map.flyTo({
      center: [pos.lng, pos.lat],
      zoom: sat.orbitType === 'GEO' ? 3.2 : 5.8,
      speed: 1.3,
      curve: 1.2,
      essential: true
    });
  }

  // Real-time animation loop for all satellites & orbit tracks
  startSatelliteTracker() {
    if (this._satTrackerInterval) clearInterval(this._satTrackerInterval);

    let frameCount = 0;
    this._satTrackerInterval = setInterval(() => {
      frameCount++;
      const nowSec = Date.now() / 1000;

      // 1. Update satellite marker positions on globe
      this.satellites.forEach(sat => {
        const marker = this.satelliteMarkers[sat.id];
        if (!marker) return;
        const pos = this.getSatellitePosition(sat, nowSec);
        marker.setLngLat([pos.lng, pos.lat]);
      });

      // 2. Refresh orbit tracks every 3 seconds (30 ticks)
      if (frameCount % 30 === 0 && this.map) {
        const pastFeatures = [];
        const futureFeatures = [];

        this.satellites.filter(s => s.orbitType === 'LEO').forEach(sat => {
          const { pastCoords, futureCoords } = this.createOrbitTrackLines(sat, nowSec);
          pastCoords.filter(seg => seg.length >= 2).forEach(seg => {
            pastFeatures.push({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: seg },
              properties: { id: sat.id, name: sat.name, color: sat.color }
            });
          });
          futureCoords.filter(seg => seg.length >= 2).forEach(seg => {
            futureFeatures.push({
              type: 'Feature',
              geometry: { type: 'LineString', coordinates: seg },
              properties: { id: sat.id, name: sat.name, color: sat.color }
            });
          });
        });

        const pastSource = this.map.getSource('satellite-orbit-past-source');
        if (pastSource) pastSource.setData({ type: 'FeatureCollection', features: pastFeatures });
        const futureSource = this.map.getSource('satellite-orbit-future-source');
        if (futureSource) futureSource.setData({ type: 'FeatureCollection', features: futureFeatures });
      }
    }, 100);
  }

  // =========================================================================
  // 4. LIVE GEOGRAPHIC WIND STREAMLINE ENGINE (RENDERS DIRECTLY ON THE GLOBE)
  // =========================================================================
  initWindCanvas() {
    let canvas = document.getElementById('wind-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'wind-canvas';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Number of geographic particles mapped directly across Earth's surface
    const particleCount = 360;
    this.windParticles = [];

    // Helper: test if geographic coordinate is on the visible front hemisphere of the 3D globe
    const isPointVisibleOnGlobe = (lon, lat) => {
      if (!this.map) return true;
      const isGlobe = (this.map.getProjection()?.name === 'globe') || this.isGlobeProjection;
      if (!isGlobe) {
        return lat >= -85 && lat <= 85;
      }
      const center = this.map.getCenter();
      const cLat = (center.lat * Math.PI) / 180;
      const cLng = (center.lng * Math.PI) / 180;
      const pLat = (lat * Math.PI) / 180;
      const pLng = (lon * Math.PI) / 180;
      // 3D Cartesian dot product with camera normal
      const dot = Math.sin(cLat) * Math.sin(pLat) + Math.cos(cLat) * Math.cos(pLat) * Math.cos(pLng - cLng);
      return dot > 0.08; // Visible hemisphere facing camera
    };

    // Helper: spawn a random particle on the visible globe surface
    const spawnParticle = (p) => {
      const zoom = this.map ? this.map.getZoom() : 3.5;
      const center = this.map ? this.map.getCenter() : { lng: 78.5, lat: 22.5 };
      let lon, lat;

      if (zoom > 4.5 && this.map) {
        // When zoomed in, spawn within local view bounds
        const bounds = this.map.getBounds();
        const minLng = bounds.getWest();
        const maxLng = bounds.getEast();
        const minLat = Math.max(-80, bounds.getSouth());
        const maxLat = Math.min(80, bounds.getNorth());
        lon = minLng + Math.random() * (maxLng - minLng);
        lat = minLat + Math.random() * (maxLat - minLat);
      } else {
        // When zoomed out, pick points on the front hemisphere of the 3D globe
        const span = Math.min(75, 120 / Math.max(1, zoom));
        const dLng = (Math.random() - 0.5) * 2 * span;
        const dLat = (Math.random() - 0.5) * 2 * (span * 0.75);
        lon = ((center.lng + dLng + 180) % 360) - 180;
        lat = Math.max(-75, Math.min(75, center.lat + dLat));
      }

      p.lon = lon;
      p.lat = lat;
      p.prevLon = lon;
      p.prevLat = lat;
      p.age = 0;
      p.maxAge = 40 + Math.floor(Math.random() * 55);
      p.speed = (0.04 + Math.random() * 0.06) * (Math.max(8, Number(this.windSpeedKmh) || 14) / 14.0);
      p.trail = [{ lon, lat }];
    };

    // Initialize all particles geographically
    for (let i = 0; i < particleCount; i++) {
      const p = {};
      spawnParticle(p);
      p.age = Math.floor(Math.random() * p.maxAge);
      this.windParticles.push(p);
    }

    const animate = () => {
      if (this.isWindActive && canvas.classList.contains('active') && this.map) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Wind flow direction on globe
        const driftDeg = (Number(this.windBearingDeg) + 180) % 360;
        const baseFlowRad = (driftDeg * Math.PI) / 180;

        for (let i = 0; i < this.windParticles.length; i++) {
          const p = this.windParticles[i];
          p.age++;

          // Check if current position is visible on globe
          const isVisible = isPointVisibleOnGlobe(p.lon, p.lat);

          if (!isVisible || p.age >= p.maxAge || p.lat > 82 || p.lat < -82) {
            spawnParticle(p);
            continue;
          }

          p.prevLon = p.lon;
          p.prevLat = p.lat;

          // Planetary curvature & Coriolis deflection
          const latRad = (p.lat * Math.PI) / 180;
          const coriolisDeflection = Math.sin(latRad) * 0.12;
          const flowRad = baseFlowRad + coriolisDeflection;

          // Advance along geographic spherical coordinates
          const dLat = Math.cos(flowRad) * p.speed;
          const cosLat = Math.max(0.2, Math.cos(latRad));
          const dLon = (Math.sin(flowRad) / cosLat) * p.speed;

          p.lat += dLat;
          p.lon = ((p.lon + dLon + 180) % 360) - 180;

          // Maintain streamline trail
          p.trail.push({ lon: p.lon, lat: p.lat });
          if (p.trail.length > 5) p.trail.shift();

          // Project trail onto 3D globe screen coordinates
          const projectedPts = [];
          let allVisible = true;
          for (let k = 0; k < p.trail.length; k++) {
            const pt = p.trail[k];
            if (!isPointVisibleOnGlobe(pt.lon, pt.lat)) {
              allVisible = false;
              break;
            }
            projectedPts.push(this.map.project([pt.lon, pt.lat]));
          }

          if (allVisible && projectedPts.length >= 2) {
            const lifeRatio = 1 - (p.age / p.maxAge);
            const alpha = Math.max(0.08, lifeRatio * 0.7);

            ctx.beginPath();
            ctx.moveTo(projectedPts[0].x, projectedPts[0].y);
            for (let k = 1; k < projectedPts.length; k++) {
              ctx.lineTo(projectedPts[k].x, projectedPts[k].y);
            }
            ctx.strokeStyle = `rgba(186, 230, 253, ${alpha})`;
            ctx.lineWidth = 1.35;
            ctx.stroke();

            // Glowing particle head on globe
            const head = projectedPts[projectedPts.length - 1];
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 1.2})`;
            ctx.fillRect(head.x - 1, head.y - 1, 2, 2);
          }
        }
      }
      this.windAnimationId = requestAnimationFrame(animate);
    };

    canvas.classList.add('active');
    if (this.windAnimationId) cancelAnimationFrame(this.windAnimationId);
    animate();
  }

  setWindParameters(speedKmh, bearingDeg) {
    this.windSpeedKmh = Number(speedKmh) || 14;
    this.windBearingDeg = Number(bearingDeg) || 240;

    if (this.windParticles) {
      this.windParticles.forEach(p => {
        p.speed = (0.04 + Math.random() * 0.06) * (Math.max(8, this.windSpeedKmh) / 14.0);
      });
    }

    if (this.currentHazardHotspot) {
      this.updateHazardZone(this.currentHazardHotspot.lat, this.currentHazardHotspot.lon, this.windSpeedKmh, this.windBearingDeg);
    }
  }

  toggleWind() {
    this.isWindActive = !this.isWindActive;
    const canvas = document.getElementById('wind-canvas');
    if (canvas) {
      if (this.isWindActive) canvas.classList.add('active');
      else canvas.classList.remove('active');
    }
    return this.isWindActive;
  }

  // 5. Downwind Hazard Dispersion Plume Layer (Pillar 6 Integration)
  initHazardZoneLayer() {
    if (this.map.getSource('hazard-zone-source')) return;

    this.map.addSource('hazard-zone-source', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] }
    });

    this.map.addLayer({
      id: 'hazard-zone-fill',
      type: 'fill',
      source: 'hazard-zone-source',
      paint: {
        'fill-color': [
          'interpolate', ['linear'], ['get', 'speed'],
          5, 'rgba(234, 179, 8, 0.22)',
          25, 'rgba(239, 68, 68, 0.30)'
        ],
        'fill-opacity': 0.8
      }
    });

    this.map.addLayer({
      id: 'hazard-zone-line',
      type: 'line',
      source: 'hazard-zone-source',
      paint: {
        'line-color': '#ef4444',
        'line-width': 2.2,
        'line-dasharray': [3, 2]
      }
    });

    this.map.addLayer({
      id: 'hazard-zone-label',
      type: 'symbol',
      source: 'hazard-zone-source',
      layout: {
        'text-field': '{label}',
        'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-offset': [0, 1.2],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#fca5a5',
        'text-halo-color': '#000000',
        'text-halo-width': 1.5
      }
    });
  }

  updateHazardZone(lat, lon, speedKmh = 14, bearingDeg = 240) {
    const src = this.map && this.map.getSource('hazard-zone-source');
    if (!src) return;

    if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
      src.setData({ type: 'FeatureCollection', features: [] });
      return;
    }

    // Downwind drift direction is opposite of meteorological wind direction
    const driftDeg = (Number(bearingDeg) + 180) % 360;

    // Plume distance in km scaled by wind speed (3.5 km to 35 km)
    const distKm = Math.min(35, Math.max(3.5, speedKmh * 0.75));

    // Plume expansion angle: higher wind speed -> tighter cone; lower wind -> wider dispersion
    const halfAngle = Math.max(12, Math.min(38, 45 - (speedKmh * 0.7)));

    // Geodesic destination point calculation helper
    const R = 6371; // Earth radius in km
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const lat1 = lat * toRad;
    const lon1 = lon * toRad;

    const getCoordAt = (bearingAngleDeg, distanceKm) => {
      const bRad = bearingAngleDeg * toRad;
      const dRad = distanceKm / R;
      const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dRad) + Math.cos(lat1) * Math.sin(dRad) * Math.cos(bRad));
      const lon2 = lon1 + Math.atan2(Math.sin(bRad) * Math.sin(dRad) * Math.cos(lat1), Math.cos(dRad) - Math.sin(lat1) * Math.sin(lat2));
      return [lon2 * toDeg, lat2 * toDeg];
    };

    // Construct cone arc
    const arcCoords = [];
    const steps = 24;
    const startAngle = driftDeg - halfAngle;
    const endAngle = driftDeg + halfAngle;

    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (endAngle - startAngle) * (i / steps);
      arcCoords.push(getCoordAt(a, distKm));
    }

    const polygonRing = [
      [lon, lat],
      ...arcCoords,
      [lon, lat]
    ];

    const feature = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [polygonRing]
      },
      properties: {
        speed: speedKmh,
        bearing: bearingDeg,
        distKm: distKm.toFixed(1),
        label: `🚨 DOWNWIND HAZARD ZONE (${distKm.toFixed(1)} km @ ${speedKmh} km/h)`
      }
    };

    src.setData({
      type: 'FeatureCollection',
      features: [feature]
    });
  }

  // Safe measurement stubs for backward-compatibility
  initMeasureSource() {}
  toggleMeasureTool() { return false; }
  addMeasurePoint() {}
  clearMeasure() {}
  updateMeasureGeometry() {}

  // 6. Basemap & Projection Switcher
  setBasemap(styleKey) {
    const styles = {
      satellite: 'mapbox://styles/disasterdb/cmb7ma1cm00yn01rf2vtb9od5',
      dark: 'mapbox://styles/mapbox/dark-v11',
      outdoors: 'mapbox://styles/mapbox/outdoors-v12',
      firemap: 'mapbox://styles/disasterdb/cmaycljer005l01sy9qzodnrb'
    };
    if (styles[styleKey]) {
      this.currentBasemap = styleKey;
      this.map.setStyle(styles[styleKey]);
      this.map.once('style.load', () => {
        this.configureAtmosphere();
        this.initHazardZoneLayer();
        this.initHotspotLayers();
        this.initSatelliteOrbits();
        this.updateHotspots(this.activeHotspots);
        if (this.currentHazardHotspot) {
          this.updateHazardZone(this.currentHazardHotspot.lat, this.currentHazardHotspot.lon, this.windSpeedKmh, this.windBearingDeg);
        }
      });
    }
  }

  setProjection(isGlobe) {
    this.isGlobeProjection = isGlobe;
    if (isGlobe) {
      this.map.setProjection('globe');
      this.configureAtmosphere();
      if (this.savedTerrain) {
        try {
          this.map.setTerrain(this.savedTerrain);
        } catch (e) {
          console.warn('[FireMap] Error restoring terrain:', e);
        }
      }
    } else {
      // 2D Flat Mercator mode:
      // Remove 3D DEM terrain mesh so mountains and valleys are completely flat
      try {
        const currentTerrain = this.map.getTerrain();
        if (currentTerrain) {
          this.savedTerrain = currentTerrain;
        }
        this.map.setTerrain(null);
      } catch (e) {
        console.warn('[FireMap] Error disabling terrain for 2D mode:', e);
      }
      this.map.setProjection('mercator');
      this.map.easeTo({ pitch: 0, bearing: 0, duration: 600 });
    }
  }

  flyToIndia() {
    this.map.flyTo({
      center: [78.9629, 20.5937],
      zoom: 4,
      pitch: 0,
      bearing: 0,
      essential: true
    });
  }

  flyTo(lat, lon, zoom = 12) {
    this.map.flyTo({
      center: [lon, lat],
      zoom: zoom,
      pitch: 45,
      essential: true
    });
  }

  // 7. Live Clock (Local IST & UTC)
  startClock() {
    const updateTime = () => {
      const now = new Date();
      // Local IST
      const localTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      // UTC
      const utcTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      const localEl = document.getElementById('clockLocalTime');
      const utcEl = document.getElementById('clockUtcTime');
      if (localEl) localEl.textContent = localTimeStr;
      if (utcEl) utcEl.textContent = utcTimeStr;
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  // 8. Dynamic Satellite Constellation Panel Rendering
  renderSatellitesPanel() {
    const container = document.getElementById('satellitesPanelContent');
    if (!container) return;

    const nowSec = Date.now() / 1000;
    const geoSats = this.satellites.filter(s => s.orbitType === 'GEO');
    const leoSats = this.satellites.filter(s => s.orbitType === 'LEO');

    let html = `
      <div style="display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
        <span class="layer-pill-tag" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); font-size: 10px; padding: 3px 8px;">
          🛰️ 3 GEOSTATIONARY (35,786 km)
        </span>
        <span class="layer-pill-tag" style="background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.4); font-size: 10px; padding: 3px 8px;">
          🌍 6 LEO POLAR (824 km)
        </span>
      </div>

      <div style="font-size: 11px; color: #94a3b8; margin-bottom: 14px; line-height: 1.4;">
        High-precision SGP4/Keplerian live propagation of active fire monitoring constellations. Click any satellite to track its live footprint on the 3D globe.
      </div>

      <div class="layer-section-title" style="margin: 10px 0 6px 0; color: #38bdf8;">
        🛰️ Geostationary Constant-Watch (15-Min Rapid Indian Cadence)
      </div>
    `;

    geoSats.forEach(sat => {
      const pos = this.getSatellitePosition(sat, nowSec);
      html += `
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-left: 3px solid ${sat.color}; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-weight: 700; font-size: 12.5px; color: #fff;">${sat.name}</div>
              <div style="font-size: 10px; color: ${sat.color}; font-family: monospace;">${sat.agency} &middot; Slot: ${sat.slotLng}°E &middot; 35,786 km</div>
            </div>
            <button class="btn btn-outline" style="font-size: 10px; padding: 3px 8px; border-color: ${sat.color}80; color: ${sat.color}; cursor: pointer;" onclick="window.fireMapGlobe.flyToSatellite('${sat.id}')">
              Track ↗
            </button>
          </div>
          <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 5px;">
            ${sat.sensor} &middot; <strong style="color: #38bdf8;">${sat.cadence}</strong>
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #94a3b8; margin-top: 4px;">
            Current Nadir: ${pos.lat.toFixed(3)}°N, ${pos.lng.toFixed(3)}°E (0° Slant Overhead)
          </div>
        </div>
      `;
    });

    html += `
      <div class="layer-section-title" style="margin: 14px 0 6px 0; color: #34d399;">
        🌍 Sun-Synchronous Polar LEO Constellation (~7.45 km/s)
      </div>
    `;

    leoSats.forEach(sat => {
      const pos = this.getSatellitePosition(sat, nowSec);
      html += `
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-left: 3px solid ${sat.color}; border-radius: 6px; padding: 10px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-weight: 700; font-size: 12.5px; color: #fff;">${sat.name}</div>
              <div style="font-size: 10px; color: ${sat.color}; font-family: monospace;">${sat.agency} &middot; Alt: ${sat.altitudeKm} km &middot; 26,820 km/h</div>
            </div>
            <button class="btn btn-outline" style="font-size: 10px; padding: 3px 8px; border-color: ${sat.color}80; color: ${sat.color}; cursor: pointer;" onclick="window.fireMapGlobe.flyToSatellite('${sat.id}')">
              Track ↗
            </button>
          </div>
          <div style="font-size: 10.5px; color: #cbd5e1; margin-top: 5px;">
            ${sat.sensor} &middot; <span style="color: #22c55e;">${sat.fireChannel}</span>
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #34d399; margin-top: 4px;">
            Sub-Satellite Point: ${pos.lat.toFixed(3)}°N, ${pos.lng.toFixed(3)}°E
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
}
