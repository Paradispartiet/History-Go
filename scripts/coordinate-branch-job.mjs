import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/bi_nydalen.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/bi_nydalen.json';
const researchRel = 'reports/oslo-coordinate-bi-nydalen-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const reportRel = 'reports/oslo-coordinate-bi-nydalen-production-post-195';
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

assert(place.id === 'bi_nydalen', 'Unexpected split place identity.');
assert(place.coordStatus == null, 'BI Nydalen already has a coordinate status; manual reconciliation required.');
assert(Number(place.lat) === 59.9498 && Number(place.lon) === 10.7686, 'BI current coordinate changed after research.');
assert(research.coordinateDecision === 'promote_official_address_point', 'Research no longer recommends the address point.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not permit verification.');
assert(research.candidate?.sourceObjectId === 'geonorge-adresser-v1:0301:15229:37', 'Unexpected Kartverket candidate.');
assert(research.sourceChecks?.biOfficialAddress === true, 'BI official-address check is not green.');
assert(research.sourceChecks?.brregIdentityAndAddress === true, 'Brønnøysund check is not green.');
assert(research.sourceChecks?.geonorgeUniqueExactAddressCoordinate === true, 'Kartverket exact-address check is not green.');
assert(research.sourceChecks?.osmExactNamedInstitutionGeometry === true, 'OSM campus identity check is not green.');
assert(research.sourceChecks?.wikidataIdentityMatches === true, 'Wikidata identity check is not green.');
assert(research.sourceChecks?.wikidataOrganisationNumberMatches === true, 'Wikidata organisation-number check is not green.');
assert(research.sourceChecks?.osmWikidataMatches === true, 'OSM/Wikidata check is not green.');
assert(research.osmSite?.addressInsideSite === true, 'Official address point no longer lies inside the BI campus geometry.');
assert(research.currentMarkerInsideOsmSite === false, 'Current marker is unexpectedly inside the campus geometry; manual review required.');

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
  label: 'Handelshøyskolen BI – Campus Oslo',
  url: 'https://www.bi.no/studere-ved-bi/campus-oslo/praktisk-informasjon/',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});
externalLinks = upsertExternalLink(externalLinks, {
  type: 'official',
  label: 'Brønnøysundregistrene – Stiftelsen Handelshøyskolen BI',
  url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971228865',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});

const coordNote = `Offisiell adressekoordinat fra Kartverket/Geonorge for Nydalsveien 37, 0484 Oslo. Handelshøyskolen BIs egne campus- og kontaktsider og Brønnøysundregistrene oppgir samme besøksadresse og organisasjonsnummer 971228865. Punktet ligger inne i den navngitte OSM-campusgeometrien way 38316703, som er amenity=college, building=university og koblet til Wikidata Q604629. Den tidligere markøren lå ${Number(displacementMeters.toFixed(1))} meter unna og utenfor campusbygget; radius ${oldCoordinate.r} meter beholdes for campusdekning.`;

const updatedPlace = {
  ...place,
  lat: newCoordinate.lat,
  lon: newCoordinate.lon,
  r: newCoordinate.r,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: 'geonorge-adresser-v1:0301:15229:37',
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: 'geonorge-adresser-v1:0301:15229:37',
  coordSourceUrl: research.candidate.sourceUrl,
  coordVerifiedAt: '2026-07-24',
  coordNote,
  address: {
    street: 'Nydalsveien',
    number: '37',
    postcode: '0484',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks,
};

const splitText = await writeJson(splitRel, updatedPlace);

assert(Array.isArray(aggregate), 'Vitenskap aggregate is not an array.');
const aggregateIndex = aggregate.findIndex((entry) => entry?.id === place.id);
assert(aggregateIndex >= 0, 'BI Nydalen is missing from vitenskap aggregate.');
assert(Number(aggregate[aggregateIndex].lat) === oldCoordinate.lat && Number(aggregate[aggregateIndex].lon) === oldCoordinate.lon, 'Aggregate coordinate does not match split source before migration.');
aggregate[aggregateIndex] = updatedPlace;
const aggregateText = await writeJson(aggregateRel, aggregate);

assert(Array.isArray(categoryIndex), 'Vitenskap index is not an array.');
const categoryEntry = categoryIndex.find((entry) => entry?.id === place.id);
assert(categoryEntry, 'BI Nydalen is missing from vitenskap index.');
categoryEntry.lat = newCoordinate.lat;
categoryEntry.lon = newCoordinate.lon;
categoryEntry.r = newCoordinate.r;
categoryEntry.coordStatus = updatedPlace.coordStatus;
categoryEntry.coordType = updatedPlace.coordType;
await writeJson(categoryIndexRel, categoryIndex);

const manifestEntry = manifest.places?.find((entry) => entry?.id === place.id);
assert(manifestEntry, 'BI Nydalen is missing from vitenskap manifest.');
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
    resolvedIdentity: 'Handelshøyskolen BI, Campus Oslo, organisasjonsnummer 971228865, Nydalsveien 37, 0484 Oslo',
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
      sourceName: 'Geonorge Adresser API v1 – Nydalsveien 37',
      sourceUrl: research.candidate.sourceUrl,
      sourceObjectId: 'geonorge-adresser-v1:0301:15229:37',
      sourceQuality: 'official_address',
      finding: 'Ett unikt offisielt adressepunkt for Nydalsveien 37, 0484 Oslo.',
      canVerifyCoordinate: true,
      reason: 'Kartverkets offisielle adressepunkt brukes som canonical display-marker for BI Campus Oslo.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Handelshøyskolen BI – Campus Oslo',
      sourceUrl: 'https://www.bi.no/studere-ved-bi/campus-oslo/praktisk-informasjon/',
      sourceObjectId: 'bi:campus-oslo',
      sourceQuality: 'official_current_site',
      finding: 'BI oppgir Nydalsveien 37, 0484 Oslo som besøksadresse for Campus Oslo.',
      canVerifyCoordinate: false,
      reason: 'Offisiell institusjons- og besøksadresse; koordinaten leveres av Kartverket.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Handelshøyskolen BI – kontakt oss',
      sourceUrl: 'https://www.bi.no/om-bi/kontakt-oss/',
      sourceObjectId: 'bi:contact',
      sourceQuality: 'official_institution_identity',
      finding: 'BI bekrefter besøksadressen i Oslo og organisasjonsnummer 971228865.',
      canVerifyCoordinate: false,
      reason: 'Offisiell identitets- og organisasjonsnummerkryssjekk.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Stiftelsen Handelshøyskolen BI',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971228865',
      sourceObjectId: 'brreg-enhet:971228865',
      sourceQuality: 'official_institution_identity',
      finding: 'Brønnøysund oppgir Stiftelsen Handelshøyskolen BI, organisasjonsnummer 971228865, med forretningsadresse Nydalsveien 37, 0484 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig institusjons- og adressekryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 38316703 – Handelshøyskolen BI',
      sourceUrl: research.osmSite.sourceUrl,
      sourceObjectId: 'osm-way:38316703',
      sourceQuality: 'named_institution_building_geometry',
      finding: `Navngitt amenity=college- og building=university-geometri koblet til Wikidata Q604629. Det offisielle adressepunktet ligger inne i geometrien og ${research.osmSite.addressToSiteReferenceMeters} meter fra områdets referansepunkt.`,
      canVerifyCoordinate: true,
      reason: 'Bygningsgeometrien bekrefter at Kartverkets adressepunkt ligger på BI-campus, mens den tidligere markøren lå utenfor.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q604629 – BI Norwegian Business School',
      sourceUrl: 'https://www.wikidata.org/wiki/Q604629',
      sourceObjectId: 'wikidata:Q604629',
      sourceQuality: 'structured_identity_crosscheck',
      finding: 'Dedikert institusjonsobjekt for Handelshøyskolen BI med organisasjonsnummer 971228865.',
      canVerifyCoordinate: false,
      reason: 'Identitets- og organisasjonsnummerkryssjekk; Kartverket er koordinatkilden.',
    },
  ],
  addressCandidates: [
    {
      address: 'Nydalsveien 37, 0484 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:15229:37',
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: 'geonorge-adresser-v1:0301:15229:37',
      canApplyToPlace: true,
    },
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:38316703',
      canApplyToPlace: false,
    },
    {
      sourceProvider: 'wikidata',
      sourceObjectId: 'wikidata:Q604629',
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:38316703',
      canApplyToPlace: false,
    },
  ],
  coordinateCandidates: [
    {
      lat: newCoordinate.lat,
      lon: newCoordinate.lon,
      coordRole: 'display_marker',
      sourceObjectId: 'geonorge-adresser-v1:0301:15229:37',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Nydalsveien 37 er anvendt som canonical display-marker.',
  },
  notes: [
    coordNote,
    `Research report: ${researchRel}`,
  ],
};
await writeJson(evidenceRel, evidence);

const completedIds = new Set(['abelhaugen', 'arkitektur_og_designhogskolen', place.id]);
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
await fs.writeFile(path.join(reportDir, 'README.md'), `# BI Nydalen coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n- Coordinate promoted: **yes**\n- Old marker: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- Official address point: **${newCoordinate.lat}, ${newCoordinate.lon}**\n- Marker displacement: **${report.displacementMeters} m**\n- Check-in radius: **${oldCoordinate.r} m (unchanged for campus coverage)**\n- Coordinate status: **${updatedPlace.coordStatus}**\n- Source object: **${updatedPlace.sourceObjectId}**\n- Address point inside OSM campus geometry: **yes**\n- Remaining actionable fresh-main records: **${remainingQueue.length}**\n- Next candidate: **${nextCandidate ? `\`${nextCandidate.placeId}\` — ${nextCandidate.name}` : 'none'}**\n\nThe split source, aggregate, category index, manifest hashes and coordinate evidence are updated together. The previous marker was outside the BI building and is replaced by Kartverket's official Nydalsveien 37 address point.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'bi_nydalen_production_complete',
  displacementMeters: report.displacementMeters,
  remainingActionableCount: remainingQueue.length,
  nextCandidate: nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
