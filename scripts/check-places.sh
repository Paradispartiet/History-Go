#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH='agent/scenekunst-oslo-split-venues-01-ci-runner'
SOURCE='agent/scenekunst-oslo-split-venues-01-final'
REPORT_JSON='reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.json'

printf '%s\n' '== Prepare Oslo Scenekunst resync on feature branch =='
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git fetch origin main "${BRANCH}" "${SOURCE}"
git show origin/main:scripts/check-places.sh > /tmp/check-places-original.sh
chmod +x /tmp/check-places-original.sh
git checkout -B "${BRANCH}" "origin/${BRANCH}"

files=(
  data/places/scenekunst/oslo/places_scenekunst/teater_manu.json
  data/places/scenekunst/oslo/places_scenekunst/vega_scene.json
  data/places/scenekunst/oslo/places_scenekunst/rommen_scene.json
  data/places/scenekunst/oslo/places_scenekunst/salt_oslo.json
  data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret_intimscenen.json
  reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.json
  reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.md
)
for file in "${files[@]}"; do
  test ! -e "${file}" || { echo "Target already exists: ${file}"; exit 1; }
  mkdir -p "$(dirname "${file}")"
  git show "origin/${SOURCE}:${file}" > "${file}"
done

node tools/resync-oslo-scenekunst-split-venues.mjs

printf '%s\n' '== Run canonical Places checks on generated data =='
bash /tmp/check-places-original.sh
npm run audit:categories

node <<'NODE'
const fs = require('fs');
const file = 'reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.json';
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
report.status = 'validated';
report.validatedAt = new Date().toISOString();
report.validation.placesIndexBuild = 'pass';
report.validation.placesChecks = 'pass';
report.validation.categoryAudit = 'pass';
fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n');
NODE

printf '%s\n' '== Restore canonical runner and publish clean feature commit =='
git checkout origin/main -- scripts/check-places.sh
git rm tools/resync-oslo-scenekunst-split-venues.mjs

git add scripts/check-places.sh
git add data/places/places_index.json
git add data/places/scenekunst/oslo/places_scenekunst.json
git add data/places/scenekunst/oslo/places_scenekunst_index.json
git add data/places/scenekunst/oslo/places_scenekunst_manifest.json
git add data/places/scenekunst/oslo/places_scenekunst/teater_manu.json
git add data/places/scenekunst/oslo/places_scenekunst/vega_scene.json
git add data/places/scenekunst/oslo/places_scenekunst/rommen_scene.json
git add data/places/scenekunst/oslo/places_scenekunst/salt_oslo.json
git add data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret_intimscenen.json
git add "${REPORT_JSON}"
git add reports/scenekunst-oslo-split-venues-batch-1-2026-07-23.md

git diff --cached --stat
git diff --cached --quiet && { echo 'No production changes produced'; exit 1; }
git commit -m 'Resync five Oslo Scenekunst split venues with main'
git push origin HEAD:"${BRANCH}"

echo 'Oslo Scenekunst resync published to feature branch.'
