import { execFileSync } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const BASE_COMMIT = '7a74e74a0e14b6c030eed96c7ad393cc12c3df9d';
const BASE_PATH = 'scripts/coordinate-branch-job.mjs';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let source = execFileSync('git', ['show', `${BASE_COMMIT}:${BASE_PATH}`], { encoding: 'utf8' });
assert(source.includes("const BATCH = 195;"), 'Pinned Frognerstranda batch-195 source is missing.');
assert(source.includes("assert(JSON.stringify(place) === JSON.stringify(splitChild), 'Aggregate and split child differ before batch 195.');"), 'Pinned split parity gate changed unexpectedly.');
assert(source.includes("assert(centralAudit.queue?.some((entry) => entry.placeId === PLACE_ID), 'Frognerstranda is no longer in the post-194 central queue.');"), 'Pinned central audit field gate changed unexpectedly.');
assert(source.includes('const parsed = parseOfficialGeoJson(official.html);'), 'Official GeoJSON source gate is missing.');

const semanticHelpers = `
function canonicalJsonValue(value) {
  if (Array.isArray(value)) return value.map(canonicalJsonValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJsonValue(value[key])]));
  }
  return value;
}

function sameJsonContent(a, b) {
  return JSON.stringify(canonicalJsonValue(a)) === JSON.stringify(canonicalJsonValue(b));
}
`;

source = source.replace(
  "function sha256(value) {\n  return createHash('sha256').update(value).digest('hex');\n}\n",
  "function sha256(value) {\n  return createHash('sha256').update(value).digest('hex');\n}\n" + semanticHelpers,
);
source = source.replace(
  "assert(JSON.stringify(place) === JSON.stringify(splitChild), 'Aggregate and split child differ before batch 195.');",
  "assert(sameJsonContent(place, splitChild), 'Aggregate and split child differ semantically before batch 195.');",
);
source = source.replace(
  "assert(centralAudit.queue?.some((entry) => entry.placeId === PLACE_ID), 'Frognerstranda is no longer in the post-194 central queue.');",
  "assert(centralAudit.centralRows?.some((entry) => entry.placeId === PLACE_ID && entry.coordStatus === 'needs_source' && entry.coordinateDecision === 'needs_geometry'), 'Frognerstranda unresolved row is missing from post-194 centralRows.');",
);

assert(source.includes('function sameJsonContent(a, b)'), 'Semantic JSON helper patch failed.');
assert(!source.includes("assert(JSON.stringify(place) === JSON.stringify(splitChild)"), 'Order-sensitive split gate remains.');
assert(source.includes("centralAudit.centralRows?.some"), 'Central audit row patch failed.');
assert(source.includes("assertLine(parsed.line.geometry.coordinates, EXPECTED_LINE);"), 'Official line drift gate was removed unexpectedly.');

const tempDir = await mkdtemp(join(tmpdir(), 'history-go-frognerstranda-batch-195-fresh-main-'));
const generatedPath = join(tempDir, 'coordinate-branch-job.generated.mjs');
await writeFile(generatedPath, source, 'utf8');
await import(pathToFileURL(generatedPath).href);
