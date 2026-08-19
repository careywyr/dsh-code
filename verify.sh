#!/bin/sh
# Post-restart verification for dsh-code (run after the server restarts).
BASE="${1:-http://127.0.0.1:3080}"
echo "== 1. plugin client bundle served =="
curl -s -o /dev/null -w "%{http_code} %{size_download} bytes\n" "$BASE/plugins/dsh-code/client.js"
echo "== 2. git route (this repo) =="
curl -s "$BASE/__codex/git?cwd=$(pwd)" | head -c 300; echo
echo "== 3. stats route =="
curl -s "$BASE/__codex/stats?tz=0" | head -c 300; echo
echo "== 4. boot graph contains the plugin =="
curl -s "$BASE/" | grep -o "dsh-code" | head -1
