#!/usr/bin/env bash
set -Eeuo pipefail

log() {
    printf '[start] %s\n' "$*"
}

PIDS=()

cleanup() {
    local pid
    trap - EXIT TERM INT
    log "Stopping supervised processes"
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill -TERM "$pid"
        fi
    done
    for pid in "${PIDS[@]}"; do
        wait "$pid" 2>/dev/null || true
    done
}

trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT

mkdir -p /run/nginx /var/log/nginx /app/public/data

if [[ ! -x /opt/venv/bin/python ]]; then
    log "ERROR: expected Python virtual environment at /opt/venv"
    exit 1
fi

log "Starting industrial Node backend on 127.0.0.1:5000"
(
    cd /app/industrial-portal/backend
    exec env PORT=5000 NODE_ENV=production node dist/server.js
) &
PIDS+=("$!")

case "${ENABLE_PYTHON_SERVICES:-1}" in
    0)
        log "Python services are disabled for stage 1; their requirements are not installed"
        ;;
    1)
        log "Starting Context Python service on 127.0.0.1:5176"
        (cd /app && exec env HOST=127.0.0.1 PORT=5176 /opt/venv/bin/python backend/context_service.py) &
        PIDS+=("$!")

        log "Starting Prithvi Python service on 127.0.0.1:5178"
        (cd /app && exec env HOST=127.0.0.1 PORT=5178 /opt/venv/bin/python backend/prithvi_service.py) &
        PIDS+=("$!")

        log "Starting Sentinel-3 Python service on 127.0.0.1:5175"
        (cd /app && exec env HOST=127.0.0.1 PORT=5175 /opt/venv/bin/python backend/sentinel3_eumdac.py serve --port 5175) &
        PIDS+=("$!")

        log "Starting SEVIRI Python service on 127.0.0.1:5174"
        (cd /app && exec env HOST=127.0.0.1 PORT=5174 READ_ONLY=1 /opt/venv/bin/python backend/seviri_eumdac.py serve --port 5174) &
        PIDS+=("$!")
        ;;
    *)
        log "ERROR: ENABLE_PYTHON_SERVICES must be 0 or 1"
        exit 2
        ;;
esac

case "${ENABLE_MUNICIPAL_SERVICE:-0}" in
    0)
        log "Municipal runtime is deferred to a later deployment stage"
        ;;
    1)
        log "ERROR: municipal runtime has not been implemented in stage 1"
        exit 1
        ;;
    *)
        log "ERROR: ENABLE_MUNICIPAL_SERVICE must be 0 or 1"
        exit 2
        ;;
esac

if [[ -z "${PORT:-}" ]]; then
    log "ERROR: PORT must be set for nginx"
    exit 1
fi

log "Generating nginx configuration for public port ${PORT}"
envsubst '${PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf
nginx -t -c /etc/nginx/nginx.conf

log "Starting nginx on public port ${PORT}"
nginx -g 'daemon off;' &
PIDS+=("$!")

set +e
wait -n "${PIDS[@]}"
status=$?
set -e

if [[ "$status" -eq 0 ]]; then
    log "ERROR: a supervised service exited unexpectedly"
    exit 1
fi

log "ERROR: a supervised service exited with status ${status}"
exit "$status"
