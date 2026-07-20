import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-attractions-brannmuseet-batch-56-final';
const ID = 'brannmuseet_oslo';
const SOURCE_OBJECT = 'geonorge-adresser-v1:0301:12450:32';
const PLACE = 'data/places/historie/oslo/places_historie/brannmuseet_oslo.json';
const PLACE_ENTRY = 'places/historie/oslo/places_historie/brannmuseet_oslo.json';
const EVIDENCE = 'data/coordinate-evidence/oslo/historie/brannmuseet_oslo.json';
const EVIDENCE_ENTRY = 'oslo/historie/brannmuseet_oslo.json';
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
for (const rel of [PLACE, EVIDENCE]) {
  const content = execFileSync('git', ['show', `FETCH_HEAD:${rel}`], { encoding: 'utf8' });
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), content);
}

const place = readJson(PLACE);
if (place.id !== ID || place.sourceObjectId !== SOURCE_OBJECT) {
  throw new Error('Copied Brannmuseet payload does not match the validated canonical identity/source');
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
let lines = protocol.split('\n');
const correctionHeading = 'Relevante korrigerende merger for de første Oslo-batchene: `a39747039` (siste visuelle Oslo-kontroll) og `91c7a74e4` (Tronsmo runtime/kilde-korrigering).';
const summaryIndex = lines.findIndex((line) => line.startsWith('Oslo-tabellen inneholder nå '));
const headerIndex = lines.findIndex((line) => line === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const tableEndIndex = lines.findIndex((line, index) => index > headerIndex && line === correctionHeading);
if (summaryIndex < 0 || headerIndex < 0 || tableEndIndex < 0) throw new Error('Could not resolve the Oslo protocol structure');

const summaryMatch = lines[summaryIndex].match(/^Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\./);
const unresolvedMatch = lines[summaryIndex].match(/Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!summaryMatch || !unresolvedMatch) throw new Error('Could not parse current Oslo protocol counts');
const oldCount = Number(summaryMatch[1]);
const newCount = oldCount + 1;
const unresolvedCount = Number(unresolvedMatch[1]);

const batchRows = [];
for (let i = headerIndex + 2; i < tableEndIndex; i += 1) {
  const match = lines[i].match(/^\| (\d+) \| `([^`]+)` \|/);
  if (match) batchRows.push({ index: i, batchNo: Number(match[1]), placeId: match[2] });
}
if (!batchRows.length) throw new Error('Could not parse Oslo coordinate batch rows');
if (batchRows.some((row) => row.placeId === ID)) throw new Error(`${ID}: already recorded in Oslo coordinate table`);
const batchNo = Math.max(...batchRows.map((row) => row.batchNo)) + 1;
const lastRowIndex = Math.max(...batchRows.map((row) => row.index));
const brannmuseetRow = `| ${batchNo} | \`${ID}\` | Brannmuseet i Oslo | verified | \`${SOURCE_OBJECT}\` |`;
lines.splice(lastRowIndex + 1, tableEndIndex - lastRowIndex - 1, brannmuseetRow, '');

lines[summaryIndex] = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batchNo} legger til Brannmuseet i Oslo som et eget historisk bygg- og museumssted i den tidligere Grønland brannstasjon, med det verifiserte adressepunktet Grønlandsleiret 32. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`;
protocol = lines.join('\n');

const narrative = `Batch ${batchNo} (2026-07-20) legger til \`${ID}\` som ett fysisk historisk sted for den tidligere Grønland brannstasjon og dagens Brannmuseet i Oslo. Det entydige Geonorge-punktet \`${SOURCE_OBJECT}\` for Grønlandsleiret 32 brukes som bygnings-, display- og unlock-anker. Den brede canonical gate-recorden \`gronlandsleiret\` er ikke et duplikat og skal ikke brukes som proxy for museumsbygningen. Stasjonen dateres til 1861, var i ordinær brannstasjonsbruk fram til 1978 og formidler i dag Oslos brann- og beredskapshistorie gjennom bevart materiell, kjøretøy og museumssamlinger.`;
if (!protocol.includes(narrative)) {
  const protocolLines = protocol.split('\n');
  const duplicateIndex = protocolLines.findIndex((line) => line.startsWith('Duplikatmigrering ('));
  const needsReviewIndex = protocolLines.findIndex((line) => line.startsWith('## Oslo') && line.includes('needs_review'));
  const insertionIndex = duplicateIndex >= 0 ? duplicateIndex : needsReviewIndex;
  if (insertionIndex < 0) throw new Error('Could not find narrative insertion boundary');
  protocolLines.splice(insertionIndex, 0, narrative, '');
  protocol = protocolLines.join('\n');
}

protocol = protocol.replace(
  /Disse kontrollene er fullført, men teller ikke blant de (\d+) verifiserte eller kildekontrollerte canonical Oslo-stedene\./,
  `Disse kontrollene er fullført, men teller ikke blant de ${newCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);

const finalLines = protocol.split('\n');
const finalHeader = finalLines.findIndex((line) => line === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const finalEnd = finalLines.findIndex((line, index) => index > finalHeader && line === correctionHeading);
const finalRow = finalLines.findIndex((line, index) => index > finalHeader && index < finalEnd && line === brannmuseetRow);
if (finalRow < 0) throw new Error('Brannmuseet row was not inserted into the Oslo coordinate table');
if (!finalLines.includes(correctionHeading)) throw new Error('Oslo protocol correction heading was corrupted');

fs.writeFileSync(abs(PROTOCOL), protocol);
console.log(JSON.stringify({
  ok: true,
  placeId: ID,
  batchNo,
  sourceObjectId: SOURCE_OBJECT,
  coordinate: { lat: place.lat, lon: place.lon },
  controlledPlaces: newCount,
  unresolvedCount
}, null, 2));
