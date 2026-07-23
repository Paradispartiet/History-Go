import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 154;
const PLACE_ID = 'alna_smalvoll';
const RIVER_WAY_ID = 22698275;
const UPSTREAM_TUNNEL_WAY_ID = 22698285;
const SMALVOLLVEIEN_WAY_ID = 652471071;
const VERIFIED_AT = '2026-07-23';

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_smalvoll.json');
const indexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_index.json');
const manifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/alna_smalvoll.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-154-alna-smalvoll');

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
function bbox(points) {
  return {
    minLat: Math.min(...points.map((p) => p.lat)),
    maxLat: Math.max(...points.map((p) => p.lat)),
    minLon: Math.min(...points.map((p) => p.lon)),
    maxLon: Math.max(...points.map((p) => p.lon)),
  };
}
function latOverlapRatio(container, reference) {
  const overlap = Math.max(0, Math.min(container.maxLat, reference.maxLat) - Math.max(container.minLat, reference.minLat));
  const span = reference.maxLat - reference.minLat;
  return span === 0 ? 0 : overlap / span;
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

function updatePlace(place, anchor, overlapRatio, sharedTunnelNode) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    lat: anchor.lat,
    lon: anchor.lon,
    sourceHint: 'Canonical kartanker er lengdemidtpunktet på OSM way 22698275, den lange åpne Alna-strekningen som følger Smalvollveiens hovedspenn gjennom den dokumenterte Smalvoll-korridoren.',
    coordType: 'river_segment_anchor',
    coordStatus: 'verified_geometry',
    coordSource: 'OpenStreetMap way 22698275 – Alna gjennom Smalvoll/Smalvolldalen',
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:22698275',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:22698275',
    coordSourceUrl: 'https://www.openstreetmap.org/way/22698275',
    coordNote: `Batch 154 avgrenser Alna ved Smalvoll til OSM way 22698275. Wayen er en ${anchor.lengthM} meter lang åpen name=Alna/waterway=river-strekning med alt_name=Loelva. Den deler sin oppstrøms endenode ${sharedTunnelNode} eksakt med den korte tunnel-wayen 22698285. Fresh Smalvollveien-way 652471071 brukes som uavhengig geografisk korridoravgrensning: ${Number((overlapRatio * 100).toFixed(1))} % av veiens nord–sør-spenn ligger innenfor elvewayens nord–sør-spenn, mens den oppstrøms Alna-wayen ligger nord for denne korridoren. Canonical lat/lon beregnes deterministisk som lengdemidtpunkt langs selve elvegeometrien. Legacy-punktet og nearest/first-hit brukes ikke.`,
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const riverUrl = `https://api.openstreetmap.org/api/0.6/way/${RIVER_WAY_ID}/full`;
const tunnelUrl = `https://api.openstreetmap.org/api/0.6/way/${UPSTREAM_TUNNEL_WAY_ID}/full`;
const roadUrl = `https://api.openstreetmap.org/api/0.6/way/${SMALVOLLVEIEN_WAY_ID}/full`;
const [riverXml, tunnelXml, roadXml] = await Promise.all([fetchText(riverUrl), fetchText(tunnelUrl), fetchText(roadUrl)]);
fs.writeFileSync(path.join(reportDir, `osm-way-${RIVER_WAY_ID}-full.xml`), riverXml);
fs.writeFileSync(path.join(reportDir, `osm-way-${UPSTREAM_TUNNEL_WAY_ID}-full.xml`), tunnelXml);
fs.writeFileSync(path.join(reportDir, `osm-way-${SMALVOLLVEIEN_WAY_ID}-full.xml`), roadXml);

const river = parseWayFull(riverXml, RIVER_WAY_ID);
const tunnel = parseWayFull(tunnelXml, UPSTREAM_TUNNEL_WAY_ID);
const road = parseWayFull(roadXml, SMALVOLLVEIEN_WAY_ID);
if (river.tags.name !== 'Alna' || river.tags.waterway !== 'river' || river.tags.alt_name !== 'Loelva') throw new Error(`Uventede river-tags: ${JSON.stringify(river.tags)}`);
if (tunnel.tags.name !== 'Alna' || tunnel.tags.waterway !== 'river' || tunnel.tags.tunnel !== 'yes') throw new Error(`Uventede tunnel-tags: ${JSON.stringify(tunnel.tags)}`);
if (road.tags.name !== 'Smalvollveien' || !road.tags.highway) throw new Error(`Uventede Smalvollveien-tags: ${JSON.stringify(road.tags)}`);

const sharedNodes = river.nodeRefs.filter((ref) => tunnel.nodeRefs.includes(ref));
if (sharedNodes.length !== 1) throw new Error(`Forventet én eksakt delt node mellom river og upstream tunnel, fant ${sharedNodes.length}`);
const sharedTunnelNode = sharedNodes[0];
const riverBox = bbox(river.points);
const roadBox = bbox(road.points);
const overlapRatio = latOverlapRatio(riverBox, roadBox);
if (overlapRatio < 0.9) throw new Error(`Smalvollveien-korridoren er ikke lenger tilstrekkelig omsluttet av valgt elveway: ${overlapRatio}`);
const anchor = lineMidpoint(river.points);
if (anchor.lengthM < 1500) throw new Error(`Valgt Smalvoll-segment er uventet kort: ${anchor.lengthM} m`);

const aggregate = readJson(aggregatePath);
const oldPlace = aggregate.find((place) => place?.id === PLACE_ID);
if (!oldPlace) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregate.map((place) => place?.id === PLACE_ID ? updatePlace(place, anchor, overlapRatio, sharedTunnelNode) : place));
const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const child = updatePlace(childBefore, anchor, overlapRatio, sharedTunnelNode);
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
  identity: { currentName: child.name, resolvedIdentity: 'Lokal Alna-strekning gjennom Smalvoll/Smalvolldalen langs Smalvollveien-korridoren', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '' },
  requiredEvidence: [],
  evidence: [
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap – Alna gjennom Smalvoll', sourceUrl: 'https://www.openstreetmap.org/way/22698275', sourceObjectId: 'osm-way:22698275', sourceQuality: 'exact_named_long_river_segment_with_corridor_and_tunnel_topology', finding: `Way 22698275 er en ${anchor.lengthM} m lang name=Alna/waterway=river-geometri, deler node ${sharedTunnelNode} eksakt med upstream tunnel-way 22698285 og dekker ${Number((overlapRatio * 100).toFixed(1))} % av Smalvollveiens nord–sør-spenn.`, canVerifyCoordinate: true, reason: 'Eksakt fysisk elvegeometri eksplisitt avgrenset av dokumentert Smalvollveien-korridor og topologisk upstream-overgang.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Alnaelva', sourceUrl: 'https://oslobyleksikon.no/side/Alnaelva', sourceObjectId: 'oslobyleksikon:alnaelva:smalvolldalen', sourceQuality: 'documented_local_river_identity', finding: 'Kilden dokumenterer Alnas mange buktninger særlig i Smalvolldalen.', canVerifyCoordinate: false, reason: 'Fastsetter lokal Smalvolldalen-identitet; eksakt geometri kommer fra OSM.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Alnastien', sourceUrl: 'https://oslobyleksikon.no/side/Alnastien', sourceObjectId: 'oslobyleksikon:alnastien:smalvollveien', sourceQuality: 'documented_route_corridor_context', finding: 'Kilden dokumenterer Alnastien videre langs Smalvollveien mot Bryn og avgrenser dermed den lokale elvekorridoren.', canVerifyCoordinate: false, reason: 'Kryssjekker geografisk korridor; canonical geometri kommer fra OSM.' },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:22698275', canApplyToPlace: true },
    { sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:alnaelva:smalvolldalen', canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:22698275', lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', geometryType: 'LineString', canApplyToPlace: true }],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Den eksplisitt avgrensede Alna-geometrien gjennom Smalvoll er anvendt på canonical place.' },
  notes: [child.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
if (!protocol.includes('| 154 | `alna_smalvoll` |')) {
  protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
  const entry = `| 154 | \`alna_smalvoll\` | Alna ved Smalvoll | verified_geometry | \`osm-way:22698275\` |\n\nBatch 154 (2026-07-23) løser Alna ved Smalvoll som den lange åpne Alna-strekningen på OSM way 22698275. Wayen er topologisk koblet oppstrøms til den korte tunnel-wayen 22698285 og følger hovedspennet til Smalvollveien-korridoren gjennom det området kildene beskriver som Smalvolldalen. Fresh Smalvollveien-way 652471071 brukes bare som uavhengig geografisk korridoravgrensning; canonical lat/lon beregnes deterministisk som lengdemidtpunkt langs selve elvegeometrien. Legacy-punktet og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex === -1) protocol = `${protocol.trimEnd()}\n\n${entry}`;
  else {
    const lineStart = protocol.lastIndexOf('\n', markerIndex) + 1;
    protocol = `${protocol.slice(0, lineStart)}${entry}${protocol.slice(lineStart)}`;
  }
  fs.writeFileSync(protocolPath, protocol);
}

writeJson(path.join(reportDir, 'batch-154-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry',
  sourceProvider: 'osm', sourceObjectId: 'osm-way:22698275', sourceUrl: 'https://www.openstreetmap.org/way/22698275',
  sourceTags: river.tags,
  geometry: { type: 'LineString', nodeCount: river.points.length, lengthM: anchor.lengthM, upstreamTunnelWay: `osm-way:${UPSTREAM_TUNNEL_WAY_ID}`, sharedTunnelNode: `osm-node:${sharedTunnelNode}` },
  corridorCrosscheck: { smalvollveienWay: `osm-way:${SMALVOLLVEIEN_WAY_ID}`, riverBoundingBox: riverBox, roadBoundingBox: roadBox, roadLatSpanInsideRiverRatio: Number(overlapRatio.toFixed(4)) },
  before: { lat: oldPlace.lat, lon: oldPlace.lon, r: oldPlace.r, coordStatus: oldPlace.coordStatus, coordSource: oldPlace.coordSource, coordType: oldPlace.coordType },
  after: { lat: child.lat, lon: child.lon, r: child.r, coordStatus: child.coordStatus, coordSource: child.coordSource, coordType: child.coordType, sourceObjectId: child.sourceObjectId, geocodeAccuracy: child.geocodeAccuracy, coordRole: child.coordRole },
  method: 'exact named long Alna segment + documented Smalvolldalen/Smalvollveien corridor + exact upstream tunnel topology + deterministic length midpoint; no legacy point, nearest or first-hit',
});
writeJson(path.join(reportDir, 'nearby-links-preservation.json'), { placeId: PLACE_ID, before: nearbyBefore, after: child?.nature_profile?.nearby_place_ids || [], preserved: JSON.stringify(nearbyBefore) === JSON.stringify(child?.nature_profile?.nearby_place_ids || []) });
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 154 sources – Alna ved Smalvoll\n\n- OpenStreetMap way 22698275: exact named open Alna river segment used for geometry.\n- OpenStreetMap way 22698285: exact upstream Alna tunnel segment used for topology.\n- OpenStreetMap way 652471071: Smalvollveien corridor used only as a geographic scope crosscheck.\n- Oslo byleksikon, Alnaelva: documents Alna's pronounced meanders in Smalvolldalen.\n- Oslo byleksikon, Alnastien: documents the route along Smalvollveien toward Bryn.\n\nThe legacy History Go coordinate and nearest/first-hit selection are not used.\n`);
console.log(JSON.stringify({ status: 'applied', batch: BATCH, placeId: PLACE_ID, sourceObjectId: child.sourceObjectId, anchor, overlapRatio, sharedTunnelNode }, null, 2));
