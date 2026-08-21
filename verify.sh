#!/bin/sh
# Post-restart verification for dsh-code (run after the server restarts).
BASE="${1:-http://127.0.0.1:3080}"
echo "== 1. plugin client bundle served =="
curl -s -o /dev/null -w "%{http_code} %{size_download} bytes\n" "$BASE/plugins/dsh-code/client.js"
echo "== 2. git route (this repo) =="
curl -s "$BASE/__codex/git?cwd=$(pwd)" | head -c 300; echo
echo "== 3. file route (this README) =="
curl -s "$BASE/__codex/file?cwd=$(pwd)&path=README.md" | head -c 200; echo
echo "== 4. stats route =="
curl -s "$BASE/__codex/stats?tz=0" | head -c 300; echo
echo "== 5. boot graph contains the plugin =="
curl -s "$BASE/" | grep -o "dsh-code" | head -1
echo "== 6. tree route (file-tree sidebar) =="
curl -s "$BASE/__codex/tree?cwd=$(pwd)" | head -c 300; echo
echo "== 7. write route guard (escape attempt must be refused, nothing written) =="
curl -s -w " [HTTP %{http_code}]" -X POST -H 'content-type: application/json' \
	-d '{"path":"../dsh-code-verify-escape.txt","cwd":"'"$(pwd)"'","content":"x"}' \
	"$BASE/__codex/file"; echo
echo "== 8. raw route (markdown images; serves real bytes with a mime type) =="
curl -s -o /dev/null -w "%{http_code} %{content_type} %{size_download} bytes\n" \
	"$BASE/__codex/raw?cwd=$(pwd)&path=docs/screenshots/home-mocha.png"
echo "== 9. version route (running DeepSeek Harness version) =="
curl -s -w " [HTTP %{http_code}]" "$BASE/__codex/version"; echo
