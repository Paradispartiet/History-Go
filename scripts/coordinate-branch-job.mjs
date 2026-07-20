import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-attractions-production-batch-51-current';
const PLACE_FILE = 'data/places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/vitenskap/oslo_reptilpark.json';
const PLACES_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_MANIFEST_ENTRY = 'places/vitenskap/oslo/places_vitenskap/oslo_reptilpark.json';
const EVIDENCE_MANIFEST_ENTRY = 'oslo/vitenskap/oslo_reptilpark.json';

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}

for (const file of [PLACE_FILE, EVIDENCE_FILE]) {
  if (fs.existsSync(full(file))) throw new Error(`Refusing to overwrite existing canonical target: ${file}`);
}

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
for (const file of [PLACE_FILE, EVIDENCE_FILE]) {
  const content = execFileSync('git', ['show', `FETCH_HEAD:${file}`], { encoding: 'utf8' });
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), content.endsWith('\n') ? content : `${content}\n`);
}

const placesManifest = readJson(PLACES_MANIFEST);
if (!Array.isArray(placesManifest.files)) throw new Error('data/places/manifest.json missing files array');
if (!placesManifest.files.includes(PLACE_MANIFEST_ENTRY)) placesManifest.files.push(PLACE_MANIFEST_ENTRY);
writeJson(PLACES_MANIFEST, placesManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files)) throw new Error('coordinate evidence manifest missing files array');
if (!evidenceManifest.files.includes(EVIDENCE_MANIFEST_ENTRY)) {
  const insertAt = evidenceManifest.files.findIndex((entry) => entry.localeCompare(EVIDENCE_MANIFEST_ENTRY) > 0);
  if (insertAt === -1) evidenceManifest.files.push(EVIDENCE_MANIFEST_ENTRY);
  else evidenceManifest.files.splice(insertAt, 0, EVIDENCE_MANIFEST_ENTRY);
}
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
if (protocol.includes('| 51 | `oslo_reptilpark` |')) throw new Error('Oslo Reptilpark already exists in coordinate protocol');

const tableEndMarker = '\n\nRelevante korrigerende merger';
const tableEnd = protocol.indexOf(tableEndMarker);
if (tableEnd < 0) throw new Error('Could not locate end of Oslo coordinate table');
const row = '| 51 | `oslo_reptilpark` | Oslo Reptilpark | verified | `geonorge-adresser-v1:0301:16935:2` |';
protocol = `${protocol.slice(0, tableEnd)}\n${row}${protocol.slice(tableEnd)}`;

const batchNote = 'Batch 51 (2026-07-20) starter den avgrensede completeness-passeringen for VisitOSLO-attraksjoner utenfor museumskategorien. `oslo_reptilpark` bruker det entydige Geonorge-adressepunktet `geonorge-adresser-v1:0301:16935:2` for St. Olavs gate 2 som dagens bygnings- og displayanker. Oslo Reptilparks egen historikk dokumenterer at institusjonen åpnet i Storgata 10. januar 2002 og flyttet til større lokaler i St. Olavs gate 2 i september 2007. Dagens koordinat representerer derfor nåværende besøkssted, ikke den opprinnelige 2002-lokasjonen.';
if (!protocol.includes(batchNote)) {
  const migrationStart = protocol.indexOf('\nDuplikatmigrering');
  if (migrationStart < 0) throw new Error('Could not locate duplicate migration notes');
  protocol = `${protocol.slice(0, migrationStart)}\n\n${batchNote}${protocol.slice(migrationStart)}`;
}

const osloStart = protocol.indexOf('## Oslo');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('\n## Etne', unresolvedStart);
if (osloStart < 0 || unresolvedStart < 0) throw new Error('Could not locate Oslo protocol sections');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection
  .split('\n')
  .filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat'))
  .length;

protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Batch 51 legger til Oslo Reptilpark med det entydige Geonorge-punktet for dagens besøksadresse i St. Olavs gate 2, samtidig som åpningen i Storgata i 2002 bevares som et separat historisk lokaliseringslag. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);
protocol = protocol.replace(
  /^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m,
  `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);
fs.writeFileSync(full(PROTOCOL), protocol);

console.log(JSON.stringify({ ok: true, placeId: 'oslo_reptilpark', sourceBranch: SOURCE_BRANCH, verifiedCount, unresolvedCount }, null, 2));
