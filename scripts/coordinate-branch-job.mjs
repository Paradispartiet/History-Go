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
  },
  {
    id: 'rikshospitalet',
    placePath: 'data/places/vitenskap/oslo/places_vitenskap/rikshospitalet.json',
    addressName: 'Sognsvannsveien',
    number: 20,
    officialUrl: 'https://www.oslo-universitetssykehus.no/steder/rikshospitalet',
    namePattern: /Rikshospital/i,
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
      lat: element.geometry.reduce((s, p) => s + p.lat, 0) / element.geometry.length,
      lon: element.geometry.reduce((s, p) => s + p.lon, 0) / element.geometry.length,
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
  const exact = (geonorge.adresser || []).filter((a) => String(a.adressetekst || '').replace(/\s+/g, '').toLowerCase() === `${spec.addressName}${spec.number}`.replace(/\s+/g, '').toLowerCase() && String(a.kommunenummer) === '0301');
  if (exact.length !== 1) throw new Error(`${spec.id}: expected one exact address, found ${exact.length}`);
  const address = exact[0];
  const lat = Number(address.representasjonspunkt.lat);
  const lon = Number(address.representasjonspunkt.lon);

  const officialResponse = await fetchOk(spec.officialUrl, { headers: { accept: 'text/html' } });
  const officialHtml = await officialResponse.text();
  await fs.writeFile(path.join(outDir, `official-${spec.id}.html`), officialHtml, 'utf8');
  const officialContainsAddress = new RegExp(`${spec.addressName}\\s*${spec.number}`, 'i').test(officialHtml);
  if (!officialContainsAddress) throw new Error(`${spec.id}: official page does not expose expected address`);

  const query = `[out:json][timeout:90];(nwr(around:600,${lat},${lon})[amenity=hospital];nwr(around:600,${lat},${lon})[healthcare=hospital];way(around:500,${lat},${lon})[building];);out center tags geom;`;
  const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  let overpass; let endpointUsed; let lastError;
  for (const endpoint of endpoints) {
    try {
      const response = await fetchOk(endpoint, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }, body: new URLSearchParams({ data: query }).toString() });
      overpass = await response.json(); endpointUsed = endpoint; break;
    } catch (error) { lastError = String(error); }
  }
  if (!overpass) throw new Error(`${spec.id}: Overpass failed: ${lastError}`);
  await writeJson(`overpass-${spec.id}.json`, overpass);

  const elements = overpass.elements || [];
  const namedHospitalFeatures = elements.filter((e) => spec.namePattern.test(String(e.tags?.name || '')) && (e.tags?.amenity === 'hospital' || e.tags?.healthcare === 'hospital' || e.tags?.building));
  const rankedNamed = namedHospitalFeatures.map((e) => {
    const c = centerOf(e);
    return { element: e, center: c, distanceMeters: c ? distance(lat, lon, c.lat, c.lon) : Number.POSITIVE_INFINITY };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);
  const selectedNamed = rankedNamed[0] || null;

  const buildingWays = elements.filter((e) => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length >= 4 && e.tags?.building);
  const containingBuildings = buildingWays.filter((e) => pointInPolygon(lat, lon, e.geometry));
  const namedAreaPolygons = namedHospitalFeatures.filter((e) => e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length >= 4 && (e.tags?.amenity === 'hospital' || e.tags?.healthcare === 'hospital'));
  const selectedArea = namedAreaPolygons.find((e) => pointInPolygon(lat, lon, e.geometry)) || namedAreaPolygons[0] || null;
  let campusBuildings = [];
  if (selectedArea) {
    campusBuildings = buildingWays.filter((b) => {
      const c = centerOf(b);
      return c && pointInPolygon(c.lat, c.lon, selectedArea.geometry);
    });
  }
  if (!campusBuildings.length) {
    campusBuildings = buildingWays.filter((b) => {
      const c = centerOf(b);
      return c && distance(lat, lon, c.lat, c.lon) <= 300;
    });
  }
  const allVertices = campusBuildings.flatMap((b) => b.geometry);
  const maxCampusDistance = allVertices.length ? Math.max(...allVertices.map((p) => distance(lat, lon, p.lat, p.lon))) : null;
  const bufferMeters = 40;
  const recommendedRadius = maxCampusDistance === null ? null : Math.ceil((maxCampusDistance + bufferMeters) / 10) * 10;
  const addressCode = String(address.adressekode || 'unknown');
  const sourceObjectId = `geonorge-adresser-v1:0301:${addressCode}:${spec.number}:${lat.toFixed(8)},${lon.toFixed(8)}`;

  results.push({
    placeId: spec.id,
    researchOnly: true,
    canonicalChanged: false,
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r },
    officialAddress: { addressText: address.adressetekst, postcode: address.postnummer, postArea: address.poststed, lat, lon, sourceUrl: geonorgeUrl, sourceObjectId, uniqueExactMatchCount: exact.length },
    officialPage: { url: spec.officialUrl, finalUrl: officialResponse.url, containsAddress: officialContainsAddress },
    geometry: {
      overpassEndpoint: endpointUsed,
      namedHospitalFeatureCount: namedHospitalFeatures.length,
      selectedNamedFeature: selectedNamed ? { type: selectedNamed.element.type, id: selectedNamed.element.id, tags: selectedNamed.element.tags || {}, distanceMeters: Math.round(selectedNamed.distanceMeters * 10) / 10 } : null,
      containingBuildingCount: containingBuildings.length,
      containingBuildings: containingBuildings.map((e) => ({ type: e.type, id: e.id, tags: e.tags || {} })),
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
await fs.writeFile(path.join(outDir, 'README.md'), `# OUS hospital coordinate research post-195\n\nResearch-only audit for Radiumhospitalet and Rikshospitalet. Exact Kartverket address points, official OUS address confirmation, OSM hospital/building geometry and measured campus-radius candidates are stored in summary.json. Canonical data was not changed.\n`, 'utf8');
console.log(JSON.stringify(summary, null, 2));
