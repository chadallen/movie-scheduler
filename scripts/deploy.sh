#!/bin/bash
# Trigger a Vercel production build via API.
# Reads VERCEL_TOKEN from environment or .env.local.

set -e

TOKEN="${VERCEL_TOKEN:-$(grep '^VERCEL_TOKEN=' "$(dirname "$0")/../.env.local" 2>/dev/null | cut -d= -f2-)}"
if [ -z "$TOKEN" ]; then
  echo "Error: VERCEL_TOKEN not found in environment or .env.local" >&2
  exit 1
fi

echo "Triggering Vercel production deployment..."
DEPLOY=$(curl -s -X POST \
  "https://api.vercel.com/v13/deployments?projectId=prj_GEpXDJ1bFNQfyNGxfJfuuBG3kRDT" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"movie-scheduler","gitSource":{"type":"github","repoId":1219279356,"ref":"production","org":"chadallen","repo":"movie-scheduler"},"target":"production"}')

ID=$(echo "$DEPLOY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
if [ -z "$ID" ]; then
  echo "Error: failed to create deployment" >&2
  echo "$DEPLOY" >&2
  exit 1
fi

echo "Build ID: $ID — polling for READY..."

while true; do
  STATE=$(curl -s "https://api.vercel.com/v13/deployments/$ID" \
    -H "Authorization: Bearer $TOKEN" | \
    python3 -c "import sys,json; print(json.load(sys.stdin).get('readyState',''))")
  if [ "$STATE" = "READY" ] || [ "$STATE" = "ERROR" ]; then break; fi
  sleep 10
done

echo "Deployment $STATE — https://movies.fork.pizza"
[ "$STATE" = "READY" ]
