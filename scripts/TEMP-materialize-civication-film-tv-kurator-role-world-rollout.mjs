#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const chunkPaths = Array.from({ length: 8 }, (_, index) => path.join(ROOT, 'scripts', `TEMP-curator-payload-${String(index).padStart(2, '0')}.txt`));
for (const chunkPath of chunkPaths) {
  if (!fs.existsSync(chunkPath)) throw new Error(`Missing curator rollout payload chunk: ${chunkPath}`);
}
const encoded = chunkPaths.map(chunkPath => fs.readFileSync(chunkPath, 'utf8')).join('');
const implementation = gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8');
const implementationPath = path.join(ROOT, 'scripts', 'TEMP-curator-rollout-impl.mjs');
fs.writeFileSync(implementationPath, implementation);
try {
  await import(`${pathToFileURL(implementationPath).href}?run=${Date.now()}`);
  const rolloutTestPath = path.join(ROOT, 'tests', 'civication-film-tv-kurator-role-world-rollout.test.js');
  const rolloutTest = fs.readFileSync(rolloutTestPath, 'utf8');
  fs.writeFileSync(rolloutTestPath, `${rolloutTest.trimEnd()}\n`);
} finally {
  fs.rmSync(implementationPath, { force: true });
}
