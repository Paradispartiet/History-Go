import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_REF = 'origin/agent/oslo-coordinate-museum-production-batch-44';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

const items = [
  {
    id: 'kunstnernes_hus',
    placeFile: 'data/places/kunst/oslo/places_kunst/kunstnernes_hus.json',
    placeManifestEntry: 'places/kunst/oslo/places_kunst/kunstnernes_hus.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/kunstnernes_hus.json',
    evidenceManifestEntry: 'oslo/kunst/kunstnernes_hus.json'
  },
  {
    id: 'vigelandmuseet',
    placeFile: 'data/places/kunst/oslo/places_kunst/vigelandmuseet.json',
    placeManifestEntry: 'places/kunst/oslo/places_kunst/vigelandmuseet.json',
    evidenceFile: 'data/coordinate-evidence/oslo/kunst/vigelandmuseet.json',
    evidenceManifestEntry: 'oslo/kunst/vigelandmuseet.json'
  },
  {
    id: 'mollergata_skole',
    placeFile: 'data/places/historie/oslo/places_historie/mollergata_skole.json',
    placeManifestEntry: 'places/historie/oslo/places_historie/mollergata_skole.json',
    evidenceFile: 'data/coordinate-evidence/oslo/historie/mollergata_skole.json',
    evidenceManifestEntry: 'oslo/historie/mollergata_skole.json'
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function replaceOnce(text, before, after, label) {
  const first = text.indexOf(before);
  if (first < 0) throw new Error(`${label}: expected text not found`);
  if (text.indexOf(before, first + before.length) >= 0) throw new Error(`${label}: expected exactly one match`);
  return text.slice(0, first) + after + text.slice(first + before.length);
}
function assertNoActivePlaceId(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const row of rowsFrom(readJson(rel))) {
      if (row?.id === placeId) hits.push(rel);
    }
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}
function copyFromValidatedBranch(rel) {
  const content = execFileSync('git', ['show', `${SOURCE_REF}:${rel}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), content.endsWith('\n') ? content : `${content}\n`);
}

for (const item of items) {
  assertNoActivePlaceId(item.id);
  if (fs.existsSync(abs(item.placeFile))) throw new Error(`${item.id}: place file already exists on current main`);
  if (fs.existsSync(abs(item.evidenceFile))) throw new Error(`${item.id}: evidence file already exists on current main`);
  copyFromValidatedBranch(item.placeFile);
  copyFromValidatedBranch(item.evidenceFile);
}

const placeManifest = readJson(PLACE_MANIFEST);
for (const item of items) {
  if (placeManifest.files.includes(item.placeManifestEntry)) throw new Error(`${item.placeManifestEntry}: already registered`);
  placeManifest.files.push(item.placeManifestEntry);
}
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
for (const item of items) {
  if (evidenceManifest.files.includes(item.evidenceManifestEntry)) throw new Error(`${item.evidenceManifestEntry}: already registered`);
  evidenceManifest.files.push(item.evidenceManifestEntry);
}
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
protocol = replaceOnce(
  protocol,
  'Oslo-tabellen inneholder nå 185 verifiserte eller kildekontrollerte canonical steder. Batch 44 korrigerer og koordinatfester Kornmagasinet på Akershus festning som dokumentert 1788-bygg. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo-tabellen inneholder nå 188 verifiserte eller kildekontrollerte canonical steder. Batch 45 legger til Kunstnernes Hus, Vigelandmuseet og Møllergata skole med entydige offisielle Geonorge-adressepunkter og parent-modeller som hindrer duplikatmarkører for Vigelandsparken og Oslo Skolemuseum. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 39.',
  'Oslo summary'
);
protocol = replaceOnce(
  protocol,
  '| 44 | `oslo_kornmagasin` | Kornmagasinet på Akershus festning | verified_geometry | `osm-way:669390505` |',
  '| 44 | `oslo_kornmagasin` | Kornmagasinet på Akershus festning | verified_geometry | `osm-way:669390505` |\n| 45 | `kunstnernes_hus` | Kunstnernes Hus | verified | `geonorge-adresser-v1:0301:18496:17` |\n| 45 | `vigelandmuseet` | Vigelandmuseet | verified | `geonorge-adresser-v1:0301:15080:32` |\n| 45 | `mollergata_skole` | Møllergata skole | verified | `geonorge-adresser-v1:0301:14943:49` |',
  'Batch 45 rows'
);
protocol = replaceOnce(
  protocol,
  'Batch 44 (2026-07-20) løser `oslo_kornmagasin` som et identitetsproblem før koordinatproblemet. Den tidligere aktive «Christiania kornmagasin»-recorden fra 1785 manglet eksternt verifisert identitet, noe også eksisterende quiz-QC dokumenterte. Recorden er korrigert til Kornmagasinet, inventar 0008 på Akershus festning, offisielt datert 1788. Eksakt navngitt OSM-way 669390505 brukes som bygningsgeometri, kryssjekket mot fredningsforskriften. Fysisk overlap mot det separate Bakeriet er kontrollert mot dets eget OSM-bygningsobjekt 669390521. Den eksisterende quizfilen er samtidig korrigert slik at den ikke lenger lærer bort den udokumenterte 1785-identiteten eller bruker place-filen som faktakilde.',
  'Batch 44 (2026-07-20) løser `oslo_kornmagasin` som et identitetsproblem før koordinatproblemet. Den tidligere aktive «Christiania kornmagasin»-recorden fra 1785 manglet eksternt verifisert identitet, noe også eksisterende quiz-QC dokumenterte. Recorden er korrigert til Kornmagasinet, inventar 0008 på Akershus festning, offisielt datert 1788. Eksakt navngitt OSM-way 669390505 brukes som bygningsgeometri, kryssjekket mot fredningsforskriften. Fysisk overlap mot det separate Bakeriet er kontrollert mot dets eget OSM-bygningsobjekt 669390521. Den eksisterende quizfilen er samtidig korrigert slik at den ikke lenger lærer bort den udokumenterte 1785-identiteten eller bruker place-filen som faktakilde.\n\nBatch 45 (2026-07-20) legger til tre fysisk avklarte institusjonssteder fra den lukkede museumsauditen. `kunstnernes_hus` bruker Wergelandsveien 17 som eget kunstinstitusjonsbygg. `vigelandmuseet` bruker Nobels gate 32 som atelier-, bolig- og museumsbygning og holdes separat fra det større parkankeret `vigelandsparken`. `mollergata_skole` bruker Møllergata 49 som canonical skolekompleks, mens Oslo Skolemuseum modelleres som institusjonslag i bygg D i stedet for en separat overlappende markør.',
  'Batch 45 note'
);
protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 185 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 188 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'needs_review count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

fs.unlinkSync(abs('scripts/coordinate-branch-job.mjs'));
console.log('Rebuilt validated Oslo museum places as coordinate batch 45 from current main.');
