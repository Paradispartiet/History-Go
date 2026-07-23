import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const VALIDATED_SCRIPT_COMMIT = '7e2ac1fb930be92f473db493f08eb6f8f0a503b6';
const source = execFileSync(
  'git',
  ['show', `${VALIDATED_SCRIPT_COMMIT}:scripts/coordinate-branch-job.mjs`],
  { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
);
if (!source.includes("const BATCH = 157;") || !source.includes("const PLACE_ID = 'alnaelva';")) {
  throw new Error(`Commit ${VALIDATED_SCRIPT_COMMIT} inneholder ikke forventet batch-157-script`);
}
const tempFile = path.join(os.tmpdir(), `history-go-batch-157-${process.pid}.mjs`);
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
