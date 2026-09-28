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
      { id: 'sat-noaa20', name: 'NOAA-20 (VIIRS)', color: '#34d399', inclination: 98.7, periodMin: 101, offset: 0.15 },
      { id: 'sat-snpp',   name: 'Suomi-NPP (VIIRS)', color: '#10b981', inclination: 98.7, periodMin: 101, offset: 0.45 },
      { id: 'sat-s3a',    name: 'Sentinel-3A (SLSTR)', color: '#f59e0b', inclination: 98.6, periodMin: 100, offset: 0.72 },
      { id: 'sat-insat',  name: 'INSAT-3DR (Geo)', color: '#38bdf8', inclination: 0.1, periodMin: 1436, offset: 0.20, isGeo: true, lng: 74.0 },
      { id: 'sat-msg',    name: 'Meteosat-11 (SEVIRI)', color: '#c084fc', inclination: 0.1, periodMin: 1436, offset: 0.12, isGeo: true, lng: 45.5 },
    ];
    this.satelliteMarkers = {};
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

  // 3. 3D Satellite Orbits and Trajectories
  initSatelliteOrbits() {
    if (this.map.getSource('satellite-orbits')) return;

    // Generate orbital trajectory lines
    const orbitFeatures = this.satellites.map(sat => {
      const coords = [];
      const steps = 120;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 2 * Math.PI;
        let lng, lat;
        if (sat.isGeo) {
          // Geostationary orbital ring over equatorial slot
          lng = sat.lng + Math.cos(theta) * 0.8;
          lat = Math.sin(theta) * 0.4;
        } else {
          // Low Earth Orbit (LEO) inclined polar track
          lng = ((theta * 180 / Math.PI * 1.5 + (sat.offset * 360)) % 360) - 180;
          lat = Math.sin(theta) * (sat.inclination > 90 ? 180 - sat.inclination : sat.inclination);
        }
        coords.push([lng, lat]);
      }
      return {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: { id: sat.id, name: sat.name, color: sat.color }
      };
    });

    this.map.addSource('satellite-orbits', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: orbitFeatures }
    });

    this.map.addLayer({
      id: 'satellite-orbit-lines',
      type: 'line',
      source: 'satellite-orbits',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 1.2,
        'line-dasharray': [3, 3],
        'line-opacity': 0.45
      }
    });

    // Create DOM markers for each satellite
    this.satellites.forEach(sat => {
      const el = document.createElement('div');
      el.className = 'satellite-globe-marker';
      el.innerHTML = `
        <div style="display:flex;align-items:center;gap:4px;background:rgba(15,23,42,0.85);padding:2px 6px;border-radius:4px;border:1px solid ${sat.color};color:${sat.color};font-size:9px;font-family:monospace;white-space:nowrap;box-shadow:0 0 8px ${sat.color}60;">
          <span>🛰️</span>
          <strong>${sat.name.split(' ')[0]}</strong>
        </div>
      `;
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(sat.isGeo ? [sat.lng, 0] : [0, 0])
        .addTo(this.map);

      this.satelliteMarkers[sat.id] = marker;
    });
  }

  // Animate satellites along their orbit
  startSatelliteTracker() {
    let t = 0;
    setInterval(() => {
      t += 0.005;
      this.satellites.forEach(sat => {
        const marker = this.satelliteMarkers[sat.id];
        if (!marker) return;

        if (sat.isGeo) {
          // Stationary in geostationary slot with slight figure-8 analemma
          const lng = sat.lng;
          const lat = Math.sin(t * 2) * 1.5;
          marker.setLngLat([lng, lat]);
        } else {
          // Move along LEO path
          const theta = t * (60 / sat.periodMin) + sat.offset * 2 * Math.PI;
          const lng = ((theta * 180 / Math.PI * 1.5) % 360) - 180;
          const lat = Math.sin(theta) * (sat.inclination > 90 ? 180 - sat.inclination : sat.inclination);
          marker.setLngLat([lng, lat]);
        }
      });
    }, 100);
  }

  // 4. Live Wind Streamline Particle Engine
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

    // Streamline particles
    const particleCount = 220;
    this.windParticles = [];
    const driftDeg = (Number(this.windBearingDeg) + 180) % 360;
    const baseAngle = ((driftDeg - 90) * Math.PI) / 180;
    const baseSpeed = Math.max(0.6, (Number(this.windSpeedKmh) / 12.0) * 2.2);

    for (let i = 0; i < particleCount; i++) {
      this.windParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: 12 + Math.random() * 18,
        speed: baseSpeed * (0.8 + Math.random() * 0.4),
        angle: baseAngle + (Math.random() * 0.35 - 0.175),
        alpha: 0.12 + Math.random() * 0.45
      });
    }

    const animate = () => {
      if (this.isWindActive && canvas.classList.contains('active')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1.3;

        this.windParticles.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          const endX = p.x + Math.cos(p.angle) * p.length;
          const endY = p.y + Math.sin(p.angle) * p.length;
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(180, 220, 255, ${p.alpha})`;
          ctx.stroke();

          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;

          if (p.x > canvas.width || p.x < 0 || p.y > canvas.height || p.y < 0) {
            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
          }
        });
      }
      this.windAnimationId = requestAnimationFrame(animate);
    };

    canvas.classList.add('active');
    animate();
  }

  setWindParameters(speedKmh, bearingDeg) {
    this.windSpeedKmh = Number(speedKmh) || 14;
    this.windBearingDeg = Number(bearingDeg) || 240;
    const driftDeg = (this.windBearingDeg + 180) % 360;
    const screenAngle = ((driftDeg - 90) * Math.PI) / 180;
    const baseSpeed = Math.max(0.6, (this.windSpeedKmh / 12.0) * 2.2);

    if (this.windParticles) {
      this.windParticles.forEach(p => {
        p.speed = baseSpeed * (0.8 + Math.random() * 0.4);
        p.angle = screenAngle + (Math.random() * 0.35 - 0.175);
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
}
