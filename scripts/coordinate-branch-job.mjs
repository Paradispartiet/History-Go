import fs from 'node:fs';

const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const decisionPath = 'reports/oslo-attractions-completeness-20260720/akrobaten/decision.json';
const readmePath = 'reports/oslo-attractions-completeness-20260720/akrobaten/README.md';
const selfPath = 'scripts/coordinate-branch-job.mjs';
const placeId = 'akrobaten_gangbro';

let protocol = fs.readFileSync(protocolPath, 'utf8');
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
if (!summaryMatch) throw new Error('Could not parse Oslo protocol summary');
const osloCount = Number(summaryMatch[1]);
const needsReview = Number(summaryMatch[2]);
if (osloCount !== 219) throw new Error(`Expected Akrobaten branch Oslo count 219, got ${osloCount}`);

const batchRows = [...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|/gm)]
  .map((match) => ({ batch: Number(match[1]), placeId: match[2] }));
const existingAkrobatenRows = batchRows.filter((row) => row.placeId === placeId);
if (existingAkrobatenRows.length !== 1) throw new Error(`Expected exactly one Akrobaten protocol row, got ${existingAkrobatenRows.length}`);
const maxOtherBatch = Math.max(...batchRows.filter((row) => row.placeId !== placeId).map((row) => row.batch));
const correctBatch = maxOtherBatch + 1;

const newSummary = `Oslo-tabellen inneholder nå ${osloCount} verifiserte eller kildekontrollerte canonical steder. Batch ${correctBatch} legger til Akrobaten gangbro med geometrisenteret for den navngitte OSM-way 468892289, kryssjekket mot L2 Arkitekter, VisitOSLO og Oslo byleksikon. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReview}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
protocol = protocol.replace(/^\|\s*\d+\s*\|\s*`akrobaten_gangbro`\s*\|\s*Akrobaten gangbro\s*\|\s*verified_geometry\s*\|\s*`osm-way:468892289`\s*\|$/m, `| ${correctBatch} | \`akrobaten_gangbro\` | Akrobaten gangbro | verified_geometry | \`osm-way:468892289\` |`);
fs.writeFileSync(protocolPath, protocol);

const decision = JSON.parse(fs.readFileSync(decisionPath, 'utf8'));
decision.coordinateBatch = correctBatch;
fs.writeFileSync(decisionPath, `${JSON.stringify(decision, null, 2)}\n`);

let readme = fs.readFileSync(readmePath, 'utf8');
readme = readme.replace(/- Coordinate batch: \d+\./, `- Coordinate batch: ${correctBatch}.`);
fs.writeFileSync(readmePath, readme);

if (fs.existsSync(selfPath)) fs.unlinkSync(selfPath);
console.log(JSON.stringify({ placeId, maxOtherBatch, correctBatch, osloCount, needsReview }, null, 2));
