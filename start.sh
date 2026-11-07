#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "LOOPS Spatial Store — http://localhost:$PORT"
echo "Demo sequence — http://localhost:$PORT/?demo=1"
python3 -m http.server "$PORT"
