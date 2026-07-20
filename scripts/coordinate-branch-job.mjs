import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-attractions-production-skimore-oslo';
const tempRunner = path.join(ROOT, 'scripts/.skimore-oslo-v2-runner.mjs');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');

const protocol = fs.readFileSync(protocolPath, 'utf8');
const expectedBoundary = '\n\nRelevante korrigerende merger for de første Oslo-batchene:';
if (!protocol.includes(expectedBoundary)) {
  throw new Error('Current main does not have the repaired Oslo table boundary required by the validated Skimore runner');
}

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
const source = execFileSync('git', ['show', 'FETCH_HEAD:scripts/coordinate-branch-job.mjs'], { encoding: 'utf8' });
fs.writeFileSync(tempRunner, source);

try {
  execFileSync(process.execPath, [tempRunner], { cwd: ROOT, stdio: 'inherit' });
} finally {
  if (fs.existsSync(tempRunner)) fs.unlinkSync(tempRunner);
}
