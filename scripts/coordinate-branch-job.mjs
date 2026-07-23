import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PLACE_ID = 'ulven_handelspark';
const REPORT_DIR = 'reports/oslo-coordinate-construction-city-civication-sync-post-189';
const PLACE_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const MAP_FILE = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const protocol = readFileSync(PROTOCOL, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m) => Number(m[1])));
if (maxBatch !== 189) throw new Error(`Expected coordinate max batch 189, got ${maxBatch}`);

const places = readJson(PLACE_FILE);
const matches = places.filter((place) => place?.id === PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected one canonical ${PLACE_ID}, got ${matches.length}`);
const place = matches[0];
if (place.name !== 'Construction City' || place.coordStatus !== 'verified' || place.sourceObjectId !== 'geonorge-adresser-v1:0301:21534:1') {
  throw new Error('Construction City canonical state does not match merged batch 189');
}
if (Math.abs(place.lat - 59.924017628728656) > 1e-10 || Math.abs(place.lon - 10.81017987877654) > 1e-10) {
  throw new Error('Construction City coordinate changed after batch 189');
}

const mapping = readJson(MAP_FILE);
const matched = [];
const visit = (value, path = []) => {
  if (Array.isArray(value)) return value.forEach((item, index) => visit(item, [...path, index]));
  if (!value || typeof value !== 'object') return;
  if (value.historyGoPlaceId === PLACE_ID) matched.push({ value, path });
  for (const [key, child] of Object.entries(value)) visit(child, [...path, key]);
};
visit(mapping);
if (matched.length !== 1) throw new Error(`Expected one Civication mapping for ${PLACE_ID}, got ${matched.length}`);
const entry = matched[0].value;
const before = { name: entry.name ?? null, lat: entry.lat ?? null, lon: entry.lon ?? null, needsVerification: entry.needsVerification ?? null };
entry.name = place.name;
entry.lat = place.lat;
entry.lon = place.lon;
entry.needsVerification = false;
writeJson(MAP_FILE, mapping);

writeJson(`${REPORT_DIR}/result.json`, {
  version: '2026-07-23',
  placeId: PLACE_ID,
  canonical: { name: place.name, lat: place.lat, lon: place.lon, sourceObjectId: place.sourceObjectId },
  mappingPath: matched[0].path,
  before,
  after: { name: entry.name, lat: entry.lat, lon: entry.lon, needsVerification: entry.needsVerification },
  decision: 'Civication map copy synchronized to the already merged canonical Construction City state; no coordinate batch or canonical place data changed.'
});

console.log(JSON.stringify({ placeId: PLACE_ID, mappingPath: matched[0].path, before, after: { name: entry.name, lat: entry.lat, lon: entry.lon, needsVerification: entry.needsVerification } }, null, 2));
