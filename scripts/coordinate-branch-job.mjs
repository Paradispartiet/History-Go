import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-bla-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/subkultur/oslo/places_subkultur/bla.json';
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
const addressText = (record) => {
  const address = record?.forretningsadresse ?? record?.beliggenhetsadresse ?? record?.postadresse ?? {};
  return [...(address.adresse ?? []), address.postnummer, address.poststed].filter(Boolean).join(' ');
};
const osmSourceId = (candidate) => `osm-${candidate.osm_type}:${candidate.osm_id}`;

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this research must stay post-195.');

const place = await readJson(placeRel);
assert(place.id === 'bla', 'Unexpected place identity.');
assert(place.coordStatus == null, 'Blå already has a coordinate status; manual reconciliation required.');
assert(Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)), 'Current Blå marker is missing.');

const urls = {
  officialContact: 'https://www.blaaoslo.no/kontakt-oss',
  officialAbout: 'https://www.blaaoslo.no/om-blaa',
  brregMain: 'https://data.brreg.no/enhetsregisteret/api/enheter/979194803',
  brregSubunit: 'https://data.brreg.no/enhetsregisteret/api/underenheter/979197071',
  geonorge: 'https://ws.geonorge.no/adresser/v1/sok?sok=Brenneriveien%209%20C%20Oslo&treffPerSide=20',
  nominatim: 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&namedetails=1&limit=10&q=Bl%C3%A5%20Brenneriveien%209C%20Oslo',
  wikidataApi: 'https://www.wikidata.org/wiki/Special:EntityData/Q2907430.json',
  wikidataPage: 'https://www.wikidata.org/wiki/Q2907430',
};

const [officialContactHtml, officialAboutHtml, brregMain, brregSubunit, geonorge, nominatim, wikidata] = await Promise.all([
  fetchText(urls.officialContact, 'text/html,*/*;q=0.8'),
  fetchText(urls.officialAbout, 'text/html,*/*;q=0.8'),
  fetchJson(urls.brregMain),
  fetchJson(urls.brregSubunit),
  fetchJson(urls.geonorge),
  fetchJson(urls.nominatim),
  fetchJson(urls.wikidataApi),
]);

const officialText = normalize(`${officialContactHtml} ${officialAboutHtml}`);
assert(officialText.includes('brenneriveien 9c') && officialText.includes('0182 oslo'), 'BLÅ official pages no longer resolve the venue to Brenneriveien 9C, 0182 Oslo.');
assert(officialText.includes('1998'), 'BLÅ official history no longer supports the 1998 venue identity.');
assert(brregMain.organisasjonsnummer === '979194803', 'Unexpected Brenneriveien Jazzhus main-unit identity.');
assert(normalize(brregMain.navn).includes('brenneriveien jazzhus'), 'Brønnøysund main unit no longer resolves to Brenneriveien Jazzhus AS.');
assert(normalize(addressText(brregMain)).includes('brenneriveien 9 c 0182 oslo'), 'Brønnøysund main unit no longer resolves to Brenneriveien 9 C, 0182 Oslo.');
assert(brregSubunit.organisasjonsnummer === '979197071', 'Unexpected Brenneriveien Jazzhus subunit identity.');
assert(normalize(addressText(brregSubunit)).includes('brenneriveien 9 c 0182 oslo'), 'Brønnøysund subunit no longer resolves to Brenneriveien 9 C, 0182 Oslo.');

const exactRows = (geonorge.adresser ?? []).filter((entry) => normalize(entry.adressenavn ?? entry.adressetekst).includes('brenneriveien')
  && Number(entry.nummer) === 9
  && normalize(entry.bokstav) === 'c'
  && String(entry.postnummer ?? '') === '0182'
  && String(entry.kommunenummer ?? entry.kommune?.kommunenummer ?? '') === '0301');
assert(exactRows.length > 0, 'Kartverket returned no exact Brenneriveien 9 C, 0182 Oslo result.');
const coordinates = new Map();
for (const entry of exactRows) {
  const lat = Number(entry.representasjonspunkt?.lat);
  const lon = Number(entry.representasjonspunkt?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  const key = `${lat.toFixed(8)},${lon.toFixed(8)}`;
  if (!coordinates.has(key)) coordinates.set(key, []);
  coordinates.get(key).push(entry);
}
assert(coordinates.size === 1, `Kartverket returned ${coordinates.size} distinct exact coordinates for Brenneriveien 9 C.`);
const [coordinateKey, coordinateRows] = [...coordinates.entries()][0];
const [lat, lon] = coordinateKey.split(',').map(Number);
const addressCoordinate = { lat, lon };
const addressRow = coordinateRows[0];
const municipality = String(addressRow.kommunenummer ?? addressRow.kommune?.kommunenummer ?? '0301');
const addressCode = String(addressRow.adressekode ?? addressRow.adressenavn?.adressekode ?? 'unknown');
const addressNumber = `${addressRow.nummer ?? 9}${addressRow.bokstav ?? 'C'}`;
const geonorgeSourceId = `geonorge-adresser-v1:${municipality}:${addressCode}:${addressNumber}`;

assert(Array.isArray(nominatim) && nominatim.length > 0, 'Nominatim returned no Blå candidates.');
const rankedOsm = nominatim.map((candidate) => {
  const name = normalize(candidate.namedetails?.name ?? candidate.name ?? candidate.display_name);
  const road = normalize(candidate.address?.road ?? candidate.display_name);
  const houseNumber = normalize(candidate.address?.house_number ?? candidate.display_name);
  const wikidataId = candidate.extratags?.wikidata ?? null;
  let score = 0;
  if (wikidataId === 'Q2907430') score += 100;
  if (name === 'bla' || name.startsWith('bla ')) score += 55;
  if (road.includes('brenneriveien')) score += 30;
  if (houseNumber.includes('9c') || houseNumber.includes('9 c')) score += 20;
  if (['music_venue', 'nightclub', 'bar', 'arts_centre'].includes(candidate.type)) score += 10;
  return { candidate, score, name, road, houseNumber, wikidataId };
}).sort((a, b) => b.score - a.score || Number(a.candidate.place_rank ?? 99) - Number(b.candidate.place_rank ?? 99));
const selectedOsm = rankedOsm[0];
assert(selectedOsm.score >= 85, `Best OSM venue candidate scored only ${selectedOsm.score}.`);
assert(['node', 'way', 'relation'].includes(selectedOsm.candidate.osm_type), 'OSM candidate has unsupported object type.');
const osmApiUrl = selectedOsm.candidate.osm_type === 'node'
  ? `https://api.openstreetmap.org/api/0.6/node/${selectedOsm.candidate.osm_id}.json`
  : `https://api.openstreetmap.org/api/0.6/${selectedOsm.candidate.osm_type}/${selectedOsm.candidate.osm_id}/full.json`;
const osmObject = await fetchJson(osmApiUrl);
const osmCoordinate = {
  lat: Number(selectedOsm.candidate.lat),
  lon: Number(selectedOsm.candidate.lon),
};
assert(Number.isFinite(osmCoordinate.lat) && Number.isFinite(osmCoordinate.lon), 'Selected OSM venue candidate lacks a representative coordinate.');
const addressToOsmMeters = distanceMeters(addressCoordinate, osmCoordinate);
assert(addressToOsmMeters < 150, `Selected OSM venue object is ${addressToOsmMeters.toFixed(1)} m from the official address point.`);

const entity = wikidata.entities?.Q2907430;
assert(entity, 'Wikidata Q2907430 was not returned.');
const wikidataIdentity = Object.values(entity.labels ?? {}).some((label) => normalize(label?.value) === 'bla');
assert(wikidataIdentity, 'Wikidata Q2907430 no longer resolves to Blå.');
const coordinateClaim = entity.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
assert(coordinateClaim, 'Wikidata Blå coordinate claim is missing.');
const wikidataCoordinate = {
  lat: Number(coordinateClaim.latitude),
  lon: Number(coordinateClaim.longitude),
};
const addressToWikidataMeters = distanceMeters(addressCoordinate, wikidataCoordinate);
assert(addressToWikidataMeters < 150, `Wikidata Blå point is ${addressToWikidataMeters.toFixed(1)} m from the official address point.`);
const osmClaimMatches = entity.claims?.P11693?.some((claim) => String(claim.mainsnak?.datavalue?.value) === String(selectedOsm.candidate.osm_id)) ?? false;

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const displacementMeters = distanceMeters(currentCoordinate, addressCoordinate);
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
  identityDecision: 'resolved_bla_brenneriveien_9c',
  coordinateDecision,
  currentCoordinate,
  candidate: {
    lat: addressCoordinate.lat,
    lon: addressCoordinate.lon,
    sourceProvider: 'official_address',
    sourceObjectId: geonorgeSourceId,
    sourceUrl: urls.geonorge,
    address: { street: 'Brenneriveien', number: '9 C', postcode: '0182', city: 'Oslo', country: 'NO' },
  },
  displacementMeters: Number(displacementMeters.toFixed(1)),
  osmVenue: {
    sourceObjectId: osmSourceId(selectedOsm.candidate),
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.candidate.osm_type}/${selectedOsm.candidate.osm_id}`,
    representativeCoordinate: osmCoordinate,
    addressToOsmMeters: Number(addressToOsmMeters.toFixed(1)),
    selectedScore: selectedOsm.score,
    wikidata: selectedOsm.wikidataId,
    type: selectedOsm.candidate.type ?? null,
    category: selectedOsm.candidate.category ?? null,
  },
  wikidata: {
    sourceObjectId: 'wikidata:Q2907430',
    sourceUrl: urls.wikidataPage,
    coordinate: wikidataCoordinate,
    addressToWikidataMeters: Number(addressToWikidataMeters.toFixed(1)),
    linksSelectedOsmId: osmClaimMatches,
  },
  sourceChecks: {
    officialVenueAddressAndHistory: true,
    brregMainUnitIdentityAndAddress: true,
    brregSubunitIdentityAndAddress: true,
    geonorgeUniqueExactAddressCoordinate: true,
    osmVenueIdentityAndProximity: true,
    wikidataIdentityAndProximity: true,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: coordinateDecision === 'promote_official_address_point'
      ? `Apply the unique Kartverket address point for Brenneriveien 9 C as the canonical display marker, preserve ${osmSourceId(selectedOsm.candidate)} and Wikidata Q2907430 as supporting venue identity, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.`
      : `Keep the existing coordinate, add the unique Kartverket Brenneriveien 9 C source plus ${osmSourceId(selectedOsm.candidate)} and Wikidata identity evidence, synchronize status fields, and keep protocol max batch at 195.`,
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'venue',
  },
};

await fs.writeFile(path.join(reportDir, 'bla-contact.html'), officialContactHtml);
await fs.writeFile(path.join(reportDir, 'bla-about.html'), officialAboutHtml);
await fs.writeFile(path.join(reportDir, 'brreg-main-979194803.json'), `${JSON.stringify(brregMain, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'brreg-subunit-979197071.json'), `${JSON.stringify(brregSubunit, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'geonorge-brenneriveien-9c.json'), `${JSON.stringify(geonorge, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'nominatim-bla.json'), `${JSON.stringify(nominatim, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, `${selectedOsm.candidate.osm_type}-${selectedOsm.candidate.osm_id}.json`), `${JSON.stringify(osmObject, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'wikidata-Q2907430.json'), `${JSON.stringify(wikidata, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Blå coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Blå, Brenneriveien 9 C**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Kartverket address point: **${addressCoordinate.lat}, ${addressCoordinate.lon}**\n- Displacement: **${summary.displacementMeters} m**\n- OSM venue object: **${summary.osmVenue.sourceObjectId}**\n- OSM/address distance: **${summary.osmVenue.addressToOsmMeters} m**\n- Wikidata object: **Q2907430**\n- Wikidata/address distance: **${summary.wikidata.addressToWikidataMeters} m**\n- Recommendation: **${coordinateDecision}**\n\nBLÅ's official pages and Brenneriveien Jazzhus' main and operating units independently resolve the venue to Brenneriveien 9 C. Kartverket supplies the exact address point, while OSM and Wikidata provide supporting venue identity. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'bla_research_complete',
  reportDir: reportRel,
  displacementMeters: summary.displacementMeters,
  geonorgeSourceId,
  osmSourceObjectId: summary.osmVenue.sourceObjectId,
  recommendation: coordinateDecision,
}, null, 2));
