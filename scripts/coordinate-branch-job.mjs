import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-bi-nydalen-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/vitenskap/oslo/places_vitenskap/bi_nydalen.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
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
  const earth = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
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
const meanPoint = (points) => ({
  lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
  lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length,
});
const addressText = (record) => {
  const address = record?.forretningsadresse ?? record?.beliggenhetsadresse ?? record?.postadresse ?? {};
  return [...(address.adresse ?? []), address.postnummer, address.poststed].filter(Boolean).join(' ');
};

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'bi_nydalen', 'Unexpected place identity.');
assert(place.coordStatus == null, 'BI Nydalen already has a coordinate status; manual reconciliation required.');
assert(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)), 'Current BI marker is missing.');

const urls = {
  biContact: 'https://www.bi.no/om-bi/kontakt-oss/',
  biCampus: 'https://www.bi.no/studere-ved-bi/campus-oslo/praktisk-informasjon/',
  brreg: 'https://data.brreg.no/enhetsregisteret/api/enheter/971228865',
  geonorge: 'https://ws.geonorge.no/adresser/v1/sok?sok=Nydalsveien%2037%20Oslo&treffPerSide=20',
  osmApi: 'https://api.openstreetmap.org/api/0.6/way/38316703/full.json',
  osmPage: 'https://www.openstreetmap.org/way/38316703',
  wikidataApi: 'https://www.wikidata.org/wiki/Special:EntityData/Q604629.json',
  wikidataPage: 'https://www.wikidata.org/wiki/Q604629',
};

const [biContactHtml, biCampusHtml, brreg, geonorge, osm, wikidata] = await Promise.all([
  fetchText(urls.biContact, 'text/html,*/*;q=0.8'),
  fetchText(urls.biCampus, 'text/html,*/*;q=0.8'),
  fetchJson(urls.brreg),
  fetchJson(urls.geonorge),
  fetchJson(urls.osmApi),
  fetchJson(urls.wikidataApi),
]);

const officialText = normalize(`${biContactHtml} ${biCampusHtml}`);
assert(officialText.includes('nydalsveien 37') && officialText.includes('0484 oslo'), 'BI official pages no longer resolve Campus Oslo to Nydalsveien 37, 0484 Oslo.');
assert(brreg.organisasjonsnummer === '971228865', 'Unexpected Brønnøysund organisation identity.');
assert(normalize(brreg.navn).includes('handelshoyskolen bi'), 'Brønnøysund organisation name no longer resolves to Handelshøyskolen BI.');
assert(normalize(addressText(brreg)).includes('nydalsveien 37 0484 oslo'), 'Brønnøysund no longer resolves BI to Nydalsveien 37, 0484 Oslo.');

const exactRows = (geonorge.adresser ?? []).filter((entry) => normalize(entry.adressenavn ?? entry.adressetekst).includes('nydalsveien')
  && Number(entry.nummer) === 37
  && String(entry.postnummer ?? '') === '0484'
  && String(entry.kommunenummer ?? entry.kommune?.kommunenummer ?? '') === '0301');
assert(exactRows.length > 0, 'Kartverket returned no exact Nydalsveien 37 result.');
const coordinates = new Map();
for (const entry of exactRows) {
  const lat = Number(entry.representasjonspunkt?.lat);
  const lon = Number(entry.representasjonspunkt?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const key = `${lat.toFixed(8)},${lon.toFixed(8)}`;
  if (!coordinates.has(key)) coordinates.set(key, []);
  coordinates.get(key).push(entry);
}
assert(coordinates.size === 1, `Kartverket returned ${coordinates.size} distinct exact coordinates for Nydalsveien 37.`);
const [coordinateKey, coordinateRows] = [...coordinates.entries()][0];
const [lat, lon] = coordinateKey.split(',').map(Number);
const addressCoordinate = { lat, lon };
const addressRow = coordinateRows[0];
const municipality = String(addressRow.kommunenummer ?? addressRow.kommune?.kommunenummer ?? '0301');
const addressCode = String(addressRow.adressekode ?? addressRow.adressenavn?.adressekode ?? 'unknown');
const addressNumber = `${addressRow.nummer ?? 37}${addressRow.bokstav ?? ''}`;
const geonorgeSourceId = `geonorge-adresser-v1:${municipality}:${addressCode}:${addressNumber}`;

const way = osm.elements?.find((entry) => entry.type === 'way' && entry.id === 38316703);
assert(way, 'OSM way 38316703 was not returned.');
const tags = way.tags ?? {};
const osmName = normalize(`${tags.name ?? ''} ${tags['name:no'] ?? ''} ${tags['name:en'] ?? ''}`);
assert(osmName.includes('handelshoyskolen bi') || osmName.includes('bi norwegian business school'), 'OSM way no longer names the BI campus.');
assert(['college', 'university'].includes(tags.amenity) || tags.building === 'university', 'OSM BI object no longer has an education/building classification.');
const nodes = new Map(osm.elements.filter((entry) => entry.type === 'node').map((entry) => [entry.id, entry]));
const polygon = (way.nodes ?? []).map((id) => nodes.get(id)).filter(Boolean).map((node) => ({ lat: Number(node.lat), lon: Number(node.lon) }));
assert(polygon.length >= 4, 'OSM BI campus geometry is incomplete.');
const siteReferencePoint = meanPoint(polygon);
const addressInsideSite = pointInPolygon(addressCoordinate, polygon);
const addressToSiteReferenceMeters = distanceMeters(addressCoordinate, siteReferencePoint);
assert(addressInsideSite || addressToSiteReferenceMeters < 200, `Official address point is ${addressToSiteReferenceMeters.toFixed(1)} m from the BI geometry.`);

const entity = wikidata.entities?.Q604629;
assert(entity, 'Wikidata Q604629 was not returned.');
const wikidataIdentity = Object.values(entity.labels ?? {}).some((label) => {
  const text = normalize(label?.value);
  return text.includes('handelshoyskolen bi') || text.includes('bi norwegian business school');
});
assert(wikidataIdentity, 'Wikidata Q604629 no longer resolves to BI Norwegian Business School.');
const wikidataOrgNumber = entity.claims?.P2333?.some((claim) => String(claim.mainsnak?.datavalue?.value).replace(/\s+/g, '') === '971228865')
  || entity.claims?.P1278?.some((claim) => String(claim.mainsnak?.datavalue?.value).replace(/\s+/g, '') === '971228865');

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const displacementMeters = distanceMeters(currentCoordinate, addressCoordinate);
const currentInsideSite = pointInPolygon(currentCoordinate, polygon);
const coordinateDecision = displacementMeters <= 3
  ? 'verify_existing_at_official_address_point'
  : 'promote_official_address_point';

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_bi_campus_oslo_nydalsveien_37',
  coordinateDecision,
  currentCoordinate,
  currentMarkerInsideOsmSite: currentInsideSite,
  candidate: {
    lat: addressCoordinate.lat,
    lon: addressCoordinate.lon,
    sourceProvider: 'official_address',
    sourceObjectId: geonorgeSourceId,
    sourceUrl: urls.geonorge,
    address: { street: 'Nydalsveien', number: '37', postcode: '0484', city: 'Oslo', country: 'NO' },
  },
  displacementMeters: Number(displacementMeters.toFixed(1)),
  osmSite: {
    sourceObjectId: 'osm-way:38316703',
    sourceUrl: urls.osmPage,
    referencePoint: siteReferencePoint,
    addressInsideSite,
    addressToSiteReferenceMeters: Number(addressToSiteReferenceMeters.toFixed(1)),
    amenity: tags.amenity ?? null,
    building: tags.building ?? null,
    wikidata: tags.wikidata ?? null,
  },
  sourceChecks: {
    biOfficialAddress: true,
    brregIdentityAndAddress: true,
    geonorgeUniqueExactAddressCoordinate: true,
    osmExactNamedInstitutionGeometry: true,
    wikidataIdentityMatches: true,
    wikidataOrganisationNumberMatches: Boolean(wikidataOrgNumber),
    osmWikidataMatches: tags.wikidata ? tags.wikidata === 'Q604629' : null,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: coordinateDecision === 'promote_official_address_point'
      ? 'Apply the unique Kartverket address point for Nydalsveien 37 as the canonical display marker, preserve OSM way 38316703 as supporting campus geometry, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.'
      : 'Keep the existing coordinate, add the unique Kartverket Nydalsveien 37 source and supporting OSM campus geometry, synchronize evidence/status fields, and keep protocol max batch at 195.',
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'building',
  },
};

await fs.writeFile(path.join(reportDir, 'bi-contact.html'), biContactHtml);
await fs.writeFile(path.join(reportDir, 'bi-campus-oslo.html'), biCampusHtml);
await fs.writeFile(path.join(reportDir, 'brreg-971228865.json'), `${JSON.stringify(brreg, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'geonorge-nydalsveien-37.json'), `${JSON.stringify(geonorge, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'osm-way-38316703-full.json'), `${JSON.stringify(osm, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'wikidata-Q604629.json'), `${JSON.stringify(wikidata, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# BI Nydalen coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **BI Campus Oslo, Nydalsveien 37**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Kartverket address point: **${addressCoordinate.lat}, ${addressCoordinate.lon}**\n- Displacement: **${summary.displacementMeters} m**\n- Current marker inside OSM site: **${currentInsideSite ? 'yes' : 'no'}**\n- Address point inside OSM site: **${addressInsideSite ? 'yes' : 'no'}**\n- OSM site object: **way 38316703**\n- Official organisation number: **971228865**\n- Recommendation: **${coordinateDecision}**\n\nBI's official pages and Brønnøysund independently resolve Campus Oslo to Nydalsveien 37. Kartverket returns one exact coordinate for the address, and the named OSM education geometry is used as the physical campus cross-check. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'bi_nydalen_research_complete',
  reportDir: reportRel,
  displacementMeters: summary.displacementMeters,
  addressInsideSite,
  geonorgeSourceId,
  recommendation: coordinateDecision,
}, null, 2));
