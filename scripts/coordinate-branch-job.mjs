import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

function run(command, args) {
  console.log(`$ ${command} ${args.join(' ')}`);
  execFileSync(command, args, { stdio: 'inherit' });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json';
const routeIndexPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const routeManifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';

const place = readJson(placePath);
const routeIndex = readJson(routeIndexPath);
const routeRow = routeIndex.find(entry => entry?.id === place.id);
if (!routeRow) throw new Error('Ankerbrua mangler i Akerselva-routeindeksen');
for (const key of ['name', 'category', 'lat', 'lon', 'r', 'year', 'coordStatus', 'coordType']) {
  routeRow[key] = place[key];
}
writeJson(routeIndexPath, routeIndex);

const routeManifest = readJson(routeManifestPath);
const manifestRow = routeManifest.places.find(entry => entry?.id === place.id);
if (!manifestRow) throw new Error('Ankerbrua mangler i Akerselva split-manifest');
manifestRow.name = place.name;
manifestRow.category = place.category;
manifestRow.sha256 = crypto.createHash('sha256').update(fs.readFileSync(placePath)).digest('hex');
writeJson(routeManifestPath, routeManifest);

run('npm', ['run', 'places:index:build']);
run('node', ['tests/ankerbrua-rounds-batch1.test.js']);
run('npm', ['run', 'audit:people-of-places']);
run('npm', ['run', 'leksikon:ids:check']);
run('npm', ['run', 'check:stories']);
run('npm', ['run', 'typecheck:tools']);
run('npm', ['run', 'typecheck:web']);
run('git', ['diff', '--check']);

fs.rmSync('.github/workflows/temp-trigger-ankerbrua-refresh.yml', { force: true });
fs.rmSync('scripts/coordinate-branch-job.mjs', { force: true });

console.log('Ankerbrua clean rebuild completed on current main.');
