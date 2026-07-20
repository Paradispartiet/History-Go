import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SOURCE_COMMIT = 'd43eb6de005e9198360cc4ece39ad082e8017a6d';
const RAW_ROOT = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${SOURCE_COMMIT}`;
const PLACE_ID = 'skano_naturreservat_etne';
const MAP_REL = 'data/natur/nature_etne_place_map.json';
const PLACE_MANIFEST_REF = 'places/natur/vestland/skano_naturreservat_etne.json';
const FAUNA_FILE = 'fugler_etne_skano.json';
const copyPaths = [
  'data/coordinate-evidence/vestland/natur/skano_naturreservat_etne.json',
  'data/natur/fauna/fugler_etne_skano.json',
  'data/places/natur/vestland/skano_naturreservat_etne.json',
  'reports/etne-natur-batch-5-skano-artskart.json',
  'reports/etne-natur-batch-5-skano.md',
  'tests/etne-skano-nature-rounds.test.js'
];

async function fetchText(rel) {
  const url = `${RAW_ROOT}/${rel}`;
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'History-Go-Skano-merge/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(`Fetch failed for ${url}: ${lastError?.message || lastError}`);
}
function readJson(rel) { return JSON.parse(fs.readFileSync(rel, 'utf8')); }
function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function writeText(rel, value) {
  fs.mkdirSync(path.dirname(rel), { recursive: true });
  fs.writeFileSync(rel, value.endsWith('\n') ? value : `${value}\n`, 'utf8');
}
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

for (const rel of copyPaths) writeText(rel, await fetchText(rel));
const sourceMap = JSON.parse(await fetchText(MAP_REL));
const map = readJson(MAP_REL);
map.meta = map.meta || {};
map.meta.version = '0.8.0';
map.meta.updatedAt = '2026-07-21';
map.meta.sources = Array.from(new Set([...(map.meta.sources || []), ...(sourceMap.meta?.sources || [])]));
map.places = map.places || {};
map.places[PLACE_ID] = sourceMap.places[PLACE_ID];
writeJson(MAP_REL, map);

const placeManifest = readJson('data/places/manifest.json');
if (!placeManifest.files.includes(PLACE_MANIFEST_REF)) placeManifest.files.push(PLACE_MANIFEST_REF);
writeJson('data/places/manifest.json', placeManifest);
const faunaManifest = readJson('data/natur/fauna/manifest.json');
if (!faunaManifest.files.includes(FAUNA_FILE)) faunaManifest.files.push(FAUNA_FILE);
writeJson('data/natur/fauna/manifest.json', faunaManifest);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes(`\`${PLACE_ID}\``)) {
  protocol += `\n| 4 | \`${PLACE_ID}\` | Skåno naturreservat | verified_geometry | \`miljodirektoratet-naturvern:VV00001719\` |\n\nEtne batch 4 (2026-07-21) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Artskart-revisjonen er avgrenset til den samme polygonen og dokumentert i \`reports/etne-natur-batch-5-skano-artskart.json\`.\n`;
}
writeText(protocolPath, protocol);

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', ['tests/etne-skano-nature-rounds.test.js']);
run('node', ['tests/etne-brattholmen-nature-rounds.test.js']);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);
console.log(`Skåno merged cleanly over current main from ${SOURCE_COMMIT}`);
