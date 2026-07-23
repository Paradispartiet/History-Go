import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const sourceSha = 'd708d96252952a1a77883ffa244e40b11a86541d';
const sourceBase = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${sourceSha}`;
const storyPath = 'data/stories/stories_etne_natur_rounds_batch2.json';
const articlePath = 'data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch2.json';
const testPath = 'tests/etne-natur-rounds-batch2.test.js';
const reportDir = 'reports/etne-natur-rounds-batch2';

const copyPaths = [
  'data/places/natur/vestland/etne/folgefonnanasjonalpark_etne.json',
  'data/places/natur/vestland/etne/mosneselva_etne.json',
  'data/places/natur/vestland/etne/rullestadvatnet.json',
  storyPath,
  articlePath,
  testPath,
  `${reportDir}/README.md`,
  `${reportDir}/summary.json`
];

for (const relativePath of copyPaths) {
  const response = await fetch(`${sourceBase}/${relativePath}`);
  if (!response.ok) throw new Error(`Could not fetch validated batch file ${relativePath}: HTTP ${response.status}`);
  const text = await response.text();
  const full = path.join(root, relativePath);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, text, 'utf8');
}

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => {
  await fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const storiesManifest = await readJson('data/stories/stories_manifest.json');
for (const entityId of ['folgefonnanasjonalpark_etne', 'mosneselva_etne', 'rullestadvatnet']) {
  if (!storiesManifest.files.some((row) => row.entity_id === entityId && row.path === storyPath)) {
    storiesManifest.files.push({ category: 'natur', entity_id: entityId, path: storyPath });
  }
}
await writeJson('data/stories/stories_manifest.json', storiesManifest);

const leksikonManifest = await readJson('data/leksikon/manifest.json');
if (!leksikonManifest.files.includes(articlePath)) leksikonManifest.files.push(articlePath);
await writeJson('data/leksikon/manifest.json', leksikonManifest);

let output = '';
try {
  output = execFileSync(process.execPath, [testPath], { cwd: root, encoding: 'utf8' });
} catch (error) {
  output = `${error.stdout || ''}${error.stderr || ''}`;
  await fs.mkdir(path.join(root, reportDir, 'validation'), { recursive: true });
  await fs.writeFile(path.join(root, reportDir, 'validation', 'round-content-test.txt'), output, 'utf8');
  throw error;
}
await fs.mkdir(path.join(root, reportDir, 'validation'), { recursive: true });
await fs.writeFile(path.join(root, reportDir, 'validation', 'round-content-test.txt'), output, 'utf8');
await fs.writeFile(path.join(root, reportDir, 'replay-source.txt'), `Validated source commit: ${sourceSha}\nReplayed on current main by coordinate branch runner.\n`, 'utf8');

console.log('Etne nature rounds batch 2 replay generated and validated.');
