import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const researchPath = 'reports/oslo-coordinate-ous-hospitals-research-post-195/summary.json';
const aggregatePath = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexPath = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const productionDir = 'reports/oslo-coordinate-ous-hospitals-production-post-195';

const readJson = async (relativePath) => JSON.parse(await fs.readFile(path.join(root, relativePath), 'utf8'));
const writeJson = async (relativePath, value) => {
  const absolutePath = path.join(root, relativePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

const configs = {
  radiumhospitalet: {
    splitPath: 'data/places/vitenskap/oslo/places_vitenskap/radiumhospitalet.json',
    evidencePath: 'data/coordinate-evidence/oslo/vitenskap/radiumhospitalet.json',
    street: 'Ullernchausséen',
    number: '70',
    postcode: '0379',
    officialUrl: 'https://www.oslo-universitetssykehus.no/steder/radiumhospitalet/',
    officialLabel: 'Oslo universitetssykehus – Radiumhospitalet',
    areaProvider: 'osm',
    areaObjectId: 'osm-way:143526382',
    areaUrl: 'https://www.openstreetmap.org/way/143526382',
    areaName: 'Radiumhospitalet',
  },
  rikshospitalet: {
    splitPath: 'data/places/vitenskap/oslo/places_vitenskap/rikshospitalet.json',
    evidencePath: 'data/coordinate-evidence/oslo/vitenskap/rikshospitalet.json',
    street: 'Sognsvannsveien',
    number: '20',
    postcode: '0372',
    officialUrl: 'https://www.oslo-universitetssykehus.no/steder/rikshospitalet',
    officialLabel: 'Oslo universitetssykehus – Rikshospitalet',
    areaProvider: 'osm',
    areaObjectId: 'osm-relation:14086466',
    areaUrl: 'https://www.openstreetmap.org/relation/14086466',
    areaName: 'Rikshospitalet',
  },
};

const research = await readJson(researchPath);
const aggregate = await readJson(aggregatePath);
const categoryIndex = await readJson(categoryIndexPath);
const productionResults = [];

for (const [placeId, config] of Object.entries(configs)) {
  const finding = research.places.find((entry) => entry.placeId === placeId);
  if (!finding || finding.decision?.canBecomeVerified !== true) {
    throw new Error(`${placeId}: research does not authorize production`);
  }
  const place = await readJson(config.splitPath);
  if (place.id !== placeId) throw new Error(`${placeId}: unexpected split record`);

  const lat = finding.decision.recommendedLat;
  const lon = finding.decision.recommendedLon;
  const radius = finding.decision.recommendedRadius;
  const sourceObjectId = finding.officialAddress.sourceObjectId;
  const sourceUrl = finding.officialAddress.sourceUrl;
  const supportedBuildingCount = finding.geometry.supportedBuildingCount;
  const maximumSupportDistance = finding.geometry.maximumCampusSupportDistanceMeters;
  const oldCoordinate = finding.currentCoordinate;
  const displacementMeters = finding.displacementMeters;

  const geometryDescription = placeId === 'rikshospitalet'
    ? `Punktet ligger innenfor OSM multipolygon relation 14086466, ${config.areaName}, som består av ${finding.geometry.relationOuterRingCount} ytre ringer. ${supportedBuildingCount} sykehusbygg har sentroid innenfor relasjonen.`
    : `Punktet ligger innenfor OSM way 143526382, ${config.areaName}. ${supportedBuildingCount} sykehusbygg har sentroid innenfor området.`;
  const coordNote = `Offisiell adressekoordinat fra Kartverket/Geonorge for ${config.street} ${config.number}, ${config.postcode} Oslo. Oslo universitetssykehus bekrefter adressen og sykehusidentiteten. ${geometryDescription} Maksimal avstand fra adressepunktet til den dokumenterte bygningsstøtten er ${maximumSupportDistance} meter; radius ${radius} meter dekker sykehusområdet med 40 meters buffer. Den tidligere markøren lå ${displacementMeters} meter unna. Canonical year ${place.year} beholdes.`;

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
      street: config.street,
      number: config.number,
      postcode: config.postcode,
      city: 'Oslo',
      country: 'NO',
    },
    externalLinks: [
      {
        type: 'official',
        label: config.officialLabel,
        url: config.officialUrl,
        lang: 'nb',
        verifiedAt: '2026-07-25',
      },
    ],
  };
  await writeJson(config.splitPath, updatedPlace);

  const aggregateIndex = aggregate.findIndex((entry) => entry.id === placeId);
  if (aggregateIndex === -1) throw new Error(`${placeId}: missing from aggregate`);
  aggregate[aggregateIndex] = updatedPlace;

  const categoryEntry = categoryIndex.find((entry) => entry.id === placeId);
  if (!categoryEntry) throw new Error(`${placeId}: missing from category index`);
  Object.assign(categoryEntry, {
    lat,
    lon,
    r: radius,
    coordStatus: 'verified',
    coordType: 'address_point',
  });

  const evidence = {
    schemaVersion: '1.0',
    placeId,
    placeFile: config.splitPath,
    evidenceStatus: 'applied_to_place',
    coordinateDecision: 'use_official_address_point_for_main_entrance',
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
      resolvedIdentity: `${place.name}, ${config.street} ${config.number}, ${config.postcode} Oslo`,
      identityStatus: 'resolved',
      identityProblem: '',
      locatorTypeCandidate: 'current_place',
      requiresSplit: false,
      splitReason: '',
    },
    requiredEvidence: [
      'eksakt offisielt adressepunkt',
      'offisiell sykehusidentitet',
      'navngitt sykehusområde',
      'målt flerbyggradius',
    ],
    evidence: [
      {
        sourceProvider: 'official_address',
        sourceName: `Kartverket/Geonorge – ${config.street} ${config.number}`,
        sourceUrl,
        sourceObjectId,
        sourceQuality: 'official_address',
        finding: `Ett unikt adressepunkt: ${lat}, ${lon}.`,
        canVerifyCoordinate: true,
        reason: 'Canonical display-marker under address-first policy.',
      },
      {
        sourceProvider: 'manual_research',
        sourceName: config.officialLabel,
        sourceUrl: config.officialUrl,
        sourceObjectId: `ous:${placeId}:official-place-page`,
        sourceQuality: 'official_current_site',
        finding: `${place.name} og adressen ${config.street} ${config.number}, ${config.postcode} Oslo er bekreftet av Oslo universitetssykehus.`,
        canVerifyCoordinate: false,
        reason: 'Institusjons- og adressekryssjekk.',
      },
      {
        sourceProvider: config.areaProvider,
        sourceName: `OpenStreetMap – ${config.areaName} sykehusområde`,
        sourceUrl: config.areaUrl,
        sourceObjectId: config.areaObjectId,
        sourceQuality: 'named_hospital_area_geometry',
        finding: `Adressepunktet ligger innenfor det navngitte sykehusområdet; ${supportedBuildingCount} støttede bygg og maksimal avstand ${maximumSupportDistance} meter gir radius ${radius} meter med buffer.`,
        canVerifyCoordinate: true,
        reason: 'Bekrefter fysisk flerbyggområde og radius.',
      },
      {
        sourceProvider: 'manual_research',
        sourceName: 'History Go OUS hospital research report',
        sourceUrl: researchPath,
        sourceObjectId: `history-go-research:${placeId}:post-195`,
        sourceQuality: 'reproducible_multi_source_research',
        finding: `Offisielt adressepunkt, sykehusområde og radius er reproduserbart dokumentert. Tidligere markør var forskjøvet ${displacementMeters} meter.`,
        canVerifyCoordinate: true,
        reason: 'Samlet beslutningsgrunnlag.',
      },
    ],
    addressCandidates: [
      {
        address: `${config.street} ${config.number}, ${config.postcode} Oslo`,
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
        sourceProvider: config.areaProvider,
        sourceObjectId: config.areaObjectId,
        canApplyToPlace: false,
      },
    ],
    geometryCandidates: [
      {
        sourceProvider: config.areaProvider,
        sourceObjectId: config.areaObjectId,
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
      nextAction: `${config.street} ${config.number} er anvendt med radius ${radius} meter.`,
    },
    notes: [
      coordNote,
      `Research report: ${researchPath}`,
    ],
  };
  await writeJson(config.evidencePath, evidence);

  productionResults.push({
    placeId,
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
    areaObjectId: config.areaObjectId,
    supportedBuildingCount,
    maximumCampusSupportDistanceMeters: maximumSupportDistance,
    evidenceFile: config.evidencePath,
    canonicalYearPreserved: updatedPlace.year === place.year,
  });
}

await writeJson(aggregatePath, aggregate);
await writeJson(categoryIndexPath, categoryIndex);
await writeJson(`${productionDir}/summary.json`, {
  version: '2026-07-25',
  protocolMaxBatch: 195,
  productionApplied: true,
  researchReport: researchPath,
  places: productionResults,
  categoryIndexSynchronized: true,
  noOtherCoordinateCandidateHandled: true,
});
await fs.mkdir(path.join(root, productionDir), { recursive: true });
await fs.writeFile(
  path.join(root, productionDir, 'README.md'),
  '# OUS hospitals coordinate production post-195\n\nApplied official Kartverket address points and named-hospital-area radii for Radiumhospitalet and Rikshospitalet. Added coordinate metadata, evidence files and index synchronization.\n',
  'utf8',
);
console.log(JSON.stringify(productionResults, null, 2));
