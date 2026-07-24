import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-gamlebyen-skole-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/gamlebyen_skole.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchText = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json,text/html;q=0.9,*/*;q=0.8',
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
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
  const address = record?.beliggenhetsadresse ?? record?.forretningsadresse ?? record?.postadresse ?? {};
  return [...(address.adresse ?? []), address.postnummer, address.poststed].filter(Boolean).join(' ');
};
const objectCoordinate = (entry) => {
  const lat = Number(entry.lat ?? entry.center?.lat);
  const lon = Number(entry.lon ?? entry.center?.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
};
const osmSourceId = (entry) => `osm-${entry.type}:${entry.id}`;
const closeRing = (ring) => (ring.length > 0 && ring[0] !== ring.at(-1) ? [...ring, ring[0]] : ring);
const assembleRings = (segments) => {
  const remaining = segments.map((segment) => [...segment]);
  const rings = [];
  while (remaining.length > 0) {
    let ring = remaining.shift();
    let changed = true;
    while (changed && ring[0] !== ring.at(-1)) {
      changed = false;
      for (let index = 0; index < remaining.length; index += 1) {
        const segment = remaining[index];
        const first = ring[0];
        const last = ring.at(-1);
        const segFirst = segment[0];
        const segLast = segment.at(-1);
        if (last === segFirst) ring = [...ring, ...segment.slice(1)];
        else if (last === segLast) ring = [...ring, ...segment.slice(0, -1).reverse()];
        else if (first === segLast) ring = [...segment.slice(0, -1), ...ring];
        else if (first === segFirst) ring = [...segment.slice(1).reverse(), ...ring];
        else continue;
        remaining.splice(index, 1);
        changed = true;
        break;
      }
    }
    rings.push(closeRing(ring));
  }
  return rings;
};
const pointInRing = (point, nodeIds, nodes) => {
  const polygon = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
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
const ringMetrics = (nodeIds, nodes, referenceLat) => {
  const points = nodeIds.map((id) => nodes.get(id)).filter(Boolean);
  assert(points.length >= 4, 'Geometry ring has fewer than four resolved points.');
  const latScale = 111320;
  const lonScale = 111320 * Math.cos(referenceLat * Math.PI / 180);
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    const x1 = points[index].lon * lonScale;
    const y1 = points[index].lat * latScale;
    const x2 = points[index + 1].lon * lonScale;
    const y2 = points[index + 1].lat * latScale;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  assert(Math.abs(twiceArea) > 0.01, 'Geometry ring has zero area.');
  return {
    area: Math.abs(twiceArea / 2),
    centroid: {
      lat: (cy / (3 * twiceArea)) / latScale,
      lon: (cx / (3 * twiceArea)) / lonScale,
    },
  };
};
const geometryForObject = async (entry) => {
  if (!entry || entry.type === 'node') return null;
  const url = `https://api.openstreetmap.org/api/0.6/${entry.type}/${entry.id}/full.json`;
  const full = await fetchJson(url);
  const object = full.elements?.find((candidate) => candidate.type === entry.type && candidate.id === entry.id);
  assert(object, `OSM ${entry.type} ${entry.id} was not returned by full endpoint.`);
  const nodes = new Map((full.elements ?? [])
    .filter((candidate) => candidate.type === 'node')
    .map((candidate) => [candidate.id, { lat: Number(candidate.lat), lon: Number(candidate.lon) }]));
  const ways = new Map((full.elements ?? [])
    .filter((candidate) => candidate.type === 'way')
    .map((candidate) => [candidate.id, candidate.nodes ?? []]));
  const outerSegments = entry.type === 'way'
    ? [object.nodes ?? []]
    : (object.members ?? []).filter((member) => member.type === 'way' && member.role === 'outer').map((member) => ways.get(member.ref)).filter(Boolean);
  const innerSegments = entry.type === 'relation'
    ? (object.members ?? []).filter((member) => member.type === 'way' && member.role === 'inner').map((member) => ways.get(member.ref)).filter(Boolean)
    : [];
  assert(outerSegments.length > 0, 'Selected school object exposes no outer geometry.');
  const outerRings = assembleRings(outerSegments);
  const innerRings = assembleRings(innerSegments);
  assert(outerRings.every((ring) => ring.length >= 4 && ring[0] === ring.at(-1)), 'Could not assemble closed school outer rings.');
  const referenceLat = [...nodes.values()].reduce((sum, point) => sum + point.lat, 0) / nodes.size;
  const outerMetrics = outerRings.map((ring) => ringMetrics(ring, nodes, referenceLat));
  const innerMetrics = innerRings.map((ring) => ringMetrics(ring, nodes, referenceLat));
  const outerArea = outerMetrics.reduce((sum, metric) => sum + metric.area, 0);
  const innerArea = innerMetrics.reduce((sum, metric) => sum + metric.area, 0);
  const netArea = outerArea - innerArea;
  assert(netArea > 100, `Selected school geometry net area is unexpectedly small: ${netArea}.`);
  const centroid = {
    lat: (outerMetrics.reduce((sum, metric) => sum + metric.centroid.lat * metric.area, 0)
      - innerMetrics.reduce((sum, metric) => sum + metric.centroid.lat * metric.area, 0)) / netArea,
    lon: (outerMetrics.reduce((sum, metric) => sum + metric.centroid.lon * metric.area, 0)
      - innerMetrics.reduce((sum, metric) => sum + metric.centroid.lon * metric.area, 0)) / netArea,
  };
  const insideOuter = outerRings.some((ring) => pointInRing(centroid, ring, nodes));
  const insideInner = innerRings.some((ring) => pointInRing(centroid, ring, nodes));
  assert(insideOuter && !insideInner, 'Calculated school geometry centroid is not in usable site geometry.');
  const maximumVertexDistanceMeters = Math.max(...outerRings.flatMap((ring) => ring.map((id) => distanceMeters(centroid, nodes.get(id)))));
  return {
    full,
    url,
    centroid,
    outerRings,
    innerRings,
    nodes,
    areaSquareMeters: netArea,
    maximumVertexDistanceMeters,
  };
};

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'gamlebyen_skole', 'Unexpected place identity.');
assert(place.coordStatus == null, 'Gamlebyen skole already has a coordinate status; manual reconciliation required.');
assert(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)), 'Current Gamlebyen school marker is missing.');

const urls = {
  officialHome: 'https://gamlebyen.osloskolen.no/',
  officialProfile: 'https://gamlebyen.osloskolen.no/om-skolen/om-oss/var-profil/',
  officialHistory: 'https://gamlebyen.osloskolen.no/om-skolen/om-oss/skolens-historie/',
  brregSubunit: 'https://data.brreg.no/enhetsregisteret/api/underenheter/973626442',
  geonorge: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Egedes%20gate&nummer=3&kommunenummer=0301&treffPerSide=20',
};
const [officialHome, officialProfile, officialHistory, brregSubunit, geonorge] = await Promise.all([
  fetchText(urls.officialHome),
  fetchText(urls.officialProfile),
  fetchText(urls.officialHistory),
  fetchJson(urls.brregSubunit),
  fetchJson(urls.geonorge),
]);
const officialText = normalize(`${officialHome} ${officialProfile} ${officialHistory}`);
assert(officialText.includes('gamlebyen skole'), 'Official Osloskolen pages no longer identify Gamlebyen skole.');
assert(officialText.includes('egedes gate 3') && officialText.includes('0192 oslo'), 'Official Osloskolen pages no longer resolve the school to Egedes gate 3, 0192 Oslo.');
assert(officialText.includes('grunnlagt i 1881') || officialText.includes('1881'), 'Official school profile no longer supports the 1881 founding year.');
assert(brregSubunit.organisasjonsnummer === '973626442', 'Unexpected Gamlebyen school subunit identity.');
assert(normalize(brregSubunit.navn) === 'gamlebyen skole', 'Brønnøysund subunit no longer resolves to Gamlebyen skole.');
assert(normalize(addressText(brregSubunit)).includes('egedes gate 3 0192 oslo'), 'Brønnøysund no longer resolves Gamlebyen school to Egedes gate 3, 0192 Oslo.');

const exactRows = (geonorge.adresser ?? []).filter((entry) => normalize(entry.adressenavn ?? entry.adressetekst).includes('egedes gate')
  && Number(entry.nummer) === 3
  && String(entry.postnummer ?? '') === '0192'
  && String(entry.kommunenummer ?? entry.kommune?.kommunenummer ?? '') === '0301');
assert(exactRows.length > 0, 'Kartverket returned no exact Egedes gate 3, 0192 Oslo result.');
const coordinateGroups = new Map();
for (const entry of exactRows) {
  const lat = Number(entry.representasjonspunkt?.lat);
  const lon = Number(entry.representasjonspunkt?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const key = `${lat.toFixed(8)},${lon.toFixed(8)}`;
  if (!coordinateGroups.has(key)) coordinateGroups.set(key, []);
  coordinateGroups.get(key).push(entry);
}
assert(coordinateGroups.size > 0, 'Kartverket exact address rows expose no usable coordinates.');
const addressCoordinates = [...coordinateGroups.entries()].map(([key, rows]) => {
  const [lat, lon] = key.split(',').map(Number);
  const row = rows[0];
  const municipality = String(row.kommunenummer ?? row.kommune?.kommunenummer ?? '0301');
  const addressCode = String(row.adressekode ?? row.adressenavn?.adressekode ?? 'unknown');
  const addressNumber = `${row.nummer ?? 3}${row.bokstav ?? ''}`;
  return {
    lat,
    lon,
    sourceObjectId: `geonorge-adresser-v1:${municipality}:${addressCode}:${addressNumber}:${key}`,
    rowCount: rows.length,
    addressText: row.adressetekst ?? `Egedes gate ${addressNumber}`,
  };
});
const searchOrigin = addressCoordinates[0];
const overpassQuery = `[out:json][timeout:30];(nwr(around:500,${searchOrigin.lat},${searchOrigin.lon})["name"~"Gamlebyen skole",i];nwr(around:300,${searchOrigin.lat},${searchOrigin.lon})["amenity"="school"];nwr(around:300,${searchOrigin.lat},${searchOrigin.lon})["addr:street"~"Egedes gate",i]["addr:housenumber"~"^3"];) ;out center tags;`;
const overpass = await fetchJson('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString(),
});
const transportLike = (tags) => Boolean(tags.public_transport || tags.railway || tags.highway === 'bus_stop' || tags.station || tags.tram || tags.subway);
const rankedOsm = (overpass.elements ?? []).map((entry) => {
  const tags = entry.tags ?? {};
  const coordinate = objectCoordinate(entry);
  const nearestAddressMeters = coordinate ? Math.min(...addressCoordinates.map((address) => distanceMeters(address, coordinate))) : Infinity;
  const names = normalize(`${tags.name ?? ''} ${tags['name:no'] ?? ''} ${tags['name:en'] ?? ''}`);
  const address = normalize(`${tags['addr:street'] ?? ''} ${tags['addr:housenumber'] ?? ''} ${tags['addr:postcode'] ?? ''}`);
  const website = normalize(`${tags.website ?? ''} ${tags['contact:website'] ?? ''}`);
  const orgRef = String(tags['ref:NO:orgnr'] ?? tags.ref ?? '');
  let score = 0;
  if (names.includes('gamlebyen skole')) score += 100;
  if (tags.amenity === 'school') score += 55;
  if (tags.building === 'school') score += 35;
  else if (tags.building && tags.building !== 'no') score += 15;
  if (address.includes('egedes gate 3')) score += 45;
  if (website.includes('gamlebyen osloskolen no')) score += 60;
  if (orgRef.includes('973626442')) score += 80;
  if (nearestAddressMeters <= 30) score += 30;
  else if (nearestAddressMeters <= 75) score += 20;
  else if (nearestAddressMeters <= 150) score += 10;
  if (transportLike(tags)) score -= 250;
  return {
    entry,
    tags,
    coordinate,
    nearestAddressMeters: Number.isFinite(nearestAddressMeters) ? Number(nearestAddressMeters.toFixed(1)) : null,
    score,
    excludedAsTransport: transportLike(tags),
  };
}).sort((a, b) => b.score - a.score || (a.nearestAddressMeters ?? Infinity) - (b.nearestAddressMeters ?? Infinity));
const selectedOsm = rankedOsm.find((candidate) => !candidate.excludedAsTransport && candidate.coordinate && candidate.score >= 85) ?? null;
assert(selectedOsm, 'No sufficiently identified non-transport OSM school object was found near Egedes gate 3.');
assert(selectedOsm.nearestAddressMeters < 180, `Selected school object is ${selectedOsm.nearestAddressMeters} m from all official address points.`);

const selectedGeometry = await geometryForObject(selectedOsm.entry);
const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
let candidate;
let coordinateDecision;
let coordStatus;
let coordType;
let geometrySummary = null;
if (addressCoordinates.length === 1) {
  const officialPoint = addressCoordinates[0];
  const addressInsideGeometry = selectedGeometry
    ? selectedGeometry.outerRings.some((ring) => pointInRing(officialPoint, ring, selectedGeometry.nodes))
      && !selectedGeometry.innerRings.some((ring) => pointInRing(officialPoint, ring, selectedGeometry.nodes))
    : null;
  assert(selectedGeometry == null || addressInsideGeometry, 'The unique official address point is outside the selected school geometry.');
  candidate = {
    lat: officialPoint.lat,
    lon: officialPoint.lon,
    sourceProvider: 'official_address',
    sourceObjectId: officialPoint.sourceObjectId,
    sourceUrl: urls.geonorge,
    objectType: 'school_address_point',
  };
  coordinateDecision = distanceMeters(currentCoordinate, candidate) <= 3
    ? 'verify_existing_at_official_school_address_point'
    : 'promote_official_school_address_point';
  coordStatus = 'verified';
  coordType = 'address_point';
  if (selectedGeometry) {
    geometrySummary = {
      sourceObjectId: osmSourceId(selectedOsm.entry),
      sourceUrl: `https://www.openstreetmap.org/${selectedOsm.entry.type}/${selectedOsm.entry.id}`,
      objectType: selectedOsm.entry.type,
      tags: selectedOsm.tags,
      outerRingCount: selectedGeometry.outerRings.length,
      innerRingCount: selectedGeometry.innerRings.length,
      areaSquareMeters: Number(selectedGeometry.areaSquareMeters.toFixed(1)),
      centroid: {
        lat: Number(selectedGeometry.centroid.lat.toFixed(8)),
        lon: Number(selectedGeometry.centroid.lon.toFixed(8)),
      },
      maximumVertexDistanceMeters: Number(selectedGeometry.maximumVertexDistanceMeters.toFixed(1)),
      officialAddressPointInside: true,
      addressToGeometryCentroidMeters: Number(distanceMeters(officialPoint, selectedGeometry.centroid).toFixed(1)),
    };
  }
} else {
  assert(selectedGeometry, 'Multiple official address points require named school geometry.');
  candidate = {
    lat: Number(selectedGeometry.centroid.lat.toFixed(8)),
    lon: Number(selectedGeometry.centroid.lon.toFixed(8)),
    sourceProvider: 'osm',
    sourceObjectId: osmSourceId(selectedOsm.entry),
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.entry.type}/${selectedOsm.entry.id}`,
    objectType: 'school_site_geometry_centroid',
  };
  coordinateDecision = distanceMeters(currentCoordinate, candidate) <= 3
    ? 'verify_existing_at_named_school_geometry_centroid'
    : 'promote_named_school_geometry_centroid';
  coordStatus = 'verified_geometry';
  coordType = 'campus_center';
  geometrySummary = {
    sourceObjectId: candidate.sourceObjectId,
    sourceUrl: candidate.sourceUrl,
    objectType: selectedOsm.entry.type,
    tags: selectedOsm.tags,
    outerRingCount: selectedGeometry.outerRings.length,
    innerRingCount: selectedGeometry.innerRings.length,
    areaSquareMeters: Number(selectedGeometry.areaSquareMeters.toFixed(1)),
    centroid: { lat: candidate.lat, lon: candidate.lon },
    maximumVertexDistanceMeters: Number(selectedGeometry.maximumVertexDistanceMeters.toFixed(1)),
    distancesToOfficialAddressPointsMeters: addressCoordinates.map((address) => Number(distanceMeters(address, candidate).toFixed(1))),
  };
}
const displacementMeters = Number(distanceMeters(currentCoordinate, candidate).toFixed(1));
const suggestedRadiusMeters = geometrySummary
  ? Math.max(Number(place.r), Math.ceil(Number(geometrySummary.maximumVertexDistanceMeters) / 10) * 10)
  : Number(place.r);

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_gamlebyen_school_egedes_gate_3',
  coordinateDecision,
  currentCoordinate,
  candidate,
  displacementMeters,
  officialAddress: {
    address: 'Egedes gate 3, 0192 Oslo',
    coordinateCount: addressCoordinates.length,
    coordinates: addressCoordinates,
    selectionDecision: addressCoordinates.length === 1
      ? 'unique_official_point_supported_by_school_identity_and_geometry'
      : 'multiple_official_points_resolved_by_named_school_geometry',
  },
  supportingOsmObject: {
    sourceObjectId: osmSourceId(selectedOsm.entry),
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.entry.type}/${selectedOsm.entry.id}`,
    coordinate: selectedOsm.coordinate,
    nearestAddressMeters: selectedOsm.nearestAddressMeters,
    score: selectedOsm.score,
    tags: selectedOsm.tags,
  },
  geometry: geometrySummary,
  historyReview: {
    canonicalYear: Number(place.year),
    officialFoundingYear: 1881,
    mismatch: Number(place.year) !== 1881,
    coordinateResearchChangedYear: false,
    nextAction: Number(place.year) !== 1881
      ? 'Review canonical year separately; the official school profile states that Gamlebyen school was founded in 1881.'
      : null,
  },
  sourceChecks: {
    officialSchoolIdentityAndAddress: true,
    official1881FoundingYear: true,
    brregSubunitIdentityAndAddress: true,
    geonorgeExactAddressCoordinatesPreserved: true,
    namedNonTransportSchoolObjectFound: true,
    transportObjectsExcluded: true,
    geometryValidatedWhenRequired: addressCoordinates.length === 1 ? selectedGeometry != null : true,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: `${coordinateDecision.startsWith('promote') ? 'Apply' : 'Keep'} ${candidate.sourceObjectId} as the canonical display marker, preserve official Osloskolen and Brønnøysund identity, retain all Kartverket address evidence, ${geometrySummary ? `retain ${geometrySummary.sourceObjectId} as school geometry support, ` : ''}add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195. Review the canonical 1799 year separately against the official 1881 founding year.`,
    coordStatus,
    coordType,
    locatorType: 'building',
    suggestedRadiusMeters,
  },
};

await fs.writeFile(path.join(reportDir, 'official-home.html'), officialHome, 'utf8');
await fs.writeFile(path.join(reportDir, 'official-profile.html'), officialProfile, 'utf8');
await fs.writeFile(path.join(reportDir, 'official-history.html'), officialHistory, 'utf8');
await fs.writeFile(path.join(reportDir, 'brreg-subunit-973626442.json'), `${JSON.stringify(brregSubunit, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'geonorge-egedes-gate-3.json'), `${JSON.stringify(geonorge, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'overpass-gamlebyen-school.json'), `${JSON.stringify(overpass, null, 2)}\n`, 'utf8');
if (selectedGeometry) await fs.writeFile(path.join(reportDir, `osm-${selectedOsm.entry.type}-${selectedOsm.entry.id}-full.json`), `${JSON.stringify(selectedGeometry.full, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Gamlebyen school coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Gamlebyen school, Egedes gate 3, subunit 973626442**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Candidate: **${candidate.lat}, ${candidate.lon}**\n- Candidate source: **${candidate.sourceObjectId}**\n- Displacement: **${displacementMeters} m**\n- Official address coordinate count: **${addressCoordinates.length}**\n- Supporting OSM object: **${summary.supportingOsmObject.sourceObjectId}**\n- Suggested radius: **${suggestedRadiusMeters} m**\n- Coordinate recommendation: **${coordinateDecision}**\n- Canonical year: **${place.year}**\n- Official school founding year: **1881**\n- Year changed in this research: **no**\n\nThe coordinate recommendation is grounded in the official school address, Brønnøysund operating-unit identity, Kartverket address data and a non-transport OSM school object. The historical year discrepancy is recorded for separate content review. No batch 196 is created.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'gamlebyen_school_research_complete',
  reportDir: reportRel,
  displacementMeters,
  candidateSource: candidate.sourceObjectId,
  supportingOsmObject: summary.supportingOsmObject.sourceObjectId,
  recommendation: coordinateDecision,
  historyYearMismatch: summary.historyReview.mismatch,
}, null, 2));
