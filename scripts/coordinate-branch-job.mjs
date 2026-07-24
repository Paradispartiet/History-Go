import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const researchRel = 'reports/oslo-coordinate-oslomet-pilestredet-research-post-195/summary.json';
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/oslo_met_pilestredet.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const categoryIndexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/oslo_met_pilestredet.json';
const reportRel = 'reports/oslo-coordinate-oslomet-pilestredet-production-post-195';
const expected = {
  lat: 59.92110512950236,
  lon: 10.733028013329037,
  r: 270,
  oldLat: 59.9219,
  oldLon: 10.7346,
  oldR: 180,
  sourceObjectId: 'geonorge-adresser-v1:0301:15670:46:59.92110513,10.73302801',
  sourceUrl: 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Pilestredet&nummer=46&kommunenummer=0301&treffPerSide=20',
  osmObjectId: 'osm-way:115396392',
};
const assert = (value, message) => { if (!value) throw new Error(message); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const writeJson = async (rel, value) => {
  const abs = path.join(root, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const close = (a, b) => Math.abs(Number(a) - Number(b)) < 1e-10;

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batches) === 195, 'Coordinate protocol must remain at batch 195.');
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 must not exist.');

const research = await readJson(researchRel);
assert(research.placeId === 'oslo_met_pilestredet', 'Unexpected research report.');
assert(research.recommendation?.canBecomeVerified === true, 'Research did not clear production.');
assert(close(research.candidate?.lat, expected.lat) && close(research.candidate?.lon, expected.lon), 'Research coordinate changed.');
assert(Number(research.recommendation?.suggestedRadiusMeters) === expected.r, 'Research radius changed.');
assert(research.mainReceptionBuilding?.sourceObjectId === expected.osmObjectId, 'Research building changed.');

const split = await readJson(splitRel);
assert(split.id === 'oslo_met_pilestredet', 'Unexpected split record.');
assert(close(split.lat, expected.oldLat) && close(split.lon, expected.oldLon) && Number(split.r) === expected.oldR, 'Split baseline changed.');
assert(Number(split.year) === 1994, 'Canonical year changed.');

const aggregate = await readJson(aggregateRel);
const aggregateIndex = aggregate.findIndex((place) => place?.id === split.id);
assert(aggregateIndex >= 0, 'Aggregate record missing.');
assert(close(aggregate[aggregateIndex].lat, expected.oldLat) && close(aggregate[aggregateIndex].lon, expected.oldLon), 'Aggregate baseline changed.');

const categoryIndex = await readJson(categoryIndexRel);
const categoryIndexPosition = categoryIndex.findIndex((place) => place?.id === split.id);
assert(categoryIndexPosition >= 0, 'Category index record missing.');
assert(close(categoryIndex[categoryIndexPosition].lat, expected.oldLat)
  && close(categoryIndex[categoryIndexPosition].lon, expected.oldLon)
  && Number(categoryIndex[categoryIndexPosition].r) === expected.oldR,
'Category index baseline changed.');

const coordNote = 'Offisiell adressekoordinat fra Kartverket/Geonorge for hovedresepsjonen i Clara Holsts hus, Pilestredet 46, 0167 Oslo. OsloMets norske campusside oppgir Pilestredet 32–52, mens den engelske oppgir Pilestredet 32–54; campus representeres som ett flerbyggområde med markør ved hovedresepsjonen. Punktet ligger inne i OSM way 115396392, P46 - OsloMet, building=university. Dokumenterte aktive OsloMet-bygg i Pilestredet 32, 35, 40, 42, 44, 46, 48, 50 og 52 ligger opptil 221,3 meter fra markøren; radius 270 meter dekker ytterpunktet med 40 meters bygningsbuffer. Den tidligere markøren lå 124,4 meter unna. År 1994 beholdes.';
const address = { street: 'Pilestredet', number: '46', postcode: '0167', city: 'Oslo', country: 'NO' };
const fields = {
  lat: expected.lat,
  lon: expected.lon,
  r: expected.r,
  locatorType: 'building',
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
  externalLinks: [
    { type: 'official', label: 'OsloMet – studiested Pilestredet', url: 'https://www.oslomet.no/om/studiested-pilestredet', lang: 'nb', verifiedAt: '2026-07-24' },
    { type: 'official', label: 'OsloMet – kontakt', url: 'https://www.oslomet.no/om/kontakt', lang: 'nb', verifiedAt: '2026-07-24' },
    { type: 'official', label: 'Brønnøysundregistrene – OsloMet', url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/997058925', lang: 'nb', verifiedAt: '2026-07-24' },
  ],
};

const splitAfter = { ...split, ...fields };
aggregate[aggregateIndex] = { ...aggregate[aggregateIndex], ...fields };
categoryIndex[categoryIndexPosition] = {
  ...categoryIndex[categoryIndexPosition],
  lat: expected.lat,
  lon: expected.lon,
  r: expected.r,
  coordStatus: 'verified',
  coordType: 'address_point',
};
await writeJson(splitRel, splitAfter);
await writeJson(aggregateRel, aggregate);
await writeJson(categoryIndexRel, categoryIndex);

const currentCoordinate = {
  lat: expected.lat,
  lon: expected.lon,
  r: expected.r,
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordType: 'address_point',
  coordNote,
};
await writeJson(evidenceRel, {
  schemaVersion: '1.0',
  placeId: split.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_address_point',
  currentCoordinate,
  identity: {
    currentName: split.name,
    resolvedIdentity: 'OsloMet – storbyuniversitetet, org.nr. 997058925, underenhet 974647648, hovedresepsjon i Clara Holsts hus, Pilestredet 46, 0167 Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: ['eksakt adressepunkt', 'riktig bygg', 'flerbyggcampus', 'målt radius'],
  evidence: [
    { sourceProvider: 'official_address', sourceName: 'Kartverket/Geonorge – Pilestredet 46', sourceUrl: expected.sourceUrl, sourceObjectId: expected.sourceObjectId, sourceQuality: 'official_address', finding: 'Ett unikt adressepunkt: 59.92110512950236, 10.733028013329037.', canVerifyCoordinate: true, reason: 'Canonical display-marker.' },
    { sourceProvider: 'manual_research', sourceName: 'OsloMet – kontakt', sourceUrl: 'https://www.oslomet.no/om/kontakt', sourceObjectId: 'oslomet:contact', sourceQuality: 'official_institution_identity', finding: 'Pilestredet 46 og organisasjonsnummer 997058925.', canVerifyCoordinate: false, reason: 'Adresse- og identitetskryssjekk.' },
    { sourceProvider: 'manual_research', sourceName: 'OsloMet – Pilestredet (norsk)', sourceUrl: 'https://www.oslomet.no/om/studiested-pilestredet', sourceObjectId: 'oslomet:pilestredet:nb', sourceQuality: 'official_current_site', finding: 'Pilestredet 32–52; hovedresepsjon i Clara Holsts hus, P46.', canVerifyCoordinate: false, reason: 'Campus og hovedresepsjon.' },
    { sourceProvider: 'manual_research', sourceName: 'OsloMet – Pilestredet (English)', sourceUrl: 'https://www.oslomet.no/en/about/pilestredet-campus', sourceObjectId: 'oslomet:pilestredet:en', sourceQuality: 'official_current_site', finding: 'Pilestredet 32–54; main reception at P46.', canVerifyCoordinate: false, reason: 'Dokumenterer språkavviket.' },
    { sourceProvider: 'manual_research', sourceName: 'Brønnøysundregistrene – OsloMet', sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/997058925', sourceObjectId: 'brreg-enhet:997058925', sourceQuality: 'official_institution_identity', finding: 'OsloMet, org.nr. 997058925, Pilestredet 46.', canVerifyCoordinate: false, reason: 'Offentlig identitetskryssjekk.' },
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap way 115396392 – P46 OsloMet', sourceUrl: 'https://www.openstreetmap.org/way/115396392', sourceObjectId: expected.osmObjectId, sourceQuality: 'named_institution_building_geometry', finding: 'Adressepunktet ligger inne i P46 - OsloMet, building=university.', canVerifyCoordinate: true, reason: 'Bekrefter riktig bygg.' },
    { sourceProvider: 'manual_research', sourceName: 'History Go research report', sourceUrl: researchRel, sourceObjectId: 'history-go-research:oslomet-pilestredet-post-195', sourceQuality: 'reproducible_multi_source_research', finding: 'Maksimal aktiv-byggavstand 221,3 m + 40 m buffer gir radius 270 m.', canVerifyCoordinate: true, reason: 'Reproduserbar radiusberegning.' },
  ],
  addressCandidates: [{ address: 'Pilestredet 46, 0167 Oslo', sourceProvider: 'official_address', sourceObjectId: expected.sourceObjectId, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: expected.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: expected.osmObjectId, canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: expected.osmObjectId, canApplyToPlace: false }],
  coordinateCandidates: [{ lat: expected.lat, lon: expected.lon, coordRole: 'display_marker', sourceObjectId: expected.sourceObjectId, canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Pilestredet 46 er anvendt med radius 270 meter.' },
  notes: [coordNote, `Research report: ${researchRel}`],
});

await writeJson(`${reportRel}/summary.json`, {
  version: '2026-07-24',
  protocolMaxBatch: 195,
  placeId: split.id,
  productionApplied: true,
  researchReport: researchRel,
  before: { lat: expected.oldLat, lon: expected.oldLon, r: expected.oldR },
  after: { lat: expected.lat, lon: expected.lon, r: expected.r, coordStatus: 'verified', coordType: 'address_point', locatorType: 'building', sourceObjectId: expected.sourceObjectId },
  campusRepresentation: 'multi-building campus represented by an official main-reception building address anchor and a 270-metre radius',
  displacementMeters: 124.4,
  maximumCampusSupportDistanceMeters: 221.3,
  footprintBufferMeters: 40,
  evidenceFile: evidenceRel,
  canonicalYearPreserved: splitAfter.year === 1994,
  categoryIndexSynchronized: true,
  noOtherCoordinateCandidateHandled: true,
});
await fs.mkdir(path.join(root, reportRel), { recursive: true });
await fs.writeFile(path.join(root, reportRel, 'README.md'), `# OsloMet Pilestredet coordinate production\n\n- Marker: **${expected.lat}, ${expected.lon}**\n- Main reception: **Clara Holsts hus, Pilestredet 46**\n- Building: **${expected.osmObjectId} – P46 OsloMet**\n- Campus representation: **building address anchor + 270 m radius**\n- Radius: **180 m → 270 m**\n- Radius basis: **221,3 m + 40 m buffer**\n- Coordinate status: **verified**\n- Year 1994 preserved: **yes**\n- Protocol max: **195**\n`, 'utf8');
console.log(JSON.stringify({ status: 'oslo_met_pilestredet_coordinate_applied', coordinate: { lat: expected.lat, lon: expected.lon }, radius: expected.r, locatorType: 'building', protocolMaxBatch: 195 }, null, 2));
