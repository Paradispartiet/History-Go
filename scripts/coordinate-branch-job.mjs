import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-observatoriet-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/observatoriet.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const assert = (value, message) => { if (!value) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const fetchText = async (url, accept = 'text/html') => {
  const response = await fetch(url, {
    headers: {
      accept,
      'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
      'user-agent': 'History-Go coordinate research/1.0',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url) => {
  const urls = url.includes('overpass-api.de/api/interpreter')
    ? [url, url.replace('https://overpass-api.de', 'https://overpass.kumi.systems')]
    : [url];
  let lastError = null;
  for (const candidateUrl of urls) {
    const attempts = urls.length > 1 ? 3 : 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return JSON.parse(await fetchText(candidateUrl, 'application/json'));
      } catch (error) {
        lastError = error;
        if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
  }
  throw lastError;
};
const normalize = (value) => String(value ?? '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&aring;|&#229;/gi, 'å')
  .replace(/&oslash;|&#248;/gi, 'ø')
  .replace(/&aelig;|&#230;/gi, 'æ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[’']/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const distanceMeters = (a, b) => {
  const rad = (value) => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const pointInPolygon = (point, ring) => {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const a = ring[index];
    const b = ring[previous];
    if (((a.lat > point.lat) !== (b.lat > point.lat))
      && point.lon < ((b.lon - a.lon) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
  }
  return inside;
};
const polygonMetrics = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon
    ? points
    : [...points, points[0]];
  const referenceLat = ring.reduce((sum, point) => sum + point.lat, 0) / ring.length;
  const latScale = 111320;
  const lonScale = latScale * Math.cos(referenceLat * Math.PI / 180);
  let twiceArea = 0;
  let centroidX = 0;
  let centroidY = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const x1 = ring[index].lon * lonScale;
    const y1 = ring[index].lat * latScale;
    const x2 = ring[index + 1].lon * lonScale;
    const y2 = ring[index + 1].lat * latScale;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    centroidX += (x1 + x2) * cross;
    centroidY += (y1 + y2) * cross;
  }
  assert(Math.abs(twiceArea) > 0.01, 'Observatory polygon has zero area.');
  return {
    ring,
    areaSquareMeters: Math.abs(twiceArea / 2),
    centroid: {
      lat: (centroidY / (3 * twiceArea)) / latScale,
      lon: (centroidX / (3 * twiceArea)) / lonScale,
    },
  };
};

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; research must remain post-195.');
const place = await readJson(placeRel);
assert(place.id === 'observatoriet' && place.year === 1833, 'Unexpected canonical Observatoriet record.');
const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };

const byleksikonUrl = 'https://oslobyleksikon.no/side/Observatoriet';
const snlUrl = 'https://snl.no/Universitetsobservatoriet';
const nbUrl = 'https://www.nb.no/skole/omvisninger/dobbeltomvisning-nasjonalbiblioteket-observatoriet/';
const addressUrl = 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Observatoriegata&nummer=1&kommunenummer=0301&treffPerSide=20';
const [byleksikonHtml, snlHtml, nbHtml, addressResponse] = await Promise.all([
  fetchText(byleksikonUrl),
  fetchText(snlUrl),
  fetchText(nbUrl),
  fetchJson(addressUrl),
]);
await fs.writeFile(path.join(reportDir, 'oslo-byleksikon-observatoriet.html'), byleksikonHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'snl-universitetsobservatoriet.html'), snlHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'nb-observatoriet-omvisning.html'), nbHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'geonorge-observatoriegata-1.json'), `${JSON.stringify(addressResponse, null, 2)}\n`, 'utf8');
const byleksikonText = normalize(byleksikonHtml);
const snlText = normalize(snlHtml);
const nbText = normalize(nbHtml);
assert(byleksikonText.includes('observatoriegata 1'), 'Oslo byleksikon no longer shows Observatoriegata 1.');
assert(byleksikonText.includes('1831 33') || byleksikonText.includes('1831 1833'), 'Oslo byleksikon no longer supports construction 1831–33.');
assert(byleksikonText.includes('astronomiske observatorium'), 'Oslo byleksikon identity mismatch.');
assert(snlText.includes('universitetsobservatoriet'), 'SNL identity mismatch.');
assert(snlText.includes('1833'), 'SNL no longer supports the 1833 history.');
assert(nbText.includes('observatoriet'), 'Nasjonalbiblioteket no longer documents current Observatoriet formidling.');

const officialCoordinates = [];
for (const row of (addressResponse.adresser ?? []).filter((entry) => normalize(entry.adressetekst) === 'observatoriegata 1')) {
  const point = row.representasjonspunkt ?? {};
  const lat = Number(point.lat);
  const lon = Number(point.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  if (officialCoordinates.some((candidate) => Math.abs(candidate.lat - lat) < 1e-9 && Math.abs(candidate.lon - lon) < 1e-9)) continue;
  officialCoordinates.push({
    lat,
    lon,
    rowCount: 1,
    addressText: row.adressetekst,
    sourceObjectId: `geonorge-adresser-v1:0301:${row.adressekode ?? 'observatoriegata'}:${row.nummer ?? 1}${row.bokstav ?? ''}:${lat.toFixed(8)},${lon.toFixed(8)}`,
  });
}
assert(officialCoordinates.length === 1, `Expected one exact Kartverket point, got ${officialCoordinates.length}.`);
const officialPoint = officialCoordinates[0];

const overpassQuery = `[out:json][timeout:60];(way(around:350,${officialPoint.lat},${officialPoint.lon})[building];nwr(around:350,${officialPoint.lat},${officialPoint.lon})["name"~"Observatoriet|University Observatory|Universitetsobservatoriet",i];nwr(around:350,${officialPoint.lat},${officialPoint.lon})["addr:street"="Observatoriegata"]["addr:housenumber"="1"];);out center tags geom;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const overpass = await fetchJson(overpassUrl);
await fs.writeFile(path.join(reportDir, 'overpass-observatoriet.json'), `${JSON.stringify(overpass, null, 2)}\n`, 'utf8');

const buildings = [];
for (const element of overpass.elements ?? []) {
  if (element.type !== 'way' || !Array.isArray(element.geometry) || element.geometry.length < 4) continue;
  const tags = element.tags ?? {};
  const identityText = normalize([tags.name, tags['name:en'], tags.alt_name, tags.description].join(' '));
  const polygon = element.geometry.map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
  const metrics = polygonMetrics(polygon);
  const containsAddress = pointInPolygon(officialPoint, metrics.ring);
  const namedObservatory = identityText === 'observatoriet'
    || identityText.includes('universitetsobservatoriet')
    || identityText.includes('university observatory');
  buildings.push({
    sourceObjectId: `osm-way:${element.id}`,
    sourceUrl: `https://www.openstreetmap.org/way/${element.id}`,
    tags,
    containsAddress,
    namedObservatory,
    polygonNodeCount: polygon.length,
    areaSquareMeters: Number(metrics.areaSquareMeters.toFixed(1)),
    centroid: {
      lat: Number(metrics.centroid.lat.toFixed(8)),
      lon: Number(metrics.centroid.lon.toFixed(8)),
    },
    addressToCentroidMeters: Number(distanceMeters(officialPoint, metrics.centroid).toFixed(1)),
    maximumVertexDistanceMeters: Number(Math.max(...metrics.ring.map((point) => distanceMeters(metrics.centroid, point))).toFixed(1)),
  });
}
buildings.sort((a, b) => Number(b.namedObservatory) - Number(a.namedObservatory)
  || Number(b.containsAddress) - Number(a.containsAddress)
  || a.addressToCentroidMeters - b.addressToCentroidMeters);
const supportingBuilding = buildings.find((building) => building.namedObservatory && building.containsAddress)
  ?? buildings.find((building) => building.containsAddress)
  ?? null;
assert(supportingBuilding, 'Official address point is outside all nearby building polygons.');
const namedObject = (overpass.elements ?? []).find((element) => {
  const text = normalize([element.tags?.name, element.tags?.['name:en'], element.tags?.alt_name].join(' '));
  return text === 'observatoriet'
    || text.includes('universitetsobservatoriet')
    || text.includes('university observatory');
}) ?? null;
assert(namedObject, 'No named University Observatory object found.');
const namedCoordinate = Number.isFinite(Number(namedObject.lat))
  ? { lat: Number(namedObject.lat), lon: Number(namedObject.lon) }
  : { lat: Number(namedObject.center?.lat), lon: Number(namedObject.center?.lon) };
assert(Number.isFinite(namedCoordinate.lat) && Number.isFinite(namedCoordinate.lon), 'Named observatory object lacks coordinates.');
const addressToNamedObjectMeters = Number(distanceMeters(officialPoint, namedCoordinate).toFixed(1));
assert(supportingBuilding.namedObservatory || addressToNamedObjectMeters <= 100,
  'Address point lacks strong named Observatoriet building context.');
const displacementMeters = Number(distanceMeters(currentCoordinate, officialPoint).toFixed(1));

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_university_observatory_observatoriegata_1',
  historyDecision: 'constructed_1831_1833_taken_into_use_1833_canonical_year_preserved',
  coordinateDecision: 'promote_unique_official_address_point_supported_by_observatory_building_context',
  currentCoordinate,
  candidate: {
    lat: officialPoint.lat,
    lon: officialPoint.lon,
    sourceProvider: 'official_address',
    sourceObjectId: officialPoint.sourceObjectId,
    sourceUrl: addressUrl,
    objectType: 'observatory_address_point',
  },
  displacementMeters,
  officialAddress: {
    address: 'Observatoriegata 1, 0254 Oslo',
    coordinateCount: 1,
    coordinates: officialCoordinates,
    selectionDecision: 'unique_official_point',
  },
  supportingBuilding,
  supportingOsmObject: {
    sourceObjectId: `osm-${namedObject.type}:${namedObject.id}`,
    sourceUrl: `https://www.openstreetmap.org/${namedObject.type}/${namedObject.id}`,
    coordinate: namedCoordinate,
    nearestAddressMeters: addressToNamedObjectMeters,
    tags: namedObject.tags ?? {},
  },
  sourceChecks: {
    osloByleksikonIdentityAddressAndHistory: true,
    snlUniversityObservatoryIdentityAndHistory: true,
    currentPublicInterpretationDocumented: true,
    geonorgeUniqueAddressPoint: true,
    addressInsideBuildingGeometry: true,
    namedObservatoryContextFound: true,
    holmenkollenFolkObservatoryExcludedByBoundedScope: true,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: `Apply ${officialPoint.sourceObjectId} as canonical display marker, retain ${supportingBuilding.sourceObjectId} and the named observatory object as support, preserve canonical year 1833, synchronize evidence/index and keep protocol max at 195.`,
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'building',
    suggestedRadiusMeters: Math.max(160, Math.ceil(supportingBuilding.maximumVertexDistanceMeters / 10) * 10),
  },
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# University Observatory coordinate research\n\n- Canonical changed: **no**\n- Official point: **${officialPoint.lat}, ${officialPoint.lon}**\n- Address-containing building: **${supportingBuilding.sourceObjectId}**\n- Named observatory object: **osm-${namedObject.type}:${namedObject.id}**\n- Address-to-named-object distance: **${addressToNamedObjectMeters} m**\n- Displacement: **${displacementMeters} m**\n- Canonical year 1833 preserved: **yes**\n- Protocol max batch: **${protocolMaxBatch}**\n`, 'utf8');
console.log(JSON.stringify({
  status: 'observatoriet_coordinate_research_complete',
  officialPoint: { lat: officialPoint.lat, lon: officialPoint.lon },
  supportingBuilding: supportingBuilding.sourceObjectId,
  namedObject: `osm-${namedObject.type}:${namedObject.id}`,
  displacementMeters,
  protocolMaxBatch,
}, null, 2));
