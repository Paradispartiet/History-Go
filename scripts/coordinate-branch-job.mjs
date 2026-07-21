import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const sourceCommit = 'f513a4ae0bb560183d0bef0e114f527589f1bf9c';
const placeFile = 'data/places/sport/europa/norway/oslo_sport/oslo_golfklubb_bogstad.json';
const evidenceFile = 'data/coordinate-evidence/oslo/sport/oslo_golfklubb_bogstad.json';

const indexRaw = JSON.parse(fs.readFileSync(path.join(root, 'data/places/places_index.json'), 'utf8'));
const indexPlaces = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (indexPlaces.some((p) => p?.id === 'oslo_golfklubb_bogstad')) throw new Error('oslo_golfklubb_bogstad already exists');

async function importFile(rel) {
  const url = `https://raw.githubusercontent.com/Paradispartiet/History-Go/${sourceCommit}/${rel}`;
  const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-runner/1.0' } });
  if (!response.ok) throw new Error(`Could not import ${rel}: ${response.status} ${response.statusText}`);
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, await response.text());
}
await importFile(placeFile);
await importFile(evidenceFile);

const placeManifestFile = path.join(root, 'data/places/manifest.json');
const placeManifest = JSON.parse(fs.readFileSync(placeManifestFile, 'utf8'));
const placeRel = placeFile.replace(/^data\//, '');
if (!placeManifest.files.includes(placeRel)) placeManifest.files.push(placeRel);
fs.writeFileSync(placeManifestFile, `${JSON.stringify(placeManifest, null, 2)}\n`);

const evidenceManifestFile = path.join(root, 'data/coordinate-evidence/manifest.json');
const evidenceManifest = JSON.parse(fs.readFileSync(evidenceManifestFile, 'utf8'));
const evidenceRel = evidenceFile.replace(/^data\/coordinate-evidence\//, '');
if (!evidenceManifest.files.includes(evidenceRel)) evidenceManifest.files.push(evidenceRel);
fs.writeFileSync(evidenceManifestFile, `${JSON.stringify(evidenceManifest, null, 2)}\n`);

const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
let protocol = fs.readFileSync(protocolFile, 'utf8');
const countMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) dokumenterte verifiserte eller kildekontrollerte canonical steder\./);
if (!countMatch || Number(countMatch[1]) !== 339) throw new Error(`Expected Oslo total 339, found ${countMatch?.[1] ?? 'missing'}`);
if (!protocol.includes('Batch 116 legger til åtte separate Oslofjord-steder')) throw new Error('Batch 116 Oslofjord summary missing');
if (!protocol.includes('| 115 | `bogstadvannet` |')) throw new Error('Batch 115 Holmenkollen rows missing');
if (protocol.includes('`oslo_golfklubb_bogstad`')) throw new Error('Golf club already present in protocol');

protocol = protocol.replace(
  /Oslo-tabellen inneholder nå 339 dokumenterte verifiserte eller kildekontrollerte canonical steder\.[^\n]*/,
  'Oslo-tabellen inneholder nå 340 dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 117 produserer Oslo Golfklubb på Bogstad som det sjette og siste nye stedet fra den lukkede VisitOSLO Holmenkollen-auditen. Batch 116 legger til åtte separate Oslofjord-steder fra den lukkede VisitOSLO Oslofjorden-auditen.'
);

const lines = protocol.split('\n');
let insertAfter = -1;
for (let i = 0; i < lines.length; i++) {
  if (/^\|\s*\d+\s*\|/.test(lines[i])) insertAfter = i;
  if (lines[i].startsWith('Batch 95 (2026-07-21)')) break;
}
if (insertAfter < 0) throw new Error('Could not locate Oslo verified table');
lines.splice(insertAfter + 1, 0, '| 117 | `oslo_golfklubb_bogstad` | Oslo Golfklubb – Bogstad | verified | `geonorge-adresser-v1:0301:10163:127` |');

const batch116Index = lines.findIndex((line) => lines[line ? 0 : 0] && line.startsWith('Batch 116 (2026-07-21)'));
let narrativeIndex = batch116Index;
if (narrativeIndex < 0) {
  narrativeIndex = lines.findIndex((line) => line.includes('Batch 116') && line.includes('Oslofjord'));
}
if (narrativeIndex < 0) throw new Error('Batch 116 narrative missing');
lines.splice(narrativeIndex + 1, 0, '', 'Batch 117 (2026-07-21) produserer `oslo_golfklubb_bogstad` som det sjette og siste nye stedet fra VisitOSLO Holmenkollen-auditen. Den normative address-first-kjøringen ga ett entydig Geonorge-treff for Ankerveien 127. Klubbhuset brukes som stabil offentlig display- og unlock-marker for hele golfanlegget; den omtrent 480 mål store 18-hullsbanen er stedsomfang og sportskontekst, men adressepunktet påstås ikke å være banens geometriske sentrum.');
protocol = lines.join('\n').replace('- Neste nye Oslo-kontroll er batch 116.', '- Neste nye Oslo-kontroll er batch 118.');
fs.writeFileSync(protocolFile, protocol);

fs.rmSync(fileURLToPath(import.meta.url));
console.log('Finalized Oslo Golfklubb Bogstad as coordinate batch 117 on Oslofjord baseline.');
