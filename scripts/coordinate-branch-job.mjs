import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const BATCH = 146;
const PLACE_ID = 'ljanselva_fiskevollen';
const OSM_WAY_ID = 156700580;
const UPSTREAM_WAY_ID = 98539575;
const VERIFIED_AT = '2026-07-22';

const aggregatePath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json');
const childPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute/ljanselva_fiskevollen.json');
const splitIndexPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_index.json');
const splitManifestPath = path.join(ROOT, 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute_manifest.json');
const evidencePath = path.join(ROOT, 'data/coordinate-evidence/oslo/natur/ljanselva_fiskevollen.json');
const protocolPath = path.join(ROOT, 'docs/coordinates/coordinate-control-protocol.md');
const candidateSummaryPath = path.join(ROOT, 'reports/oslo-coordinate-control-batch-145-ljanselva-ljan-topology/candidate-summary.json');
const reportDir = path.join(ROOT, 'reports/oslo-coordinate-control-batch-146-ljanselva-fiskevollen-lower-open');

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJson(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`); }
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function decodeXml(value = '') { return value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'); }
function attrs(tag) { const out = {}; for (const match of tag.matchAll(/([:\w-]+)="([^"]*)"/g)) out[match[1]] = decodeXml(match[2]); return out; }
function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon), lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLengthM(points) { let total = 0; for (let i = 1; i < points.length; i += 1) total += haversineM(points[i - 1], points[i]); return total; }
function lineMidpoint(points) {
  const total = lineLengthM(points), target = total / 2; let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1], b = points[i], len = haversineM(a, b);
    if (walked + len >= target) {
      const f = len === 0 ? 0 : (target - walked) / len;
      return { lat: Number((a.lat + (b.lat - a.lat) * f).toFixed(7)), lon: Number((a.lon + (b.lon - a.lon) * f).toFixed(7)), totalLengthM: Number(total.toFixed(1)) };
    }
    walked += len;
  }
  const last = points.at(-1); return { lat: last.lat, lon: last.lon, totalLengthM: Number(total.toFixed(1)) };
}
async function fetchText(url, accept = 'application/xml,text/xml;q=0.9,*/*;q=0.1') {
  const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', Accept: accept }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Kildeoppslag feilet ${response.status}: ${url}`);
  return response.text();
}
function parseWaysXml(xml) {
  const ways = [];
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const meta = attrs(`<way ${match[1]}>`); const body = match[2]; const tags = {}; const refs = [];
    for (const tagMatch of body.matchAll(/<tag\b[^>]*\/>/g)) { const a = attrs(tagMatch[0]); if (a.k) tags[a.k] = a.v ?? ''; }
    for (const ndMatch of body.matchAll(/<nd\b[^>]*\/>/g)) { const a = attrs(ndMatch[0]); if (a.ref) refs.push(String(a.ref)); }
    ways.push({ id: Number(meta.id), tags, nodeRefs: refs });
  }
  return ways;
}
function updatePlaceRecord(place, anchor, tunnelWay) {
  if (!place || place.id !== PLACE_ID) throw new Error(`Fant ikke ${PLACE_ID}`);
  return {
    ...place,
    lat: anchor.lat,
    lon: anchor.lon,
    sourceHint: 'Koordinaten er lengdemidtpunktet på OSM way 156700580, den siste separate åpne Ljanselva-strekningen nedstrøms Liadalen før den nedre tunnel-/kulvertsonen mot Fiskevollbukta.',
    coordType: 'lower_river_segment_anchor',
    coordStatus: 'verified_geometry',
    coordSource: `OpenStreetMap way 156700580 – nedre åpne Ljanselva før tunnel mot Fiskevollbukta; downstream ${tunnelWay ? `way ${tunnelWay.id}` : 'tunnel transition'}`,
    coordVerifiedAt: VERIFIED_AT,
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:156700580',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor',
    coordSourceId: 'osm-way:156700580',
    coordSourceUrl: 'https://www.openstreetmap.org/way/156700580',
    coordNote: `Batch 146 avgrenser Fiskevollen-stoppet til den separate nedre åpne Ljanselva-wayen 156700580. Wayen kobler eksakt oppstrøms til Ljan/Liadalen-way 98539575 og ender nedstrøms ved en OSM-modellert tunnel-/kulvertovergang${tunnelWay ? ` (way ${tunnelWay.id})` : ''}. Dette samsvarer med kilder som dokumenterer at Ljanselva går inn i nedre tunnel før utløpet i Fiskevollbukta. Canonical lat/lon er beregnet som lengdemidtpunkt på den åpne way-geometrien. Legacy-punktet 59.8319, 10.8048 brukes ikke; ingen nearest/first-hit-logikk brukes.`,
  };
}

fs.mkdirSync(reportDir, { recursive: true });
const research = readJson(candidateSummaryPath);
const exact = research.exactLjanselvaRivers || [];
const selectedResearch = exact.find((x) => Number(x.osmId) === OSM_WAY_ID);
const upstreamResearch = exact.find((x) => Number(x.osmId) === UPSTREAM_WAY_ID);
if (!selectedResearch || !upstreamResearch) throw new Error('Mangler forventede segmenter fra batch 145-research');
if (haversineM(selectedResearch.firstPoint, upstreamResearch.lastPoint) > 1) throw new Error('Research-topologien mellom Ljan og Fiskevollen er ikke lenger eksakt');

const osmUrl = `https://api.openstreetmap.org/api/0.6/way/${OSM_WAY_ID}/full`;
const osmXml = await fetchText(osmUrl);
fs.writeFileSync(path.join(reportDir, `osm-way-${OSM_WAY_ID}-full.xml`), osmXml);
const nodeMap = new Map();
for (const match of osmXml.matchAll(/<node\b[^>]*>/g)) { const a = attrs(match[0]); if (a.id && a.lat && a.lon) nodeMap.set(String(a.id), { id: String(a.id), lat: Number(a.lat), lon: Number(a.lon) }); }
const ways = parseWaysXml(osmXml);
const selectedWay = ways.find((w) => w.id === OSM_WAY_ID);
if (!selectedWay) throw new Error(`Fant ikke way ${OSM_WAY_ID} i full-respons`);
if (selectedWay.tags.name !== 'Ljanselva' || selectedWay.tags.waterway !== 'river') throw new Error(`Uventede tags på way ${OSM_WAY_ID}: ${JSON.stringify(selectedWay.tags)}`);
const points = selectedWay.nodeRefs.map((ref) => nodeMap.get(ref)).filter(Boolean);
if (points.length !== selectedWay.nodeRefs.length || points.length < 2) throw new Error('Kunne ikke rekonstruere full valgt geometri');

const upstreamReference = upstreamResearch.lastPoint;
const firstDist = haversineM(points[0], upstreamReference);
const lastDist = haversineM(points.at(-1), upstreamReference);
const upstreamNode = firstDist <= lastDist ? points[0] : points.at(-1);
const downstreamNode = firstDist <= lastDist ? points.at(-1) : points[0];
if (Math.min(firstDist, lastDist) > 1) throw new Error(`Fresh way kobler ikke eksakt til upstream way: ${Math.min(firstDist, lastDist).toFixed(2)} m`);

const downstreamWaysUrl = `https://api.openstreetmap.org/api/0.6/node/${downstreamNode.id}/ways`;
const downstreamWaysXml = await fetchText(downstreamWaysUrl);
fs.writeFileSync(path.join(reportDir, `osm-node-${downstreamNode.id}-ways.xml`), downstreamWaysXml);
const connectedWays = parseWaysXml(downstreamWaysXml).filter((w) => w.id !== OSM_WAY_ID);
const tunnelCandidates = connectedWays.filter((w) => {
  const tunnel = String(w.tags.tunnel || '').toLowerCase();
  const covered = String(w.tags.covered || '').toLowerCase();
  return Boolean(w.tags.waterway) && (tunnel === 'yes' || tunnel === 'culvert' || covered === 'yes' || w.tags.layer === '-1');
});
if (tunnelCandidates.length < 1) {
  throw new Error(`Downstream-node ${downstreamNode.id} har ingen eksplisitt vannveis-tunnel/kulvert. Connected: ${JSON.stringify(connectedWays)}`);
}
const tunnelWay = tunnelCandidates[0];
const anchor = lineMidpoint(points);

const aggregateBefore = readJson(aggregatePath);
const aggregateOld = aggregateBefore.find((p) => p?.id === PLACE_ID);
if (!aggregateOld) throw new Error(`Mangler ${PLACE_ID} i aggregate`);
writeJson(aggregatePath, aggregateBefore.map((p) => p?.id === PLACE_ID ? updatePlaceRecord(p, anchor, tunnelWay) : p));
const childBefore = readJson(childPath);
const nearbyBefore = childBefore?.nature_profile?.nearby_place_ids || [];
const childAfter = updatePlaceRecord(childBefore, anchor, tunnelWay);
writeJson(childPath, childAfter);

const splitIndex = readJson(splitIndexPath); const indexRow = splitIndex.find((row) => row?.id === PLACE_ID);
if (!indexRow) throw new Error(`Mangler ${PLACE_ID} i split-index`);
Object.assign(indexRow, {
  lat: anchor.lat, lon: anchor.lon, r: childAfter.r, coordStatus: childAfter.coordStatus, coordType: childAfter.coordType,
  locatorType: childAfter.locatorType, sourceProvider: childAfter.sourceProvider, sourceObjectId: childAfter.sourceObjectId,
  geocodeAccuracy: childAfter.geocodeAccuracy, coordRole: childAfter.coordRole, coordSource: childAfter.coordSource,
  coordSourceId: childAfter.coordSourceId, coordSourceUrl: childAfter.coordSourceUrl, coordVerifiedAt: childAfter.coordVerifiedAt, coordNote: childAfter.coordNote,
});
writeJson(splitIndexPath, splitIndex);
const splitManifest = readJson(splitManifestPath);
splitManifest.source_sha256 = sha256(aggregatePath); splitManifest.generated_at = new Date().toISOString();
const manifestRow = splitManifest.places?.find((row) => row?.id === PLACE_ID); if (!manifestRow) throw new Error(`Mangler ${PLACE_ID} i split-manifest`);
manifestRow.sha256 = sha256(childPath); writeJson(splitManifestPath, splitManifest);

writeJson(evidencePath, {
  schemaVersion: '1.0', placeId: PLACE_ID, placeFile: 'data/places/natur/oslo/places_oslo_natur_ljanselva_rute.json', evidenceStatus: 'applied_to_place', coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat: anchor.lat, lon: anchor.lon, r: childAfter.r, coordStatus: childAfter.coordStatus, coordSource: childAfter.coordSource, coordType: childAfter.coordType, coordNote: childAfter.coordNote },
  identity: { currentName: childAfter.name, resolvedIdentity: 'Den siste separate åpne Ljanselva-strekningen i Fiskevollen-korridoren før nedre tunnel mot Fiskevollbukta', identityStatus: 'resolved', identityProblem: '', locatorTypeCandidate: 'route', requiresSplit: false, splitReason: '' },
  requiredEvidence: [],
  evidence: [
    { sourceProvider: 'osm', sourceName: 'OpenStreetMap – nedre åpne Ljanselva', sourceUrl: 'https://www.openstreetmap.org/way/156700580', sourceObjectId: 'osm-way:156700580', sourceQuality: 'exact_named_lower_waterway_segment_with_upstream_and_tunnel_topology', finding: `Way 156700580 er eksakt navngitt Ljanselva, ${anchor.totalLengthM} m lang, kobler eksakt til upstream way 98539575 og ender ved tunnel-/kulvert-way ${tunnelWay.id}.`, canVerifyCoordinate: true, reason: 'Eksakt fysisk elvegeometri med eksplisitt topologisk plass mellom Ljan-segmentet og den nedre tunnelsonen.' },
    { sourceProvider: 'manual_research', sourceName: 'Ljan skole – Ljanselva i nærmiljøet', sourceUrl: 'https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/', sourceObjectId: 'osloskolen:ljan-ljanselva-naermiljo', sourceQuality: 'official_local_route_context', finding: 'Kilden beskriver turveien langs Ljanselva ned mot Hallagerbanen og fisketrappene før elva går inn i tunnelen mot Fiskevollbukta.', canVerifyCoordinate: false, reason: 'Kryssjekker den utløpsnære sekvensen; geometrien kommer fra OSM.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo byleksikon – Ljanselva', sourceUrl: 'https://oslobyleksikon.no/side/Ljanselva', sourceObjectId: 'oslobyleksikon:ljanselva', sourceQuality: 'documented_lower_culvert', finding: 'Kilden dokumenterer at nedre del av Ljanselva er lagt i kulvert fram mot munningen i Fiskevollbukta.', canVerifyCoordinate: false, reason: 'Kryssjekker overgang fra åpen elv til nedre kulvert.' },
    { sourceProvider: 'manual_research', sourceName: 'Oslo kommune – Fiskevollbukta', sourceUrl: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/fiskevollbukta', sourceObjectId: 'oslo-kommune:fiskevollbukta', sourceQuality: 'official_destination_identity', finding: 'Kommunens badeplass-side dokumenterer Fiskevollbukta som det konkrete fjordområdet nedstrøms denne elvekorridoren.', canVerifyCoordinate: false, reason: 'Kryssjekker Fiskevollen/Fiskevollbukta-scope; ikke brukt som elvekoordinat.' },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:156700580', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${tunnelWay.id}`, canApplyToPlace: false },
    { sourceProvider: 'manual_research', sourceObjectId: 'oslobyleksikon:ljanselva', canApplyToPlace: false },
  ],
  geometryCandidates: [{ sourceProvider: 'osm', sourceObjectId: 'osm-way:156700580', lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', geometryType: 'LineString', lineLengthM: anchor.totalLengthM, canApplyToPlace: true }],
  coordinateCandidates: [{ lat: anchor.lat, lon: anchor.lon, coordRole: 'line_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Kildekontrakt og line_anchor er anvendt på canonical place.' }, notes: [childAfter.coordNote],
});

let protocol = fs.readFileSync(protocolPath, 'utf8');
const needsReviewPattern = /^\| `ljanselva_fiskevollen` – Ljanselva ved Fiskevollen \| needs_review \|.*\n/m;
if (!needsReviewPattern.test(protocol)) throw new Error('Fant ikke needs_review-raden for ljanselva_fiskevollen');
protocol = protocol.replace(needsReviewPattern, '');
const batch145Pattern = /Batch 145 \(2026-07-22\) korrigerer den opprinnelige batch-112-scope-boksen[^\n]*/;
const batch145Match = protocol.match(batch145Pattern); if (!batch145Match) throw new Error('Fant ikke batch 145-ankeret');
const block = `\n\n| 146 | \`${PLACE_ID}\` | Ljanselva ved Fiskevollen | verified_geometry | \`osm-way:${OSM_WAY_ID}\` |\n\nBatch 146 (${VERIFIED_AT}) avgrenser \`${PLACE_ID}\` til den siste separate åpne Ljanselva-strekningen før den nedre tunnel-/kulvertsonen mot Fiskevollbukta. Way ${OSM_WAY_ID} kobler eksakt oppstrøms til Ljan/Liadalen-way ${UPSTREAM_WAY_ID} og ender nedstrøms ved OSM-way ${tunnelWay.id}, som er modellert som vannvei i tunnel/kulvert. Kildene kryssjekker at nedre Ljanselva går i tunnel mot Fiskevollbukta. Canonical lat/lon er lengdemidtpunktet på den åpne elvegeometrien og lagres som \`semantic_anchor\` / \`line_anchor\`. Legacy-punktet brukes ikke; ingen nearest/first-hit-logikk brukes.`;
protocol = protocol.replace(batch145Match[0], `${batch145Match[0]}${block}`);
protocol = protocol.replace(/Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./, (_m, c) => `Oslo-protokollen dekker nå ${Number(c) + 1} aktive current \`verified*\` canonical Oslo-steder.`);
fs.writeFileSync(protocolPath, protocol);

writeJson(path.join(reportDir, 'downstream-topology.json'), {
  generatedAt: new Date().toISOString(), placeId: PLACE_ID, selectedSourceObjectId: `osm-way:${OSM_WAY_ID}`,
  upstreamSourceObjectId: `osm-way:${UPSTREAM_WAY_ID}`, upstreamNode,
  downstreamNode, connectedWays, tunnelCandidates, selectedTunnelWay: tunnelWay,
  selectionRule: 'Use exact named lower open Ljanselva way that connects upstream to the separately verified Ljan way and downstream to an explicit waterway tunnel/culvert.',
});
writeJson(path.join(reportDir, 'nearby-links-preservation.json'), { placeId: PLACE_ID, before: nearbyBefore, after: childAfter?.nature_profile?.nearby_place_ids || [], unchanged: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []) });
writeJson(path.join(reportDir, 'batch-146-result.json'), {
  generatedAt: new Date().toISOString(), batch: BATCH, placeId: PLACE_ID, status: 'verified_geometry', sourceProvider: 'osm', sourceObjectId: `osm-way:${OSM_WAY_ID}`,
  geometry: { type: 'LineString', nodeCount: points.length, lengthM: anchor.totalLengthM, upstreamConnection: `osm-way:${UPSTREAM_WAY_ID}`, downstreamTunnel: `osm-way:${tunnelWay.id}` },
  before: { lat: aggregateOld.lat, lon: aggregateOld.lon, r: aggregateOld.r, coordStatus: aggregateOld.coordStatus, coordSource: aggregateOld.coordSource, coordType: aggregateOld.coordType },
  after: { lat: anchor.lat, lon: anchor.lon, r: childAfter.r, coordStatus: childAfter.coordStatus, coordSource: childAfter.coordSource, coordType: childAfter.coordType, sourceObjectId: childAfter.sourceObjectId, geocodeAccuracy: childAfter.geocodeAccuracy, coordRole: childAfter.coordRole },
  method: 'exact named lower river segment bracketed by verified upstream river topology and explicit downstream tunnel/culvert topology; deterministic length-midpoint; no legacy point and no nearest/first-hit',
});
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Oslo coordinate control batch 146 – Ljanselva ved Fiskevollen\n\n- Åpen elvegeometri: https://www.openstreetmap.org/way/${OSM_WAY_ID}\n- Oppstrøms Ljan-geometri: https://www.openstreetmap.org/way/${UPSTREAM_WAY_ID}\n- Nedstrøms tunnel-/kulvertway: https://www.openstreetmap.org/way/${tunnelWay.id}\n- Oslo byleksikon: https://oslobyleksikon.no/side/Ljanselva\n- Ljan skole: https://ljan.osloskolen.no/om-skolen/om-oss/skolen-og-naromradet/\n- Oslo kommune Fiskevollbukta: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/fiskevollbukta\n\nWay ${OSM_WAY_ID} brukes som den siste separate åpne elvestrekningen før tunnelsonen. Canonical punkt beregnes fra way-geometrien, ikke fra legacy-punktet.\n`);

console.log(JSON.stringify({ batch: BATCH, placeId: PLACE_ID, sourceObjectId: `osm-way:${OSM_WAY_ID}`, anchor, upstreamNode, downstreamNode, tunnelWay: { id: tunnelWay.id, tags: tunnelWay.tags }, nearbyLinksPreserved: JSON.stringify(nearbyBefore) === JSON.stringify(childAfter?.nature_profile?.nearby_place_ids || []) }, null, 2));
