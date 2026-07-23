import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const CLEANUP_SCRIPT_COMMIT = '256777b80bbad53badd6e89fdfdcd3f5f810b3b0';
const source = execFileSync(
  'git',
  ['show', `${CLEANUP_SCRIPT_COMMIT}:scripts/coordinate-branch-job.mjs`],
  { cwd: process.cwd(), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
);
if (!source.includes("const LEGACY_ID = 'alnaelva_hovedsteder';") || !source.includes("const CANONICAL_ID = 'alnaelva';")) {
  throw new Error(`Commit ${CLEANUP_SCRIPT_COMMIT} inneholder ikke forventet Alna-duplikatcleanup`);
}
const tempFile = path.join(os.tmpdir(), `history-go-batch-158-v4-${process.pid}.mjs`);
fs.writeFileSync(tempFile, source);
try {
  await import(`${pathToFileURL(tempFile).href}?run=${Date.now()}`);
} finally {
  fs.rmSync(tempFile, { force: true });
}
