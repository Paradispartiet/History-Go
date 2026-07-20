import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const SOURCE_COMMIT = 'fa822f2426dbf4d3aa7a25f54303a30031d1a68f';
const RAW_ROOT = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${SOURCE_COMMIT}`;
const PLACE_ID = 'langebudalen_naturreservat';
const PLACE_MANIFEST_REF = 'places/natur/vestland/langebudalen_naturreservat.json';
const FLORA_FILE = 'karplanter_etne_langebudalen.json';

const copyPaths = [
  'data/coordinate-evidence/vestland/natur/langebudalen_naturreservat.json',
  'data/natur/flora/karplanter_etne_langebudalen.json',
  'data/natur/nature_etne_place_map.json',
  'data/places/natur/vestland/etneelva.json',
  'data/places/natur/vestland/langebudalen_naturreservat.json',
  'reports/etne-natur-batch-2-langebudalen.md',
  'tests/etne-fish-species-rounds.test.js',
  'tests/etne-langebudalen-nature-rounds.test.js',
  'tests/etne-nature-round-content.test.js'
];

async function fetchText(url) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'History-Go-rebase-runner/1.0' } });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error(`Fetch failed for ${url}: ${lastError?.message || lastError}`);
}

for (const relativePath of copyPaths) {
  const text = await fetchText(`${RAW_ROOT}/${relativePath}`);
  fs.mkdirSync(path.dirname(relativePath), { recursive: true });
  fs.writeFileSync(relativePath, text, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(relativePath, 'utf8'));
}

function writeJson(relativePath, value) {
  fs.writeFileSync(relativePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const placeManifest = readJson('data/places/manifest.json');
if (!placeManifest.files.includes(PLACE_MANIFEST_REF)) placeManifest.files.push(PLACE_MANIFEST_REF);
writeJson('data/places/manifest.json', placeManifest);

const floraManifest = readJson('data/natur/flora/manifest.json');
if (!floraManifest.files.includes(FLORA_FILE)) floraManifest.files.push(FLORA_FILE);
writeJson('data/natur/flora/manifest.json', floraManifest);

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes(`\`${PLACE_ID}\``)) {
  protocol += `\n\n## Vestland – Etne\n\n| batch | placeId | navn | godkjent status | kildeobjekt |\n|---:|---|---|---|---|\n| 1 | \`${PLACE_ID}\` | Langebudalen naturreservat | verified_geometry | \`miljodirektoratet-naturvern:VV00001065\` |\n\nEtne batch 1 (2026-07-20) bruker Miljødirektoratets offisielle vernepolygon som områdegeometri. Representasjonspunktet ligger inne i polygonet og er ikke et tilgangs- eller parkeringspunkt.\n`;
}
fs.writeFileSync(protocolPath, protocol.endsWith('\n') ? protocol : `${protocol}\n`, 'utf8');

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed with ${result.status}`);
}

run('npx', ['tsx', 'tools/validate_nature_maps.mts']);
run('node', ['tests/etne-langebudalen-nature-rounds.test.js']);
run('node', ['tests/etne-fish-species-rounds.test.js']);
run('node', ['tests/etne-nature-round-content.test.js']);

console.log(`Langebudalen rebased onto current main from ${SOURCE_COMMIT}`);
