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
if [ "$code" -eq 0 ]; then run_gate "places:index:check" npm run places:index:check; fi
if [ "$code" -eq 0 ]; then run_gate "place-open:check" npm run place-open:check; fi
if [ "$code" -eq 0 ]; then run_gate "epoker:places:check" npm run epoker:places:check; fi
if [ "$code" -eq 0 ]; then run_gate "audit:quiz-manifest:v2" npm run audit:quiz-manifest:v2; fi
if [ "$code" -eq 0 ]; then run_gate "audit:quiz-templates" npm run audit:quiz-templates; fi
if [ "$code" -eq 0 ]; then run_gate "audit:quiz-production-context" npm run audit:quiz-production-context; fi
if [ "$code" -eq 0 ]; then run_gate "audit:quiz-progression" npm run audit:quiz-progression; fi
if [ "$code" -eq 0 ]; then run_gate "check:stories" npm run check:stories; fi
if [ "$code" -eq 0 ]; then run_gate "leksikon:ids:check" npm run leksikon:ids:check; fi
if [ "$code" -eq 0 ]; then run_gate "audit:people-of-places" npm run audit:people-of-places; fi
if [ "$code" -eq 0 ]; then run_gate "civication:history-people:check" npm run civication:history-people:check; fi

cat "$LOG"
exit "$code"
