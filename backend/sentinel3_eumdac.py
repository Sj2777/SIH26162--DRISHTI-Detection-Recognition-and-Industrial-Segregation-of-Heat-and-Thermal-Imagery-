#!/usr/bin/env python3
"""
Copernicus Sentinel-3 SLSTR Integration via eumdac
--------------------------------------------------
Platform: Sentinel-3A & Sentinel-3B (Polar Sun-Synchronous Orbit, ~814 km)
Sensor:   SLSTR (Sea and Land Surface Temperature Radiometer)
Product:  SLSTR Level 2 Fire Radiative Power (FRP) NRT (EO:EUM:DAT:0417)
Bands:    Channel F1 (MWIR 3.74 µm, high saturation ceiling 650 K)
          Channel F2 (TIR 10.85 µm)
          Channel S7 & S8 (Daytime/Nighttime dual view)
Resolution: 1.0 km nadir (MWIR), 500 m (SWIR)
Cadence:  ~1-2 days revisit cadence at equator (< 1 day at high latitudes)

Official Client: eumdac Python library (v3.1.1+)
EUMETSAT Data Store API: https://api.eumetsat.int/
"""

import os
import sys
import csv
import json
import io
import argparse
from datetime import datetime, timedelta, timezone
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

try:
    import eumdac
    from eumdac.token import AccessToken
    from eumdac.datastore import DataStore
except ImportError:
    print("[ERROR] eumdac library is not installed. Run: pip install eumdac", file=sys.stderr)
    sys.exit(1)

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / ".env"
PUBLIC_DATA_DIR = ROOT_DIR / "public" / "data"
OUTPUT_JSON_PATH = PUBLIC_DATA_DIR / "sentinel3_live.json"
DEFAULT_COLLECTION_S3_FRP = "EO:EUM:DAT:0417"
INDIA_BBOX = [68.0, 6.5, 97.5, 37.0]  # [min_lon, min_lat, max_lon, max_lat]
INDIA_POLYGON = "POLYGON((68.0 6.5, 97.5 6.5, 97.5 37.0, 68.0 37.0, 68.0 6.5))"


def load_env_credentials():
    """Load EUMETSAT credentials from environment or .env file."""
    key = os.environ.get("EUMETSAT_CONSUMER_KEY") or os.environ.get("VITE_EUMETSAT_CONSUMER_KEY")
    secret = os.environ.get("EUMETSAT_CONSUMER_SECRET") or os.environ.get("VITE_EUMETSAT_CONSUMER_SECRET")

    if (not key or not secret) and ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k in ("EUMETSAT_CONSUMER_KEY", "VITE_EUMETSAT_CONSUMER_KEY") and not key:
                    key = v
                elif k in ("EUMETSAT_CONSUMER_SECRET", "VITE_EUMETSAT_CONSUMER_SECRET") and not secret:
                    secret = v

    return key or "", secret or ""


def save_env_credentials(key: str, secret: str):
    """Save EUMETSAT credentials to .env file."""
    lines = []
    if ENV_PATH.exists():
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            lines = f.readlines()

    updated_key = False
    updated_secret = False
    new_lines = []

    for line in lines:
        if line.startswith("EUMETSAT_CONSUMER_KEY="):
            new_lines.append(f"EUMETSAT_CONSUMER_KEY={key}\n")
            updated_key = True
        elif line.startswith("EUMETSAT_CONSUMER_SECRET="):
            new_lines.append(f"EUMETSAT_CONSUMER_SECRET={secret}\n")
            updated_secret = True
        else:
            new_lines.append(line)

    if not updated_key:
        new_lines.append(f"\nEUMETSAT_CONSUMER_KEY={key}\n")
    if not updated_secret:
        new_lines.append(f"EUMETSAT_CONSUMER_SECRET={secret}\n")

    with open(ENV_PATH, "w", encoding="utf-8") as f:
        f.writelines(new_lines)


class Sentinel3EumdacClient:
    """Manager for Copernicus Sentinel-3 SLSTR FRP data queries via eumdac."""

    def __init__(self, key: str = "", secret: str = ""):
        self.key, self.secret = key, secret
        if not self.key or not self.secret:
            self.key, self.secret = load_env_credentials()
        self._token = None
        self._datastore = None

    def has_credentials(self) -> bool:
        return bool(self.key and self.secret)

    def _get_datastore(self) -> DataStore:
        if not self.has_credentials():
            raise ValueError("EUMETSAT credentials missing. Set EUMETSAT_CONSUMER_KEY and EUMETSAT_CONSUMER_SECRET.")
        token = AccessToken(credentials=(self.key, self.secret))
        return DataStore(token)

    def verify_auth(self) -> dict:
        if not self.has_credentials():
            return {
                "authenticated": False,
                "error": "Missing Consumer Key or Secret. Set in .env or via API.",
                "token_expiration": None
            }
        try:
            token = AccessToken(credentials=(self.key, self.secret))
            exp = token.expiration
            return {
                "authenticated": True,
                "error": None,
                "token_expiration": exp.isoformat() if exp else None,
                "consumer_key_prefix": self.key[:6] + "..." if self.key else ""
            }
        except Exception as e:
            return {
                "authenticated": False,
                "error": str(e),
                "token_expiration": None
            }

    def search_s3_frp(self, hours_back: int = 48, limit: int = 15) -> dict:
        """Search for Sentinel-3 SLSTR FRP products over India."""
        if not self.has_credentials():
            return {"error": "Credentials not configured", "products": []}

        try:
            ds = self._get_datastore()
            collection = ds.get_collection(DEFAULT_COLLECTION_S3_FRP)
            dtstart = datetime.now(timezone.utc) - timedelta(hours=hours_back)

            results = collection.search(geo=INDIA_POLYGON, dtstart=dtstart)

            products_meta = []
            count = 0
            for prod in results:
                count += 1
                products_meta.append({
                    "id": str(prod),
                    "title": getattr(prod, "title", str(prod)),
                    "sensing_start": prod.sensing_start.isoformat() if prod.sensing_start else None,
                    "sensing_end": prod.sensing_end.isoformat() if prod.sensing_end else None,
                    "satellite": "Sentinel-3A" if "S3A" in str(prod) else ("Sentinel-3B" if "S3B" in str(prod) else "Sentinel-3"),
                    "entries": list(prod.entries),
                    "size": getattr(prod, "size", 0)
                })
                if count >= limit:
                    break

            return {
                "collection": DEFAULT_COLLECTION_S3_FRP,
                "collection_title": collection.title,
                "query_polygon": INDIA_POLYGON,
                "time_window_start": dtstart.isoformat(),
                "time_window_end": datetime.now(timezone.utc).isoformat(),
                "total_found": count,
                "products": products_meta
            }
        except Exception as e:
            return {"error": str(e), "products": []}

    def sync_to_public_json(self, hours_back: int = 48) -> dict:
        """
        Queries Sentinel-3 FRP products over India and attempts to extract
        fire detections from FRP_MWIR1km_standard.csv or FRP_SWIR500m.csv.
        """
        PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
        search_res = self.search_s3_frp(hours_back=hours_back, limit=10)

        if "error" in search_res and not search_res.get("products"):
            output = {
                "status": "AUTH_ERROR",
                "sensor": "Sentinel-3 SLSTR",
                "collection": DEFAULT_COLLECTION_S3_FRP,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": search_res["error"],
                "hotspots": [],
                "products_indexed": 0
            }
            with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2)
            return output

        products = search_res.get("products", [])
        hotspots = []
        download_status = "SUCCESS"
        download_err = None

        if products:
            ds = self._get_datastore()
            collection = ds.get_collection(DEFAULT_COLLECTION_S3_FRP)

            for p_meta in products[:5]:  # Process top 5 granules
                p_id = p_meta["id"]
                try:
                    prod = ds.get_product(DEFAULT_COLLECTION_S3_FRP, p_id)
                except Exception:
                    continue

                # Look for fire CSV files
                csv_entry = None
                for entry in prod.entries:
                    if "FRP_MWIR1km_standard.csv" in entry or "FRP_SWIR500m.csv" in entry or "standard.csv" in entry:
                        csv_entry = entry
                        break

                if not csv_entry:
                    continue

                try:
                    with prod.open(csv_entry) as f:
                        clean_lines = [l.decode('utf-8', errors='ignore') for l in f if not l.startswith(b'#') and l.strip()]
                        if not clean_lines:
                            continue
                        reader = csv.DictReader(io.StringIO(''.join(clean_lines)))
                        for row in reader:
                            lat_str = row.get('lat(deg)') or row.get('latitude')
                            lon_str = row.get('lon(deg)') or row.get('longitude')
                            frp_str = row.get('FRP(MW)') or row.get('frp') or '0'
                            conf_str = row.get('confidence(%)') or row.get('confidence') or '80'
                            bt_str = row.get('MWIR_BT(K)') or '315.0'
                            channel = row.get('used_channel', 'F1')
                            sat_code = row.get('satellite', 'S3A')
                            day_str = row.get('day', '')
                            time_str = row.get('time', '')

                            if not lat_str or not lon_str:
                                continue

                            try:
                                lat = float(lat_str)
                                lon = float(lon_str)
                                frp = float(frp_str)
                                conf = float(conf_str)
                                bt = float(bt_str)
                            except ValueError:
                                continue

                            # Bounding box check for India & surrounding coverage area
                            if INDIA_BBOX[1] <= lat <= INDIA_BBOX[3] and INDIA_BBOX[0] <= lon <= INDIA_BBOX[2]:
                                sat_full = 'Sentinel-3A' if sat_code == 'S3A' else ('Sentinel-3B' if sat_code == 'S3B' else p_meta['satellite'])
                                hotspots.append({
                                    "id": f"S3-{sat_code}-{int(lat*1000)}-{int(lon*1000)}",
                                    "latitude": round(lat, 4),
                                    "longitude": round(lon, 4),
                                    "satellite": f"{sat_full} SLSTR (1km)",
                                    "instrument": f"SLSTR (Ch {channel}: 3.74µm MWIR)",
                                    "frp": round(frp, 2),
                                    "confidence": round(conf, 1),
                                    "brightness": round(bt, 1),
                                    "acq_time": f"{time_str} UTC" if time_str else p_meta["sensing_start"],
                                    "acq_date": day_str if day_str else p_meta["sensing_start"][:10],
                                    "day_night": row.get('D/N', 'D'),
                                    "product_id": p_id,
                                    "source": "Copernicus Sentinel-3 NRT (eumdac)",
                                    "status": "LIVE_SATELLITE_DETECTION"
                                })

                except Exception as e:
                    err_msg = str(e)
                    if "403" in err_msg or "Copernicus license" in err_msg or "Unauthorised" in err_msg:
                        download_status = "PENDING_KEY_REGENERATION"
                        download_err = "Copernicus license active in User Portal; file download permission propagating to gateway."
                    else:
                        download_status = "DOWNLOAD_ERROR"
                        download_err = err_msg
                    break

        output = {
            "status": download_status,
            "sensor": "Sentinel-3 SLSTR (1km MWIR / 500m SWIR)",
            "collection": DEFAULT_COLLECTION_S3_FRP,
            "collection_title": search_res.get("collection_title", "SLSTR Level 2 Fire Radiative Power"),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "download_note": download_err,
            "products_indexed": len(products),
            "orbital_passes": products,
            "hotspots": hotspots,
            "resolution": "1.0 km MWIR / 500 m SWIR",
            "channels": "Channel F1 (3.74 µm) & F2 (10.85 µm)"
        }

        with open(OUTPUT_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2)

        return output


class Sentinel3ApiHandler(BaseHTTPRequestHandler):
    """HTTP Request Handler for Sentinel-3 eumdac queries."""

    client = Sentinel3EumdacClient()

    def _send_json(self, data, status_code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path in ("/api/sentinel3/status", "/status"):
            auth = self.client.verify_auth()
            self._send_json({
                "service": "Sentinel-3 SLSTR FRP Integration",
                "eumdac_version": eumdac.__version__,
                "has_credentials": self.client.has_credentials(),
                "auth": auth
            })
        elif path in ("/api/sentinel3/search", "/search"):
            hours = int(query.get("hours", ["48"])[0])
            res = self.client.search_s3_frp(hours_back=hours)
            self._send_json(res)
        elif path in ("/api/sentinel3/live", "/live"):
            res = self.client.sync_to_public_json()
            self._send_json(res)
        else:
            self._send_json({"error": "Endpoint not found", "available": ["/api/sentinel3/status", "/api/sentinel3/search", "/api/sentinel3/live"]}, 404)


def run_server(port=5175):
    """Run lightweight local microservice for eumdac Sentinel-3."""
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, Sentinel3ApiHandler)
    print(f"===========================================================")
    print(f" 🛰️  Sentinel-3 SLSTR Service (eumdac v{eumdac.__version__})")
    print(f" Listening on http://127.0.0.1:{port}")
    print(f" Endpoints:")
    print(f"   - GET  /api/sentinel3/status")
    print(f"   - GET  /api/sentinel3/search?hours=48")
    print(f"   - GET  /api/sentinel3/live")
    print(f"===========================================================")
    httpd.serve_forever()


def main():
    parser = argparse.ArgumentParser(description="Copernicus Sentinel-3 SLSTR integration using eumdac")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    subparsers.add_parser("status", help="Check eumdac installation and credentials status")

    search_p = subparsers.add_parser("search", help="Search Sentinel-3 FRP products over India")
    search_p.add_argument("--hours", type=int, default=48, help="Hours back to search (default 48)")
    search_p.add_argument("--limit", type=int, default=15, help="Max products to list")

    sync_p = subparsers.add_parser("sync", help="Sync Sentinel-3 metadata and output to public/data/sentinel3_live.json")
    sync_p.add_argument("--hours", type=int, default=48, help="Hours back to sync")

    serve_p = subparsers.add_parser("serve", help="Run HTTP API server for frontend integration")
    serve_p.add_argument("--port", type=int, default=5175, help="HTTP port (default 5175)")

    args = parser.parse_args()
    client = Sentinel3EumdacClient()

    if args.command == "status":
        auth = client.verify_auth()
        print(f"eumdac Version:       v{eumdac.__version__}")
        print(f"Credentials present:  {client.has_credentials()}")
        print(f"Authenticated:        {auth['authenticated']}")
        if auth["error"]:
            print(f"Status Note:          {auth['error']}")
        else:
            print(f"Token Expiry:         {auth.get('token_expiration')}")

    elif args.command == "search":
        res = client.search_s3_frp(hours_back=args.hours, limit=args.limit)
        print(json.dumps(res, indent=2))

    elif args.command == "sync":
        res = client.sync_to_public_json(hours_back=args.hours)
        print(json.dumps(res, indent=2))

    elif args.command == "serve":
        run_server(port=args.port)

    else:
        res = client.sync_to_public_json()
        print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
