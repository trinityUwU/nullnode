#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$DIR/logs"
PID_FILE="$LOG_DIR/relay.pid"
LOG_FILE="$LOG_DIR/relay.log"

mkdir -p "$LOG_DIR"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "relay already running (pid $(cat "$PID_FILE"))"
  exit 0
fi

: > "$LOG_FILE"

cd "$DIR"
bun run src/server.ts >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "relay started (pid $(cat "$PID_FILE")) — logs: $LOG_FILE"
