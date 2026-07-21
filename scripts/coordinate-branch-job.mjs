import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-politikk-address-first-correction';
const AGGREGATE = 'data/places/politikk/oslo/places_politikk.json';
const CHILD_DIR = 'data/places/politikk/oslo/places_politikk';
const INDEX = 'data/places/politikk/oslo/places_politikk_index.json';
const MANIFEST = 'data/places/politikk/oslo/places_politikk_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-118-politikk';
const IDS = [
  'stortinget',
  'oslo_radhus',
  'hoyesteretts_hus',
  'politihuset_gronland',
  'folkets_hus_oslo'
];
const EXPECTED = {
  stortinget: 'geonorge-adresser-v1:0301:13630:22',
  oslo_radhus: 'geonorge-adresser-v1:0301:16120:1',
  hoyesteretts_hus: 'geonorge-adresser-v1:0301:21338:1',
  politihuset_gronland: 'geonorge-adresser-v1:0301:12450:44',
  folkets_hus_oslo: 'geonorge-adresser-v1:0301:18550:11'
};
const COORD_FIELDS = [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId',
  'address', 'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus',
  'coordSource', 'coordVerifiedAt', 'coordNote'
];

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex');
}
function sourceText(file) {
  return execFileSync('git', ['show', `FETCH_HEAD:${file}`], { cwd: ROOT, encoding: 'utf8' });
}
function sourceJson(file) { return JSON.parse(sourceText(file)); }
function findRow(rows, id) {
  const row = rows.find((item) => item?.id === id);
  if (!row) throw new Error(`Missing ${id}`);
  return row;
}

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { cwd: ROOT, stdio: 'inherit' });

const aggregate = readJson(AGGREGATE);
const index = readJson(INDEX);
const manifest = readJson(MANIFEST);

for (const id of IDS) {
  const childPath = `${CHILD_DIR}/${id}.json`;
  const evidencePath = `data/coordinate-evidence/oslo/politikk/${id}.json`;
  const validated = sourceJson(childPath);

  if (validated.coordStatus !== 'verified' || validated.sourceProvider !== 'official_address') {
    throw new Error(`${id} is not a validated official-address record on source branch`);
  }
  if (validated.sourceObjectId !== EXPECTED[id]) {
    throw new Error(`${id} source mismatch: ${validated.sourceObjectId} !== ${EXPECTED[id]}`);
  }

  const aggregateIndex = aggregate.findIndex((item) => item?.id === id);
  if (aggregateIndex < 0) throw new Error(`Missing aggregate row ${id}`);
  aggregate[aggregateIndex] = validated;
  writeJson(childPath, validated);

  const indexRow = findRow(index, id);
  for (const field of COORD_FIELDS) indexRow[field] = validated[field] ?? null;

  fs.writeFileSync(full(evidencePath), sourceText(evidencePath));
}

writeJson(AGGREGATE, aggregate);
writeJson(INDEX, index);

manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
for (const row of manifest.places || []) {
  if (!IDS.includes(row.id)) continue;
  row.sha256 = sha256(`data/places/politikk/oslo/${row.file}`);
}
writeJson(MANIFEST, manifest);

const validatedProtocol = sourceText(PROTOCOL);
const validatedLines = validatedProtocol.split('\n');
let protocolLines = fs.readFileSync(full(PROTOCOL), 'utf8').split('\n');
for (const id of IDS) {
  const prefix = `| 118 | \`${id}\` |`;
  const sourceLine = validatedLines.find((line) => line.startsWith(prefix));
  const targetIndex = protocolLines.findIndex((line) => line.startsWith(prefix));
  if (!sourceLine || targetIndex < 0) throw new Error(`Missing batch 118 protocol row for ${id}`);
  protocolLines[targetIndex] = sourceLine;
}
const sourceNote = validatedLines.find((line) => line.startsWith('Batch 118 (2026-07-21)'));
const targetNoteIndex = protocolLines.findIndex((line) => line.startsWith('Batch 118 (2026-07-21)'));
if (!sourceNote || targetNoteIndex < 0) throw new Error('Missing batch 118 protocol note');
protocolLines[targetNoteIndex] = sourceNote;
fs.writeFileSync(full(PROTOCOL), protocolLines.join('\n'));

const reportFiles = [
  'README.md',
  'results.json',
  ...IDS.flatMap((id) => [`geonorge-${id}.json`, `geonorge-${id}-attempts.json`])
];
for (const name of reportFiles) {
  const file = `${REPORT_DIR}/${name}`;
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), sourceText(file));
}

console.log(JSON.stringify({
  ok: true,
  replayedBatch: 118,
  sourceBranch: SOURCE_BRANCH,
  verifiedOfficialAddressIds: IDS.map((id) => ({ id, sourceObjectId: EXPECTED[id] }))
}, null, 2));
