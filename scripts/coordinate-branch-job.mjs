import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placePath = 'data/places/vitenskap/oslo/places_vitenskap/tvergastein.json';
const aggregatePath = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexPath = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const researchPath = 'reports/oslo-coordinate-tvergastein-research-post-195/summary.json';
const evidencePath = 'data/coordinate-evidence/oslo/vitenskap/tvergastein.json';
const productionPath = 'reports/oslo-coordinate-tvergastein-production-post-195/summary.json';

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => {
  const absolutePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const research = await readJson(researchPath);
if (research.placeId !== 'tvergastein' || research.decision?.canBecomeVerified !== true) {
  throw new Error('Tvergastein research does not authorize production');
}
const place = await readJson(placePath);
if (place.id !== research.placeId) throw new Error('Unexpected split record');

const lat = research.decision.recommendedLat;
const lon = research.decision.recommendedLon;
const radius = research.decision.recommendedRadius;
const sourceObjectId = research.kartverketPlaceName.sourceObjectId;
const sourceUrl = research.kartverketPlaceName.sourceUrl;
const buildingObjectId = research.buildingVerification.selectedBuilding.sourceObjectId;
const displacementMeters = research.displacementMeters;
const maximumFootprintDistance = research.buildingVerification.maximumFootprintDistanceMeters;
const oldCoordinate = { lat: place.lat, lon: place.lon, r: place.r };
const coordNote = `Offisielt stedsnavnpunkt fra Kartverkets Sentralt stedsnavnregister for Tvergastein, stedsnummer 1088119, objekttype Fritidsbolig, Hol kommune. Det andre eksakte Tvergastein-treffet er stedsnummer 1033507 med objekttype Adressenavn og ligger 4,5 meter unna; Fritidsbolig-objektet brukes fordi canonical record gjelder den fysiske hytta. Punktet ligger inne i OSM way 760918905, navngitt Tvergastein-hytta Arne Næss og merket building=cabin. Maksimal avstand fra SSR-punktet til hyttefotavtrykket er ${maximumFootprintDistance} meter; radius ${radius} meter bruker 30 meters buffer og minimum 80 meter for fjellterreng. Hallingskarvet-kilden bekrefter Arne Næss, 1505 moh. og byggeåret 1937. Den tidligere markøren lå ${displacementMeters} meter unna. Canonical year ${place.year} beholdes.`;

const updatedPlace = {
  ...place,
  lat,
  lon,
  r: radius,
  locatorType: 'building',
  sourceProvider: 'kartverket',
  sourceObjectId,
  geocodeAccuracy: 'building',
  coordRole: 'display_marker',
  coordType: 'place_name_point',
  coordStatus: 'verified',
  coordSource: 'kartverket_ssr_v1',
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordVerifiedAt: '2026-07-25',
  coordNote,
  externalLinks: [
    {
      type: 'official',
      label: 'Kartverket – Sentralt stedsnavnregister',
      url: sourceUrl,
      lang: 'nb',
      verifiedAt: '2026-07-25',
    },
  ],
};
await writeJson(placePath, updatedPlace);

const aggregate = await readJson(aggregatePath);
const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
if (aggregateIndex === -1) throw new Error('Tvergastein missing from aggregate');
aggregate[aggregateIndex] = updatedPlace;
await writeJson(aggregatePath, aggregate);

const categoryIndex = await readJson(categoryIndexPath);
const indexEntry = categoryIndex.find((entry) => entry.id === place.id);
if (!indexEntry) throw new Error('Tvergastein missing from category index');
Object.assign(indexEntry, {
  lat,
  lon,
  r: radius,
  coordStatus: 'verified',
  coordType: 'place_name_point',
});
await writeJson(categoryIndexPath, categoryIndex);

const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: placePath,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_fritidsbolig_point_with_cabin_radius',
  currentCoordinate: {
    lat,
    lon,
    r: radius,
    coordStatus: 'verified',
    coordSource: 'kartverket_ssr_v1',
    coordType: 'place_name_point',
    coordNote,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: research.identity.resolvedIdentity,
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'offisielt SSR-stedsobjekt',
    'skille mellom Fritidsbolig og Adressenavn',
    'navngitt hyttefotavtrykk',
    'målt radius',
  ],
  evidence: [
    {
      sourceProvider: 'kartverket',
      sourceName: 'Kartverket SSR – Tvergastein Fritidsbolig',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'official_place_name_register',
      finding: `Stedsnummer 1088119 er aktivt Fritidsbolig-objekt i Hol på ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Offisielt fysisk stedsobjekt for canonical hyttested.',
    },
    {
      sourceProvider: 'kartverket',
      sourceName: 'Kartverket SSR – Tvergastein Adressenavn',
      sourceUrl,
      sourceObjectId: 'kartverket-ssr:1033507:60.54915000,7.97969000',
      sourceQuality: 'official_place_name_register',
      finding: 'Det alternative treffet er objekttype Adressenavn, 4,5 meter fra Fritidsbolig-punktet, og brukes ikke som canonical hyttepunkt.',
      canVerifyCoordinate: false,
      reason: 'Dokumenterer kandidatoppløsningen.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Tvergastein-hytta Arne Næss',
      sourceUrl: 'https://www.openstreetmap.org/way/760918905',
      sourceObjectId: buildingObjectId,
      sourceQuality: 'named_cabin_building_geometry',
      finding: `SSR-punktet ligger inne i ett navngitt hyttefotavtrykk. Maksimal fotavtrykksavstand er ${maximumFootprintDistance} meter.`,
      canVerifyCoordinate: true,
      reason: 'Bekrefter fysisk hytte og radius.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Hallingskarvet – Tvergastein',
      sourceUrl: research.identitySources.localSourceUrl,
      sourceObjectId: 'hallingskarvet:tvergastein',
      sourceQuality: 'local_subject_source',
      finding: 'Kilden bekrefter Arne Næss, plasseringen ved Hallingskarvet, 1505 moh. og byggeåret 1937.',
      canVerifyCoordinate: false,
      reason: 'Historisk identitetskryssjekk.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'History Go Tvergastein research report',
      sourceUrl: researchPath,
      sourceObjectId: 'history-go-research:tvergastein-post-195',
      sourceQuality: 'reproducible_multi_source_research',
      finding: `Gammel markør var ${displacementMeters} meter feil; anbefalt radius er ${radius} meter.`,
      canVerifyCoordinate: true,
      reason: 'Samlet beslutningsgrunnlag.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    {
      sourceProvider: 'kartverket',
      sourceObjectId,
      canApplyToPlace: true,
    },
    {
      sourceProvider: 'osm',
      sourceObjectId: buildingObjectId,
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: buildingObjectId,
      canApplyToPlace: false,
    },
  ],
  coordinateCandidates: [
    {
      lat,
      lon,
      coordRole: 'display_marker',
      sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: `Kartverket SSR Fritidsbolig 1088119 er anvendt med radius ${radius} meter.`,
  },
  notes: [coordNote, `Research report: ${researchPath}`],
};
await writeJson(evidencePath, evidence);

await writeJson(productionPath, {
  version: '2026-07-25',
  protocolMaxBatch: 195,
  placeId: place.id,
  productionApplied: true,
  researchReport: researchPath,
  before: oldCoordinate,
  after: {
    lat,
    lon,
    r: radius,
    coordStatus: 'verified',
    coordType: 'place_name_point',
    locatorType: 'building',
    sourceProvider: 'kartverket',
    sourceObjectId,
  },
  displacementMeters,
  buildingObjectId,
  maximumFootprintDistanceMeters: maximumFootprintDistance,
  footprintBufferMeters: 30,
  minimumMountainRadiusMeters: 80,
  evidenceFile: evidencePath,
  canonicalYearPreserved: updatedPlace.year === place.year,
  categoryIndexSynchronized: true,
  noOtherCoordinateCandidateHandled: true,
});
await fs.writeFile(
  path.join(root, 'reports/oslo-coordinate-tvergastein-production-post-195/README.md'),
  `# Tvergastein coordinate production post-195\n\nApplied Kartverket SSR Fritidsbolig object 1088119 at ${lat}, ${lon} with an ${radius}-metre radius around the named cabin footprint.\n`,
  'utf8',
);
console.log(JSON.stringify({ placeId: place.id, lat, lon, radius, sourceObjectId, buildingObjectId }, null, 2));
