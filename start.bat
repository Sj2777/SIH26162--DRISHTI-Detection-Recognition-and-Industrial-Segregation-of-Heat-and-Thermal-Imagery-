@echo off
REM ==============================================================================
REM AGNI-VISION WINDOWS ONE-CLICK STARTUP SCRIPT
REM ==============================================================================

echo ==========================================================
echo   AGNI-VISION FULL-STACK LAUNCHER (WINDOWS)
echo ==========================================================

REM Check .env
if not exist .env (
    echo WARNING: .env file not found!
    if exist .env.example (
        copy .env.example .env
        echo Created .env from .env.example
    )
)

echo Starting Backend Microservices in background...
start "AGNI-VISION Context Service (5176)" python backend\context_service.py
start "AGNI-VISION Prithvi Service (5178)" python backend\prithvi_service.py

timeout /t 2 /nobreak >nul

echo Starting Unified Frontend Services (Landing Page, Industry, Municipal)...
npm run dev
