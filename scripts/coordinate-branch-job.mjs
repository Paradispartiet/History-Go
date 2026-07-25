import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const reportDir = path.join(repoRoot, 'reports/oslo-coordinate-psykologisk-institutt-uio-research-post-195');
await fs.mkdir(reportDir, { recursive: true });

const userAgent = 'History-Go coordinate research/2026-07-25 (https://github.com/Paradispartiet/History-Go)';

function round(value, digits = 6) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function haversineMeters(aLat, aLon, bLat, bLon) {
  const r = 6371008.8;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
}

function pointInPolygon(lat, lon, geometry) {
  let inside = false;
  for (let i = 0, j = geometry.length - 1; i < geometry.length; j = i++) {
    const xi = geometry[i].lon;
    const yi = geometry[i].lat;
    const xj = geometry[j].lon;
    const yj = geometry[j].lat;
    const intersects = ((yi > lat) !== (yj > lat)) &&
      (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

async function writeJson(name, value) {
  await fs.writeFile(path.join(reportDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function fetchChecked(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    ...options,
    headers: {
      'user-agent': userAgent,
      accept: '*/*',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response;
}

const placePath = 'data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json';
const place = JSON.parse(await fs.readFile(path.join(repoRoot, placePath), 'utf8'));
if (place.id !== 'psykologisk_institutt_uio') throw new Error('Unexpected place record');

const geonorgeUrl = 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Forskningsveien&nummer=3&bokstav=A&kommunenummer=0301&treffPerSide=20';
const geonorgeResponse = await fetchChecked(geonorgeUrl, { headers: { accept: 'application/json' } });
const geonorge = await geonorgeResponse.json();
await writeJson('geonorge-forskningsveien-3a.json', geonorge);

const allAddresses = Array.isArray(geonorge.adresser) ? geonorge.adresser : [];
const exactAddresses = allAddresses.filter((entry) => {
  const text = String(entry.adressetekst || '').replace(/\s+/g, '').toLowerCase();
  return text === 'forskningsveien3a' && String(entry.kommunenummer || '') === '0301';
});
if (exactAddresses.length !== 1) {
  throw new Error(`Expected one exact Forskningsveien 3A address, found ${exactAddresses.length}`);
}
const address = exactAddresses[0];
const lat = Number(address.representasjonspunkt?.lat);
const lon = Number(address.representasjonspunkt?.lon);
if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error('GeoNorge address lacks coordinates');

const officialCandidates = [
  ['uio-contact-nb.html', 'https://www.sv.uio.no/psi/om/kontakt/'],
  ['uio-contact-en.html', 'https://www.sv.uio.no/psi/english/about/contact/'],
  ['uio-building.html', 'https://www.uio.no/om/finn-fram/omrader/gaustad/harald-schjelderups-hus/'],
];
const officialFetches = [];
for (const [fileName, url] of officialCandidates) {
  try {
    const response = await fetchChecked(url, { headers: { accept: 'text/html,application/xhtml+xml' } });
    const html = await response.text();
    await fs.writeFile(path.join(reportDir, fileName), html, 'utf8');
    officialFetches.push({ url, fileName, status: response.status, finalUrl: response.url, bytes: Buffer.byteLength(html), containsAddress: /Forskningsveien\s*3\s*A/i.test(html), containsBuildingName: /Harald\s+Schjelderups\s+hus/i.test(html) });
  } catch (error) {
    officialFetches.push({ url, fileName, error: String(error) });
  }
}
await writeJson('official-source-fetches.json', officialFetches);

const overpassQuery = `[out:json][timeout:60];way(around:120,${lat},${lon})[building];out tags geom;`;
const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let overpass = null;
let overpassUrl = null;
let lastOverpassError = null;
for (const endpoint of overpassEndpoints) {
  try {
    const response = await fetchChecked(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams({ data: overpassQuery }).toString(),
    });
    overpass = await response.json();
    overpassUrl = endpoint;
    break;
  } catch (error) {
    lastOverpassError = String(error);
  }
}
if (!overpass) throw new Error(`Overpass failed: ${lastOverpassError}`);
await writeJson('overpass-building-footprints.json', overpass);

const buildingWays = (overpass.elements || []).filter((element) => element.type === 'way' && Array.isArray(element.geometry) && element.geometry.length >= 4);
const containingWays = buildingWays.filter((way) => pointInPolygon(lat, lon, way.geometry));
if (containingWays.length === 0) throw new Error('Official address point is not inside any OSM building footprint');
containingWays.sort((a, b) => {
  const aNamed = /Harald|Schjelderup|Psykolog/i.test(String(a.tags?.name || '')) ? 1 : 0;
  const bNamed = /Harald|Schjelderup|Psykolog/i.test(String(b.tags?.name || '')) ? 1 : 0;
  return bNamed - aNamed;
});
const building = containingWays[0];
const maxFootprintDistanceMeters = Math.max(...building.geometry.map((point) => haversineMeters(lat, lon, point.lat, point.lon)));
const footprintBufferMeters = 30;
const recommendedRadius = Math.max(80, Math.ceil((maxFootprintDistanceMeters + footprintBufferMeters) / 10) * 10);
const displacementMeters = haversineMeters(place.lat, place.lon, lat, lon);
const addressCode = String(address.adressekode || address.adressekodeId || 'unknown');
const houseNumber = `${address.nummer || 3}${address.bokstav || 'A'}`;
const sourceObjectId = `geonorge-adresser-v1:0301:${addressCode}:${houseNumber}:${lat.toFixed(8)},${lon.toFixed(8)}`;

const summary = {
  version: '2026-07-25',
  protocolMaxBatch: 195,
  placeId: place.id,
  researchOnly: true,
  canonicalChanged: false,
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Psykologisk institutt ved Universitetet i Oslo i Harald Schjelderups hus, Forskningsveien 3A, 0373 Oslo',
    identityStatus: 'resolved',
    locatorTypeCandidate: 'building',
  },
  currentCoordinate: { lat: place.lat, lon: place.lon, r: place.r },
  officialAddress: {
    addressText: address.adressetekst,
    postcode: address.postnummer,
    postArea: address.poststed,
    municipalityNumber: address.kommunenummer,
    lat,
    lon,
    sourceUrl: geonorgeUrl,
    sourceObjectId,
    uniqueExactMatchCount: exactAddresses.length,
  },
  buildingVerification: {
    overpassEndpoint: overpassUrl,
    containingBuildingCount: containingWays.length,
    selectedBuilding: {
      type: building.type,
      id: building.id,
      sourceObjectId: `osm-way:${building.id}`,
      tags: building.tags || {},
    },
    addressPointInsideBuilding: true,
    maxFootprintDistanceMeters: round(maxFootprintDistanceMeters, 1),
  },
  radiusRecommendation: {
    method: 'maximum address-point-to-building-vertex distance plus 30 metre building buffer, rounded up to nearest 10 metres',
    footprintBufferMeters,
    recommendedRadius,
  },
  displacementMeters: round(displacementMeters, 1),
  officialSourceFetches: officialFetches,
  decision: {
    canBecomeVerified: true,
    coordinateDecision: 'use_official_address_point',
    recommendedLat: lat,
    recommendedLon: lon,
    recommendedRadius,
    coordStatus: 'verified',
    coordType: 'address_point',
    coordRole: 'display_marker',
    sourceProvider: 'official_address',
    locatorType: 'building',
    nextAction: 'Create a separate production PR that applies the official address point, measured radius, coordinate metadata and evidence.',
  },
};
await writeJson('summary.json', summary);

const readme = `# Psykologisk institutt, UiO – coordinate research post-195\n\n- Research only; canonical data was not changed.\n- Exact Kartverket/GeoNorge address: ${address.adressetekst}, ${address.postnummer} ${address.poststed}.\n- Coordinate: ${lat}, ${lon}.\n- Source object: ${sourceObjectId}.\n- The point is inside OSM way ${building.id}${building.tags?.name ? ` (${building.tags.name})` : ''}.\n- Previous marker displacement: ${round(displacementMeters, 1)} metres.\n- Recommended radius: ${recommendedRadius} metres (${round(maxFootprintDistanceMeters, 1)} m footprint reach + ${footprintBufferMeters} m buffer).\n- Decision: sufficient evidence for a separate production PR.\n`;
await fs.writeFile(path.join(reportDir, 'README.md'), readme, 'utf8');

console.log(JSON.stringify(summary, null, 2));
