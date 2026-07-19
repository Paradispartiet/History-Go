import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const repo = process.cwd();
const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
const backup = fs.mkdtempSync(path.join(os.tmpdir(), 'ankerbrua-refresh-'));

function run(command, args, options = {}) {
  console.log(`$ ${command} ${args.join(' ')}`);
  return execFileSync(command, args, {
    cwd: repo,
    stdio: 'inherit',
    ...options,
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(repo, file), 'utf8'));
}

function writeJson(file, value) {
  const target = path.join(repo, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

function backupFile(file) {
  const source = path.join(repo, file);
  const target = path.join(backup, 'files', file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

const keepFiles = [
  'data/people/kunst/oslo/dyre_vaa.json',
  'data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json',
  'data/quiz/historie/ankerbrua_sets.json',
  'data/stories/stories_ankerbrua.json',
  'reports/ankerbrua-rounds-batch1.md',
  'tests/ankerbrua-rounds-batch1.test.js',
];
for (const file of keepFiles) backupFile(file);

const reportDir = path.join(repo, 'reports/ankerbrua-rounds-batch1');
if (fs.existsSync(reportDir)) {
  const target = path.join(backup, 'files/reports/ankerbrua-rounds-batch1');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(reportDir, target, { recursive: true });
}

const leksikonEntry = readJson('data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json')
  .find(entry => entry?.place_id === 'ankerbrua');
if (!leksikonEntry) throw new Error('Ankerbrua leksikon entry mangler');

const relation = readJson('data/relations.json')
  .find(entry => entry?.id === 'rel_dyre_vaa_ankerbrua_eventyrgrupper');
if (!relation) throw new Error('Ankerbrua relation mangler');

const storyManifestEntry = readJson('data/stories/stories_manifest.json').files
  .find(entry => entry?.entity_id === 'ankerbrua');
if (!storyManifestEntry) throw new Error('Ankerbrua story-manifest entry mangler');

run('git', ['fetch', 'origin', 'main']);
run('git', ['reset', '--hard', 'origin/main']);
fs.cpSync(path.join(backup, 'files'), repo, { recursive: true });

const leksikonPath = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch4.json';
const leksikon = readJson(leksikonPath);
const leksikonIndex = leksikon.findIndex(entry => entry?.place_id === 'ankerbrua');
if (leksikonIndex >= 0) leksikon[leksikonIndex] = leksikonEntry;
else leksikon.push(leksikonEntry);
writeJson(leksikonPath, leksikon);

const peopleManifestPath = 'data/people/manifest.json';
const peopleManifest = readJson(peopleManifestPath);
const personFile = 'people/kunst/oslo/dyre_vaa.json';
if (!peopleManifest.files.includes(personFile)) peopleManifest.files.push(personFile);
writeJson(peopleManifestPath, peopleManifest);

const relationsPath = 'data/relations.json';
const relations = readJson(relationsPath);
const relationIndex = relations.findIndex(entry => entry?.id === relation.id);
if (relationIndex >= 0) relations[relationIndex] = relation;
else relations.push(relation);
writeJson(relationsPath, relations);

const storyManifestPath = 'data/stories/stories_manifest.json';
const storyManifest = readJson(storyManifestPath);
const storyIndex = storyManifest.files.findIndex(entry => entry?.entity_id === 'ankerbrua');
if (storyIndex >= 0) storyManifest.files[storyIndex] = storyManifestEntry;
else storyManifest.files.push(storyManifestEntry);
writeJson(storyManifestPath, storyManifest);

const placePath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/ankerbrua.json';
const place = readJson(placePath);
const manifestPath = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const manifest = readJson(manifestPath);
const manifestRow = manifest.places.find(entry => entry?.id === 'ankerbrua');
if (!manifestRow) throw new Error('Ankerbrua split-manifest row mangler');
manifestRow.name = place.name;
manifestRow.category = place.category;
manifestRow.sha256 = crypto.createHash('sha256')
  .update(fs.readFileSync(path.join(repo, placePath)))
  .digest('hex');
writeJson(manifestPath, manifest);

run('npm', ['run', 'places:index:build']);
run('node', ['tests/ankerbrua-rounds-batch1.test.js']);
run('npm', ['run', 'audit:people-of-places']);
run('npm', ['run', 'leksikon:ids:check']);
run('npm', ['run', 'check:stories']);
run('npm', ['run', 'typecheck:tools']);
run('npm', ['run', 'typecheck:web']);
run('git', ['diff', '--check']);

for (const temporary of [
  '.github/workflows/refresh-ankerbrua-on-main.yml',
  'scripts/coordinate-branch-job.mjs',
  'scripts/.coordinate-branch-job-complete',
]) {
  fs.rmSync(path.join(repo, temporary), { force: true });
}

run('git', ['config', 'user.name', 'github-actions[bot]']);
run('git', ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
run('git', ['add', '-A']);
run('git', ['commit', '-m', 'Refresh Ankerbrua rounds on current main']);
run('git', ['push', '--force', 'origin', `HEAD:${branch}`]);

console.log(`Refreshed ${branch} from current main with Ankerbrua content preserved.`);
