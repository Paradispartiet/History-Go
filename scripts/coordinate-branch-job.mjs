import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const original = execFileSync(
  'git',
  ['show', 'HEAD^^:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);

const oldLookup = `const birdSources = [
  ...readJson('data/natur/fauna/fugler_by.json'),
  ...readJson('data/natur/fauna/fugler_vatmark_og_skog.json')
];`;
const fixedLookup = `const birdSources = fs
  .readdirSync(path.join(root, 'data/natur/fauna'))
  .filter(name => name.endsWith('.json'))
  .flatMap(name => {
    const value = readJson(path.join('data/natur/fauna', name));
    return Array.isArray(value) ? value : [];
  });`;

if (!original.includes(oldLookup)) {
  throw new Error('Fant ikke forventet fuglekortoppslag i originalmaterialiseringen');
}

const patched = original.replace(oldLookup, fixedLookup);
const tempPath = path.resolve('scripts/.kvaernerbyen-materializer-fixed.mjs');
fs.writeFileSync(tempPath, patched);

try {
  await import(pathToFileURL(tempPath).href);
} finally {
  fs.rmSync(tempPath, { force: true });
}
