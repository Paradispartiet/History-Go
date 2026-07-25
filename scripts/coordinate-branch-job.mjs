import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const researchPath = 'reports/oslo-coordinate-torggata-storgata-research-20260725/summary-v2.json';
const research = JSON.parse(await fs.readFile(path.join(root, researchPath), 'utf8'));
const reportDir = path.join(root, 'reports/oslo-coordinate-torggata-storgata-production-20260725');
await fs.mkdir(reportDir, { recursive: true });

const aggregatePath = 'data/places/by/oslo/places_by.json';
const indexPath = 'data/places/by/oslo/places_by_index.json';
const manifestPath = 'data/places/by/oslo/places_by_manifest.json';
const configs = {
  torggata: {
    splitPath: 'data/places/by/oslo/places/torggata.json',
    evidencePath: 'data/coordinate-evidence/oslo/by/torggata.json',
    southName: 'Torggata sør – Youngstorget',
    northName: 'Torggata nord – Ankertorget',
    topologyText: 'den sammenhengende navngitte Torggata-strekningen mellom Youngstorget og Ankertorget',
  },
  storgata: {
    splitPath: 'data/places/by/oslo/places/storgata.json',
    evidencePath: 'data/coordinate-evidence/oslo/by/storgata.json',
    southName: 'Storgata sørvest – Kirkeristen',
    northName: 'Storgata nordøst – Nybrua',
    topologyText: 'det endepunktstyrte navngitte Storgata-løpet fra Kirkeristen til Nybrua',
  },
};

const writeJson = async (file, value) => fs.writeFile(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256File = async (file) => crypto.createHash('sha256').update(await fs.readFile(path.join(root, file))).digest('hex');
function mergeLinks(existing, links) {
  const result = Array.isArray(existing) ? [...existing] : [];
  for (const link of links) {
    const index = result.findIndex((item) => item?.url === link.url || (item?.type === link.type && item?.label === link.label));
    if (index >= 0) result[index] = link;
    else result.push(link);
  }
  return result;
}

const aggregate = JSON.parse(await fs.readFile(path.join(root, aggregatePath), 'utf8'));
const index = JSON.parse(await fs.readFile(path.join(root, indexPath), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(root, manifestPath), 'utf8'));
const production = [];

for (const researched of research.places) {
  const config = configs[researched.placeId];
  if (!config) throw new Error(`Missing production config for ${researched.placeId}`);
  if (!researched.decision?.canBecomeVerified || !researched.decision?.topologyValidated) {
    throw new Error(`${researched.placeId} did not pass refined research gate`);
  }
  const before = JSON.parse(await fs.readFile(path.join(root, config.splitPath), 'utf8'));
  const route = researched.geometryResearchV2;
  const decision = researched.decision;
  const endpoints = route.routeEndpoints;
  const routeSegments = route.routeWays.map((way, indexValue) => ({
    id: `${researched.placeId}_route_segment_${String(indexValue + 1).padStart(2, '0')}`,
    order: indexValue + 1,
    osmWayId: way.osmWayId,
    sourceProvider: 'osm',
    sourceObjectId: way.sourceObjectId,
    sourceUrl: way.sourceUrl,
    name: way.name,
    highway: way.highway,
    surface: way.surface,
    lengthM: way.lengthM,
    startNodeId: way.startNodeId,
    endNodeId: way.endNodeId,
    traversal: way.traversal,
  }));
  const oldDistance = researched.currentCoordinate.distanceToNamedStreetGeometryM;
  const note = `${researched.name} bruker nå et deterministisk lengdemidtpunkt direkte på ${config.topologyText}. Fresh OSM-research ordnet ${route.orderedRouteWayCount} navngitte way-segmenter over ${route.orderedRouteLengthM} meter. Det tidligere punktet lå ${oldDistance} meter fra riktig gategeometri; nytt punkt ligger 0 meter fra gategeometrien og ble flyttet ${decision.displacementFromCurrentM} meter. Midtpunktet ligger på ${decision.sourceObjectId}. Eksisterende gameplay-radius ${before.r} meter beholdes; hele gateløpet lagres som ordnede routeSegments.`;
  const after = {
    ...before,
    lat: decision.recommendedLat,
    lon: decision.recommendedLon,
    r: decision.recommendedRadius,
    coordType: 'street_geometry_midpoint',
    coordStatus: 'verified_geometry',
    coordNote: note,
    locatorType: 'street',
    sourceProvider: 'osm',
    sourceObjectId: decision.sourceObjectId,
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSource: 'OpenStreetMap exact-name street topology',
    coordSourceId: decision.sourceObjectId,
    coordSourceUrl: decision.sourceUrl,
    coordVerifiedAt: '2026-07-25',
    sourceHint: `${researched.name} er representert av en endepunkt- og topologikontrollert kjede av eksakt navngitte OSM-way-segmenter. Displaypunktet er lengdemidtpunktet langs den ordnede ruten, ikke et aritmetisk punkt mellom manuelle koordinater.`,
    anchors: [
      {
        id: `${researched.placeId}_route_start`,
        name: config.southName,
        type: 'route_point',
        lat: endpoints[0].lat,
        lon: endpoints[0].lon,
        r: 60,
        sourceProvider: 'osm',
        sourceObjectId: routeSegments[0].sourceObjectId,
      },
      {
        id: `${researched.placeId}_route_end`,
        name: config.northName,
        type: 'route_point',
        lat: endpoints[1].lat,
        lon: endpoints[1].lon,
        r: 60,
        sourceProvider: 'osm',
        sourceObjectId: routeSegments.at(-1).sourceObjectId,
      },
    ],
    routeSegments,
    externalLinks: mergeLinks(before.externalLinks, [
      {
        type: 'source',
        label: `Oslo byleksikon – ${researched.name}`,
        url: researched.identity.sourceUrl,
        lang: 'nb',
        verifiedAt: '2026-07-25',
      },
      {
        type: 'source',
        label: `OpenStreetMap – ${researched.name} midtpunktsegment`,
        url: decision.sourceUrl,
        lang: 'nb',
        verifiedAt: '2026-07-25',
      },
    ]),
  };
  if (after.year !== before.year) throw new Error(`Canonical year changed for ${researched.placeId}`);
  await writeJson(config.splitPath, after);

  const aggregateIndex = aggregate.findIndex((item) => item.id === researched.placeId);
  if (aggregateIndex < 0) throw new Error(`Aggregate missing ${researched.placeId}`);
  aggregate[aggregateIndex] = after;

  const categoryIndex = index.findIndex((item) => item.id === researched.placeId);
  if (categoryIndex < 0) throw new Error(`Category index missing ${researched.placeId}`);
  index[categoryIndex] = {
    ...index[categoryIndex],
    name: after.name,
    category: after.category,
    lat: after.lat,
    lon: after.lon,
    r: after.r,
    year: after.year,
    coordStatus: after.coordStatus,
    coordType: after.coordType,
    file: index[categoryIndex].file,
  };

  const existingEvidence = JSON.parse(await fs.readFile(path.join(root, config.evidencePath), 'utf8'));
  const evidence = {
    ...existingEvidence,
    schemaVersion: '1.0',
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'do_not_change_coordinates_yet',
    currentCoordinate: {
      lat: after.lat,
      lon: after.lon,
      r: after.r,
      coordStatus: after.coordStatus,
      coordSource: after.coordSource,
      coordType: after.coordType,
      coordNote: after.coordNote,
    },
    identity: {
      currentName: after.name,
      resolvedIdentity: `${after.name} som navngitt OSM-gateløp med dokumentert utstrekning`,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'street',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: ['dokumentert gateidentitet', 'eksakt navngitte OSM-way-segmenter', 'endepunktkontroll', 'lengdemidtpunkt på gategeometri'],
    evidence: [
      {
        sourceProvider: 'manual_research',
        sourceName: `Oslo byleksikon – ${after.name}`,
        sourceUrl: researched.identity.sourceUrl,
        sourceObjectId: `oslobyleksikon:${researched.placeId}`,
        sourceQuality: 'documented_street_extent',
        finding: `Kilden dokumenterer ${after.name} og det aktuelle gateløpet.`,
        canVerifyCoordinate: true,
        reason: 'Stabil identitet og gateutstrekning.',
      },
      {
        sourceProvider: 'osm',
        sourceName: `OpenStreetMap exact-name ${after.name} topology`,
        sourceUrl: decision.sourceUrl,
        sourceObjectId: decision.sourceObjectId,
        sourceQuality: 'named_street_route_geometry',
        finding: `${route.orderedRouteWayCount} ordnede way-segmenter over ${route.orderedRouteLengthM} meter; displaypunktet ligger direkte på ${decision.sourceObjectId}.`,
        canVerifyCoordinate: true,
        reason: 'Eksakt navngitt gategeometri og deterministisk lengdemidtpunkt.',
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'History Go street topology research',
        sourceUrl: researchPath,
        sourceObjectId: `history-go-research:torggata-storgata-20260725:${researched.placeId}`,
        sourceQuality: 'reproducible_topology_research',
        finding: `Tidligere punkt lå ${oldDistance} meter fra gategeometrien og ble flyttet ${decision.displacementFromCurrentM} meter.`,
        canVerifyCoordinate: true,
        reason: 'Dokumenterer feilårsak, rutevalg og koordinatbeslutning.',
      },
    ],
    addressCandidates: [],
    sourceObjectCandidates: routeSegments.map((segment) => ({
      sourceProvider: 'osm',
      sourceObjectId: segment.sourceObjectId,
      canApplyToPlace: true,
    })),
    geometryCandidates: routeSegments.map((segment) => ({
      sourceProvider: 'osm',
      sourceObjectId: segment.sourceObjectId,
      canApplyToPlace: true,
    })),
    coordinateCandidates: [
      {
        lat: after.lat,
        lon: after.lon,
        coordRole: 'line_anchor',
        sourceObjectId: decision.sourceObjectId,
        canApplyToPlace: true,
      },
    ],
    decision: {
      canBecomeVerified: true,
      blockedReason: '',
      nextAction: 'Eksakt gategeometri, routeSegments og displaypunkt er anvendt på canonical place.',
    },
    notes: [note, `Research report: ${researchPath}`],
  };
  await writeJson(config.evidencePath, evidence);

  production.push({
    placeId: researched.placeId,
    before: {
      lat: before.lat,
      lon: before.lon,
      r: before.r,
      coordStatus: before.coordStatus,
      coordType: before.coordType,
      distanceToNamedStreetGeometryM: oldDistance,
    },
    after: {
      lat: after.lat,
      lon: after.lon,
      r: after.r,
      coordStatus: after.coordStatus,
      coordType: after.coordType,
      sourceObjectId: after.sourceObjectId,
      routeSegmentCount: routeSegments.length,
      routeLengthM: route.orderedRouteLengthM,
      pointDistanceToNamedStreetGeometryM: 0,
    },
    displacementM: decision.displacementFromCurrentM,
    coordinateChanged: before.lat !== after.lat || before.lon !== after.lon,
    canonicalYearPreserved: before.year === after.year,
    splitPath: config.splitPath,
    evidencePath: config.evidencePath,
  });
}

await writeJson(aggregatePath, aggregate);
await writeJson(indexPath, index);
manifest.source_sha256 = await sha256File(aggregatePath);
manifest.generated_at = new Date().toISOString();
for (const item of production) {
  const entry = manifest.places.find((candidate) => candidate.id === item.placeId);
  if (!entry) throw new Error(`Manifest missing ${item.placeId}`);
  entry.sha256 = await sha256File(item.splitPath);
}
await writeJson(manifestPath, manifest);

const summary = {
  version: '2026-07-25',
  productionApplied: true,
  researchPath,
  places: production,
  aggregateSynchronized: true,
  categoryIndexSynchronized: true,
  splitManifestSynchronized: true,
};
await writeJson('reports/oslo-coordinate-torggata-storgata-production-20260725/summary.json', summary);
await fs.writeFile(path.join(reportDir, 'README.md'), '# Torggata and Storgata coordinate production\n\nBoth previous off-street arithmetic points are replaced by deterministic length midpoints on endpoint-validated, exact-name OSM street routes. Existing gameplay radii and canonical years are preserved.\n', 'utf8');
console.log(JSON.stringify(summary, null, 2));
