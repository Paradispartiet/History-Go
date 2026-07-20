import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-attractions-brannmuseet-production-batch-56-current';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const INTAKE_DECISION = 'reports/oslo-attractions-completeness-20260720/brannmuseet-oslo/decision.json';
const PLACE_FILE = 'data/places/historie/oslo/places_historie/brannmuseet_oslo.json';
const PLACE_MANIFEST_ENTRY = 'places/historie/oslo/places_historie/brannmuseet_oslo.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/historie/brannmuseet_oslo.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/historie/brannmuseet_oslo.json';

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  if (Array.isArray(data?.items)) return data.items;
  if (typeof data?.id === 'string') return [data];
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
    for (const row of rowsFrom(readJson(rel))) if (row?.id === placeId) hits.push(rel);
  }
  if (hits.length) throw new Error(`${placeId}: active place already exists in ${hits.join(', ')}`);
}
function copyValidatedFile(sourcePath, targetPath) {
  const content = execFileSync('git', ['show', `FETCH_HEAD:${sourcePath}`], { encoding: 'utf8' });
  fs.mkdirSync(path.dirname(abs(targetPath)), { recursive: true });
  fs.writeFileSync(abs(targetPath), content);
}

assertNoActivePlaceId('brannmuseet_oslo');
if (fs.existsSync(abs(PLACE_FILE)) || fs.existsSync(abs(EVIDENCE_FILE))) {
  throw new Error('Brannmuseet source/evidence already exists on current main');
}

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
copyValidatedFile(PLACE_FILE, PLACE_FILE);
copyValidatedFile(EVIDENCE_FILE, EVIDENCE_FILE);

const place = readJson(PLACE_FILE);
const evidence = readJson(EVIDENCE_FILE);
if (place.id !== 'brannmuseet_oslo') throw new Error('Unexpected validated Brannmuseet place payload');
if (place.sourceObjectId !== 'geonorge-adresser-v1:0301:12450:32') throw new Error('Unexpected Brannmuseet coordinate source');
if (evidence.placeId !== place.id || evidence.coordinateDecision !== 'do_not_change_coordinates_yet') {
  throw new Error('Unexpected validated Brannmuseet evidence payload');
}

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_MANIFEST_ENTRY)) throw new Error('Brannmuseet place manifest entry already exists');
placeManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) throw new Error('Brannmuseet evidence manifest entry already exists');
evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const decision = readJson(INTAKE_DECISION);
decision.productionGate = 'canonical_produced';
decision.canonicalCategory = 'historie';
decision.canonicalPlaceFile = PLACE_FILE;
writeJson(INTAKE_DECISION, decision);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
protocol = replaceOnce(
  protocol,
  'Oslo-tabellen inneholder nå 205 verifiserte eller kildekontrollerte canonical steder. Oslo West-kirkepakken legger til Fagerborg kirke, Uranienborg kirke og Frogner kirke med normative bygningsadressepunkter. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 31.',
  'Oslo-tabellen inneholder nå 206 verifiserte eller kildekontrollerte canonical steder. Batch 56 legger til Brannmuseet i Oslo i den tidligere Grønland brannstasjon på det verifiserte Grønlandsleiret 32-punktet. Antallet fullførte kontroller uten godkjent Oslo-koordinat er 31.',
  'Oslo protocol summary'
);

const row54 = '| 54 | `dronning_sonja_kunststall` | Dronning Sonja KunstStall | verified | `geonorge-adresser-v1:0301:15614:50` |';
const row55 = '| 55 | `holmlia_bad` | Holmlia bad | verified | `geonorge-adresser-v1:0301:13084:34` |';
const row56 = '| 56 | `brannmuseet_oslo` | Brannmuseet i Oslo | verified | `geonorge-adresser-v1:0301:12450:32` |';
const row57 = '| 57 | `fagerborg_kirke` | Fagerborg kirke | verified | `geonorge-adresser-v1:0301:15670:74` |';
const row58 = '| 58 | `uranienborg_kirke` | Uranienborg kirke | verified | `geonorge-adresser-v1:0301:13110:15` |';
const row59 = '| 59 | `frogner_kirke` | Frogner kirke | verified | `geonorge-adresser-v1:0301:10967:36` |';
if (protocol.includes(row56)) throw new Error('Batch 56 row already exists');

const lines = protocol.split('\n');
const existingRows = [row54, row55, row57, row58, row59];
const positions = existingRows.map((row) => {
  const hits = lines.map((line, index) => line === row ? index : -1).filter((index) => index >= 0);
  if (hits.length !== 1) throw new Error(`Expected exactly one protocol row: ${row}; found ${hits.length}`);
  return hits[0];
});
const start = Math.min(...positions);
const end = Math.max(...positions);
const unexpected = lines.slice(start, end + 1).filter((line) => line.trim() && !existingRows.includes(line));
if (unexpected.length) throw new Error(`Unexpected content between batch rows 54-59: ${unexpected.join(' | ')}`);
lines.splice(start, end - start + 1, row54, row55, row56, row57, row58, row59);
protocol = lines.join('\n');

const batch55 = 'Batch 55 (2026-07-20) legger til `holmlia_bad` som et eget kommunalt svømme- og idrettsanlegg. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:13084:34` for Holmlia Senter vei 34 brukes som dagens bygnings-, display- og unlock-anker. Holmlia bad stod klart i 1983 som del av et fjellanlegg der idrettshall, svømmehall og tilfluktsrom ble kombinert. Den bredere underjordiske infrastrukturen er fysisk og historisk kontekst, ikke en ekstra overlappende markør. Midlertidige sommerstenginger gjelder drift og endrer ikke canonical stedsstatus.';
const batch56 = 'Batch 56 (2026-07-20) legger til `brannmuseet_oslo` som ett samlet historisk bygg- og museumssted. Det entydige Geonorge-adressepunktet `geonorge-adresser-v1:0301:12450:32` for Grønlandsleiret 32 brukes som bygnings-, display- og unlock-anker. Bygningen er den tidligere Grønland brannstasjon fra 1861 og var i ordinær brannstasjonsbruk fram til 1978; dagens Brannmuseet bevarer denne historien i samme fysiske bygg. Den brede canonical gaten `gronlandsleiret` beholdes separat og brukes ikke som proxy for museet.';
if (protocol.includes(batch56)) throw new Error('Batch 56 narrative already exists');
protocol = replaceOnce(protocol, batch55, `${batch55}\n\n${batch56}`, 'Batch 56 narrative');

protocol = replaceOnce(
  protocol,
  'Disse kontrollene er fullført, men teller ikke blant de 205 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Disse kontrollene er fullført, men teller ikke blant de 206 verifiserte eller kildekontrollerte canonical Oslo-stedene.',
  'Oslo unresolved count reference'
);
fs.writeFileSync(abs(PROTOCOL), protocol);

console.log('Copied fully validated Brannmuseet payload onto latest main as batch 56 and normalized protocol rows 54-59.');
