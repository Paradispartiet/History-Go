import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/botanisk_hage.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const indexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/botanisk_hage.json';
const researchRel = 'reports/oslo-coordinate-botanisk-hage-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const reportRel = 'reports/oslo-coordinate-botanisk-hage-production-post-195';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';

const assert = (value, message) => { if (!value) throw new Error(message); };
const readText = (rel) => fs.readFile(path.join(root, rel), 'utf8');
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
const upsertLink = (links, next) => [
  ...(Array.isArray(links) ? links : []).filter((entry) => entry?.url !== next.url),
  next,
];

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; production must stay post-195.');

const [place, aggregate, index, manifest, research, audit] = await Promise.all([
  readJson(splitRel),
  readJson(aggregateRel),
  readJson(indexRel),
  readJson(manifestRel),
  readJson(researchRel),
  readJson(auditRel),
]);

assert(place.id === 'botanisk_hage', 'Unexpected place identity.');
assert(place.coordStatus == null, 'Botanisk hage already has a coordinate status.');
assert(Number(place.lat) === 59.9179 && Number(place.lon) === 10.7752 && Number(place.r) === 220, 'Canonical place changed after research.');
assert(research.coordinateDecision === 'promote_osm_garden_geometry_centroid', 'Research recommendation changed.');
assert(research.candidate?.sourceObjectId === 'osm-way:4045303', 'Unexpected geometry source.');
assert(research.currentMarkerInsideGarden === false, 'Legacy marker is unexpectedly inside the garden.');
assert(research.geometry?.centroidInside === true, 'Research centroid is outside the polygon.');
assert(research.recommendation?.suggestedRadiusMeters === 340, 'Unexpected researched radius.');

const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };
const newCoordinate = {
  lat: Number(research.candidate.lat),
  lon: Number(research.candidate.lon),
  r: 340,
};
const displacementMeters = distanceMeters(oldCoordinate, newCoordinate);
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) < 2, 'Displacement no longer matches research.');
assert(newCoordinate.r >= Number(research.geometry.maximumVertexDistanceMeters), 'New radius does not cover the researched geometry.');

const coordNote = `Semantisk midtpunkt for arealstedet Botanisk hage, beregnet som det geometriske sentrumet av den komplette navngitte OSM-geometrien way 4045303 (leisure=garden, wikidata=Q3116396). Punktet ligger inne i hagepolygonet og fungerer som display- og innsjekkingsanker for hele hagen, ikke som inngang eller byggpunkt. NHM/UiO bekrefter hageidentiteten, og Wikidata bekrefter etableringen i 1814 samt et uavhengig punkt inne i polygonet ${research.wikidata.centroidAgreementMeters} meter fra sentrum. Den tidligere markøren lå ${Number(displacementMeters.toFixed(1))} meter unna og utenfor hagen. Radius økes fra ${oldCoordinate.r} til ${newCoordinate.r} meter fordi største avstand fra sentrum til et polygonhjørne er ${research.geometry.maximumVertexDistanceMeters} meter.`;

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
  externalLinks: upsertLink(place.externalLinks, {
    type: 'official',
    label: 'Naturhistorisk museum – Botanisk hage',
    url: 'https://www.nhm.uio.no/utstillinger/botanisk-hage/index.html',
    lang: 'nb',
    verifiedAt: '2026-07-24',
  }),
};

const splitText = await writeJson(splitRel, updatedPlace);
assert(Array.isArray(aggregate), 'Vitenskap aggregate is not an array.');
const aggregatePosition = aggregate.findIndex((entry) => entry?.id === place.id);
assert(aggregatePosition >= 0, 'Botanisk hage is missing from the aggregate.');
assert(Number(aggregate[aggregatePosition].lat) === oldCoordinate.lat && Number(aggregate[aggregatePosition].lon) === oldCoordinate.lon, 'Aggregate does not match the split source.');
aggregate[aggregatePosition] = updatedPlace;
const aggregateText = await writeJson(aggregateRel, aggregate);

assert(Array.isArray(index), 'Vitenskap index is not an array.');
const indexEntry = index.find((entry) => entry?.id === place.id);
assert(indexEntry, 'Botanisk hage is missing from the category index.');
Object.assign(indexEntry, {
  lat: newCoordinate.lat,
  lon: newCoordinate.lon,
  r: newCoordinate.r,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
});
await writeJson(indexRel, index);

const manifestEntry = manifest.places?.find((entry) => entry?.id === place.id);
assert(manifestEntry, 'Botanisk hage is missing from the manifest.');
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = aggregate.length;
manifestEntry.sha256 = sha256(splitText);
await writeJson(manifestRel, manifest);

await writeJson(evidenceRel, {
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
      finding: `Komplett lukket leisure=garden-geometri med ${research.geometry.polygonNodeCount} polygonpunkter og wikidata=Q3116396. Det semantiske midtpunktet ligger inne i polygonet.`,
      canVerifyCoordinate: true,
      reason: 'Arealstedet representeres av et eksplisitt semantisk midtpunkt beregnet fra den komplette navngitte hagegeometrien.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q3116396 – University Botanical Garden, Oslo',
      sourceUrl: 'https://www.wikidata.org/wiki/Q3116396',
      sourceObjectId: 'wikidata:Q3116396',
      sourceQuality: 'structured_identity_history_and_coordinate_crosscheck',
      finding: `Dedikert botanisk-hageobjekt, etablert i 1814, med punkt inne i OSM-polygonet og ${research.wikidata.centroidAgreementMeters} meter fra det semantiske midtpunktet.`,
      canVerifyCoordinate: true,
      reason: 'Uavhengig strukturert identitets-, historikk- og geometrikryssjekk.',
    },
  ],
  addressCandidates: [{
    address: "Sars' gate 1, 0562 Oslo",
    sourceProvider: 'manual_research',
    sourceObjectId: 'nhm-uio:botanisk-hage',
    canApplyToPlace: false,
  }],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:4045303', canApplyToPlace: true },
    { sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q3116396', canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:4045303', canApplyToPlace: true }],
  coordinateCandidates: [{
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:4045303',
    lat: newCoordinate.lat,
    lon: newCoordinate.lon,
    coordRole: 'display_marker',
    canApplyToPlace: true,
  }],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Det semantiske midtpunktet og geometribaserte radiusen er anvendt på canonical place.',
  },
  notes: [coordNote, `Research report: ${researchRel}`],
});

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
  synchronizedFiles: [splitRel, aggregateRel, indexRel, manifestRel, evidenceRel],
  remainingActionableCount: remainingQueue.length,
  nextCandidate,
  queueStatus: nextCandidate ? 'fresh_main_unresolved_queue_continues' : 'fresh_main_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, report);
await fs.writeFile(path.join(root, reportRel, 'README.md'), `# Botanisk hage coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n- Coordinate promoted: **yes**\n- Old marker: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- Semantic garden centre: **${newCoordinate.lat}, ${newCoordinate.lon}**\n- Marker displacement: **${report.displacementMeters} m**\n- Check-in radius: **${oldCoordinate.r} m → ${newCoordinate.r} m**\n- Maximum centroid-to-vertex distance: **${research.geometry.maximumVertexDistanceMeters} m**\n- Remaining actionable fresh-main records: **${remainingQueue.length}**\n- Next candidate: **${nextCandidate ? `\`${nextCandidate.placeId}\` — ${nextCandidate.name}` : 'none'}**\n\nThe legacy marker outside the garden is replaced by an explicitly documented semantic area centre, and the radius is expanded to cover the researched geometry.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'botanisk_hage_production_complete',
  displacementMeters: report.displacementMeters,
  oldRadius: oldCoordinate.r,
  newRadius: newCoordinate.r,
  remainingActionableCount: remainingQueue.length,
  nextCandidate: nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
