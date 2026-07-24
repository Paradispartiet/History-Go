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
  geonorgeStructured: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Brenneriveien&nummer=9&bokstav=C&kommunenummer=0301&treffPerSide=20',
  geonorgeBroad: 'https://ws.geonorge.no/adresser/v1/sok?sok=Brenneriveien%209%20Oslo&treffPerSide=50',
  nominatim: 'https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&namedetails=1&limit=10&q=Bl%C3%A5%20Brenneriveien%209C%20Oslo',
  wikidataApi: 'https://www.wikidata.org/wiki/Special:EntityData/Q2907430.json',
  wikidataPage: 'https://www.wikidata.org/wiki/Q2907430',
};

const [officialContactHtml, officialAboutHtml, brregMain, brregSubunit, geonorgeStructured, geonorgeBroad, nominatim, wikidata] = await Promise.all([
  fetchText(urls.officialContact, 'text/html,*/*;q=0.8'),
  fetchText(urls.officialAbout, 'text/html,*/*;q=0.8'),
  fetchJson(urls.brregMain),
  fetchJson(urls.brregSubunit),
  fetchJson(urls.geonorgeStructured),
  fetchJson(urls.geonorgeBroad),
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

const geonorgeRows = [...(geonorgeStructured.adresser ?? []), ...(geonorgeBroad.adresser ?? [])];
const nearbyAddressRows = geonorgeRows.filter((entry) => {
  const text = normalize(`${entry.adressetekst ?? ''} ${entry.adressenavn ?? ''} ${entry.nummer ?? ''}${entry.bokstav ?? ''}`);
  return text.includes('brenneriveien') && (Number(entry.nummer) === 9 || text.includes('brenneriveien 9'));
});
const geonorgeCandidates = nearbyAddressRows.map((entry) => ({
  addressText: entry.adressetekst ?? null,
  number: entry.nummer ?? null,
  letter: entry.bokstav ?? null,
  postcode: entry.postnummer ?? null,
  municipality: entry.kommunenummer ?? entry.kommune?.kommunenummer ?? null,
  lat: Number(entry.representasjonspunkt?.lat),
  lon: Number(entry.representasjonspunkt?.lon),
})).filter((entry) => Number.isFinite(entry.lat) && Number.isFinite(entry.lon));

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
const osmCoordinate = { lat: Number(selectedOsm.candidate.lat), lon: Number(selectedOsm.candidate.lon) };
assert(Number.isFinite(osmCoordinate.lat) && Number.isFinite(osmCoordinate.lon), 'Selected OSM venue candidate lacks a representative coordinate.');

const entity = wikidata.entities?.Q2907430;
assert(entity, 'Wikidata Q2907430 was not returned.');
const wikidataIdentity = Object.values(entity.labels ?? {}).some((label) => normalize(label?.value) === 'bla');
assert(wikidataIdentity, 'Wikidata Q2907430 no longer resolves to Blå.');
const coordinateClaim = entity.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
assert(coordinateClaim, 'Wikidata Blå coordinate claim is missing.');
const wikidataCoordinate = { lat: Number(coordinateClaim.latitude), lon: Number(coordinateClaim.longitude) };
const osmToWikidataMeters = distanceMeters(osmCoordinate, wikidataCoordinate);
assert(osmToWikidataMeters < 100, `OSM and Wikidata venue points disagree by ${osmToWikidataMeters.toFixed(1)} m.`);
const osmClaimMatches = entity.claims?.P11693?.some((claim) => String(claim.mainsnak?.datavalue?.value) === String(selectedOsm.candidate.osm_id)) ?? false;

const geonorgeDistances = geonorgeCandidates.map((candidate) => ({
  ...candidate,
  distanceToOsmMeters: Number(distanceMeters(candidate, osmCoordinate).toFixed(1)),
})).sort((a, b) => a.distanceToOsmMeters - b.distanceToOsmMeters);
const nearestGeonorge = geonorgeDistances[0] ?? null;
assert(!nearestGeonorge || nearestGeonorge.distanceToOsmMeters < 250, `Nearest Kartverket Brenneriveien 9 address is ${nearestGeonorge.distanceToOsmMeters} m from the venue.`);

const currentCoordinate = { lat: Number(place.lat), lon: Number(place.lon) };
const displacementMeters = distanceMeters(currentCoordinate, osmCoordinate);
assert(displacementMeters > 3, 'Current marker already coincides with the exact venue point; manual status-only review required.');

const sourceObjectId = osmSourceId(selectedOsm.candidate);
const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_bla_brenneriveien_9c',
  coordinateDecision: 'promote_exact_named_venue_point',
  currentCoordinate,
  candidate: {
    lat: osmCoordinate.lat,
    lon: osmCoordinate.lon,
    sourceProvider: 'osm',
    sourceObjectId,
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.candidate.osm_type}/${selectedOsm.candidate.osm_id}`,
    objectType: selectedOsm.candidate.type ?? selectedOsm.candidate.category ?? 'venue',
    wikidata: selectedOsm.wikidataId,
  },
  displacementMeters: Number(displacementMeters.toFixed(1)),
  officialAddress: {
    address: 'Brenneriveien 9 C, 0182 Oslo',
    mainOrganisationNumber: '979194803',
    operatingUnitNumber: '979197071',
  },
  geonorgeAddressContext: {
    dedicated9cPointFound: geonorgeCandidates.some((candidate) => normalize(candidate.letter) === 'c'),
    candidateCount: geonorgeCandidates.length,
    nearestCandidate: nearestGeonorge,
    decision: geonorgeCandidates.some((candidate) => normalize(candidate.letter) === 'c')
      ? 'dedicated_or_explicit_9c_address_context_found'
      : 'no_dedicated_9c_point_use_named_venue_geometry',
  },
  osmVenue: {
    sourceObjectId,
    sourceUrl: `https://www.openstreetmap.org/${selectedOsm.candidate.osm_type}/${selectedOsm.candidate.osm_id}`,
    coordinate: osmCoordinate,
    selectedScore: selectedOsm.score,
    wikidata: selectedOsm.wikidataId,
    type: selectedOsm.candidate.type ?? null,
    category: selectedOsm.candidate.category ?? null,
  },
  wikidata: {
    sourceObjectId: 'wikidata:Q2907430',
    sourceUrl: urls.wikidataPage,
    coordinate: wikidataCoordinate,
    osmAgreementMeters: Number(osmToWikidataMeters.toFixed(1)),
    linksSelectedOsmId: osmClaimMatches,
  },
  sourceChecks: {
    officialVenueAddressAndHistory: true,
    brregMainUnitIdentityAndAddress: true,
    brregSubunitIdentityAndAddress: true,
    osmExactNamedVenue: true,
    wikidataIdentityAndCoordinateAgreement: true,
    geonorgeAddressContextReviewed: true,
  },
  recommendation: {
    canBecomeVerified: true,
    nextAction: `Apply ${sourceObjectId} as the canonical exact named venue point, preserve BLÅ and Brønnøysund address identity plus Wikidata Q2907430 and Kartverket address context, add coordinate evidence, synchronize aggregate/index copies, and keep protocol max batch at 195.`,
    coordStatus: 'verified_geometry',
    coordType: 'venue_point',
    locatorType: 'venue',
  },
};

await fs.writeFile(path.join(reportDir, 'bla-contact.html'), officialContactHtml);
await fs.writeFile(path.join(reportDir, 'bla-about.html'), officialAboutHtml);
await fs.writeFile(path.join(reportDir, 'brreg-main-979194803.json'), `${JSON.stringify(brregMain, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'brreg-subunit-979197071.json'), `${JSON.stringify(brregSubunit, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'geonorge-structured.json'), `${JSON.stringify(geonorgeStructured, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'geonorge-broad.json'), `${JSON.stringify(geonorgeBroad, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'nominatim-bla.json'), `${JSON.stringify(nominatim, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, `${selectedOsm.candidate.osm_type}-${selectedOsm.candidate.osm_id}.json`), `${JSON.stringify(osmObject, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'wikidata-Q2907430.json'), `${JSON.stringify(wikidata, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Blå coordinate research after post-195 closure\n\n- Canonical data changed: **no**\n- Protocol max batch: **${protocolMaxBatch}**\n- Identity: **Blå, Brenneriveien 9 C**\n- Current marker: **${currentCoordinate.lat}, ${currentCoordinate.lon}**\n- Exact named OSM venue point: **${osmCoordinate.lat}, ${osmCoordinate.lon}**\n- Displacement: **${summary.displacementMeters} m**\n- OSM venue object: **${sourceObjectId}**\n- Wikidata object: **Q2907430**\n- OSM/Wikidata agreement: **${summary.wikidata.osmAgreementMeters} m**\n- Dedicated Kartverket 9C point: **${summary.geonorgeAddressContext.dedicated9cPointFound ? 'yes' : 'no'}**\n- Recommendation: **promote_exact_named_venue_point**\n\nBLÅ's official pages and Brenneriveien Jazzhus' main and operating units independently resolve the venue to Brenneriveien 9 C. Kartverket does not have to be forced into a dedicated 9C point: the exact named OSM venue object, cross-checked with Wikidata Q2907430, is the proposed coordinate source. No batch 196 is created.\n`);

console.log(JSON.stringify({
  status: 'bla_research_complete',
  reportDir: reportRel,
  displacementMeters: summary.displacementMeters,
  osmSourceObjectId: sourceObjectId,
  recommendation: summary.coordinateDecision,
}, null, 2));
