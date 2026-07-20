import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const commits = execFileSync(
  'git',
  ['log', '--format=%H', '--', 'scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
).trim().split(/\s+/);

const oldLookup = `const birdSources = [
  ...readJson('data/natur/fauna/fugler_by.json'),
  ...readJson('data/natur/fauna/fugler_vatmark_og_skog.json')
];`;
let original = '';
for (const commit of commits) {
  const candidate = execFileSync(
    'git',
    ['show', `${commit}:scripts/coordinate-branch-job.mjs`],
    { encoding: 'utf8' }
  );
  if (candidate.includes(oldLookup)) {
    original = candidate;
    break;
  }
}
if (!original) {
  throw new Error('Fant ikke originalmaterialiseringen i Git-historikken');
}

const fixedLookup = `const birdSources = [
  ...readJson('data/natur/fauna/fugler_by.json'),
  ...readJson('data/natur/fauna/fugler_vatmark_og_skog.json'),
  ...readJson('data/natur/fauna/fugler_etne_stordalen.json'),
  ...readJson('data/natur/fauna/artsdatabanken_oslo_fauna.json')
];`;

const patched = original.replace(oldLookup, fixedLookup);
const tempPath = path.resolve('scripts/.kvaernerbyen-materializer-fixed.mjs');
fs.writeFileSync(tempPath, patched);

try {
  await import(pathToFileURL(tempPath).href);
} finally {
  fs.rmSync(tempPath, { force: true });
}
