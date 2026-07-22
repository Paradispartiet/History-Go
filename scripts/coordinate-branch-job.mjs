import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 144;
const PLACE_ID = 'ljanselva_hauketo';
const OSM_WAY_ID = 695993872;
const VERIFIED_AT = '2026-07-22';
const LJA_BRU_REFERENCE = { lat: 59.8489644, lon: 10.8043624 };

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_hauketo.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ljanselva_hauketo.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const priorCandidatePath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-112-ljanselva-route/nominatim-ljanselva_hauketo.json');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-144-ljanselva-hauketo-segment');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}
function decodeXml(value = '') {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');
}
function attrs(tag) {
  const out = {};
  for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/g)) out[match[1]] = decodeXml(match[2]);
  return out;
}
function haversineM(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function geoJsonPoints(candidate) {
  if (candidate?.geojson?.type !== 'LineString' || !Array.isArray(candidate.geojson.coordinates)) return [];
  return candidate.geojson.coordinates
    .filter((coord) => Array.isArray(coord) && coord.length >= 2)
    .map(([lon, lat]) => ({ lat: Number(lat), lon: Number(lon) }));
}
function lineLengthM(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineM(points[i - 1], points[i]);
  return total;
}
function endpointDistanceM(points, reference) {
  if (points.length < 2) return Infinity;
  return Math.min(haversineM(points[0], reference), haversineM(points.at(-1), reference));
}
function lineMidpoint(points) {
  if (points.length < 2) throw new Error('Kildegeometrien mangler nok punkter');
  const totalLengthM = lineLengthM(points);
  const target = totalLengthM / 2;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const lengthM = haversineM(a, b);
    if (walked + lengthM >= target) {
      const fraction = lengthM === 0 ? 0 : (target - walked) / lengthM;
      return {
        lat: Number((a.lat + (b.lat - a.lat) * fraction).toFixed(7)),
        lon: Number((a.lon + (b.lon - a.lon) * fraction).toFixed(7)),
        totalLengthM: Number(totalLengthM.toFixed(1)),
      };
    }
    walked += lengthM;
  }
  const last = points.at(-1);
  return { lat: Number(last.lat.toFixed(7)), lon: Number(last.lon.toFixed(7)), totalLengthM: Number(totalLengthM.toFixed(1)) };
}
async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status} for ${url}`);
  return response.text();
}
function updatePlaceRecord(place, anchor) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID} i forventet record`);
  return {
    ...place,
    lat: anchor.lat,
    lon: anchor.lon,
    sourceHint: 'Koordinaten er lengdemidtpunktet på OSM way 695993872, den lange Ljanselva-strekningen umiddelbart øst for Lja bru langs Hauketo-områdets nordside.',
    coordType: 'river_segment_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 695993872 – Ljanselva ved Hauketo/Ljabru',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:695993872',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:695993872',
    coordSourceUrl: 'https://www.openstreetmap.org/way/695993872',
    coordNote: 'Batch 144 løser Hauketo-scope med kildebelagt stedsavgrensning og elvetopologi, ikke med legacy-punkt eller nearest-søk. Hauketo er dokumentert som strøket sør for Ljabru med Ljanselva som nordgrense, og Oslo byleksikon dokumenterer elvas korridor nord for Hauketo stasjon. I batch-112-kandidatsettet er OSM way 695993872 den eneste lange eksakt navngitte Ljanselva-geometrien som ender ved det dokumenterte Lja bru-krysset; de øvrige treffene er oppstrømssegmenter, korte koblingssegmenter ved brua eller segmentet videre vest for brua. Canonical lat/lon er beregnet som lengdemidtpunkt langs way 695993872.',
  };
}

fs.mkdirSync(reportDir, { recursive: true });

const aggregateBefore = readJson(aggregatePath);
const aggregateOld = aggregateBefore.find((place) => place?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate-filen`);
const legacyCoordinate = { lat: aggregateOld.lat, lon: aggregateOld.lon };

const priorCandidates = readJson(priorCandidatePath);
const exactCandidates = (priorCandidates.results || []).filter((candidate) =>
  candidate?.name === 'Ljanselva' && candidate?.category === 'waterway' && candidate?.type === 'river'
);
if (exactCandidates.length !== 5) throw new Error(`Forventet fem eksakte batch-112-kandidater, fikk ${exactCandidates.length}`);

const candidateAnalysis = exactCandidates.map((candidate) => {
  const points = geoJsonPoints(candidate);
  return {
    osmType: candidate.osm_type,
    osmId: candidate.osm_id,
    name: candidate.name,
    displayName: candidate.display_name,
    boundingbox: candidate.boundingbox,
    nodeCount: points.length,
    lineLengthM: Number(lineLengthM(points).toFixed(1)),
    endpointDistanceToLjaBruM: Number(endpointDistanceM(points, LJA_BRU_REFERENCE).toFixed(1)),
    qualifiesAsHauketoNorthBoundarySegment: endpointDistanceM(points, LJA_BRU_REFERENCE) <= 35 && lineLengthM(points) >= 500,
  };
});
const qualified = candidateAnalysis.filter((candidate) => candidate.qualifiesAsHauketoNorthBoundarySegment);
if (qualified.length !== 1 || Number(qualified[0].osmId) !== OSM_WAY_ID) {
  throw new Error(`Hauketo-disambiguering endret: forventet kun OSM way ${OSM_WAY_ID}, fikk ${JSON.stringify(qualified)}`);
}

const osmUrl = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}/full`;
const osmXml = await fetchText(osmUrl);
fs.writeFileSync(path.join(reportDir, `osm-way-${OSM_WAY_ID}-full.xml`), osmXml);

const nodeMap = new Map();
for (const match of osmXml.matchAll(/<node\b[^>]*>/g)) {
  const a = attrs(match[0]);
  if (a.id && a.lat && a.lon) nodeMap.set(String(a.id), { lat: Number(a.lat), lon: Number(a.lon) });
}
const wayMatch = osmXml.match(new RegExp(`<way\\b[^>]*\\bid="${OSM_WAY_ID}"[^>]*>([\\s\\S]*?)<\\/way>`));
if (!wayMatch) throw new Error(`Fant ikke OSM way ${OSM_WAY_ID} i råkilden`);
const wayBody = wayMatch[1];
const tags = {};
for (const match of wayBody.matchAll(/<tag\b[^>]*\/>/g)) {
  const a = attrs(match[0]);
  if (a.k) tags[a.k] = a.v ?? '';
}
const nodeRefs = [...wayBody.matchAll(/<nd\b[^>]*\/>/g)].map((match) => attrs(match[0]).ref).filter(Boolean);
const linePoints = nodeRefs.map((ref) => nodeMap.get(String(ref))).filter(Boolean);
if (tags.name !== 'Ljanselva') throw new Error(`OSM way ${OSM_WAY_ID} har uventet navn: ${tags.name}`);
if (tags.waterway !== 'river') throw new Error(`OSM way ${OSM_WAY_ID} har uventet waterway-type: ${tags.waterway}`);
if (linePoints.length !== nodeRefs.length || linePoints.length < 2) throw new Error(`Kunne ikke rekonstruere full geometri for OSM way ${OSM_WAY_ID}`);
const freshBridgeDistanceM = endpointDistanceM(linePoints, LJA_BRU_REFERENCE);
if (freshBridgeDistanceM > 35) throw new Error(`Fresh OSM way er ikke lenger topologisk nær Lja bru-referansen: ${freshBridgeDistanceM.toFixed(1)} m`);
const anchor = lineMidpoint(linePoints);

const aggregateAfter = aggregateBefore.map((place) => place?.id === PLACE_ID ? updatePlaceRecord(place, anchor) : place);
writeJson(aggregatePath, aggregateAfter);

const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const childAfter = updatePlaceRecord(childBefore, anchor);
writeJson(childPath, childAfter);

const splitIndex = readJson(splitIndexPath);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  lat: anchor.lat,
  lon: anchor.lon,
  r: childAfter.r,
  coordStatus: childAfter.coordStatus,
  coordType: childAfter.coordType,
  locatorType: childAfter.locatorType,
  sourceProvider: childAfter.sourceProvider,
  sourceObjectId: childAfter.sourceObjectId,
  geocodeAccuracy: childAfter.geocodeAccuracy,
  coordRole: childAfter.coordRole,
  coordSource: childAfter.coordSource,
  coordSourceId: childAfter.coordSourceId,
  coordSourceUrl: childAfter.coordSourceUrl,
  coordVerifiedAt: childAfter.coordVerifiedAt,
  coordNote: childAfter.coordNote,
});
writeJson(splitIndexPath, splitIndex);

const splitManifest = readJson(splitManifestPath);
splitManifest.source_sha256 = sha256(aggregatePath);
splitManifest.generated_at = new Date().toISOString();
const manifestRow = splitManifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error(`Mangler ${PLACE_ID} i split-manifest`);
manifestRow.sha256 = sha256(childPath);
writeJson(splitManifestPath, splitManifest);

writeJson(evidencePath, {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: anchor.lat,
    lon: anchor.lon,
    r: childAfter.r,
    coordStatus: childAfter.coordStatus,
    coordSource: childAfter.coordSource,
    coordType: childAfter.coordType,
    coordNote: childAfter.coordNote,
  },
  identity: {
    currentName: childAfter.name,
    resolvedIdentity: 'Den lange åpne Ljanselva-strekningen langs Hauketo-områdets nordside fram til Lja bru',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'route',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Ljanselva ved Hauketo/Ljabru',
      sourceUrl: 'https://www.openstreetmap.org/way/695993872',
      sourceObjectId: 'osm-way:695993872',
      sourceQuality: 'exact_named_waterway_segment_with_landmark_topology',
      finding: `Eksakt navngitt Ljanselva-segment. Av de fem batch-112-kandidatene er dette den eneste lange (>500 m) linjegeometrien som ender ved Lja bru-referansen; fresh OSM-endepunkt ligger ${freshBridgeDistanceM.toFixed(1)} m fra den dokumenterte brukoordinaten.`,
      canVerifyCoordinate: true,
      reason: 'Stabil OSM-way identifiserer selve elvestrekningen. Hauketo-scope er disambiguert med uavhengig dokumentasjon av Ljanselva som nordgrense og Lja bru som fysisk endepunkt, ikke med nearest/first-hit.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lokalhistoriewiki – Hauketo (strøk)',
      sourceUrl: 'https://lokalhistoriewiki.no/index.php?title=Hauketo_(str%C3%B8k)',
      sourceObjectId: 'lokalhistoriewiki:hauketo-strok',
      sourceQuality: 'documented_local_scope_boundary',
      finding: 'Kilden beskriver Hauketo som strøket sør for Ljabru og oppgir Ljanselva som nordgrense.',
      canVerifyCoordinate: false,
      reason: 'Avgrenser place-identiteten mot riktig del av elva; koordinaten kommer fra OSM-way-geometrien.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Ljanselva',
      sourceUrl: 'https://oslobyleksikon.no/side/Ljanselva',
      sourceObjectId: 'oslobyleksikon:ljanselva',
      sourceQuality: 'documented_river_corridor',
      finding: 'Kilden dokumenterer Ljanselvas løp ved Hauketo-korridoren og at elva går i tunnel under jernbanen nord for Hauketo stasjon.',
      canVerifyCoordinate: false,
      reason: 'Kryssjekker den lokale elvekorridoren, men er ikke selve geometrikilden.',
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Lokalhistoriewiki – Lja bru',
      sourceUrl: 'https://lokalhistoriewiki.no/Lja_bru',
      sourceObjectId: 'lokalhistoriewiki:lja-bru',
      sourceQuality: 'documented_landmark_coordinate',
      finding: 'Kilden dokumenterer Lja bru over Ljanselva og oppgir koordinaten 59.8489644, 10.8043624, brukt som fysisk topologisk referanse for segmentenden.',
      canVerifyCoordinate: false,
      reason: 'Brukoordinaten brukes til segmentdisambiguering; canonical punkt beregnes fra elvegeometrien.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:695993872', canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'lokalhistoriewiki:hauketo-strok', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:ljanselva', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'lokalhistoriewiki:lja-bru', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm', sourceObjectId: 'osm-way:695993872', lat: anchor.lat, lon: anchor.lon,
      coordRole: 'line_anchor', geometryType: 'LineString', lineLengthM: anchor.totalLengthM, canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og line_anchor er anvendt på canonical place.' },
  notes: [childAfter.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
const needsReviewPattern = /^\| `ljanselva_hauketo` – Ljanselva ved Hauketo \| needs_review \|.*\n/m;
if (!needsReviewPattern.test(protocol)) throw new Error('Fant ikke needs_review-raden for ljanselva_hauketo');
protocol = protocol.replace(needsReviewPattern, '');
const batch143ParagraphPattern = /Batch 143 \(2026-07-22\) løser `ljanselva_skullerud`[^\n]*/;
const batch143Match = protocol.match(batch143ParagraphPattern);
if (!batch143Match) throw new Error('Fant ikke batch 143-ankeret i protokollen');
const batch144Block = `\n\n| 144 | \`${PLACE_ID}\` | Ljanselva ved Hauketo | verified_geometry | \`osm-way:${OSM_WAY_ID}\` |\n\nBatch 144 (${VERIFIED_AT}) løser \`${PLACE_ID}\` som den lange åpne Ljanselva-strekningen langs Hauketo-områdets nordside fram til Lja bru. Hauketo-kilden dokumenterer Ljanselva som strøkets nordgrense, Oslo byleksikon kryssjekker Hauketo-korridoren, og den dokumenterte Lja bru-koordinaten brukes som fysisk topologisk referanse. Av de fem eksakte batch-112-kandidatene er way ${OSM_WAY_ID} den eneste lange elvegeometrien som ender ved brua; korte koblingssegmenter og segmentene på motsatt side av brua brukes ikke som proxy. Canonical lat/lon beregnes som lengdemidtpunkt langs selve OSM-wayen og lagres som \`semantic_anchor\` / \`line_anchor\`. Legacy-punktet pensjoneres; ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(batch143Match[0], `${batch143Match[0]}${batch144Block}`);
protocol = protocol.replace(
  /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
  (_match, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
);
fs.writeFileSync(protocolPath, protocol);

writeJson(path.join(reportDir, 'candidate-analysis.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID,
  legacyPointRetired: legacyCoordinate,
  ljaBruReference: LJA_BRU_REFERENCE,
  priorCandidateSource: 'reports/oslo-coordinate-control-batch-112-ljanselva-route/nominatim-ljanselva_hauketo.json',
  exactRiverCandidateCount: candidateAnalysis.length,
  candidates: candidateAnalysis,
  selectionRule: 'Hauketo er kildebelagt med Ljanselva som nordgrense. Velg den eneste lange (>500 m) eksakt navngitte Ljanselva-wayen i batch-112-kandidatsettet som ender ved dokumentert Lja bru; legacy-punkt og nearest/first-hit brukes ikke.',
  selectedSourceObjectId: `osm-way:${OSM_WAY_ID}`,
});
writeJson(path.join(reportDir, 'nearby-links-preservation.json'), {
  placeId: PLACE_ID, before: nearbyBefore, after: childAfter?.nature_profile?.nearby_place_ids || [],
  unchanged: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []),
});
writeJson(path.join(reportDir, 'batch-144-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry',
  sourceProvider: 'osm', sourceObjectId: `osm-way:${OSM_WAY_ID}`, sourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  sourceTags: { name: tags.name, waterway: tags.waterway },
  geometry: { type: 'LineString', nodeCount: linePoints.length, lengthM: anchor.totalLengthM, endpointDistanceToLjaBruM: Number(freshBridgeDistanceM.toFixed(1)) },
  before: { lat: aggregateOld.lat, lon: aggregateOld.lon, r: aggregateOld.r, coordStatus: aggregateOld.coordStatus, coordSource: aggregateOld.coordSource, coordType: aggregateOld.coordType },
  after: { lat: anchor.lat, lon: anchor.lon, r: childAfter.r, coordStatus: childAfter.coordStatus, coordSource: childAfter.coordSource, coordType: childAfter.coordType, sourceObjectId: childAfter.sourceObjectId, geocodeAccuracy: childAfter.geocodeAccuracy, coordRole: childAfter.coordRole },
  method: 'independent local-scope boundary + documented bridge topology + exact named OSM waterway geometry, then deterministic length-midpoint; no legacy-point selection and no nearest/first-hit',
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Oslo coordinate control batch 144 – Ljanselva ved Hauketo\n\n- Canonical place: \`${PLACE_ID}\`\n- Valgt kildeobjekt: OSM way ${OSM_WAY_ID} – Ljanselva\n- OSM råkilde: ${osmUrl}\n- Tidligere kandidatsett: \`reports/oslo-coordinate-control-batch-112-ljanselva-route/nominatim-ljanselva_hauketo.json\`\n- Hauketo-scope: https://lokalhistoriewiki.no/index.php?title=Hauketo_(str%C3%B8k)\n- Elvekorridor: https://oslobyleksikon.no/side/Ljanselva\n- Lja bru-referanse: https://lokalhistoriewiki.no/Lja_bru\n\n## Metode\n\nHauketo er dokumentert med Ljanselva som nordgrense. Lja bru gir et uavhengig fysisk endepunkt i korridoren. Av de fem eksakte Ljanselva-kandidatene fra batch 112 er way ${OSM_WAY_ID} den eneste lange (>500 m) geometrien som ender ved brureferansen. Det gamle kartpunktet brukes ikke i utvelgelsen. Canonical lat/lon er et deterministisk lengdemidtpunkt på fresh OSM-geometri.\n`);

console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, sourceObjectId: `osm-way:${OSM_WAY_ID}`, anchor, exactCandidateCount: candidateAnalysis.length, freshBridgeDistanceM: Number(freshBridgeDistanceM.toFixed(1)), nearbyLinksPreserved: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []) }, null, 2));
