import { defineConfig } from 'vite';

const firmsLog = (name) => (proxy) => {
  proxy.on('proxyReq', () => {
    console.log(`[FIRMS] Fetching real ${name} detections from firms.modaps.eosdis.nasa.gov ...`);
  });
  proxy.on('proxyRes', (res) => {
    console.log(`[FIRMS] ${name} → HTTP ${res.statusCode} (${res.headers['content-length'] || '?'} bytes)`);
  });
  proxy.on('error', (err) => {
    console.warn(`[FIRMS] ${name} fetch error:`, err.message);
  });
};

export default defineConfig({
  server: {
    port: 5173,
    host: true,
    proxy: {
      // ── VIIRS NOAA-20 (J1) ──────────────────────────────────
      '/api/firms/noaa20/24h': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_24h.csv',
        configure: firmsLog('NOAA-20 VIIRS 24h')
      },
      '/api/firms/noaa20/7d': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_7d.csv',
        configure: firmsLog('NOAA-20 VIIRS 7d')
      },

      // ── VIIRS NOAA-21 (J2) ──────────────────────────────────
      '/api/firms/noaa21/24h': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_South_Asia_24h.csv',
        configure: firmsLog('NOAA-21 VIIRS 24h')
      },
      '/api/firms/noaa21/7d': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_South_Asia_7d.csv',
        configure: firmsLog('NOAA-21 VIIRS 7d')
      },

      // ── VIIRS Suomi-NPP ─────────────────────────────────────
      '/api/firms/snpp/24h': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_24h.csv',
        configure: firmsLog('Suomi-NPP VIIRS 24h')
      },
      '/api/firms/snpp/7d': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_7d.csv',
        configure: firmsLog('Suomi-NPP VIIRS 7d')
      },

      // ── MODIS Terra (collection 6.1) ─────────────────────────
      '/api/firms/modis-terra/24h': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/modis-c6.1/csv/MODIS_C6_1_South_Asia_24h.csv',
        configure: firmsLog('MODIS Terra 24h')
      },
      '/api/firms/modis-terra/7d': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/modis-c6.1/csv/MODIS_C6_1_South_Asia_7d.csv',
        configure: firmsLog('MODIS Terra 7d')
      },

      // ── Open-Meteo weather ───────────────────────────────────
      '/api/weather': {
        target: 'https://api.open-meteo.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, '/v1/forecast'),
        configure: (proxy) => {
          proxy.on('proxyReq', () => console.log('[WEATHER] Fetching Open-Meteo wind/weather data...'));
        }
      },

      // ── EUMETSAT SEVIRI (eumdac Python Microservice) ────────
      '/api/seviri': {
        target: 'http://127.0.0.1:5174',
        changeOrigin: true,
        secure: false
      },

      // ── Legacy routes (keep backward compat) ────────────────
      '/api/nasa-firms-noaa20': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_24h.csv',
      },
      '/api/nasa-firms-snpp': {
        target: 'https://firms.modaps.eosdis.nasa.gov',
        changeOrigin: true,
        secure: true,
        rewrite: () => '/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_24h.csv',
      }
    }
  }
});
