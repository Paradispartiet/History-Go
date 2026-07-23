import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-23';
const LEGACY_ID = 'bryn_industriomrade';
const REPORT_DIR = 'reports/oslo-coordinate-bryn-industrial-model-audit-post-191';
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const distanceMeters = (a, b, c, d) => {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(c - a), dLon = rad(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
};

const protocol = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m) => Number(m[1])));
if (maxBatch !== 191) throw new Error(`Expected coordinate max batch 191, got ${maxBatch}`);

const runtimeRoot = readJson('data/places/places_index.json');
const runtimePlaces = [];
const visit = (value) => {
  if (Array.isArray(value)) return value.forEach(visit);
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
    runtimePlaces.push(value);
    return;
  }
  Object.values(value).forEach(visit);
};
visit(runtimeRoot);

const legacyMatches = runtimePlaces.filter((place) => place.id === LEGACY_ID);
if (legacyMatches.length !== 1) throw new Error(`Expected one runtime ${LEGACY_ID}, got ${legacyMatches.length}`);
const legacy = legacyMatches[0];

const brynCandidates = runtimePlaces
  .filter((place) => place.id !== LEGACY_ID && /bryn/i.test(`${place.id} ${place.name}`))
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category || null,
    lat: place.lat,
    lon: place.lon,
    r: place.r || null,
    coordStatus: place.coordStatus || null,
    coordType: place.coordType || null,
    locatorType: place.locatorType || null,
    sourceObjectId: place.sourceObjectId || null,
    sourceFile: place.sourceFile || place.file || null,
    distanceFromLegacyMeters: Number(distanceMeters(legacy.lat, legacy.lon, place.lat, place.lon).toFixed(2)),
    desc: place.desc || null
  }))
  .sort((a, b) => a.distanceFromLegacyMeters - b.distanceFromLegacyMeters);

const nearby = runtimePlaces
  .filter((place) => place.id !== LEGACY_ID)
  .map((place) => ({ id: place.id, name: place.name, category: place.category || null, distanceMeters: Number(distanceMeters(legacy.lat, legacy.lon, place.lat, place.lon).toFixed(2)), coordStatus: place.coordStatus || null }))
  .filter((place) => place.distanceMeters <= 2000)
  .sort((a, b) => a.distanceMeters - b.distanceMeters)
  .slice(0, 50);

const grep = spawnSync('git', ['grep', '-n', '-F', `"${LEGACY_ID}"`, '--', 'data'], { encoding: 'utf8' });
if (![0, 1].includes(grep.status)) throw new Error(`git grep failed: ${grep.stderr}`);
const refs = String(grep.stdout || '').trim().split('\n').filter(Boolean).map((line) => {
  const first = line.indexOf(':');
  const second = line.indexOf(':', first + 1);
  return { file: line.slice(0, first), line: Number(line.slice(first + 1, second)), text: line.slice(second + 1).trim() };
});
const refFiles = [...new Set(refs.map((ref) => ref.file))].sort();

const tracked = spawnSync('git', ['ls-files', 'data/places'], { encoding: 'utf8' });
if (tracked.status !== 0) throw new Error(`git ls-files failed: ${tracked.stderr}`);
const sourceOccurrences = [];
for (const file of String(tracked.stdout || '').split('\n').filter((file) => file.endsWith('.json'))) {
  let parsed;
  try { parsed = readJson(file); } catch { continue; }
  const scan = (value, path = []) => {
    if (Array.isArray(value)) return value.forEach((item, index) => scan(item, [...path, index]));
    if (!value || typeof value !== 'object') return;
    if (value.id === LEGACY_ID) sourceOccurrences.push({ file, path, snapshot: value });
    Object.entries(value).forEach(([key, child]) => scan(child, [...path, key]));
  };
  scan(parsed);
}

const evidence = readJson('data/coordinate-evidence/oslo/naeringsliv/bryn_industriomrade.json');
if (evidence.placeId !== LEGACY_ID || evidence.coordinateDecision !== 'needs_geometry') throw new Error('Unexpected Bryn evidence state');

const areaCandidates = brynCandidates.filter((place) => ['route', 'linear_area', 'natural_area', 'park'].includes(place.locatorType) || /område|strøk|bryn$/i.test(place.name));
const verifiedBroadCandidate = areaCandidates.find((place) => String(place.coordStatus || '').startsWith('verified')) || null;
const exactPhysicalDuplicateCandidate = brynCandidates.find((place) => place.sourceObjectId && place.sourceObjectId === evidence.sourceObjectCandidates?.[0]?.sourceObjectId) || null;

const conclusion = verifiedBroadCandidate
  ? `A verified broad Bryn canonical candidate already exists (${verifiedBroadCandidate.id}); audit semantic overlap before creating any separate industrial-area geometry.`
  : `No verified broad Bryn canonical area was found. Keep bryn_industriomrade unresolved until one source-backed area scope or a deliberately selected concrete industrial anchor is documented; do not validate the current generic point.`;

const summary = {
  version: DATE,
  purpose: 'Determine whether Bryn industriområde is already covered by a canonical Bryn area/place or still requires separately documented geometry.',
  legacy,
  evidence,
  brynCandidates,
  areaCandidates,
  verifiedBroadCandidate,
  exactPhysicalDuplicateCandidate,
  nearbyCanonicalWithin2km: nearby,
  referenceInventory: { count: refs.length, fileCount: refFiles.length, files: refFiles, refs },
  sourceOccurrences,
  conclusion
};
writeJson(`${REPORT_DIR}/summary.json`, summary);
writeFileSync(`${REPORT_DIR}/sources.md`, `# Bryn industrial model audit\n\nDate: ${DATE}\n\n${conclusion}\n\n- Bryn-named canonical candidates: ${brynCandidates.length}\n- Area-like Bryn candidates: ${areaCandidates.length}\n- Exact legacy-ID reference lines: ${refs.length} across ${refFiles.length} files\n- Nearby canonical places within 2 km: ${nearby.length}\n\nNo coordinate or canonical place data is changed by this audit.\n`, 'utf8');

console.log(JSON.stringify({
  legacyId: LEGACY_ID,
  brynCandidateCount: brynCandidates.length,
  areaCandidateCount: areaCandidates.length,
  verifiedBroadCandidate,
  referenceLineCount: refs.length,
  referenceFileCount: refFiles.length,
  closestBrynCandidates: brynCandidates.slice(0, 10),
  conclusion
}, null, 2));
