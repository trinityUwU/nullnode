#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$DIR/logs/relay.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "relay not running (no pid file)"
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "relay stopped (pid $PID)"
else
  echo "relay not running (stale pid $PID)"
fi

rm -f "$PID_FILE"
