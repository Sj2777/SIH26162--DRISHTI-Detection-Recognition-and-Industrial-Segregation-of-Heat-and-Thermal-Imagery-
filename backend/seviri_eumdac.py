#!/usr/bin/env python3
"""
EUMETSAT SEVIRI Integration via eumdac (EUMETSAT Data Access Client)
-------------------------------------------------------------------
Platform: Meteosat MSG-IODC (Meteosat-9 / Meteosat-11 at 45.5°E GEO)
Sensor:   Spinning Enhanced Visible and InfraRed Imager (SEVIRI)
Cadence:  15-minute rapid scan cycles over the Indian Subcontinent
Bands:    Channel 4 (IR 3.9 µm Mid-Infrared) & Channel 9 (IR 10.8 µm Thermal Infrared)

Official Client: eumdac Python library (v3.1.1+)
EUMETSAT Data Store API: https://api.eumetsat.int/
"""

import os
import sys
import json
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

# Default configuration
ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = ROOT_DIR / ".env"
PUBLIC_DATA_DIR = ROOT_DIR / "public" / "data"
OUTPUT_JSON_PATH = PUBLIC_DATA_DIR / "seviri_live.json"
DEFAULT_COLLECTION_IODC = "EO:EUM:DAT:MSG:HRSEVIRI-IODC"
DEFAULT_COLLECTION_0DEG = "EO:EUM:DAT:MSG:HRSEVIRI"
DEFAULT_COLLECTION_FIRE_CAP = "EO:EUM:DAT:0801"
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


class SeviriEumdacClient:
    """Manager for EUMETSAT SEVIRI data queries via eumdac."""

    def __init__(self, key: str = "", secret: str = ""):
        self.key, self.secret = key, secret
        if not self.key or not self.secret:
            self.key, self.secret = load_env_credentials()
        self.token = None
        self.datastore = None

    def has_credentials(self) -> bool:
        return bool(self.key and self.secret and len(self.key) > 5 and len(self.secret) > 5)

    def get_token(self) -> AccessToken:
        if not self.has_credentials():
            raise ValueError(
                "EUMETSAT credentials missing. Please set EUMETSAT_CONSUMER_KEY and EUMETSAT_CONSUMER_SECRET in .env\n"
                "Get free keys at: https://api.eumetsat.int/api-key"
            )
        if not self.token:
            self.token = AccessToken((self.key, self.secret))
        return self.token

    def get_datastore(self) -> DataStore:
        if not self.datastore:
            token = self.get_token()
            self.datastore = DataStore(token)
        return self.datastore

    def verify_auth(self) -> dict:
        """Verify if credentials generate a valid token."""
        if not self.has_credentials():
            return {
                "authenticated": False,
                "eumdac_version": eumdac.__version__,
                "error": "Missing credentials. Set EUMETSAT_CONSUMER_KEY and EUMETSAT_CONSUMER_SECRET in .env",
                "portal_url": "https://api.eumetsat.int/api-key"
            }
        try:
            token = self.get_token()
            # Calling str(token) triggers the OAuth access token request
            _ = str(token)
            return {
                "authenticated": True,
                "eumdac_version": eumdac.__version__,
                "token_expiration": str(token.expiration) if hasattr(token, "expiration") else "active",
                "error": None
            }
        except Exception as err:
            return {
                "authenticated": False,
                "eumdac_version": eumdac.__version__,
                "error": str(err),
                "portal_url": "https://api.eumetsat.int/api-key"
            }

    def search_seviri_iodc(self, hours_back: int = 3, collection_id: str = DEFAULT_COLLECTION_IODC, limit: int = 12):
        """
        Search SEVIRI Level 1.5 / High Rate products for the MSG Indian Ocean slot (45.5°E).
        Each scan takes 15 minutes (96 scans per day).
        """
        auth_status = self.verify_auth()
        if not auth_status["authenticated"]:
            return {
                "status": "AUTH_REQUIRED",
                "message": auth_status["error"],
                "eumdac_version": eumdac.__version__,
                "collection": collection_id,
                "products": []
            }

        ds = self.get_datastore()
        col = ds.get_collection(collection_id)

        now = datetime.now(timezone.utc)
        start_time = now - timedelta(hours=hours_back)

        print(f"[eumdac] Searching {collection_id} from {start_time.isoformat()} to {now.isoformat()} over India...")

        # Search with spatio-temporal filter
        search_results = col.search(
            dtstart=start_time,
            dtend=now,
            geo=INDIA_POLYGON
        )

        products_list = []
        for i, prod in enumerate(search_results):
            if i >= limit:
                break
            try:
                products_list.append({
                    "id": str(prod),
                    "satellite": getattr(prod, "satellite", "Meteosat-9 (MSG)"),
                    "orbit_type": getattr(prod, "orbit_type", "GEO"),
                    "slot_longitude": "45.5°E (IODC)",
                    "sensing_start": prod.sensing_start.isoformat() if hasattr(prod, "sensing_start") and prod.sensing_start else None,
                    "sensing_end": prod.sensing_end.isoformat() if hasattr(prod, "sensing_end") and prod.sensing_end else None,
                    "size_mb": round(prod.size / (1024 * 1024), 2) if hasattr(prod, "size") and prod.size else None,
                    "instrument": "SEVIRI",
                    "channels": ["IR3.9 (MIR)", "IR10.8 (TIR)", "VIS0.6", "WV6.2", "WV7.3", "HRV"],
                    "cadence": "15-minute Rapid Scan",
                    "download_url": prod.download_url if hasattr(prod, "download_url") else None
                })
            except Exception as e:
                products_list.append({"id": str(prod), "error": str(e)})

        return {
            "status": "SUCCESS",
            "eumdac_version": eumdac.__version__,
            "collection": collection_id,
            "collection_title": col.title if hasattr(col, "title") else "High Rate SEVIRI Level 1.5 - MSG - Indian Ocean",
            "time_window": {
                "start": start_time.isoformat(),
                "end": now.isoformat(),
                "hours_back": hours_back
            },
            "bounding_box": INDIA_BBOX,
            "total_found": len(products_list),
            "products": products_list
        }

    def sync_to_public_json(self, hours_back: int = 3, output_path: Path = OUTPUT_JSON_PATH):
        """
        Execute search and serialize full SEVIRI status into public/data/seviri_live.json
        for the AGNI-VISION dashboard.
        """
        output_path.parent.mkdir(parents=True, exist_ok=True)
        auth = self.verify_auth()

        meta = {
            "satellite_system": "EUMETSAT Meteosat MSG-IODC",
            "satellite_platform": "Meteosat-9 / Meteosat-11 (45.5°E GEO)",
            "sensor": "SEVIRI (Spinning Enhanced Visible and InfraRed Imager)",
            "client_library": f"eumdac Python SDK v{eumdac.__version__}",
            "coverage_region": "Indian Ocean & Indian Subcontinent (45.5°E orbital slot)",
            "scan_cadence": "15-minute continuous scan (96 passes / 24 hours)",
            "nadir_resolution": "3.0 km (nadir) / ~4.8 km - 6.5 km (India oblique)",
            "thermal_bands": {
                "mir": "Channel 4 (IR 3.9 µm) - Sub-pixel high-temperature flaring & fires",
                "tir": "Channel 9 (IR 10.8 µm) - Background land surface radiometric temperature"
            },
            "credentials_configured": self.has_credentials(),
            "auth_status": auth["authenticated"],
            "last_sync_time": datetime.now(timezone.utc).isoformat(),
            "target_collection": DEFAULT_COLLECTION_IODC,
            "how_to_authenticate": {
                "portal": "https://api.eumetsat.int/api-key",
                "instructions": "Register a free account, generate Consumer Key and Secret, and place them in .env"
            }
        }

        if auth["authenticated"]:
            search_res = self.search_seviri_iodc(hours_back=hours_back)
            meta["sync_result"] = "OK"
            meta["products_found"] = search_res.get("total_found", 0)
            meta["products"] = search_res.get("products", [])
        else:
            meta["sync_result"] = "CREDENTIALS_NEEDED"
            meta["error_message"] = auth.get("error")
            meta["products_found"] = 0
            meta["products"] = []

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        print(f"[eumdac] Synced SEVIRI metadata to {output_path}")
        return meta


class SeviriApiHandler(BaseHTTPRequestHandler):
    """Lightweight HTTP API handler for frontend integration."""

    client = SeviriEumdacClient()

    def _send_json(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json({"status": "ok"})

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path in ("/api/seviri/status", "/status"):
            auth = self.client.verify_auth()
            self._send_json({
                "library": "eumdac",
                "version": eumdac.__version__,
                "has_credentials": self.client.has_credentials(),
                "auth": auth,
                "collection": DEFAULT_COLLECTION_IODC,
                "satellite": "Meteosat-9/11 SEVIRI (45.5°E GEO)",
                "cadence": "15-minute continuous scan"
            })
        elif path in ("/api/seviri/search", "/search"):
            hours = int(query.get("hours", [3])[0])
            res = self.client.search_seviri_iodc(hours_back=hours)
            self._send_json(res)
        elif path in ("/api/seviri/live", "/live"):
            res = self.client.sync_to_public_json()
            self._send_json(res)
        else:
            self._send_json({"error": "Endpoint not found", "available": ["/api/seviri/status", "/api/seviri/search", "/api/seviri/live"]}, 404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if path in ("/api/seviri/set-credentials", "/set-credentials"):
            key = payload.get("key", "").strip()
            secret = payload.get("secret", "").strip()
            if not key or not secret:
                self._send_json({"error": "Both 'key' and 'secret' are required"}, 400)
                return
            save_env_credentials(key, secret)
            self.client = SeviriEumdacClient(key, secret)
            auth = self.client.verify_auth()
            self.client.sync_to_public_json()
            self._send_json({
                "status": "SAVED",
                "auth": auth,
                "message": "Credentials stored in .env and client refreshed."
            })
        elif path in ("/api/seviri/sync", "/sync"):
            res = self.client.sync_to_public_json()
            self._send_json(res)
        else:
            self._send_json({"error": "Endpoint not found"}, 404)


def run_server(port=5174):
    """Run lightweight local microservice for eumdac SEVIRI."""
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, SeviriApiHandler)
    print(f"===========================================================")
    print(f" 🛰️  EUMETSAT SEVIRI Service (eumdac v{eumdac.__version__})")
    print(f" Listening on http://127.0.0.1:{port}")
    print(f" Endpoints:")
    print(f"   - GET  /api/seviri/status")
    print(f"   - GET  /api/seviri/search?hours=3")
    print(f"   - GET  /api/seviri/live")
    print(f"   - POST /api/seviri/sync")
    print(f"   - POST /api/seviri/set-credentials")
    print(f"===========================================================")
    httpd.serve_forever()


def main():
    parser = argparse.ArgumentParser(description="EUMETSAT SEVIRI integration using eumdac")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    subparsers.add_parser("status", help="Check eumdac installation and credentials status")

    search_p = subparsers.add_parser("search", help="Search SEVIRI products over India")
    search_p.add_argument("--hours", type=int, default=3, help="Hours back to search (default 3)")
    search_p.add_argument("--limit", type=int, default=12, help="Max products to list")

    sync_p = subparsers.add_parser("sync", help="Sync SEVIRI metadata and output to public/data/seviri_live.json")
    sync_p.add_argument("--hours", type=int, default=3, help="Hours back to sync")

    serve_p = subparsers.add_parser("serve", help="Run HTTP API server for frontend integration")
    serve_p.add_argument("--port", type=int, default=5174, help="HTTP port (default 5174)")

    cred_p = subparsers.add_parser("set-credentials", help="Set EUMETSAT Consumer Key and Secret")
    cred_p.add_argument("--key", required=True, help="Consumer Key from api.eumetsat.int")
    cred_p.add_argument("--secret", required=True, help="Consumer Secret from api.eumetsat.int")

    args = parser.parse_args()

    client = SeviriEumdacClient()

    if args.command == "status":
        auth = client.verify_auth()
        print(f"eumdac Version:       v{eumdac.__version__}")
        print(f"Credentials present:  {client.has_credentials()}")
        print(f"Authenticated:        {auth['authenticated']}")
        if auth["error"]:
            print(f"Status Note:          {auth['error']}")
            print(f"Registration Portal:  https://api.eumetsat.int/api-key")
        else:
            print(f"Token Expiry:         {auth.get('token_expiration')}")

    elif args.command == "search":
        res = client.search_seviri_iodc(hours_back=args.hours, limit=args.limit)
        print(json.dumps(res, indent=2))

    elif args.command == "sync":
        res = client.sync_to_public_json(hours_back=args.hours)
        print(json.dumps(res, indent=2))

    elif args.command == "serve":
        run_server(port=args.port)

    elif args.command == "set-credentials":
        save_env_credentials(args.key, args.secret)
        print("Credentials saved to .env")
        client = SeviriEumdacClient(args.key, args.secret)
        auth = client.verify_auth()
        print("Authentication check:", auth)
        client.sync_to_public_json()

    else:
        # Default action: sync metadata to public/data/seviri_live.json
        client.sync_to_public_json()


if __name__ == "__main__":
    main()
