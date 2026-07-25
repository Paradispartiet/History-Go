import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placePath = 'data/places/vitenskap/oslo/places_vitenskap/teknisk_museum.json';
const aggregatePath = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexPath = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const researchPath = 'reports/oslo-coordinate-teknisk-museum-research-post-195/summary.json';
const evidencePath = 'data/coordinate-evidence/oslo/vitenskap/teknisk_museum.json';
const productionPath = 'reports/oslo-coordinate-teknisk-museum-production-post-195/summary.json';

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => {
  const absolutePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const research = await readJson(researchPath);
if (research.placeId !== 'teknisk_museum' || research.decision?.canBecomeVerified !== true) {
  throw new Error('Research report does not authorize Teknisk Museum production');
}
const place = await readJson(placePath);
if (place.id !== 'teknisk_museum') throw new Error('Unexpected split record');

const lat = research.decision.recommendedLat;
const lon = research.decision.recommendedLon;
const radius = research.decision.recommendedRadius;
const sourceObjectId = research.officialAddress.sourceObjectId;
const sourceUrl = research.officialAddress.sourceUrl;
const buildingId = research.buildingVerification.selectedBuilding.id;
const displacementMeters = research.displacementMeters;
const maximumFootprintDistanceMeters = research.buildingVerification.maximumFootprintDistanceMeters;
const oldCoordinate = { lat: place.lat, lon: place.lon, r: place.r };
const coordNote = `Offisiell adressekoordinat fra Kartverket/Geonorge for Kjelsåsveien 143, 0491 Oslo. Norsk Teknisk Museums offisielle side bekrefter identitet og adresse. Kartverket returnerer fire punkter for 143, 143B, 143C og 143D; det ulettererte 143-punktet ligger inne i OSM way ${buildingId}, navngitt Norsk Teknisk Museum og merket tourism=museum, mens B–D ligger i separate sidebygg. Maksimal avstand fra adressepunktet til hovedbyggets ytterkant er ${maximumFootprintDistanceMeters} meter; radius ${radius} meter dekker bygget med 30 meters buffer. Den tidligere markøren lå ${displacementMeters} meter unna. Canonical year ${place.year} beholdes.`;

const updatedPlace = {
  ...place,
  lat,
  lon,
  r: radius,
  locatorType: 'building',
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
    street: 'Kjelsåsveien',
    number: '143',
    postcode: '0491',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: [
    {
      type: 'official',
      label: 'Norsk Teknisk Museum – finn veien',
      url: 'https://www.tekniskmuseum.no/finn-veien',
      lang: 'nb',
      verifiedAt: '2026-07-25',
    },
  ],
};
await writeJson(placePath, updatedPlace);

const aggregate = await readJson(aggregatePath);
const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
if (aggregateIndex === -1) throw new Error('Teknisk Museum missing from aggregate');
aggregate[aggregateIndex] = updatedPlace;
await writeJson(aggregatePath, aggregate);

const categoryIndex = await readJson(categoryIndexPath);
const indexEntry = categoryIndex.find((entry) => entry.id === place.id);
if (!indexEntry) throw new Error('Teknisk Museum missing from category index');
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
  coordinateDecision: 'use_physically_resolved_official_address_point',
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
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'offisiell adresse og identitet',
    'fysisk skille mellom fire adressepunkter',
    'riktig navngitt museumsbygg',
    'målt bygningsradius',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket/Geonorge – Kjelsåsveien 143',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'official_address',
      finding: `Det ulettererte offisielle adressepunktet er ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Canonical display-marker under address-first policy.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Norsk Teknisk Museum – finn veien',
      sourceUrl: 'https://www.tekniskmuseum.no/finn-veien',
      sourceObjectId: 'tekniskmuseum:finn-veien',
      sourceQuality: 'official_current_site',
      finding: 'Norsk Teknisk Museum bekrefter Kjelsåsveien 143, 0491 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Identitets- og adressekryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap way ${buildingId} – Norsk Teknisk Museum`,
      sourceUrl: `https://www.openstreetmap.org/way/${buildingId}`,
      sourceObjectId: `osm-way:${buildingId}`,
      sourceQuality: 'named_museum_building_geometry',
      finding: '143-punktet ligger inne i hovedbygget; 143B, 143C og 143D ligger i separate sidebygg.',
      canVerifyCoordinate: true,
      reason: 'Fysisk kandidatoppløsning og bygningsgeometri.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'History Go Teknisk Museum research report',
      sourceUrl: researchPath,
      sourceObjectId: 'history-go-research:teknisk-museum-post-195',
      sourceQuality: 'reproducible_multi_source_research',
      finding: `Maksimal fotavtrykksavstand ${maximumFootprintDistanceMeters} meter + 30 meter buffer gir radius ${radius} meter. Gammel markør var ${displacementMeters} meter feil.`,
      canVerifyCoordinate: true,
      reason: 'Samlet reproduserbart beslutningsgrunnlag.',
    },
  ],
  addressCandidates: [
    {
      address: 'Kjelsåsveien 143, 0491 Oslo',
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
      sourceObjectId: `osm-way:${buildingId}`,
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-way:${buildingId}`,
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
    nextAction: `Kjelsåsveien 143 er anvendt med radius ${radius} meter.`,
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
    locatorType: 'building',
    sourceObjectId,
  },
  displacementMeters,
  buildingWayId: buildingId,
  maximumFootprintDistanceMeters,
  footprintBufferMeters: 30,
  evidenceFile: evidencePath,
  canonicalYearPreserved: updatedPlace.year === place.year,
  categoryIndexSynchronized: true,
  noOtherCoordinateCandidateHandled: true,
});
await fs.writeFile(
  path.join(root, 'reports/oslo-coordinate-teknisk-museum-production-post-195/README.md'),
  `# Norsk Teknisk Museum coordinate production post-195\n\nApplied Kartverket address point ${lat}, ${lon} for Kjelsåsveien 143 with radius ${radius} metres. Added contract metadata, evidence and index synchronization.\n`,
  'utf8',
);
console.log(JSON.stringify({ placeId: place.id, lat, lon, radius, sourceObjectId }, null, 2));
