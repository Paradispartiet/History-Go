import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 145;
const PLACE_ID = 'ljanselva_ljan';
const OSM_WAY_ID = 98539575;
const DOWNSTREAM_WAY_ID = 156700580;
const VERIFIED_AT = '2026-07-22';

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_ljan.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ljanselva_ljan.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-145-ljanselva-ljan-topology');
const candidateSummaryPath = path.join(reportDir, 'candidate-summary.json');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function decodeXml(value = '') { return value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'); }
function attrs(tag) { const out = {}; for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/g)) out[match[1]] = decodeXml(match[2]); return out; }
function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLengthM(points) { let sum = 0; for (let i = 1; i < points.length; i += 1) sum += haversineM(points[i - 1], points[i]); return sum; }
function lineMidpoint(points) {
  const total = lineLengthM(points);
  const target = total / 2;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]; const b = points[i]; const len = haversineM(a, b);
    if (walked + len >= target) {
      const f = len === 0 ? 0 : (target - walked) / len;
      return { lat: Number((a.lat + (b.lat - a.lat) * f).toFixed(7)), lon: Number((a.lon + (b.lon - a.lon) * f).toFixed(7)), totalLengthM: Number(total.toFixed(1)) };
    }
    walked += len;
  }
  const last = points.at(-1);
  return { lat: Number(last.lat.toFixed(7)), lon: Number(last.lon.toFixed(7)), totalLengthM: Number(total.toFixed(1)) };
}
async function fetchText(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}
function updatePlaceRecord(place, anchor) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    lat: anchor.lat,
    lon: anchor.lon,
    sourceHint: 'Koordinaten er lengdemidtpunktet på OSM way 98539575, den lange eksakt navngitte Ljanselva-geometrien gjennom kjernen av Liadalen ved Ljan.',
    coordType: 'river_segment_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 98539575 – Ljanselva gjennom Liadalen ved Ljan',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:98539575',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:98539575',
    coordSourceUrl: 'https://www.openstreetmap.org/way/98539575',
    coordNote: 'Batch 145 korrigerer den feilplasserte batch-112-scope-boksen og avgrenser Ljan-stoppet til Ljanselva gjennom Liadalen. Uavhengige kilder dokumenterer Liadalen som Ljanselvas dalføre ved Ljan. I den korrigerte Liadalen-boksen er OSM way 98539575 den eneste eksakt navngitte Ljanselva-geometrien over én kilometer og den dekker hovedstrekningen gjennom dalen; nedstrøms endepunkt kobler eksakt til way 156700580, som beholdes for den separate utløpsnære Fiskevollen-kontrollen. Canonical lat/lon er beregnet som lengdemidtpunkt langs way 98539575. Legacy-punktet 59.8359, 10.8099 brukes ikke som kilde eller utvelgelseskriterium.',
  };
}

if (!fs.existsSync(candidateSummaryPath)) throw new Error('Mangler research-rapporten candidate-summary.json');
const research = readJson(candidateSummaryPath);
const exact = research.exactLjanselvaRivers || [];
const selected = exact.find((item) => Number(item.osmId) === OSM_WAY_ID);
const downstream = exact.find((item) => Number(item.osmId) === DOWNSTREAM_WAY_ID);
if (!selected || !downstream) throw new Error('Mangler forventede Liadalen-segmenter i research-rapporten');
const longCandidates = exact.filter((item) => Number(item.lineLengthM) >= 1000);
if (longCandidates.length !== 1 || Number(longCandidates[0].osmId) !== OSM_WAY_ID) throw new Error(`Forventet én >1 km kandidat, fikk ${JSON.stringify(longCandidates.map((x) => x.osmId))}`);
const topologyGapM = haversineM(selected.lastPoint, downstream.firstPoint);
if (topologyGapM > 1) throw new Error(`Way ${OSM_WAY_ID} kobler ikke lenger eksakt til ${DOWNSTREAM_WAY_ID}: ${topologyGapM.toFixed(2)} m`);

const osmUrl = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}/full`;
const osmXml = await fetchText(osmUrl);
fs.writeFileSync(path.join(reportDir, `osm-way-${OSM_WAY_ID}-full.xml`), osmXml);
const nodeMap = new Map();
for (const match of osmXml.matchAll(/<node\b[^>]*>/g)) { const a = attrs(match[0]); if (a.id && a.lat && a.lon) nodeMap.set(String(a.id), { lat: Number(a.lat), lon: Number(a.lon) }); }
const wayMatch = osmXml.match(new RegExp(`<way\\b[^>]*\\bid="${OSM_WAY_ID}"[^>]*>([\\s\\S]*?)<\\/way>`));
if (!wayMatch) throw new Error(`Fant ikke OSM way ${OSM_WAY_ID}`);
const wayBody = wayMatch[1];
const tags = {};
for (const match of wayBody.matchAll(/<tag\b[^>]*\/>/g)) { const a = attrs(match[0]); if (a.k) tags[a.k] = a.v ?? ''; }
const nodeRefs = [...wayBody.matchAll(/<nd\b[^>]*\/>/g)].map((m) => attrs(m[0]).ref).filter(Boolean);
const linePoints = nodeRefs.map((ref) => nodeMap.get(String(ref))).filter(Boolean);
if (tags.name !== 'Ljanselva' || tags.waterway !== 'river') throw new Error(`Uventede OSM-tags: ${JSON.stringify(tags)}`);
if (linePoints.length !== nodeRefs.length || linePoints.length < 2) throw new Error('Kunne ikke rekonstruere full way-geometri');
const anchor = lineMidpoint(linePoints);
const freshDownstreamGapM = haversineM(linePoints.at(-1), downstream.firstPoint);
if (freshDownstreamGapM > 1) throw new Error(`Fresh OSM-endepunkt kobler ikke til downstream-segment: ${freshDownstreamGapM.toFixed(2)} m`);

const aggregateBefore = readJson(aggregatePath);
const aggregateOld = aggregateBefore.find((p) => p?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregateBefore.map((p) => p?.id === PLACE_ID ? updatePlaceRecord(p, anchor) : p));

const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const childAfter = updatePlaceRecord(childBefore, anchor);
writeJson(childPath, childAfter);

const splitIndex = readJson(splitIndexPath);
const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  lat: anchor.lat, lon: anchor.lon, r: childAfter.r,
  coordStatus: childAfter.coordStatus, coordType: childAfter.coordType, locatorType: childAfter.locatorType,
  sourceProvider: childAfter.sourceProvider, sourceObjectId: childAfter.sourceObjectId,
  geocodeAccuracy: childAfter.geocodeAccuracy, coordRole: childAfter.coordRole,
  coordSource: childAfter.coordSource, coordSourceId: childAfter.coordSourceId,
  coordSourceUrl: childAfter.coordSourceUrl, coordVerifiedAt: childAfter.coordVerifiedAt, coordNote: childAfter.coordNote,
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
  currentCoordinate: { lat: anchor.lat, lon: anchor.lon, r: childAfter.r, coordStatus: childAfter.coordStatus, coordSource: childAfter.coordSource, coordType: childAfter.coordType, coordNote: childAfter.coordNote },
  identity: {
    currentName: childAfter.name,
    resolvedIdentity: 'Den lange åpne Ljanselva-hovedstrekningen gjennom Liadalen ved Ljan',
    identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm', sourceName: 'OpenStreetMap – Ljanselva gjennom Liadalen', sourceUrl: 'https://www.openstreetmap.org/way/98539575', sourceObjectId: 'osm-way:98539575',
      sourceQuality: 'exact_named_long_waterway_segment_in_documented_local_corridor',
      finding: `Fresh way 98539575 er eksakt navngitt Ljanselva og er ${anchor.totalLengthM} m lang. I korrigert Liadalen-scope er dette den eneste eksakte kandidaten over 1 km. Nedstrøms endepunkt kobler til way 156700580 med ${freshDownstreamGapM.toFixed(2)} m avvik.`,
      canVerifyCoordinate: true,
      reason: 'Eksakt navngitt fysisk elvegeometri dekker den dokumenterte Liadalen-korridoren. Canonical line_anchor beregnes fra kildegeometrien.',
    },
    {
      sourceProvider: 'manual_research', sourceName: 'Lokalhistoriewiki – Liadalen', sourceUrl: 'https://lokalhistoriewiki.no/wiki/Liadalen_%28Oslo%29', sourceObjectId: 'lokalhistoriewiki:liadalen-oslo',
      sourceQuality: 'documented_local_valley_scope', finding: 'Kilden definerer Liadalen som Ljanselvas dalføre vest for Ljabru og dokumenterer elva som bydelsgrense gjennom dalen.', canVerifyCoordinate: false,
      reason: 'Avgrenser Ljan/Liadalen-identiteten; selve koordinaten kommer fra OSM-geometrien.',
    },
    {
      sourceProvider: 'manual_research', sourceName: 'Ljan skole – Ljanselva i nærmiljøet', sourceUrl: 'https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/', sourceObjectId: 'osloskolen:ljan-ljanselva-naermiljo',
      sourceQuality: 'official_local_context', finding: 'Ljan skole beskriver Ljanselva gjennom Liadalen som et viktig element i Ljans nærmiljø og turveien videre gjennom dalen mot nedre elveløp.', canVerifyCoordinate: false,
      reason: 'Kryssjekker at Liadalen-strekningen er legitim for place-navnet «Ljanselva ved Ljan».',
    },
    {
      sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Ljanselva', sourceUrl: 'https://oslobyleksikon.no/side/Ljanselva', sourceObjectId: 'oslobyleksikon:ljanselva',
      sourceQuality: 'documented_river_corridor', finding: 'Kilden beskriver Liadalen som Ljanselvas dalføre mellom jernbanekrysningen og elvekneet ved nedre løp.', canVerifyCoordinate: false,
      reason: 'Kryssjekker dalføre og sekvens i vassdraget.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:98539575', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:156700580', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'lokalhistoriewiki:liadalen-oslo', canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'osloskolen:ljan-ljanselva-naermiljo', canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:98539575', lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', geometryType: 'LineString', lineLengthM: anchor.totalLengthM, canApplyToPlace: true }],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og line_anchor er anvendt på canonical place.' },
  notes: [childAfter.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
const needsReviewPattern = /^\| `ljanselva_ljan` – Ljanselva ved Ljan \| needs_review \|.*\n/m;
if (!needsReviewPattern.test(protocol)) throw new Error('Fant ikke needs_review-raden for ljanselva_ljan');
protocol = protocol.replace(needsReviewPattern, '');
const batch144Pattern = /Batch 144 \(2026-07-22\) løser `ljanselva_hauketo`[^\n]*/;
const batch144Match = protocol.match(batch144Pattern);
if (!batch144Match) throw new Error('Fant ikke batch 144-ankeret i protokollen');
const batch145Block = `\n\n| 145 | \`${PLACE_ID}\` | Ljanselva ved Ljan | verified_geometry | \`osm-way:${OSM_WAY_ID}\` |\n\nBatch 145 (${VERIFIED_AT}) korrigerer den opprinnelige batch-112-scope-boksen, som lå for langt øst og derfor ga null eksakte Ljanselva-treff for Ljan. Uavhengige kilder dokumenterer Liadalen som Ljanselvas dalføre ved Ljan. Den korrigerte Liadalen-auditen finner fem eksakt navngitte elveways; way ${OSM_WAY_ID} er den eneste over én kilometer og dekker hovedstrekningen gjennom dalen. Nedstrøms kobler den eksakt til way ${DOWNSTREAM_WAY_ID}, som holdes av til den separate utløpsnære Fiskevollen-kontrollen. Canonical lat/lon er lengdemidtpunktet på fresh way-geometri og lagres som \`semantic_anchor\` / \`line_anchor\`. Legacy-punktet brukes ikke; ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(batch144Match[0], `${batch144Match[0]}${batch145Block}`);
protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_m, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
fs.writeFileSync(protocolPath, protocol);

writeJson(path.join(reportDir, 'production-selection.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID,
  selectedSourceObjectId: `osm-way:${OSM_WAY_ID}`,
  selectedLengthM: anchor.totalLengthM,
  downstreamContinuation: `osm-way:${DOWNSTREAM_WAY_ID}`,
  downstreamTopologyGapM: Number(freshDownstreamGapM.toFixed(2)),
  selectionRule: 'Corrected Liadalen scope; choose the sole exact named Ljanselva way >1 km spanning the documented valley core. Preserve connected downstream way 156700580 for separate Fiskevollen scope.',
  legacyPointUsedForSelection: false,
});
writeJson(path.join(reportDir, 'nearby-links-preservation.json'), { placeId: PLACE_ID, before: nearbyBefore, after: childAfter?.nature_profile?.nearby_place_ids || [], unchanged: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []) });
writeJson(path.join(reportDir, 'batch-145-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry',
  sourceProvider: 'osm', sourceObjectId: `osm-way:${OSM_WAY_ID}`, sourceUrl: `https://www.openstreetmap.org/way/${OSM_WAY_ID}`,
  sourceTags: { name: tags.name, waterway: tags.waterway },
  geometry: { type: 'LineString', nodeCount: linePoints.length, lengthM: anchor.totalLengthM, downstreamTopologyGapM: Number(freshDownstreamGapM.toFixed(2)) },
  before: { lat: aggregateOld.lat, lon: aggregateOld.lon, r: aggregateOld.r, coordStatus: aggregateOld.coordStatus, coordSource: aggregateOld.coordSource, coordType: aggregateOld.coordType },
  after: { lat: anchor.lat, lon: anchor.lon, r: childAfter.r, coordStatus: childAfter.coordStatus, coordSource: childAfter.coordSource, coordType: childAfter.coordType, sourceObjectId: childAfter.sourceObjectId, geocodeAccuracy: childAfter.geocodeAccuracy, coordRole: childAfter.coordRole },
  method: 'corrected geographic scope + independent Liadalen/Ljan identity + exact named long OSM river segment + downstream topology, then deterministic length-midpoint; no legacy-point selection and no nearest/first-hit',
});

fs.appendFileSync(path.join(reportDir, 'sources.md'), `\n## Production decision\n\nBatch 145 velger OSM way ${OSM_WAY_ID} som Ljan-stoppets canonical elvegeometri. Det er den eneste eksakt navngitte Ljanselva-wayen over én kilometer i korrigert Liadalen-scope og kobler eksakt til downstream way ${DOWNSTREAM_WAY_ID}.\n`);

console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, sourceObjectId: `osm-way:${OSM_WAY_ID}`, anchor, downstreamTopologyGapM: Number(freshDownstreamGapM.toFixed(2)), nearbyLinksPreserved: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []) }, null, 2));
