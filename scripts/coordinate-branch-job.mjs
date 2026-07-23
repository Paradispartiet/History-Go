import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const VALIDATED_SCRIPT_COMMIT = '20cbb13551bb4f768e82c4c47a3b354114a41958';
const source = execFileSync(
  'git',
  ['show', `${VALIDATED_SCRIPT_COMMIT}:scripts/coordinate-branch-job.mjs`],
  { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
);
if (!source.includes("const BATCH = 154;") || !source.includes("const PLACE_ID = 'alna_smalvoll';")) {
  throw new Error(`Commit ${VALIDATED_SCRIPT_COMMIT} inneholder ikke forventet batch-154-script`);
}
const tempFile = path.join(os.tmpdir(), `history-go-batch-154-${process.pid}.mjs`);
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
