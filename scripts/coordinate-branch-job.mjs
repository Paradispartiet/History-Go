import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const researchRel = 'reports/oslo-coordinate-gamlebyen-skole-research-post-195/summary.json';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const reportRel = 'reports/oslo-coordinate-gamlebyen-skole-production-post-195';
const reportDir = path.join(root, reportRel);
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap/gamlebyen_skole.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap.json';
const indexRel = 'data/places/vitenskap/oslo/places_vitenskap_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/gamlebyen_skole.json';
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
assert(research.placeId === 'gamlebyen_skole', 'Unexpected research identity.');
assert(research.researchOnly === true && research.canonicalChanged === false, 'Research changed canonical data.');
assert(research.recommendation?.canBecomeVerified === true, 'Research does not authorize promotion.');
assert(research.coordinateDecision === 'promote_official_school_address_point', 'Unexpected coordinate decision.');
assert(research.candidate?.sourceProvider === 'official_address', 'Candidate is not an official address point.');
assert(research.geometry?.sourceObjectId === 'osm-way:263309956', 'Expected exact Gamlebyen school polygon.');
assert(research.geometry?.candidateInsidePolygon === true, 'Official address point is not inside the school geometry.');
assert(research.geometry?.centroidInsidePolygon === true, 'School geometry centroid is invalid.');
assert(research.sourceChecks?.officialAddressPointInsideSchoolGeometry === true, 'Missing address/geometry cross-check.');
assert(research.historyReview?.canonicalYear === 1799, 'Unexpected canonical year in research.');
assert(research.historyReview?.officialFoundingYear === 1881, 'Expected official 1881 founding year.');
assert(research.historyReview?.coordinateResearchChangedYear === false, 'Research changed the year unexpectedly.');

const place = await readJson(splitRel);
const aggregate = await readJson(aggregateRel);
const categoryIndex = await readJson(indexRel);
const manifest = await readJson(manifestRel);
assert(place.id === 'gamlebyen_skole', 'Unexpected split place.');
assert(place.year === 1799, 'Production must preserve canonical year 1799.');
assert(Math.abs(place.lat - 59.9036) < 1e-9 && Math.abs(place.lon - 10.7671) < 1e-9,
  'Gamlebyen school coordinate changed since research.');

const oldCoordinate = { lat: place.lat, lon: place.lon, r: place.r };
const candidate = {
  lat: Number(research.candidate.lat),
  lon: Number(research.candidate.lon),
};
assert(Number.isFinite(candidate.lat) && Number.isFinite(candidate.lon), 'Invalid candidate coordinate.');
const displacementMeters = Number(distanceMeters(oldCoordinate, candidate).toFixed(1));
assert(Math.abs(displacementMeters - Number(research.displacementMeters)) <= 0.2,
  'Production displacement no longer matches research.');
assert(Number(research.geometry.maximumVertexDistanceMeters) < Number(place.r),
  'Current radius does not cover the researched school geometry.');

const coordNote = 'Offisiell adressekoordinat fra Kartverket/Geonorge for Egedes gate 3, 0192 Oslo. Gamlebyen skoles offisielle Osloskolen-sider og Brønnøysundregistrenes underenhet 973626442 oppgir samme skoleidentitet og adresse. Punktet ligger inne i den komplette, navngitte OSM-skolegeometrien way 263309956, som bærer korrekt organisasjonsnummer 973626442, offisielt nettsted og Wikidata Q17194626. Polygonet består av 8 noder, dekker 5852.5 m², og adressepunktet ligger 40.5 meter fra geometrisk sentrum. Den tidligere markøren lå 402.9 meter unna. Radius 150 meter beholdes og dekker skolepolygonets største målte sentrum-til-hjørne-avstand på 56.2 meter. Osloskolens offisielle profil oppgir grunnleggelse i 1881; canonical year 1799 er ikke endret i denne koordinatmigreringen og må vurderes separat.';

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
    street: 'Egedes gate',
    number: '3',
    postcode: '0192',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: mergeLinks(place.externalLinks, [
    {
      type: 'official',
      label: 'Gamlebyen skole – offisiell nettside',
      url: 'https://gamlebyen.osloskolen.no/',
      lang: 'nb',
      verifiedAt,
    },
    {
      type: 'official',
      label: 'Brønnøysundregistrene – Gamlebyen skole',
      url: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/973626442',
      lang: 'nb',
      verifiedAt,
    },
  ]),
};
assert(updatedPlace.year === 1799, 'Production changed canonical year.');

const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
assert(aggregateIndex >= 0, 'Gamlebyen school missing from aggregate.');
aggregate[aggregateIndex] = updatedPlace;

const compactIndex = categoryIndex.findIndex((entry) => entry.id === place.id);
assert(compactIndex >= 0, 'Gamlebyen school missing from category index.');
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
assert(manifestRow, 'Gamlebyen school missing from split manifest.');
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
  coordinateDecision: 'use_official_school_address_point_inside_named_school_geometry',
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
    resolvedIdentity: 'Gamlebyen skole, kommunal barneskole ved Egedes gate 3, 0192 Oslo, Brønnøysund-underenhet 973626442',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt offisiell besøksadresse',
    'offisiell skole- og driftsstedsidentitet',
    'navngitt skolegeometri som omslutter adressepunktet',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket Adresser API v1 – Egedes gate 3',
      sourceUrl: research.candidate.sourceUrl,
      sourceObjectId: research.candidate.sourceObjectId,
      sourceQuality: 'official_address',
      finding: 'Ett unikt offisielt representasjonspunkt for Egedes gate 3, 0192 Oslo: 59.90681241, 10.77044366.',
      canVerifyCoordinate: true,
      reason: 'Det unike Kartverket-punktet brukes som canonical display-markør fordi det ligger inne i den eksakte navngitte skolegeometrien.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Gamlebyen skole – Osloskolen',
      sourceUrl: 'https://gamlebyen.osloskolen.no/',
      sourceObjectId: 'osloskolen:gamlebyen-skole',
      sourceQuality: 'official_school_identity',
      finding: 'Offisiell skoleprofil og kontaktside bekrefter Gamlebyen skole ved Egedes gate 3. Profilen oppgir at skolen ble grunnlagt i 1881.',
      canVerifyCoordinate: false,
      reason: 'Autoritativ skole-, adresse- og historikkilde; koordinaten leveres av Kartverket.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Gamlebyen skole underenhet 973626442',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/underenheter/973626442',
      sourceObjectId: 'brreg-underenhet:973626442',
      sourceQuality: 'official_operating_location',
      finding: 'Underenheten bekrefter Gamlebyen skole og beliggenhetsadresse Egedes gate 3, 0192 Oslo.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig skole- og adressekryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 263309956 – Gamlebyen skole',
      sourceUrl: 'https://www.openstreetmap.org/way/263309956',
      sourceObjectId: 'osm-way:263309956',
      sourceQuality: 'complete_named_school_geometry',
      finding: 'Komplett amenity=school-polygon med eksakt navn, organisasjonsnummer 973626442, offisielt nettsted og Wikidata Q17194626. Polygonet har 8 noder og dekker 5852.5 m²; Kartverket-punktet ligger inne i geometrien.',
      canVerifyCoordinate: true,
      reason: 'Skolegeometrien bekrefter at Kartverkets adressepunkt faktisk representerer Gamlebyen skole.',
    },
    {
      sourceProvider: 'wikidata',
      sourceName: 'Wikidata Q17194626 – Gamlebyen skole',
      sourceUrl: 'https://www.wikidata.org/wiki/Q17194626',
      sourceObjectId: 'wikidata:Q17194626',
      sourceQuality: 'structured_identity_crosscheck',
      finding: 'Dedikert strukturert identitetsobjekt koblet direkte fra den navngitte OSM-skolegeometrien.',
      canVerifyCoordinate: false,
      reason: 'Identitetskryssjekk; koordinaten leveres av Kartverket og valideres mot skolepolygonet.',
    },
  ],
  addressCandidates: [
    {
      address: 'Egedes gate 3, 0192 Oslo',
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
      sourceObjectId: 'osm-way:263309956',
      canApplyToPlace: false,
    },
    {
      sourceProvider: 'wikidata',
      sourceObjectId: 'wikidata:Q17194626',
      canApplyToPlace: false,
    },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:263309956',
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
    nextAction: 'Det unike Kartverket-punktet for Egedes gate 3 er anvendt som canonical display-markør etter kontroll mot den navngitte skolegeometrien.',
  },
  notes: [
    coordNote,
    `Research report: ${researchRel}`,
    'Historikkavvik: Osloskolens offisielle profil oppgir 1881, mens canonical year fortsatt er 1799. Årstallet er bevisst ikke endret i denne koordinat-PR-en.',
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
  newCoordinate: {
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
  },
  displacementMeters,
  coordinatePromoted: true,
  radiusChanged: oldCoordinate.r !== updatedPlace.r,
  yearChanged: place.year !== updatedPlace.year,
  canonicalYearPreserved: updatedPlace.year,
  officialFoundingYearReview: 1881,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  sourceObjectId: updatedPlace.coordSourceId,
  geometry: research.geometry,
  officialAddress: research.officialAddress,
  historyReview: {
    canonicalYear: updatedPlace.year,
    officialFoundingYear: 1881,
    mismatchPreservedForSeparateReview: true,
  },
  synchronizedFiles: [splitRel, aggregateRel, indexRel, manifestRel, evidenceRel],
  remainingActionableCount: remaining.length,
  nextCandidate: remaining[0] ?? null,
  queueStatus: remaining.length > 0
    ? 'fresh_main_unresolved_queue_continues'
    : 'post_195_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${reportRel}/summary.json`, summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Gamlebyen school coordinate production after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical coordinate changed: **yes**\n- Old coordinate: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- New coordinate: **${updatedPlace.lat}, ${updatedPlace.lon}**\n- Displacement: **${displacementMeters} m**\n- Radius changed: **no**\n- Coordinate source: **${updatedPlace.coordSourceId}**\n- Supporting geometry: **OSM way 263309956**\n- Address point inside school polygon: **yes**\n- Canonical year changed: **no**\n- Canonical year retained: **${updatedPlace.year}**\n- Official founding year flagged for separate review: **1881**\n- Remaining actionable queue: **${remaining.length}**\n- Next candidate: **${remaining[0]?.placeId ?? 'none'}**\n- Batch 196 created: **no**\n\nThe unique official Egedes gate 3 address point is now the canonical display marker. It is independently supported by the official school identity, Brønnøysund operating-unit identity and the complete named school polygon carrying the same organisation number.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'gamlebyen_school_coordinate_applied',
  reportDir: reportRel,
  oldCoordinate,
  newCoordinate: summary.newCoordinate,
  displacementMeters,
  yearChanged: summary.yearChanged,
  remainingActionableCount: remaining.length,
  nextCandidate: summary.nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
