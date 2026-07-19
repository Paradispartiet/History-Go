#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

run_check() {
  local label="$1"
  shift
  local output status
  output="$(mktemp)"
  echo "== ${label} =="
  if "$@" >"$output" 2>&1; then
    echo "ok"
    rm -f "$output"
    return 0
  else
    status=$?
    cat "$output"
    rm -f "$output"
    return "$status"
  fi
}

run_check "People JSON parse and duplicate ID check" node -e '
const fs = require("fs");
const path = require("path");
const manifestPath = "data/people/manifest.json";
const placesIndexPath = "data/places/places_index.json";
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = readJson(manifestPath);
if (!manifest || !Array.isArray(manifest.files)) throw new Error(`${manifestPath} must contain a files array`);
const peopleFiles = manifest.files.map((file) => path.join("data", file));
const files = [manifestPath, placesIndexPath, ...peopleFiles];
const seen = new Map();
for (const file of files) {
  if (!fs.existsSync(file)) throw new Error(`Missing expected file: ${file}`);
  const data = readJson(file);
  if (!peopleFiles.includes(file)) continue;
  const entries = Array.isArray(data) ? data : data && typeof data === "object" ? [data] : null;
  if (!entries) throw new Error(`People file must contain an object or array: ${file}`);
  entries.forEach((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error(`Invalid people entry at ${file}[${index}]`);
    if (typeof entry.id !== "string" || !entry.id.trim()) throw new Error(`Missing people id at ${file}[${index}]`);
    if (seen.has(entry.id)) throw new Error(`Duplicate people ID ${entry.id}: ${seen.get(entry.id)} and ${file}[${index}]`);
    seen.set(entry.id, `${file}[${index}]`);
  });
}
console.log(`json and people ids ok (${seen.size} unique ids)`);
'

run_check "Build tools" npm run build:tools
run_check "People invalid place refs" node dist/tools/audit-people-invalid-place-refs.mjs
run_check "People of places status" node dist/tools/audit-people-of-places-status.mjs
run_check "People place coverage" node dist/tools/audit-people-place-coverage.mjs
run_check "Etne people manifest integration" node tests/etne-people-manifest-integration.test.js

for batch in $(seq 9 26); do
  run_check "Etne People of Places batch ${batch}" node "tests/etne-people-of-places-batch${batch}.test.js"
done

echo "== People check complete =="
