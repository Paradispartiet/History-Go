#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

BRANCH='agent/scenekunst-oslo-split-venues-01-atomic'

printf '%s\n' '== Synchronize Oslo Scenekunst production branch with current main =='
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git fetch origin main "${BRANCH}"
git checkout -B "${BRANCH}" "origin/${BRANCH}"
git show origin/main:scripts/check-places.sh > /tmp/check-places-original.sh
chmod +x /tmp/check-places-original.sh

set +e
git merge --no-ff --no-commit origin/main
merge_status=$?
set -e
if [ "${merge_status}" -ne 0 ]; then
  echo 'Unexpected merge conflict while synchronizing with main:'
  git diff --name-only --diff-filter=U
  exit 1
fi

printf '%s\n' '== Regenerate and validate canonical place data =='
bash /tmp/check-places-original.sh
npm run audit:categories

printf '%s\n' '== Restore canonical runner and publish clean production commit =='
git checkout origin/main -- scripts/check-places.sh
git add scripts/check-places.sh data/places/places_index.json

if git diff --cached --quiet && ! git rev-parse -q --verify MERGE_HEAD >/dev/null; then
  echo 'No generated or synchronization changes produced'
  exit 1
fi

git commit -m 'Finalize five Oslo Scenekunst split venues on current main'
git push origin HEAD:"${BRANCH}"

echo 'Clean Oslo Scenekunst production commit published.'
