import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const researchRel = 'reports/oslo-coordinate-naturhistorisk-museum-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const reportRel = 'reports/oslo-coordinate-naturhistorisk-museum-production-post-195';
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/naturhistorisk_museum.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const indexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/naturhistorisk_museum.json';
const verifiedAt = '2026-07-24';

const assert = (v, m) => { if (!v) throw new Error(m); };
const readText = async (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const writeJson = async (rel, value) => {
  const absolute = path.join(root, rel);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  const text = jsonText(value);
  await fs.writeFile(absolute, text, 'utf8');
  return text;
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const distanceMeters = (a, b) => {
  const rad = (v) => v * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const mergeLinks = (existing, additions) => {
  const result = [], seen = new Set();
  for (const link of [...(Array.isArray(existing) ? existing : []), ...additions]) {
    if (!link?.url || seen.has(link.url)) continue;
    seen.add(link.url); result.push(link);
  }
  return result;
};

const protocol = await readText(protocolRel);
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])));
assert(maxBatch === 195 && !/^\|\s*196\s*\|/m.test(protocol), 'Protocol must stop at batch 195.');
const research = await readJson(researchRel);
assert(research.placeId === 'naturhistorisk_museum' && research.researchOnly === true && research.canonicalChanged === false, 'Unexpected research summary.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not authorize promotion.');
assert(research.coordinateDecision === 'promote_unique_official_address_point_supported_by_named_museum_object', 'Unexpected coordinate decision.');
assert(research.candidate?.sourceProvider === 'official_address', 'Candidate is not an official address point.');
assert(research.officialAddress?.coordinateCount === 1, 'Expected one official address point.');
assert(research.supportingOsmObject?.sourceObjectId === 'osm-node:5412354900', 'Unexpected museum POI.');
assert(research.buildingContext?.supportingBuilding?.sourceObjectId === 'osm-way:27011865', 'Unexpected supporting museum building.');
assert(research.buildingContext?.supportingBuilding?.containsAddress === true, 'Official point is outside supporting building.');
assert(research.buildingContext?.botanicalGardenStillExcluded === true, 'Botanical garden scope was not preserved.');

const place = await readJson(splitRel);
const aggregate = await readJson(aggregateRel);
const categoryIndex = await readJson(indexRel);
const manifest = await readJson(manifestRel);
assert(place.id === 'naturhistorisk_museum' && place.year === 1814, 'Unexpected canonical place.');
assert(Math.abs(place.lat - 59.9171) < 1e-9 && Math.abs(place.lon - 10.7738) < 1e-9, 'Canonical coordinate changed since research.');
const oldCoordinate = { lat: place.lat, lon: place.lon, r: place.r };
const candidate = { lat: Number(research.candidate.lat), lon: Number(research.candidate.lon) };
const displacementMeters = Number(distanceMeters(oldCoordinate, candidate).toFixed(1));
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) <= 0.2, 'Displacement no longer matches research.');
assert(Number(research.buildingContext.supportingBuilding.maximumVertexDistanceMeters) < Number(place.r), 'Radius does not cover supporting museum building.');

const coordNote = "Offisiell adressekoordinat fra Kartverket/Geonorge for Sars' gate 1, 0562 Oslo. Brønnøysundregistrene bekrefter Naturhistorisk museum som UiO-underenhet 926495720 under Universitetet i Oslo 971035854 på samme adresse. Punktet ligger inne i den navngitte UiO-bygningen Zoologisk museum, OSM way 27011865 (building=university, tourism=museum, Wikidata Q12011265), som dekker 1555 m². Punktet ligger 34.1 meter fra bygningens sentrum og 56 meter fra det dedikerte Naturhistorisk museum-POI-et OSM node 5412354900, som peker til den offisielle NHM-nettsiden og Wikidata Q1840963. Den tidligere markøren lå 371.9 meter unna. Radius 170 meter beholdes og dekker støttebyggets største målte sentrum-til-hjørne-avstand på 41.1 meter. Botanisk hage er eksplisitt beholdt som et separat canonical sted og brukes ikke som museumsmarkør.";
const updated = {
  ...place,
  lat: candidate.lat,
  lon: candidate.lon,
  r: 170,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: research.candidate.sourceObjectId,
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: research.candidate.sourceObjectId,
  coordSourceUrl: research.candidate.sourceUrl,
  coordVerifiedAt: verifiedAt,
  coordNote,
  address: { street: "Sars' gate", number: '1', postcode: '0562', city: 'Oslo', country: 'NO' },
  externalLinks: mergeLinks(place.externalLinks, [
    { type: 'official', label: 'Naturhistorisk museum – offisiell nettside', url: 'https://www.nhm.uio.no/', lang: 'nb', verifiedAt },
    { type: 'official', label: 'Brønnøysundregistrene – Naturhistorisk museum', url: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/926495720', lang: 'nb', verifiedAt },
  ]),
};
assert(updated.year === 1814, 'Production changed canonical year.');
const aggregateIndex = aggregate.findIndex((row) => row.id === place.id);
assert(aggregateIndex >= 0, 'Place missing from aggregate.');
aggregate[aggregateIndex] = updated;
const compactIndex = categoryIndex.findIndex((row) => row.id === place.id);
assert(compactIndex >= 0, 'Place missing from category index.');
categoryIndex[compactIndex] = { ...categoryIndex[compactIndex], lat: updated.lat, lon: updated.lon, r: updated.r, year: updated.year, coordStatus: updated.coordStatus, coordType: updated.coordType };
const splitText = await writeJson(splitRel, updated);
const aggregateText = await writeJson(aggregateRel, aggregate);
await writeJson(indexRel, categoryIndex);
const manifestRow = manifest.places?.find((row) => row.id === place.id);
assert(manifestRow, 'Place missing from manifest.');
manifestRow.sha256 = sha256(splitText);
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = manifest.places.length;
await writeJson(manifestRel, manifest);

const building = research.buildingContext.supportingBuilding;
const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_nhm_address_point_inside_named_museum_building',
  currentCoordinate: { lat: updated.lat, lon: updated.lon, r: updated.r, coordStatus: updated.coordStatus, coordSource: updated.coordSource, coordType: updated.coordType, coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: "Naturhistorisk museum ved Universitetet i Oslo, underenhet 926495720, Sars' gate 1, 0562 Oslo",
    identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'building', requiresSplit: false, splitReason: '',
  },
  requiredEvidence: ['eksakt offisiell besøksadresse', 'UiO- og Brønnøysund-identitet', 'fysisk museumbygg og dedikert institusjons-POI', 'avgrensning mot Botanisk hage'],
  evidence: [
    { sourceProvider: 'official_address', sourceName: "Kartverket Adresser API v1 – Sars' gate 1", sourceUrl: research.candidate.sourceUrl, sourceObjectId: research.candidate.sourceObjectId, sourceQuality: 'official_address', finding: "Ett unikt offisielt representasjonspunkt for Sars' gate 1, 0562 Oslo.", canVerifyCoordinate: true, reason: 'Punktet ligger inne i et navngitt museumbygg og nær dedikert NHM-POI.' },
    { sourceProvider: 'manual_research', sourceName: 'Brønnøysundregistrene – Naturhistorisk museum', sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/926495720', sourceObjectId: 'brreg-underenhet:926495720', sourceQuality: 'official_operating_location', finding: "Bekrefter Naturhistorisk museum, UiO-overordnet enhet og Sars' gate 1, 0562 Oslo.", canVerifyCoordinate: false, reason: 'Offisiell institusjons- og adresseidentitet.' },
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap node 5412354900 – Naturhistorisk museum', sourceUrl: 'https://www.openstreetmap.org/node/5412354900', sourceObjectId: 'osm-node:5412354900', sourceQuality: 'named_museum_institution_poi', finding: 'Dedikert museum-POI med offisiell NHM-nettside og Wikidata Q1840963, 56 meter fra adressepunktet.', canVerifyCoordinate: true, reason: 'Bekrefter institusjonens museumsfunksjon og identitet i området.' },
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap way 27011865 – Zoologisk museum', sourceUrl: 'https://www.openstreetmap.org/way/27011865', sourceObjectId: 'osm-way:27011865', sourceQuality: 'complete_named_museum_building_geometry', finding: `Navngitt UiO-museumbygg med Wikidata Q12011265. ${building.polygonNodeCount} noder, ${building.areaSquareMeters} m²; Kartverket-punktet ligger inne i bygget.`, canVerifyCoordinate: true, reason: 'Fysisk bygningskryssjekk for det offisielle adressepunktet.' },
    { sourceProvider: 'manual_research', sourceName: 'Canonical Botanisk hage scope', sourceUrl: 'data/places/vitenskap/oslo/places_vitenskap/botanisk_hage.json', sourceObjectId: 'history-go-place:botanisk_hage', sourceQuality: 'canonical_scope_guard', finding: 'Botanisk hage er allerede et separat canonical sted og ble eksplisitt forkastet som museumsmarkør.', canVerifyCoordinate: false, reason: 'Forhindrer at museum og hage kollapser til samme sted.' },
  ],
  addressCandidates: [{ address: "Sars' gate 1, 0562 Oslo", sourceProvider: 'official_address', sourceObjectId: research.candidate.sourceObjectId, lat: candidate.lat, lon: candidate.lon, canApplyToPlace: true }],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: research.candidate.sourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:5412354900', canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:27011865', canApplyToPlace: false },
    { sourceProvider: 'wikidata', sourceObjectId: 'wikidata:Q1840963', canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:27011865', canApplyToPlace: false }],
  coordinateCandidates: [{ sourceProvider: 'official_address', sourceObjectId: research.candidate.sourceObjectId, lat: candidate.lat, lon: candidate.lon, coordRole: 'display_marker', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: "Kartverket-punktet for Sars' gate 1 er anvendt som canonical display-markør etter UiO/Brønnøysund-, museums-POI- og bygningskontroll." },
  notes: [coordNote, `Research report: ${researchRel}`],
};
await writeJson(evidenceRel, evidence);

const audit = await readJson(auditRel);
const resolved = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const remaining = [];
for (const item of audit.actionableQueue ?? []) {
  let rows;
  try { rows = await readJson(item.sourcePath); } catch { continue; }
  const current = Array.isArray(rows) ? rows.find((row) => row.id === item.placeId) : null;
  if (!current || current.disabled === true || resolved.has(current.coordStatus)) continue;
  remaining.push({ ...item, coordStatus: current.coordStatus ?? null, coordType: current.coordType ?? null, locatorType: current.locatorType ?? null, coordSource: current.coordSource ?? null, coordSourceId: current.coordSourceId ?? null, lat: current.lat, lon: current.lon, disabled: current.disabled ?? false });
}
const summary = {
  version: verifiedAt, protocolMaxBatch: maxBatch, canonicalChanged: true, placeId: place.id,
  oldCoordinate, newCoordinate: { lat: updated.lat, lon: updated.lon, r: updated.r }, displacementMeters,
  coordinatePromoted: true, radiusChanged: oldCoordinate.r !== updated.r, yearChanged: place.year !== updated.year,
  canonicalYearPreserved: updated.year, coordStatus: updated.coordStatus, coordType: updated.coordType,
  sourceObjectId: updated.coordSourceId, officialAddress: research.officialAddress,
  museumPoi: research.supportingOsmObject, supportingBuilding: building,
  botanicalGardenKeptSeparate: true,
  synchronizedFiles: [splitRel, aggregateRel, indexRel, manifestRel, evidenceRel],
  remainingActionableCount: remaining.length, nextCandidate: remaining[0] ?? null,
  queueStatus: remaining.length ? 'fresh_main_unresolved_queue_continues' : 'post_195_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, summary);
await fs.mkdir(path.join(root, reportRel), { recursive: true });
await fs.writeFile(path.join(root, reportRel, 'README.md'), `# Natural History Museum coordinate production\n\n- Old coordinate: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- New coordinate: **${updated.lat}, ${updated.lon}**\n- Displacement: **${displacementMeters} m**\n- Radius changed: **no**\n- Year changed: **no**\n- Museum POI: **osm-node:5412354900**\n- Supporting building: **osm-way:27011865**\n- Botanisk hage kept separate: **yes**\n- Remaining actionable queue: **${remaining.length}**\n- Next candidate: **${remaining[0]?.placeId ?? 'none'}**\n- Protocol max batch: **${maxBatch}**\n`, 'utf8');
console.log(JSON.stringify({ status: 'natural_history_museum_coordinate_applied', oldCoordinate, newCoordinate: summary.newCoordinate, displacementMeters, remainingActionableCount: remaining.length, nextCandidate: summary.nextCandidate?.placeId ?? null, protocolMaxBatch: maxBatch }, null, 2));
