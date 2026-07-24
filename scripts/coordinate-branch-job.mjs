import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/forskningsparken.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/forskningsparken.json';
const researchRel = 'reports/oslo-coordinate-forskningsparken-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const reportRel = 'reports/oslo-coordinate-forskningsparken-production-post-195';
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
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
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

assert(place.id === 'forskningsparken', 'Unexpected split place identity.');
assert(place.coordStatus == null, 'Forskningsparken already has a coordinate status; manual reconciliation required.');
assert(Number(place.lat) === 59.9426 && Number(place.lon) === 10.7192 && Number(place.r) === 150, 'Forskningsparken current marker or radius changed after research.');
assert(research.coordinateDecision === 'promote_named_building_multipolygon_centroid', 'Research no longer recommends the building centroid.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not permit verification.');
assert(research.candidate?.sourceObjectId === 'osm-relation:10322880', 'Unexpected building geometry candidate.');
assert(research.candidate?.wikidata === 'Q7107027', 'Building relation no longer links expected Wikidata item.');
assert(research.supportingGeometry?.centroidInsideOuter === true, 'Research centroid is not inside the building geometry.');
assert(research.supportingGeometry?.exactBuildingRelationValidated !== false, 'Building relation validation is not green.');
assert(research.sourceChecks?.officialAddressAndOrganisationNumber === true, 'Official identity check is not green.');
assert(research.sourceChecks?.brregMainUnitIdentityAndAddress === true, 'Brønnøysund main-unit check is not green.');
assert(research.sourceChecks?.brregOperatingUnitIdentityAndAddress === true, 'Brønnøysund operating-unit check is not green.');
assert(research.sourceChecks?.geonorgeExactAddressPointsPreserved === true, 'Kartverket address-point preservation check is not green.');
assert(research.sourceChecks?.transportObjectsExcluded === true, 'Transport-object exclusion check is not green.');
assert(research.sourceChecks?.exactBuildingRelationValidated === true, 'Exact building relation was not validated.');
assert(research.sourceChecks?.buildingCentroidInsideGeometry === true, 'Building centroid geometry check is not green.');
assert(research.sourceChecks?.buildingNearBothOfficialAddressPoints === true, 'Building/address proximity check is not green.');

const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };
const newCoordinate = {
  lat: Number(research.candidate.lat),
  lon: Number(research.candidate.lon),
  r: Number(research.recommendation.suggestedRadiusMeters),
};
assert(newCoordinate.r === 150, `Expected researched radius 150 m, got ${newCoordinate.r}.`);
const displacementMeters = distanceMeters(oldCoordinate, newCoordinate);
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) < 2, 'Production displacement no longer matches research.');
assert(newCoordinate.r >= Number(research.supportingGeometry.maximumVertexDistanceMeters), 'Radius does not cover the researched building geometry.');

let externalLinks = place.externalLinks;
externalLinks = upsertLink(externalLinks, {
  type: 'official',
  label: 'Forskningsparken – offisiell nettside',
  url: 'https://www.forskningsparken.no/',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});
externalLinks = upsertLink(externalLinks, {
  type: 'official',
  label: 'Brønnøysundregistrene – Oslotech AS',
  url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/937268815',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});

const addressDistances = research.supportingGeometry.distancesToOfficialAddressPointsMeters;
const coordNote = `Canonical markør er et semantisk midtpunkt beregnet som arealvektet geometrisk sentrum av den komplette, navngitte Forskningsparken-multipolygonen OSM relation 10322880 (building=university, name:en=Oslo Science Park, wikidata=Q7107027). Relasjonen består av ${research.supportingGeometry.outerRingCount} ytterringer og ${research.supportingGeometry.resolvedNodeCount} løste noder, dekker ${research.supportingGeometry.areaSquareMeters} m², og sentrum ligger inne i bygningsgeometrien. Forskningsparken og Brønnøysundregistrene bekrefter Oslotech/Forskningsparken ved Gaustadalléen 21, 0349 Oslo. Kartverket har to offisielle representasjonspunkter for adressen; begge bevares som kontekst og ligger ${addressDistances[0]} og ${addressDistances[1]} meter fra bygningssentrum, uten at ett velges vilkårlig. Kollektivobjektene med samme navn er eksplisitt forkastet. Den tidligere markøren lå ${Number(displacementMeters.toFixed(1))} meter unna. Radius ${newCoordinate.r} meter beholdes og dekker bygningens største målte sentrum-til-hjørne-avstand på ${research.supportingGeometry.maximumVertexDistanceMeters} meter.`;

const updatedPlace = {
  ...place,
  lat: newCoordinate.lat,
  lon: newCoordinate.lon,
  r: newCoordinate.r,
  locatorType: 'building',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-relation:10322880',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'building_center',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap relation 10322880 – named Forskningsparken university-building multipolygon; official Forskningsparken, Brønnøysund and Kartverket address-context cross-check',
  coordSourceId: 'osm-relation:10322880',
  coordSourceUrl: 'https://www.openstreetmap.org/relation/10322880',
  coordVerifiedAt: '2026-07-24',
  coordNote,
  address: {
    street: 'Gaustadalléen',
    number: '21',
    postcode: '0349',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks,
};

const splitText = await writeJson(splitRel, updatedPlace);
assert(Array.isArray(aggregate), 'Vitenskap aggregate is not an array.');
const aggregateIndex = aggregate.findIndex((entry) => entry?.id === place.id);
assert(aggregateIndex >= 0, 'Forskningsparken is missing from vitenskap aggregate.');
assert(Number(aggregate[aggregateIndex].lat) === oldCoordinate.lat && Number(aggregate[aggregateIndex].lon) === oldCoordinate.lon, 'Aggregate coordinate does not match split source before migration.');
aggregate[aggregateIndex] = updatedPlace;
const aggregateText = await writeJson(aggregateRel, aggregate);

assert(Array.isArray(categoryIndex), 'Vitenskap index is not an array.');
const categoryEntry = categoryIndex.find((entry) => entry?.id === place.id);
assert(categoryEntry, 'Forskningsparken is missing from vitenskap index.');
categoryEntry.lat = newCoordinate.lat;
categoryEntry.lon = newCoordinate.lon;
categoryEntry.r = newCoordinate.r;
categoryEntry.coordStatus = updatedPlace.coordStatus;
categoryEntry.coordType = updatedPlace.coordType;
await writeJson(categoryIndexRel, categoryIndex);

const manifestEntry = manifest.places?.find((entry) => entry?.id === place.id);
assert(manifestEntry, 'Forskningsparken is missing from vitenskap manifest.');
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = aggregate.length;
manifestEntry.sha256 = sha256(splitText);
await writeJson(manifestRel, manifest);

const addressCandidates = research.officialAddress.coordinates.map((entry) => ({
  address: 'Gaustadalléen 21, 0349 Oslo',
  sourceProvider: 'official_address',
  sourceObjectId: entry.sourceObjectId,
  lat: entry.lat,
  lon: entry.lon,
  canApplyToPlace: false,
}));
const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_named_building_multipolygon_centroid',
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
    resolvedIdentity: 'Forskningsparken / Oslo Science Park, drevet av Oslotech AS, organisasjonsnummer 937268815, ved Gaustadalléen 21, 0349 Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'navngitt ikke-transport bygningsgeometri',
    'offisiell institusjons- og adresseidentitet',
    'alle offisielle adressepunkter bevart uten vilkårlig utvalg',
  ],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap relation 10322880 – Forskningsparken',
      sourceUrl: 'https://www.openstreetmap.org/relation/10322880',
      sourceObjectId: 'osm-relation:10322880',
      sourceQuality: 'complete_named_building_multipolygon',
      finding: `Navngitt building=university-multipolygon for Forskningsparken / Oslo Science Park, direkte koblet til Wikidata Q7107027 og Oslotech-nettstedet. Fire ytterringer, ${research.supportingGeometry.resolvedNodeCount} løste noder og ${research.supportingGeometry.areaSquareMeters} m². Det arealvektede semantiske midtpunktet ligger inne i geometrien.`,
      canVerifyCoordinate: true,
      reason: 'Canonical display-marker representerer selve navngitte forskningsparkbygget, ikke kollektivholdeplassene med samme navn.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Forskningsparken – offisielle sider',
      sourceUrl: 'https://www.forskningsparken.no/',
      sourceObjectId: 'forskningsparken-official:gaustadalleen-21',
      sourceQuality: 'official_institution_identity',
      finding: 'Offisielle sider identifiserer Forskningsparken, Oslotech, Gaustadalléen 21, 0349 Oslo og historikken fra 1989.',
      canVerifyCoordinate: false,
      reason: 'Autoritativ identitets-, adresse- og historikkilde; bygningsgeometrien leveres av OSM.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Oslotech AS hovedenhet',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/937268815',
      sourceObjectId: 'brreg-enhet:937268815',
      sourceQuality: 'official_institution_identity',
      finding: 'Oslotech AS har organisasjonsnummer 937268815 og forretningsadresse Gaustadalléen 21, 0349 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Offisiell virksomhets- og adresseidentitet.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Oslotech underenhet',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/974166194',
      sourceObjectId: 'brreg-underenhet:974166194',
      sourceQuality: 'official_operating_location',
      finding: 'Underenheten bekrefter driftsstedet i Gaustadalléen 21, 0349 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig driftssteds- og adressekryssjekk.',
    },
    ...research.officialAddress.coordinates.map((entry, index) => ({
      sourceProvider: 'official_address',
      sourceName: `Kartverket Adresser API – Gaustadalléen 21${index === 1 ? 'B' : ''}`,
      sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Gaustadall%C3%A9en&nummer=21&kommunenummer=0301&treffPerSide=20',
      sourceObjectId: entry.sourceObjectId,
      sourceQuality: 'official_address_context',
      finding: `Offisielt representasjonspunkt ${entry.lat}, ${entry.lon}; ${addressDistances[index]} meter fra det valgte bygningssentrumet.`,
      canVerifyCoordinate: false,
      reason: 'Begge offisielle adressepunktene bevares som kontekst; ingen velges vilkårlig når en eksakt navngitt bygningsgeometri finnes.',
    })),
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q7107027 – Oslo Science Park',
      sourceUrl: 'https://www.wikidata.org/wiki/Q7107027',
      sourceObjectId: 'wikidata:Q7107027',
      sourceQuality: 'structured_identity_crosscheck',
      finding: 'Dedikert strukturert identitetsobjekt koblet direkte fra den navngitte OSM-bygningsrelasjonen.',
      canVerifyCoordinate: false,
      reason: 'Identitetskryssjekk; geometrien leveres av OSM relation 10322880.',
    },
  ],
  addressCandidates,
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-relation:10322880', canApplyToPlace: true },
    ...addressCandidates.map((entry) => ({ sourceProvider: entry.sourceProvider, sourceObjectId: entry.sourceObjectId, canApplyToPlace: false })),
    { sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q7107027', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-relation:10322880', canApplyToPlace: true },
  ],
  coordinateCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-relation:10322880',
      lat: newCoordinate.lat,
      lon: newCoordinate.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true,
    },
    ...addressCandidates.map((entry) => ({
      sourceProvider: entry.sourceProvider,
      sourceObjectId: entry.sourceObjectId,
      lat: entry.lat,
      lon: entry.lon,
      coordRole: 'address_context',
      canApplyToPlace: false,
    })),
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Det arealvektede sentrumet av den navngitte Forskningsparken-multipolygonen er anvendt som canonical display-marker.',
  },
  notes: [coordNote, `Research report: ${researchRel}`],
};
await writeJson(evidenceRel, evidence);

const completedIds = new Set([
  'abelhaugen',
  'arkitektur_og_designhogskolen',
  'bi_nydalen',
  'bla',
  'botanisk_hage',
  place.id,
]);
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
  sourceObjectId: updatedPlace.coordSourceId,
  geometry: research.supportingGeometry,
  officialAddress: research.officialAddress,
  synchronizedFiles: [splitRel, aggregateRel, categoryIndexRel, manifestRel, evidenceRel],
  remainingActionableCount: remainingQueue.length,
  nextCandidate,
  queueStatus: nextCandidate ? 'fresh_main_unresolved_queue_continues' : 'fresh_main_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, report);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Forskningsparken production migration after post-195 closure\n\n- Canonical data changed: **yes**\n- Protocol max batch: **${protocolMaxBatch}**\n- Old marker: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- New marker: **${newCoordinate.lat}, ${newCoordinate.lon}**\n- Displacement: **${report.displacementMeters} m**\n- Radius: **${newCoordinate.r} m (unchanged)**\n- Coordinate source: **OSM relation 10322880**\n- Coordinate status: **${updatedPlace.coordStatus}**\n- Coordinate type: **${updatedPlace.coordType}**\n- Official Kartverket address points preserved: **${research.officialAddress.coordinateCount}**\n- Remaining actionable candidates: **${remainingQueue.length}**\n- Next candidate: **${nextCandidate?.placeId ?? 'none'}**\n- Batch 196 created: **no**\n\nThe old marker was replaced by the semantic area-weighted center of the complete named Forskningsparken university-building multipolygon. Both official Kartverket points are retained as address context, and all same-name transport objects remain rejected.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'forskningsparken_production_complete',
  reportDir: reportRel,
  displacementMeters: report.displacementMeters,
  remainingActionableCount: remainingQueue.length,
  nextCandidate: nextCandidate?.placeId ?? null,
}, null, 2));
