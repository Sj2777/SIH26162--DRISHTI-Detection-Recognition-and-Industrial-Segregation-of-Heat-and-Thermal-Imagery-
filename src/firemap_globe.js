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
    this.isMeasuring = false;
    this.measurePoints = [];
    this.measureLineFeature = null;
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
      this.initHotspotLayers();
      this.initSatelliteOrbits();
      this.initMeasureSource();
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

  // 2. Initialize Hotspot Cluster and Circle Layers
  initHotspotLayers() {
    if (this.map.getSource('fire-hotspots')) return;

    this.map.addSource('fire-hotspots', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 45
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
        'circle-color': [
          'match', ['get', 'fire_type'],
          'THERMAL_ANOMALY_BLOWOUT', '#ef4444',
          'INDUSTRIAL_FLARE', '#f97316',
          'COAL_MINE_FIRE', '#eab308',
          'AGRICULTURAL_STUBBLE', '#84cc16',
          '#ff4500' // default wildfire
        ],
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'frp'],
          0, 8,
          50, 14,
          200, 24
        ],
        'circle-opacity': 0.4,
        'circle-blur': 0.5
      }
    });

    // E. Unclustered Individual Fire Core
    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'fire-hotspots',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match', ['get', 'fire_type'],
          'THERMAL_ANOMALY_BLOWOUT', '#ef4444',
          'INDUSTRIAL_FLARE', '#f97316',
          'COAL_MINE_FIRE', '#eab308',
          'AGRICULTURAL_STUBBLE', '#84cc16',
          '#ff4500'
        ],
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'frp'],
          0, 4.5,
          50, 7.5,
          200, 12
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Click cluster to zoom in
    this.map.on('click', 'clusters', (e) => {
      const features = this.map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
      const clusterId = features[0].properties.cluster_id;
      this.map.getSource('fire-hotspots').getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        this.map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom + 0.5
        });
      });
    });

    // Click individual hotspot for FireMap popup
    this.map.on('click', 'unclustered-point', (e) => {
      if (!e.features || !e.features[0]) return;
      const f = e.features[0];
      const p = f.properties;
      const coords = f.geometry.coordinates.slice();

      const isMine = p.fire_type === 'MINE' || (p.facility_name && (p.facility_name.includes('Mine') || p.facility_name.includes('Coal') || p.facility_name.includes('Colliery')));
      const typeColor = isMine ? '#a855f7' :
                        p.fire_type === 'INDUSTRIAL_HIGH_ALERT' ? '#ef4444' :
                        p.fire_type === 'FACTORY' ? '#f97316' :
                        p.fire_type === 'CROP' ? '#b45309' :
                        p.fire_type === 'WILDFIRE' ? '#22c55e' :
                        p.fire_type === 'HEAT_RING' ? '#eab308' : '#64748b';
      const typeLabel = isMine ? 'MINE (OPEN-CAST)' : (p.fire_type || 'THERMAL HOTSPOT').replace(/_/g, ' ');
      const title = p.facility_name || (isMine ? 'Open-Cast Coal Mine' : (p.region ? `${p.region} Thermal Detection` : 'Active Thermal Detection'));
      const operator = p.operator || (isMine ? 'Coal India Limited / Regional Subsidiary' : 'Natural / Rural Area');

      const html = `
        <div style="min-width: 270px; padding: 2px;">
          <div class="fmpop-header">
            <span class="fmpop-tag" style="background: ${typeColor}20; color: ${typeColor}; border: 1px solid ${typeColor}70;">
              ${typeLabel}
            </span>
            <span style="font-size: 11px; color: #94a3b8; font-family: var(--fm-font-mono);">${p.satellite || 'VIIRS Suomi-NPP'}</span>
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
            <span class="info-value" style="color: ${isMine ? '#c084fc' : '#ffffff'}; font-weight: 600;">${operator}</span>
          </div>
          <button class="fmpop-btn" id="fmpop-inspect-btn">
            Inspect Full Dossier &rarr;
          </button>
        </div>
      `;

      new mapboxgl.Popup({ offset: 12, closeButton: true })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(this.map);

      setTimeout(() => {
        const btn = document.getElementById('fmpop-inspect-btn');
        if (btn) {
          btn.addEventListener('click', () => {
            const raw = this.activeHotspots.find(h => h.id === p.id) || p;
            this.onHotspotInspect(raw);
          });
        }
      }, 50);

      const raw = this.activeHotspots.find(h => h.id === p.id) || p;
      this.onHotspotSelect(raw);
    });

    // Pointer cursors
    this.map.on('mouseenter', 'clusters', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'clusters', () => { this.map.getCanvas().style.cursor = ''; });
    this.map.on('mouseenter', 'unclustered-point', () => { this.map.getCanvas().style.cursor = 'pointer'; });
    this.map.on('mouseleave', 'unclustered-point', () => { this.map.getCanvas().style.cursor = ''; });
  }

  // Update hotspots dataset
  updateHotspots(hotspots = []) {
    this.activeHotspots = hotspots;
    const source = this.map && this.map.getSource('fire-hotspots');
    if (!source) return;

    const features = hotspots.map(h => ({
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
        fire_type: h.fire_type || 'WILDFIRE',
        facility_name: h.facility_name || 'Active Thermal Detection',
        operator: h.operator || 'Natural / Rural Area',
        acq_date: h.acq_date || h.date || new Date().toISOString().slice(0, 10),
        acq_time: h.acq_time || '1200'
      }
    }));

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
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        length: 12 + Math.random() * 18,
        speed: 1.2 + Math.random() * 2.4,
        angle: (240 + (Math.random() * 40 - 20)) * Math.PI / 180, // SW-NE monsoon drift
        alpha: 0.1 + Math.random() * 0.4
      });
    }

    const animate = () => {
      if (this.isWindActive && canvas.classList.contains('active')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1.2;

        particles.forEach(p => {
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

  toggleWind() {
    this.isWindActive = !this.isWindActive;
    const canvas = document.getElementById('wind-canvas');
    if (canvas) {
      if (this.isWindActive) canvas.classList.add('active');
      else canvas.classList.remove('active');
    }
    return this.isWindActive;
  }

  // 5. Geodesic Distance Measurement Tool
  initMeasureSource() {
    if (this.map.getSource('measure-source')) return;

    this.map.addSource('measure-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    this.map.addLayer({
      id: 'measure-line',
      type: 'line',
      source: 'measure-source',
      paint: {
        'line-color': '#38bdf8',
        'line-width': 2.5,
        'line-dasharray': [2, 2]
      }
    });

    this.map.addLayer({
      id: 'measure-points',
      type: 'circle',
      source: 'measure-source',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 5,
        'circle-color': '#ff4500',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    this.map.on('click', (e) => {
      if (!this.isMeasuring) return;
      this.addMeasurePoint(e.lngLat);
    });
  }

  toggleMeasureTool() {
    this.isMeasuring = !this.isMeasuring;
    const panel = document.getElementById('measurePanel');
    if (this.isMeasuring) {
      if (panel) panel.classList.add('active');
      this.measurePoints = [];
      this.updateMeasureGeometry();
    } else {
      if (panel) panel.classList.remove('active');
      this.clearMeasure();
    }
    return this.isMeasuring;
  }

  addMeasurePoint(lngLat) {
    this.measurePoints.push([lngLat.lng, lngLat.lat]);
    this.updateMeasureGeometry();
  }

  clearMeasure() {
    this.measurePoints = [];
    this.updateMeasureGeometry();
    const kmEl = document.getElementById('measureKm');
    const miEl = document.getElementById('measureMi');
    if (kmEl) kmEl.textContent = '0.00 km';
    if (miEl) miEl.textContent = '0.00 mi';
  }

  updateMeasureGeometry() {
    const src = this.map && this.map.getSource('measure-source');
    if (!src) return;

    const features = [];
    if (this.measurePoints.length >= 2) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: this.measurePoints },
        properties: {}
      });
    }
    this.measurePoints.forEach(pt => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: pt },
        properties: {}
      });
    });

    src.setData({ type: 'FeatureCollection', features });

    // Calculate distance
    let totalDistKm = 0;
    for (let i = 0; i < this.measurePoints.length - 1; i++) {
      totalDistKm += this.calcHaversine(this.measurePoints[i], this.measurePoints[i+1]);
    }
    const totalDistMi = totalDistKm * 0.621371;

    const kmEl = document.getElementById('measureKm');
    const miEl = document.getElementById('measureMi');
    if (kmEl) kmEl.textContent = `${totalDistKm.toFixed(2)} km`;
    if (miEl) miEl.textContent = `${totalDistMi.toFixed(2)} mi`;
  }

  calcHaversine(pt1, pt2) {
    const R = 6371; // km
    const dLat = (pt2[1] - pt1[1]) * Math.PI / 180;
    const dLon = (pt2[0] - pt1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pt1[1] * Math.PI / 180) * Math.cos(pt2[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

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
        this.initHotspotLayers();
        this.initSatelliteOrbits();
        this.initMeasureSource();
        this.updateHotspots(this.activeHotspots);
      });
    }
  }

  setProjection(isGlobe) {
    this.isGlobeProjection = isGlobe;
    this.map.setProjection(isGlobe ? 'globe' : 'mercator');
    if (isGlobe) this.configureAtmosphere();
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
