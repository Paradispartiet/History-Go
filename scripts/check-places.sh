#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# One-shot runner; restores the canonical script and removes the helper before publishing.
BRANCH='agent/scenekunst-oslo-three-missing-split-venues'
HELPER='tools/add-oslo-scenekunst-three-split-venues.mjs'
REPORT_JSON='reports/scenekunst-oslo-missing-split-venues-2026-07-23.json'
REPORT_MD='reports/scenekunst-oslo-missing-split-venues-2026-07-23.md'

printf '%s\n' '== Synchronize three-place Oslo Scenekunst branch with current main =='
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git fetch origin main "${BRANCH}"
git show origin/main:scripts/check-places.sh > /tmp/check-places-original.sh
chmod +x /tmp/check-places-original.sh
git checkout -B "${BRANCH}" "origin/${BRANCH}"

set +e
git merge --no-ff --no-commit origin/main
merge_status=$?
set -e
if [ "${merge_status}" -ne 0 ]; then
  echo 'Unexpected merge conflict while synchronizing with main:'
  git diff --name-only --diff-filter=U
  exit 1
fi

printf '%s\n' '== Build missing Oslo split venues and validate canonical data =='
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

printf '%s\n' '== Restore canonical runner and publish clean production commit =='
git checkout origin/main -- scripts/check-places.sh
git rm "${HELPER}"

git add scripts/check-places.sh
git add data/places/places_index.json
git add data/places/scenekunst/oslo/places_scenekunst.json
git add data/places/scenekunst/oslo/places_scenekunst_index.json
git add data/places/scenekunst/oslo/places_scenekunst_manifest.json
git add data/places/scenekunst/oslo/places_scenekunst/rommen_scene.json
git add data/places/scenekunst/oslo/places_scenekunst/salt_oslo.json
git add data/places/scenekunst/oslo/places_scenekunst/det_andre_teatret_intimscenen.json
git add "${REPORT_JSON}" "${REPORT_MD}"

git diff --cached --stat
git diff --cached --quiet && { echo 'No production changes produced'; exit 1; }
git commit -m 'Add three missing Oslo Scenekunst split venues'
git push origin HEAD:"${BRANCH}"

echo 'Clean three-place Oslo Scenekunst commit published.'
