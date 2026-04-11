#!/usr/bin/env bash
set -Eeuo pipefail

echo "[BFF] Starting server..."
(cd ../Server && npm run start:dev) &

echo "[UI] Starting React..."
(cd ../plantify-react-app && npm run dev -- --host 0.0.0.0) &

wait