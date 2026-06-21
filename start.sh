#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p logs
: > logs/dev.log
bun run dev > logs/dev.log 2>&1 &
echo $! > logs/nullnode.pid
echo "nullnode dev started — pid $(cat logs/nullnode.pid) — http://localhost:5180"
