import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const PLACE_ID = 'havnelageret';
const ADDRESS = 'Langkaia 1 Oslo';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-98';
const DATE = '2026-07-21';
const IDENTITY_SOURCES = [
  'https://oslobyleksikon.no/side/Oslo_Havnelager',
  'https://www.oppdagkvadraturen.no/stoppesteder/langkaia-1-oslo-havnelager'
];

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex'); }
function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const aggregate = readJson(AGGREGATE);
const aggregatePlace = aggregate.find((row) => row?.id === PLACE_ID);
const childPlace = readJson(CHILD);
if (!aggregatePlace || childPlace?.id !== PLACE_ID) throw new Error('Havnelageret missing from aggregate/child');
if (aggregatePlace.lat !== childPlace.lat || aggregatePlace.lon !== childPlace.lon || aggregatePlace.coordStatus !== childPlace.coordStatus) {
  throw new Error('Havnelageret aggregate and child are not synchronized before batch 98');
}
if (childPlace.coordStatus !== 'needs_source' || childPlace.coordSource !== 'legacy_manual_map_check') {
  throw new Error(`Expected Havnelageret needs_source legacy state, got ${childPlace.coordStatus}/${childPlace.coordSource}`);
}
const previous = {
  lat: childPlace.lat,
  lon: childPlace.lon,
  coordStatus: childPlace.coordStatus,
  coordType: childPlace.coordType,
  coordSource: childPlace.coordSource
};

console.log('[Batch 98] Building coordinate tools');
execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
console.log(`[Batch 98] Geonorge address-first lookup: ${ADDRESS}`);
const raw = execFileSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', ADDRESS], { encoding: 'utf8' });
const result = JSON.parse(raw);
writeJson(`${REPORT_DIR}/address/${PLACE_ID}.json`, result);
if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
  throw new Error(`Expected one verified Geonorge candidate for ${ADDRESS}, got ${result.status || 'unknown'}`);
}
const coordinate = result.coordinate;
const address = coordinate.address || {};
if (coordinate.sourceProvider !== 'official_address' || address.street !== 'Langkaia' || String(address.number) !== '1' || address.city !== 'Oslo') {
  throw new Error(`Geonorge result does not exactly match Langkaia 1, Oslo: ${JSON.stringify(address)}`);
}
const moveMeters = haversineMeters(previous, coordinate);
if (moveMeters > 500) throw new Error(`Langkaia 1 result is ${moveMeters.toFixed(1)} m from legacy Havnelageret point; identity review required`);

function apply(place) {
  place.lat = coordinate.lat;
  place.lon = coordinate.lon;
  place.r = coordinate.r;
  place.locatorType = 'building';
  place.sourceProvider = coordinate.sourceProvider;
  place.sourceObjectId = coordinate.sourceObjectId;
  place.address = coordinate.address;
  place.geocodeAccuracy = coordinate.geocodeAccuracy;
  place.coordRole = coordinate.coordRole;
  place.coordStatus = coordinate.coordStatus;
  place.coordSource = coordinate.coordSource;
  place.coordSourceId = coordinate.sourceObjectId;
  place.coordSourceUrl = result.sourceUrl;
  place.coordType = coordinate.coordType;
  place.coordVerifiedAt = DATE;
  place.coordNote = `Offisiell adressekoordinat fra Geonorge for Langkaia 1. Oslo byleksikon identifiserer Langkaia 1 som Oslo Havnelager, og Oppdag Kvadraturen bruker samme adresse for bygningen. Det tidligere legacy_manual_map_check-punktet er erstattet; flytting ${moveMeters.toFixed(1)} meter.`;
  place.externalLinks = Array.isArray(place.externalLinks) ? place.externalLinks : [];
  for (const url of IDENTITY_SOURCES) {
    if (!place.externalLinks.some((link) => link?.url === url)) {
      place.externalLinks.push({
        type: 'source',
        label: url.includes('oslobyleksikon') ? 'Oslo byleksikon – Oslo Havnelager' : 'Oppdag Kvadraturen – Oslo Havnelager',
        url,
        lang: 'nb',
        verifiedAt: DATE
      });
    }
  }
}
apply(aggregatePlace);
apply(childPlace);
writeJson(AGGREGATE, aggregate);
writeJson(CHILD, childPlace);

const splitIndex = readJson(SPLIT_INDEX);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error('Havnelageret missing from split index');
indexRow.lat = childPlace.lat;
indexRow.lon = childPlace.lon;
indexRow.r = childPlace.r;
indexRow.coordStatus = childPlace.coordStatus;
indexRow.coordType = childPlace.coordType;
writeJson(SPLIT_INDEX, splitIndex);

const manifest = readJson(SPLIT_MANIFEST);
const manifestRow = manifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error('Havnelageret missing from split manifest');
manifestRow.sha256 = sha256(CHILD);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, manifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
let lines = protocol.split('\n');
const verifiedHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const headerIndex = lines.indexOf(verifiedHeader);
if (headerIndex < 0) throw new Error('Oslo verified protocol table missing');
let tableEnd = headerIndex + 2;
while (tableEnd < lines.length && lines[tableEnd].startsWith('| ')) tableEnd += 1;
if (lines.slice(headerIndex + 2, tableEnd).some((line) => /^\| 98 \|/.test(line))) throw new Error('Batch 98 is already in use');
if (lines.slice(headerIndex + 2, tableEnd).some((line) => line.includes('`havnelageret`'))) throw new Error('Havnelageret already exists in verified protocol table');
lines.splice(tableEnd, 0, `| 98 | \`havnelageret\` | Oslo Havnelager | verified | \`${coordinate.sourceObjectId}\` |`);
const unresolvedRemoved = lines.filter((line) => line.startsWith('| `havnelageret`')).length;
lines = lines.filter((line) => !line.startsWith('| `havnelageret`'));
protocol = lines.join('\n').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);
const protocolLines = protocol.split('\n');
const h = protocolLines.indexOf(verifiedHeader);
let e = h + 2;
while (e < protocolLines.length && protocolLines[e].startsWith('| ')) e += 1;
const verifiedCount = e - (h + 2);
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 98 flytter \`havnelageret\` fra \`needs_source\`/\`legacy_manual_map_check\` til det entydige Geonorge-adressepunktet for Langkaia 1, etter at Oslo byleksikon identifiserer samme adresse som Oslo Havnelager. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`
);
const note = `Batch 98 (${DATE}) løser \`havnelageret\` etter objekt-type-først og adresse-first-metoden. Stedet er selve Oslo Havnelager-bygningen; Oslo byleksikon identifiserer den som Langkaia 1. Geonorge må gi ett entydig \`verified_candidate\` for nøyaktig Langkaia 1 i Oslo. Det gamle manuelle byggankeret flyttes ${moveMeters.toFixed(1)} meter til det offisielle adressepunktet og mister statusen \`needs_source\`.`;
const anchor = '\nRelevante korrigerende merger';
const noteIndex = protocol.indexOf(anchor);
if (noteIndex < 0) throw new Error('Protocol notes anchor missing');
protocol = `${protocol.slice(0, noteIndex)}\n\n${note}${protocol.slice(noteIndex)}`;
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 98,
  placeId: PLACE_ID,
  method: 'object-type-first + Geonorge address-first + independent identity cross-check',
  identitySources: IDENTITY_SOURCES,
  addressQuery: ADDRESS,
  previous,
  current: {
    lat: childPlace.lat,
    lon: childPlace.lon,
    coordStatus: childPlace.coordStatus,
    coordType: childPlace.coordType,
    coordSource: childPlace.coordSource,
    coordSourceId: childPlace.coordSourceId,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId,
    address: childPlace.address,
    geocodeAccuracy: childPlace.geocodeAccuracy,
    coordRole: childPlace.coordRole
  },
  moveMeters: Number(moveMeters.toFixed(1)),
  unresolvedProtocolRowsRemoved: unresolvedRemoved,
  protocolVerifiedCountAfterBatch: verifiedCount
});
fs.writeFileSync(full(`${REPORT_DIR}/README.md`), `# Oslo coordinate control batch 98\n\n- Place: Oslo Havnelager.\n- Object type: addressable building.\n- Identity: Langkaia 1, supported by Oslo byleksikon and Oppdag Kvadraturen.\n- Coordinate method: unique Geonorge address-first result for Langkaia 1.\n- Legacy state removed: needs_source / legacy_manual_map_check.\n- Coordinate correction distance: ${moveMeters.toFixed(1)} m.\n`);

console.log(JSON.stringify({ ok: true, batch: 98, placeId: PLACE_ID, sourceObjectId: childPlace.sourceObjectId, lat: childPlace.lat, lon: childPlace.lon, moveMeters: Number(moveMeters.toFixed(1)), unresolvedRemoved, verifiedCount }, null, 2));
