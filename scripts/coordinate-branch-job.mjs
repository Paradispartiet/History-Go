import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const PLACE_ID = 'havnelageret';
const EXPECTED_SOURCE_OBJECT = 'geonorge-adresser-v1:0301:14150:1';
const ADDRESS = 'Langkaia 1 Oslo';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-102';
const DATE = '2026-07-21';

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
const childBefore = readJson(CHILD);
if (!aggregatePlace || childBefore?.id !== PLACE_ID) throw new Error('Havnelageret aggregate/child missing');
if (aggregatePlace.coordStatus !== 'verified' || aggregatePlace.sourceProvider !== 'official_address' || aggregatePlace.sourceObjectId !== EXPECTED_SOURCE_OBJECT) {
  throw new Error(`Aggregate Havnelageret is not in the expected verified Geonorge state: ${aggregatePlace.coordStatus}/${aggregatePlace.sourceProvider}/${aggregatePlace.sourceObjectId}`);
}
if (aggregatePlace.address?.street !== 'Langkaia' || String(aggregatePlace.address?.number) !== '1' || aggregatePlace.address?.city !== 'Oslo') {
  throw new Error('Aggregate Havnelageret does not carry the expected Langkaia 1 address identity');
}
const divergenceBefore = {
  aggregate: { lat: aggregatePlace.lat, lon: aggregatePlace.lon, coordStatus: aggregatePlace.coordStatus, coordType: aggregatePlace.coordType, sourceObjectId: aggregatePlace.sourceObjectId },
  child: { lat: childBefore.lat, lon: childBefore.lon, coordStatus: childBefore.coordStatus, coordType: childBefore.coordType, sourceObjectId: childBefore.sourceObjectId || '' },
  meters: Number(haversineMeters(aggregatePlace, childBefore).toFixed(1))
};
if (divergenceBefore.meters < 1 && childBefore.coordStatus === aggregatePlace.coordStatus && childBefore.sourceObjectId === aggregatePlace.sourceObjectId) {
  throw new Error('Havnelageret aggregate and child are already synchronized; batch 102 has nothing to repair');
}

console.log('[Batch 102] Building coordinate tools');
execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
console.log(`[Batch 102] Reconfirming Geonorge address-first result: ${ADDRESS}`);
const raw = execFileSync('node', ['dist/tools/address-first-coordinate-finder.mjs', '--address', ADDRESS], { encoding: 'utf8' });
const result = JSON.parse(raw);
writeJson(`${REPORT_DIR}/address/${PLACE_ID}.json`, result);
if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
  throw new Error(`Expected one verified Geonorge candidate for ${ADDRESS}, got ${result.status || 'unknown'}`);
}
const coordinate = result.coordinate;
if (coordinate.sourceObjectId !== EXPECTED_SOURCE_OBJECT) {
  throw new Error(`Current Geonorge object ${coordinate.sourceObjectId} does not match aggregate source ${EXPECTED_SOURCE_OBJECT}`);
}
if (coordinate.address?.street !== 'Langkaia' || String(coordinate.address?.number) !== '1' || coordinate.address?.city !== 'Oslo') {
  throw new Error(`Current Geonorge result does not exactly match Langkaia 1, Oslo: ${JSON.stringify(coordinate.address)}`);
}
const aggregateVsCurrentMeters = haversineMeters(aggregatePlace, coordinate);
if (aggregateVsCurrentMeters > 1) {
  throw new Error(`Current Geonorge point differs ${aggregateVsCurrentMeters.toFixed(2)} m from the verified aggregate point; do not auto-sync split files`);
}

// Keep the already verified aggregate semantics, but complete the explicit source link fields.
aggregatePlace.coordSourceId = EXPECTED_SOURCE_OBJECT;
aggregatePlace.coordSourceUrl = result.sourceUrl;
aggregatePlace.coordVerifiedAt = DATE;
aggregatePlace.coordNote = 'Offisiell adressekoordinat fra Geonorge Adresser API for Langkaia 1, Oslo. Punktet er representasjonspunktet for adressen til Oslo Havnelager / Havnelageret og brukes som display-marker for bygget, ikke som kai-, vei-, vannflate- eller generelt havneområdeanker. Batch 102 reparerer split-drift: aggregate-recorden var allerede verifisert, mens split-child og split-index fortsatt bar den gamle needs_source-koordinaten.';
writeJson(AGGREGATE, aggregate);

// The split child must represent the same canonical record as its aggregate parent.
const childAfter = JSON.parse(JSON.stringify(aggregatePlace));
writeJson(CHILD, childAfter);

const splitIndex = readJson(SPLIT_INDEX);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error('Havnelageret missing from split index');
const contractFields = ['lat','lon','r','coordType','coordStatus','locatorType','sourceProvider','sourceObjectId','address','geocodeAccuracy','coordRole','coordSource','coordSourceId','coordSourceUrl','coordVerifiedAt','coordNote'];
for (const field of contractFields) {
  if (Object.prototype.hasOwnProperty.call(childAfter, field)) indexRow[field] = JSON.parse(JSON.stringify(childAfter[field]));
  else delete indexRow[field];
}
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
if (lines.slice(headerIndex + 2, tableEnd).some((line) => /^\| 102 \|/.test(line))) throw new Error('Batch 102 is already in use');
if (!lines.slice(headerIndex + 2, tableEnd).some((line) => line.includes('`havnelageret`'))) {
  lines.splice(tableEnd, 0, `| 102 | \`havnelageret\` | Oslo Havnelager | verified | \`${EXPECTED_SOURCE_OBJECT}\` |`);
}
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
  `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 102 reparerer split-drift for \`havnelageret\`: aggregate-recorden var allerede korrekt verifisert mot Geonorge Langkaia 1, mens split-child og split-index fortsatt hadde den gamle \`needs_source\`/\`legacy_manual_map_check\`-koordinaten. Geonorge-resultatet ble kjørt på nytt og måtte matche samme stabile kildeobjekt før synk. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`
);
const note = `Batch 102 (${DATE}) reparerer en konkret aggregate/split-divergens for \`havnelageret\`. Aggregate-recorden hadde allerede korrekt Geonorge-verifikasjon for Langkaia 1 (\`${EXPECTED_SOURCE_OBJECT}\`), dokumentert i den tidligere kildefix-rapporten, mens split-child og split-index fortsatt brukte den gamle feilkoordinaten og \`needs_source\`. Batchen kjører Geonorge adresse-first på nytt og krever at dagens treff matcher både kildeobjekt og koordinat i aggregate før den kopierer canonical-recorden til split-child, oppdaterer split-index og manifest og fjerner eventuell foreldet resttabellrad.`;
const anchor = '\nRelevante korrigerende merger';
const noteIndex = protocol.indexOf(anchor);
if (noteIndex < 0) throw new Error('Protocol notes anchor missing');
protocol = `${protocol.slice(0, noteIndex)}\n\n${note}${protocol.slice(noteIndex)}`;
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 102,
  placeId: PLACE_ID,
  method: 'split-drift repair gated by fresh Geonorge address-first reconfirmation',
  expectedSourceObjectId: EXPECTED_SOURCE_OBJECT,
  divergenceBefore,
  aggregateVsFreshGeonorgeMeters: Number(aggregateVsCurrentMeters.toFixed(3)),
  current: {
    lat: childAfter.lat,
    lon: childAfter.lon,
    coordStatus: childAfter.coordStatus,
    coordType: childAfter.coordType,
    sourceProvider: childAfter.sourceProvider,
    sourceObjectId: childAfter.sourceObjectId,
    address: childAfter.address,
    geocodeAccuracy: childAfter.geocodeAccuracy,
    coordRole: childAfter.coordRole
  },
  unresolvedProtocolRowsRemoved: unresolvedRemoved,
  protocolVerifiedCountAfterBatch: verifiedCount
});
fs.writeFileSync(full(`${REPORT_DIR}/README.md`), `# Oslo coordinate control batch 102\n\n- Place: Oslo Havnelager.\n- Problem: aggregate/split coordinate drift.\n- Verified aggregate source: Geonorge Langkaia 1, ${EXPECTED_SOURCE_OBJECT}.\n- Fresh Geonorge reconfirmation must match the same source object and coordinate before any split repair is published.\n- Split child is replaced with the verified aggregate canonical record; split index and manifest are synchronized atomically.\n- Pre-repair aggregate/child distance: ${divergenceBefore.meters} m.\n`);

console.log(JSON.stringify({ ok: true, batch: 102, placeId: PLACE_ID, sourceObjectId: EXPECTED_SOURCE_OBJECT, divergenceBefore, aggregateVsCurrentMeters: Number(aggregateVsCurrentMeters.toFixed(3)), unresolvedRemoved, verifiedCount }, null, 2));
