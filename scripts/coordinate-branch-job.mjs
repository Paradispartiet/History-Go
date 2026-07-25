import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const cleanReports = [
  'reports/coordinate-evidence-audit.md',
  'reports/place-coordinate-intake-gate.md',
  'reports/place-coordinate-quality-gate.md'
];
const runnerDir = 'reports/coordinate-branch-runner/agent_historie-industri-arbeid-sosialhistorie-phase-4';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
}

run('git', ['fetch', 'origin', 'main']);
run('git', ['checkout', 'origin/main', '--', ...cleanReports]);
fs.rmSync(runnerDir, { recursive: true, force: true });
fs.mkdirSync(runnerDir, { recursive: true });

const hook = `#!/usr/bin/env bash
set -euo pipefail
git checkout origin/main -- ${cleanReports.join(' ')}
git add ${cleanReports.join(' ')}
if [[ -d '${runnerDir}' ]]; then
  find '${runnerDir}' -type f -delete
  git add -A '${runnerDir}'
fi
`;
fs.writeFileSync('.git/hooks/pre-commit', hook, { mode: 0o755 });
console.log('Installed final History phase 4 diff-cleaning hook.');
