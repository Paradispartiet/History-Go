import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/arkitektur_og_designhogskolen.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/arkitektur_og_designhogskolen.json';
const researchRel = 'reports/oslo-coordinate-aho-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const reportRel = 'reports/oslo-coordinate-aho-production-post-195';
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
const upsertExternalLink = (links, next) => {
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

assert(place.id === 'arkitektur_og_designhogskolen', 'Unexpected split place identity.');
assert(place.coordStatus == null, 'AHO already has a coordinate status; manual reconciliation required.');
assert(Number(place.lat) === 59.9232 && Number(place.lon) === 10.7589, 'AHO current coordinate changed after research.');
assert(research.coordinateDecision === 'promote_official_address_point', 'Research no longer recommends the address point.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not permit verification.');
assert(research.candidate?.sourceObjectId === 'geonorge-adresser-v1:0301:14622:29', 'Unexpected Kartverket candidate.');
assert(research.sourceChecks?.brregMainUnitAddress === true, 'Brønnøysund main-unit check is not green.');
assert(research.sourceChecks?.brregSubunitAddress === true, 'Brønnøysund subunit check is not green.');
assert(research.sourceChecks?.geonorgeUniqueExactAddressCoordinate === true, 'Kartverket exact-address check is not green.');
assert(research.sourceChecks?.osmExactNamedInstitutionGeometry === true, 'OSM campus identity check is not green.');
assert(research.sourceChecks?.osmOrganisationNumberMatches === true, 'OSM organisation-number check is not green.');
assert(research.sourceChecks?.osmWikidataMatches === true, 'OSM/Wikidata check is not green.');
assert(research.sourceChecks?.wikidataIdentityMatches === true, 'Wikidata identity check is not green.');
assert(research.sourceChecks?.osloByleksikonIdentity === true, 'Oslo Byleksikon identity check is not green.');
assert(research.osmSite?.addressInsideSite === true, 'Official address point no longer lies inside the AHO campus geometry.');

const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };
const newCoordinate = {
  lat: Number(research.candidate.lat),
  lon: Number(research.candidate.lon),
  r: oldCoordinate.r,
};
const displacementMeters = distanceMeters(oldCoordinate, newCoordinate);
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) < 2, 'Production displacement no longer matches research.');

let externalLinks = place.externalLinks;
externalLinks = upsertExternalLink(externalLinks, {
  type: 'official',
  label: 'AHO – offisiell nettside',
  url: 'https://aho.no/',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});
externalLinks = upsertExternalLink(externalLinks, {
  type: 'official',
  label: 'Brønnøysundregistrene – AHO',
  url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971526378',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});
externalLinks = upsertExternalLink(externalLinks, {
  type: 'source',
  label: 'Oslo byleksikon – Arkitektur- og designhøgskolen i Oslo',
  url: 'https://oslobyleksikon.no/side/Arkitektur-_og_designh%C3%B8gskolen_i_Oslo',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});

const coordNote = `Offisiell adressekoordinat fra Kartverket/Geonorge for Maridalsveien 29, 0175 Oslo. Brønnøysundregistrenes hovedenhet og underenhet oppgir samme besøksadresse. Punktet ligger inne i den navngitte OSM-campusgeometrien way 1420826219, som bærer organisasjonsnummer 971526378 og Wikidata Q4579140. Oslo byleksikon bekrefter institusjonen, adressen og etableringen i 1945. Den tidligere markøren lå ${Number(displacementMeters.toFixed(1))} meter unna og utenfor campusområdet; radius ${oldCoordinate.r} meter beholdes for å dekke institusjonsområdet.`;

const updatedPlace = {
  ...place,
  lat: newCoordinate.lat,
  lon: newCoordinate.lon,
  r: newCoordinate.r,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:14622:29',
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:14622:29',
  coordSourceUrl: research.candidate.sourceUrl,
  coordVerifiedAt: '2026-07-24',
  coordNote,
  address: {
    street: 'Maridalsveien',
    number: '29',
    postcode: '0175',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks,
};

const splitText = await writeJson(splitRel, updatedPlace);

assert(Array.isArray(aggregate), 'Vitenskap aggregate is not an array.');
const aggregateIndex = aggregate.findIndex((entry) => entry?.id === place.id);
assert(aggregateIndex >= 0, 'AHO is missing from vitenskap aggregate.');
assert(Number(aggregate[aggregateIndex].lat) === oldCoordinate.lat && Number(aggregate[aggregateIndex].lon) === oldCoordinate.lon, 'Aggregate coordinate does not match split source before migration.');
aggregate[aggregateIndex] = updatedPlace;
const aggregateText = await writeJson(aggregateRel, aggregate);

assert(Array.isArray(categoryIndex), 'Vitenskap index is not an array.');
const categoryEntry = categoryIndex.find((entry) => entry?.id === place.id);
assert(categoryEntry, 'AHO is missing from vitenskap index.');
categoryEntry.lat = newCoordinate.lat;
categoryEntry.lon = newCoordinate.lon;
categoryEntry.r = newCoordinate.r;
categoryEntry.coordStatus = updatedPlace.coordStatus;
categoryEntry.coordType = updatedPlace.coordType;
await writeJson(categoryIndexRel, categoryIndex);

const manifestEntry = manifest.places?.find((entry) => entry?.id === place.id);
assert(manifestEntry, 'AHO is missing from vitenskap manifest.');
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = aggregate.length;
manifestEntry.sha256 = sha256(splitText);
await writeJson(manifestRel, manifest);

const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_address_point',
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
    resolvedIdentity: 'Arkitektur- og designhøgskolen i Oslo (AHO), organisasjonsnummer 971526378, ved Maridalsveien 29, 0175 Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt offisiell besøksadresse',
    'institusjonsidentitet og organisasjonsnummer',
    'geometrisk campuskryssjekk',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Geonorge Adresser API v1 – Maridalsveien 29',
      sourceUrl: research.candidate.sourceUrl,
      sourceObjectId: 'geonorge-adresser-v1:0301:14622:29',
      sourceQuality: 'official_address',
      finding: 'Ett unikt offisielt adressepunkt for Maridalsveien 29, 0175 Oslo.',
      canVerifyCoordinate: true,
      reason: 'Kartverkets offisielle adressepunkt brukes som canonical display-marker for institusjonen.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – hovedenhet 971526378',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971526378',
      sourceObjectId: 'brreg-enhet:971526378',
      sourceQuality: 'official_institution_identity',
      finding: 'Hovedenheten Arkitektur- og designhøgskolen i Oslo har forretningsadresse Maridalsveien 29, 0175 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Offisiell institusjons- og adresseidentitet; koordinaten leveres av Kartverket.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – underenhet 974714698',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/974714698',
      sourceObjectId: 'brreg-underenhet:974714698',
      sourceQuality: 'official_operating_location',
      finding: 'Underenheten oppgir beliggenhetsadresse Maridalsveien 29, 0175 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig adressekryssjekk for driftsstedet.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 1420826219 – Arkitektur- og designhøgskolen i Oslo',
      sourceUrl: research.osmSite.sourceUrl,
      sourceObjectId: 'osm-way:1420826219',
      sourceQuality: 'named_institution_site_geometry',
      finding: `Navngitt amenity=college-geometri med ref=971526378 og wikidata=Q4579140. Det offisielle adressepunktet ligger inne i geometrien og ${research.osmSite.addressToSiteReferenceMeters} meter fra områdets referansepunkt.`,
      canVerifyCoordinate: true,
      reason: 'Campusgeometrien bekrefter at Kartverkets adressepunkt faktisk ligger på AHO-anlegget.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q4579140 – Oslo School of Architecture and Design',
      sourceUrl: 'https://www.wikidata.org/wiki/Q4579140',
      sourceObjectId: 'wikidata:Q4579140',
      sourceQuality: 'structured_identity_crosscheck',
      finding: 'Dedikert institusjonsobjekt som samsvarer med AHO og organisasjonsnummeret i OSM/Brønnøysund.',
      canVerifyCoordinate: false,
      reason: 'Identitetskryssjekk; Kartverket er koordinatkilden.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo Byleksikon – Arkitektur- og designhøgskolen i Oslo',
      sourceUrl: 'https://oslobyleksikon.no/side/Arkitektur-_og_designh%C3%B8gskolen_i_Oslo',
      sourceObjectId: 'oslo-byleksikon:aho',
      sourceQuality: 'authoritative_local_identity',
      finding: 'Bekrefter AHO i Maridalsveien 29, institusjonshistorien fra 1945 og innflytting ved Akerselva i 2001.',
      canVerifyCoordinate: false,
      reason: 'Lokal identitets- og historikkryssjekk.',
    },
  ],
  addressCandidates: [
    {
      address: 'Maridalsveien 29, 0175 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:14622:29',
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:14622:29',
      canApplyToPlace: true,
    },
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:1420826219',
      canApplyToPlace: false,
    },
    {
      sourceProvider: 'wikidata',
      sourceObjectId: 'wikidata:Q4579140',
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:1420826219',
      canApplyToPlace: false,
    },
  ],
  coordinateCandidates: [
    {
      lat: newCoordinate.lat,
      lon: newCoordinate.lon,
      coordRole: 'display_marker',
      sourceObjectId: 'geonorge-adresser-v1:0301:14622:29',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Maridalsveien 29 er anvendt som canonical display-marker.',
  },
  notes: [
    coordNote,
    `Research report: ${researchRel}`,
  ],
};
await writeJson(evidenceRel, evidence);

const completedIds = new Set(['abelhaugen', place.id]);
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
  supportingGeometry: research.osmSite,
  synchronizedFiles: [splitRel, aggregateRel, categoryIndexRel, manifestRel, evidenceRel],
  remainingActionableCount: remainingQueue.length,
  nextCandidate,
  queueStatus: nextCandidate ? 'fresh_main_unresolved_queue_continues' : 'fresh_main_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, report);
await fs.writeFile(path.join(reportDir, 'README.md'), `# AHO coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n- Coordinate promoted: **yes**\n- Old marker: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- Official address point: **${newCoordinate.lat}, ${newCoordinate.lon}**\n- Marker displacement: **${report.displacementMeters} m**\n- Check-in radius: **${oldCoordinate.r} m (unchanged for campus coverage)**\n- Coordinate status: **${updatedPlace.coordStatus}**\n- Source object: **${updatedPlace.sourceObjectId}**\n- Address point inside OSM campus geometry: **yes**\n- Remaining actionable fresh-main records: **${remainingQueue.length}**\n- Next candidate: **${nextCandidate ? `\`${nextCandidate.placeId}\` — ${nextCandidate.name}` : 'none'}**\n\nThe split source, aggregate, category index, manifest hashes and coordinate evidence are updated together. The previous marker was outside the campus and is replaced by Kartverket's official Maridalsveien 29 address point.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'aho_production_complete',
  displacementMeters: report.displacementMeters,
  remainingActionableCount: remainingQueue.length,
  nextCandidate: nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
