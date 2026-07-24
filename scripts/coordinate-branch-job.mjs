import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const researchRel = 'reports/oslo-coordinate-observatoriet-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const reportRel = 'reports/oslo-coordinate-observatoriet-production-post-195';
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/observatoriet.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json';
const indexRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/observatoriet.json';
const verifiedAt = '2026-07-24';

const assert = (value, message) => { if (!value) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const writeJson = async (rel, value) => {
  const absolute = path.join(root, rel);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  const text = jsonText(value);
  await fs.writeFile(absolute, text, 'utf8');
  return text;
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const distanceMeters = (a, b) => {
  const rad = (value) => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const mergeLinks = (existing, additions) => {
  const result = [];
  const seen = new Set();
  for (const link of [...(Array.isArray(existing) ? existing : []), ...additions]) {
    if (!link?.url || seen.has(link.url)) continue;
    seen.add(link.url);
    result.push(link);
  }
  return result;
};

await fs.mkdir(path.join(root, reportRel), { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; production must remain post-195.');

const research = await readJson(researchRel);
assert(research.placeId === 'observatoriet', 'Unexpected research identity.');
assert(research.researchOnly === true && research.canonicalChanged === false, 'Research changed canonical data.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not authorize promotion.');
assert(research.coordinateDecision === 'promote_unique_official_address_point_supported_by_observatory_building_context', 'Unexpected coordinate decision.');
assert(research.candidate?.sourceProvider === 'official_address', 'Candidate is not an official address point.');
assert(research.officialAddress?.coordinateCount === 1, 'Expected one official address point.');
assert(research.supportingBuilding?.sourceObjectId === 'osm-way:134468457', 'Unexpected supporting observatory building.');
assert(research.supportingBuilding?.containsAddress === true, 'Official address point is outside the supporting building.');
assert(research.supportingBuilding?.namedObservatory === true, 'Supporting building is not named Observatoriet.');
assert(research.supportingBuilding?.tags?.wikidata === 'Q15728942', 'Unexpected observatory Wikidata identity.');
assert(research.sourceChecks?.holmenkollenFolkObservatoryExcludedByBoundedScope === true, 'Unrelated Folkeobservatoriet was not excluded.');

const place = await readJson(splitRel);
const aggregate = await readJson(aggregateRel);
const categoryIndex = await readJson(indexRel);
const manifest = await readJson(manifestRel);
assert(place.id === 'observatoriet' && place.year === 1833, 'Unexpected canonical place.');
assert(Math.abs(place.lat - 59.9176) < 1e-9 && Math.abs(place.lon - 10.7332) < 1e-9,
  'Observatoriet coordinate changed since research.');
const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };
const candidate = { lat: Number(research.candidate.lat), lon: Number(research.candidate.lon) };
assert(Number.isFinite(candidate.lat) && Number.isFinite(candidate.lon), 'Invalid candidate coordinate.');
const displacementMeters = Number(distanceMeters(oldCoordinate, candidate).toFixed(1));
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) <= 0.2,
  'Production displacement no longer matches research.');
assert(Number(research.supportingBuilding.maximumVertexDistanceMeters) < Number(place.r),
  'Current radius does not cover the researched observatory building.');

const coordinateNote = 'Offisiell adressekoordinat fra Kartverket/Geonorge for Observatoriegata 1, 0254 Oslo. Oslo byleksikon bekrefter Det astronomiske observatorium på denne adressen og oppføringen i 1831–33; Store norske leksikon bekrefter Universitetsobservatoriet og bruken fra 1833. Punktet ligger inne i den komplette, navngitte OSM-bygningen Observatoriet, way 134468457, som er merket building=university, heritage=yes og Wikidata Q15728942. Bygningen består av 21 noder, dekker 543,4 m², og adressepunktet ligger 12,2 meter fra geometrisk sentrum. Et navngitt informasjonspunkt for Observatoriet ligger 33,8 meter unna. Den tidligere markøren lå 997,8 meter feil. Radius 160 meter og canonical year 1833 beholdes. Det separate Folkeobservatoriet i Holmenkollen er eksplisitt utelukket.';

const updatedPlace = {
  ...place,
  lat: candidate.lat,
  lon: candidate.lon,
  r: 160,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: research.candidate.sourceObjectId,
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: research.candidate.sourceObjectId,
  coordSourceUrl: research.candidate.sourceUrl,
  coordVerifiedAt: verifiedAt,
  coordNote: coordinateNote,
  address: {
    street: 'Observatoriegata',
    number: '1',
    postcode: '0254',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: mergeLinks(place.externalLinks, [
    {
      type: 'official',
      label: 'Oslo byleksikon – Observatoriet',
      url: 'https://oslobyleksikon.no/side/Observatoriet',
      lang: 'nb',
      verifiedAt,
    },
    {
      type: 'reference',
      label: 'Store norske leksikon – Universitetsobservatoriet',
      url: 'https://snl.no/Universitetsobservatoriet',
      lang: 'nb',
      verifiedAt,
    },
  ]),
};
assert(updatedPlace.year === 1833, 'Production changed canonical year.');

const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
assert(aggregateIndex >= 0, 'Observatoriet missing from aggregate.');
aggregate[aggregateIndex] = updatedPlace;
const compactIndex = categoryIndex.findIndex((entry) => entry.id === place.id);
assert(compactIndex >= 0, 'Observatoriet missing from category index.');
categoryIndex[compactIndex] = {
  ...categoryIndex[compactIndex],
  lat: updatedPlace.lat,
  lon: updatedPlace.lon,
  r: updatedPlace.r,
  year: updatedPlace.year,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
};

const splitText = await writeJson(splitRel, updatedPlace);
const aggregateText = await writeJson(aggregateRel, aggregate);
await writeJson(indexRel, categoryIndex);
const manifestEntry = manifest.places?.find((entry) => entry.id === place.id);
assert(manifestEntry, 'Observatoriet missing from split manifest.');
manifestEntry.sha256 = sha256(splitText);
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = manifest.places.length;
await writeJson(manifestRel, manifest);

const building = research.supportingBuilding;
const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_observatoriegata_1_point_inside_named_university_observatory',
  currentCoordinate: {
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: coordinateNote,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Universitetsobservatoriet / Det astronomiske observatorium, Observatoriegata 1, 0254 Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt offisiell adressekoordinat',
    'historisk universitetsobservatorium-identitet',
    'navngitt bygningsgeometri som omslutter adressepunktet',
    'avgrensning mot Folkeobservatoriet i Holmenkollen',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket Adresser API v1 – Observatoriegata 1',
      sourceUrl: research.candidate.sourceUrl,
      sourceObjectId: research.candidate.sourceObjectId,
      sourceQuality: 'official_address',
      finding: `Ett unikt offisielt representasjonspunkt for Observatoriegata 1: ${candidate.lat}, ${candidate.lon}.`,
      canVerifyCoordinate: true,
      reason: 'Punktet brukes som canonical display-markør etter identitets- og bygningskontroll.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Observatoriet',
      sourceUrl: 'https://oslobyleksikon.no/side/Observatoriet',
      sourceObjectId: 'oslo-byleksikon:observatoriet',
      sourceQuality: 'authoritative_local_identity',
      finding: 'Bekrefter Observatoriegata 1, astronomisk observatorium og oppføring i 1831–33.',
      canVerifyCoordinate: false,
      reason: 'Autoritativ lokal identitets-, adresse- og historikkilde; koordinaten leveres av Kartverket.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Store norske leksikon – Universitetsobservatoriet',
      sourceUrl: 'https://snl.no/Universitetsobservatoriet',
      sourceObjectId: 'snl:universitetsobservatoriet',
      sourceQuality: 'authoritative_national_identity',
      finding: 'Bekrefter Universitetsobservatoriet og institusjonshistorikken fra 1833.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig nasjonal identitets- og historikkryssjekk.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Nasjonalbiblioteket – Observatoriet-omvisning',
      sourceUrl: 'https://www.nb.no/skole/omvisninger/dobbeltomvisning-nasjonalbiblioteket-observatoriet/',
      sourceObjectId: 'nb:observatoriet-omvisning',
      sourceQuality: 'current_public_interpretation',
      finding: 'Dokumenterer at Observatoriet fortsatt brukes til offentlig formidling.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter dagens aktive stedsidentitet, ikke selve koordinaten.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 134468457 – Observatoriet',
      sourceUrl: 'https://www.openstreetmap.org/way/134468457',
      sourceObjectId: 'osm-way:134468457',
      sourceQuality: 'complete_named_university_building_geometry',
      finding: `Navngitt building=university-geometri med heritage=yes og Wikidata Q15728942. ${building.polygonNodeCount} noder, ${building.areaSquareMeters} m²; Kartverket-punktet ligger inne i bygget.`,
      canVerifyCoordinate: true,
      reason: 'Bygningsgeometrien bekrefter at det offisielle adressepunktet representerer Observatoriet.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap node 13235705237 – Observatoriet',
      sourceUrl: 'https://www.openstreetmap.org/node/13235705237',
      sourceObjectId: 'osm-node:13235705237',
      sourceQuality: 'named_place_context',
      finding: 'Navngitt informasjonspunkt for Observatoriet 33,8 meter fra Kartverket-punktet.',
      canVerifyCoordinate: true,
      reason: 'Supplerende navngitt stedskontekst ved universitetsbygget.',
    },
  ],
  addressCandidates: [
    {
      address: 'Observatoriegata 1, 0254 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: research.candidate.sourceObjectId,
      lat: candidate.lat,
      lon: candidate.lon,
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: research.candidate.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:134468457', canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:13235705237', canApplyToPlace: false },
    { sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q15728942', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:134468457', canApplyToPlace: false },
  ],
  coordinateCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: research.candidate.sourceObjectId,
      lat: candidate.lat,
      lon: candidate.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Observatoriegata 1 er anvendt som canonical display-markør.',
  },
  notes: [coordinateNote, `Research report: ${researchRel}`],
};
await writeJson(evidenceRel, evidence);

const audit = await readJson(auditRel);
const resolvedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const remaining = [];
for (const item of audit.actionableQueue ?? []) {
  let rows;
  try {
    rows = await readJson(item.sourcePath);
  } catch {
    continue;
  }
  const current = Array.isArray(rows) ? rows.find((entry) => entry.id === item.placeId) : null;
  if (!current || current.disabled === true || resolvedStatuses.has(current.coordStatus)) continue;
  remaining.push({
    ...item,
    coordStatus: current.coordStatus ?? null,
    coordType: current.coordType ?? null,
    locatorType: current.locatorType ?? null,
    coordSource: current.coordSource ?? null,
    coordSourceId: current.coordSourceId ?? null,
    lat: current.lat,
    lon: current.lon,
    disabled: current.disabled ?? false,
  });
}

const summary = {
  version: verifiedAt,
  protocolMaxBatch,
  canonicalChanged: true,
  placeId: place.id,
  oldCoordinate,
  newCoordinate: { lat: updatedPlace.lat, lon: updatedPlace.lon, r: updatedPlace.r },
  displacementMeters,
  coordinatePromoted: true,
  radiusChanged: oldCoordinate.r !== updatedPlace.r,
  yearChanged: place.year !== updatedPlace.year,
  canonicalYearPreserved: updatedPlace.year,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  sourceObjectId: updatedPlace.coordSourceId,
  supportingBuilding: building,
  supportingOsmObject: research.supportingOsmObject,
  synchronizedFiles: [splitRel, aggregateRel, indexRel, manifestRel, evidenceRel],
  remainingActionableCount: remaining.length,
  nextCandidate: remaining[0] ?? null,
  queueStatus: remaining.length > 0
    ? 'fresh_main_unresolved_queue_continues'
    : 'post_195_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, summary);
await fs.writeFile(path.join(root, reportRel, 'README.md'), `# University Observatory coordinate production\n\n- Old coordinate: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- New coordinate: **${updatedPlace.lat}, ${updatedPlace.lon}**\n- Displacement: **${displacementMeters} m**\n- Radius changed: **no**\n- Canonical year changed: **no**\n- Canonical year retained: **1833**\n- Supporting building: **osm-way:134468457**\n- Named Observatoriet object: **osm-node:13235705237**\n- Remaining actionable queue: **${remaining.length}**\n- Next candidate: **${remaining[0]?.placeId ?? 'none'}**\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n`, 'utf8');

console.log(JSON.stringify({
  status: 'observatoriet_coordinate_applied',
  oldCoordinate,
  newCoordinate: summary.newCoordinate,
  displacementMeters,
  radiusChanged: summary.radiusChanged,
  yearChanged: summary.yearChanged,
  remainingActionableCount: remaining.length,
  nextCandidate: summary.nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
