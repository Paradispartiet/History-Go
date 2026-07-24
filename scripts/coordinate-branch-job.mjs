import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/abelhaugen.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/abelhaugen.json';
const researchRel = 'reports/oslo-coordinate-abelhaugen-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const reportRel = 'reports/oslo-coordinate-abelhaugen-production-post-195';
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

assert(place.id === 'abelhaugen', 'Unexpected split place identity.');
assert(place.coordStatus == null, 'Abelhaugen already has a coordinate status; manual reconciliation required.');
assert(Number(place.lat) === 59.9185 && Number(place.lon) === 10.7294, 'Abelhaugen current coordinate changed after research.');
assert(research.coordinateDecision === 'promote_exact_named_monument_point', 'Research no longer recommends promotion.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not permit verification.');
assert(research.candidate?.sourceObjectId === 'osm-node:1664967162', 'Unexpected research candidate.');
assert(research.sourceChecks?.osmExactNamedObject === true, 'OSM exact-object check is not green.');
assert(research.sourceChecks?.wikidataLinksOsmNode === true, 'Wikidata/OSM link check is not green.');
assert(research.sourceChecks?.wikidataCoordinateMatchesOsm === true, 'Wikidata coordinate agreement is not green.');
assert(research.sourceAgreementMeters < 5, 'Independent coordinate sources no longer agree within five metres.');

const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };
const newCoordinate = {
  lat: Number(research.candidate.lat),
  lon: Number(research.candidate.lon),
  r: 45,
};
const displacementMeters = distanceMeters(oldCoordinate, newCoordinate);
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) < 2, 'Production displacement no longer matches research.');

let externalLinks = place.externalLinks;
externalLinks = upsertExternalLink(externalLinks, {
  type: 'official',
  label: 'Vigelandmuseet – Vigeland andre steder',
  url: 'https://vigeland.museum.no/gustav-vigeland/vigeland-andre-steder',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});
externalLinks = upsertExternalLink(externalLinks, {
  type: 'source',
  label: 'Oslo byleksikon – Abelmonumentet',
  url: 'https://oslobyleksikon.no/side/Abelmonumentet',
  lang: 'nb',
  verifiedAt: '2026-07-24',
});

const updatedPlace = {
  ...place,
  lat: newCoordinate.lat,
  lon: newCoordinate.lon,
  r: newCoordinate.r,
  locatorType: 'poi',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-node:1664967162',
  geocodeAccuracy: 'geometric_center',
  coordRole: 'display_marker',
  coordType: 'monument',
  coordStatus: 'verified_geometry',
  coordSource: 'OpenStreetMap node 1664967162 – Niels Henrik Abel monument; identity cross-checked with Wikidata Q23868718, Vigeland Museum and Oslo Byleksikon',
  coordSourceId: 'osm-node:1664967162',
  coordSourceUrl: 'https://www.openstreetmap.org/node/1664967162',
  coordVerifiedAt: '2026-07-24',
  coordNote: `Eksakt historic=monument-punkt med navnet Niels Henrik Abel, artist_name=Gustav Vigeland og wikidata=Q23868718. OSM-punktet er krysskoblet til Wikidata, og de uavhengige koordinatene avviker bare ${research.sourceAgreementMeters} meter. Vigeland Museum og Oslo byleksikon bekrefter monumentets identitet og plassering på Abelhaugen i Slottsparken. Den tidligere markøren lå ${Number(displacementMeters.toFixed(1))} meter unna og er erstattet.`,
  externalLinks,
};

const splitText = await writeJson(splitRel, updatedPlace);

assert(Array.isArray(aggregate), 'Vitenskap aggregate is not an array.');
const aggregateIndex = aggregate.findIndex((entry) => entry?.id === 'abelhaugen');
assert(aggregateIndex >= 0, 'Abelhaugen is missing from vitenskap aggregate.');
assert(Number(aggregate[aggregateIndex].lat) === oldCoordinate.lat && Number(aggregate[aggregateIndex].lon) === oldCoordinate.lon, 'Aggregate coordinate does not match split source before migration.');
aggregate[aggregateIndex] = updatedPlace;
const aggregateText = await writeJson(aggregateRel, aggregate);

assert(Array.isArray(categoryIndex), 'Vitenskap index is not an array.');
const categoryEntry = categoryIndex.find((entry) => entry?.id === 'abelhaugen');
assert(categoryEntry, 'Abelhaugen is missing from vitenskap index.');
categoryEntry.lat = newCoordinate.lat;
categoryEntry.lon = newCoordinate.lon;
categoryEntry.r = newCoordinate.r;
categoryEntry.coordStatus = updatedPlace.coordStatus;
categoryEntry.coordType = updatedPlace.coordType;
await writeJson(categoryIndexRel, categoryIndex);

const manifestEntry = manifest.places?.find((entry) => entry?.id === 'abelhaugen');
assert(manifestEntry, 'Abelhaugen is missing from vitenskap manifest.');
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = aggregate.length;
manifestEntry.sha256 = sha256(splitText);
await writeJson(manifestRel, manifest);

const evidence = {
  schemaVersion: '1.0',
  placeId: 'abelhaugen',
  placeFile: aggregateRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_exact_named_monument_point',
  currentCoordinate: {
    lat: newCoordinate.lat,
    lon: newCoordinate.lon,
    r: newCoordinate.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: updatedPlace.coordNote,
  },
  identity: {
    currentName: 'Abelhaugen',
    resolvedIdentity: 'Abelmonumentet over Niels Henrik Abel av Gustav Vigeland, reist på Abelhaugen i Slottsparken i 1908',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'poi',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt navngitt monumentobjekt',
    'uavhengig identitetskryssjekk',
    'stabil kildeidentifikator',
  ],
  evidence: [
    {
      sourceProvider: 'manual_research',
      sourceName: 'Vigeland Museum – Vigeland andre steder',
      sourceUrl: 'https://vigeland.museum.no/gustav-vigeland/vigeland-andre-steder',
      sourceObjectId: 'vigeland-museum:abelmonumentet',
      sourceQuality: 'official_museum_identity',
      finding: 'Vigeland Museum identifies Abelmonumentet near the Royal Palace as one of Gustav Vigeland’s monuments.',
      canVerifyCoordinate: false,
      reason: 'The museum source resolves identity and creator but does not expose an exact public coordinate.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo Byleksikon – Abelmonumentet',
      sourceUrl: 'https://oslobyleksikon.no/side/Abelmonumentet',
      sourceObjectId: 'oslo-byleksikon:11493',
      sourceQuality: 'authoritative_local_identity',
      finding: 'Oslo Byleksikon identifies the 1908 Abel monument at Abelhaugen in Slottsparken.',
      canVerifyCoordinate: false,
      reason: 'The article resolves the named place and monument identity but is used as an identity source rather than the exact geometry source.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q23868718 – Abel Monument, Royal Palace Park, Oslo',
      sourceUrl: 'https://www.wikidata.org/wiki/Q23868718',
      sourceObjectId: 'wikidata:Q23868718',
      sourceQuality: 'structured_identity_and_coordinate_crosscheck',
      finding: `Dedicated monument item links to OSM node 1664967162, identifies Gustav Vigeland as creator, and provides ${research.wikidataCoordinate.lat}, ${research.wikidataCoordinate.lon}.`,
      canVerifyCoordinate: true,
      reason: `The Wikidata coordinate independently agrees with the exact named OSM monument point within ${research.sourceAgreementMeters} metres.`,
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap node 1664967162 – Niels Henrik Abel',
      sourceUrl: 'https://www.openstreetmap.org/node/1664967162',
      sourceObjectId: 'osm-node:1664967162',
      sourceQuality: 'unique_exact_named_monument_object',
      finding: 'Exact historic=monument point named Niels Henrik Abel with artist_name=Gustav Vigeland and wikidata=Q23868718.',
      canVerifyCoordinate: true,
      reason: 'The object represents the physical monument itself and is independently identity- and coordinate-cross-checked.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:1664967162',
      canApplyToPlace: true,
    },
    {
      sourceProvider: 'wikidata',
      sourceObjectId: 'wikidata:Q23868718',
      canApplyToPlace: true,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-node:1664967162',
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    {
      lat: newCoordinate.lat,
      lon: newCoordinate.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Exact named monument point is applied to the canonical place.',
  },
  notes: [
    updatedPlace.coordNote,
    `Research report: ${researchRel}`,
  ],
};
await writeJson(evidenceRel, evidence);

const remainingQueue = (audit.actionableQueue ?? []).filter((entry) => entry?.placeId !== 'abelhaugen');
const nextCandidate = remainingQueue[0] ?? null;
const report = {
  version: '2026-07-24',
  protocolMaxBatch,
  canonicalChanged: true,
  placeId: 'abelhaugen',
  oldCoordinate,
  newCoordinate,
  displacementMeters: Number(displacementMeters.toFixed(1)),
  coordinatePromoted: true,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  sourceObjectId: updatedPlace.sourceObjectId,
  sourceAgreementMeters: research.sourceAgreementMeters,
  synchronizedFiles: [splitRel, aggregateRel, categoryIndexRel, manifestRel, evidenceRel],
  remainingActionableCount: remainingQueue.length,
  nextCandidate,
  queueStatus: nextCandidate ? 'fresh_main_unresolved_queue_continues' : 'fresh_main_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, report);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Abelhaugen coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n- Coordinate promoted: **yes**\n- Old marker: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- Exact monument point: **${newCoordinate.lat}, ${newCoordinate.lon}**\n- Marker displacement: **${report.displacementMeters} m**\n- Check-in radius: **${oldCoordinate.r} m → ${newCoordinate.r} m**\n- Coordinate status: **${updatedPlace.coordStatus}**\n- Source object: **${updatedPlace.sourceObjectId}**\n- OSM/Wikidata agreement: **${research.sourceAgreementMeters} m**\n- Remaining actionable fresh-main records: **${remainingQueue.length}**\n- Next candidate: **${nextCandidate ? `\`${nextCandidate.placeId}\` — ${nextCandidate.name}` : 'none'}**\n\nThe split source, aggregate, category index, manifest hashes and coordinate evidence are updated together. The old marker was not on Abelhaugen; it is replaced by the exact named monument point.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'abelhaugen_production_complete',
  displacementMeters: report.displacementMeters,
  remainingActionableCount: remainingQueue.length,
  nextCandidate: nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
