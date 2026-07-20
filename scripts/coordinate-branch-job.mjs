import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const PLACE_ID = 'universitetets_gamle_kjemi';
const ADDRESS = 'Frederiks gate 3 Oslo';
const EXPECTED_STREET = 'Frederiks gate';
const EXPECTED_NUMBER = '3';
const AGGREGATE = 'data/places/vitenskap/oslo/places_vitenskap.json';
const CHILD = 'data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_kjemi.json';
const SPLIT_INDEX = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const SPLIT_MANIFEST = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-96';
const DATE = '2026-07-21';
const IDENTITY_SOURCES = [
  'https://oslobyleksikon.no/side/Frederiks_gate',
  'https://www.regjeringen.no/no/dokumenter/stmeld-nr-22-1999-2000-/id192730/?ch=9'
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
if (!aggregatePlace || childPlace?.id !== PLACE_ID) throw new Error('Universitetets gamle kjemibygning missing from aggregate/child');
if (aggregatePlace.lat !== childPlace.lat || aggregatePlace.lon !== childPlace.lon || aggregatePlace.coordStatus !== childPlace.coordStatus) {
  throw new Error('Aggregate and split child are not synchronized before batch 96');
}
if (childPlace.coordStatus !== 'verified' || childPlace.coordSource !== 'manual_map_check') {
  throw new Error(`Expected legacy manual_map_check verified state, got ${childPlace.coordStatus}/${childPlace.coordSource}`);
}
const previous = {
  lat: childPlace.lat,
  lon: childPlace.lon,
  coordStatus: childPlace.coordStatus,
  coordType: childPlace.coordType,
  coordSource: childPlace.coordSource,
  coordPrecisionM: childPlace.coordPrecisionM ?? null
};

console.log('[Batch 96] Building coordinate tools');
execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
console.log(`[Batch 96] Geonorge address-first lookup: ${ADDRESS}`);
const raw = execFileSync(
  'node',
  ['dist/tools/address-first-coordinate-finder.mjs', '--address', ADDRESS],
  { encoding: 'utf8' }
);
const result = JSON.parse(raw);
writeJson(`${REPORT_DIR}/address/${PLACE_ID}.json`, result);
if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
  throw new Error(`Expected one verified Geonorge candidate, got ${result.status || 'unknown'}`);
}
if (result.sourceProvider !== 'official_address' || result.coordinate.sourceProvider !== 'official_address') {
  throw new Error('Address lookup did not return official_address source provider');
}
const address = result.coordinate.address || {};
if (address.street !== EXPECTED_STREET || String(address.number) !== EXPECTED_NUMBER || address.city !== 'Oslo') {
  throw new Error(`Geonorge result does not match ${ADDRESS}: ${JSON.stringify(address)}`);
}
const coordinate = result.coordinate;
const moveMeters = haversineMeters(previous, coordinate);
if (moveMeters < 100) {
  throw new Error(`Legacy manual_map_check point is only ${moveMeters.toFixed(1)} m from Frederiks gate 3; expected a substantial correction and requires manual review`);
}
if (moveMeters > 1000) {
  throw new Error(`Geonorge point is ${moveMeters.toFixed(1)} m from legacy point; identity mismatch risk`);
}

function applyCoordinate(place) {
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
  place.coordNote = `Offisiell adressekoordinat fra Geonorge for Frederiks gate 3. Oslo byleksikon identifiserer nr. 3 som Universitetets gamle kjemibygning, og regjeringens museumsmelding omtaler samme bygning som Frederiks gate 3. Det tidligere manual_map_check-punktet lå ${moveMeters.toFixed(0)} meter unna og er erstattet.`;
  delete place.coordPrecisionM;
  place.externalLinks = Array.isArray(place.externalLinks) ? place.externalLinks : [];
  for (const url of IDENTITY_SOURCES) {
    if (!place.externalLinks.some((link) => link?.url === url)) {
      place.externalLinks.push({
        type: 'source',
        label: url.includes('oslobyleksikon') ? 'Oslo byleksikon – Frederiks gate' : 'Regjeringen – museumsmelding',
        url,
        lang: 'nb',
        verifiedAt: DATE
      });
    }
  }
}
applyCoordinate(aggregatePlace);
applyCoordinate(childPlace);
writeJson(AGGREGATE, aggregate);
writeJson(CHILD, childPlace);

const splitIndex = readJson(SPLIT_INDEX);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error('Universitetets gamle kjemibygning missing from split index');
indexRow.lat = childPlace.lat;
indexRow.lon = childPlace.lon;
indexRow.r = childPlace.r;
indexRow.coordStatus = childPlace.coordStatus;
indexRow.coordType = childPlace.coordType;
writeJson(SPLIT_INDEX, splitIndex);

const manifest = readJson(SPLIT_MANIFEST);
const manifestRow = manifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error('Universitetets gamle kjemibygning missing from split manifest');
manifestRow.sha256 = sha256(CHILD);
manifest.source_sha256 = sha256(AGGREGATE);
manifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, manifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const tableHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const lines = protocol.split('\n');
const headerIndex = lines.indexOf(tableHeader);
if (headerIndex < 0) throw new Error('Oslo verified protocol table missing');
let tableEnd = headerIndex + 2;
while (tableEnd < lines.length && lines[tableEnd].startsWith('| ')) tableEnd += 1;
if (lines.slice(headerIndex + 2, tableEnd).some((line) => /^\| 96 \|/.test(line))) throw new Error('Batch 96 is already in use');
if (lines.slice(headerIndex + 2, tableEnd).some((line) => line.includes(`\`${PLACE_ID}\``))) throw new Error(`${PLACE_ID} already exists in verified protocol table`);
lines.splice(tableEnd, 0, `| 96 | \`${PLACE_ID}\` | Universitetets gamle kjemibygning | verified | \`${coordinate.sourceObjectId}\` |`);
protocol = lines.join('\n').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);
const protocolLines = protocol.split('\n');
const h = protocolLines.indexOf(tableHeader);
let e = h + 2;
while (e < protocolLines.length && protocolLines[e].startsWith('| ')) e += 1;
const verifiedCount = e - (h + 2);
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 96 retter \`universitetets_gamle_kjemi\` fra et udokumentert \`manual_map_check\`-punkt til det entydige Geonorge-adressepunktet for Frederiks gate 3, etter at Oslo byleksikon og regjeringens museumsmelding identifiserer samme adresse som Universitetets gamle kjemibygning. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`
);
const note = `Batch 96 (${DATE}) retter \`universitetets_gamle_kjemi\` etter objekt-type-først og adresse-first-metoden. Stedet er en konkret historisk universitetsbygning, og både Oslo byleksikon og regjeringens museumsmelding identifiserer bygningen som Frederiks gate 3. Geonorge-oppslaget må gi ett entydig \`verified_candidate\` for nøyaktig Frederiks gate 3 i Oslo før koordinaten brukes. Det tidligere \`manual_map_check\`-punktet lå ${moveMeters.toFixed(0)} meter unna og var derfor både kildekontraktsmessig og geografisk feil.`;
const anchor = '\nRelevante korrigerende merger';
const noteIndex = protocol.indexOf(anchor);
if (noteIndex < 0) throw new Error('Protocol notes anchor missing');
protocol = `${protocol.slice(0, noteIndex)}\n\n${note}${protocol.slice(noteIndex)}`;
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 96,
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
    coordSourceUrl: childPlace.coordSourceUrl,
    sourceProvider: childPlace.sourceProvider,
    sourceObjectId: childPlace.sourceObjectId,
    address: childPlace.address,
    geocodeAccuracy: childPlace.geocodeAccuracy,
    coordRole: childPlace.coordRole
  },
  moveMeters: Number(moveMeters.toFixed(1)),
  protocolVerifiedCountAfterBatch: verifiedCount
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Oslo coordinate control batch 96\n\n` +
  `- Place: Universitetets gamle kjemibygning.\n` +
  `- Object type: addressable historical building.\n` +
  `- Identity: Frederiks gate 3, independently supported by Oslo byleksikon and a Norwegian government museum report.\n` +
  `- Coordinate method: unique Geonorge address-first result for Frederiks gate 3.\n` +
  `- Legacy source removed: manual_map_check.\n` +
  `- Coordinate correction distance: ${moveMeters.toFixed(1)} m.\n`
);

console.log(JSON.stringify({
  ok: true,
  batch: 96,
  placeId: PLACE_ID,
  sourceObjectId: childPlace.sourceObjectId,
  lat: childPlace.lat,
  lon: childPlace.lon,
  moveMeters: Number(moveMeters.toFixed(1)),
  verifiedCount
}, null, 2));
