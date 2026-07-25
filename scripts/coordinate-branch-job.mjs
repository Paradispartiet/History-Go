import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const researchPath = 'reports/oslo-coordinate-subculture-anchors-research-20260725/summary.json';
const research = JSON.parse(await fs.readFile(path.join(root, researchPath), 'utf8'));
const reportDir = path.join(root, 'reports/oslo-coordinate-subculture-anchors-production-20260725');
await fs.mkdir(reportDir, { recursive: true });
await fs.mkdir(path.join(root, 'data/coordinate-evidence/oslo/subkultur'), { recursive: true });

const aggregatePath = 'data/places/subkultur/oslo/places_subkultur.json';
const indexPath = 'data/places/subkultur/oslo/places_subkultur_index.json';
const splitPaths = {
  gronland_underganger: 'data/places/subkultur/oslo/places_subkultur/gronland_underganger.json',
  grunerlokka_bakgardsvegger: 'data/places/subkultur/oslo/places_subkultur/grunerlokka_bakgardsvegger.json',
  hausmannsgate_aksen: 'data/places/subkultur/oslo/places_subkultur/hausmannsgate_aksen.json',
  kolstadgata_toyen_vegger: 'data/places/subkultur/oslo/places_subkultur/kolstadgata_toyen_vegger.json',
  kuba_akselpassasjer: 'data/places/subkultur/oslo/places_subkultur/kuba_akselpassasjer.json',
  nybrua_pilarrom: 'data/places/subkultur/oslo/places_subkultur/nybrua_pilarrom.json',
  schweigaards_gate_lodalen: 'data/places/subkultur/oslo/places_subkultur/schweigaards_gate_lodalen.json',
  vulkan_murvegger: 'data/places/subkultur/oslo/places_subkultur/vulkan_murvegger.json',
};

const writeJson = async (file, value) => fs.writeFile(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const decisions = new Map(research.candidates.map((item) => [item.placeId, item]));
const aggregate = JSON.parse(await fs.readFile(path.join(root, aggregatePath), 'utf8'));
const index = JSON.parse(await fs.readFile(path.join(root, indexPath), 'utf8'));
const production = [];

function syncAggregate(place) {
  const i = aggregate.findIndex((row) => row.id === place.id);
  if (i < 0) throw new Error(`Aggregate missing ${place.id}`);
  aggregate[i] = place;
}
function syncIndex(place) {
  const i = index.findIndex((row) => row.id === place.id);
  if (i < 0) throw new Error(`Index missing ${place.id}`);
  index[i] = {
    ...index[i],
    name: place.name,
    category: place.category,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    year: place.year,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
  };
}

for (const [placeId, splitPath] of Object.entries(splitPaths)) {
  const item = decisions.get(placeId);
  if (!item) throw new Error(`Research decision missing ${placeId}`);
  const before = JSON.parse(await fs.readFile(path.join(root, splitPath), 'utf8'));
  let after;
  let evidence;

  if (placeId === 'nybrua_pilarrom') {
    if (!item.decision.canBecomeVerified) throw new Error('Nybrua research is not verifiable');
    const bridgeWay = item.bridgeGeometry.bridgeWays[0];
    if (!bridgeWay) throw new Error('Nybrua bridge geometry missing');
    const ssr = item.kartverketSsr.selected;
    const center = item.bridgeGeometry.geometryCenter;
    const note = `Canonical record gjelder pilarrommet under og rundt den navngitte Nybrua. Kartverket SSR stedsnummer ${ssr.stedsnummer}, objekttype Bru, ligger ${item.bridgeGeometry.nearestBridgeDistanceMeters} meter fra OSM way ${bridgeWay.id}, navngitt Nybrua. Display-markøren settes til geometrisenteret for den navngitte brogeometrien, mens SSR-punktet dokumenterer den offisielle broidentiteten. Maksimal geometriavstand er ${item.bridgeGeometry.maximumGeometryDistanceMeters} meter, og radius ${item.decision.recommendedRadius} meter inkluderer 30 meters buffer og minimum 80 meter for pilarrommet. Den tidligere markøren lå ${item.displacementMeters} meter unna.`;
    after = {
      ...before,
      lat: item.decision.recommendedLat,
      lon: item.decision.recommendedLon,
      r: item.decision.recommendedRadius,
      locatorType: 'linear_area',
      sourceProvider: 'kartverket',
      sourceObjectId: item.decision.sourceObjectId,
      geocodeAccuracy: 'semantic_anchor',
      coordRole: 'area_anchor',
      coordType: 'bridge_substructure_anchor',
      coordStatus: 'verified_geometry',
      coordSource: 'kartverket_ssr_osm_bridge_geometry',
      coordSourceId: item.decision.sourceObjectId,
      coordSourceUrl: item.kartverketSsr.sourceUrl,
      coordVerifiedAt: '2026-07-25',
      coordNote: note,
      geometry: {
        type: 'source_object_reference',
        role: 'named_bridge_geometry',
        sourceProvider: 'osm',
        sourceObjectId: `osm-way:${bridgeWay.id}`,
        center: { lat: center.lat, lon: center.lon },
        maximumDistanceMeters: item.bridgeGeometry.maximumGeometryDistanceMeters,
      },
      externalLinks: [
        {
          type: 'source',
          label: 'Kartverket SSR – Nybrua',
          url: item.kartverketSsr.sourceUrl,
          lang: 'nb',
          verifiedAt: '2026-07-25',
        },
        {
          type: 'source',
          label: 'OpenStreetMap – Nybrua',
          url: `https://www.openstreetmap.org/way/${bridgeWay.id}`,
          lang: 'nb',
          verifiedAt: '2026-07-25',
        },
      ],
    };
    evidence = {
      schemaVersion: '1.0',
      placeId,
      placeFile: splitPath,
      evidenceStatus: 'applied_to_place',
      coordinateDecision: item.decision.coordinateDecision,
      currentCoordinate: {
        lat: after.lat,
        lon: after.lon,
        r: after.r,
        coordStatus: after.coordStatus,
        coordSource: after.coordSource,
        coordType: after.coordType,
        coordNote: note,
      },
      identity: {
        currentName: after.name,
        resolvedIdentity: 'Pilarrommet under og rundt den navngitte Nybrua over Akerselva',
        identityStatus: 'resolved',
        identityProblem: '',
        locatorTypeCandidate: 'linear_area',
        requiresSplit: false,
        splitReason: '',
      },
      requiredEvidence: ['offisielt brostedsobjekt', 'navngitt brogeometri', 'målt radius'],
      evidence: [
        {
          sourceProvider: 'kartverket',
          sourceName: 'Kartverket SSR – Nybrua',
          sourceUrl: item.kartverketSsr.sourceUrl,
          sourceObjectId: item.decision.sourceObjectId,
          sourceQuality: 'official_place_name_register',
          finding: `Stedsnummer ${ssr.stedsnummer} er et Oslo-objekt av type Bru ved ${ssr.lat}, ${ssr.lon}.`,
          canVerifyCoordinate: true,
          reason: 'Offisielt navne- og stedspunkt for Nybrua.',
        },
        {
          sourceProvider: 'osm',
          sourceName: 'OpenStreetMap – Nybrua bridge geometry',
          sourceUrl: `https://www.openstreetmap.org/way/${bridgeWay.id}`,
          sourceObjectId: `osm-way:${bridgeWay.id}`,
          sourceQuality: 'named_bridge_geometry',
          finding: `Navngitt brogeometri med ${bridgeWay.vertexCount} punkter; maksimal avstand fra geometrisenteret er ${item.bridgeGeometry.maximumGeometryDistanceMeters} meter.`,
          canVerifyCoordinate: true,
          reason: 'Avgrenser den fysiske broen som pilarrommet tilhører.',
        },
        {
          sourceProvider: 'manual_research',
          sourceName: 'History Go subculture anchor research',
          sourceUrl: researchPath,
          sourceObjectId: 'history-go-research:subculture-anchors-20260725:nybrua_pilarrom',
          sourceQuality: 'reproducible_multi_source_research',
          finding: `Tidligere markør lå ${item.displacementMeters} meter unna; anbefalt radius er ${after.r} meter.`,
          canVerifyCoordinate: true,
          reason: 'Samlet beslutningsgrunnlag.',
        },
      ],
      addressCandidates: [],
      sourceObjectCandidates: [
        { sourceProvider: 'kartverket', sourceObjectId: item.decision.sourceObjectId, canApplyToPlace: true },
        { sourceProvider: 'osm', sourceObjectId: `osm-way:${bridgeWay.id}`, canApplyToPlace: true },
      ],
      geometryCandidates: [
        { sourceProvider: 'osm', sourceObjectId: `osm-way:${bridgeWay.id}`, canApplyToPlace: true },
      ],
      coordinateCandidates: [
        { lat: after.lat, lon: after.lon, coordRole: 'area_anchor', sourceObjectId: `osm-way:${bridgeWay.id}`, canApplyToPlace: true },
      ],
      decision: {
        canBecomeVerified: true,
        blockedReason: '',
        nextAction: 'Kartverket SSR og navngitt OSM-brogeometri er anvendt med radius 80 meter.',
      },
      notes: [note, `Research report: ${researchPath}`],
    };
  } else {
    if (item.decision.canBecomeVerified) throw new Error(`${placeId} unexpectedly verifiable`);
    const role = item.decision.locatorType === 'route' ? 'line_anchor' : 'area_anchor';
    const sourceObjectId = `history-go-research:subculture-anchors-20260725:${placeId}`;
    const note = `${item.decision.blockedReason} Dagens koordinat beholdes kun som redaksjonell proxy og skal ikke tolkes som dokumentert fysisk sentrum. ${item.decision.nextAction}`;
    after = {
      ...before,
      locatorType: item.decision.locatorType,
      sourceProvider: 'manual_research',
      sourceObjectId,
      geocodeAccuracy: 'approximate',
      coordRole: role,
      coordType: 'unverified_area_anchor',
      coordStatus: 'needs_source',
      coordSource: 'manual_research',
      coordSourceId: sourceObjectId,
      coordSourceUrl: researchPath,
      coordNote: note,
    };
    evidence = {
      schemaVersion: '1.0',
      placeId,
      placeFile: splitPath,
      evidenceStatus: 'research_complete_needs_source',
      coordinateDecision: item.decision.coordinateDecision,
      currentCoordinate: {
        lat: after.lat,
        lon: after.lon,
        r: after.r,
        coordStatus: after.coordStatus,
        coordSource: after.coordSource,
        coordType: after.coordType,
        coordNote: note,
      },
      identity: {
        currentName: after.name,
        resolvedIdentity: `${after.name} som redaksjonelt definert, diffust subkulturmiljø`,
        identityStatus: 'resolved_broad_area',
        identityProblem: item.decision.blockedReason,
        locatorTypeCandidate: item.decision.locatorType,
        requiresSplit: false,
        splitReason: '',
      },
      requiredEvidence: ['eksplisitt kildegeometri eller et avgrenset sett med fysiske ankre for hele canonical scope'],
      evidence: [
        {
          sourceProvider: 'manual_research',
          sourceName: 'History Go subculture anchor research',
          sourceUrl: researchPath,
          sourceObjectId,
          sourceQuality: 'canonical_scope_audit',
          finding: item.decision.blockedReason,
          canVerifyCoordinate: false,
          reason: 'Midtpunktet kan ikke gjøres verified uten kildebelagt geometri eller ankre.',
        },
      ],
      addressCandidates: [],
      sourceObjectCandidates: [],
      geometryCandidates: [],
      coordinateCandidates: [
        { lat: after.lat, lon: after.lon, coordRole: role, sourceObjectId, canApplyToPlace: false },
      ],
      decision: {
        canBecomeVerified: false,
        blockedReason: item.decision.blockedReason,
        nextAction: item.decision.nextAction,
      },
      notes: [note, `Research report: ${researchPath}`],
    };
  }

  await writeJson(splitPath, after);
  await writeJson(`data/coordinate-evidence/oslo/subkultur/${placeId}.json`, evidence);
  syncAggregate(after);
  syncIndex(after);
  production.push({
    placeId,
    before: {
      lat: before.lat,
      lon: before.lon,
      r: before.r,
      coordStatus: before.coordStatus ?? null,
      coordType: before.coordType ?? null,
    },
    after: {
      lat: after.lat,
      lon: after.lon,
      r: after.r,
      coordStatus: after.coordStatus,
      coordType: after.coordType,
      locatorType: after.locatorType,
      sourceProvider: after.sourceProvider,
      sourceObjectId: after.sourceObjectId,
    },
    evidenceFile: `data/coordinate-evidence/oslo/subkultur/${placeId}.json`,
    canonicalYearPreserved: before.year === after.year,
  });
}

await writeJson(aggregatePath, aggregate);
await writeJson(indexPath, index);
const summary = {
  version: '2026-07-25',
  productionApplied: true,
  researchReport: researchPath,
  verifiedGeometryCount: production.filter((item) => item.after.coordStatus === 'verified_geometry').length,
  needsSourceCount: production.filter((item) => item.after.coordStatus === 'needs_source').length,
  places: production,
  aggregateSynchronized: true,
  categoryIndexSynchronized: true,
};
await writeJson('reports/oslo-coordinate-subculture-anchors-production-20260725/summary.json', summary);
await fs.writeFile(
  path.join(reportDir, 'README.md'),
  `# Oslo subculture coordinate anchor production — 2026-07-25\n\nApplied ${summary.verifiedGeometryCount} verified geometry decision and ${summary.needsSourceCount} needs-source decisions.\n`,
  'utf8',
);
console.log(JSON.stringify(summary, null, 2));
