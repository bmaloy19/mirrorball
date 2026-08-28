#!/usr/bin/env bash
# Serve the site locally. Needs nothing installed — python3 ships with macOS.
# Usage:  ./serve.sh        (port 8000)
#         ./serve.sh 9000   (any other port)
PORT="${1:-8000}"
cd "$(dirname "$0")"
echo ""
echo "  Sue is 60  →  http://localhost:$PORT"
echo "  Ctrl-C to stop"
echo ""
( sleep 1; open "http://localhost:$PORT" ) &
exec python3 -m http.server "$PORT"
