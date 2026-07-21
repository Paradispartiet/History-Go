import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const sourceCommit = '2480876fc976b301a5216b6ccdd82f5cfa96b9fe';
const placePaths = [
  'data/places/natur/oslo/places_natur/bogstadvannet.json',
  'data/places/by/oslo/places/holmenkollen_kapell.json',
  'data/places/kunst/oslo/places_kunst/kollentrollet.json',
  'data/places/natur/oslo/places_natur/vettakollen.json',
  'data/places/kunst/oslo/places_kunst/kragstotten.json'
];
const evidencePaths = [
  'data/coordinate-evidence/oslo/natur/bogstadvannet.json',
  'data/coordinate-evidence/oslo/by/holmenkollen_kapell.json',
  'data/coordinate-evidence/oslo/kunst/kollentrollet.json',
  'data/coordinate-evidence/oslo/natur/vettakollen.json',
  'data/coordinate-evidence/oslo/kunst/kragstotten.json'
];
const ids = ['bogstadvannet', 'holmenkollen_kapell', 'kollentrollet', 'vettakollen', 'kragstotten'];

const index = JSON.parse(fs.readFileSync(path.join(root, 'data/places/places_index.json'), 'utf8'));
const places = Array.isArray(index) ? index : index.places ?? [];
for (const id of ids) {
  if (places.some((p) => p?.id === id)) throw new Error(`Canonical place already exists on fresh main: ${id}`);
}

async function importFile(rel) {
  const url = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${sourceCommit}/${rel}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-runner/1.0' } });
  if (!response.ok) throw new Error(`Could not import ${rel}: ${response.status} ${response.statusText}`);
  const text = await response.text();
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, text);
}

for (const rel of [...placePaths, ...evidencePaths]) await importFile(rel);

const placeManifestFile = path.join(root, 'data/places/manifest.json');
const placeManifest = JSON.parse(fs.readFileSync(placeManifestFile, 'utf8'));
for (const rel of placePaths) {
  const manifestRel = rel.replace(/^data\//, '');
  if (!placeManifest.files.includes(manifestRel)) placeManifest.files.push(manifestRel);
}
fs.writeFileSync(placeManifestFile, `${JSON.stringify(placeManifest, null, 2)}\n`);

const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceManifest = JSON.parse(fs.readFileSync(evidenceManifestFile, 'utf8'));
for (const rel of evidencePaths) {
  const manifestRel = rel.replace(/^data\/coordinate-evidence\//, '');
  if (!evidenceManifest.files.includes(manifestRel)) evidenceManifest.files.push(manifestRel);
}
fs.writeFileSync(evidenceManifestFile, `${JSON.stringify(evidenceManifest, null, 2)}\n`);

const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
let protocol = fs.readFileSync(protocolFile, 'utf8');
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch) throw new Error('Oslo count not found in protocol');
if (Number(countMatch[1]) !== 274) throw new Error(`Expected fresh batch-115 baseline count 274, found ${countMatch[1]}`);
if (!protocol.includes('Batch 114 (2026-07-21)')) throw new Error('Batch 114 protocol paragraph missing on fresh baseline');
if (protocol.includes('| 115 | `bogstadvannet` |')) throw new Error('Batch 115 Holmenkollen rows already present');

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 274 dokumenterte verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 279 dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 115 produserer fem stabile Holmenkollen-kandidater fra VisitOSLO-auditen: Bogstadvannet, Holmenkollen kapell, Kollentrollet, Vettakollen og Kragstøtten.'
);

const rows = [
  '| 115 | `bogstadvannet` | Bogstadvannet | verified_geometry | `osm-way:4351126` |',
  '| 115 | `holmenkollen_kapell` | Holmenkollen kapell | verified | `geonorge-adresser-v1:0301:13070:142` |',
  '| 115 | `kollentrollet` | Kollentrollet | verified_geometry | `osm-node:1768125117` |',
  '| 115 | `vettakollen` | Vettakollen | verified_geometry | `osm-node:301173327` |',
  '| 115 | `kragstotten` | Kragstøtten | verified_geometry | `osm-node:484968664` |'
];
const lines = protocol.split('\n');
let insertAfter = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\|\s*\d+\s*\|/.test(lines[i])) insertAfter = i;
  if (lines[i].startsWith('Batch 95 (2026-07-21)')) break;
}
if (insertAfter < 0) throw new Error('Could not locate Oslo verified table rows');
lines.splice(insertAfter + 1, 0, ...rows);
const batch114Index = lines.findIndex((line) => line.startsWith('Batch 114 (2026-07-21)'));
if (batch114Index < 0) throw new Error('Could not locate Batch 114 narrative');
lines.splice(batch114Index + 1, 0, '', 'Batch 115 (2026-07-21) produserer fem fysisk selvstendige Holmenkollen-steder fra den lukkede VisitOSLO-auditen. `holmenkollen_kapell` bruker det entydige Geonorge-adressepunktet for Holmenkollveien 142. `bogstadvannet` bruker et områdeanker på eksakt navngitt vanngeometri, mens `kollentrollet`, `vettakollen` og `kragstotten` bruker eksakte navngitte OSM-punktobjekter med riktig objekttype. Vettakollen-stasjon/-bydel og Kragstøtten-guidepost/-utsiktspunkt er eksplisitt avvist som navnelike feilobjekter. Oslo Golfklubb Bogstad holdes utenfor batchen til representasjonsrollen mellom klubbhusadresse og golfbanegeometri er eksplisitt avgjort.');
protocol = lines.join('\n').replace('- Neste nye Oslo-kontroll er batch 115.', '- Neste nye Oslo-kontroll er batch 116.');
fs.writeFileSync(protocolFile, protocol);

fs.rmSync(fileURLToPath(import.meta.url));
console.log('Imported validated Holmenkollen payload and registered it as Oslo coordinate batch 115.');
