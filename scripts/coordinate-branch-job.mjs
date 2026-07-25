import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placePath = 'data/places/vitenskap/oslo/places_vitenskap/universitetets_gamle_hovedbygning.json';
const aggregatePath = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexPath = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const researchPath = 'reports/oslo-coordinate-uio-sentrum-anlegg-research-post-195/summary.json';
const evidencePath = 'data/coordinate-evidence/oslo/vitenskap/universitetets_gamle_hovedbygning.json';
const productionPath = 'reports/oslo-coordinate-uio-sentrum-anlegg-production-post-195/summary.json';

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => {
  const absolutePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const research = await readJson(researchPath);
if (research.placeId !== 'universitetets_gamle_hovedbygning' || research.decision?.canBecomeVerified !== true) {
  throw new Error('UiO sentrum research does not authorize production');
}
const place = await readJson(placePath);
if (place.id !== research.placeId) throw new Error('Unexpected split record');

const lat = research.decision.recommendedLat;
const lon = research.decision.recommendedLon;
const radius = research.decision.recommendedRadius;
const sourceObjectId = research.officialAddress.sourceObjectId;
const sourceUrl = research.officialAddress.sourceUrl;
const displacementMeters = research.displacementMeters;
const maximumComplexDistance = research.buildingVerification.maximumComplexDistanceMeters;
const buildingIds = research.buildingVerification.buildings.map((entry) => entry.sourceObjectId);
const oldCoordinate = { lat: place.lat, lon: place.lon, r: place.r };
const coordNote = `Offisiell adressekoordinat fra Kartverket/Geonorge for Karl Johans gate 47, 0162 Oslo. Canonical record omfatter hele universitetsanlegget med Domus Media, Domus Academica og Domus Bibliotheca. Lovdata bekrefter Universitetet i Oslo-eiendommen på adressen. De tre fysiske byggene er OSM way 5004366, 111845745 og 5004360. Maksimal avstand fra adressepunktet til anleggets tre fotavtrykk er ${maximumComplexDistance} meter; radius ${radius} meter inkluderer 30 meters buffer. Den tidligere markøren lå ${displacementMeters} meter unna. Canonical year ${place.year} beholdes.`;

const updatedPlace = {
  ...place,
  lat,
  lon,
  r: radius,
  locatorType: 'current_place',
  sourceProvider: 'official_address',
  sourceObjectId,
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: sourceObjectId,
  coordSourceUrl: sourceUrl,
  coordVerifiedAt: '2026-07-25',
  coordNote,
  address: {
    street: 'Karl Johans gate',
    number: '47',
    postcode: '0162',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: [
    {
      type: 'official',
      label: 'Lovdata – fredning av Universitetet i Oslo, Karl Johans gate 47',
      url: research.legalPropertyVerification.sourceUrl,
      lang: 'nb',
      verifiedAt: '2026-07-25',
    },
    {
      type: 'official',
      label: 'Universitetet i Oslo',
      url: 'https://www.uio.no/',
      lang: 'nb',
      verifiedAt: '2026-07-25',
    },
  ],
};
await writeJson(placePath, updatedPlace);

const aggregate = await readJson(aggregatePath);
const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
if (aggregateIndex === -1) throw new Error('UiO sentrum record missing from aggregate');
aggregate[aggregateIndex] = updatedPlace;
await writeJson(aggregatePath, aggregate);

const categoryIndex = await readJson(categoryIndexPath);
const indexEntry = categoryIndex.find((entry) => entry.id === place.id);
if (!indexEntry) throw new Error('UiO sentrum record missing from category index');
Object.assign(indexEntry, {
  lat,
  lon,
  r: radius,
  coordStatus: 'verified',
  coordType: 'address_point',
});
await writeJson(categoryIndexPath, categoryIndex);

const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: placePath,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_address_point_with_three_building_complex_radius',
  currentCoordinate: {
    lat,
    lon,
    r: radius,
    coordStatus: 'verified',
    coordSource: 'geonorge_adresser_v1',
    coordType: 'address_point',
    coordNote,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: research.identity.resolvedIdentity,
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'current_place',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'offisielt adressepunkt',
    'juridisk eiendomsbekreftelse',
    'tre canonical bygningsfotavtrykk',
    'målt kompleksradius',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket/Geonorge – Karl Johans gate 47',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'official_address',
      finding: `Ett uletterert offisielt adressepunkt: ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Canonical display-marker under address-first policy.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lovdata – Universitetet i Oslo, Karl Johans gate 47',
      sourceUrl: research.legalPropertyVerification.sourceUrl,
      sourceObjectId: 'lovdata:forskrift:2001-05-04-449',
      sourceQuality: 'official_legal_source',
      finding: 'Fredningsforskriften bekrefter Universitetet i Oslo-eiendommen på Karl Johans gate 47.',
      canVerifyCoordinate: false,
      reason: 'Eiendoms- og identitetskryssjekk.',
    },
    ...research.buildingVerification.buildings.map((building) => ({
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap – ${building.canonicalName}`,
      sourceUrl: `https://www.openstreetmap.org/way/${building.sourceObjectId.split(':').at(-1)}`,
      sourceObjectId: building.sourceObjectId,
      sourceQuality: 'resolved_university_building_geometry',
      finding: `${building.canonicalName} inngår i canonical trebygninganlegg. Identifikasjon: ${building.identificationMethod}.`,
      canVerifyCoordinate: true,
      reason: 'Fysisk byggstøtte for kompleksradius.',
    })),
    {
      sourceProvider: 'manual_research',
      sourceName: 'History Go UiO sentrum research report',
      sourceUrl: researchPath,
      sourceObjectId: 'history-go-research:uio-sentrum-anlegg-post-195',
      sourceQuality: 'reproducible_multi_source_research',
      finding: `Maksimal kompleksavstand ${maximumComplexDistance} meter + 30 meter buffer gir radius ${radius} meter. Gammel markør var ${displacementMeters} meter feil.`,
      canVerifyCoordinate: true,
      reason: 'Samlet beslutningsgrunnlag.',
    },
  ],
  addressCandidates: [
    {
      address: 'Karl Johans gate 47, 0162 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId,
      canApplyToPlace: true,
    },
    ...buildingIds.map((id) => ({ sourceProvider: 'osm', sourceObjectId: id, canApplyToPlace: false })),
  ],
  geometryCandidates: buildingIds.map((id) => ({ sourceProvider: 'osm', sourceObjectId: id, canApplyToPlace: false })),
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
    nextAction: `Karl Johans gate 47 er anvendt med radius ${radius} meter over trebygninganlegget.`,
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
    coordType: 'address_point',
    locatorType: 'current_place',
    sourceObjectId,
  },
  displacementMeters,
  buildingObjectIds: buildingIds,
  maximumComplexDistanceMeters: maximumComplexDistance,
  complexBufferMeters: 30,
  canonicalThreeBuildingScopePreserved: true,
  evidenceFile: evidencePath,
  canonicalYearPreserved: updatedPlace.year === place.year,
  categoryIndexSynchronized: true,
  noOtherCoordinateCandidateHandled: true,
});
await fs.writeFile(
  path.join(root, 'reports/oslo-coordinate-uio-sentrum-anlegg-production-post-195/README.md'),
  `# UiO sentrum complex coordinate production post-195\n\nApplied Karl Johans gate 47 at ${lat}, ${lon} with a ${radius}-metre radius covering Domus Media, Domus Academica and Domus Bibliotheca.\n`,
  'utf8',
);
console.log(JSON.stringify({ placeId: place.id, lat, lon, radius, buildingIds }, null, 2));
