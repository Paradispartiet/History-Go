import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/oslo-coordinate-ous-hospitals-research-post-195');
await fs.mkdir(outDir, { recursive: true });
const ua = 'History-Go coordinate research/2026-07-25';

const specs = [
  {
    id: 'radiumhospitalet',
    placePath: 'data/places/vitenskap/oslo/places_vitenskap/radiumhospitalet.json',
    addressName: 'Ullernchausseen',
    number: 70,
    officialUrl: 'https://www.oslo-universitetssykehus.no/steder/radiumhospitalet/',
    namePattern: /Radiumhospital/i,
    officialAddressPattern: /Ullernchauss.{0,2}en\s*70/i,
  },
  {
    id: 'rikshospitalet',
    placePath: 'data/places/vitenskap/oslo/places_vitenskap/rikshospitalet.json',
    addressName: 'Sognsvannsveien',
    number: 20,
    officialUrl: 'https://www.oslo-universitetssykehus.no/steder/rikshospitalet',
    namePattern: /Rikshospital/i,
    officialAddressPattern: /Sognsvannsveien\s*20/i,
  },
];

const readJson = async (p) => JSON.parse(await fs.readFile(path.join(root, p), 'utf8'));
const writeJson = async (name, value) => fs.writeFile(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const fetchOk = async (url, options = {}) => {
  const response = await fetch(url, { redirect: 'follow', ...options, headers: { 'user-agent': ua, accept: '*/*', ...(options.headers || {}) } });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
};
const rad = (v) => (v * Math.PI) / 180;
const distance = (aLat, aLon, bLat, bLon) => {
  const R = 6371008.8;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
const pointInPolygon = (lat, lon, geometry) => {
  let inside = false;
  for (let i = 0, j = geometry.length - 1; i < geometry.length; j = i++) {
    const xi = geometry[i].lon; const yi = geometry[i].lat;
    const xj = geometry[j].lon; const yj = geometry[j].lat;
    if (((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi)) inside = !inside;
  }
  return inside;
};
const centerOf = (element) => {
  if (element.center) return element.center;
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon };
  if (Array.isArray(element.geometry) && element.geometry.length) {
    return {
      lat: element.geometry.reduce((sum, point) => sum + point.lat, 0) / element.geometry.length,
      lon: element.geometry.reduce((sum, point) => sum + point.lon, 0) / element.geometry.length,
    };
  }
  return null;
};

const results = [];
for (const spec of specs) {
  const place = await readJson(spec.placePath);
  const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?adressenavn=${encodeURIComponent(spec.addressName)}&nummer=${spec.number}&kommunenummer=0301&treffPerSide=20`;
  const geonorge = await (await fetchOk(geonorgeUrl, { headers: { accept: 'application/json' } })).json();
  await writeJson(`geonorge-${spec.id}.json`, geonorge);
  const numberMatches = (geonorge.adresser || []).filter((entry) => Number(entry.nummer) === spec.number && String(entry.kommunenummer) === '0301');
  if (numberMatches.length !== 1) {
    throw new Error(`${spec.id}: expected one municipality/house-number match, found ${numberMatches.length}; candidates=${JSON.stringify((geonorge.adresser || []).map((entry) => ({ adressetekst: entry.adressetekst, nummer: entry.nummer, kommunenummer: entry.kommunenummer })))}`);
  }
  const address = numberMatches[0];
  const lat = Number(address.representasjonspunkt.lat);
  const lon = Number(address.representasjonspunkt.lon);

  const officialResponse = await fetchOk(spec.officialUrl, { headers: { accept: 'text/html' } });
  const officialHtml = await officialResponse.text();
  await fs.writeFile(path.join(outDir, `official-${spec.id}.html`), officialHtml, 'utf8');
  const officialContainsAddress = spec.officialAddressPattern.test(officialHtml);
  if (!officialContainsAddress) throw new Error(`${spec.id}: official page does not expose expected address`);

  const query = `[out:json][timeout:90];(nwr(around:600,${lat},${lon})[amenity=hospital];nwr(around:600,${lat},${lon})[healthcare=hospital];way(around:500,${lat},${lon})[building];);out center tags geom;`;
  let overpass; let endpointUsed; let lastError;
  for (const endpoint of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
    try {
      const response = await fetchOk(endpoint, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }, body: new URLSearchParams({ data: query }).toString() });
      overpass = await response.json(); endpointUsed = endpoint; break;
    } catch (error) { lastError = String(error); }
  }
  if (!overpass) throw new Error(`${spec.id}: Overpass failed: ${lastError}`);
  await writeJson(`overpass-${spec.id}.json`, overpass);

  const elements = overpass.elements || [];
  const namedFeatures = elements.filter((entry) => spec.namePattern.test(String(entry.tags?.name || '')) && (entry.tags?.amenity === 'hospital' || entry.tags?.healthcare === 'hospital' || entry.tags?.building));
  const ranked = namedFeatures.map((entry) => {
    const center = centerOf(entry);
    return { entry, center, distanceMeters: center ? distance(lat, lon, center.lat, center.lon) : Number.POSITIVE_INFINITY };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);
  const selectedNamed = ranked[0] || null;
  const buildingWays = elements.filter((entry) => entry.type === 'way' && Array.isArray(entry.geometry) && entry.geometry.length >= 4 && entry.tags?.building);
  const containingBuildings = buildingWays.filter((entry) => pointInPolygon(lat, lon, entry.geometry));
  const namedAreaPolygons = namedFeatures.filter((entry) => entry.type === 'way' && Array.isArray(entry.geometry) && entry.geometry.length >= 4 && (entry.tags?.amenity === 'hospital' || entry.tags?.healthcare === 'hospital'));
  const selectedArea = namedAreaPolygons.find((entry) => pointInPolygon(lat, lon, entry.geometry)) || namedAreaPolygons[0] || null;
  let campusBuildings = selectedArea
    ? buildingWays.filter((building) => {
        const center = centerOf(building);
        return center && pointInPolygon(center.lat, center.lon, selectedArea.geometry);
      })
    : [];
  if (!campusBuildings.length) {
    campusBuildings = buildingWays.filter((building) => {
      const center = centerOf(building);
      return center && distance(lat, lon, center.lat, center.lon) <= 300;
    });
  }
  const vertices = campusBuildings.flatMap((building) => building.geometry);
  const maxCampusDistance = vertices.length ? Math.max(...vertices.map((point) => distance(lat, lon, point.lat, point.lon))) : null;
  const bufferMeters = 40;
  const recommendedRadius = maxCampusDistance === null ? null : Math.ceil((maxCampusDistance + bufferMeters) / 10) * 10;
  const sourceObjectId = `geonorge-adresser-v1:0301:${address.adressekode || 'unknown'}:${spec.number}:${lat.toFixed(8)},${lon.toFixed(8)}`;

  results.push({
    placeId: spec.id,
    researchOnly: true,
    canonicalChanged: false,
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r },
    officialAddress: { addressText: address.adressetekst, postcode: address.postnummer, postArea: address.poststed, lat, lon, sourceUrl: geonorgeUrl, sourceObjectId, uniqueExactMatchCount: numberMatches.length },
    officialPage: { url: spec.officialUrl, finalUrl: officialResponse.url, containsAddress: officialContainsAddress },
    geometry: {
      overpassEndpoint: endpointUsed,
      namedHospitalFeatureCount: namedFeatures.length,
      selectedNamedFeature: selectedNamed ? { type: selectedNamed.entry.type, id: selectedNamed.entry.id, tags: selectedNamed.entry.tags || {}, distanceMeters: Math.round(selectedNamed.distanceMeters * 10) / 10 } : null,
      containingBuildingCount: containingBuildings.length,
      containingBuildings: containingBuildings.map((entry) => ({ type: entry.type, id: entry.id, tags: entry.tags || {} })),
      selectedHospitalArea: selectedArea ? { type: selectedArea.type, id: selectedArea.id, tags: selectedArea.tags || {} } : null,
      campusBuildingCount: campusBuildings.length,
      maximumCampusSupportDistanceMeters: maxCampusDistance === null ? null : Math.round(maxCampusDistance * 10) / 10,
    },
    radiusRecommendation: { method: selectedArea ? 'buildings with centroids inside named hospital area plus 40 metre buffer' : 'building footprints within 300 metres of official address point plus 40 metre buffer', bufferMeters, recommendedRadius },
    displacementMeters: Math.round(distance(place.lat, place.lon, lat, lon) * 10) / 10,
    decision: {
      canBecomeVerified: Boolean(selectedNamed && containingBuildings.length && recommendedRadius),
      coordinateDecision: 'use_official_address_point_for_main_entrance',
      recommendedLat: lat,
      recommendedLon: lon,
      recommendedRadius,
      coordStatus: 'verified',
      coordType: 'address_point',
      locatorType: 'building',
      sourceProvider: 'official_address',
      nextAction: 'Review hospital-complex support set and create a separate production PR if the measured radius represents the intended canonical scope.',
    },
  });
}

const summary = { version: '2026-07-25', protocolMaxBatch: 195, researchOnly: true, canonicalChanged: false, places: results };
await writeJson('summary.json', summary);
await fs.writeFile(path.join(outDir, 'README.md'), '# OUS hospital coordinate research post-195\n\nResearch-only audit for Radiumhospitalet and Rikshospitalet. Exact Kartverket address points, official OUS address confirmation, OSM hospital/building geometry and measured campus-radius candidates are stored in summary.json. Canonical data was not changed.\n', 'utf8');
console.log(JSON.stringify(summary, null, 2));
