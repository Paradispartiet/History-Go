import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const VALIDATED_SCRIPT_COMMIT = 'e39c27b97f920d1dee259ee115ffd3161a208c2d';
const source = execFileSync(
  'git',
  ['show', `${VALIDATED_SCRIPT_COMMIT}:scripts/coordinate-branch-job.mjs`],
  { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
);
if (!source.includes("const BATCH = 159;") || !source.includes("const PLACE_ID = 'alnaelvstien';")) {
  throw new Error(`Commit ${VALIDATED_SCRIPT_COMMIT} inneholder ikke forventet batch-159-produksjonsscript`);
}
const tempFile = path.join(os.tmpdir(), `history-go-batch-159-7cd2-${process.pid}.mjs`);
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
