import fs from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const original = execFileSync(
  'git',
  ['show', '071a170b3ae2cc74f6a455cd255aab75124c906e:scripts/coordinate-branch-job.mjs'],
  { encoding: 'utf8' }
);
const oldBlock = `const splitIndex = readJson(SPLIT_INDEX);\nconst indexPos = splitIndex.findIndex((row) => row?.id === PLACE_ID);\nif (indexPos < 0) throw new Error('Havnelageret missing from split index');\nsplitIndex[indexPos] = JSON.parse(JSON.stringify(childAfter));\nwriteJson(SPLIT_INDEX, splitIndex);`;
const newBlock = `const splitIndex = readJson(SPLIT_INDEX);\nconst indexPos = splitIndex.findIndex((row) => row?.id === PLACE_ID);\nif (indexPos < 0) throw new Error('Havnelageret missing from split index');\nconst indexRow = splitIndex[indexPos];\nconst coordinateIndexFields = [\n  'lat', 'lon', 'r', 'coordType', 'coordStatus', 'locatorType', 'sourceProvider',\n  'sourceObjectId', 'address', 'geocodeAccuracy', 'coordRole', 'coordSource',\n  'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote'\n];\nfor (const field of coordinateIndexFields) {\n  if (Object.prototype.hasOwnProperty.call(childAfter, field)) indexRow[field] = JSON.parse(JSON.stringify(childAfter[field]));\n  else delete indexRow[field];\n}\nwriteJson(SPLIT_INDEX, splitIndex);`;
if (!original.includes(oldBlock)) throw new Error('Validated Havnelageret job no longer contains expected index block');

const tempPath = '/tmp/history-go-havnelageret-batch-102-diagnostic.mjs';
fs.writeFileSync(tempPath, original.replace(oldBlock, newBlock));
await import(`${pathToFileURL(tempPath).href}?v=${Date.now()}`);

let diagnostic = '';
try {
  const output = execFileSync('npm', ['run', 'places:index:build'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  diagnostic = `UNEXPECTED_SUCCESS\n${output}`;
} catch (error) {
  diagnostic = [
    'EXPECTED_FAILURE_CAPTURED',
    `status=${error?.status ?? ''}`,
    '--- stdout ---',
    String(error?.stdout ?? ''),
    '--- stderr ---',
    String(error?.stderr ?? ''),
    '--- message ---',
    String(error?.message ?? error)
  ].join('\n');
}

fs.mkdirSync('reports/oslo-coordinate-control-batch-102', { recursive: true });
fs.writeFileSync('reports/oslo-coordinate-control-batch-102/runtime-build-diagnostic.txt', `${diagnostic}\n`);

// Restore every durable file touched by the attempted repair so this diagnostic run cannot publish partial data.
execSync([
  'git checkout origin/main --',
  'data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json',
  'data/places/naeringsliv/oslo/places_naeringsliv_index.json',
  'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json',
  'docs/coordinates/coordinate-control-protocol.md',
  'data/places/places_index.json'
].join(' '), { stdio: 'inherit' });
for (const p of [
  'reports/oslo-coordinate-control-batch-102/address/havnelageret.json',
  'reports/oslo-coordinate-control-batch-102/summary.json',
  'reports/oslo-coordinate-control-batch-102/README.md'
]) {
  if (fs.existsSync(p)) fs.rmSync(p, { force: true });
}

// Prove that latest main itself can rebuild before allowing the runner to publish the diagnostic.
execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });
console.log('Captured Havnelageret post-repair runtime build diagnostic and restored latest-main data state.');
