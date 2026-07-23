#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

HELPER='tools/add-oslo-scenekunst-three-split-venues.mjs'
REPORT_JSON='reports/scenekunst-oslo-missing-split-venues-2026-07-23.json'
REPORT_MD='reports/scenekunst-oslo-missing-split-venues-2026-07-23.md'
ARCHIVE='/tmp/scenekunst-oslo-three-final.tar.gz'

printf '%s\n' '== Build three missing Oslo Scenekunst split venues on PR merge ref =='
git fetch origin main
git show origin/main:scripts/check-places.sh > /tmp/check-places-original.sh
chmod +x /tmp/check-places-original.sh

node "${HELPER}"
bash /tmp/check-places-original.sh
npm run audit:categories

node <<'NODE'
const fs = require('fs');
const file = 'reports/scenekunst-oslo-missing-split-venues-2026-07-23.json';
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
report.status = 'validated';
report.validatedAt = new Date().toISOString();
report.validation.placesIndexBuild = 'pass';
report.validation.placesChecks = 'pass';
report.validation.categoryAudit = 'pass';
fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
NODE

printf '%s\n' '== Package validated production files without pushing =='
tar -czf "${ARCHIVE}" \
  data/places/places_index.json \
  data/places/scenekunst/oslo/places_scenekunst.json \
  data/places/scenekunst/oslo/places_scenekunst_index.json \
  data/places/scenekunst/oslo/places_scenekunst_manifest.json \
  data/places/scenekunst/oslo/places_scenekunst/rommen_scene.json \
  data/places/scenekunst/oslo/places_scenekunst/salt_oslo.json \
  data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret_intimscenen.json \
  "${REPORT_JSON}" \
  "${REPORT_MD}"

printf '%s\n' 'SCENEKUNST_ARCHIVE_BASE64_BEGIN'
base64 -w 0 "${ARCHIVE}"
printf '\n%s\n' 'SCENEKUNST_ARCHIVE_BASE64_END'
printf '%s\n' 'Validated archive emitted; no repository push attempted.'
