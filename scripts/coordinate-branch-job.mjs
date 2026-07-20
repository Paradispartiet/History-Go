import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_COMMIT = 'd2cdea1d9ad8d62c0b756f00c2d5ca54e3364818';
const SOURCE_PATH = 'scripts/coordinate-branch-job.mjs';
const tempRunner = path.join(ROOT, 'scripts/.vikaterrassen-production-fixed.mjs');

let source = execFileSync('git', ['show', `${SOURCE_COMMIT}:${SOURCE_PATH}`], {
  cwd: ROOT,
  encoding: 'utf8'
});

const occurrences = source.match(/'pedestrian_area'/g)?.length ?? 0;
if (occurrences !== 2) {
  throw new Error(`Expected exactly two pedestrian_area contract values in the original runner, found ${occurrences}`);
}

source = source.replaceAll("'pedestrian_area'", "'linear_area'");
fs.writeFileSync(tempRunner, source);

try {
  execFileSync(process.execPath, [tempRunner], { cwd: ROOT, stdio: 'inherit' });
} finally {
  if (fs.existsSync(tempRunner)) fs.unlinkSync(tempRunner);
}
