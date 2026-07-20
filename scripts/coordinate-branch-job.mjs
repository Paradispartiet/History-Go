import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SOURCE_COMMIT = '08793bd819341fe849c2babf0f688af1a5a4795f';
const RAW_ROOT = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${SOURCE_COMMIT}`;
const PLACE_ID = 'brattholmen_naturreservat_etne';
const PLACE_MANIFEST_REF = 'places/natur/vestland/brattholmen_naturreservat_etne.json';
const FAUNA_FILE = 'fugler_etne_brattholmen.json';

const copyPaths = [
  'data/coordinate-evidence/vestland/natur/brattholmen_naturreservat_etne.json',
  'data/natur/fauna/fugler_etne_brattholmen.json',
  'data/places/natur/vestland/brattholmen_naturreservat_etne.json',
  'reports/etne-natur-batch-4-brattholmen-artskart.json',
  'reports/etne-natur-batch-4-brattholmen.md',
  'tests/etne-brattholmen-nature-rounds.test.js'
];

async function fetchText(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'History-Go-Brattholmen-final-merge/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(`Fetch failed for ${url}: ${lastError?.message || lastError}`);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(relativePath, 'utf8'));
}
function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(relativePath), { recursive: true });
  fs.writeFileSync(relativePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

for (const relativePath of copyPaths) {
  const text = await fetchText(`${RAW_ROOT}/${relativePath}`);
  fs.mkdirSync(path.dirname(relativePath), { recursive: true });
  fs.writeFileSync(relativePath, text, 'utf8');
}

const sourceMap = JSON.parse(await fetchText(`${RAW_ROOT}/data/natur/nature_etne_place_map.json`));
const mapPath = 'data/natur/nature_etne_place_map.json';
const map = readJson(mapPath);
map.meta = map.meta || {};
map.meta.version = '0.7.0';
map.meta.updatedAt = '2026-07-21';
map.meta.sources = Array.from(new Set([
  ...(Array.isArray(map.meta.sources) ? map.meta.sources : []),
  ...(Array.isArray(sourceMap.meta?.sources) ? sourceMap.meta.sources : [])
]));
map.places = map.places || {};
map.places[PLACE_ID] = sourceMap.places[PLACE_ID];
writeJson(mapPath, map);

const placeManifest = readJson('data/places/manifest.json');
if (!placeManifest.files.includes(PLACE_MANIFEST_REF)) placeManifest.files.push(PLACE_MANIFEST_REF);
writeJson('data/places/manifest.json', placeManifest);

const faunaManifest = readJson('data/natur/fauna/manifest.json');
if (!faunaManifest.files.includes(FAUNA_FILE)) faunaManifest.files.push(FAUNA_FILE);
writeJson('data/natur/fauna/manifest.json', faunaManifest);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes(`\`${PLACE_ID}\``)) {
  const etneHeading = '## Vestland – Etne';
  const row = `| 3 | \`${PLACE_ID}\` | Brattholmen naturreservat | verified_geometry | \`miljodirektoratet-naturvern:VV00001741\` |`;
  if (protocol.includes(etneHeading)) {
    protocol += `\n${row}\n\nEtne batch 3 (2026-07-21) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Artskart-revisjonen bruker det samme polygonet og er dokumentert i \`reports/etne-natur-batch-4-brattholmen-artskart.json\`.\n`;
  } else {
    protocol += `\n\n${etneHeading}\n\n| batch | placeId | navn | godkjent status | kildeobjekt |\n|---:|---|---|---|---|\n${row}\n\nEtne batch 3 (2026-07-21) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Artskart-revisjonen bruker det samme polygonet og er dokumentert i \`reports/etne-natur-batch-4-brattholmen-artskart.json\`.\n`;
  }
}
fs.writeFileSync(protocolPath, protocol.endsWith('\n') ? protocol : `${protocol}\n`, 'utf8');

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', ['tests/etne-brattholmen-nature-rounds.test.js']);
run('node', ['tests/etne-saevareidberget-nature-rounds.test.js']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log(`Brattholmen final conflict-free rebuild from ${SOURCE_COMMIT}`);
