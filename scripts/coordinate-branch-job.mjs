import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_BRANCH = 'agent/oslo-coordinate-popkultur-address-first-correction';
const AGGREGATE = 'data/places/popkultur/oslo/places_oslo_populaerkultur.json';
const CHILD_DIR = 'data/places/popkultur/oslo/places_oslo_populaerkultur';
const INDEX = 'data/places/popkultur/oslo/places_oslo_populaerkultur_index.json';
const MANIFEST = 'data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-119-popkultur';
const IDS = ['cinemateket_oslo','colosseum_kino','house_of_nerds','latter','grand_hotel','chat_noir','edderkoppen_scene'];
const EXPECTED = {
  cinemateket_oslo: { status: 'verified', provider: 'official_address', source: 'geonorge-adresser-v1:0301:11309:16' },
  colosseum_kino: { status: 'verified_geometry', provider: 'osm', source: 'osm-way:115958003' },
  house_of_nerds: { status: 'verified', provider: 'official_address', source: 'geonorge-adresser-v1:0301:21649:18' },
  latter: { status: 'verified', provider: 'official_address', source: 'geonorge-adresser-v1:0301:20305:1' },
  grand_hotel: { status: 'verified', provider: 'official_address', source: 'geonorge-adresser-v1:0301:13630:31' },
  chat_noir: { status: 'verified', provider: 'official_address', source: 'geonorge-adresser-v1:0301:13780:5' },
  edderkoppen_scene: { status: 'verified', provider: 'official_address', source: 'geonorge-adresser-v1:0301:16937:1' }
};
const COORD_FIELDS = ['lat','lon','r','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordType','coordStatus','coordSource','coordVerifiedAt','coordNote'];

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(full(file)), { recursive: true }); fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex'); }
function sourceText(file) { return execFileSync('git', ['show', `FETCH_HEAD:${file}`], { cwd: ROOT, encoding: 'utf8' }); }
function sourceJson(file) { return JSON.parse(sourceText(file)); }
function findRow(rows, id) { const row = rows.find((item) => item?.id === id); if (!row) throw new Error(`Missing ${id}`); return row; }

execFileSync('git', ['fetch', 'origin', SOURCE_BRANCH], { cwd: ROOT, stdio: 'inherit' });

const aggregate = readJson(AGGREGATE);
const index = readJson(INDEX);
const manifest = readJson(MANIFEST);

for (const id of IDS) {
  const childPath = `${CHILD_DIR}/${id}.json`;
  const evidencePath = `data/coordinate-evidence/oslo/popkultur/${id}.json`;
  const validated = sourceJson(childPath);
  const expected = EXPECTED[id];
  if (validated.coordStatus !== expected.status) throw new Error(`${id} status mismatch: ${validated.coordStatus}`);
  if (validated.sourceProvider !== expected.provider) throw new Error(`${id} provider mismatch: ${validated.sourceProvider}`);
  if ((validated.sourceObjectId || validated.coordSourceId) !== expected.source) throw new Error(`${id} source mismatch: ${validated.sourceObjectId || validated.coordSourceId}`);

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
for (const row of manifest.places || []) if (IDS.includes(row.id)) row.sha256 = sha256(`data/places/popkultur/oslo/${row.file}`);
writeJson(MANIFEST, manifest);

const validatedLines = sourceText(PROTOCOL).split('\n');
let protocolLines = fs.readFileSync(full(PROTOCOL), 'utf8').split('\n');
for (const id of IDS) {
  const prefix = `| 119 | \`${id}\` |`;
  const sourceLine = validatedLines.find((line) => line.startsWith(prefix));
  const targetIndex = protocolLines.findIndex((line) => line.startsWith(prefix));
  if (!sourceLine || targetIndex < 0) throw new Error(`Missing batch 119 protocol row ${id}`);
  protocolLines[targetIndex] = sourceLine;
}
const sourceNote = validatedLines.find((line) => line.startsWith('Batch 119 (2026-07-21)'));
const targetNoteIndex = protocolLines.findIndex((line) => line.startsWith('Batch 119 (2026-07-21)'));
if (!sourceNote || targetNoteIndex < 0) throw new Error('Missing batch 119 protocol note');
protocolLines[targetNoteIndex] = sourceNote;
fs.writeFileSync(full(PROTOCOL), protocolLines.join('\n'));

const reportFiles = ['README.md','results.json',...IDS.flatMap((id) => [`geonorge-${id}.json`,`geonorge-${id}-attempts.json`])];
for (const name of reportFiles) {
  const file = `${REPORT_DIR}/${name}`;
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), sourceText(file));
}

console.log(JSON.stringify({ ok: true, replayedBatch: 119, validated: EXPECTED }, null, 2));
