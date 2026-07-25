import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const branch = 'agent/history-phase8-final-diagnostic';
const reportPath = 'reports/historie-canonical-migration/phase8-final-audit-diagnostic.json';

const audit = spawnSync(process.execPath, ['scripts/audit-quiz-production-context.mjs'], {
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024
});

let parsed = null;
try {
  parsed = JSON.parse(audit.stdout);
} catch {}

fs.writeFileSync(reportPath, JSON.stringify({
  command: 'node scripts/audit-quiz-production-context.mjs',
  exit_status: audit.status,
  signal: audit.signal,
  report: parsed,
  stdout: parsed ? undefined : audit.stdout,
  stderr: audit.stderr
}, null, 2) + '\n');

fs.rmSync('scripts/coordinate-branch-job.mjs');

for (const [command, args] of [
  ['git', ['config', 'user.name', 'github-actions[bot]']],
  ['git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']],
  ['git', ['add', '-A']],
  ['git', ['commit', '-m', 'Capture phase 8 final audit diagnostic']],
  ['git', ['push', 'origin', `HEAD:${branch}`]]
]) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
}

console.log(`Published ${reportPath}`);
