#!/usr/bin/env bash
set -Eeuo pipefail

log() {
  printf '[start] %s\n' "$*"
}

PIDS=()

cleanup() {
  log "Stopping child processes..."
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
}

trap cleanup EXIT INT TERM

log "Starting industrial Node backend on 127.0.0.1:5000"
(
  cd /app/industrial-portal/backend
  PORT=5000 node dist/server.js
) &
PIDS+=("$!")

log "Starting Municipal Portal on 127.0.0.1:5193"
(
  cd /app/municipal-portal
  HOST=127.0.0.1 PORT=5193 node server.mjs
) &
PIDS+=("$!")

log "Starting Context Python service on 127.0.0.1:5176"
(
  HOST=127.0.0.1 PORT=5176 python /app/backend/context_service.py
) &
PIDS+=("$!")

log "Starting Prithvi Python service on 127.0.0.1:5178"
(
  HOST=127.0.0.1 PORT=5178 python /app/backend/prithvi_service.py
) &
PIDS+=("$!")

log "Starting Sentinel-3 Python service on 127.0.0.1:5175"
(
  HOST=127.0.0.1 PORT=5175 python /app/backend/sentinel3_eumdac.py serve --port 5175
) &
PIDS+=("$!")

log "Starting SEVIRI Python service on 127.0.0.1:5174"
(
  HOST=127.0.0.1 PORT=5174 python /app/backend/seviri_eumdac.py serve --port 5174
) &
PIDS+=("$!")

log "Waiting for internal services..."

for i in {1..30}; do
  if curl -fsS http://127.0.0.1:5000/api/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

log "Generating nginx configuration for public port ${PORT:-10000}"

envsubst '${PORT}' \
  < /etc/nginx/templates/nginx.conf.template \
  > /etc/nginx/nginx.conf

log "Starting nginx on port ${PORT:-10000}"

nginx -g 'daemon off;' &
PIDS+=("$!")

wait -n "${PIDS[@]}"
exit $?
