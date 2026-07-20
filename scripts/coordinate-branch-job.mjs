import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const coordinateManifestPath = 'data/coordinate-evidence/manifest.json';
const coordinateManifest = readJson(coordinateManifestPath);
coordinateManifest.files = Array.from(new Set([
  ...(coordinateManifest.files || []),
  'oslo/natur/vaterlandsparken.json',
])).sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(coordinateManifestPath, coordinateManifest);

const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = readJson(peopleManifestPath);
peopleManifest.files = Array.from(new Set([
  ...(peopleManifest.files || []),
  'people/by/oslo/akerselva/people_nybrua_vaterlandsparken.json',
])).sort((a, b) => a.localeCompare(b, 'nb'));
writeJson(peopleManifestPath, peopleManifest);

const run = (command, args) => execFileSync(command, args, { stdio: 'inherit' });
run('npm', ['run', 'places:index:build']);
run('node', ['tests/nybrua-vaterlandsparken-split-rounds-batch1.test.js']);
run('npm', ['run', 'audit:places-split-manifest-sync']);
run('npm', ['run', 'places:index:check']);
run('npm', ['run', 'audit:people-of-places']);
run('npm', ['run', 'leksikon:ids:check']);
run('npm', ['run', 'test:coordinate-source-contract']);
run('npm', ['run', 'places:coords:quality']);
run('npm', ['run', 'places:coords:intake']);
run('npm', ['run', 'places:coords:evidence:audit']);
run('npm', ['run', 'typecheck:tools']);
run('npm', ['run', 'typecheck:web']);
run('git', ['diff', '--check']);
console.log('Nybrua/Vaterlandsparken clean finalizer completed on latest main.');
