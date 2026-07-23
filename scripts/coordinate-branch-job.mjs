import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 155;
const PLACE_ID = 'alna_bryn';
const VERIFIED_AT = '2026-07-23';
const SELECTED_WAY_ID = 112543919;
const DOWNSTREAM_CULVERT_WAY_ID = 113281373;
const BRYN_SCOPE_NODE_ID = 1125500266;
const CHAIN_IDS = [22698275, 651916465, 651916464, 127936466, 660982413, 660982412, 27436360, 112543918, 112543919, 113281373];

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_bryn.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/alna_bryn.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const smalvollPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_smalvoll.json');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-155-alna-bryn');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const decodeXml = (v = '') => v.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], decodeXml(m[2])]));

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
function lineLengthM(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineM(points[i - 1], points[i]);
  return total;
}
function lineMidpoint(points) {
  const total = lineLengthM(points);
  const target = total / 2;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const segment = haversineM(a, b);
    if (walked + segment >= target) {
      const f = segment === 0 ? 0 : (target - walked) / segment;
      return {
        lat: Number((a.lat + (b.lat - a.lat) * f).toFixed(7)),
        lon: Number((a.lon + (b.lon - a.lon) * f).toFixed(7)),
        lengthM: Number(total.toFixed(1)),
      };
    }
    walked += segment;
  }
  return { lat: points.at(-1).lat, lon: points.at(-1).lon, lengthM: Number(total.toFixed(1)) };
}
async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.1' },
    signal: AbortSignal.timeout(45000),
  });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}
function parseWayFull(xml, wayId) {
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\b[^>]*>/g)) {
    const a = attrs(match[0]);
    if (a.id && a.lat && a.lon) nodeMap.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) });
  }
  const match = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((item) => Number(attrs(`<way ${item[1]}>`).id) === wayId);
  if (!match) throw new Error(`Fant ikke way ${wayId}`);
  const tags = {};
  const nodeRefs = [];
  for (const tagMatch of match[2].matchAll(/<tag\b[^>]*\/>/g)) {
    const a = attrs(tagMatch[0]);
    if (a.k) tags[a.k] = a.v ?? '';
  }
  for (const ndMatch of match[2].matchAll(/<nd\b[^>]*\/>/g)) {
    const a = attrs(ndMatch[0]);
    if (a.ref) nodeRefs.push(String(a.ref));
  }
  const points = nodeRefs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (points.length !== nodeRefs.length || points.length < 2) throw new Error(`Kunne ikke rekonstruere way ${wayId}`);
  return { id: wayId, tags, nodeRefs, points };
}
function parseNode(xml, nodeId) {
  const nodeMatch = [...xml.matchAll(/<node\b([^>]*)>([\s\S]*?)<\/node>|<node\b([^>]*)\/>/g)]
    .find((match) => Number(attrs(`<node ${match[1] || match[3]}>`).id) === nodeId);
  if (!nodeMatch) throw new Error(`Fant ikke node ${nodeId}`);
  const a = attrs(`<node ${nodeMatch[1] || nodeMatch[3]}>`);
  const body = nodeMatch[2] || '';
  const tags = {};
  for (const tagMatch of body.matchAll(/<tag\b[^>]*\/>/g)) {
    const t = attrs(tagMatch[0]);
    if (t.k) tags[t.k] = t.v ?? '';
  }
  return { id: nodeId, lat: Number(a.lat), lon: Number(a.lon), tags };
}
function sharedNodeRefs(a, b) {
  const bSet = new Set(b.nodeRefs);
  return a.nodeRefs.filter((ref) => bSet.has(ref));
}
function minVertexDistanceM(point, points) {
  return Math.min(...points.map((candidate) => haversineM(point, candidate)));
}

function updatePlace(place, anchor, scopeDistanceM, chainLinks) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    lat: anchor.lat,
    lon: anchor.lon,
    locatorType: 'route',
    sourceHint: 'Canonical kartanker er lengdemidtpunktet på OSM way 112543919, den lange åpne Alna-strekningen ved Bryn mellom den verifiserte Smalvoll-korridoren og den nedre kulvert-/Kværnerbyen-sekvensen.',
    coordType: 'river_segment_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 112543919 – Alna ved Bryn',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:112543919',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:112543919',
    coordSourceUrl: 'https://www.openstreetmap.org/way/112543919',
    coordNote: `Batch 155 avgrenser Alna ved Bryn til OSM way 112543919, en ${anchor.lengthM} meter lang åpen name=Alna/waterway=river-strekning. Fresh topologikontroll validerer en sammenhengende kjede fra det allerede verifiserte Smalvoll-segmentet 22698275 gjennom åtte mellomliggende Alna-ways fram til 112543919, og wayen kobler eksakt nedstrøms til culvert-way 113281373. Bryn place-node 1125500266 brukes kun som uavhengig scope-kryssjekk og ligger ${scopeDistanceM.toFixed(1)} meter fra valgt elvegeometri. Bryn bru brukes ikke som proxy. Canonical lat/lon er lengdemidtpunkt langs selve elvewayen. Legacy-punktet og nearest/first-hit brukes ikke.`,
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const smalvoll = readJson(smalvollPath);
if (smalvoll.coordStatus !== 'verified_geometry' || smalvoll.sourceObjectId !== 'osm-way:22698275') {
  throw new Error('Batch 155 krever at alna_smalvoll allerede er canonical verified_geometry på osm-way:22698275');
}

const ways = new Map();
for (const wayId of CHAIN_IDS) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${wayId}/full`;
  const xml = await fetchText(url);
  fs.writeFileSync(path.join(reportDir, `osm-way-${wayId}-full.xml`), xml);
  ways.set(wayId, parseWayFull(xml, wayId));
}
const scopeNodeUrl = `https://api.openstreetmap.org/api/0.6/node/${BRYN_SCOPE_NODE_ID}`;
const scopeNodeXml = await fetchText(scopeNodeUrl);
fs.writeFileSync(path.join(reportDir, `osm-node-${BRYN_SCOPE_NODE_ID}.xml`), scopeNodeXml);
const scopeNode = parseNode(scopeNodeXml, BRYN_SCOPE_NODE_ID);
if (scopeNode.tags.name !== 'Bryn' || scopeNode.tags.place !== 'suburb') {
  throw new Error(`Uventet Bryn scope-node: ${JSON.stringify(scopeNode.tags)}`);
}

const chainLinks = [];
for (let i = 0; i < CHAIN_IDS.length - 1; i += 1) {
  const a = ways.get(CHAIN_IDS[i]);
  const b = ways.get(CHAIN_IDS[i + 1]);
  const shared = sharedNodeRefs(a, b);
  if (shared.length !== 1) throw new Error(`Forventet én delt node mellom way ${a.id} og ${b.id}, fant ${shared.length}`);
  chainLinks.push({ fromWay: a.id, toWay: b.id, sharedNode: shared[0] });
}

for (const wayId of CHAIN_IDS) {
  const way = ways.get(wayId);
  if (way.tags.name !== 'Alna') throw new Error(`Way ${wayId} har uventet navn: ${way.tags.name}`);
  if (!['river', 'canal'].includes(way.tags.waterway)) throw new Error(`Way ${wayId} har uventet waterway: ${way.tags.waterway}`);
}
const selected = ways.get(SELECTED_WAY_ID);
if (selected.tags.waterway !== 'river' || selected.tags.tunnel) throw new Error(`Valgt Bryn-way er ikke åpen river: ${JSON.stringify(selected.tags)}`);
const downstreamCulvert = ways.get(DOWNSTREAM_CULVERT_WAY_ID);
if (downstreamCulvert.tags.tunnel !== 'culvert') throw new Error(`Forventet culvert-way ${DOWNSTREAM_CULVERT_WAY_ID}`);

const anchor = lineMidpoint(selected.points);
if (anchor.lengthM < 1500) throw new Error(`Valgt Bryn-segment er uventet kort: ${anchor.lengthM} m`);
const scopeDistanceM = minVertexDistanceM(scopeNode, selected.points);
if (scopeDistanceM > 300) throw new Error(`Valgt Bryn-segment ligger for langt fra Bryn scope-node: ${scopeDistanceM.toFixed(1)} m`);

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregate.map((place) => place?.id === PLACE_ID ? updatePlace(place, anchor, scopeDistanceM, chainLinks) : place));
const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const child = updatePlace(childBefore, anchor, scopeDistanceM, chainLinks);
writeJson(childPath, child);
if (JSON.stringify(nearbyBefore) !== JSON.stringify(child?.nature_profile?.nearby_place_ids || [])) throw new Error('nearby_place_ids ble utilsiktet endret');

const index = readJson(indexPath);
const indexRow = index.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  lat: child.lat, lon: child.lon, r: child.r,
  coordStatus: child.coordStatus, coordType: child.coordType, locatorType: child.locatorType,
  sourceProvider: child.sourceProvider, sourceObjectId: child.sourceObjectId,
  geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole, coordSource: child.coordSource,
  coordSourceId: child.coordSourceId, coordSourceUrl: child.coordSourceUrl,
  coordVerifiedAt: child.coordVerifiedAt, coordNote: child.coordNote,
});
writeJson(indexPath, index);

const manifest = readJson(manifestPath);
manifest.source_sha256 = sha256(aggregatePath);
manifest.generated_at = new Date().toISOString();
const manifestRow = manifest.places?.find((row) => row?.id === PLACE_ID);
if (!manifestRow) throw new Error(`Mangler ${PLACE_ID} i split-manifest`);
manifestRow.sha256 = sha256(childPath);
writeJson(manifestPath, manifest);

writeJson(evidencePath, {
  schemaVersion: '1.0', placeId: PLACE_ID,
  placeFile: 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json',
  evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, coordNote: child.coordNote },
  identity: { currentName: child.name, resolvedIdentity: 'Lokal Alna-strekning ved Bryn mellom Smalvoll-korridoren og den nedre Alna-sekvensen', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '' },
  requiredEvidence: [],
  evidence: [
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Alna ved Bryn', sourceUrl: 'https://www.openstreetmap.org/way/112543919', sourceObjectId: 'osm-way:112543919', sourceQuality: 'exact_named_long_river_segment_bracketed_by_verified_upstream_chain_and_downstream_culvert', finding: `Way 112543919 er en ${anchor.lengthM} m lang åpen Alna-geometri. Fresh OSM-topologi viser en eksakt sammenhengende way-kjede fra verified Smalvoll-way 22698275 fram til valgt segment og direkte videre til culvert-way 113281373.`, canVerifyCoordinate: true, reason: 'Eksakt fysisk elvegeometri topologisk avgrenset mellom verifisert oppstrøms segment og eksplisitt nedstrøms kulvert.' },
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Bryn place scope', sourceUrl: `https://www.openstreetmap.org/node/${BRYN_SCOPE_NODE_ID}`, sourceObjectId: `osm-node:${BRYN_SCOPE_NODE_ID}`, sourceQuality: 'independent_named_scope_crosscheck', finding: `Den uavhengige place=Bryn-noden ligger ${scopeDistanceM.toFixed(1)} m fra valgt Alna-geometri.`, canVerifyCoordinate: false, reason: 'Brukes bare som lokal scope-kryssjekk, ikke som koordinatkilde eller nearest-valg.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Alnaelva', sourceUrl: 'https://oslobyleksikon.no/side/Alnaelva', sourceObjectId: 'oslobyleksikon:alnaelva:bryn', sourceQuality: 'documented_local_river_identity', finding: 'Kilden dokumenterer Alna under Bryn og videre mot Svartdalen.', canVerifyCoordinate: false, reason: 'Fastsetter Bryn-sekvensen; eksakt geometri kommer fra OSM.' },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:112543919', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-node:${BRYN_SCOPE_NODE_ID}`, canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:112543919', lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', geometryType: 'LineString', canApplyToPlace: true }],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Den topologisk avgrensede Alna-geometrien ved Bryn er anvendt på canonical place.' },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 155 | `alna_bryn` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 155 | \`alna_bryn\` | Alna ved Bryn | verified_geometry | \`osm-way:112543919\` |\n\nBatch 155 (2026-07-23) løser Alna ved Bryn som den lange åpne Alna-strekningen på OSM way 112543919. Fresh topologi validerer en eksakt sammenhengende Alna-way-kjede fra det allerede verifiserte Smalvoll-segmentet 22698275 fram til valgt segment, og wayen kobler direkte nedstrøms til culvert-way 113281373. Den uavhengige OSM place=Bryn-noden brukes bare som geografisk scope-kryssjekk; Bryn bru brukes ikke som proxy for den bredere elverecorden. Canonical lat/lon beregnes deterministisk som lengdemidtpunkt langs selve elvegeometrien. Legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-155-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry',
  sourceProvider: 'osm', sourceObjectId: 'osm-way:112543919', sourceUrl: 'https://www.openstreetmap.org/way/112543919',
  sourceTags: selected.tags,
  geometry: { type: 'LineString', nodeCount: selected.points.length, lengthM: anchor.lengthM },
  topology: { chainWayIds: CHAIN_IDS, chainLinks, upstreamVerifiedPlace: 'alna_smalvoll', downstreamCulvertWay: `osm-way:${DOWNSTREAM_CULVERT_WAY_ID}` },
  scopeCrosscheck: { brynNode: `osm-node:${BRYN_SCOPE_NODE_ID}`, distanceToSelectedGeometryM: Number(scopeDistanceM.toFixed(1)) },
  before: { lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r, coordStatus: oldPlace.coordStatus, coordSource: oldPlace.coordSource, coordType: oldPlace.coordType },
  after: { lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, locatorType: child.locatorType, sourceObjectId: child.sourceObjectId, geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole },
  method: 'exact named long Alna segment + exact fresh chain topology from verified Smalvoll + direct downstream culvert topology + independent Bryn place scope crosscheck + deterministic length midpoint; no bridge proxy, legacy point, nearest or first-hit',
});
writeJson(path.join(reportDir, 'nearby-links-preservation.json'), { placeId: PLACE_ID, before: nearbyBefore, after: child?.nature_profile?.nearby_place_ids || [], preserved: JSON.stringify(nearbyBefore) === JSON.stringify(child?.nature_profile?.nearby_place_ids || []) });
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 155 sources – Alna ved Bryn\n\n- OpenStreetMap way 112543919: selected long open Alna river geometry.\n- Fresh exact OSM chain from verified Smalvoll way 22698275 through ways ${CHAIN_IDS.slice(1, -2).join(', ')} to selected way 112543919.\n- OpenStreetMap way 113281373: direct downstream Alna culvert.\n- OpenStreetMap node ${BRYN_SCOPE_NODE_ID}: independent Bryn place scope crosscheck only.\n- Oslo byleksikon, Alnaelva: documents Alna below Bryn and onward toward Svartdalen.\n\nBryn bridge is not used as a proxy. The legacy History Go coordinate and nearest/first-hit selection are not used.\n`);

console.log(JSON.stringify({ status: 'applied', batch: BATCH, placeId: PLACE_ID, sourceObjectId: child.sourceObjectId, anchor, scopeDistanceM: Number(scopeDistanceM.toFixed(1)), chainLinkCount: chainLinks.length }, null, 2));
