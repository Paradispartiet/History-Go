import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_FILE = 'data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-91';
const DATE = '2026-07-21';

const targets = [
  {
    id: 'frammuseet',
    address: 'Bygdøynesveien 39 Oslo',
    expectedStreet: 'Bygdøynesveien',
    expectedNumber: '39',
    officialIdentityUrl: 'https://frammuseum.no/nb/kontakt/'
  },
  {
    id: 'kon_tiki_museet',
    address: 'Bygdøynesveien 36 Oslo',
    expectedStreet: 'Bygdøynesveien',
    expectedNumber: '36',
    officialIdentityUrl: 'https://www.kon-tiki.no/no/find-us'
  }
];

function full(file) {
  return path.join(ROOT, file);
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}

function cleanCell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .replace(/`/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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

fs.mkdirSync(full(`${REPORT_DIR}/address`), { recursive: true });

console.log('[Batch 91] Building coordinate tools');
execFileSync('npm', ['run', 'build:tools'], { stdio: 'inherit' });

const lookups = new Map();
for (const target of targets) {
  console.log(`[Batch 91] Geonorge address-first lookup: ${target.address}`);
  const raw = execFileSync(
    'node',
    ['dist/tools/address-first-coordinate-finder.mjs', '--address', target.address],
    { encoding: 'utf8' }
  );
  const parsed = JSON.parse(raw);
  writeJson(`${REPORT_DIR}/address/${target.id}.json`, parsed);

  if (!parsed.ok || parsed.status !== 'verified_candidate') {
    throw new Error(`${target.id}: expected verified_candidate, got ${parsed.status || 'unknown'}`);
  }
  if (parsed.sourceProvider !== 'official_address' || !parsed.coordinate) {
    throw new Error(`${target.id}: lookup did not return an official_address coordinate`);
  }
  const address = parsed.coordinate.address || {};
  if (address.street !== target.expectedStreet || String(address.number) !== target.expectedNumber || address.city !== 'Oslo') {
    throw new Error(`${target.id}: Geonorge result does not match expected museum address`);
  }
  lookups.set(target.id, parsed);
}

const framPoint = lookups.get('frammuseet').coordinate;
const konTikiPoint = lookups.get('kon_tiki_museet').coordinate;
const separationMeters = haversineMeters(framPoint, konTikiPoint);
if (framPoint.sourceObjectId === konTikiPoint.sourceObjectId) {
  throw new Error('Frammuseet and Kon-Tiki unexpectedly resolved to the same Geonorge address object');
}
if (separationMeters < 20) {
  throw new Error(`Frammuseet and Kon-Tiki address points are only ${separationMeters.toFixed(1)} m apart; physical overlap audit required`);
}

const places = JSON.parse(fs.readFileSync(full(SOURCE_FILE), 'utf8'));
const changes = [];
for (const target of targets) {
  const place = places.find((row) => row?.id === target.id);
  if (!place) throw new Error(`Missing target place ${target.id}`);
  if (place.locatorType !== 'building') throw new Error(`${target.id}: expected building locatorType`);

  const result = lookups.get(target.id);
  const coordinate = result.coordinate;
  const previous = {
    lat: place.lat,
    lon: place.lon,
    coordStatus: place.coordStatus || '',
    coordSource: place.coordSource || '',
    coordSourceId: place.coordSourceId || '',
    coordSourceUrl: place.coordSourceUrl || ''
  };

  place.lat = coordinate.lat;
  place.lon = coordinate.lon;
  place.r = coordinate.r;
  place.locatorType = coordinate.locatorType;
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
  place.coordNote = `${coordinate.coordNote} Museumets egen nettside bekrefter besøksadressen (${target.officialIdentityUrl}). Det tidligere Wikidata-punktet er erstattet som primær koordinatkilde.`;
  delete place.coordPrecisionM;

  changes.push({
    id: target.id,
    name: place.name,
    officialIdentityUrl: target.officialIdentityUrl,
    previous,
    current: {
      lat: place.lat,
      lon: place.lon,
      coordStatus: place.coordStatus,
      coordSource: place.coordSource,
      coordSourceId: place.coordSourceId,
      coordSourceUrl: place.coordSourceUrl,
      sourceProvider: place.sourceProvider,
      sourceObjectId: place.sourceObjectId,
      address: place.address
    }
  });
}
fs.writeFileSync(full(SOURCE_FILE), `${JSON.stringify(places, null, 2)}\n`);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);

const tableHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const lines = protocol.split('\n');
const headerIndex = lines.indexOf(tableHeader);
if (headerIndex < 0) throw new Error('Oslo verified protocol table header missing');
let tableEnd = headerIndex + 2;
while (tableEnd < lines.length && lines[tableEnd].startsWith('| ')) tableEnd += 1;

for (const change of changes) {
  if (protocol.includes(`\`${change.id}\``)) {
    const existingVerified = lines.slice(headerIndex + 2, tableEnd).some((line) => line.includes(`\`${change.id}\``));
    if (existingVerified) throw new Error(`${change.id}: already present in verified protocol table`);
  }
}

const rows = changes.map((change) =>
  `| 91 | \`${cleanCell(change.id)}\` | ${cleanCell(change.name)} | verified | \`${cleanCell(change.current.sourceObjectId)}\` |`
);
lines.splice(tableEnd, 0, ...rows);
protocol = lines.join('\n');

const protocolLines = protocol.split('\n');
const refreshedHeaderIndex = protocolLines.indexOf(tableHeader);
let refreshedEnd = refreshedHeaderIndex + 2;
while (refreshedEnd < protocolLines.length && protocolLines[refreshedEnd].startsWith('| ')) refreshedEnd += 1;
const verifiedCount = refreshedEnd - (refreshedHeaderIndex + 2);

protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 91 erstatter Wikidata som primær koordinatkilde for \`frammuseet\` og \`kon_tiki_museet\` med entydige Geonorge-adressepunkter, etter at museenes egne sider bekrefter henholdsvis Bygdøynesveien 39 og 36. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`
);

const batchNote = `Batch 91 (${DATE}) retter to legacy \`verified_source_coordinate\`-poster på Bygdøynes. \`frammuseet\` bruker nå det entydige Geonorge-punktet for Bygdøynesveien 39, og \`kon_tiki_museet\` bruker det entydige Geonorge-punktet for Bygdøynesveien 36. Begge adressene er samtidig bekreftet av museenes egne nettsider. De to offisielle adresseobjektene er fysisk separate (${separationMeters.toFixed(1)} meter mellom representasjonspunktene), og Wikidata er fjernet som primær koordinatkilde. \`gol_stavkirke_bygdoy\` inngår ikke i batchen fordi Museumsveien 10 er museumsområdets besøksadresse og ikke uten videre et presist bygningsanker for stavkirken.`;
if (!protocol.includes(batchNote)) {
  const firstNoteAnchor = '\nRelevante korrigerende merger';
  const noteIndex = protocol.indexOf(firstNoteAnchor);
  if (noteIndex < 0) throw new Error('Could not locate protocol notes anchor');
  protocol = `${protocol.slice(0, noteIndex)}\n\n${batchNote}${protocol.slice(noteIndex)}`;
}
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 91,
  sourceFile: SOURCE_FILE,
  method: 'object-type-first + Geonorge address-first for two addressable museum buildings',
  officialIdentitySources: targets.map(({ id, officialIdentityUrl, address }) => ({ id, officialIdentityUrl, address })),
  physicalOverlapAudit: {
    distinctSourceObjectIds: true,
    separationMeters: Number(separationMeters.toFixed(1)),
    result: 'separate_physical_address_objects'
  },
  changes,
  deferred: {
    id: 'gol_stavkirke_bygdoy',
    reason: 'Museumsveien 10 is the broader Norsk Folkemuseum visitor address; exact building geometry must be audited separately.'
  },
  protocolVerifiedCountAfterBatch: verifiedCount
});

fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Oslo coordinate control batch 91\n\n` +
  `Corrected two legacy source-coordinate records using the locked object-type-first method.\n\n` +
  `- Frammuseet: official museum address Bygdøynesveien 39 -> unique Geonorge address object.\n` +
  `- Kon-Tiki Museet: official museum address Bygdøynesveien 36 -> unique Geonorge address object.\n` +
  `- Physical overlap audit: ${separationMeters.toFixed(1)} m between the two official address representation points.\n` +
  `- Gol stavkirke was deliberately deferred; the museum visitor address is not treated as a proxy for the church building.\n` +
  `- No nearest/first candidate guessing and no Wikidata primary coordinate source remain for the two corrected museums.\n`
);

console.log(JSON.stringify({
  ok: true,
  batch: 91,
  verifiedCount,
  separationMeters: Number(separationMeters.toFixed(1)),
  changes: changes.map((change) => ({ id: change.id, sourceObjectId: change.current.sourceObjectId, lat: change.current.lat, lon: change.current.lon })),
  deferred: 'gol_stavkirke_bygdoy'
}, null, 2));
