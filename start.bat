@echo off
title Sri Naga Vaishnavi Interiors - Server
echo ========================================================
echo   Sri Naga Vaishnavi Interiors - Official Workshop Site
echo ========================================================
echo.
echo Starting FastAPI Server on http://localhost:8000 ...
echo Press Ctrl+C to stop the server anytime.
echo.

cd /d "%~dp0"
py -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload
pause
