import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = process.cwd();
const placePath = 'data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json';
const aggregatePath = 'data/places/psykologi/oslo/places_psykologi.json';
const categoryIndexPath = 'data/places/psykologi/oslo/places_psykologi_index.json';
const evidencePath = 'data/coordinate-evidence/oslo/psykologi/psykologisk_institutt_uio.json';
const researchPath = 'reports/oslo-coordinate-psykologisk-institutt-uio-research-post-195/summary.json';
const productionDir = path.join(repoRoot, 'reports/oslo-coordinate-psykologisk-institutt-uio-production-post-195');
await fs.mkdir(productionDir, { recursive: true });
await fs.mkdir(path.dirname(path.join(repoRoot, evidencePath)), { recursive: true });

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(repoRoot, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => {
  await fs.mkdir(path.dirname(path.join(repoRoot, relativePath)), { recursive: true });
  await fs.writeFile(path.join(repoRoot, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const research = await readJson(researchPath);
if (research.placeId !== 'psykologisk_institutt_uio' || research.decision?.canBecomeVerified !== true) {
  throw new Error('Research report does not authorize production');
}

const lat = research.decision.recommendedLat;
const lon = research.decision.recommendedLon;
const radius = research.decision.recommendedRadius;
const sourceObjectId = research.officialAddress.sourceObjectId;
const sourceUrl = research.officialAddress.sourceUrl;
const osmWayId = research.buildingVerification.selectedBuilding.id;
const oldCoordinate = research.currentCoordinate;
const displacementMeters = research.displacementMeters;

const coordNote = `Offisiell adressekoordinat fra Kartverket/Geonorge for Psykologisk institutt ved Universitetet i Oslo i Harald Schjelderups hus, Forskningsveien 3A, 0373 Oslo. UiOs engelske kontaktside bekrefter både instituttet, bygget og besøksadressen. Adressepunktet ligger inne i OSM way ${osmWayId}, Harald Schjelderups hus, merket building=university og operator=Universitetet i Oslo. Maksimal avstand fra adressepunktet til bygningsfotavtrykkets ytterkant er ${research.buildingVerification.maxFootprintDistanceMeters} meter; radius ${radius} meter dekker bygget med 30 meters buffer. Den tidligere markøren lå ${displacementMeters} meter unna. År 1909 beholdes.`;

const place = await readJson(placePath);
if (place.id !== 'psykologisk_institutt_uio') throw new Error('Unexpected split place');
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
    street: 'Forskningsveien',
    number: '3A',
    postcode: '0373',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: [
    {
      type: 'official',
      label: 'Psykologisk institutt, UiO – kontakt',
      url: 'https://www.sv.uio.no/psi/english/about/contact/',
      lang: 'en',
      verifiedAt: '2026-07-25',
    },
    {
      type: 'official',
      label: 'Kartverket/GeoNorge – Forskningsveien 3A',
      url: sourceUrl,
      lang: 'nb',
      verifiedAt: '2026-07-25',
    },
  ],
};
await writeJson(placePath, updatedPlace);

const aggregate = await readJson(aggregatePath);
const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
if (aggregateIndex === -1) throw new Error('Place missing from aggregate');
aggregate[aggregateIndex] = updatedPlace;
await writeJson(aggregatePath, aggregate);

const categoryIndex = await readJson(categoryIndexPath);
const categoryEntry = categoryIndex.find((entry) => entry.id === place.id);
if (!categoryEntry) throw new Error('Place missing from category index');
Object.assign(categoryEntry, {
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
  coordinateDecision: 'use_official_address_point',
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
    'eksakt adressepunkt',
    'riktig universitetsbygg',
    'målt bygningsradius',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket/Geonorge – Forskningsveien 3A',
      sourceUrl,
      sourceObjectId,
      sourceQuality: 'official_address',
      finding: `Ett unikt adressepunkt: ${lat}, ${lon}.`,
      canVerifyCoordinate: true,
      reason: 'Canonical display-marker.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Universitetet i Oslo – Psykologisk institutt contact',
      sourceUrl: 'https://www.sv.uio.no/psi/english/about/contact/',
      sourceObjectId: 'uio:psi:contact:en',
      sourceQuality: 'official_current_site',
      finding: 'Psykologisk institutt holder til i Harald Schjelderups hus, Forskningsveien 3A, 0373 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Institusjons-, bygg- og adressekryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap way ${osmWayId} – Harald Schjelderups hus`,
      sourceUrl: `https://www.openstreetmap.org/way/${osmWayId}`,
      sourceObjectId: `osm-way:${osmWayId}`,
      sourceQuality: 'named_institution_building_geometry',
      finding: 'Adressepunktet ligger inne i et navngitt universitetsbygg med operator Universitetet i Oslo.',
      canVerifyCoordinate: true,
      reason: 'Bekrefter riktig bygg og fysisk utstrekning.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'History Go research report',
      sourceUrl: researchPath,
      sourceObjectId: 'history-go-research:psykologisk-institutt-uio-post-195',
      sourceQuality: 'reproducible_multi_source_research',
      finding: `Maksimal fotavtrykksavstand ${research.buildingVerification.maxFootprintDistanceMeters} m + 30 m buffer gir radius ${radius} m.`,
      canVerifyCoordinate: true,
      reason: 'Reproduserbar radiusberegning.',
    },
  ],
  addressCandidates: [
    {
      address: 'Forskningsveien 3A, 0373 Oslo',
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
      sourceObjectId: `osm-way:${osmWayId}`,
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: `osm-way:${osmWayId}`,
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
    nextAction: `Forskningsveien 3A er anvendt med radius ${radius} meter.`,
  },
  notes: [
    coordNote,
    `Research report: ${researchPath}`,
  ],
};
await writeJson(evidencePath, evidence);

const productionSummary = {
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
  buildingWayId: osmWayId,
  maximumFootprintDistanceMeters: research.buildingVerification.maxFootprintDistanceMeters,
  footprintBufferMeters: research.radiusRecommendation.footprintBufferMeters,
  evidenceFile: evidencePath,
  canonicalYearPreserved: updatedPlace.year === place.year,
  categoryIndexSynchronized: true,
  noOtherCoordinateCandidateHandled: true,
};
await writeJson('reports/oslo-coordinate-psykologisk-institutt-uio-production-post-195/summary.json', productionSummary);
await fs.writeFile(path.join(productionDir, 'README.md'), `# Psykologisk institutt, UiO – production post-195\n\nApplied Kartverket address point ${lat}, ${lon} for Forskningsveien 3A with radius ${radius} metres. Added coordinate metadata, evidence and index synchronization.\n`, 'utf8');

console.log(JSON.stringify(productionSummary, null, 2));
