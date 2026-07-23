import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const RESEARCH_SCRIPT_COMMIT = '53b51f675dac6387cdfd387acc791c8dec816504';
const source = execFileSync(
  'git',
  ['show', `${RESEARCH_SCRIPT_COMMIT}:scripts/coordinate-branch-job.mjs`],
  { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
);
if (!source.includes("placeId: 'elvestrekning_bla_brenneriveien'") || !source.includes('bridgeCrossings')) {
  throw new Error(`Commit ${RESEARCH_SCRIPT_COMMIT} inneholder ikke forventet batch-160-researchscript`);
}
const tempFile = path.join(os.tmpdir(), `history-go-batch-160-research-${process.pid}.mjs`);
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
