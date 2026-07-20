import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-retro-audit-from-batch-6');
fs.mkdirSync(reportDir, { recursive: true });

const headSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();

const result = {
  date: '2026-07-20',
  purpose: 'final_post_main_sync_validation',
  branch,
  validatedInputHead: headSha,
  coordinateChangesAppliedByThisJob: 0,
  note: 'This job intentionally changes no canonical coordinate data. The coordinate branch runner rebuilds runtime data and executes all hard coordinate gates against the post-main-sync audit state.'
};

fs.writeFileSync(
  path.join(reportDir, 'final-post-main-sync-validation.json'),
  `${JSON.stringify(result, null, 2)}\n`
);

fs.unlinkSync(new URL(import.meta.url));
console.log(JSON.stringify({ ok: true, ...result }, null, 2));
