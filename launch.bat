@echo off
REM Muper Sario 2.0 - Game Launcher (Windows)
REM Port 38473 (v1 prototype uses 38472)

echo ========================================
echo   Muper Sario 2.0 - Game Launcher
echo ========================================
echo.
echo Starting local development server...
echo Port: 38473
echo.

python -m http.server 38473 --bind 127.0.0.1

echo.
echo ========================================
echo   Game URL: http://localhost:38473
echo   (or http://127.0.0.1:38473)
echo ========================================
echo.
echo Press Ctrl+C to stop the server.
pause
