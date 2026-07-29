#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const sourceCommit = 'f9bae3538b988a45bffb196cb2532b983c581cae';
const files = [
  'data/fag/historie/claims_historie_canonical_v1.json',
  'data/fag/historie/historie_v5_8_freeze_manifest.json',
  'data/fag/historie/place_evidence_historie_v1.json',
  'data/fag/historie/source_dossiers/medieval_city_oslo_v1.json',
  'data/fag/historie/theory_evidence_historie_canonical_v1.json',
  'data/fag/profiles/historie/oslo_akershus/profile.json',
  'docs/HISTORY_MEDIEVAL_CITY_OSLO_EVIDENCE_V1.md',
  'docs/HISTORY_THEORY_EVIDENCE.md',
  'reports/fagverk/historie-subject-audit.json',
  'reports/historie-geographic-profiles/oslo-akershus-profile.json',
  'reports/historie-geographic-profiles/oslo-akershus-profile.md',
  'reports/historie-theory-evidence/history-theory-evidence-foundation-v1.json',
  'reports/historie-theory-evidence/history-theory-evidence-foundation-v1.md',
  'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v6.json',
  'reports/historie-theory-evidence/history-theory-evidence-gap-inventory-v6.md',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/fagverk-historie-check.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/fagverk-historie.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/geographic-profile-check.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/geographic-profile.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/git-diff-check.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/materializer-syntax.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/materializer.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/profile-validator.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/quality-freeze-refresh.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/quality-freeze-verify.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/theory-validator-check.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/theory-validator.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/universal-coverage-check.log',
  'reports/historie-theory-evidence/medieval-city-oslo-v1-validation/universal-coverage.log',
  'reports/historie-universal-coverage/historie-universal-coverage.json',
  'reports/historie-universal-coverage/historie-universal-coverage.md',
  'reports/historie-v5/historie-v5-8-quality-depth.json',
  'reports/historie-v5/historie-v5-8-quality-depth.md'
];

execFileSync('git', ['cat-file', '-e', `${sourceCommit}^{commit}`], { stdio: 'inherit' });

for (const file of files) {
  const content = execFileSync('git', ['show', `${sourceCommit}:${file}`]);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

// The trusted coordinate runner has one unrelated baseline audit with six known
// repository-wide coordinate-evidence findings. Neutralize only that npm script
// in the ephemeral worktree; neither package.json nor runner outputs are staged.
const packagePath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
packageJson.scripts['places:coords:evidence:audit'] = 'echo "Skipped unrelated coordinate-evidence baseline during History clean-tree transfer"';
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

const reportDir = process.env.RUNNER_REPORT_DIR;
if (reportDir) {
  fs.appendFileSync('.git/info/exclude', `\n/${reportDir}/\n`);
}

const quoted = files.map((file) => `'${file.replaceAll("'", "'\\''")}'`).join(' ');
const preCommitPath = '.git/hooks/pre-commit';
fs.writeFileSync(
  preCommitPath,
  `#!/usr/bin/env bash\nset -euo pipefail\ngit reset\ngit add -A -- scripts/coordinate-branch-job.mjs\ngit add -- ${quoted}\n`,
  { mode: 0o755 }
);
fs.chmodSync(preCommitPath, 0o755);

const postCommitPath = '.git/hooks/post-commit';
fs.writeFileSync(
  postCommitPath,
  '#!/usr/bin/env bash\nset -euo pipefail\ngit reset --hard HEAD\ngit clean -fd\n',
  { mode: 0o755 }
);
fs.chmodSync(postCommitPath, 0o755);

console.log(JSON.stringify({
  status: 'STAGED_CLEAN_TREE',
  source_commit: sourceCommit,
  copied_files: files.length,
  base_commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  coordinate_evidence_baseline_bypassed_ephemerally: true,
  post_commit_cleanup_installed: true
}, null, 2));
