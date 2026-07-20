import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-attractions-production-skimore-oslo-v2';
const ID = 'skimore_oslo';
const BATCH_NO = 56;
const PLACE = 'data/places/sport/europa/norway/oslo_sport/skimore_oslo.json';
const PLACE_ENTRY = 'places/sport/europa/norway/oslo_sport/skimore_oslo.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/sport/skimore_oslo.json';
const EVIDENCE_ENTRY = 'oslo/sport/skimore_oslo.json';
const DECISION = 'reports/oslo-attractions-completeness-20260720/skimore-oslo/decision.json';
const PLACE_MANIFEST = 'data/places/manifest.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const rowsFrom = (data) => Array.isArray(data)
  ? data
  : Array.isArray(data?.places)
    ? data.places
    : Array.isArray(data?.items)
      ? data.items
      : data?.id
        ? [data]
        : [];

for (const entry of readJson(PLACE_MANIFEST).files || []) {
  const rel = `data/${entry}`;
  if (!fs.existsSync(abs(rel))) continue;
  if (rowsFrom(readJson(rel)).some((row) => row?.id === ID)) {
    throw new Error(`${ID}: active place already exists in ${rel}`);
  }
}
if (fs.existsSync(abs(PLACE)) || fs.existsSync(abs(EVIDENCE))) {
  throw new Error(`${ID}: target place/evidence files already exist`);
}

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { stdio: 'inherit' });
for (const rel of [PLACE, EVIDENCE, DECISION]) {
  const content = execFileSync('git', ['show', `FETCH_HEAD:${rel}`], { encoding: 'utf8' });
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), content);
}

const place = readJson(PLACE);
if (place.id !== ID) throw new Error('Unexpected copied Skimore place payload');
if (place.sourceObjectId !== 'geonorge-adresser-v1:0301:17787:64') {
  throw new Error(`Unexpected Skimore source object: ${place.sourceObjectId}`);
}

const placeManifest = readJson(PLACE_MANIFEST);
if (placeManifest.files.includes(PLACE_ENTRY)) throw new Error(`${PLACE_ENTRY}: already registered`);
placeManifest.files.push(PLACE_ENTRY);
writeJson(PLACE_MANIFEST, placeManifest);

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (evidenceManifest.files.includes(EVIDENCE_ENTRY)) throw new Error(`${EVIDENCE_ENTRY}: already registered`);
evidenceManifest.files.push(EVIDENCE_ENTRY);
evidenceManifest.files.sort();
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*/);
if (!summaryMatch) throw new Error('Could not find Oslo controlled-place summary');
const oldCount = Number(summaryMatch[1]);
const newCount = oldCount + 1;
const unresolvedMatch = protocol.match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!unresolvedMatch) throw new Error('Could not parse Oslo unresolved count');
const unresolvedCount = Number(unresolvedMatch[1]);

const lines = protocol.split('\n');
const correctionHeading = 'Relevante korrigerende merger for de første Oslo-batchene: `a39747039` (siste visuelle Oslo-kontroll) og `91c7a74e4` (Tronsmo runtime/kilde-korrigering).';
const headerIndex = lines.findIndex((line) => line === '| batch | placeId | navn | godkjent status | kildeobjekt |');
if (headerIndex < 0) throw new Error('Could not find Oslo coordinate table header');
const tableEndIndex = lines.findIndex((line, index) => index > headerIndex && line === correctionHeading);
if (tableEndIndex < 0) throw new Error('Could not find the end of the Oslo coordinate table');
const osloTableLines = lines.slice(headerIndex + 2, tableEndIndex);
if (osloTableLines.some((line) => line.startsWith(`| ${BATCH_NO} |`))) {
  throw new Error(`Batch ${BATCH_NO} is already present in the Oslo coordinate table`);
}
const row55Index = lines.findIndex((line, index) => index > headerIndex && index < tableEndIndex && line.startsWith('| 55 | `holmlia_bad` |'));
if (row55Index < 0) throw new Error('Could not find Holmlia batch 55 row');
let nextBatchRowIndex = -1;
for (let i = row55Index + 1; i < tableEndIndex; i += 1) {
  const match = lines[i].match(/^\| (\d+) \|/);
  if (!match) continue;
  if (Number(match[1]) > BATCH_NO) {
    nextBatchRowIndex = i;
    break;
  }
}
if (nextBatchRowIndex < 0) throw new Error('Could not find a post-56 Oslo batch row');
const skimoreRow = `| ${BATCH_NO} | \`${ID}\` | Skimore Oslo | verified | \`${place.sourceObjectId}\` |`;
lines.splice(row55Index + 1, nextBatchRowIndex - row55Index - 1, skimoreRow);
protocol = lines.join('\n');

protocol = protocol.replace(
  summaryMatch[0],
  `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch 56 legger til Skimore Oslo som ett helårs aktivitetsanlegg på Tryvann, med det verifiserte publikumsankeret i Tryvannsveien 64. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);

const narrative = 'Batch 56 (2026-07-20) legger til `skimore_oslo` som én canonical helårsrepresentasjon av Skimore-anlegget på Tryvann. Det entydige Geonorge-punktet `geonorge-adresser-v1:0301:17787:64` for Tryvannsveien 64 brukes som publikums-, display- og unlock-anker. Skimore dokumenterer både vinterens alpin-/snowboardanlegg og sommerens klatrepark ved samme anlegg; klatreparken ble bygget i 2012. VisitOSLOs separate sommer- og vinteroppføringer skal derfor ikke bli overlappende place-markører. Adressepunktet representerer hovedankeret og skal ikke leses som full geometri for alle bakker, heiser og klatreparkløyper.';
if (!protocol.includes(narrative)) {
  const protocolLines = protocol.split('\n');
  const duplicateIndex = protocolLines.findIndex((line) => line.startsWith('Duplikatmigrering ('));
  const needsReviewIndex = protocolLines.findIndex((line) => line.startsWith('## Oslo') && line.includes('needs_review'));
  const insertionIndex = duplicateIndex >= 0 ? duplicateIndex : needsReviewIndex;
  if (insertionIndex < 0) throw new Error('Could not find a stable narrative insertion boundary');
  protocolLines.splice(insertionIndex, 0, narrative, '');
  protocol = protocolLines.join('\n');
}

protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);

const finalLines = protocol.split('\n');
const finalHeaderIndex = finalLines.findIndex((line) => line === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const finalTableEndIndex = finalLines.findIndex((line, index) => index > finalHeaderIndex && line === correctionHeading);
const row56Index = finalLines.findIndex((line, index) => index > finalHeaderIndex && index < finalTableEndIndex && line === skimoreRow);
const row57Index = finalLines.findIndex((line, index) => index > finalHeaderIndex && index < finalTableEndIndex && line.startsWith('| 57 |'));
if (row56Index < 0 || row57Index < 0 || row56Index >= row57Index) {
  throw new Error('Batch 56 was not placed before batch 57 inside the Oslo coordinate table');
}
if (!finalLines.some((line) => line === correctionHeading)) {
  throw new Error('The Oslo protocol correction heading was corrupted during batch insertion');
}

fs.writeFileSync(abs(PROTOCOL), protocol);
console.log(JSON.stringify({
  ok: true,
  placeId: ID,
  batchNo: BATCH_NO,
  sourceObjectId: place.sourceObjectId,
  coordinate: { lat: place.lat, lon: place.lon },
  controlledPlaces: newCount,
  unresolvedCount
}, null, 2));
