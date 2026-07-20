import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_FILE = 'data/places/historie/oslo/places_historie_atlas_obscura_bygdoy_batch_05.json';
const FOLKEMUSEUM_FILE = 'data/places/historie/oslo/places_historie/norsk_folkemuseum.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-92';
const OSM_WAY_ID = 161661199;
const OSM_API_URL = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}/full.json`;
const OSM_PAGE_URL = `https://www.openstreetmap.org/way/${OSM_WAY_ID}`;
const OFFICIAL_IDENTITY_URL = 'https://norskfolkemuseum.no/stavkirke';
const DATE = '2026-07-21';

function full(file) {
  return path.join(ROOT, file);
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}

function normalize(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
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

function polygonCentroid(points) {
  if (points.length < 4) throw new Error('OSM building polygon has too few points');
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const cross = a.lon * b.lat - b.lon * a.lat;
    twiceArea += cross;
    cx += (a.lon + b.lon) * cross;
    cy += (a.lat + b.lat) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) throw new Error('OSM building polygon has zero area');
  return {
    lon: cx / (3 * twiceArea),
    lat: cy / (3 * twiceArea)
  };
}

console.log(`[Batch 92] Fetching exact OSM building geometry: way ${OSM_WAY_ID}`);
const response = await fetch(OSM_API_URL, {
  headers: {
    Accept: 'application/json',
    'User-Agent': 'History-Go-coordinate-audit/1.0'
  }
});
if (!response.ok) {
  throw new Error(`OSM API request failed: ${response.status} ${response.statusText}`);
}
const osm = await response.json();
writeJson(`${REPORT_DIR}/osm/gol-stavkirke-way-${OSM_WAY_ID}.json`, osm);

const elements = Array.isArray(osm?.elements) ? osm.elements : [];
const way = elements.find((element) => element?.type === 'way' && element?.id === OSM_WAY_ID);
if (!way) throw new Error(`OSM way ${OSM_WAY_ID} missing from API response`);
const tags = way.tags || {};
if (tags.building !== 'church') {
  throw new Error(`OSM way ${OSM_WAY_ID} is not tagged building=church (got ${tags.building || 'missing'})`);
}

const identityFields = ['name', 'name:nb', 'name:no', 'name:en', 'official_name', 'alt_name'];
const identityText = normalize(identityFields.map((key) => tags[key]).filter(Boolean).join(' '));
const hasGol = identityText.includes('gol');
const hasStaveChurchIdentity = identityText.includes('stavkirke') || identityText.includes('stavkyrkje') || identityText.includes('stave church');
if (!hasGol || !hasStaveChurchIdentity) {
  throw new Error(`OSM way identity is not explicit enough for Gol stavkirke: ${JSON.stringify(tags)}`);
}

const nodeIds = Array.isArray(way.nodes) ? way.nodes : [];
if (nodeIds.length < 4 || nodeIds[0] !== nodeIds[nodeIds.length - 1]) {
  throw new Error(`OSM way ${OSM_WAY_ID} is not a closed building polygon`);
}
const nodeMap = new Map(
  elements
    .filter((element) => element?.type === 'node' && Number.isFinite(element.lat) && Number.isFinite(element.lon))
    .map((node) => [node.id, { lat: node.lat, lon: node.lon }])
);
const polygon = nodeIds.map((id) => {
  const point = nodeMap.get(id);
  if (!point) throw new Error(`Missing coordinate for OSM node ${id}`);
  return point;
});
const centroid = polygonCentroid(polygon);

const places = JSON.parse(fs.readFileSync(full(SOURCE_FILE), 'utf8'));
const place = places.find((row) => row?.id === 'gol_stavkirke_bygdoy');
if (!place) throw new Error('Missing canonical gol_stavkirke_bygdoy record');
if (place.locatorType !== 'building') throw new Error('Gol stavkirke is not modeled as a building');
const previous = {
  lat: place.lat,
  lon: place.lon,
  coordStatus: place.coordStatus || '',
  coordSource: place.coordSource || '',
  coordSourceId: place.coordSourceId || '',
  coordSourceUrl: place.coordSourceUrl || '',
  address: place.address || null
};
const oldPointDistanceMeters = haversineMeters({ lat: place.lat, lon: place.lon }, centroid);
if (oldPointDistanceMeters > 100) {
  throw new Error(`Exact OSM building centroid is ${oldPointDistanceMeters.toFixed(1)} m from the legacy point; manual identity review required`);
}

const folkemuseum = JSON.parse(fs.readFileSync(full(FOLKEMUSEUM_FILE), 'utf8'));
if (folkemuseum?.id !== 'norsk_folkemuseum') throw new Error('Canonical Norsk Folkemuseum record missing');
const museumAnchor = { lat: folkemuseum.lat, lon: folkemuseum.lon };
const museumSeparationMeters = haversineMeters(centroid, museumAnchor);
if (museumSeparationMeters < 50) {
  throw new Error(`Gol stavkirke centroid is only ${museumSeparationMeters.toFixed(1)} m from Norsk Folkemuseum address marker; overlap audit failed`);
}
if (folkemuseum.sourceObjectId === `osm-way:${OSM_WAY_ID}`) {
  throw new Error('Gol stavkirke and Norsk Folkemuseum unexpectedly share the same source object');
}

place.lat = centroid.lat;
place.lon = centroid.lon;
place.locatorType = 'building';
place.sourceProvider = 'osm';
place.sourceObjectId = `osm-way:${OSM_WAY_ID}`;
place.geocodeAccuracy = 'geometric_center';
place.coordRole = 'building_center';
place.coordStatus = 'verified_geometry';
place.coordSource = 'osm';
place.coordSourceId = `osm-way:${OSM_WAY_ID}`;
place.coordSourceUrl = OSM_PAGE_URL;
place.coordType = 'building_center';
place.coordVerifiedAt = DATE;
place.coordNote = `Geometrisk senter for eksakt navngitt OSM-bygningsgeometri, way ${OSM_WAY_ID}, validert som building=church og Gol stavkirke. Bygningsidentiteten er kryssjekket mot Norsk Folkemuseums offisielle side ${OFFICIAL_IDENTITY_URL}. Museumsveien 10 er museets besøksadresse og brukes ikke som koordinatkilde for selve stavkirken.`;
delete place.coordPrecisionM;
delete place.address;
place.externalLinks = Array.isArray(place.externalLinks) ? place.externalLinks : [];
if (!place.externalLinks.some((link) => link?.url === OFFICIAL_IDENTITY_URL)) {
  place.externalLinks.push({
    type: 'official',
    label: 'Norsk Folkemuseum – Gol stavkirke',
    url: OFFICIAL_IDENTITY_URL,
    lang: 'nb',
    verifiedAt: DATE
  });
}
fs.writeFileSync(full(SOURCE_FILE), `${JSON.stringify(places, null, 2)}\n`);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const tableHeader = '| batch | placeId | navn | godkjent status | kildeobjekt |';
const lines = protocol.split('\n');
const headerIndex = lines.indexOf(tableHeader);
if (headerIndex < 0) throw new Error('Oslo verified protocol table header missing');
let tableEnd = headerIndex + 2;
while (tableEnd < lines.length && lines[tableEnd].startsWith('| ')) tableEnd += 1;
if (lines.slice(headerIndex + 2, tableEnd).some((line) => line.includes('`gol_stavkirke_bygdoy`'))) {
  throw new Error('gol_stavkirke_bygdoy already exists in verified protocol table');
}
if (lines.slice(headerIndex + 2, tableEnd).some((line) => /^\| 92 \|/.test(line))) {
  throw new Error('Batch 92 is already in use in the Oslo protocol');
}
lines.splice(
  tableEnd,
  0,
  `| 92 | \`gol_stavkirke_bygdoy\` | Gol stavkirke – Bygdøy | verified_geometry | \`osm-way:${OSM_WAY_ID}\` |`
);
protocol = lines.join('\n').replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${DATE}`);

const protocolLines = protocol.split('\n');
const refreshedHeaderIndex = protocolLines.indexOf(tableHeader);
let refreshedEnd = refreshedHeaderIndex + 2;
while (refreshedEnd < protocolLines.length && protocolLines[refreshedEnd].startsWith('| ')) refreshedEnd += 1;
const verifiedCount = refreshedEnd - (refreshedHeaderIndex + 2);
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} dokumenterte verifiserte eller kildekontrollerte canonical steder. Batch 92 erstatter Wikidata som primær koordinatkilde for \`gol_stavkirke_bygdoy\` med den eksakte navngitte kirkebygningen i OSM, kryssjekket mot Norsk Folkemuseums offisielle identitetsside. Museumsveien 10 beholdes som Norsk Folkemuseums besøksadresse, men brukes ikke som proxy for stavkirken. Resttabellen under er en dokumentasjonsliste for eksplisitt førte konflikter og er ikke en komplett opptelling av all runtime-koordinatbacklog.`
);

const note = `Batch 92 (${DATE}) retter \`gol_stavkirke_bygdoy\` fra legacy \`verified_source_coordinate\` med Wikidata som primærkilde til eksakt bygningsgeometri. OSM-way ${OSM_WAY_ID} må i selve API-responsen være en lukket polygon, være tagget \`building=church\` og ha et eksplisitt navn som identifiserer Gol stavkirke før koordinaten godkjennes. Geometrisk sentrum brukes som displayanker og kryssjekkes mot Norsk Folkemuseums offisielle Gol-stavkirke-side. Punktet ligger ${museumSeparationMeters.toFixed(1)} meter fra museets separate Geonorge-adresseanker; Museumsveien 10 er derfor fjernet fra subplace-recorden og brukes ikke som kirkekoordinat.`;
if (!protocol.includes(note)) {
  const anchor = '\nRelevante korrigerende merger';
  const noteIndex = protocol.indexOf(anchor);
  if (noteIndex < 0) throw new Error('Could not locate protocol notes anchor');
  protocol = `${protocol.slice(0, noteIndex)}\n\n${note}${protocol.slice(noteIndex)}`;
}
fs.writeFileSync(full(PROTOCOL), protocol);

writeJson(`${REPORT_DIR}/summary.json`, {
  date: DATE,
  batch: 92,
  placeId: place.id,
  method: 'object-type-first + exact named OSM building geometry + official institution identity cross-check',
  osm: {
    apiUrl: OSM_API_URL,
    pageUrl: OSM_PAGE_URL,
    wayId: OSM_WAY_ID,
    tags,
    nodeCount: nodeIds.length,
    centroid
  },
  officialIdentitySource: OFFICIAL_IDENTITY_URL,
  previous,
  current: {
    lat: place.lat,
    lon: place.lon,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordSourceId: place.coordSourceId,
    sourceProvider: place.sourceProvider,
    sourceObjectId: place.sourceObjectId,
    geocodeAccuracy: place.geocodeAccuracy,
    coordRole: place.coordRole,
    addressRemoved: !place.address
  },
  qa: {
    legacyPointDistanceMeters: Number(oldPointDistanceMeters.toFixed(1)),
    norskFolkemuseumAnchorDistanceMeters: Number(museumSeparationMeters.toFixed(1)),
    distinctFromNorskFolkemuseumSourceObject: true
  },
  protocolVerifiedCountAfterBatch: verifiedCount
});

fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Oslo coordinate control batch 92\n\n` +
  `- Gol stavkirke is treated as its own physical building, not as the Norsk Folkemuseum address point.\n` +
  `- Primary geometry: exact OSM way ${OSM_WAY_ID}, fetched directly from the OSM API and required to identify Gol stavkirke as a church building.\n` +
  `- Identity cross-check: Norsk Folkemuseum official Gol stavkirke page.\n` +
  `- Legacy Wikidata-primary coordinate removed.\n` +
  `- Museumsveien 10 removed from the subplace record because it is the museum site's visitor address, not a unique church-building address.\n` +
  `- Distance to previous point: ${oldPointDistanceMeters.toFixed(1)} m.\n` +
  `- Distance to Norsk Folkemuseum's separate address marker: ${museumSeparationMeters.toFixed(1)} m.\n`
);

console.log(JSON.stringify({
  ok: true,
  batch: 92,
  placeId: place.id,
  sourceObjectId: place.sourceObjectId,
  centroid,
  legacyPointDistanceMeters: Number(oldPointDistanceMeters.toFixed(1)),
  museumSeparationMeters: Number(museumSeparationMeters.toFixed(1)),
  verifiedCount
}, null, 2));
