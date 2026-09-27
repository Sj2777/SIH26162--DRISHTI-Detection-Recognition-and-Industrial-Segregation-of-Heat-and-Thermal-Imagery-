#!/usr/bin/env bash
# ==============================================================================
# AGNI-VISION ONE-CLICK STARTUP SCRIPT
# Starts all backend microservices + Vite frontend concurrently
# ==============================================================================

# Find Python interpreter (prefers active venv if available)
if [ -d "venv" ] && [ -f "venv/bin/python" ]; then
    PYTHON="venv/bin/python"
elif [ -d ".venv" ] && [ -f ".venv/bin/python" ]; then
    PYTHON=".venv/bin/python"
else
    PYTHON="python3"
fi

echo "=========================================================="
echo "  🔥 AGNI-VISION FULL-STACK LAUNCHER"
echo "  Python interpreter: $PYTHON"
echo "=========================================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file not found in current directory!"
    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
    fi
fi

# Clean up any orphan processes on ports 5176 and 5178
cleanup() {
    echo ""
    echo "Stopping all AGNI-VISION services..."
    kill $PID_CONTEXT 2>/dev/null
    kill $PID_PRITHVI 2>/dev/null
    kill $PID_VITE 2>/dev/null
    exit 0
}

trap cleanup INT TERM EXIT

echo "Starting Context Microservice (Port 5176)..."
$PYTHON backend/context_service.py &
PID_CONTEXT=$!

echo "Starting Prithvi AI Foundation Model Service (Port 5178)..."
$PYTHON backend/prithvi_service.py &
PID_PRITHVI=$!

# Give microservices 1 second to bind
sleep 1

echo "Starting Vite Frontend (Port 5173)..."
npm run dev &
PID_VITE=$!

wait
