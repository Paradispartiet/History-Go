import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const RESEARCH_SCRIPT_COMMIT = 'cdf05903b4d059bef6c75389aa7f7917dc129929';
const source = execFileSync(
  'git',
  ['show', `${RESEARCH_SCRIPT_COMMIT}:scripts/coordinate-branch-job.mjs`],
  { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
);
if (!source.includes('const TUNNEL_WAY_ID = 130106085;') || !source.includes('followup-topology.json')) {
  throw new Error(`Commit ${RESEARCH_SCRIPT_COMMIT} inneholder ikke forventet batch-156-oppfølgingsscript`);
}
const tempFile = path.join(os.tmpdir(), `history-go-batch-156-followup-${process.pid}.mjs`);
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
