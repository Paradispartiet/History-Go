import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-meteorologisk-institutt-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/meteorologisk_institutt.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const orgNumber = '971274042';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'text/html,application/json;q=0.9,*/*;q=0.8',
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url, options = {}) => JSON.parse(await fetchText(url, options));
const distanceMeters = (a, b) => {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const normalize = (value) => String(value ?? '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&aring;|&#229;/gi, 'å')
  .replace(/&oslash;|&#248;/gi, 'ø')
  .replace(/&aelig;|&#230;/gi, 'æ')
  .replace(/&Aring;|&#197;/g, 'Å')
  .replace(/&Oslash;|&#216;/g, 'Ø')
  .replace(/&AElig;|&#198;/g, 'Æ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const uniqueCoordinates = (rows) => {
  const byKey = new Map();
  for (const row of rows) {
    const point = row.representasjonspunkt ?? row.representasjonspunktWgs84 ?? {};
    const lat = Number(point.lat);
    const lon = Number(point.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const key = `${lat.toFixed(8)},${lon.toFixed(8)}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.rowCount += 1;
      continue;
    }
    const number = String(row.nummer ?? '1');
    const letter = String(row.bokstav ?? '').trim();
    byKey.set(key, {
      lat,
      lon,
      sourceObjectId: `geonorge-adresser-v1:0301:${row.adressekode ?? 'henrik-mohns-plass'}:${number}${letter}:${lat.toFixed(8)},${lon.toFixed(8)}`,
      rowCount: 1,
      addressText: row.adressetekst ?? `Henrik Mohns plass ${number}${letter}`,
    });
  }
  return [...byKey.values()];
};
const isTransport = (tags = {}) => Boolean(
  tags.public_transport
  || tags.railway
  || tags.tram === 'yes'
  || tags.subway === 'yes'
  || tags.bus === 'yes'
  || tags.highway === 'bus_stop'
);
const elementCoordinate = (element) => {
  if (Number.isFinite(Number(element.lat)) && Number.isFinite(Number(element.lon))) {
    return { lat: Number(element.lat), lon: Number(element.lon) };
  }
  if (Number.isFinite(Number(element.center?.lat)) && Number.isFinite(Number(element.center?.lon))) {
    return { lat: Number(element.center.lat), lon: Number(element.center.lon) };
  }
  return null;
};
const candidateScore = (element, officialPoint) => {
  const tags = element.tags ?? {};
  const name = String(tags.name ?? '').toLowerCase();
  let score = 0;
  if (tags['ref:NO:orgnr'] === orgNumber) score += 1000;
  if (name === 'meteorologisk institutt') score += 600;
  if (name.includes('meteorologisk institutt')) score += 300;
  if (String(tags['name:en'] ?? '').toLowerCase().includes('meteorological institute')) score += 200;
  if (tags.office === 'government' || tags.office === 'research') score += 150;
  if (tags.amenity === 'research_institute' || tags.amenity === 'university') score += 150;
  if (tags.wikidata) score += 50;
  if (tags.website && String(tags.website).includes('met.no')) score += 100;
  const coordinate = elementCoordinate(element);
  if (coordinate && officialPoint) {
    const distance = distanceMeters(coordinate, officialPoint);
    score += Math.max(0, 200 - distance);
  }
  return score;
};
const pointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    if (((yi > point.lat) !== (yj > point.lat))
      && point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const polygonMetrics = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon
    ? points
    : [...points, points[0]];
  const referenceLat = ring.reduce((sum, point) => sum + point.lat, 0) / ring.length;
  const latScale = 111320;
  const lonScale = 111320 * Math.cos(referenceLat * Math.PI / 180);
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const x1 = ring[index].lon * lonScale;
    const y1 = ring[index].lat * latScale;
    const x2 = ring[index + 1].lon * lonScale;
    const y2 = ring[index + 1].lat * latScale;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  assert(Math.abs(twiceArea) > 0.01, 'Selected polygon has zero area.');
  return {
    ring,
    areaSquareMeters: Math.abs(twiceArea / 2),
    centroid: {
      lat: (cy / (3 * twiceArea)) / latScale,
      lon: (cx / (3 * twiceArea)) / lonScale,
    },
  };
};

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'meteorologisk_institutt', 'Unexpected canonical place.');
assert(place.year === 1866, 'Unexpected canonical year.');
const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };

const officialContactUrl = 'https://www.met.no/kontakt-oss/veibeskrivelse';
const officialAboutUrl = 'https://www.met.no/om-oss/om-meteorologisk-institutt';
const brregUrl = `https://data.brreg.no/enhetsregisteret/api/enheter/${orgNumber}`;
const geonorgeUrl = 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Henrik%20Mohns%20plass&nummer=1&kommunenummer=0301&treffPerSide=20';
const overpassQuery = `[out:json][timeout:30];(nwr(around:1000,${currentCoordinate.lat},${currentCoordinate.lon})["name"~"Meteorologisk institutt|Meteorological Institute|MET Norway",i];nwr(around:1000,${currentCoordinate.lat},${currentCoordinate.lon})["ref:NO:orgnr"="${orgNumber}"];);out center tags;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

const [contactHtml, aboutHtml, brreg, geonorge, overpass] = await Promise.all([
  fetchText(officialContactUrl),
  fetchText(officialAboutUrl),
  fetchJson(brregUrl, { headers: { accept: 'application/json' } }),
  fetchJson(geonorgeUrl, { headers: { accept: 'application/json' } }),
  fetchJson(overpassUrl, { headers: { accept: 'application/json' } }),
]);

await fs.writeFile(path.join(reportDir, 'met-contact.html'), contactHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'met-about.html'), aboutHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'brreg-971274042.json'), `${JSON.stringify(brreg, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'geonorge-henrik-mohns-plass-1.json'), `${JSON.stringify(geonorge, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'overpass-meteorologisk-institutt.json'), `${JSON.stringify(overpass, null, 2)}\n`, 'utf8');

const contactText = normalize(contactHtml);
const aboutText = normalize(aboutHtml);
assert(contactText.includes('henrik mohns plass 1'), 'Official MET contact page does not show Henrik Mohns plass 1.');
assert(contactText.includes('0371 oslo'), 'Official MET contact page does not show postcode 0371 Oslo.');
assert(aboutText.includes('meteorologisk institutt'), 'Official MET about page identity missing.');
assert(aboutText.includes('1866'), 'Official MET about page no longer supports the 1866 history.');
assert(String(brreg.organisasjonsnummer) === orgNumber, 'Unexpected Brønnøysund organisation number.');
assert(normalize(brreg.navn) === 'meteorologisk institutt', 'Unexpected Brønnøysund name.');
const brregAddress = normalize([
  ...(brreg.forretningsadresse?.adresse ?? []),
  brreg.forretningsadresse?.postnummer,
  brreg.forretningsadresse?.poststed,
].join(' '));
assert(brregAddress.includes('henrik mohns plass 1'), 'Brønnøysund does not show Henrik Mohns plass 1.');
assert(brregAddress.includes('0371 oslo'), 'Brønnøysund does not show postcode 0371 Oslo.');

const addressRows = Array.isArray(geonorge.adresser) ? geonorge.adresser : [];
const exactRows = addressRows.filter((row) => normalize(row.adressetekst) === 'henrik mohns plass 1');
const officialCoordinates = uniqueCoordinates(exactRows);
assert(officialCoordinates.length >= 1, 'No exact Kartverket coordinate for Henrik Mohns plass 1.');
const officialPoint = officialCoordinates.length === 1 ? officialCoordinates[0] : null;

const allObjects = (overpass.elements ?? []).map((element) => ({
  ...element,
  coordinate: elementCoordinate(element),
  transportRejected: isTransport(element.tags),
}));
const rejectedTransportObjects = allObjects
  .filter((element) => element.transportRejected)
  .map((element) => ({
    sourceObjectId: `osm-${element.type}:${element.id}`,
    name: element.tags?.name ?? null,
    reason: 'transport_object_not_meteorological_institute',
    distanceMeters: element.coordinate && officialPoint
      ? Number(distanceMeters(element.coordinate, officialPoint).toFixed(1))
      : null,
  }));
const nonTransport = allObjects
  .filter((element) => !element.transportRejected && element.coordinate)
  .map((element) => ({
    ...element,
    score: candidateScore(element, officialPoint),
  }))
  .sort((a, b) => b.score - a.score);
const selected = nonTransport[0] ?? null;
assert(selected && selected.score >= 400, 'No sufficiently strong named non-transport MET object found.');
const selectedTags = selected.tags ?? {};
assert(
  selectedTags['ref:NO:orgnr'] === orgNumber
    || normalize(selectedTags.name).includes('meteorologisk institutt'),
  'Selected OSM object does not resolve the MET identity.',
);

let geometry = null;
if (selected.type === 'way') {
  const fullUrl = `https://api.openstreetmap.org/api/0.6/way/${selected.id}/full.json`;
  const full = await fetchJson(fullUrl, { headers: { accept: 'application/json' } });
  await fs.writeFile(path.join(reportDir, `osm-way-${selected.id}-full.json`), `${JSON.stringify(full, null, 2)}\n`, 'utf8');
  const way = (full.elements ?? []).find((entry) => entry.type === 'way' && entry.id === selected.id);
  const nodeMap = new Map((full.elements ?? [])
    .filter((entry) => entry.type === 'node')
    .map((entry) => [entry.id, { lat: Number(entry.lat), lon: Number(entry.lon) }]));
  const polygon = (way?.nodes ?? []).map((id) => nodeMap.get(id)).filter(Boolean);
  if (polygon.length >= 4) {
    const metrics = polygonMetrics(polygon);
    const candidateInside = officialPoint ? pointInPolygon(officialPoint, metrics.ring) : false;
    const centroidInside = pointInPolygon(metrics.centroid, metrics.ring);
    geometry = {
      sourceObjectId: `osm-way:${selected.id}`,
      sourceUrl: `https://www.openstreetmap.org/way/${selected.id}`,
      polygonNodeCount: polygon.length,
      areaSquareMeters: Number(metrics.areaSquareMeters.toFixed(1)),
      centroid: {
        lat: Number(metrics.centroid.lat.toFixed(8)),
        lon: Number(metrics.centroid.lon.toFixed(8)),
      },
      officialAddressPointInside: candidateInside,
      centroidInsidePolygon: centroidInside,
      addressToCentroidMeters: officialPoint
        ? Number(distanceMeters(officialPoint, metrics.centroid).toFixed(1))
        : null,
      maximumVertexDistanceMeters: Number(Math.max(...metrics.ring.map((point) => distanceMeters(metrics.centroid, point))).toFixed(1)),
    };
  }
}

const selectedSourceObjectId = `osm-${selected.type}:${selected.id}`;
const selectedDistance = officialPoint
  ? Number(distanceMeters(selected.coordinate, officialPoint).toFixed(1))
  : null;
const canPromoteAddress = officialCoordinates.length === 1
  && selectedDistance !== null
  && selectedDistance <= 150
  && (!geometry || geometry.officialAddressPointInside === true);
const candidate = canPromoteAddress ? {
  lat: officialPoint.lat,
  lon: officialPoint.lon,
  sourceProvider: 'official_address',
  sourceObjectId: officialPoint.sourceObjectId,
  sourceUrl: geonorgeUrl,
  objectType: 'institution_address_point',
} : null;
const displacementMeters = candidate
  ? Number(distanceMeters(currentCoordinate, candidate).toFixed(1))
  : null;

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_meteorological_institute_henrik_mohns_plass_1',
  coordinateDecision: canPromoteAddress
    ? 'promote_unique_official_address_point_supported_by_named_met_object'
    : 'preserve_all_official_points_continue_geometry_research',
  currentCoordinate,
  candidate,
  displacementMeters,
  officialAddress: {
    address: 'Henrik Mohns plass 1, 0371 Oslo',
    coordinateCount: officialCoordinates.length,
    coordinates: officialCoordinates,
    selectionDecision: officialCoordinates.length === 1
      ? 'unique_official_point'
      : 'multiple_official_points_preserved_not_arbitrarily_selected',
  },
  supportingOsmObject: {
    sourceObjectId: selectedSourceObjectId,
    sourceUrl: `https://www.openstreetmap.org/${selected.type}/${selected.id}`,
    coordinate: selected.coordinate,
    nearestAddressMeters: selectedDistance,
    score: selected.score,
    tags: selectedTags,
  },
  geometry,
  rejectedTransportObjects,
  sourceChecks: {
    officialMetIdentityAndAddress: true,
    official1866History: true,
    brregIdentityAndAddress: true,
    geonorgeExactAddressCoordinatesPreserved: true,
    namedNonTransportMetObjectFound: true,
    transportObjectsExcluded: true,
    fullPolygonValidatedWhenAvailable: geometry !== null,
    officialAddressPointInsideGeometryWhenAvailable: geometry ? geometry.officialAddressPointInside === true : null,
  },
  recommendation: {
    canBecomeVerified: canPromoteAddress,
    nextAction: canPromoteAddress
      ? `Apply ${candidate.sourceObjectId} as the canonical display marker, preserve MET and Brønnøysund identity, retain ${selectedSourceObjectId} as geometry/object support, synchronize aggregate/index copies and coordinate evidence, and keep protocol max batch at 195.`
      : 'Do not choose among official points arbitrarily. Continue bounded exact-building research while preserving MET and Brønnøysund identity and keeping protocol max batch at 195.',
    coordStatus: canPromoteAddress ? 'verified' : 'needs_source',
    coordType: canPromoteAddress ? 'address_point' : null,
    locatorType: 'building',
    suggestedRadiusMeters: 150,
  },
};

await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Meteorological Institute coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Meteorologisk institutt, organisation number ${orgNumber}**\n- Official address: **Henrik Mohns plass 1, 0371 Oslo**\n- Official address points: **${officialCoordinates.length}**\n- Selected OSM object: **${selectedSourceObjectId}**\n- Candidate: **${candidate ? `${candidate.lat}, ${candidate.lon}` : 'none'}**\n- Displacement: **${displacementMeters ?? 'not calculated'} m**\n- Geometry validated: **${geometry ? 'yes' : 'no'}**\n- Can become verified: **${canPromoteAddress ? 'yes' : 'no'}**\n- Batch 196 created: **no**\n\nThe Oslo headquarters identity is kept distinct from MET staff located in Forskningsparken. No canonical coordinate is changed in this research branch.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'meteorological_institute_coordinate_research_complete',
  reportDir: reportRel,
  officialAddressCoordinateCount: officialCoordinates.length,
  selectedOsmObject: selectedSourceObjectId,
  geometryValidated: geometry !== null,
  canBecomeVerified: canPromoteAddress,
  displacementMeters,
  protocolMaxBatch,
}, null, 2));
