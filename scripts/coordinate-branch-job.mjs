import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const researchRel = 'reports/oslo-coordinate-meteorologisk-institutt-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const reportRel = 'reports/oslo-coordinate-meteorologisk-institutt-production-post-195';
const reportDir = path.join(root, reportRel);
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/meteorologisk_institutt.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const indexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/meteorologisk_institutt.json';
const verifiedAt = '2026-07-24';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
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
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const mergeLinks = (existing, additions) => {
  const result = [];
  const seen = new Set();
  for (const link of [...(Array.isArray(existing) ? existing : []), ...additions]) {
    if (!link?.url || seen.has(link.url)) continue;
    seen.add(link.url);
    result.push(link);
  }
  return result;
};

await fs.mkdir(reportDir, { recursive: true });
const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; production must remain post-195.');

const research = await readJson(researchRel);
assert(research.placeId === 'meteorologisk_institutt', 'Unexpected research identity.');
assert(research.researchOnly === true && research.canonicalChanged === false, 'Research changed canonical data.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not authorize promotion.');
assert(research.coordinateDecision === 'promote_unique_official_address_point_supported_by_named_met_object', 'Unexpected coordinate decision.');
assert(research.candidate?.sourceProvider === 'official_address', 'Candidate is not an official address point.');
assert(research.geometry?.sourceObjectId === 'osm-way:5012038', 'Expected exact MET building geometry.');
assert(research.geometry?.officialAddressPointInside === true, 'Official address point is not inside the MET building.');
assert(research.geometry?.centroidInsidePolygon === true, 'MET building centroid is invalid.');
assert(research.sourceChecks?.officialMetIdentityAndAddress === true, 'Missing official MET identity check.');
assert(research.sourceChecks?.brregIdentityAndAddress === true, 'Missing Brønnøysund identity check.');
assert(research.sourceChecks?.official1866History === true, 'Missing official 1866 history check.');

const place = await readJson(splitRel);
const aggregate = await readJson(aggregateRel);
const categoryIndex = await readJson(indexRel);
const manifest = await readJson(manifestRel);
assert(place.id === 'meteorologisk_institutt', 'Unexpected split place.');
assert(place.year === 1866, 'Production must preserve canonical year 1866.');
assert(Math.abs(place.lat - 59.9429) < 1e-9 && Math.abs(place.lon - 10.7188) < 1e-9,
  'MET coordinate changed since research.');

const oldCoordinate = { lat: place.lat, lon: place.lon, r: place.r };
const candidate = { lat: Number(research.candidate.lat), lon: Number(research.candidate.lon) };
assert(Number.isFinite(candidate.lat) && Number.isFinite(candidate.lon), 'Invalid candidate coordinate.');
const displacementMeters = Number(distanceMeters(oldCoordinate, candidate).toFixed(1));
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) <= 0.2,
  'Production displacement no longer matches research.');
assert(Number(research.geometry.maximumVertexDistanceMeters) < Number(place.r),
  'Current radius does not cover the researched MET building.');

const coordNote = 'Offisiell adressekoordinat fra Kartverket/Geonorge for Henrik Mohns plass 1, 0371 Oslo. Meteorologisk institutts offisielle nettsider og Brønnøysundregistrene bekrefter hovedinstitusjonen, organisasjonsnummer 971274042 og samme forretningsadresse. Punktet ligger inne i den komplette, navngitte OSM-bygningen way 5012038, som er merket Meteorologisk institutt / Norwegian Meteorological Institute, government=meteorological, start_date=1866-12-01 og Wikidata Q665666. Polygonet består av 24 noder, dekker 1012.9 m², og adressepunktet ligger 5.4 meter fra geometrisk sentrum. Den tidligere markøren lå 103.7 meter unna. Radius 150 meter beholdes og dekker bygningens største målte sentrum-til-hjørne-avstand på 39.7 meter. METs FoU- og IT-miljø i Forskningsparken er behandlet som en separat driftslokasjon og ikke som hovedbyggets canonical markør.';

const updatedPlace = {
  ...place,
  lat: candidate.lat,
  lon: candidate.lon,
  r: 150,
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
  address: {
    street: 'Henrik Mohns plass',
    number: '1',
    postcode: '0371',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: mergeLinks(place.externalLinks, [
    {
      type: 'official',
      label: 'Meteorologisk institutt – offisiell nettside',
      url: 'https://www.met.no/',
      lang: 'nb',
      verifiedAt,
    },
    {
      type: 'official',
      label: 'Brønnøysundregistrene – Meteorologisk institutt',
      url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971274042',
      lang: 'nb',
      verifiedAt,
    },
  ]),
};
assert(updatedPlace.year === 1866, 'Production changed canonical year.');

const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
assert(aggregateIndex >= 0, 'MET missing from aggregate.');
aggregate[aggregateIndex] = updatedPlace;
const compactIndex = categoryIndex.findIndex((entry) => entry.id === place.id);
assert(compactIndex >= 0, 'MET missing from category index.');
categoryIndex[compactIndex] = {
  ...categoryIndex[compactIndex],
  lat: updatedPlace.lat,
  lon: updatedPlace.lon,
  r: updatedPlace.r,
  year: updatedPlace.year,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
};

const splitText = await writeJson(splitRel, updatedPlace);
const aggregateText = await writeJson(aggregateRel, aggregate);
await writeJson(indexRel, categoryIndex);
const manifestRow = manifest.places?.find((entry) => entry.id === place.id);
assert(manifestRow, 'MET missing from split manifest.');
manifestRow.sha256 = sha256(splitText);
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = manifest.places.length;
await writeJson(manifestRel, manifest);

const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_met_headquarters_address_point_inside_named_building',
  currentCoordinate: {
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Meteorologisk institutt (MET), organisasjonsnummer 971274042, hovedbygg ved Henrik Mohns plass 1, 0371 Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt offisiell hovedadresse',
    'offisiell institusjonsidentitet og organisasjonsnummer',
    'navngitt hovedbygggeometri som omslutter adressepunktet',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket Adresser API v1 – Henrik Mohns plass 1',
      sourceUrl: research.candidate.sourceUrl,
      sourceObjectId: research.candidate.sourceObjectId,
      sourceQuality: 'official_address',
      finding: 'Ett unikt offisielt representasjonspunkt for Henrik Mohns plass 1, 0371 Oslo: 59.94270614863892, 10.720621900236225.',
      canVerifyCoordinate: true,
      reason: 'Det unike Kartverket-punktet brukes som canonical display-markør fordi det ligger inne i det eksakte navngitte MET-hovedbygget.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Meteorologisk institutt – offisielle sider',
      sourceUrl: 'https://www.met.no/kontakt-oss/veibeskrivelse',
      sourceObjectId: 'met-official:henrik-mohns-plass-1',
      sourceQuality: 'official_institution_identity',
      finding: 'METs offisielle sider oppgir hovedadressen Henrik Mohns plass 1, 0371 Oslo og støtter institusjonshistorikken fra 1866.',
      canVerifyCoordinate: false,
      reason: 'Autoritativ institusjons-, adresse- og historikkilde; koordinaten leveres av Kartverket.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Meteorologisk institutt',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971274042',
      sourceObjectId: 'brreg-enhet:971274042',
      sourceQuality: 'official_institution_identity',
      finding: 'Hovedenheten Meteorologisk institutt har organisasjonsnummer 971274042 og forretningsadresse Henrik Mohns plass 1, 0371 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig institusjons- og adressekryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 5012038 – Meteorologisk institutt',
      sourceUrl: 'https://www.openstreetmap.org/way/5012038',
      sourceObjectId: 'osm-way:5012038',
      sourceQuality: 'complete_named_institution_building_geometry',
      finding: 'Komplett navngitt office=government-bygning for Meteorologisk institutt / Norwegian Meteorological Institute med start_date=1866-12-01 og Wikidata Q665666. Polygonet har 24 noder og dekker 1012.9 m²; Kartverket-punktet ligger inne i geometrien.',
      canVerifyCoordinate: true,
      reason: 'Bygningsgeometrien bekrefter at Kartverkets adressepunkt representerer METs hovedbygg.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q665666 – Meteorologisk institutt',
      sourceUrl: 'https://www.wikidata.org/wiki/Q665666',
      sourceObjectId: 'wikidata:Q665666',
      sourceQuality: 'structured_identity_crosscheck',
      finding: 'Dedikert strukturert identitetsobjekt koblet direkte fra den navngitte OSM-bygningen.',
      canVerifyCoordinate: false,
      reason: 'Identitetskryssjekk; koordinaten leveres av Kartverket og valideres mot hovedbygget.',
    },
  ],
  addressCandidates: [
    {
      address: 'Henrik Mohns plass 1, 0371 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: research.candidate.sourceObjectId,
      lat: candidate.lat,
      lon: candidate.lon,
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: research.candidate.sourceObjectId,
      canApplyToPlace: true,
    },
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:5012038',
      canApplyToPlace: false,
    },
    {
      sourceProvider: 'wikidata',
      sourceObjectId: 'wikidata:Q665666',
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:5012038',
      canApplyToPlace: false,
    },
  ],
  coordinateCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: research.candidate.sourceObjectId,
      lat: candidate.lat,
      lon: candidate.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Det unike Kartverket-punktet for Henrik Mohns plass 1 er anvendt som canonical display-markør etter kontroll mot det navngitte MET-hovedbygget.',
  },
  notes: [
    coordNote,
    `Research report: ${researchRel}`,
  ],
};
await writeJson(evidenceRel, evidence);

const freshAudit = await readJson(auditRel);
const resolvedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const remaining = [];
for (const item of freshAudit.actionableQueue ?? []) {
  let rows;
  try {
    rows = await readJson(item.sourcePath);
  } catch {
    continue;
  }
  const current = Array.isArray(rows) ? rows.find((entry) => entry.id === item.placeId) : null;
  if (!current || current.disabled === true || resolvedStatuses.has(current.coordStatus)) continue;
  remaining.push({
    ...item,
    coordStatus: current.coordStatus ?? null,
    coordType: current.coordType ?? null,
    locatorType: current.locatorType ?? null,
    coordSource: current.coordSource ?? null,
    coordSourceId: current.coordSourceId ?? null,
    lat: current.lat,
    lon: current.lon,
    disabled: current.disabled ?? false,
  });
}

const summary = {
  version: verifiedAt,
  protocolMaxBatch,
  canonicalChanged: true,
  placeId: place.id,
  oldCoordinate,
  newCoordinate: { lat: updatedPlace.lat, lon: updatedPlace.lon, r: updatedPlace.r },
  displacementMeters,
  coordinatePromoted: true,
  radiusChanged: oldCoordinate.r !== updatedPlace.r,
  yearChanged: place.year !== updatedPlace.year,
  canonicalYearPreserved: updatedPlace.year,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  sourceObjectId: updatedPlace.coordSourceId,
  geometry: research.geometry,
  officialAddress: research.officialAddress,
  synchronizedFiles: [splitRel, aggregateRel, indexRel, manifestRel, evidenceRel],
  remainingActionableCount: remaining.length,
  nextCandidate: remaining[0] ?? null,
  queueStatus: remaining.length > 0
    ? 'fresh_main_unresolved_queue_continues'
    : 'post_195_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Meteorological Institute coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical coordinate changed: **yes**\n- Old coordinate: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- New coordinate: **${updatedPlace.lat}, ${updatedPlace.lon}**\n- Displacement: **${displacementMeters} m**\n- Radius changed: **no**\n- Coordinate source: **${updatedPlace.coordSourceId}**\n- Supporting geometry: **OSM way 5012038**\n- Address point inside MET building: **yes**\n- Canonical year changed: **no**\n- Remaining actionable queue: **${remaining.length}**\n- Next candidate: **${remaining[0]?.placeId ?? 'none'}**\n- Batch 196 created: **no**\n\nThe unique official Henrik Mohns plass 1 address point is now the canonical display marker. It is independently supported by MET, Brønnøysund and the complete named institution building.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'meteorological_institute_coordinate_applied',
  reportDir: reportRel,
  oldCoordinate,
  newCoordinate: summary.newCoordinate,
  displacementMeters,
  yearChanged: summary.yearChanged,
  remainingActionableCount: remaining.length,
  nextCandidate: summary.nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
