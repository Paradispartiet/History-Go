import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-forskningsparken-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/forskningsparken.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
      accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
      ...(options.headers ?? {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url, options = {}) => JSON.parse(await fetchText(url, options));
const normalize = (value) => String(value ?? '')
  .toLowerCase()
  .replaceAll('æ', 'ae')
  .replaceAll('ø', 'o')
  .replaceAll('å', 'a')
  .replaceAll('é', 'e')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const distanceMeters = (a, b) => {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const addressText = (record) => {
  const address = record?.forretningsadresse ?? record?.beliggenhetsadresse ?? record?.postadresse ?? {};
  return [...(address.adresse ?? []), address.postnummer, address.poststed].filter(Boolean).join(' ');
};
const objectCoordinate = (entry) => {
  const lat = Number(entry.lat ?? entry.center?.lat);
  const lon = Number(entry.lon ?? entry.center?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
};
const osmSourceId = (entry) => `osm-${entry.type}:${entry.id}`;
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
const polygonCentroid = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon
    ? points
    : [...points, points[0]];
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const x1 = ring[i].lon;
    const y1 = ring[i].lat;
    const x2 = ring[i + 1].lon;
    const y2 = ring[i + 1].lat;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    return {
      lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
      lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length,
    };
  }
  return { lat: cy / (3 * twiceArea), lon: cx / (3 * twiceArea) };
};

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'forskningsparken', 'Unexpected place identity.');
assert(place.coordStatus == null, 'Forskningsparken already has a coordinate status; manual reconciliation required.');
assert(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)), 'Current Forskningsparken marker is missing.');

const urls = {
  officialAbout: 'https://www.forskningsparken.no/about',
  officialContact: 'https://www.forskningsparken.no/about/kontakt',
  officialHistory: 'https://www.forskningsparken.no/about/history',
  brregMain: 'https://data.brreg.no/enhetsregisteret/api/enheter/937268815',
  brregSubunit: 'https://data.brreg.no/enhetsregisteret/api/underenheter/974166194',
  geonorge: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Gaustadall%C3%A9en&nummer=21&kommunenummer=0301&treffPerSide=20',
};

const [officialAbout, officialContact, officialHistory, brregMain, brregSubunit, geonorge] = await Promise.all([
  fetchText(urls.officialAbout),
  fetchText(urls.officialContact),
  fetchText(urls.officialHistory),
  fetchJson(urls.brregMain),
  fetchJson(urls.brregSubunit),
  fetchJson(urls.geonorge),
]);

const officialText = normalize(`${officialAbout} ${officialContact} ${officialHistory}`);
assert(officialText.includes('forskningsparken'), 'Official pages no longer identify Forskningsparken.');
assert(officialText.includes('gaustadalleen 21') && officialText.includes('0349 oslo'), 'Official pages no longer resolve Forskningsparken to Gaustadalléen 21, 0349 Oslo.');
assert(officialText.includes('937 268 815') || officialText.includes('937268815'), 'Official pages no longer expose Oslotech organisation number 937268815.');
assert(officialText.includes('1989'), 'Official history no longer supports opening in 1989.');
assert(brregMain.organisasjonsnummer === '937268815' && normalize(brregMain.navn) === 'oslotech as', 'Unexpected Oslotech main-unit identity.');
assert(normalize(addressText(brregMain)).includes('gaustadalleen 21 0349 oslo'), 'Oslotech main unit no longer resolves to Gaustadalléen 21, 0349 Oslo.');
assert(brregSubunit.organisasjonsnummer === '974166194', 'Unexpected Oslotech operating-unit identity.');
assert(normalize(addressText(brregSubunit)).includes('gaustadalleen 21 0349 oslo'), 'Oslotech operating unit no longer resolves to Gaustadalléen 21, 0349 Oslo.');

const exactRows = (geonorge.adresser ?? []).filter((entry) => normalize(entry.adressenavn ?? entry.adressetekst).includes('gaustadalleen')
  && Number(entry.nummer) === 21
  && String(entry.postnummer ?? '') === '0349'
  && String(entry.kommunenummer ?? entry.kommune?.kommunenummer ?? '') === '0301');
assert(exactRows.length > 0, 'Kartverket returned no exact Gaustadalléen 21, 0349 Oslo result.');
const coordinateGroups = new Map();
for (const entry of exactRows) {
  const lat = Number(entry.representasjonspunkt?.lat);
  const lon = Number(entry.representasjonspunkt?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const key = `${lat.toFixed(8)},${lon.toFixed(8)}`;
  if (!coordinateGroups.has(key)) coordinateGroups.set(key, []);
  coordinateGroups.get(key).push(entry);
}
assert(coordinateGroups.size > 0, 'Kartverket exact rows contain no coordinates.');
const officialAddressPoints = [...coordinateGroups.entries()].map(([key, rows]) => {
  const [lat, lon] = key.split(',').map(Number);
  const row = rows[0];
  return {
    lat,
    lon,
    sourceObjectId: `geonorge-adresser-v1:${String(row.kommunenummer ?? row.kommune?.kommunenummer ?? '0301')}:${String(row.adressekode ?? row.adressenavn?.adressekode ?? 'unknown')}:${row.nummer ?? 21}${row.bokstav ?? ''}:${key}`,
    rowCount: rows.length,
    rows,
  };
});
const addressAnchor = {
  lat: officialAddressPoints.reduce((sum, point) => sum + point.lat, 0) / officialAddressPoints.length,
  lon: officialAddressPoints.reduce((sum, point) => sum + point.lon, 0) / officialAddressPoints.length,
};

const overpassQuery = `[out:json][timeout:30];(nwr(around:400,${addressAnchor.lat},${addressAnchor.lon})["name"~"Forskningsparken|Oslo Science Park",i];);out center tags;`;
const overpass = await fetchJson('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString(),
});
const transportLike = (tags) => Boolean(tags.public_transport || tags.railway || tags.highway === 'bus_stop' || tags.amenity === 'bus_station' || tags.station || tags.tram || tags.subway);
const rankedOsm = (overpass.elements ?? []).map((entry) => {
  const tags = entry.tags ?? {};
  const coordinate = objectCoordinate(entry);
  const distance = coordinate ? distanceMeters(addressAnchor, coordinate) : Infinity;
  const names = normalize(`${tags.name ?? ''} ${tags['name:no'] ?? ''} ${tags['name:en'] ?? ''}`);
  const website = normalize(`${tags.website ?? ''} ${tags['contact:website'] ?? ''}`);
  const address = normalize(`${tags['addr:street'] ?? ''} ${tags['addr:housenumber'] ?? ''} ${tags['addr:postcode'] ?? ''}`);
  let score = 0;
  if (names.includes('forskningsparken')) score += 70;
  if (names.includes('oslo science park')) score += 55;
  if (website.includes('forskningsparken no') || website.includes('oslotech no')) score += 70;
  if (address.includes('gaustadalleen 21')) score += 40;
  if (entry.type === 'way') score += 20;
  if (tags.building && tags.building !== 'no') score += 25;
  if (tags.office || tags.landuse === 'commercial' || tags.amenity === 'research_institute') score += 15;
  if (distance <= 100) score += 25;
  else if (distance <= 200) score += 10;
  if (transportLike(tags)) score -= 300;
  return { entry, tags, coordinate, distanceMeters: Number.isFinite(distance) ? Number(distance.toFixed(1)) : null, score, excludedAsTransport: transportLike(tags) };
}).sort((a, b) => b.score - a.score || (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
const selectedOsm = rankedOsm.find((candidate) => !candidate.excludedAsTransport && candidate.entry.type === 'way' && candidate.coordinate && candidate.score >= 90) ?? null;

let geometry = null;
let candidate = null;
if (selectedOsm) {
  const full = await fetchJson(`https://api.openstreetmap.org/api/0.6/way/${selectedOsm.entry.id}/full.json`);
  const way = full.elements?.find((entry) => entry.type === 'way' && entry.id === selectedOsm.entry.id);
  const nodes = new Map((full.elements ?? []).filter((entry) => entry.type === 'node').map((entry) => [entry.id, entry]));
  const polygon = (way?.nodes ?? []).map((id) => nodes.get(id)).filter(Boolean).map((node) => ({ lat: Number(node.lat), lon: Number(node.lon) }));
  assert(polygon.length >= 4, 'Selected Forskningsparken OSM way has incomplete geometry.');
  const centroid = polygonCentroid(polygon);
  assert(pointInPolygon(centroid, polygon), 'Calculated Forskningsparken centroid falls outside the selected building geometry.');
  const officialPointDistances = officialAddressPoints.map((point) => ({
    ...point,
    distanceToGeometryCenterMeters: Number(distanceMeters(point, centroid).toFixed(1)),
    insideGeometry: pointInPolygon(point, polygon),
  })).sort((a, b) => a.distanceToGeometryCenterMeters - b.distanceToGeometryCenterMeters);
  geometry = {
    sourceObjectId: osmSourceId(selectedOsm.entry),
    sourceUrl: `https://www.openstreetmap.org/way/${selectedOsm.entry.id}`,
    polygonNodeCount: polygon.length,
    centroid: { lat: Number(centroid.lat.toFixed(8)), lon: Number(centroid.lon.toFixed(8)) },
    officialAddressPoints: officialPointDistances,
    maximumVertexDistanceMeters: Number(Math.max(...polygon.map((point) => distanceMeters(centroid, point))).toFixed(1)),
    tags: selectedOsm.tags,
    raw: full,
  };
  candidate = {
    ...geometry.centroid,
    sourceProvider: 'osm',
    sourceObjectId: geometry.sourceObjectId,
    sourceUrl: geometry.sourceUrl,
    objectType: 'named_science_park_building_geometry_centroid',
  };
}

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const displacementMeters = candidate ? distanceMeters(currentCoordinate, candidate) : null;
const coordinateDecision = candidate
  ? (displacementMeters <= 3 ? 'verify_existing_at_named_building_centroid' : 'promote_named_science_park_building_centroid')
  : 'multiple_official_address_points_need_named_geometry';

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_oslo_science_park_gaustadalleen_21',
  coordinateDecision,
  currentCoordinate,
  candidate,
  displacementMeters: displacementMeters == null ? null : Number(displacementMeters.toFixed(1)),
  officialAddress: {
    address: 'Gaustadalléen 21, 0349 Oslo',
    coordinateCount: officialAddressPoints.length,
    coordinates: officialAddressPoints.map(({ rows, ...point }) => point),
    selectionDecision: officialAddressPoints.length === 1 ? 'single_official_point' : 'multiple_official_points_preserved_not_arbitrarily_selected',
  },
  supportingGeometry: geometry ? (({ raw, ...rest }) => rest)(geometry) : null,
  rejectedTransportObjects: rankedOsm.filter((item) => item.excludedAsTransport).map((item) => ({
    sourceObjectId: osmSourceId(item.entry),
    name: item.tags.name ?? null,
    reason: 'transport_object_not_science_park_building',
    distanceMeters: item.distanceMeters,
  })),
  sourceChecks: {
    officialAddressAndOrganisationNumber: true,
    official1989History: true,
    brregMainUnitIdentityAndAddress: true,
    brregOperatingUnitIdentityAndAddress: true,
    geonorgeExactAddressPointsPreserved: true,
    transportObjectsExcluded: true,
    namedNonTransportBuildingGeometryFound: Boolean(geometry),
  },
  recommendation: {
    canBecomeVerified: Boolean(candidate),
    nextAction: candidate
      ? `Apply the semantic building centre derived from ${candidate.sourceObjectId}, preserve both official Kartverket address points without arbitrarily selecting one, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.`
      : 'Do not promote either official address point arbitrarily. Continue bounded building-geometry research while preserving the official address identity and keeping protocol max batch at 195.',
    coordStatus: candidate ? 'verified_geometry' : 'needs_source',
    coordType: candidate ? 'building_center' : null,
    locatorType: 'building',
    suggestedRadiusMeters: geometry ? Math.max(Number(place.r), Math.ceil(geometry.maximumVertexDistanceMeters / 10) * 10) : Number(place.r),
  },
};

await fs.writeFile(path.join(reportDir, 'forskningsparken-about.html'), officialAbout);
await fs.writeFile(path.join(reportDir, 'forskningsparken-contact.html'), officialContact);
await fs.writeFile(path.join(reportDir, 'forskningsparken-history.html'), officialHistory);
await fs.writeFile(path.join(reportDir, 'brreg-main-937268815.json'), `${JSON.stringify(brregMain, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'brreg-subunit-974166194.json'), `${JSON.stringify(brregSubunit, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'geonorge-gaustadalleen-21.json'), `${JSON.stringify(geonorge, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'overpass-forskningsparken.json'), `${JSON.stringify(overpass, null, 2)}\n`);
if (geometry?.raw) await fs.writeFile(path.join(reportDir, `${geometry.sourceObjectId.replace(':', '-')}-full.json`), `${JSON.stringify(geometry.raw, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Forskningsparken coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Forskningsparken / Oslo Science Park, Gaustadalléen 21**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Official Kartverket address points: **${officialAddressPoints.length}**\n- Named non-transport building geometry: **${geometry?.sourceObjectId ?? 'not found'}**\n- Candidate semantic building centre: **${candidate ? `${candidate.lat}, ${candidate.lon}` : 'none'}**\n- Displacement: **${summary.displacementMeters ?? 'not calculated'} m**\n- Rejected same-name transport objects: **${summary.rejectedTransportObjects.length}**\n- Recommendation: **${coordinateDecision}**\n\nBoth official address points are preserved instead of choosing one arbitrarily. A canonical promotion is recommended only when a named non-transport science-park building geometry can supply a reproducible semantic centre. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'forskningsparken_research_complete',
  reportDir: reportRel,
  officialAddressPointCount: officialAddressPoints.length,
  supportingGeometry: geometry?.sourceObjectId ?? null,
  displacementMeters: summary.displacementMeters,
  rejectedTransportObjects: summary.rejectedTransportObjects.length,
  recommendation: coordinateDecision,
}, null, 2));
