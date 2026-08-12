#!/bin/bash
# Muper Sario 2.0 - Game Launcher
# Port 38473 (v1 prototype uses 38472)

echo "========================================"
echo "  Muper Sario 2.0 - Game Launcher"
echo "========================================"
echo ""
echo "Starting local development server..."
echo "Port: 38473"
echo ""

pkill -f "http.server 38473" 2>/dev/null || true

python -m http.server 38473 --bind 127.0.0.1 &

SERVER_PID=$!
echo "Server started (PID: $SERVER_PID)"
echo ""
echo "========================================"
echo "  Game URL: http://localhost:38473"
echo "  (or http://127.0.0.1:38473)"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

wait $SERVER_PID
