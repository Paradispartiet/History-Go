import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/botanisk_hage.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/botanisk_hage.json';
const researchRel = 'reports/oslo-coordinate-botanisk-hage-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const reportRel = 'reports/oslo-coordinate-botanisk-hage-production-post-195';
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

assert(place.id === 'botanisk_hage', 'Unexpected split place identity.');
assert(place.coordStatus == null, 'Botanisk hage already has a coordinate status; manual reconciliation required.');
assert(Number(place.lat) === 59.9179 && Number(place.lon) === 10.7752 && Number(place.r) === 220, 'Botanisk hage current marker or radius changed after research.');
assert(research.coordinateDecision === 'promote_osm_garden_geometry_centroid', 'Research no longer recommends the garden centroid.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not permit verification.');
assert(research.candidate?.sourceObjectId === 'osm-way:4045303', 'Unexpected garden geometry candidate.');
assert(research.candidate?.wikidata === 'Q3116396', 'Garden geometry no longer links the expected Wikidata item.');
assert(research.currentMarkerInsideGarden === false, 'Current marker is unexpectedly inside the garden; manual review required.');
assert(research.geometry?.centroidInside === true, 'Research centroid is not inside the garden geometry.');
assert(research.geometry?.currentRadiusCoversMaximumVertex === false, 'Current radius unexpectedly covers the full geometry.');
assert(research.sourceChecks?.officialNhmIdentity === true, 'NHM identity check is not green.');
assert(research.sourceChecks?.osmExactNamedGardenGeometry === true, 'OSM garden geometry check is not green.');
assert(research.sourceChecks?.osmWikidataDirectLink === true, 'OSM/Wikidata link check is not green.');
assert(research.sourceChecks?.wikidataCoordinateInsideGeometry === true, 'Wikidata geometry check is not green.');

const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };
const newCoordinate = {
  lat: Number(research.candidate.lat),
  lon: Number(research.candidate.lon),
  r: Number(research.recommendation.suggestedRadiusMeters),
};
assert(newCoordinate.r === 340, `Expected researched radius 340 m, got ${newCoordinate.r}.`);
const displacementMeters = distanceMeters(oldCoordinate, newCoordinate);
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) < 2, 'Production displacement no longer matches research.');
assert(newCoordinate.r >= Number(research.geometry.maximumVertexDistanceMeters), 'New radius does not cover the researched maximum vertex distance.');

let externalLinks = place.externalLinks;
externalLinks = upsertLink(externalLinks, {
  type: 'official',
  label: 'Naturhistorisk museum – Botanisk hage',
  url: 'https://www.nhm.uio.no/utstillinger/botanisk-hage/index.html',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});

const coordNote = `Arealmarkør beregnet som polygonets geometriske sentrum for den komplette, navngitte Botanisk hage-geometrien OSM way 4045303 (leisure=garden, wikidata=Q3116396). Punktet ligger inne i hagen. NHM/UiO bekrefter hageidentiteten, og Wikidata bekrefter etableringen i 1814 samt et uavhengig punkt inne i polygonet ${research.wikidata.centroidAgreementMeters} meter fra sentrum. Den tidligere markøren lå ${Number(displacementMeters.toFixed(1))} meter unna og utenfor hagen. Radius økes fra ${oldCoordinate.r} til ${newCoordinate.r} meter fordi største avstand fra sentrum til et polygonhjørne er ${research.geometry.maximumVertexDistanceMeters} meter.`;

const updatedPlace = {
  ...place,
  lat: newCoordinate.lat,
  lon: newCoordinate.lon,
  r: newCoordinate.r,
  locatorType: 'area',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:4045303',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'area_center',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap way 4045303 – complete Botanisk hage polygon; NHM/UiO and Wikidata Q3116396 identity cross-check',
  coordSourceId: 'osm-way:4045303',
  coordSourceUrl: 'https://www.openstreetmap.org/way/4045303',
  coordVerifiedAt: '2026-07-24',
  coordNote,
  address: {
    street: "Sars' gate",
    number: '1',
    postcode: '0562',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks,
};

const splitText = await writeJson(splitRel, updatedPlace);

assert(Array.isArray(aggregate), 'Vitenskap aggregate is not an array.');
const aggregateIndex = aggregate.findIndex((entry) => entry?.id === place.id);
assert(aggregateIndex >= 0, 'Botanisk hage is missing from vitenskap aggregate.');
assert(Number(aggregate[aggregateIndex].lat) === oldCoordinate.lat && Number(aggregate[aggregateIndex].lon) === oldCoordinate.lon, 'Aggregate coordinate does not match split source before migration.');
aggregate[aggregateIndex] = updatedPlace;
const aggregateText = await writeJson(aggregateRel, aggregate);

assert(Array.isArray(categoryIndex), 'Vitenskap index is not an array.');
const categoryEntry = categoryIndex.find((entry) => entry?.id === place.id);
assert(categoryEntry, 'Botanisk hage is missing from vitenskap index.');
categoryEntry.lat = newCoordinate.lat;
categoryEntry.lon = newCoordinate.lon;
categoryEntry.r = newCoordinate.r;
categoryEntry.coordStatus = updatedPlace.coordStatus;
categoryEntry.coordType = updatedPlace.coordType;
await writeJson(categoryIndexRel, categoryIndex);

const manifestEntry = manifest.places?.find((entry) => entry?.id === place.id);
assert(manifestEntry, 'Botanisk hage is missing from vitenskap manifest.');
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
  coordinateDecision: 'use_verified_garden_geometry_centroid',
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
    resolvedIdentity: 'Botanisk hage ved Naturhistorisk museum, Universitetet i Oslo, grunnlagt i 1814 på Tøyen',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'area',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'komplett navngitt hagegeometri',
    'institusjonell identitet',
    'uavhengig strukturert geometri- og historikkryssjekk',
  ],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Naturhistorisk museum / UiO – Botanisk hage',
      sourceUrl: 'https://www.nhm.uio.no/utstillinger/botanisk-hage/index.html',
      sourceObjectId: 'nhm-uio:botanisk-hage',
      sourceQuality: 'official_institution_identity',
      finding: 'NHM/UiO identifiserer Botanisk hage som del av Naturhistorisk museum og Universitetet i Oslo.',
      canVerifyCoordinate: false,
      reason: 'Autoritativ identitet og institusjonell kontekst; polygonet leveres av OSM.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 4045303 – Botanisk hage',
      sourceUrl: 'https://www.openstreetmap.org/way/4045303',
      sourceObjectId: 'osm-way:4045303',
      sourceQuality: 'complete_named_garden_geometry',
      finding: `Komplett lukket leisure=garden-geometri med ${research.geometry.polygonNodeCount} polygonpunkter og wikidata=Q3116396. Beregnet sentrum ligger inne i polygonet.`,
      canVerifyCoordinate: true,
      reason: 'Arealstedet representeres av det geometriske sentrumet av den komplette navngitte hagegeometrien.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q3116396 – University Botanical Garden, Oslo',
      sourceUrl: 'https://www.wikidata.org/wiki/Q3116396',
      sourceObjectId: 'wikidata:Q3116396',
      sourceQuality: 'structured_identity_history_and_coordinate_crosscheck',
      finding: `Dedikert botanisk-hageobjekt, etablert i 1814, med et koordinatpunkt inne i OSM-polygonet og ${research.wikidata.centroidAgreementMeters} meter fra polygonets sentrum.`,
      canVerifyCoordinate: true,
      reason: 'Uavhengig strukturert identitets-, historikk- og geometrikryssjekk.',
    },
  ],
  addressCandidates: [
    {
      address: "Sars' gate 1, 0562 Oslo",
      sourceProvider: 'manual_research',
      sourceObjectId: 'nhm-uio:botanisk-hage',
      canApplyToPlace: false,
    },
  ],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:4045303', canApplyToPlace: true },
    { sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q3116396', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:4045303', canApplyToPlace: true },
  ],
  coordinateCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:4045303',
      lat: newCoordinate.lat,
      lon: newCoordinate.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Polygonets sentrum og geometribaserte radius er anvendt på canonical place.',
  },
  notes: [coordNote, `Research report: ${researchRel}`],
};
await writeJson(evidenceRel, evidence);

const completedIds = new Set([
  'abelhaugen',
  'arkitektur_og_designhogskolen',
  'bi_nydalen',
  'bla',
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
  radiusChanged: true,
  radiusIncreaseMeters: newCoordinate.r - oldCoordinate.r,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  sourceObjectId: updatedPlace.sourceObjectId,
  geometry: research.geometry,
  synchronizedFiles: [splitRel, aggregateRel, categoryIndexRel, manifestRel, evidenceRel],
  remainingActionableCount: remainingQueue.length,
  nextCandidate,
  queueStatus: nextCandidate ? 'fresh_main_unresolved_queue_continues' : 'fresh_main_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, report);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Botanisk hage coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n- Coordinate promoted: **yes**\n- Old marker: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- Garden geometry centroid: **${newCoordinate.lat}, ${newCoordinate.lon}**\n- Marker displacement: **${report.displacementMeters} m**\n- Old marker inside garden: **no**\n- Check-in radius: **${oldCoordinate.r} m → ${newCoordinate.r} m**\n- Maximum centroid-to-vertex distance: **${research.geometry.maximumVertexDistanceMeters} m**\n- Coordinate status: **${updatedPlace.coordStatus}**\n- Source object: **${updatedPlace.sourceObjectId}**\n- Remaining actionable fresh-main records: **${remainingQueue.length}**\n- Next candidate: **${nextCandidate ? `\`${nextCandidate.placeId}\` — ${nextCandidate.name}` : 'none'}**\n\nThe split source, aggregate, category index, manifest hashes and coordinate evidence are updated together. The legacy marker outside the garden is replaced by the verified polygon centroid, and the radius is expanded to cover the researched geometry.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'botanisk_hage_production_complete',
  displacementMeters: report.displacementMeters,
  oldRadius: oldCoordinate.r,
  newRadius: newCoordinate.r,
  remainingActionableCount: remainingQueue.length,
  nextCandidate: nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
