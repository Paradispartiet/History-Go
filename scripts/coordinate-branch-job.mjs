import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/oslo-coordinate-ous-hospitals-research-post-195');
await fs.mkdir(outDir, { recursive: true });
const userAgent = 'History-Go coordinate research/2026-07-25';

const specs = [
  {
    id: 'radiumhospitalet',
    placePath: 'data/places/vitenskap/oslo/places_vitenskap/radiumhospitalet.json',
    street: 'Ullernchausséen',
    number: 70,
    officialUrl: 'https://www.oslo-universitetssykehus.no/steder/radiumhospitalet/',
    officialAddressPattern: /Ullernchauss.{0,2}en\s*70/i,
    namePattern: /Radiumhospital/i,
  },
  {
    id: 'rikshospitalet',
    placePath: 'data/places/vitenskap/oslo/places_vitenskap/rikshospitalet.json',
    street: 'Sognsvannsveien',
    number: 20,
    officialUrl: 'https://www.oslo-universitetssykehus.no/steder/rikshospitalet',
    officialAddressPattern: /Sognsvannsveien\s*20/i,
    namePattern: /Rikshospital/i,
  },
];

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (name, value) => fs.writeFile(path.join(outDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const fetchChecked = async (url, options = {}) => {
  const response = await fetch(url, {
    redirect: 'follow',
    ...options,
    headers: { 'user-agent': userAgent, accept: '*/*', ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
};
const toRadians = (value) => (value * Math.PI) / 180;
const distanceMeters = (aLat, aLon, bLat, bLon) => {
  const radius = 6371008.8;
  const dLat = toRadians(bLat - aLat);
  const dLon = toRadians(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.asin(Math.min(1, Math.sqrt(h)));
};
const pointInPolygon = (lat, lon, geometry) => {
  let inside = false;
  for (let i = 0, j = geometry.length - 1; i < geometry.length; j = i++) {
    const xi = geometry[i].lon;
    const yi = geometry[i].lat;
    const xj = geometry[j].lon;
    const yj = geometry[j].lat;
    if (((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi)) inside = !inside;
  }
  return inside;
};
const elementCenter = (element) => {
  if (element.center) return element.center;
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon };
  if (!Array.isArray(element.geometry) || !element.geometry.length) return null;
  return {
    lat: element.geometry.reduce((sum, point) => sum + point.lat, 0) / element.geometry.length,
    lon: element.geometry.reduce((sum, point) => sum + point.lon, 0) / element.geometry.length,
  };
};

const results = [];
for (const spec of specs) {
  const place = await readJson(spec.placePath);
  const geonorgeUrl = `https://ws.geonorge.no/adresser/v1/sok?adressenavn=${encodeURIComponent(spec.street)}&nummer=${spec.number}&kommunenummer=0301&treffPerSide=20`;
  const geonorge = await (await fetchChecked(geonorgeUrl, { headers: { accept: 'application/json' } })).json();
  await writeJson(`geonorge-${spec.id}.json`, geonorge);
  const addresses = (geonorge.adresser || []).filter((entry) => (
    Number(entry.nummer) === spec.number && String(entry.kommunenummer) === '0301'
  ));
  if (addresses.length !== 1) {
    throw new Error(`${spec.id}: expected one exact Kartverket address, found ${addresses.length}; candidates=${JSON.stringify((geonorge.adresser || []).map((entry) => entry.adressetekst))}`);
  }
  const address = addresses[0];
  const lat = Number(address.representasjonspunkt.lat);
  const lon = Number(address.representasjonspunkt.lon);

  const officialResponse = await fetchChecked(spec.officialUrl, { headers: { accept: 'text/html' } });
  const officialHtml = await officialResponse.text();
  await fs.writeFile(path.join(outDir, `official-${spec.id}.html`), officialHtml, 'utf8');
  if (!spec.officialAddressPattern.test(officialHtml)) {
    throw new Error(`${spec.id}: OUS page does not expose the expected address`);
  }

  const overpassQuery = `[out:json][timeout:90];(nwr(around:700,${lat},${lon})[amenity=hospital];nwr(around:700,${lat},${lon})[healthcare=hospital];way(around:550,${lat},${lon})[building];);out center tags geom;`;
  let overpass = null;
  let overpassEndpoint = null;
  let overpassError = null;
  for (const endpoint of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
    try {
      const response = await fetchChecked(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
        body: new URLSearchParams({ data: overpassQuery }).toString(),
      });
      overpass = await response.json();
      overpassEndpoint = endpoint;
      break;
    } catch (error) {
      overpassError = String(error);
    }
  }
  if (!overpass) throw new Error(`${spec.id}: Overpass failed: ${overpassError}`);
  await writeJson(`overpass-${spec.id}.json`, overpass);

  const elements = overpass.elements || [];
  const buildings = elements.filter((element) => (
    element.type === 'way' && element.tags?.building && Array.isArray(element.geometry) && element.geometry.length >= 4
  ));
  const containingBuildings = buildings.filter((building) => pointInPolygon(lat, lon, building.geometry));
  const namedFeatures = elements.filter((element) => (
    spec.namePattern.test(String(element.tags?.name || ''))
    && (element.tags?.amenity === 'hospital' || element.tags?.healthcare === 'hospital' || element.tags?.building)
  ));
  const namedAreas = namedFeatures.filter((element) => (
    element.type === 'way'
    && Array.isArray(element.geometry)
    && element.geometry.length >= 4
    && (element.tags?.amenity === 'hospital' || element.tags?.healthcare === 'hospital')
  ));
  const selectedArea = namedAreas.find((area) => pointInPolygon(lat, lon, area.geometry)) || namedAreas[0] || null;
  let supportedBuildings = selectedArea
    ? buildings.filter((building) => {
        const center = elementCenter(building);
        return center && pointInPolygon(center.lat, center.lon, selectedArea.geometry);
      })
    : [];
  if (!supportedBuildings.length) {
    supportedBuildings = buildings.filter((building) => {
      const center = elementCenter(building);
      return center && distanceMeters(lat, lon, center.lat, center.lon) <= 350;
    });
  }
  const supportVertices = supportedBuildings.flatMap((building) => building.geometry);
  const maximumSupportDistance = supportVertices.length
    ? Math.max(...supportVertices.map((point) => distanceMeters(lat, lon, point.lat, point.lon)))
    : null;
  const bufferMeters = 40;
  const recommendedRadius = maximumSupportDistance === null
    ? null
    : Math.ceil((maximumSupportDistance + bufferMeters) / 10) * 10;
  const closestNamedFeature = namedFeatures
    .map((element) => {
      const center = elementCenter(element);
      return { element, distance: center ? distanceMeters(lat, lon, center.lat, center.lon) : Number.POSITIVE_INFINITY };
    })
    .sort((a, b) => a.distance - b.distance)[0] || null;
  const sourceObjectId = `geonorge-adresser-v1:0301:${address.adressekode || 'unknown'}:${spec.number}:${lat.toFixed(8)},${lon.toFixed(8)}`;

  results.push({
    placeId: spec.id,
    researchOnly: true,
    canonicalChanged: false,
    currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r },
    officialAddress: {
      addressText: address.adressetekst,
      postcode: address.postnummer,
      postArea: address.poststed,
      lat,
      lon,
      sourceUrl: geonorgeUrl,
      sourceObjectId,
      uniqueExactMatchCount: addresses.length,
    },
    officialPage: { url: spec.officialUrl, finalUrl: officialResponse.url, containsAddress: true },
    geometry: {
      overpassEndpoint,
      containingBuildingCount: containingBuildings.length,
      containingBuildings: containingBuildings.map((building) => ({ id: building.id, tags: building.tags || {} })),
      namedHospitalFeatureCount: namedFeatures.length,
      closestNamedFeature: closestNamedFeature ? {
        type: closestNamedFeature.element.type,
        id: closestNamedFeature.element.id,
        tags: closestNamedFeature.element.tags || {},
        distanceMeters: Math.round(closestNamedFeature.distance * 10) / 10,
      } : null,
      selectedHospitalArea: selectedArea ? { id: selectedArea.id, tags: selectedArea.tags || {} } : null,
      supportedBuildingCount: supportedBuildings.length,
      maximumCampusSupportDistanceMeters: maximumSupportDistance === null ? null : Math.round(maximumSupportDistance * 10) / 10,
    },
    radiusRecommendation: {
      method: selectedArea
        ? 'building centroids inside named hospital area plus 40 metre buffer'
        : 'building centroids within 350 metres of official address point plus 40 metre buffer',
      bufferMeters,
      recommendedRadius,
    },
    displacementMeters: Math.round(distanceMeters(place.lat, place.lon, lat, lon) * 10) / 10,
    decision: {
      canBecomeVerified: Boolean(closestNamedFeature && containingBuildings.length && recommendedRadius),
      coordinateDecision: 'use_official_address_point_for_main_entrance',
      recommendedLat: lat,
      recommendedLon: lon,
      recommendedRadius,
      coordStatus: 'verified',
      coordType: 'address_point',
      locatorType: 'building',
      sourceProvider: 'official_address',
      nextAction: 'Review the measured hospital-complex support and create a separate production PR when the radius matches the canonical scope.',
    },
  });
}

const summary = {
  version: '2026-07-25',
  protocolMaxBatch: 195,
  researchOnly: true,
  canonicalChanged: false,
  places: results,
};
await writeJson('summary.json', summary);
await fs.writeFile(
  path.join(outDir, 'README.md'),
  '# OUS hospital coordinate research post-195\n\nResearch-only audit for Radiumhospitalet and Rikshospitalet. Kartverket address points, official OUS address confirmation, hospital/building geometry and measured radius candidates are stored in summary.json. Canonical data was not changed.\n',
  'utf8',
);
console.log(JSON.stringify(summary, null, 2));
