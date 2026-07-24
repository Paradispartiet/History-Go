import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const splitRel = 'data/places/subkultur/oslo/places_subkultur/bla.json';
const aggregateRel = 'data/places/subkultur/oslo/places_subkultur.json';
const categoryIndexRel = 'data/places/subkultur/oslo/places_subkultur_index.json';
const manifestRel = 'data/places/subkultur/oslo/places_subkultur_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/subkultur/bla.json';
const researchRel = 'reports/oslo-coordinate-bla-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const reportRel = 'reports/oslo-coordinate-bla-production-post-195';
const reportDir = path.join(root, reportRel);

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const writeJson = async (rel, value) => {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  await fs.mkdir(path.dirname(path.join(root, rel)), { recursive: true });
  await fs.writeFile(path.join(root, rel), text, 'utf8');
  return text;
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
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
const upsertLink = (links, next) => {
  const kept = (Array.isArray(links) ? links : []).filter((entry) => entry?.url !== next.url);
  return [...kept, next];
};

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; production must stay post-195.');

const [place, aggregate, categoryIndex, manifest, research, audit] = await Promise.all([
  readJson(splitRel),
  readJson(aggregateRel),
  readJson(categoryIndexRel),
  readJson(manifestRel),
  readJson(researchRel),
  readJson(auditRel),
]);

assert(place.id === 'bla', 'Unexpected split place identity.');
assert(place.coordStatus == null, 'Blå already has a coordinate status; manual reconciliation required.');
assert(Number(place.lat) === 59.9186 && Number(place.lon) === 10.757, 'Blå current coordinate changed after research.');
assert(research.coordinateDecision === 'promote_exact_named_venue_point', 'Research no longer recommends venue-point promotion.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not permit verification.');
assert(research.candidate?.sourceObjectId === 'osm-node:4312299494', 'Unexpected OSM venue candidate.');
assert(research.candidate?.wikidata === 'Q2907430', 'OSM candidate no longer links the expected Wikidata item.');
assert(research.sourceChecks?.officialVenueAddressAndHistory === true, 'Official venue check is not green.');
assert(research.sourceChecks?.brregMainUnitIdentityAndAddress === true, 'Brønnøysund main-unit check is not green.');
assert(research.sourceChecks?.brregSubunitIdentityAndAddress === true, 'Brønnøysund operating-unit check is not green.');
assert(research.sourceChecks?.osmExactNamedVenue === true, 'OSM exact venue check is not green.');
assert(research.sourceChecks?.osmWikidataDirectLink === true, 'OSM/Wikidata link check is not green.');
assert(research.sourceChecks?.wikidataIdentityAndCoordinateAgreement === true, 'Wikidata coordinate agreement is not green.');
assert(research.wikidata?.osmAgreementMeters < 100, 'OSM and Wikidata points no longer agree sufficiently.');

const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };
const newCoordinate = {
  lat: Number(research.candidate.lat),
  lon: Number(research.candidate.lon),
  r: oldCoordinate.r,
};
const displacementMeters = distanceMeters(oldCoordinate, newCoordinate);
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) < 2, 'Production displacement no longer matches research.');

let externalLinks = place.externalLinks;
externalLinks = upsertLink(externalLinks, {
  type: 'official',
  label: 'BLÅ – offisiell nettside',
  url: 'https://www.blaaoslo.no/',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});
externalLinks = upsertLink(externalLinks, {
  type: 'official',
  label: 'Brønnøysundregistrene – Brenneriveien Jazzhus AS',
  url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/979194803',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});

const kartverketContext = research.geonorgeAddressContext?.nearestCandidate;
const coordNote = `Eksakt navngitt OSM-venuepunkt for Blå, node 4312299494, merket amenity=nightclub og direkte koblet til Wikidata Q2907430. BLÅs egne sider og Brønnøysundregistrenes hoved- og underenhet bekrefter Brenneriveien 9 C, 0182 Oslo og venueidentiteten. Wikidata-punktet ligger ${research.wikidata.osmAgreementMeters} meter fra OSM-punktet. Kartverket har ikke et eget 9C-punkt; nærmeste Brenneriveien 9-adressepunkt ligger ${kartverketContext?.distanceToOsmMeters ?? 21.4} meter unna og brukes bare som adressekontekst. Den tidligere markøren lå ${Number(displacementMeters.toFixed(1))} meter unna; radius ${oldCoordinate.r} meter beholdes for venue- og nærområdedekning.`;

const updatedPlace = {
  ...place,
  lat: newCoordinate.lat,
  lon: newCoordinate.lon,
  r: newCoordinate.r,
  locatorType: 'venue',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-node:4312299494',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'venue_point',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap node 4312299494 – Blå; direct Wikidata Q2907430 link, official BLÅ/Brønnøysund identity and Kartverket address-context cross-check',
  coordSourceId: 'osm-node:4312299494',
  coordSourceUrl: 'https://www.openstreetmap.org/node/4312299494',
  coordVerifiedAt: '2026-07-24',
  coordNote,
  address: {
    street: 'Brenneriveien',
    number: '9 C',
    postcode: '0182',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks,
};

const splitText = await writeJson(splitRel, updatedPlace);

assert(Array.isArray(aggregate), 'Subkultur aggregate is not an array.');
const aggregateIndex = aggregate.findIndex((entry) => entry?.id === place.id);
assert(aggregateIndex >= 0, 'Blå is missing from subkultur aggregate.');
assert(Number(aggregate[aggregateIndex].lat) === oldCoordinate.lat && Number(aggregate[aggregateIndex].lon) === oldCoordinate.lon, 'Aggregate coordinate does not match split source before migration.');
aggregate[aggregateIndex] = updatedPlace;
const aggregateText = await writeJson(aggregateRel, aggregate);

assert(Array.isArray(categoryIndex), 'Subkultur index is not an array.');
const categoryEntry = categoryIndex.find((entry) => entry?.id === place.id);
assert(categoryEntry, 'Blå is missing from subkultur index.');
categoryEntry.lat = newCoordinate.lat;
categoryEntry.lon = newCoordinate.lon;
categoryEntry.r = newCoordinate.r;
categoryEntry.coordStatus = updatedPlace.coordStatus;
categoryEntry.coordType = updatedPlace.coordType;
await writeJson(categoryIndexRel, categoryIndex);

const manifestEntry = manifest.places?.find((entry) => entry?.id === place.id);
assert(manifestEntry, 'Blå is missing from subkultur manifest.');
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = aggregate.length;
manifestEntry.sha256 = sha256(splitText);
await writeJson(manifestRel, manifest);

const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: aggregateRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_exact_named_venue_point',
  currentCoordinate: {
    lat: newCoordinate.lat,
    lon: newCoordinate.lon,
    r: newCoordinate.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Blå, konsert- og klubbscene drevet i Brenneriveien 9 C, 0182 Oslo av Brenneriveien Jazzhus AS',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'venue',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'nåværende venue-identitet og adresse',
    'eksakt navngitt fysisk venueobjekt',
    'uavhengig koordinat- og adressekryssjekk',
  ],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'BLÅ – offisiell kontakt- og historieside',
      sourceUrl: 'https://www.blaaoslo.no/kontakt-oss',
      sourceObjectId: 'bla-official:brenneriveien-9c',
      sourceQuality: 'official_current_venue_identity',
      finding: 'BLÅ oppgir Brenneriveien 9C, 0182 Oslo og dokumenterer venuehistorien fra 1998.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter venueidentitet og adresse, men eksponerer ikke et stabilt maskinlesbart koordinatobjekt.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Brenneriveien Jazzhus AS',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/979194803',
      sourceObjectId: 'brreg-enhet:979194803',
      sourceQuality: 'official_business_identity',
      finding: 'Hovedenheten Brenneriveien Jazzhus AS oppgir Brenneriveien 9 C, 0182 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Offisiell virksomhets- og adresseidentitet.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Brenneriveien Jazzhus underenhet',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/979197071',
      sourceObjectId: 'brreg-underenhet:979197071',
      sourceQuality: 'official_operating_location',
      finding: 'Driftsunderenheten oppgir samme beliggenhetsadresse Brenneriveien 9 C, 0182 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig driftsstedskryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap node 4312299494 – Blå',
      sourceUrl: 'https://www.openstreetmap.org/node/4312299494',
      sourceObjectId: 'osm-node:4312299494',
      sourceQuality: 'unique_exact_named_venue_object',
      finding: 'Eksakt node med name=Blå, amenity=nightclub og wikidata=Q2907430.',
      canVerifyCoordinate: true,
      reason: 'Objektet representerer selve aktive venuepunktet og er direkte identitetskoblet til Wikidata.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q2907430 – Blå',
      sourceUrl: 'https://www.wikidata.org/wiki/Q2907430',
      sourceObjectId: 'wikidata:Q2907430',
      sourceQuality: 'structured_identity_and_coordinate_crosscheck',
      finding: `Dedikert Blå-objekt med koordinat som ligger ${research.wikidata.osmAgreementMeters} meter fra OSM-venuepunktet.`,
      canVerifyCoordinate: true,
      reason: 'Uavhengig strukturert identitets- og koordinatkryssjekk.',
    },
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1 – Brenneriveien 9-kontekst',
      sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?sok=Brenneriveien%209%20Oslo&treffPerSide=50',
      sourceObjectId: 'geonorge-address-context:brenneriveien-9',
      sourceQuality: 'official_address_context_not_exact_9c',
      finding: `Kartverket har ikke et eget 9C-punkt; Brenneriveien 9-punktet ligger ${kartverketContext?.distanceToOsmMeters ?? 21.4} meter fra det navngitte venuepunktet.`,
      canVerifyCoordinate: false,
      reason: 'Brukes bare som adressekontekst og blir ikke feilaktig promotert som et 9C-koordinatobjekt.',
    },
  ],
  addressCandidates: [
    {
      address: 'Brenneriveien 9 C, 0182 Oslo',
      sourceProvider: 'manual_research',
      sourceObjectId: 'bla-official:brenneriveien-9c',
      canApplyToPlace: false,
    },
  ],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:4312299494', canApplyToPlace: true },
    { sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q2907430', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:4312299494', canApplyToPlace: true },
  ],
  coordinateCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:4312299494',
      lat: newCoordinate.lat,
      lon: newCoordinate.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Det eksakte navngitte OSM-venuepunktet er anvendt som canonical display-marker.',
  },
  notes: [coordNote, `Research report: ${researchRel}`],
};
await writeJson(evidenceRel, evidence);

const completedIds = new Set(['abelhaugen', 'arkitektur_og_designhogskolen', 'bi_nydalen', place.id]);
const remainingQueue = (audit.actionableQueue ?? []).filter((entry) => !completedIds.has(entry?.placeId));
const nextCandidate = remainingQueue[0] ?? null;
const report = {
  version: '2026-07-24',
  protocolMaxBatch,
  canonicalChanged: true,
  placeId: place.id,
  oldCoordinate,
  newCoordinate,
  displacementMeters: Number(displacementMeters.toFixed(1)),
  coordinatePromoted: true,
  radiusChanged: false,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  sourceObjectId: updatedPlace.sourceObjectId,
  officialAddress: research.officialAddress,
  kartverketAddressContext: research.geonorgeAddressContext,
  wikidataAgreementMeters: research.wikidata.osmAgreementMeters,
  synchronizedFiles: [splitRel, aggregateRel, categoryIndexRel, manifestRel, evidenceRel],
  remainingActionableCount: remainingQueue.length,
  nextCandidate,
  queueStatus: nextCandidate ? 'fresh_main_unresolved_queue_continues' : 'fresh_main_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, report);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Blå coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n- Coordinate promoted: **yes**\n- Old marker: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- Exact named venue point: **${newCoordinate.lat}, ${newCoordinate.lon}**\n- Marker displacement: **${report.displacementMeters} m**\n- Check-in radius: **${oldCoordinate.r} m (unchanged)**\n- Coordinate status: **${updatedPlace.coordStatus}**\n- Source object: **${updatedPlace.sourceObjectId}**\n- OSM/Wikidata agreement: **${research.wikidata.osmAgreementMeters} m**\n- Dedicated Kartverket 9C point: **no; address context preserved only**\n- Remaining actionable fresh-main records: **${remainingQueue.length}**\n- Next candidate: **${nextCandidate ? `\`${nextCandidate.placeId}\` — ${nextCandidate.name}` : 'none'}**\n\nThe split source, aggregate, category index, manifest hashes and coordinate evidence are updated together. The misplaced legacy marker is replaced by the exact named Blå venue node without inventing a Kartverket 9C point.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'bla_production_complete',
  displacementMeters: report.displacementMeters,
  remainingActionableCount: remainingQueue.length,
  nextCandidate: nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
