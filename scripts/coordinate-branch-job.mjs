import fs from 'node:fs';

const placeId = 'frigo_friluftssenteret';
const placeManifestPath = 'data/places/manifest.json';
const evidenceManifestPath = 'data/coordinate-evidence/manifest.json';
const protocolPath = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-attractions-completeness-20260720/frigo';
const selfPath = 'scripts/coordinate-branch-job.mjs';
const placeEntry = 'places/sport/europa/norway/oslo_sport/frigo_friluftssenteret.json';
const evidenceEntry = 'oslo/sport/frigo_friluftssenteret.json';

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function assert(condition, message) { if (!condition) throw new Error(message); }

const placeManifest = readJson(placeManifestPath);
assert(Array.isArray(placeManifest.files), 'place manifest files[] missing');
assert(!placeManifest.files.includes(placeEntry), `${placeEntry} already registered`);
placeManifest.files.push(placeEntry);
writeJson(placeManifestPath, placeManifest);

const evidenceManifest = readJson(evidenceManifestPath);
assert(Array.isArray(evidenceManifest.files), 'evidence manifest files[] missing');
assert(!evidenceManifest.files.includes(evidenceEntry), `${evidenceEntry} already registered`);
evidenceManifest.files.push(evidenceEntry);
evidenceManifest.files.sort((a, b) => a.localeCompare(b, 'en'));
writeJson(evidenceManifestPath, evidenceManifest);

let protocol = fs.readFileSync(protocolPath, 'utf8');
assert(!protocol.includes('`frigo_friluftssenteret`'), 'FRIGO already present in coordinate protocol');
const summaryMatch = protocol.match(/Oslo-tabellen inneholder nå (\d+) verifiserte eller kildekontrollerte canonical steder\.[^\n]*Antallet fullførte kontroller uten godkjent Oslo-koordinat er (\d+)\./);
assert(summaryMatch, 'Could not parse Oslo protocol summary');
const oldCount = Number(summaryMatch[1]);
const needsReviewCount = Number(summaryMatch[2]);
const newCount = oldCount + 1;

const lines = protocol.split('\n');
const headerIndex = lines.findIndex((line) => line.trim() === '| batch | placeId | navn | godkjent status | kildeobjekt |');
const needsReviewIndex = lines.findIndex((line, index) => index > headerIndex && line.trim() === '### Dokumenterte Oslo-kontroller uten godkjent koordinat');
assert(headerIndex >= 0 && needsReviewIndex > headerIndex, 'Could not bound Oslo protocol section');

const rowRegex = /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*(.*?)\s*\|\s*([^|]+?)\s*\|\s*`([^`]+)`\s*\|$/;
const rows = [];
const seenPlaceIds = new Set();
for (let i = headerIndex + 2; i < needsReviewIndex; i += 1) {
  const match = lines[i].match(rowRegex);
  if (!match) continue;
  const row = {
    batch: Number(match[1]),
    placeId: match[2],
    name: match[3],
    status: match[4].trim(),
    source: match[5],
    originalIndex: i
  };
  if (seenPlaceIds.has(row.placeId)) throw new Error(`Duplicate Oslo protocol place row: ${row.placeId}`);
  seenPlaceIds.add(row.placeId);
  rows.push(row);
}
assert(rows.length > 0, 'No Oslo batch rows found');
const maxBatch = Math.max(...rows.map((row) => row.batch));
const batch = maxBatch + 1;
rows.push({
  batch,
  placeId,
  name: 'FRIGO – Friluftssenteret i Gamle Oslo',
  status: 'verified',
  source: 'geonorge-adresser-v1:0301:11589:20',
  originalIndex: Number.MAX_SAFE_INTEGER
});
rows.sort((a, b) => a.batch - b.batch || a.originalIndex - b.originalIndex || a.placeId.localeCompare(b.placeId, 'nb'));

// Remove all scattered Oslo batch rows from the bounded Oslo section, then rebuild one canonical table.
const nonRowSection = [];
for (let i = headerIndex + 2; i < needsReviewIndex; i += 1) {
  if (!rowRegex.test(lines[i])) nonRowSection.push(lines[i]);
}
while (nonRowSection.length > 0 && nonRowSection[0] === '') nonRowSection.shift();
const rebuiltRows = rows.map((row) => `| ${row.batch} | \`${row.placeId}\` | ${row.name} | ${row.status} | \`${row.source}\` |`);
const rebuiltSection = [
  ...lines.slice(0, headerIndex + 2),
  ...rebuiltRows,
  '',
  ...nonRowSection,
  ...lines.slice(needsReviewIndex)
];
protocol = rebuiltSection.join('\n');

const newSummary = `Oslo-tabellen inneholder nå ${newCount} verifiserte eller kildekontrollerte canonical steder. Batch ${batch} legger til FRIGO – Friluftssenteret i Gamle Oslo med offisiell Geonorge-adressekoordinat for dagens besøksadresse Ensjøveien 20. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${needsReviewCount}.`;
protocol = protocol.replace(summaryMatch[0], newSummary);
fs.writeFileSync(protocolPath, protocol);

writeJson(`${reportDir}/production-decision.json`, {
  candidateId: placeId,
  decision: 'produced_as_canonical_place',
  taxonomy: {
    primaryCategory: 'sport',
    emneIds: ['em_sport_breddeidrett', 'em_sport_inkludering_idrett']
  },
  coordinate: {
    status: 'verified',
    sourceObjectId: 'geonorge-adresser-v1:0301:11589:20',
    lat: 59.913567553035776,
    lon: 10.78965526234183,
    coordType: 'address_point'
  },
  coordinateBatch: batch,
  osloVerifiedOrControlledBefore: oldCount,
  osloVerifiedOrControlledAfter: newCount,
  protocolRowsNormalized: true
});

const readmePath = `${reportDir}/README.md`;
let readme = fs.readFileSync(readmePath, 'utf8').replace(/\n## Production[\s\S]*$/m, '').trimEnd();
readme += `\n\n## Production\n\n- Canonical place: \`${placeId}\`\n- Category: \`sport\`\n- Coordinate source: \`geonorge-adresser-v1:0301:11589:20\`\n- Coordinate status: \`verified\`\n- Coordinate batch: ${batch}\n- Oslo verified/source-controlled total after production: ${newCount}\n- Oslo protocol batch rows normalized into the canonical Oslo table.\n`;
fs.writeFileSync(readmePath, readme);

if (fs.existsSync(selfPath)) fs.unlinkSync(selfPath);
console.log(JSON.stringify({ placeId, oldCount, newCount, maxBatch, batch, osloRows: rows.length, protocolRowsNormalized: true }, null, 2));
