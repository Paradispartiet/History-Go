import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-aho-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/arkitektur_og_designhogskolen.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const fetchText = async (url, accept = 'application/json,text/html;q=0.9,*/*;q=0.8') => {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go coordinate research/1.0 (github.com/Paradispartiet/History-Go)',
      accept,
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));
const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const distanceMeters = (a, b) => {
  const toRad = (value) => value * Math.PI / 180;
  const earth = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
};
const polygonCentroid = (points) => {
  const ring = points.length > 1 && points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon
    ? points
    : [...points, points[0]];
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const x1 = ring[index].lon;
    const y1 = ring[index].lat;
    const x2 = ring[index + 1].lon;
    const y2 = ring[index + 1].lat;
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
const pointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    const intersects = ((yi > point.lat) !== (yj > point.lat))
      && (point.lon < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
};
const addressLines = (record) => {
  const candidate = record?.forretningsadresse ?? record?.beliggenhetsadresse ?? record?.postadresse ?? {};
  return [...(candidate.adresse ?? []), candidate.postnummer, candidate.poststed].filter(Boolean).join(' ');
};

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'arkitektur_og_designhogskolen', 'Unexpected place identity.');
assert(place.coordStatus == null, 'AHO already has a coordinate status; manual reconciliation required.');
assert(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)), 'Current AHO marker is missing.');

const urls = {
  brregMain: 'https://data.brreg.no/enhetsregisteret/api/enheter/971526378',
  brregSubunit: 'https://data.brreg.no/enhetsregisteret/api/underenheter/974714698',
  geonorge: 'https://ws.geonorge.no/adresser/v1/sok?sok=Maridalsveien%2029%20Oslo&treffPerSide=20',
  osm: 'https://api.openstreetmap.org/api/0.6/way/1420826219/full.json',
  wikidata: 'https://www.wikidata.org/wiki/Special:EntityData/Q4579140.json',
  byleksikon: 'https://oslobyleksikon.no/side/Arkitektur-_og_designh%C3%B8gskolen_i_Oslo',
};

const [brregMain, brregSubunit, geonorge, osm, wikidata, byleksikonHtml] = await Promise.all([
  fetchJson(urls.brregMain),
  fetchJson(urls.brregSubunit),
  fetchJson(urls.geonorge),
  fetchJson(urls.osm),
  fetchJson(urls.wikidata),
  fetchText(urls.byleksikon, 'text/html,*/*;q=0.8'),
]);

const mainAddress = normalize(addressLines(brregMain));
const subunitAddress = normalize(addressLines(brregSubunit));
assert(brregMain.organisasjonsnummer === '971526378', 'Unexpected Brønnøysund main-unit identity.');
assert(brregSubunit.organisasjonsnummer === '974714698', 'Unexpected Brønnøysund subunit identity.');
assert(mainAddress.includes('maridalsveien 29') && mainAddress.includes('0175 oslo'), 'Main unit no longer resolves to Maridalsveien 29, 0175 Oslo.');
assert(subunitAddress.includes('maridalsveien 29') && subunitAddress.includes('0175 oslo'), 'Subunit no longer resolves to Maridalsveien 29, 0175 Oslo.');

const exactAddressRows = (geonorge.adresser ?? []).filter((entry) => {
  const street = normalize(entry.adressenavn ?? entry.adressetekst);
  return street.includes('maridalsveien')
    && Number(entry.nummer) === 29
    && String(entry.postnummer ?? '') === '0175'
    && String(entry.kommunenummer ?? entry.kommune?.kommunenummer ?? '') === '0301';
});
assert(exactAddressRows.length > 0, 'Kartverket returned no exact Maridalsveien 29, 0175 Oslo address.');
const coordinateGroups = new Map();
for (const entry of exactAddressRows) {
  const lat = Number(entry.representasjonspunkt?.lat);
  const lon = Number(entry.representasjonspunkt?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const key = `${lat.toFixed(8)},${lon.toFixed(8)}`;
  if (!coordinateGroups.has(key)) coordinateGroups.set(key, []);
  coordinateGroups.get(key).push(entry);
}
assert(coordinateGroups.size === 1, `Kartverket returned ${coordinateGroups.size} distinct exact coordinates for Maridalsveien 29.`);
const [coordinateKey, coordinateRows] = [...coordinateGroups.entries()][0];
const [addressLat, addressLon] = coordinateKey.split(',').map(Number);
const addressRow = coordinateRows[0];
const addressCoordinate = { lat: addressLat, lon: addressLon };
const municipalityNumber = String(addressRow.kommunenummer ?? addressRow.kommune?.kommunenummer ?? '0301');
const addressCode = String(addressRow.adressekode ?? addressRow.adressenavn?.adressekode ?? 'unknown');
const addressNumber = `${addressRow.nummer ?? 29}${addressRow.bokstav ?? ''}`;
const geonorgeSourceId = `geonorge-adresser-v1:${municipalityNumber}:${addressCode}:${addressNumber}`;

const way = osm.elements?.find((entry) => entry.type === 'way' && entry.id === 1420826219);
assert(way, 'OSM way 1420826219 was not returned.');
const tags = way.tags ?? {};
assert(tags.amenity === 'college', 'OSM AHO object is no longer amenity=college.');
assert(normalize(`${tags.name ?? ''} ${tags['name:no'] ?? ''}`).includes('arkitektur og designhogskolen'), 'OSM way no longer names AHO.');
assert(String(tags.ref ?? '').replace(/\s+/g, '') === '971526378', 'OSM way no longer cross-links the official organisation number.');
assert(tags.wikidata === 'Q4579140', 'OSM way no longer cross-links Wikidata Q4579140.');
const nodes = new Map(osm.elements.filter((entry) => entry.type === 'node').map((entry) => [entry.id, entry]));
const polygon = (way.nodes ?? []).map((id) => nodes.get(id)).filter(Boolean).map((node) => ({ lat: Number(node.lat), lon: Number(node.lon) }));
assert(polygon.length >= 4, 'OSM AHO polygon has insufficient geometry.');
const siteCentroid = polygonCentroid(polygon);
const addressInsideSite = pointInPolygon(addressCoordinate, polygon);
const addressToCentroidMeters = distanceMeters(addressCoordinate, siteCentroid);
assert(addressInsideSite || addressToCentroidMeters < 150, `Official address point is ${addressToCentroidMeters.toFixed(1)} m from the AHO site geometry.`);

const wikidataEntity = wikidata.entities?.Q4579140;
assert(wikidataEntity, 'Wikidata Q4579140 was not returned.');
const orgClaim = wikidataEntity.claims?.P2333?.some((claim) => String(claim.mainsnak?.datavalue?.value).replace(/\s+/g, '') === '971526378')
  || wikidataEntity.claims?.P1278?.some((claim) => String(claim.mainsnak?.datavalue?.value).replace(/\s+/g, '') === '971526378');
const labelIdentity = Object.values(wikidataEntity.labels ?? {}).some((label) => normalize(label?.value).includes('oslo school of architecture and design') || normalize(label?.value).includes('arkitektur og designhogskolen i oslo'));
assert(labelIdentity, 'Wikidata Q4579140 no longer resolves to AHO by label.');

const byleksikonIdentity = /Arkitektur- og designh[øo]gskolen i Oslo/i.test(byleksikonHtml)
  && /Maridalsveien\s*29/i.test(byleksikonHtml)
  && /1945/.test(byleksikonHtml);
assert(byleksikonIdentity, 'Oslo Byleksikon no longer supports AHO at Maridalsveien 29.');

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const currentToAddressMeters = distanceMeters(currentCoordinate, addressCoordinate);
const currentInsideSite = pointInPolygon(currentCoordinate, polygon);
assert(currentToAddressMeters > 100, `Current marker is only ${currentToAddressMeters.toFixed(1)} m from the official address point; manual review required.`);

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_aho_maridalsveien_29',
  coordinateDecision: 'promote_official_address_point',
  currentCoordinate,
  currentMarkerInsideOsmSite: currentInsideSite,
  candidate: {
    lat: addressCoordinate.lat,
    lon: addressCoordinate.lon,
    sourceProvider: 'official_address',
    sourceObjectId: geonorgeSourceId,
    sourceUrl: urls.geonorge,
    address: {
      street: 'Maridalsveien',
      number: '29',
      postcode: '0175',
      city: 'Oslo',
      country: 'NO',
    },
  },
  displacementMeters: Number(currentToAddressMeters.toFixed(1)),
  osmSite: {
    sourceObjectId: 'osm-way:1420826219',
    sourceUrl: 'https://www.openstreetmap.org/way/1420826219',
    centroid: siteCentroid,
    addressInsideSite,
    addressToCentroidMeters: Number(addressToCentroidMeters.toFixed(1)),
    organisationRef: tags.ref ?? null,
    wikidata: tags.wikidata ?? null,
  },
  sourceChecks: {
    brregMainUnitAddress: true,
    brregSubunitAddress: true,
    geonorgeUniqueExactAddressCoordinate: coordinateGroups.size === 1,
    osmExactNamedInstitutionGeometry: true,
    osmOrganisationNumberMatches: true,
    osmWikidataMatches: true,
    wikidataIdentityMatches: labelIdentity,
    wikidataOrganisationNumberMatches: Boolean(orgClaim),
    osloByleksikonIdentity: byleksikonIdentity,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: 'Apply the unique Kartverket address point for Maridalsveien 29 as the canonical display marker, preserve OSM way 1420826219 as supporting site geometry, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.',
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'building',
  },
};

await fs.writeFile(path.join(reportDir, 'brreg-main-971526378.json'), `${JSON.stringify(brregMain, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'brreg-subunit-974714698.json'), `${JSON.stringify(brregSubunit, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'geonorge-maridalsveien-29.json'), `${JSON.stringify(geonorge, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'osm-way-1420826219-full.json'), `${JSON.stringify(osm, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'wikidata-Q4579140.json'), `${JSON.stringify(wikidata, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# AHO coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **AHO, Maridalsveien 29**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Kartverket address point: **${addressCoordinate.lat}, ${addressCoordinate.lon}**\n- Displacement: **${summary.displacementMeters} m**\n- Address point inside OSM site: **${addressInsideSite ? 'yes' : 'no'}**\n- OSM site object: **way 1420826219**\n- Official organisation number: **971526378**\n- Recommendation: **promote the unique official address point in a separate production PR**\n\nBrønnøysund's main unit and subunit independently resolve the institution to Maridalsveien 29. Kartverket returns one exact coordinate for that address. The named OSM college geometry carries the same organisation number and Wikidata identity, while Oslo Byleksikon independently resolves the institution and address. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'aho_research_complete',
  reportDir: reportRel,
  displacementMeters: summary.displacementMeters,
  addressInsideSite,
  geonorgeSourceId,
  recommendation: summary.coordinateDecision,
}, null, 2));
