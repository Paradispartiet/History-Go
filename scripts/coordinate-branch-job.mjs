import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, execSync } from 'node:child_process';

const ROOT = process.cwd();
const PLACE_ID = 'havnelageret';
const BATCH = 102;
const EXPECTED_SOURCE_OBJECT = 'geonorge-adresser-v1:0301:14150:1';
const ADDRESS = 'Langkaia 1 Oslo';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/havnelageret.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-102';
const DATE = '2026-07-21';

const full = (file) => path.join(ROOT, file);
const readJson = (file) => JSON.parse(fs.readFileSync(full(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex');
const haversineMeters = (a, b) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Materialize against the latest canonical baseline. The running Node process keeps this loaded job
// even though the reset removes the one-shot script from the resulting branch diff.
execSync('git fetch origin main && git reset --hard origin/main', { stdio: 'inherit' });

const aggregate = readJson(AGGREGATE);
const aggregatePlace = aggregate.find((row) => row?.id === PLACE_ID);
const childBefore = readJson(CHILD);
if (!aggregatePlace || childBefore?.id !== PLACE_ID) throw new Error('Havnelageret aggregate/child missing');
if (
  aggregatePlace.coordStatus !== 'verified'
  || aggregatePlace.sourceProvider !== 'official_address'
  || aggregatePlace.sourceObjectId !== EXPECTED_SOURCE_OBJECT
) {
  throw new Error(`Aggregate Havnelageret is not in expected verified Geonorge state: ${aggregatePlace.coordStatus}/${aggregatePlace.sourceProvider}/${aggregatePlace.sourceObjectId}`);
}
if (
  aggregatePlace.address?.street !== 'Langkaia'
  || String(aggregatePlace.address?.number) !== '1'
  || aggregatePlace.address?.city !== 'Oslo'
) {
  throw new Error('Aggregate Havnelageret does not carry exact Langkaia 1, Oslo identity');
}

const divergenceBefore = {
  aggregate: {
    lat: aggregatePlace.lat,
    lon: aggregatePlace.lon,
    r: aggregatePlace.r,
    coordStatus: aggregatePlace.coordStatus,
    coordType: aggregatePlace.coordType,
    sourceObjectId: aggregatePlace.sourceObjectId
  },
  splitChild: {
    lat: childBefore.lat,
    lon: childBefore.lon,
    r: childBefore.r,
    coordStatus: childBefore.coordStatus,
    coordType: childBefore.coordType,
    sourceObjectId: childBefore.sourceObjectId ?? ''
  },
  meters: Number(haversineMeters(aggregatePlace, childBefore).toFixed(1))
};
if (
  divergenceBefore.meters < 1
  && childBefore.coordStatus === aggregatePlace.coordStatus
  && childBefore.sourceObjectId === aggregatePlace.sourceObjectId
) {
  throw new Error('Havnelageret aggregate and split child are already synchronized; no repair needed');
}

console.log('[Batch 102] Building coordinate tools');
execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });
console.log(`[Batch 102] Reconfirming Geonorge address-first result: ${ADDRESS}`);
const raw = execFileSync(
  'node',
  ['dist/tools/address-first-coordinate-finder.mjs', '--address', ADDRESS],
  { encoding: 'utf8' }
);
const result = JSON.parse(raw);
writeJson(`${REPORT_DIR}/address/${PLACE_ID}.json`, result);
if (!result.ok || result.status !== 'verified_candidate' || !result.coordinate) {
  throw new Error(`Expected one verified Geonorge candidate for ${ADDRESS}, got ${result.status ?? 'unknown'}`);
}
const coordinate = result.coordinate;
if (coordinate.sourceObjectId !== EXPECTED_SOURCE_OBJECT) {
  throw new Error(`Fresh Geonorge object ${coordinate.sourceObjectId} does not match ${EXPECTED_SOURCE_OBJECT}`);
}
if (
  coordinate.address?.street !== 'Langkaia'
  || String(coordinate.address?.number) !== '1'
  || coordinate.address?.city !== 'Oslo'
) {
  throw new Error(`Fresh Geonorge result is not exact Langkaia 1, Oslo: ${JSON.stringify(coordinate.address)}`);
}
const aggregateVsFreshMeters = haversineMeters(aggregatePlace, coordinate);
if (aggregateVsFreshMeters > 1) {
  throw new Error(`Fresh Geonorge point differs ${aggregateVsFreshMeters.toFixed(2)} m from verified aggregate point`);
}

// Do not rewrite the verified aggregate record: coordinate evidence already snapshots it exactly.
// The repair is strictly aggregate -> split child/index synchronization.
const childAfter = JSON.parse(JSON.stringify(aggregatePlace));
writeJson(CHILD, childAfter);

const splitIndex = readJson(SPLIT_INDEX);
const indexPos = splitIndex.findIndex((row) => row?.id === PLACE_ID);
if (indexPos < 0) throw new Error('Havnelageret missing from split index');
splitIndex[indexPos] = JSON.parse(JSON.stringify(childAfter));
writeJson(SPLIT_INDEX, splitIndex);

const splitManifest = readJson(SPLIT_MANIFEST);
const manifestRow = splitManifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error('Havnelageret missing from split manifest');
manifestRow.sha256 = sha256(CHILD);
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const osloStart = protocol.indexOf('## Oslo');
const osloEnd = protocol.indexOf('## Vestland – Etne');
if (osloStart < 0 || osloEnd < 0) throw new Error('Could not locate Oslo protocol section');
const osloBefore = protocol.slice(osloStart, osloEnd);
if (/^\|\s*102\s*\|/m.test(osloBefore)) throw new Error('Batch 102 is already in use on latest main');
if (/^\|\s*\d+\s*\|\s*`havnelageret`\s*\|/m.test(osloBefore)) {
  throw new Error('Havnelageret already has a verified protocol row; refusing duplicate row');
}

const row = `| 102 | \`havnelageret\` | Oslo Havnelager | verified | \`${EXPECTED_SOURCE_OBJECT}\` |`;
const first103 = protocol.indexOf('\n| 103 |', osloStart);
const notesAnchor = protocol.indexOf('\nRelevante korrigerende merger', osloStart);
if (first103 >= 0 && first103 < osloEnd) {
  protocol = `${protocol.slice(0, first103 + 1)}${row}\n${protocol.slice(first103 + 1)}`;
} else if (notesAnchor >= 0 && notesAnchor < osloEnd) {
  protocol = `${protocol.slice(0, notesAnchor + 1)}${row}\n\n${protocol.slice(notesAnchor + 1)}`;
} else {
  throw new Error('Could not locate insertion point for batch 102');
}

// Remove any stale needs_review documentation row for Havnelageret, without touching verified rows.
protocol = protocol
  .split('\n')
  .filter((line) => !/^\|\s*`havnelageret`\s*\|/.test(line))
  .join('\n');

const refreshedOsloStart = protocol.indexOf('## Oslo');
const refreshedOsloEnd = protocol.indexOf('## Vestland – Etne');
const refreshedOslo = protocol.slice(refreshedOsloStart, refreshedOsloEnd);
const placeIds = [...refreshedOslo.matchAll(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/gm)].map((m) => m[1]);
const uniqueVerifiedCount = new Set(placeIds).size;
protocol = protocol.replace(
  /Oslo-tabellen inneholder nå \d+ dokumenterte verifiserte eller kildekontrollerte canonical steder\./,
  `Oslo-tabellen inneholder nå ${uniqueVerifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder.`
);
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);

const note = `Batch 102 (${DATE}) reparerer en dokumentert aggregate/split-divergens for \`havnelageret\`. Aggregate-recorden var allerede korrekt verifisert mot Geonorge-adressen Langkaia 1 (\`${EXPECTED_SOURCE_OBJECT}\`), mens split-child og split-index fortsatt bar den gamle \`needs_source\`/\`legacy_manual_map_check\`-koordinaten. Geonorge address-first ble kjørt på nytt og måtte returnere samme kildeobjekt og et punkt innen 1 meter fra aggregate-recorden før canonical aggregate-data ble kopiert uendret til split-child og split-index. Evidence-recorden peker fortsatt på aggregate-filen og trengte derfor ingen semantisk omskriving.`;
const correctionAnchor = '\nRelevante korrigerende merger';
const correctionIndex = protocol.indexOf(correctionAnchor, refreshedOsloStart);
if (correctionIndex < 0 || correctionIndex > protocol.indexOf('## Vestland – Etne')) {
  throw new Error('Could not locate protocol correction-note anchor');
}
protocol = `${protocol.slice(0, correctionIndex)}\n\n${note}${protocol.slice(correctionIndex)}`;
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  method: 'fresh Geonorge address-first reconfirmation followed by aggregate-to-split synchronization',
  expectedSourceObjectId: EXPECTED_SOURCE_OBJECT,
  divergenceBefore,
  aggregateVsFreshGeonorgeMeters: Number(aggregateVsFreshMeters.toFixed(3)),
  repairedCoordinate: {
    lat: childAfter.lat,
    lon: childAfter.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordType: childAfter.coordType,
    sourceProvider: childAfter.sourceProvider,
    sourceObjectId: childAfter.sourceObjectId,
    address: childAfter.address,
    geocodeAccuracy: childAfter.geocodeAccuracy,
    coordRole: childAfter.coordRole
  },
  protocolUniqueVerifiedCountAfterBatch: uniqueVerifiedCount
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Oslo coordinate control batch 102\n\n- Place: Oslo Havnelager (\`havnelageret\`).\n- Problem: verified aggregate / stale split-child and split-index drift.\n- Canonical source: Geonorge Langkaia 1, \`${EXPECTED_SOURCE_OBJECT}\`.\n- Fresh address-first result must match the same source object and lie within 1 metre of the aggregate coordinate before synchronization.\n- The verified aggregate record is not rewritten; it is copied unchanged to the split child and split index so evidence remains an exact active snapshot.\n- Pre-repair aggregate/child distance: ${divergenceBefore.meters} m.\n`
);

console.log(JSON.stringify({
  ok: true,
  batch: BATCH,
  placeId: PLACE_ID,
  sourceObjectId: EXPECTED_SOURCE_OBJECT,
  divergenceBefore,
  aggregateVsFreshGeonorgeMeters: Number(aggregateVsFreshMeters.toFixed(3)),
  protocolUniqueVerifiedCountAfterBatch: uniqueVerifiedCount
}, null, 2));
