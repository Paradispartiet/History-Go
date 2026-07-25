import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placePath = 'data/places/vitenskap/oslo/places_vitenskap/universitetet_i_oslo_blindern.json';
const aggregatePath = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexPath = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const researchPath = 'reports/oslo-coordinate-uio-blindern-research-post-195/summary.json';
const evidencePath = 'data/coordinate-evidence/oslo/vitenskap/universitetet_i_oslo_blindern.json';
const productionPath = 'reports/oslo-coordinate-uio-blindern-production-post-195/summary.json';

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => {
  const absolutePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const research = await readJson(researchPath);
if (research.placeId !== 'universitetet_i_oslo_blindern' || research.decision?.canBecomeVerified !== true) {
  throw new Error('Blindern research does not authorize production');
}
const place = await readJson(placePath);
if (place.id !== research.placeId) throw new Error('Unexpected split record');

const lat = research.decision.recommendedLat;
const lon = research.decision.recommendedLon;
const radius = research.decision.recommendedRadius;
const sourceObjectId = research.officialAddress.sourceObjectId;
const sourceUrl = research.officialAddress.sourceUrl;
const campusObjectId = research.campusGeometry.selectedArea.sourceObjectId;
const displacementMeters = research.displacementMeters;
const maximumBoundaryDistance = research.campusGeometry.maximumCampusBoundaryDistanceMeters;
const oldCoordinate = { lat: place.lat, lon: place.lon, r: place.r };
const coordNote = `Offisiell adressekoordinat fra Kartverket/Geonorge for Universitetet i Oslo, Problemveien 7, 0371 Oslo. Brønnøysundregistrene bekrefter Universitetet i Oslo på samme forretningsadresse. Campusavgrensningen bruker bare den ene ytre ringen i OSM relation 7757342 som fysisk inneholder Problemveien 7; tre øvrige UiO-komponenter er uttrykkelig utelatt. Maksimal avstand fra adressepunktet til Blindern-komponentens grense er ${maximumBoundaryDistance} meter; radius ${radius} meter inkluderer 20 meters buffer. Den tidligere markøren lå ${displacementMeters} meter unna. Canonical year ${place.year} beholdes.`;

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
    street: 'Problemveien',
    number: '7',
    postcode: '0371',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: [
    {
      type: 'official',
      label: 'Brønnøysundregistrene – Universitetet i Oslo',
      url: research.organisationVerification.sourceUrl,
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
if (aggregateIndex === -1) throw new Error('Blindern missing from aggregate');
aggregate[aggregateIndex] = updatedPlace;
await writeJson(aggregatePath, aggregate);

const categoryIndex = await readJson(categoryIndexPath);
const indexEntry = categoryIndex.find((entry) => entry.id === place.id);
if (!indexEntry) throw new Error('Blindern missing from category index');
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
  coordinateDecision: 'use_official_main_address_point_with_blindern_relation_component_radius',
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
    'offisielt UiO-adressepunkt',
    'organisasjonsbekreftelse',
    'fysisk avgrenset Blindern-komponent',
    'målt campusradius',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket/Geonorge – Problemveien 7',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'official_address',
      finding: `Ett unikt offisielt adressepunkt: ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Canonical display-marker under address-first policy.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Universitetet i Oslo',
      sourceUrl: research.organisationVerification.sourceUrl,
      sourceObjectId: `brreg:${research.organisationVerification.organisationNumber}`,
      sourceQuality: 'official_current_register',
      finding: 'Universitetet i Oslo er registrert på Problemveien 7, 0371 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Organisasjons- og adressekryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap relation 7757342 – Blindern-komponenten',
      sourceUrl: 'https://www.openstreetmap.org/relation/7757342',
      sourceObjectId: campusObjectId,
      sourceQuality: 'named_university_multipolygon_component',
      finding: `Bare den ytre ringen som inneholder Problemveien 7 brukes. Maksimal grenseavstand ${maximumBoundaryDistance} meter gir radius ${radius} meter med buffer.`,
      canVerifyCoordinate: true,
      reason: 'Avgrenser Blindern uten å inkludere andre UiO-campuskomponenter.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'History Go UiO Blindern research report',
      sourceUrl: researchPath,
      sourceObjectId: 'history-go-research:uio-blindern-post-195',
      sourceQuality: 'reproducible_multi_source_research',
      finding: `Den tidligere markøren var forskjøvet ${displacementMeters} meter.`,
      canVerifyCoordinate: true,
      reason: 'Samlet beslutningsgrunnlag.',
    },
  ],
  addressCandidates: [
    {
      address: 'Problemveien 7, 0371 Oslo',
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
    {
      sourceProvider: 'osm',
      sourceObjectId: campusObjectId,
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: campusObjectId,
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
    nextAction: `Problemveien 7 er anvendt med Blindern-radius ${radius} meter.`,
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
  campusGeometryObjectId: campusObjectId,
  maximumCampusBoundaryDistanceMeters: maximumBoundaryDistance,
  campusBufferMeters: 20,
  excludesOtherUiOCampusComponents: true,
  evidenceFile: evidencePath,
  canonicalYearPreserved: updatedPlace.year === place.year,
  categoryIndexSynchronized: true,
  noOtherCoordinateCandidateHandled: true,
});
await fs.writeFile(
  path.join(root, 'reports/oslo-coordinate-uio-blindern-production-post-195/README.md'),
  `# UiO Blindern coordinate production post-195\n\nApplied Problemveien 7 at ${lat}, ${lon} with a ${radius}-metre radius limited to the UiO relation component containing the address point.\n`,
  'utf8',
);
console.log(JSON.stringify({ placeId: place.id, lat, lon, radius, campusObjectId }, null, 2));
