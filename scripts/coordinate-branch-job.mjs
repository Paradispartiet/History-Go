import fs from 'node:fs';

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const decisionPath = 'reports/oslo-attractions-completeness-20260720/frigo/production-decision.json';
const readmePath = 'reports/oslo-attractions-completeness-20260720/frigo/README.md';
const selfPath = 'scripts/coordinate-branch-job.mjs';

let protocol = fs.readFileSync(protocolPath, 'utf8');
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!summaryMatch) throw new Error('Could not parse Oslo protocol summary');
const total = Number(summaryMatch[1]);
const needsReview = Number(summaryMatch[2]);
if (total !== 222) throw new Error(`Expected FRIGO branch total 222, got ${total}`);

let lines = protocol.split('\n');
// Remove any misplaced/current rows for the two newest places before reinserting them canonically.
lines = lines.filter((line) => !/^\|\s*\d+\s*\|\s*`(?:sorenga_sjobad|frigo_friluftssenteret)`\s*\|/.test(line));

const headerIndex = lines.findIndex((line) => line.trim() === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const needsReviewIndex = lines.findIndex((line, index) => index > headerIndex && line.trim() === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
if (headerIndex < 0 || needsReviewIndex < 0) throw new Error('Could not bound Oslo protocol table');

const rowRegex = /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/;
const osloRows = [];
for (let i = headerIndex + 2; i < needsReviewIndex; i += 1) {
  const match = lines[i].match(rowRegex);
  if (match) osloRows.push({ index: i, batch: Number(match[1]), placeId: match[2] });
}
const maxExistingBatch = Math.max(...osloRows.map((row) => row.batch));
if (maxExistingBatch !== 72) throw new Error(`Expected max existing canonical Oslo batch 72 after removing Sørenga/FRIGO, got ${maxExistingBatch}`);

// Insert directly after the last row in the canonical Oslo table.
let lastRowIndex = Math.max(...osloRows.map((row) => row.index));
lines.splice(lastRowIndex + 1, 0,
  '| 73 | `sorenga_sjobad` | Sørenga sjøbad | verified_geometry | `osm-node:5295458069` |',
  '| 74 | `frigo_friluftssenteret` | FRIGO – Friluftssenteret i Gamle Oslo | verified | `geonorge-adresser-v1:0301:11589:20` |'
);
protocol = lines.join('\n');

const newSummary = `Oslo-tabellen inneholder nå 222 verifiserte eller kildekontrollerte canonical steder. Batch 74 legger til FRIGO – Friluftssenteret i Gamle Oslo med offisiell Geonorge-adressekoordinat for dagens besøksadresse Ensjøveien 20. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReview}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
fs.writeFileSync(protocolPath, protocol);

const decision = JSON.parse(fs.readFileSync(decisionPath, 'utf8'));
decision.coordinateBatch = 74;
decision.osloVerifiedOrControlledBefore = 221;
decision.osloVerifiedOrControlledAfter = 222;
decision.protocolRowsNormalized = true;
decision.protocolBatchCorrection = 'Sørenga restored as batch 73; FRIGO assigned batch 74.';
fs.writeFileSync(decisionPath, `${JSON.stringify(decision, null, 2)}\n`);

let readme = fs.readFileSync(readmePath, 'utf8');
readme = readme.replace(/- Coordinate batch: \d+/, '- Coordinate batch: 74');
readme = readme.replace(/- Oslo verified\/source-controlled total after production: \d+/, '- Oslo verified/source-controlled total after production: 222');
fs.writeFileSync(readmePath, readme);

if (fs.existsSync(selfPath)) fs.unlinkSync(selfPath);
console.log(JSON.stringify({ total, needsReview, maxExistingBatch, sorengaBatch: 73, frigoBatch: 74 }, null, 2));
