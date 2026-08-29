#!/usr/bin/env bash
set +e

LOG="reports/place-production/universitetsplassen-verify-debug.log"
mkdir -p "$(dirname "$LOG")"
: > "$LOG"

code=0
run_gate() {
  local label="$1"
  shift
  echo "=== ${label} ===" >> "$LOG"
  "$@" >> "$LOG" 2>&1
  local status=$?
  if [ "$status" -ne 0 ]; then
    echo "=== FAILED ${label} exit=${status} ===" >> "$LOG"
    code=$status
    return 1
  fi
  echo "=== PASS ${label} ===" >> "$LOG"
  return 0
}

run_gate "targeted Universitetsplassen test" node --test tests/universitetsplassen-completion.test.mjs
if [ "$code" -eq 0 ]; then run_gate "places:check" npm run places:check; fi
if [ "$code" -eq 0 ]; then run_gate "place-open:check" npm run place-open:check; fi
if [ "$code" -eq 0 ]; then run_gate "quiz:production:check" npm run quiz:production:check; fi
if [ "$code" -eq 0 ]; then run_gate "quiz:progression:check" npm run quiz:progression:check; fi
if [ "$code" -eq 0 ]; then run_gate "stories:check" npm run stories:check; fi
if [ "$code" -eq 0 ]; then run_gate "leksikon:check" npm run leksikon:check; fi
if [ "$code" -eq 0 ]; then run_gate "people:check" npm run people:check; fi
if [ "$code" -eq 0 ]; then run_gate "place-rounds:check" npm run place-rounds:check; fi
if [ "$code" -eq 0 ]; then run_gate "fagverk:release:check" npm run fagverk:release:check; fi

cat "$LOG"
exit "$code"
