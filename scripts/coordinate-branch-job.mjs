import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const auditRel = 'reports/oslo-coordinate-fresh-main-audit-post-195/summary.json';
const researchRel = 'reports/oslo-coordinate-nobelinstituttet-research-post-195';
const productionRel = 'reports/oslo-coordinate-nobelinstituttet-production-post-195';
const splitRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner/nobelinstituttet.json';
const aggregateRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner.json';
const indexRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner_index.json';
const manifestRel = 'data/places/vitenskap/oslo/places_vitenskap_historiske_institusjoner_manifest.json';
const evidenceRel = 'data/coordinate-evidence/oslo/vitenskap/nobelinstituttet.json';
const mainOrg = '971434457';
const subunit = '973276476';
const verifiedAt = '2026-07-24';

const assert = (value, message) => { if (!value) throw new Error(message); };
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
const fetchText = async (url, accept = 'text/html') => {
  const response = await fetch(url, {
    headers: {
      accept,
      'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
      'user-agent': 'History-Go coordinate audit/1.0 (github.com/Paradispartiet/History-Go)',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
};
const fetchJson = async (url) => JSON.parse(await fetchText(url, 'application/json'));
const normalize = (value) => String(value ?? '')
  .replace(/&nbsp;|&#160;/gi, ' ')
  .replace(/&aring;|&#229;/gi, 'å')
  .replace(/&oslash;|&#248;/gi, 'ø')
  .replace(/&aelig;|&#230;/gi, 'æ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/[’']/g, '')
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();
const distanceMeters = (a, b) => {
  const rad = (value) => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(h));
};
const pointInPolygon = (point, ring) => {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const a = ring[index];
    const b = ring[previous];
    if (((a.lat > point.lat) !== (b.lat > point.lat))
      && point.lon < ((b.lon - a.lon) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lon) inside = !inside;
  }
  return inside;
};
const polygonMetrics = (points) => {
  const ring = points[0].lat === points.at(-1).lat && points[0].lon === points.at(-1).lon
    ? points
    : [...points, points[0]];
  const referenceLat = ring.reduce((sum, point) => sum + point.lat, 0) / ring.length;
  const latScale = 111320;
  const lonScale = latScale * Math.cos(referenceLat * Math.PI / 180);
  let twiceArea = 0;
  let centroidX = 0;
  let centroidY = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const x1 = ring[index].lon * lonScale;
    const y1 = ring[index].lat * latScale;
    const x2 = ring[index + 1].lon * lonScale;
    const y2 = ring[index + 1].lat * latScale;
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    centroidX += (x1 + x2) * cross;
    centroidY += (y1 + y2) * cross;
  }
  assert(Math.abs(twiceArea) > 0.01, 'Nobel building polygon has zero area.');
  return {
    ring,
    areaSquareMeters: Math.abs(twiceArea / 2),
    centroid: {
      lat: (centroidY / (3 * twiceArea)) / latScale,
      lon: (centroidX / (3 * twiceArea)) / lonScale,
    },
  };
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

await fs.mkdir(path.join(root, researchRel), { recursive: true });
await fs.mkdir(path.join(root, productionRel), { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; this migration must stay post-195.');

const place = await readJson(splitRel);
const aggregate = await readJson(aggregateRel);
const categoryIndex = await readJson(indexRel);
const manifest = await readJson(manifestRel);
assert(place.id === 'nobelinstituttet', 'Unexpected canonical place.');
assert(place.year === 1905, 'Canonical year must remain 1905.');
assert(Math.abs(place.lat - 59.9198) < 1e-9 && Math.abs(place.lon - 10.7489) < 1e-9,
  'Nobel Institute coordinate changed before the consolidated migration.');
const oldCoordinate = { lat: Number(place.lat), lon: Number(place.lon), r: Number(place.r) };

const officialInstituteUrl = 'https://www.nobelpeaceprize.org/om-oss/nobelinstituttet/';
const officialBuildingUrl = 'https://www.nobelpeaceprize.org/bygningen/';
const brregMainUrl = `https://data.brreg.no/enhetsregisteret/api/enheter/${mainOrg}`;
const brregSubunitUrl = `https://data.brreg.no/enhetsregisteret/api/underenheter/${subunit}`;
const addressUrl = 'https://ws.geonorge.no/adresser/v1/sok?adressenavn=Henrik%20Ibsens%20gate&nummer=51&kommunenummer=0301&treffPerSide=20';

const [officialInstituteHtml, officialBuildingHtml, brregMain, brregSubunit, addressResponse] = await Promise.all([
  fetchText(officialInstituteUrl),
  fetchText(officialBuildingUrl),
  fetchJson(brregMainUrl),
  fetchJson(brregSubunitUrl),
  fetchJson(addressUrl),
]);

await fs.writeFile(path.join(root, researchRel, 'nobel-institute.html'), officialInstituteHtml, 'utf8');
await fs.writeFile(path.join(root, researchRel, 'nobel-building.html'), officialBuildingHtml, 'utf8');
await writeJson(`${researchRel}/brreg-main-971434457.json`, brregMain);
await writeJson(`${researchRel}/brreg-subunit-973276476.json`, brregSubunit);
await writeJson(`${researchRel}/geonorge-henrik-ibsens-gate-51.json`, addressResponse);

const officialInstituteText = normalize(officialInstituteHtml);
const officialBuildingText = normalize(officialBuildingHtml);
assert(officialInstituteText.includes('henrik ibsens gate 51'), 'Official Nobel page no longer shows Henrik Ibsens gate 51.');
assert(officialInstituteText.includes('1905'), 'Official Nobel page no longer supports the 1905 building history.');
assert(officialBuildingText.includes('henrik ibsens gate'), 'Official building page no longer identifies Henrik Ibsens gate.');
assert(officialBuildingText.includes('1905'), 'Official building page no longer supports occupation in 1905.');
assert(String(brregMain.organisasjonsnummer) === mainOrg, 'Unexpected Brønnøysund main organisation number.');
assert(normalize(brregMain.navn).includes('norske nobelinstitutt'), 'Unexpected Brønnøysund main-unit name.');
assert(String(brregSubunit.organisasjonsnummer) === subunit, 'Unexpected Brønnøysund operating-unit number.');
assert(String(brregSubunit.overordnetEnhet) === mainOrg, 'Unexpected Brønnøysund parent organisation.');
const mainAddress = normalize([
  ...(brregMain.forretningsadresse?.adresse ?? []),
  brregMain.forretningsadresse?.postnummer,
  brregMain.forretningsadresse?.poststed,
].join(' '));
const operatingAddress = normalize([
  ...(brregSubunit.beliggenhetsadresse?.adresse ?? []),
  brregSubunit.beliggenhetsadresse?.postnummer,
  brregSubunit.beliggenhetsadresse?.poststed,
].join(' '));
assert(mainAddress.includes('henrik ibsens gate 51'), 'Brønnøysund main-unit address mismatch.');
assert(operatingAddress.includes('henrik ibsens gate 51'), 'Brønnøysund operating-unit address mismatch.');

const officialCoordinates = [];
for (const row of (addressResponse.adresser ?? []).filter((entry) => normalize(entry.adressetekst) === 'henrik ibsens gate 51')) {
  const point = row.representasjonspunkt ?? {};
  const lat = Number(point.lat);
  const lon = Number(point.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
  if (officialCoordinates.some((candidate) => Math.abs(candidate.lat - lat) < 1e-9 && Math.abs(candidate.lon - lon) < 1e-9)) continue;
  officialCoordinates.push({
    lat,
    lon,
    rowCount: 1,
    addressText: row.adressetekst,
    sourceObjectId: `geonorge-adresser-v1:0301:${row.adressekode ?? 'henrik-ibsens-gate'}:${row.nummer ?? 51}${row.bokstav ?? ''}:${lat.toFixed(8)},${lon.toFixed(8)}`,
  });
}
assert(officialCoordinates.length === 1, `Expected one exact Kartverket point, got ${officialCoordinates.length}.`);
const candidate = officialCoordinates[0];

const overpassQuery = `[out:json][timeout:30];(way(around:300,${candidate.lat},${candidate.lon})[building];nwr(around:300,${candidate.lat},${candidate.lon})["name"~"Nobelinstitutt|Nobel Institute",i];nwr(around:300,${candidate.lat},${candidate.lon})["ref:NO:orgnr"="${mainOrg}"];);out center tags geom;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const overpass = await fetchJson(overpassUrl);
await writeJson(`${researchRel}/overpass-nobelinstituttet.json`, overpass);

const buildings = [];
for (const element of overpass.elements ?? []) {
  if (element.type !== 'way' || !Array.isArray(element.geometry) || element.geometry.length < 4) continue;
  const tags = element.tags ?? {};
  const identityText = normalize([tags.name, tags['name:en'], tags.operator, tags.description].join(' '));
  const polygon = element.geometry.map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
  const metrics = polygonMetrics(polygon);
  const containsAddress = pointInPolygon(candidate, metrics.ring);
  const namedInstitute = identityText.includes('nobelinstitutt')
    || identityText.includes('nobel institute')
    || tags['ref:NO:orgnr'] === mainOrg;
  buildings.push({
    sourceObjectId: `osm-way:${element.id}`,
    sourceUrl: `https://www.openstreetmap.org/way/${element.id}`,
    tags,
    containsAddress,
    namedInstitute,
    polygonNodeCount: polygon.length,
    areaSquareMeters: Number(metrics.areaSquareMeters.toFixed(1)),
    centroid: {
      lat: Number(metrics.centroid.lat.toFixed(8)),
      lon: Number(metrics.centroid.lon.toFixed(8)),
    },
    addressToCentroidMeters: Number(distanceMeters(candidate, metrics.centroid).toFixed(1)),
    maximumVertexDistanceMeters: Number(Math.max(...metrics.ring.map((point) => distanceMeters(metrics.centroid, point))).toFixed(1)),
  });
}
buildings.sort((a, b) => Number(b.namedInstitute) - Number(a.namedInstitute)
  || Number(b.containsAddress) - Number(a.containsAddress)
  || a.addressToCentroidMeters - b.addressToCentroidMeters);
const supportingBuilding = buildings.find((building) => building.namedInstitute && building.containsAddress)
  ?? buildings.find((building) => building.containsAddress)
  ?? null;
assert(supportingBuilding, 'Official address point is outside all nearby building polygons.');

const namedObject = (overpass.elements ?? []).find((element) => {
  const text = normalize([element.tags?.name, element.tags?.['name:en']].join(' '));
  return text.includes('nobelinstitutt') || text.includes('nobel institute');
}) ?? null;
assert(namedObject, 'No named Nobel Institute context object found.');
const namedCoordinate = Number.isFinite(Number(namedObject.lat))
  ? { lat: Number(namedObject.lat), lon: Number(namedObject.lon) }
  : { lat: Number(namedObject.center?.lat), lon: Number(namedObject.center?.lon) };
assert(Number.isFinite(namedCoordinate.lat) && Number.isFinite(namedCoordinate.lon), 'Named Nobel object lacks a coordinate.');
const addressToNamedObjectMeters = Number(distanceMeters(candidate, namedCoordinate).toFixed(1));
assert(supportingBuilding.containsAddress === true, 'Kartverket point is not inside the supporting building.');
assert(supportingBuilding.namedInstitute || addressToNamedObjectMeters <= 100,
  'Building and named institute context are too weak to promote the address point.');
assert(supportingBuilding.maximumVertexDistanceMeters < 150,
  'Existing 150-metre radius does not cover the supporting building.');

const displacementMeters = Number(distanceMeters(oldCoordinate, candidate).toFixed(1));
assert(Math.abs(displacementMeters - 1583.6) <= 0.2, `Unexpected displacement ${displacementMeters}.`);
const coordinateSourceId = candidate.sourceObjectId;
const coordinateNote = 'Offisiell adressekoordinat fra Kartverket/Geonorge for Henrik Ibsens gate 51, 0255 Oslo. Det Norske Nobelinstitutts offisielle sider bekrefter adressen og at instituttet flyttet inn i dagens bygg i mai 1905; Brønnøysundregistrenes hovedenhet 971434457 og underenhet 973276476 oppgir samme adresse. Punktet ligger inne i kontorbygget OSM way 132766124, et vernet treetasjes bygg på 596 m², 13,4 meter fra bygningssentrum. Det ligger også 7,7 meter fra det navngitte OSM-objektet node 13812187375, som identifiserer Det Norske Nobelinstitutt i bygget. Den tidligere markøren lå 1 583,6 meter unna. Radius 150 meter og canonical year 1905 beholdes; instituttet ble opprettet i 1904, mens 1905 her representerer innflyttingen i dagens bygg.';

const updatedPlace = {
  ...place,
  lat: candidate.lat,
  lon: candidate.lon,
  r: 150,
  locatorType: 'building',
  sourceProvider: 'official_address',
  sourceObjectId: coordinateSourceId,
  geocodeAccuracy: 'rooftop',
  coordRole: 'display_marker',
  coordType: 'address_point',
  coordStatus: 'verified',
  coordSource: 'geonorge_adresser_v1',
  coordSourceId: coordinateSourceId,
  coordSourceUrl: addressUrl,
  coordVerifiedAt: verifiedAt,
  coordNote: coordinateNote,
  address: {
    street: 'Henrik Ibsens gate',
    number: '51',
    postcode: '0255',
    city: 'Oslo',
    country: 'NO',
  },
  externalLinks: mergeLinks(place.externalLinks, [
    {
      type: 'official',
      label: 'Det Norske Nobelinstitutt – offisiell nettside',
      url: officialInstituteUrl,
      lang: 'nb',
      verifiedAt,
    },
    {
      type: 'official',
      label: 'Brønnøysundregistrene – Det Norske Nobelinstitutt',
      url: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971434457',
      lang: 'nb',
      verifiedAt,
    },
  ]),
};
assert(updatedPlace.year === 1905, 'Migration changed canonical year.');

const aggregateIndex = aggregate.findIndex((entry) => entry.id === place.id);
assert(aggregateIndex >= 0, 'Nobel Institute missing from aggregate.');
aggregate[aggregateIndex] = updatedPlace;
const compactIndex = categoryIndex.findIndex((entry) => entry.id === place.id);
assert(compactIndex >= 0, 'Nobel Institute missing from category index.');
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
const manifestEntry = manifest.places?.find((entry) => entry.id === place.id);
assert(manifestEntry, 'Nobel Institute missing from split manifest.');
manifestEntry.sha256 = sha256(splitText);
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
manifest.place_count = manifest.places.length;
await writeJson(manifestRel, manifest);

const researchSummary = {
  version: verifiedAt,
  protocolMaxBatch,
  researchOnly: false,
  canonicalChanged: true,
  placeId: place.id,
  placeName: place.name,
  identityDecision: 'resolved_norwegian_nobel_institute_henrik_ibsens_gate_51',
  historyDecision: 'institution_created_1904_current_building_occupied_1905_canonical_year_1905_preserved',
  coordinateDecision: 'promote_unique_official_address_point_supported_by_institute_building_context',
  oldCoordinate,
  candidate: {
    lat: candidate.lat,
    lon: candidate.lon,
    sourceProvider: 'official_address',
    sourceObjectId: coordinateSourceId,
    sourceUrl: addressUrl,
    objectType: 'institute_address_point',
  },
  displacementMeters,
  officialAddress: {
    address: 'Henrik Ibsens gate 51, 0255 Oslo',
    coordinateCount: 1,
    coordinates: officialCoordinates,
    selectionDecision: 'unique_official_point',
  },
  supportingBuilding,
  supportingOsmObject: {
    sourceObjectId: `osm-${namedObject.type}:${namedObject.id}`,
    sourceUrl: `https://www.openstreetmap.org/${namedObject.type}/${namedObject.id}`,
    coordinate: namedCoordinate,
    nearestAddressMeters: addressToNamedObjectMeters,
    tags: namedObject.tags ?? {},
  },
  sourceChecks: {
    officialInstituteHistoryAndAddress: true,
    officialBuildingHistory: true,
    brregMainIdentityAndAddress: true,
    brregOperatingIdentityAndAddress: true,
    geonorgeUniqueAddressPoint: true,
    addressInsideBuildingGeometry: true,
    namedInstituteContextFound: true,
  },
  recommendation: {
    canBecomeVerified: true,
    applied: true,
    coordStatus: 'verified',
    coordType: 'address_point',
    locatorType: 'building',
    radiusMeters: 150,
  },
};
await writeJson(`${researchRel}/summary.json`, researchSummary);
await fs.writeFile(path.join(root, researchRel, 'README.md'), `# Norwegian Nobel Institute coordinate research\n\n- Canonical coordinate changed: **yes, in the consolidated validated migration**\n- Official point: **${candidate.lat}, ${candidate.lon}**\n- Address-containing building: **${supportingBuilding.sourceObjectId}**\n- Named Nobel object: **osm-${namedObject.type}:${namedObject.id}**\n- Address-to-named-object distance: **${addressToNamedObjectMeters} m**\n- Displacement: **${displacementMeters} m**\n- Radius changed: **no**\n- Canonical year 1905 preserved: **yes**\n- Protocol max batch: **${protocolMaxBatch}**\n`, 'utf8');

const evidence = {
  schemaVersion: '1.0',
  placeId: place.id,
  placeFile: splitRel,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'use_official_nobel_institute_address_point_inside_building_with_named_context',
  currentCoordinate: {
    lat: updatedPlace.lat,
    lon: updatedPlace.lon,
    r: updatedPlace.r,
    coordStatus: updatedPlace.coordStatus,
    coordSource: updatedPlace.coordSource,
    coordType: updatedPlace.coordType,
    coordNote: coordinateNote,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Det Norske Nobelinstitutt, hovedenhet 971434457 og underenhet 973276476, Henrik Ibsens gate 51, 0255 Oslo',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'building',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'eksakt offisiell besøksadresse',
    'offisiell institusjons- og driftsstedsidentitet',
    'bygningspolygon som omslutter adressepunktet',
    'navngitt Nobel-kontekst ved bygget',
  ],
  evidence: [
    {
      sourceProvider: 'official_address',
      sourceName: 'Kartverket Adresser API v1 – Henrik Ibsens gate 51',
      sourceUrl: addressUrl,
      sourceObjectId: coordinateSourceId,
      sourceQuality: 'official_address',
      finding: `Ett unikt offisielt representasjonspunkt: ${candidate.lat}, ${candidate.lon}.`,
      canVerifyCoordinate: true,
      reason: 'Punktet brukes som canonical display-markør etter bygnings- og identitetskryssjekk.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Det Norske Nobelinstitutt – offisiell institutt- og bygningshistorikk',
      sourceUrl: officialInstituteUrl,
      sourceObjectId: 'nobel-official:instituttet-henrik-ibsens-gate-51',
      sourceQuality: 'official_institution_identity',
      finding: 'Bekrefter adressen, institusjonens opprettelse i 1904 og innflytting i dagens bygg i mai 1905.',
      canVerifyCoordinate: false,
      reason: 'Autoritativ identitets-, adresse- og historikkilde; koordinaten leveres av Kartverket.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Brønnøysundregistrene – Det Norske Nobelinstitutt',
      sourceUrl: 'https://virksomhet.brreg.no/nb/oppslag/enheter/971434457',
      sourceObjectId: 'brreg-enhet:971434457',
      sourceQuality: 'official_institution_identity',
      finding: 'Hovedenheten 971434457 og underenheten 973276476 oppgir Henrik Ibsens gate 51.',
      canVerifyCoordinate: false,
      reason: 'Uavhengig offentlig institusjons- og adressekryssjekk.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 132766124 – adressebygget',
      sourceUrl: 'https://www.openstreetmap.org/way/132766124',
      sourceObjectId: 'osm-way:132766124',
      sourceQuality: 'complete_address_building_geometry',
      finding: 'Vernet treetasjes kontorbygg på 596 m²; Kartverket-punktet ligger inne i polygonet og 13,4 meter fra bygningssentrum.',
      canVerifyCoordinate: true,
      reason: 'Fysisk bygningskryssjekk for det offisielle adressepunktet.',
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap node 13812187375 – Det Norske Nobelinstitutt',
      sourceUrl: 'https://www.openstreetmap.org/node/13812187375',
      sourceObjectId: 'osm-node:13812187375',
      sourceQuality: 'named_institution_context',
      finding: 'Navngitt institusjonsobjekt inne i bygget, 7,7 meter fra Kartverket-punktet.',
      canVerifyCoordinate: true,
      reason: 'Bekrefter at adressebygget faktisk er knyttet til Det Norske Nobelinstitutt.',
    },
  ],
  addressCandidates: [
    {
      address: 'Henrik Ibsens gate 51, 0255 Oslo',
      sourceProvider: 'official_address',
      sourceObjectId: coordinateSourceId,
      lat: candidate.lat,
      lon: candidate.lon,
      canApplyToPlace: true,
    },
  ],
  sourceObjectCandidates: [
    { sourceProvider: 'official_address', sourceObjectId: coordinateSourceId, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:132766124', canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: 'osm-node:13812187375', canApplyToPlace: false },
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:132766124', canApplyToPlace: false },
  ],
  coordinateCandidates: [
    {
      sourceProvider: 'official_address',
      sourceObjectId: coordinateSourceId,
      lat: candidate.lat,
      lon: candidate.lon,
      coordRole: 'display_marker',
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Henrik Ibsens gate 51 er anvendt som canonical display-markør.',
  },
  notes: [
    coordinateNote,
    `Research report: ${researchRel}/summary.json`,
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

const productionSummary = {
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
  institutionCreatedYear: 1904,
  presentBuildingOccupiedYear: 1905,
  coordStatus: updatedPlace.coordStatus,
  coordType: updatedPlace.coordType,
  sourceObjectId: updatedPlace.coordSourceId,
  supportingBuilding,
  supportingOsmObject: researchSummary.supportingOsmObject,
  synchronizedFiles: [splitRel, aggregateRel, indexRel, manifestRel, evidenceRel],
  remainingActionableCount: remaining.length,
  nextCandidate: remaining[0] ?? null,
  queueStatus: remaining.length > 0
    ? 'fresh_main_unresolved_queue_continues'
    : 'post_195_unresolved_queue_complete',
  batch196Created: false,
};
await writeJson(`${productionRel}/summary.json`, productionSummary);
await fs.writeFile(path.join(root, productionRel, 'README.md'), `# Norwegian Nobel Institute coordinate production\n\n- Old coordinate: **${oldCoordinate.lat}, ${oldCoordinate.lon}**\n- New coordinate: **${updatedPlace.lat}, ${updatedPlace.lon}**\n- Displacement: **${displacementMeters} m**\n- Radius changed: **no**\n- Canonical year changed: **no**\n- Canonical year retained: **1905**\n- Supporting building: **${supportingBuilding.sourceObjectId}**\n- Named Nobel object: **osm-${namedObject.type}:${namedObject.id}**\n- Remaining actionable queue: **${remaining.length}**\n- Next candidate: **${remaining[0]?.placeId ?? 'none'}**\n- Protocol max batch: **${protocolMaxBatch}**\n- Batch 196 created: **no**\n`, 'utf8');

console.log(JSON.stringify({
  status: 'nobel_institute_research_and_coordinate_applied',
  oldCoordinate,
  newCoordinate: productionSummary.newCoordinate,
  displacementMeters,
  radiusChanged: productionSummary.radiusChanged,
  yearChanged: productionSummary.yearChanged,
  supportingBuilding: supportingBuilding.sourceObjectId,
  namedObject: `osm-${namedObject.type}:${namedObject.id}`,
  remainingActionableCount: remaining.length,
  nextCandidate: productionSummary.nextCandidate?.placeId ?? null,
  protocolMaxBatch,
}, null, 2));
