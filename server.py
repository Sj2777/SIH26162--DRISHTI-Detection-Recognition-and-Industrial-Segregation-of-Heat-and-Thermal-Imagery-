#!/usr/bin/env python3
"""
AGNI-VISION Unified Production Server for Render / Cloud Deployments
===================================================================
- Listens on 0.0.0.0:$PORT (default 5173 / Render assigned $PORT)
- Serves Vite production build from dist/
- Backgrounds Python microservices:
    * context_service.py (Port 5176) -> /api/context/*
    * prithvi_service.py (Port 5178) -> /api/prithvi
- Proxies NASA FIRMS active fire satellite feeds & Open-Meteo weather
"""

import os
import sys
import time
import mimetypes
import subprocess
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import urllib.request
import urllib.error

ROOT_DIR = Path(__file__).resolve().parent
DIST_DIR = ROOT_DIR / "dist"
PORT = int(os.environ.get("PORT", 5173))

# FIRMS endpoint mapping matching vite.config.js
FIRMS_MAP = {
    "/api/firms/noaa20/24h": "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_24h.csv",
    "/api/firms/noaa20/7d":  "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_7d.csv",
    "/api/firms/noaa21/24h": "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_South_Asia_24h.csv",
    "/api/firms/noaa21/7d":  "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-21-viirs-c2/csv/J2_VIIRS_C2_South_Asia_7d.csv",
    "/api/firms/snpp/24h":   "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_24h.csv",
    "/api/firms/snpp/7d":    "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_7d.csv",
    "/api/firms/modis-terra/24h": "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_South_Asia_24h.csv",
    "/api/firms/modis-terra/7d":  "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_South_Asia_7d.csv",
    "/api/nasa-firms-noaa20": "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_South_Asia_24h.csv",
    "/api/nasa-firms-snpp":   "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_South_Asia_24h.csv",
}

class UnifiedProductionHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Concise logging
        print(f"[AGNI-SERVER] {self.command} {self.path} - {format % args}")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def proxy_request(self, target_url, body=None, content_type=None):
        try:
            req = urllib.request.Request(target_url, data=body, method=self.command)
            if content_type:
                req.add_header("Content-Type", content_type)
            req.add_header("User-Agent", "AGNI-VISION-Server/1.0")

            with urllib.request.urlopen(req, timeout=25) as resp:
                data = resp.read()
                self.send_response(resp.status)
                self.send_header("Access-Control-Allow-Origin", "*")
                ct = resp.headers.get("Content-Type", "application/json")
                self.send_header("Content-Type", ct)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            err_data = e.read()
            self.send_response(e.code)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err_data if err_data else b'{"error": "Upstream error"}')
        except Exception as e:
            self.send_response(502)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            msg = f'{{"error": "Proxy error: {str(e)}"}}'.encode("utf-8")
            self.wfile.write(msg)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Health check for Render
        if path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status": "ok", "service": "AGNI-VISION Unified Server"}')
            return

        # 2. NASA FIRMS proxy routes
        for prefix, target in FIRMS_MAP.items():
            if path == prefix or path.startswith(prefix):
                return self.proxy_request(target)

        # 3. Open-Meteo weather proxy
        if path.startswith("/api/weather"):
            query = parsed.query
            target = f"https://api.open-meteo.com/v1/forecast?{query}" if query else "https://api.open-meteo.com/v1/forecast"
            return self.proxy_request(target)

        # 4. Context Microservice (Port 5176)
        if path.startswith("/api/context"):
            subpath = path[len("/api/context"):]
            if not subpath:
                subpath = "/"
            query = parsed.query
            target = f"http://127.0.0.1:5176{subpath}?{query}" if query else f"http://127.0.0.1:5176{subpath}"
            return self.proxy_request(target)

        # 5. Prithvi Microservice (Port 5178)
        if path.startswith("/api/prithvi"):
            subpath = path[len("/api/prithvi"):]
            if not subpath or subpath == "/":
                subpath = "/prithvi"
            query = parsed.query
            target = f"http://127.0.0.1:5178{subpath}?{query}" if query else f"http://127.0.0.1:5178{subpath}"
            return self.proxy_request(target)

        # 6. Static frontend files (from dist/)
        clean_path = path.lstrip("/")
        file_path = DIST_DIR / clean_path

        if file_path.is_file():
            self.serve_static_file(file_path)
            return

        # Fallback to SPA index.html
        index_file = DIST_DIR / "index.html"
        if index_file.is_file():
            self.serve_static_file(index_file)
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"404 - Frontend build not found. Please run 'npm run build' first.")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length > 0 else None
        ct = self.headers.get("Content-Type", "application/json")

        if path.startswith("/api/prithvi"):
            target = "http://127.0.0.1:5178/prithvi"
            return self.proxy_request(target, body=body, content_type=ct)

        if path.startswith("/api/context"):
            subpath = path[len("/api/context"):]
            target = f"http://127.0.0.1:5176{subpath}"
            return self.proxy_request(target, body=body, content_type=ct)

        self.send_response(404)
        self.end_headers()

    def serve_static_file(self, file_path):
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type:
            mime_type = "application/octet-stream"
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            if "assets" in str(file_path):
                self.send_header("Cache-Control", "public, max-age=31536000, immutable")
            else:
                self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode("utf-8"))


def start_microservices():
    py_exec = sys.executable
    print("--------------------------------------------------")
    print(f"  [STARTUP] Starting Context Service (port 5176)...")
    context_proc = subprocess.Popen([py_exec, "backend/context_service.py"], cwd=str(ROOT_DIR))

    print(f"  [STARTUP] Starting Prithvi Service (port 5178)...")
    prithvi_proc = subprocess.Popen([py_exec, "backend/prithvi_service.py"], cwd=str(ROOT_DIR))
    print("--------------------------------------------------")
    time.sleep(1.5)
    return context_proc, prithvi_proc


if __name__ == "__main__":
    # Ensure dist folder exists
    if not DIST_DIR.exists():
        print("[WARN] dist/ folder not found. Building frontend now...")
        subprocess.run(["npm", "run", "build"], cwd=str(ROOT_DIR), check=True)

    # Launch background Python microservices
    start_microservices()

    server_address = ("0.0.0.0", PORT)
    httpd = ThreadingHTTPServer(server_address, UnifiedProductionHandler)
    print(f"\n=======================================================")
    print(f"  🔥 AGNI-VISION UNIFIED PRODUCTION SERVER LIVE")
    print(f"  Listening on http://0.0.0.0:{PORT}")
    print(f"  Serving dist/ with full satellite & context APIs")
    print(f"=======================================================\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
