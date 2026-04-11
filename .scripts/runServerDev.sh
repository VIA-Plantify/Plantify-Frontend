#!/usr/bin/env bash
set -Eeuo pipefail

echo "[BFF] Starting server..."
(cd ../Server && npm run start:dev) &

wait