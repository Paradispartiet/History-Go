import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const sourceSha = '28f788d6dd5e17f78904d86e83f4562238ff51b3';
const placeId = 'vikedalsvassdraget_bjonndalen';
const placeRel = 'data/places/natur/vestland/etne/vikedalsvassdraget_bjonndalen.json';
const storyRel = 'data/stories/stories_vikedalsvassdraget_bjonndalen.json';
const articleRel = 'data/leksikon/places/vestland/etne/natur/leksikon_vikedalsvassdraget_bjonndalen.json';
const testRel = 'tests/vikedalsvassdraget-bjonndalen-nature-rounds-batch1.test.js';
const reportDirRel = 'reports/vikedalsvassdraget-bjonndalen-nature-rounds-batch1';
const reportDir = path.join(root, reportDirRel);

async function fetchRaw(rel) {
  const url = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${sourceSha}/${rel}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'History-Go validated batch replay' } });
  if (!response.ok) throw new Error(`Failed to fetch ${rel} from validated source commit: HTTP ${response.status}`);
  return response.text();
}

async function writeRaw(rel, content) {
  const full = path.join(root, rel);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content, 'utf8');
}

async function writeJson(file, value) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const placeManifestPath = path.join(root, 'data/places/manifest.json');
const placeManifest = JSON.parse(await fs.readFile(placeManifestPath, 'utf8'));
if (!Array.isArray(placeManifest.files)) throw new Error('data/places/manifest.json missing files[]');
for (const rel of placeManifest.files) {
  const full = path.join(root, 'data', rel);
  try {
    const payload = JSON.parse(await fs.readFile(full, 'utf8'));
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.places) ? payload.places : [];
    if (rows.some((row) => row?.id === placeId)) throw new Error(`Refusing duplicate active place id ${placeId} in ${rel}`);
  } catch (error) {
    if (String(error).includes('Refusing duplicate active place id')) throw error;
  }
}

for (const rel of [placeRel, storyRel, articleRel, testRel]) {
  await writeRaw(rel, await fetchRaw(rel));
}

const sourceSummary = JSON.parse(await fetchRaw(`${reportDirRel}/summary.json`));
const coordinateResolution = JSON.parse(await fetchRaw(`${reportDirRel}/coordinate-resolution.json`));
await fs.mkdir(path.join(reportDir, 'validation'), { recursive: true });
await writeJson(path.join(reportDir, 'summary.json'), {
  ...sourceSummary,
  replayedFromValidatedCommit: sourceSha,
  replayedOnBase: '315f051706c2ba4dab00ab240d5725f129224ef6'
});
await writeJson(path.join(reportDir, 'coordinate-resolution.json'), coordinateResolution);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Vikedalsvassdraget – Bjønndalen: natur-rundinger batch 1\n\nDenne produksjonsbatchen er replayet fra validert commit \`${sourceSha}\` på eksakt fersk main-base \`315f051706c2ba4dab00ab240d5725f129224ef6\`.\n\nDen legger inn det siste systematiske Etne-naturstedet og starter rundingsproduksjonen med alle ni canonical natur-rundinger uten manuell \`rounds\`-override.\n\nKildene i selve steds-, fortellings- og leksikondataene er NVE, Etne kommune og Miljødirektoratet. Bjønndalen behandles som Etne-anker for et større vassdrag, ikke som hele Vikedalsvassdraget.\n`, 'utf8');

const manifestPlaceRel = placeRel.replace(/^data\//, '');
if (!placeManifest.files.includes(manifestPlaceRel)) placeManifest.files.push(manifestPlaceRel);
await writeJson(placeManifestPath, placeManifest);

const storyManifestPath = path.join(root, 'data/stories/stories_manifest.json');
const storyManifest = JSON.parse(await fs.readFile(storyManifestPath, 'utf8'));
if (!Array.isArray(storyManifest.files)) throw new Error('stories_manifest.json missing files[]');
if (!storyManifest.files.some((entry) => (typeof entry === 'string' ? entry === storyRel : entry?.path === storyRel))) {
  storyManifest.files.push({ category: 'natur', path: storyRel, entity_id: placeId });
}
await writeJson(storyManifestPath, storyManifest);

const leksikonManifestPath = path.join(root, 'data/leksikon/manifest.json');
const leksikonManifest = JSON.parse(await fs.readFile(leksikonManifestPath, 'utf8'));
if (!Array.isArray(leksikonManifest.files)) throw new Error('data/leksikon/manifest.json missing files[]');
if (!leksikonManifest.files.includes(articleRel)) leksikonManifest.files.push(articleRel);
await writeJson(leksikonManifestPath, leksikonManifest);

const testResult = spawnSync(process.execPath, [path.join(root, testRel)], { cwd: root, encoding: 'utf8' });
await fs.writeFile(path.join(reportDir, 'validation', 'round-content-test.txt'), `${testResult.stdout || ''}${testResult.stderr || ''}`, 'utf8');
if (testResult.status !== 0) throw new Error(`Round content test failed after fresh-main replay with exit ${testResult.status}`);

console.log(JSON.stringify({
  replayedFromValidatedCommit: sourceSha,
  placeId,
  base: '315f051706c2ba4dab00ab240d5725f129224ef6',
  roundContentTest: 'passed'
}, null, 2));