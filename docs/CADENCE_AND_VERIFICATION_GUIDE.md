# SATELLITE CADENCE, FREQUENCY & LIVE VERIFICATION GUIDE
## How Frequently Data Arrives & How to Verify Every Feed

---

## 1. Complete Temporal Cadence Breakdown

| Satellite Mission | Sensor Type | Pass Frequency Over India | Data Latency (Processing Time) | What Data it Delivers | Real-Time Live Status in App |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Meteosat MSG-IODC** | SEVIRI Geostationary | **Every 15 minutes** (96 times / day) | 8 – 12 minutes | Continuous thermal surveillance; flare blowout alerts | **LIVE via python eumdac microservice** (`/api/seviri/live`) |
| **ISRO INSAT-3D/3DR** | Imager Geostationary | **Every 15 minutes** (interleaved) | 15 – 30 minutes | Overhead Indian thermal monitoring without slant distortion | **MODELED & CROSS-REFERENCED** via MOSDAC format |
| **NASA/NOAA VIIRS** (Suomi-NPP, NOAA-20, NOAA-21) | Polar LEO 375m | **4 to 6 passes per day** across India | 1.5 – 3.0 hours | Pinpoint 375m coordinates, Fire Radiative Power (MW), Brightness Temp | **100% LIVE via NASA FIRMS API** (CSV stream) |
| **VIIRS Nightfire (VNF)** | Polar LEO SWIR/NIR | **2 night passes per day** | 3 – 5 hours | Blackbody Planck Temperature ($K$), radiant heat ($W/m^2$) | **MODELED via dual-band Planck fit equations** |
| **Copernicus Sentinel-5P** | Atmospheric TROPOMI | **Once every 24 hours (Daily)** (~13:30 local solar time) | 3 – 6 hours | $CO$, $NO_2$, $SO_2$, UV Aerosol Index (UVAI) | **CALCULATED via combustion chemistry & Copernicus Data Space deep link** |
| **Copernicus Sentinel-2** | 10m/20m Multi-Spectral MSI | **Once every 5 days** (~10:30 AM local solar time) | 2 – 4 hours | 10m true-color & SWIR B12/B8A $\Delta\text{NBR}$ burn scar index | **FORENSIC AUDIT via direct Copernicus Browser L2A deep link** |
| **Open-Meteo / IMD Weather** | Ground & Numerical Forecast | **Real-Time on Demand** | Instant (<200 ms) | Local air temperature, humidity, precipitation, wind speed & bearing | **100% LIVE API** (queried per coordinate) |

---

## 2. Step-by-Step Live Telemetry Verification Guide

If an evaluator, judge, or auditor asks: **"How can I prove this is real live data and not fabricated numbers?"**, follow these 4 verification procedures:

### Verification Method 1: The NASA FIRMS Official Map Test
1. Click any red fire marker on the AGNI-VISION map.
2. In the left dossier sidebar, note the exact **Latitude & Longitude** (e.g. `28.4082°N, 77.8540°E`) and **Acquisition Timestamp** (e.g. `2026-09-25 02:05`).
3. Open the official NASA Fire Map: **[https://firms.modaps.eosdis.nasa.gov/map/](https://firms.modaps.eosdis.nasa.gov/map/)**.
4. In the top right, select the matching date and turn on the layer **VIIRS S-NPP (375m)**.
5. Zoom into the same coordinates.
6. **Result**: The identical fire icon will be present on NASA's official global portal at the exact latitude/longitude.

### Verification Method 2: Inspect the Raw NASA API Stream
Open your browser and paste this URL (which uses your project's active NASA FIRMS API key):
```
https://firms.modaps.eosdis.nasa.gov/api/area/csv/d8f1e29a3c7b504e9281a4f028b17c91/VIIRS_SNPP_NRT/68,6,98,37/1
```
* This returns the raw CSV downloaded straight from NASA's Goddard Space Flight Center servers.
* Search for any coordinate displayed on your screen to find its raw line in the NASA telemetry stream.

### Verification Method 3: Google Maps High-Resolution Satellite Ground-Truth
1. In the hotspot sidebar, click the **📍 Google Maps** button next to the coordinates.
2. Switch Google Maps to **Satellite Layer**.
3. **Result**: You will visually inspect the physical ground infrastructure at that point (e.g., an industrial chimney, flare stack, brick kiln cluster, or open agricultural plot).

### Verification Method 4: Copernicus Data Space Browser Deep-Link
1. In the hotspot sidebar, locate the **Atmospheric & Aerosol Corroboration** panel.
2. Click **"Inspect L2A Tile in Copernicus Browser"** or **"TROPOMI Gas Layer →"**.
3. **Result**: The official European Space Agency (ESA) Copernicus Data Space Browser will open automatically centered on that exact coordinate with active atmospheric and optical layers.
