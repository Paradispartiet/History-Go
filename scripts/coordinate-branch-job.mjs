#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

console.log('Kjører 1814-kuratering mot synkronisert main med verifiserte Akershus-koordinater.');
const run = spawnSync(process.execPath, ['scripts/run-1814-curation.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit'
});
if (run.status !== 0) process.exit(run.status ?? 1);

const generatedPlaceFiles = [
  'data/places/places_index.json',
  'data/quiz/production_context/by/deichman_bjorvika.json'
];
const restore = spawnSync('git', ['checkout', '--', ...generatedPlaceFiles], {
  cwd: process.cwd(),
  encoding: 'utf8'
});
if (restore.status !== 0) {
  process.stderr.write(restore.stderr || 'Kunne ikke gjenopprette genererte stedfiler.\n');
  process.exit(restore.status ?? 1);
}
console.log('1814-kuratering fullført; genererte stedfiler gjenopprettet før globale porter.');
