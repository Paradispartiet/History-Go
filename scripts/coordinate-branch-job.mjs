import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const previous = spawnSync('git', ['show', 'HEAD^^:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024
});
if (previous.error || previous.status !== 0) {
  throw new Error(`Could not load original curation runner\n${previous.stderr || ''}`);
}
const replacements = [
  [
    "['pietisme','vekkelse','lekmannsbevegelse','religiøs mobilisering','nettverk'",
    "['pietisme','vekkelse','lekmannsbevegelse','dissentersamfunn','nettverk'"
  ],
  [
    "['minoriteter','nettverk','religiøs mobilisering','livssyn'",
    "['minoriteter','nettverk','dissentersamfunn','livssyn'"
  ]
];
let source = previous.stdout;
for (const [before, after] of replacements) {
  if (!source.includes(before)) throw new Error(`Expected religion concept binding was not found: ${before}`);
  source = source.replace(before, after);
}
const target = path.join('/tmp', 'history-religion-v5-5-curation-fixed.mjs');
fs.writeFileSync(target, source);
await import(`file://${target}?v=${Date.now()}`);
