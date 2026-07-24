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

assert(brregMain.organisasjonsnummer === '937268815', 'Unexpected Oslotech main-unit identity.');
assert(normalize(brregMain.navn) === 'oslotech as', 'Brønnøysund main unit no longer resolves to Oslotech AS.');
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
assert(coordinateGroups.size === 1, `Kartverket returned ${coordinateGroups.size} distinct exact coordinates for Gaustadalléen 21.`);
const [coordinateKey, coordinateRows] = [...coordinateGroups.entries()][0];
const [addressLat, addressLon] = coordinateKey.split(',').map(Number);
const addressCoordinate = { lat: addressLat, lon: addressLon };
const addressRow = coordinateRows[0];
const municipality = String(addressRow.kommunenummer ?? addressRow.kommune?.kommunenummer ?? '0301');
const addressCode = String(addressRow.adressekode ?? addressRow.adressenavn?.adressekode ?? 'unknown');
const addressNumber = `${addressRow.nummer ?? 21}${addressRow.bokstav ?? ''}`;
const geonorgeSourceId = `geonorge-adresser-v1:${municipality}:${addressCode}:${addressNumber}`;

const overpassQuery = `[out:json][timeout:30];(nwr(around:350,${addressCoordinate.lat},${addressCoordinate.lon})["name"~"Forskningsparken|Oslo Science Park",i];);out center tags;`;
const overpass = await fetchJson('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString(),
});

const transportLike = (tags) => Boolean(
  tags.public_transport
  || tags.railway
  || tags.highway === 'bus_stop'
  || tags.amenity === 'bus_station'
  || tags.station
  || tags.tram
  || tags.subway,
);
const rankedOsm = (overpass.elements ?? []).map((entry) => {
  const tags = entry.tags ?? {};
  const coordinate = objectCoordinate(entry);
  const distance = coordinate ? distanceMeters(addressCoordinate, coordinate) : Infinity;
  const names = normalize(`${tags.name ?? ''} ${tags['name:no'] ?? ''} ${tags['name:en'] ?? ''}`);
  const website = normalize(`${tags.website ?? ''} ${tags['contact:website'] ?? ''}`);
  const address = normalize(`${tags['addr:street'] ?? ''} ${tags['addr:housenumber'] ?? ''} ${tags['addr:postcode'] ?? ''}`);
  let score = 0;
  if (names.includes('forskningsparken')) score += 60;
  if (names.includes('oslo science park')) score += 45;
  if (website.includes('forskningsparken no') || website.includes('oslotech no')) score += 60;
  if (address.includes('gaustadalleen 21')) score += 35;
  if (tags.building && tags.building !== 'no') score += 20;
  if (tags.office || tags.landuse === 'commercial' || tags.amenity === 'research_institute') score += 15;
  if (distance <= 75) score += 25;
  else if (distance <= 150) score += 15;
  else if (distance <= 250) score += 5;
  if (transportLike(tags)) score -= 200;
  return {
    entry,
    tags,
    coordinate,
    distanceMeters: Number.isFinite(distance) ? Number(distance.toFixed(1)) : null,
    score,
    excludedAsTransport: transportLike(tags),
  };
}).sort((a, b) => b.score - a.score || (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));
const selectedOsm = rankedOsm.find((candidate) => !candidate.excludedAsTransport && candidate.coordinate && candidate.score >= 60) ?? null;
if (selectedOsm) {
  assert(selectedOsm.distanceMeters < 250, `Selected non-transport OSM object is ${selectedOsm.distanceMeters} m from the official address point.`);
}

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const displacementMeters = distanceMeters(currentCoordinate, addressCoordinate);
const currentToOsmMeters = selectedOsm ? distanceMeters(currentCoordinate, selectedOsm.coordinate) : null;
const addressToOsmMeters = selectedOsm?.distanceMeters ?? null;
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
  identityDecision: 'resolved_oslo_science_park_gaustadalleen_21',
  coordinateDecision,
  currentCoordinate,
  candidate: {
    lat: addressCoordinate.lat,
    lon: addressCoordinate.lon,
    sourceProvider: 'official_address',
    sourceObjectId: geonorgeSourceId,
    sourceUrl: urls.geonorge,
    address: {
      street: 'Gaustadalléen',
      number: '21',
      postcode: '0349',
      city: 'Oslo',
      country: 'NO',
    },
  },
  displacementMeters: Number(displacementMeters.toFixed(1)),
  supportingOsmObject: selectedOsm ? {
    sourceObjectId: osmSourceId(selectedOsm.entry),
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.entry.type}/${selectedOsm.entry.id}`,
    coordinate: selectedOsm.coordinate,
    addressToObjectMeters: addressToOsmMeters,
    currentToObjectMeters: Number(currentToOsmMeters.toFixed(1)),
    score: selectedOsm.score,
    tags: selectedOsm.tags,
  } : null,
  rejectedTransportObjects: rankedOsm.filter((candidate) => candidate.excludedAsTransport).map((candidate) => ({
    sourceObjectId: osmSourceId(candidate.entry),
    name: candidate.tags.name ?? null,
    reason: 'transport_object_not_science_park_building',
    distanceMeters: candidate.distanceMeters,
  })),
  sourceChecks: {
    officialAddressAndOrganisationNumber: true,
    official1989History: true,
    brregMainUnitIdentityAndAddress: true,
    brregOperatingUnitIdentityAndAddress: true,
    geonorgeUniqueExactAddressCoordinate: true,
    transportObjectsExcluded: true,
    supportingNonTransportOsmObjectFound: Boolean(selectedOsm),
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: coordinateDecision === 'promote_official_address_point'
      ? `Apply the unique Kartverket address point for Gaustadalléen 21 as the canonical display marker, preserve Oslotech and official Forskningsparken identity, ${selectedOsm ? `use ${osmSourceId(selectedOsm.entry)} as supporting non-transport geometry, ` : ''}add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.`
      : `Keep the existing coordinate, attach the unique Kartverket Gaustadalléen 21 source and official Oslotech identity${selectedOsm ? ` plus supporting ${osmSourceId(selectedOsm.entry)}` : ''}, synchronize status fields, and keep protocol max batch at 195.`,
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'building',
  },
};

await fs.writeFile(path.join(reportDir, 'forskningsparken-about.html'), officialAbout);
await fs.writeFile(path.join(reportDir, 'forskningsparken-contact.html'), officialContact);
await fs.writeFile(path.join(reportDir, 'forskningsparken-history.html'), officialHistory);
await fs.writeFile(path.join(reportDir, 'brreg-main-937268815.json'), `${JSON.stringify(brregMain, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'brreg-subunit-974166194.json'), `${JSON.stringify(brregSubunit, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'geonorge-gaustadalleen-21.json'), `${JSON.stringify(geonorge, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'overpass-forskningsparken.json'), `${JSON.stringify(overpass, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Forskningsparken coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Forskningsparken / Oslo Science Park, Gaustadalléen 21**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Kartverket address point: **${addressCoordinate.lat}, ${addressCoordinate.lon}**\n- Displacement: **${summary.displacementMeters} m**\n- Supporting non-transport OSM object: **${summary.supportingOsmObject?.sourceObjectId ?? 'none found'}**\n- Rejected same-name transport objects: **${summary.rejectedTransportObjects.length}**\n- Official operator: **Oslotech AS, 937268815**\n- Recommendation: **${coordinateDecision}**\n\nThe official Forskningsparken pages and both Brønnøysund units independently resolve the science park to Gaustadalléen 21. Kartverket supplies one exact address coordinate. Same-name transit objects are explicitly excluded from the building identity. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'forskningsparken_research_complete',
  reportDir: reportRel,
  displacementMeters: summary.displacementMeters,
  geonorgeSourceId,
  supportingOsmObject: summary.supportingOsmObject?.sourceObjectId ?? null,
  rejectedTransportObjects: summary.rejectedTransportObjects.length,
  recommendation: coordinateDecision,
}, null, 2));
