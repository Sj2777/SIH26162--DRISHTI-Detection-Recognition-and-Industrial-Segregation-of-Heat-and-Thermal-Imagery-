# AGNI-VISION: Geospatial Thermal Intelligence Platform

Space-to-ground multi-satellite geospatial intelligence platform for automated detection, classification, and statutory incident response for industrial thermal anomalies, flares, and wildfires across India.

---

## EUMETSAT SEVIRI Integration (via `eumdac` Python SDK)

AGNI-VISION uses the official **EUMETSAT Data Access Client (`eumdac` v3.1.1)** to interface directly with the **Meteosat-9 / Meteosat-11 MSG-IODC** geostationary satellite stationed at **45.5°E longitude**:

- **Sensor**: Spinning Enhanced Visible and InfraRed Imager (SEVIRI)
- **Scan Cadence**: 15-minute rapid full-disk scans (96 passes per 24 hours)
- **Thermal Bands**: Channel 4 (MIR 3.9 µm - Sub-pixel fires/flares) & Channel 9 (TIR 10.8 µm - Background LST)
- **Target Collection**: `EO:EUM:DAT:MSG:HRSEVIRI-IODC` (High Rate SEVIRI Level 1.5 Image Data - Indian Ocean)
- **Spatial Coverage**: Complete view of the Indian Subcontinent ($68^\circ\text{E} - 97.5^\circ\text{E}$, $6.5^\circ\text{N} - 37^\circ\text{N}$)

### 1. Python Environment Setup

The Python virtual environment with `eumdac` is installed at `./venv`:

```bash
# Check eumdac version and authentication status
./venv/bin/python backend/seviri_eumdac.py status
```

### 2. EUMETSAT API Key Registration

EUMETSAT Data Store API access is free:
1. Register at: [https://api.eumetsat.int/api-key](https://api.eumetsat.int/api-key)
2. Generate your **Consumer Key** and **Consumer Secret**.
3. Add them to `.env`:
   ```bash
   EUMETSAT_CONSUMER_KEY=your_consumer_key_here
   EUMETSAT_CONSUMER_SECRET=your_consumer_secret_here
   ```
   Or set them via CLI:
   ```bash
   ./venv/bin/python backend/seviri_eumdac.py set-credentials --key <KEY> --secret <SECRET>
   ```

### 3. CLI Commands

```bash
# Search SEVIRI 15-min rapid scans over India in the last 3 hours
./venv/bin/python backend/seviri_eumdac.py search --hours 3

# Sync latest SEVIRI product metadata into public/data/seviri_live.json
./venv/bin/python backend/seviri_eumdac.py sync

# Run the local API microservice (proxied via Vite at /api/seviri)
./venv/bin/python backend/seviri_eumdac.py serve --port 5174
```

---

## Web Application

```bash
# Start frontend development server
npm run dev

# Build production bundle
npm run build
```

---

## Technical Documentation Suite

For complete architectural, mathematical, and operational details:
* 📖 **[Main Technical Specification & Architecture](DOCUMENTATION.md)**
* 🛰️ **[Satellite Remote Sensing & Sensor Physics](docs/SATELLITE_REMOTE_SENSING.md)**
* ⚡ **[Geostationary SEVIRI & ISRO INSAT-3DR Guide](docs/GEOSTATIONARY_SEVIRI_INSAT.md)**
* 🔍 **[Satellite Cadence, Frequencies & Live Verification Guide](docs/CADENCE_AND_VERIFICATION_GUIDE.md)**
