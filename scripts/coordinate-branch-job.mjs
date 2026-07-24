import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const researchRel = 'reports/oslo-coordinate-oslomet-pilestredet-research-post-195/summary.json';
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/oslo_met_pilestredet.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/oslo_met_pilestredet.json';
const reportRel = 'reports/oslo-coordinate-oslomet-pilestredet-production-post-195';
const reportDir = path.join(root, reportRel);

const expected = {
  lat: 59.92110512950236,
  lon: 10.733028013329037,
  r: 270,
  oldLat: 59.9219,
  oldLon: 10.7346,
  oldR: 180,
  displacementMeters: 124.4,
  maximumCampusSupportDistanceMeters: 221.3,
  footprintBufferMeters: 40,
  sourceObjectId: 'geonorge-adresser-v1:0301:15670:46:59.92110513,10.73302801',
  sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Pilestredet&nummer=46&kommunenummer=0301&treffPerSide=20',
  osmObjectId: 'osm-way:115396392',
  osmUrl: 'https://www.openstreetmap.org/way/115396392',
};

const assert = (value, message) => { if (!value) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const writeJson = async (rel, value) => {
  const abs = path.join(root, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const sameNumber = (a, b, epsilon = 1e-10) => Math.abs(Number(a) - Number(b)) <= epsilon;

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; production must remain post-195.');

const research = await readJson(researchRel);
assert(research.placeId === 'oslo_met_pilestredet', 'Unexpected research placeId.');
assert(research.researchOnly === true && research.canonicalChanged === false, 'Research report is not research-only.');
assert(research.recommendation?.canBecomeVerified === true, 'Research did not clear the coordinate for production.');
assert(research.recommendation?.coordStatus === 'verified', 'Research recommendation is not verified.');
assert(research.recommendation?.coordType === 'address_point', 'Unexpected research coordinate type.');
assert(research.recommendation?.locatorType === 'campus', 'Unexpected research locator type.');
assert(sameNumber(research.candidate?.lat, expected.lat), 'Research latitude changed.');
assert(sameNumber(research.candidate?.lon, expected.lon), 'Research longitude changed.');
assert(Number(research.recommendation?.suggestedRadiusMeters) === expected.r, 'Research radius changed.');
assert(research.candidate?.sourceObjectId === expected.sourceObjectId, 'Research source object changed.');
assert(research.mainReceptionBuilding?.sourceObjectId === expected.osmObjectId, 'Research building geometry changed.');
assert(Number(research.maximumCampusSupportDistanceMeters) === expected.maximumCampusSupportDistanceMeters, 'Campus support distance changed.');
assert(Number(research.radiusMethod?.footprintBufferMeters) === expected.footprintBufferMeters, 'Campus buffer changed.');
assert(Array.isArray(research.scopeDecision?.verifiedActiveBuildingAddresses)
  && research.scopeDecision.verifiedActiveBuildingAddresses.join('|')
    === ['Pilestredet 32', 'Pilestredet 35', 'Pilestredet 40', 'Pilestredet 42', 'Pilestredet 44', 'Pilestredet 46', 'Pilestredet 48', 'Pilestredet 50', 'Pilestredet 52'].join('|'),
'Verified campus building set changed.');

const split = await readJson(splitRel);
assert(split.id === 'oslo_met_pilestredet', 'Unexpected split record.');
assert(sameNumber(split.lat, expected.oldLat) && sameNumber(split.lon, expected.oldLon), 'Canonical coordinate no longer matches research baseline.');
assert(Number(split.r) === expected.oldR, 'Canonical radius no longer matches research baseline.');
assert(Number(split.year) === 1994, 'Canonical year changed; aborting.');

const aggregate = await readJson(aggregateRel);
assert(Array.isArray(aggregate), 'Unexpected aggregate shape.');
const aggregateIndex = aggregate.findIndex((place) => place?.id === split.id);
assert(aggregateIndex >= 0, 'OsloMet record missing from aggregate.');
const aggregateBefore = aggregate[aggregateIndex];
assert(sameNumber(aggregateBefore.lat, expected.oldLat) && sameNumber(aggregateBefore.lon, expected.oldLon), 'Aggregate coordinate no longer matches baseline.');
assert(Number(aggregateBefore.r) === expected.oldR, 'Aggregate radius no longer matches baseline.');

const coordNote = 'Offisiell adressekoordinat fra Kartverket/Geonorge for hovedresepsjonen i Clara Holsts hus, Pilestredet 46, 0167 Oslo. OsloMets norske campusside oppgir Pilestredet 32–52, mens den engelske oppgir Pilestredet 32–54; campus representeres derfor som ett flerbyggområde med markør ved hovedresepsjonen. Punktet ligger inne i OSM way 115396392, navngitt P46 - OsloMet og merket building=university. Dokumenterte aktive OsloMet-bygg i Pilestredet 32, 35, 40, 42, 44, 46, 48, 50 og 52 ligger opptil 221,3 meter fra markøren; radius 270 meter dekker ytterpunktet med 40 meters bygningsbuffer. Den tidligere markøren lå 124,4 meter unna. År 1994 beholdes.';
const address = {
  street: 'Pilestredet',
  number: '46',
  postcode: '0167',
  city: 'Oslo',
  country: 'NO',
};
const coordinateFields = {
  lat: expected.lat,
  lon: expected.lon,
  r: expected.r,
  locatorType: 'campus',
  sourceProvider: 'official_address',
  sourceObjectId: expected.sourceObjectId,
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: expected.sourceObjectId,
  coordSourceUrl: expected.sourceUrl,
  coordVerifiedAt: '2026-07-24',
  coordNote,
  address,
};
const externalLinks = [
  {
    type: 'official',
    label: 'OsloMet – studiested Pilestredet',
    url: 'https://www.oslomet.no/om/studiested-pilestredet',
    lang: 'nb',
    verifiedAt: '2026-07-24',
  },
  {
    type: 'official',
    label: 'OsloMet – kontakt',
    url: 'https://www.oslomet.no/om/kontakt',
    lang: 'nb',
    verifiedAt: '2026-07-24',
  },
  {
    type: 'official',
    label: 'Brønnøysundregistrene – OsloMet',
    url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/997058925',
    lang: 'nb',
    verifiedAt: '2026-07-24',
  },
];

const splitAfter = { ...split, ...coordinateFields, externalLinks };
const aggregateAfter = { ...aggregateBefore, ...coordinateFields, externalLinks };
aggregate[aggregateIndex] = aggregateAfter;
await writeJson(splitRel, splitAfter);
await writeJson(aggregateRel, aggregate);

const currentCoordinate = {
  lat: expected.lat,
  lon: expected.lon,
  r: expected.r,
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordType: 'address_point',
  coordNote,
};
const evidence = {
  schemaVersion: '1.0',
  placeId: split.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_address_point',
  currentCoordinate,
  identity: {
    currentName: split.name,
    resolvedIdentity: 'OsloMet – storbyuniversitetet, organisasjonsnummer 997058925, underenhet Pilestredet 974647648, hovedresepsjon i Clara Holsts hus, Pilestredet 46, 0167 Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'campus',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt Kartverket-punkt for hovedresepsjonen i Pilestredet 46',
    'punktet inne i riktig OsloMet-bygg',
    'dokumentert representasjon av flerbyggcampusen',
    'målt radius for campusdekning',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket/Geonorge Adresser API v1 – Pilestredet 46',
      sourceUrl: expected.sourceUrl,
      sourceObjectId: expected.sourceObjectId,
      sourceQuality: 'official_address',
      finding: 'Ett unikt offisielt adressepunkt for Pilestredet 46, 0167 Oslo: 59.92110512950236, 10.733028013329037.',
      canVerifyCoordinate: true,
      reason: 'Kartverkets adressepunkt brukes som canonical display-marker ved OsloMets hovedresepsjon.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'OsloMet – kontakt',
      sourceUrl: 'https://www.oslomet.no/om/kontakt',
      sourceObjectId: 'oslomet:contact',
      sourceQuality: 'official_institution_identity',
      finding: 'OsloMet oppgir Pilestredet 46 som besøksadresse og organisasjonsnummer 997058925.',
      canVerifyCoordinate: false,
      reason: 'Offisiell adresse- og identitetskryssjekk; koordinaten leveres av Kartverket.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'OsloMet – studiested Pilestredet (norsk)',
      sourceUrl: 'https://www.oslomet.no/om/studiested-pilestredet',
      sourceObjectId: 'oslomet:pilestredet-campus:nb',
      sourceQuality: 'official_current_site',
      finding: 'Den norske siden oppgir campus i Pilestredet 32–52 og hovedresepsjonen i Clara Holsts hus, Pilestredet 46.',
      canVerifyCoordinate: false,
      reason: 'Fastslår hovedresepsjon og norsk campusavgrensning.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'OsloMet – Pilestredet campus (English)',
      sourceUrl: 'https://www.oslomet.no/en/about/pilestredet-campus',
      sourceObjectId: 'oslomet:pilestredet-campus:en',
      sourceQuality: 'official_current_site',
      finding: 'Den engelske siden oppgir campus i Pilestredet 32–54 og hovedresepsjonen i Pilestredet 46.',
      canVerifyCoordinate: false,
      reason: 'Dokumenterer det offisielle språkavviket og 54 som ytterste range-endepunkt.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – OsloMet – storbyuniversitetet',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/997058925',
      sourceObjectId: 'brreg-enhet:997058925',
      sourceQuality: 'official_institution_identity',
      finding: 'Hovedenheten er OsloMet – storbyuniversitetet, organisasjonsnummer 997058925, med adresse Pilestredet 46.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig identitets- og adressekryssjekk.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – OsloMet Pilestredet underenhet',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/974647648',
      sourceObjectId: 'brreg-underenhet:974647648',
      sourceQuality: 'official_institution_identity',
      finding: 'Underenhet 974647648 tilhører OsloMet 997058925 og har beliggenhetsadresse Pilestredet 46.',
      canVerifyCoordinate: false,
      reason: 'Bekrefter campusunderenheten og hovedresepsjonsadressen.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 115396392 – P46 OsloMet',
      sourceUrl: expected.osmUrl,
      sourceObjectId: expected.osmObjectId,
      sourceQuality: 'named_institution_building_geometry',
      finding: 'Kartverkets Pilestredet 46-punkt ligger inne i way 115396392, navngitt P46 - OsloMet og tagget building=university.',
      canVerifyCoordinate: true,
      reason: 'Bygningsgeometrien bekrefter at adressepunktet ligger i riktig OsloMet-bygg.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'OsloMet Pilestredet coordinate research',
      sourceUrl: researchRel,
      sourceObjectId: 'history-go-research:oslo-coordinate-oslomet-pilestredet-post-195',
      sourceQuality: 'reproducible_multi_source_research',
      finding: 'Aktive OsloMet-adresser P32, P35, P40, P42, P44, P46, P48, P50 og P52 ligger maksimalt 221,3 meter fra hovedresepsjonen. Med 40 meters bygningsbuffer blir anbefalt radius 270 meter.',
      canVerifyCoordinate: true,
      reason: 'Samler de offisielle adressepunktene og den reproduserbare radiusberegningen.',
    },
  ],
  addressCandidates: [
    {
      address: 'Pilestredet 46, 0167 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: expected.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: expected.sourceObjectId,
      canApplyToPlace: true,
    },
    {
      sourceProvider: 'osm',
      sourceObjectId: expected.osmObjectId,
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: expected.osmObjectId,
      canApplyToPlace: false,
    },
  ],
  coordinateCandidates: [
    {
      lat: expected.lat,
      lon: expected.lon,
      coordRole: 'display_marker',
      sourceObjectId: expected.sourceObjectId,
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Pilestredet 46 er anvendt som canonical display-marker for flerbyggcampusen, med radius 270 meter.',
  },
  notes: [
    coordNote,
    `Research report: ${researchRel}`,
  ],
};
await writeJson(evidenceRel, evidence);

const productionSummary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId: split.id,
  productionApplied: true,
  researchReport: researchRel,
  before: {
    lat: expected.oldLat,
    lon: expected.oldLon,
    r: expected.oldR,
  },
  after: {
    lat: expected.lat,
    lon: expected.lon,
    r: expected.r,
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'campus',
    sourceObjectId: expected.sourceObjectId,
  },
  displacementMeters: expected.displacementMeters,
  campusRepresentation: {
    marker: 'main reception, Clara Holsts hus, Pilestredet 46',
    norwegianOfficialRange: 'Pilestredet 32–52',
    englishOfficialRange: 'Pilestredet 32–54',
    verifiedActiveAddresses: research.scopeDecision.verifiedActiveBuildingAddresses,
    maximumSupportDistanceMeters: expected.maximumCampusSupportDistanceMeters,
    footprintBufferMeters: expected.footprintBufferMeters,
    radiusMeters: expected.r,
  },
  evidenceFile: evidenceRel,
  canonicalYearPreserved: Number(splitAfter.year) === 1994,
  noOtherCoordinateCandidateHandled: true,
};
await writeJson(`${reportRel}/summary.json`, productionSummary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# OsloMet Pilestredet coordinate production\n\n- Marker moved: **59.9219, 10.7346 → ${expected.lat}, ${expected.lon}**\n- Displacement: **${expected.displacementMeters} m**\n- Main reception: **Clara Holsts hus, Pilestredet 46**\n- Containing building: **${expected.osmObjectId} – P46 OsloMet**\n- Radius: **180 m → ${expected.r} m**\n- Radius basis: **${expected.maximumCampusSupportDistanceMeters} m maximum verified active-building distance + ${expected.footprintBufferMeters} m footprint buffer**\n- Locator type: **campus**\n- Coordinate status: **verified**\n- Canonical year 1994 preserved: **yes**\n- Protocol max batch: **${protocolMaxBatch}**\n`, 'utf8');

console.log(JSON.stringify({
  status: 'oslo_met_pilestredet_coordinate_applied',
  coordinate: { lat: expected.lat, lon: expected.lon },
  radius: expected.r,
  evidenceFile: evidenceRel,
  protocolMaxBatch,
}, null, 2));
