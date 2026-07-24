import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-oslomet-pilestredet-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/oslo_met_pilestredet.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const mainOrg = '997058925';
const campusSubunit = '974647648';
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
  const candidates = url.includes('overpass-api.de/api/interpreter')
    ? [url, url.replace('https://overpass-api.de', 'https://overpass.kumi.systems')]
    : [url];
  let lastError = null;
  for (const candidate of candidates) {
    const attempts = candidates.length > 1 ? 3 : 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return JSON.parse(await fetchText(candidate, 'application/json'));
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
  assert(Math.abs(twiceArea) > 0.01, 'Campus building polygon has zero area.');
  return {
    ring,
    areaSquareMeters: Math.abs(twiceArea / 2),
    centroid: {
      lat: (centroidY / (3 * twiceArea)) / latScale,
      lon: (centroidX / (3 * twiceArea)) / lonScale,
    },
  };
};
const elementCoordinate = (element) => {
  if (Number.isFinite(Number(element.lat)) && Number.isFinite(Number(element.lon))) {
    return { lat: Number(element.lat), lon: Number(element.lon) };
  }
  if (Number.isFinite(Number(element.center?.lat)) && Number.isFinite(Number(element.center?.lon))) {
    return { lat: Number(element.center.lat), lon: Number(element.center.lon) };
  }
  return null;
};

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; research must remain post-195.');
const place = await readJson(placeRel);
assert(place.id === 'oslo_met_pilestredet' && place.year === 1994, 'Unexpected OsloMet canonical record.');
const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };

const contactUrl = 'https://www.oslomet.no/om/kontakt';
const campusUrl = 'https://www.oslomet.no/om/studiested-pilestredet';
const historyUrl = 'https://www.oslomet.no/om/historie';
const brregMainUrl = `https://data.brreg.no/enhetsregisteret/api/enheter/${mainOrg}`;
const brregCampusUrl = `https://data.brreg.no/enhetsregisteret/api/underenheter/${campusSubunit}`;
const addressUrl = 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Pilestredet&nummer=46&kommunenummer=0301&treffPerSide=20';
const [contactHtml, campusHtml, historyHtml, brregMain, brregCampus, addressResponse] = await Promise.all([
  fetchText(contactUrl),
  fetchText(campusUrl),
  fetchText(historyUrl),
  fetchJson(brregMainUrl),
  fetchJson(brregCampusUrl),
  fetchJson(addressUrl),
]);
await fs.writeFile(path.join(reportDir, 'oslomet-contact.html'), contactHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'oslomet-campus-pilestredet.html'), campusHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'oslomet-history.html'), historyHtml, 'utf8');
await fs.writeFile(path.join(reportDir, 'brreg-main-997058925.json'), `${JSON.stringify(brregMain, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'brreg-campus-974647648.json'), `${JSON.stringify(brregCampus, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'geonorge-pilestredet-46.json'), `${JSON.stringify(addressResponse, null, 2)}\n`, 'utf8');
const contactText = normalize(contactHtml);
const campusText = normalize(campusHtml);
const historyText = normalize(historyHtml);
assert(contactText.includes('pilestredet 46'), 'Official contact page no longer shows Pilestredet 46.');
assert(contactText.includes(mainOrg), 'Official contact page no longer shows organisation number 997058925.');
assert(campusText.includes('pilestredet 32 54'), 'Official campus page no longer defines Pilestredet 32–54.');
assert(campusText.includes('pilestredet 46'), 'Official campus page no longer identifies the main reception.');
assert(historyText.includes('1994'), 'Official OsloMet history no longer supports the 1994 campus history.');
assert(historyText.includes('høgskolen i oslo') || historyText.includes('hogskolen i oslo'), 'Official history no longer identifies Høgskolen i Oslo.');
assert(String(brregMain.organisasjonsnummer) === mainOrg, 'Unexpected OsloMet main organisation number.');
assert(normalize(brregMain.navn).includes('oslomet storbyuniversitetet'), 'Unexpected OsloMet main-unit name.');
assert(String(brregCampus.organisasjonsnummer) === campusSubunit, 'Unexpected Pilestredet campus subunit.');
assert(String(brregCampus.overordnetEnhet) === mainOrg, 'Unexpected campus parent organisation.');
const mainAddress = normalize([
  ...(brregMain.forretningsadresse?.adresse ?? []),
  brregMain.forretningsadresse?.postnummer,
  brregMain.forretningsadresse?.poststed,
].join(' '));
const campusAddress = normalize([
  ...(brregCampus.beliggenhetsadresse?.adresse ?? []),
  brregCampus.beliggenhetsadresse?.postnummer,
  brregCampus.beliggenhetsadresse?.poststed,
].join(' '));
assert(mainAddress.includes('pilestredet 46') && mainAddress.includes('0167 oslo'), 'Main-unit address mismatch.');
assert(campusAddress.includes('pilestredet 46') && campusAddress.includes('0167 oslo'), 'Campus subunit address mismatch.');

const officialCoordinates = [];
for (const row of (addressResponse.adresser ?? []).filter((entry) => normalize(entry.adressetekst) === 'pilestredet 46')) {
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
    sourceObjectId: `geonorge-adresser-v1:0301:${row.adressekode ?? 'pilestredet'}:${row.nummer ?? 46}${row.bokstav ?? ''}:${lat.toFixed(8)},${lon.toFixed(8)}`,
  });
}
assert(officialCoordinates.length === 1, `Expected one exact Kartverket point, got ${officialCoordinates.length}.`);
const officialPoint = officialCoordinates[0];

const overpassQuery = `[out:json][timeout:60];(way(around:450,${officialPoint.lat},${officialPoint.lon})[building];nwr(around:450,${officialPoint.lat},${officialPoint.lon})["name"~"OsloMet|Høgskolen i Oslo|Oslo Metropolitan University",i];nwr(around:450,${officialPoint.lat},${officialPoint.lon})["ref:NO:orgnr"="${mainOrg}"];nwr(around:450,${officialPoint.lat},${officialPoint.lon})["addr:street"="Pilestredet"];);out center tags geom;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const overpass = await fetchJson(overpassUrl);
await fs.writeFile(path.join(reportDir, 'overpass-oslomet-pilestredet.json'), `${JSON.stringify(overpass, null, 2)}\n`, 'utf8');

const buildings = [];
const campusObjects = [];
for (const element of overpass.elements ?? []) {
  const tags = element.tags ?? {};
  const coordinate = elementCoordinate(element);
  const identityText = normalize([tags.name, tags['name:en'], tags.operator, tags.description].join(' '));
  const namedOsloMet = identityText.includes('oslomet')
    || identityText.includes('oslo metropolitan university')
    || identityText.includes('høgskolen i oslo')
    || identityText.includes('hogskolen i oslo')
    || tags['ref:NO:orgnr'] === mainOrg;
  const houseNumber = Number.parseInt(String(tags['addr:housenumber'] ?? ''), 10);
  const inOfficialCampusRange = normalize(tags['addr:street']) === 'pilestredet'
    && Number.isFinite(houseNumber)
    && houseNumber >= 32
    && houseNumber <= 54;
  if (coordinate && (namedOsloMet || inOfficialCampusRange)) {
    campusObjects.push({
      sourceObjectId: `osm-${element.type}:${element.id}`,
      sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
      coordinate,
      distanceFromMainReceptionMeters: Number(distanceMeters(officialPoint, coordinate).toFixed(1)),
      namedOsloMet,
      inOfficialCampusRange,
      tags,
    });
  }
  if (element.type !== 'way' || !Array.isArray(element.geometry) || element.geometry.length < 4) continue;
  const polygon = element.geometry.map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
  const metrics = polygonMetrics(polygon);
  const containsAddress = pointInPolygon(officialPoint, metrics.ring);
  buildings.push({
    sourceObjectId: `osm-way:${element.id}`,
    sourceUrl: `https://www.openstreetmap.org/way/${element.id}`,
    tags,
    containsAddress,
    namedOsloMet,
    inOfficialCampusRange,
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
buildings.sort((a, b) => Number(b.containsAddress) - Number(a.containsAddress)
  || Number(b.namedOsloMet) - Number(a.namedOsloMet)
  || a.addressToCentroidMeters - b.addressToCentroidMeters);
const mainReceptionBuilding = buildings.find((building) => building.containsAddress) ?? null;
assert(mainReceptionBuilding, 'Pilestredet 46 point is outside all nearby building polygons.');
const namedCampusObjects = campusObjects
  .filter((object) => object.namedOsloMet)
  .sort((a, b) => a.distanceFromMainReceptionMeters - b.distanceFromMainReceptionMeters);
assert(namedCampusObjects.length >= 1, 'No named OsloMet campus object found.');
const nearestNamedCampusObject = namedCampusObjects[0];
assert(nearestNamedCampusObject.distanceFromMainReceptionMeters <= 120,
  'The official main reception point is too far from named OsloMet context.');
const officialRangeObjects = campusObjects.filter((object) => object.inOfficialCampusRange);
const maximumCampusSupportDistanceMeters = officialRangeObjects.length > 0
  ? Math.max(...officialRangeObjects.map((object) => object.distanceFromMainReceptionMeters))
  : nearestNamedCampusObject.distanceFromMainReceptionMeters;
const suggestedRadiusMeters = Math.max(
  Number(place.r),
  Math.ceil((maximumCampusSupportDistanceMeters + 25) / 10) * 10,
);
const displacementMeters = Number(distanceMeters(currentCoordinate, officialPoint).toFixed(1));

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_oslomet_pilestredet_campus_32_54_main_reception_46',
  historyDecision: 'hio_campus_established_1994_canonical_year_preserved',
  scopeDecision: 'multi_building_urban_campus_use_main_reception_as_display_marker',
  coordinateDecision: 'promote_unique_official_main_reception_address_point_with_campus_context',
  currentCoordinate,
  candidate: {
    lat: officialPoint.lat,
    lon: officialPoint.lon,
    sourceProvider: 'official_address',
    sourceObjectId: officialPoint.sourceObjectId,
    sourceUrl: addressUrl,
    objectType: 'campus_main_reception_address_point',
  },
  displacementMeters,
  officialAddress: {
    address: 'Pilestredet 46, 0167 Oslo',
    coordinateCount: 1,
    coordinates: officialCoordinates,
    selectionDecision: 'unique_official_main_reception_point',
  },
  officialCampusScope: {
    addressRange: 'Pilestredet 32–54',
    mainReceptionAddress: 'Pilestredet 46',
    mainReceptionBuilding,
    nearestNamedCampusObject,
    namedCampusObjectCount: namedCampusObjects.length,
    officialRangeObjectCount: officialRangeObjects.length,
    maximumCampusSupportDistanceMeters: Number(maximumCampusSupportDistanceMeters.toFixed(1)),
  },
  campusSupportObjects: campusObjects,
  sourceChecks: {
    officialContactAddressAndOrganisationNumber: true,
    officialCampusRangeAndMainReception: true,
    official1994History: true,
    brregMainIdentityAndAddress: true,
    brregCampusSubunitIdentityAndAddress: true,
    geonorgeUniqueAddressPoint: true,
    addressInsideBuildingGeometry: true,
    namedOsloMetContextFound: true,
    campusTreatedAsMultiBuildingScope: true,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: `Apply ${officialPoint.sourceObjectId} as the canonical display marker for the multi-building Pilestredet campus, retain the containing Pilestredet 46 building and named OsloMet objects as support, preserve canonical year 1994, use radius ${suggestedRadiusMeters}, synchronize evidence/index and keep protocol max at 195.`,
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'campus',
    suggestedRadiusMeters,
  },
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# OsloMet Pilestredet coordinate research\n\n- Canonical changed: **no**\n- Official campus scope: **Pilestredet 32–54**\n- Main reception point: **${officialPoint.lat}, ${officialPoint.lon}**\n- Main reception building: **${mainReceptionBuilding.sourceObjectId}**\n- Named OsloMet objects: **${namedCampusObjects.length}**\n- Official-range support objects: **${officialRangeObjects.length}**\n- Maximum support distance: **${maximumCampusSupportDistanceMeters.toFixed(1)} m**\n- Suggested radius: **${suggestedRadiusMeters} m**\n- Displacement: **${displacementMeters} m**\n- Canonical year 1994 preserved: **yes**\n- Protocol max batch: **${protocolMaxBatch}**\n`, 'utf8');
console.log(JSON.stringify({
  status: 'oslomet_pilestredet_coordinate_research_complete',
  mainReceptionPoint: { lat: officialPoint.lat, lon: officialPoint.lon },
  mainReceptionBuilding: mainReceptionBuilding.sourceObjectId,
  namedCampusObjectCount: namedCampusObjects.length,
  officialRangeObjectCount: officialRangeObjects.length,
  suggestedRadiusMeters,
  displacementMeters,
  protocolMaxBatch,
}, null, 2));
