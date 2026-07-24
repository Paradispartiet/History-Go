import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DATE = '2026-07-24';
const PLACE_ID = 'bygdoy_natur';
const REPORT_DIR = 'reports/oslo-coordinate-bygdoy-gulliste-scope-research-post-195-v3';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/natur/bygdoy_natur.json';
const INDEX_PATH = 'data/places/places_index.json';
const QUEUE_PATH = 'reports/oslo-coordinate-unresolved-queue-audit-post-195/summary.json';
const BRYN_REPORT_PATH = 'reports/oslo-coordinate-bryn-official-scope-research-post-195/summary.json';
const BYGDOY_CLOSURE_PATH = 'reports/visitoslo-bygdoy-audit-20260721/closure.json';
const FACTS_URL = 'https://od2.pbe.oslo.kommune.no/pages/vedlegg/gulliste.html';
const WFS_BASE = 'https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const LEGACY_POINT = { lat: 59.9048, lon: 10.6849 };
const EXPECTED_ANCHOR_IDS = [
  'kon_tiki_museet', 'frammuseet', 'norsk_maritimt_museum', 'norsk_folkemuseum',
  'bygdoy_kongsgard', 'villa_grande', 'oscarshall', 'vikingtidsmuseet',
  'bygdoy_huk', 'bygdoy_paradisbukta'
];

function assert(condition, message) { if (!condition) throw new Error(message); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function safeName(value) { return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase(); }
function decodeXml(value) {
  return String(value ?? '').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&#248;', 'ø').replaceAll('&#216;', 'Ø')
    .replaceAll('&#229;', 'å').replaceAll('&#197;', 'Å').replaceAll('&#230;', 'æ').replaceAll('&#198;', 'Æ');
}
function normalizeText(value) {
  return decodeXml(String(value ?? '')).replace(/<[^>]+>/g, ' ').replaceAll('&nbsp;', ' ')
    .replaceAll('&aring;', 'å').replaceAll('&oslash;', 'ø').replaceAll('&aelig;', 'æ').replace(/\s+/g, ' ').trim();
}
function snippets(text, needles, radius = 320, max = 60) {
  const source = String(text ?? '');
  const lower = source.toLowerCase();
  const rows = [];
  for (const needle of needles) {
    let from = 0;
    while (rows.length < max) {
      const index = lower.indexOf(needle.toLowerCase(), from);
      if (index < 0) break;
      rows.push({ needle, snippet: normalizeText(source.slice(Math.max(0, index - radius), Math.min(source.length, index + needle.length + radius))) });
      from = index + needle.length;
    }
  }
  return rows;
}
function makeWfsUrl(params) {
  const url = new URL(WFS_BASE);
  url.search = new URLSearchParams({ map: 'GULLISTE', SERVICE: 'WFS', VERSION: '2.0.0', ...params }).toString();
  return url.href;
}
function parseCoordinateList(text) {
  const numbers = String(text).trim().split(/\s+/).map(Number);
  assert(numbers.length >= 8 && numbers.length % 2 === 0, `Invalid GML coordinate count ${numbers.length}.`);
  const points = [];
  for (let i = 0; i < numbers.length; i += 2) {
    assert(Number.isFinite(numbers[i]) && Number.isFinite(numbers[i + 1]), 'GML contains a non-finite coordinate.');
    points.push([numbers[i], numbers[i + 1]]);
  }
  const first = points[0];
  const last = points.at(-1);
  if (first[0] !== last[0] || first[1] !== last[1]) points.push([...first]);
  return points;
}
function firstPosList(block) {
  const match = String(block).match(/<gml:posList\b[^>]*>([\s\S]*?)<\/gml:posList>/i);
  assert(match, 'GML ring has no posList.');
  return parseCoordinateList(match[1]);
}
function parseGmlFeatures(xml) {
  const members = [
    ...[...String(xml).matchAll(/<wfs:member\b[^>]*>([\s\S]*?)<\/wfs:member>/gi)].map((m) => m[1]),
    ...[...String(xml).matchAll(/<gml:featureMember\b[^>]*>([\s\S]*?)<\/gml:featureMember>/gi)].map((m) => m[1])
  ];
  const features = [];
  for (const member of members) {
    const featureMatch = member.match(/<ms:Kulturmiljo\b([^>]*)>([\s\S]*?)<\/ms:Kulturmiljo>/i);
    if (!featureMatch) continue;
    const id = featureMatch[1].match(/gml:id=["']([^"']+)["']/i)?.[1] ?? null;
    const body = featureMatch[2];
    const properties = {};
    for (const match of body.matchAll(/<ms:([A-Za-z0-9_]+)\b[^>]*>([^<]*)<\/ms:\1>/gi)) {
      const value = normalizeText(match[2]);
      if (value) properties[match[1]] = value;
    }
    const polygons = [];
    for (const polygonMatch of body.matchAll(/<gml:Polygon\b[^>]*>([\s\S]*?)<\/gml:Polygon>/gi)) {
      const polygonBody = polygonMatch[1];
      const exterior = polygonBody.match(/<gml:exterior\b[^>]*>([\s\S]*?)<\/gml:exterior>/i);
      assert(exterior, `Feature ${id ?? '?'} polygon lacks exterior ring.`);
      const rings = [firstPosList(exterior[1])];
      for (const interior of polygonBody.matchAll(/<gml:interior\b[^>]*>([\s\S]*?)<\/gml:interior>/gi)) rings.push(firstPosList(interior[1]));
      polygons.push(rings);
    }
    assert(polygons.length > 0, `Feature ${id ?? '?'} has no polygons.`);
    features.push({ type: 'Feature', id, properties, geometry: polygons.length === 1 ? { type: 'Polygon', coordinates: polygons[0] } : { type: 'MultiPolygon', coordinates: polygons } });
  }
  return features;
}
function utm32ToWgs84([easting, northing]) {
  const a = 6378137;
  const eccSquared = 0.00669438;
  const k0 = 0.9996;
  const eccPrimeSquared = eccSquared / (1 - eccSquared);
  const x = easting - 500000;
  const y = northing;
  const longOrigin = 9;
  const m = y / k0;
  const mu = m / (a * (1 - eccSquared / 4 - 3 * eccSquared ** 2 / 64 - 5 * eccSquared ** 3 / 256));
  const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  const phi1 = mu
    + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu)
    + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);
  const n1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1) ** 2);
  const t1 = Math.tan(phi1) ** 2;
  const c1 = eccPrimeSquared * Math.cos(phi1) ** 2;
  const r1 = a * (1 - eccSquared) / (1 - eccSquared * Math.sin(phi1) ** 2) ** 1.5;
  const d = x / (n1 * k0);
  const lat = phi1 - (n1 * Math.tan(phi1) / r1) * (
    d ** 2 / 2
    - (5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * eccPrimeSquared) * d ** 4 / 24
    + (61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * eccPrimeSquared - 3 * c1 ** 2) * d ** 6 / 720
  );
  const lon = (
    d - (1 + 2 * t1 + c1) * d ** 3 / 6
    + (5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * eccPrimeSquared + 24 * t1 ** 2) * d ** 5 / 120
  ) / Math.cos(phi1);
  return [longOrigin + lon * 180 / Math.PI, lat * 180 / Math.PI];
}
function transformGeometry(geometry) {
  const transformRing = (ring) => ring.map(utm32ToWgs84);
  if (geometry.type === 'Polygon') return { type: 'Polygon', coordinates: geometry.coordinates.map(transformRing) };
  return { type: 'MultiPolygon', coordinates: geometry.coordinates.map((polygon) => polygon.map(transformRing)) };
}
function featureText(feature) { return JSON.stringify({ id: feature.id, properties: feature.properties }).toLowerCase(); }
function polygons(geometry) { return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates; }
function pointOnSegment(point, a, b, epsilon = 1e-10) {
  const cross = (point[0] - a[0]) * (b[1] - a[1]) - (point[1] - a[1]) * (b[0] - a[0]);
  if (Math.abs(cross) > epsilon) return false;
  return point[0] >= Math.min(a[0], b[0]) - epsilon && point[0] <= Math.max(a[0], b[0]) + epsilon
    && point[1] >= Math.min(a[1], b[1]) - epsilon && point[1] <= Math.max(a[1], b[1]) + epsilon;
}
function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const a = ring[j];
    const b = ring[i];
    if (pointOnSegment(point, a, b)) return true;
    const intersects = ((b[1] > point[1]) !== (a[1] > point[1]))
      && point[0] < (a[0] - b[0]) * (point[1] - b[1]) / ((a[1] - b[1]) || Number.EPSILON) + b[0];
    if (intersects) inside = !inside;
  }
  return inside;
}
function pointInGeometry(point, geometry) {
  return polygons(geometry).some((polygon) => pointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(point, hole)));
}
function ringArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i += 1) sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return sum / 2;
}
function geometryArea(geometry) {
  return polygons(geometry).reduce((total, polygon) => total + Math.max(0, Math.abs(ringArea(polygon[0])) - polygon.slice(1).reduce((sum, ring) => sum + Math.abs(ringArea(ring)), 0)), 0);
}
function geometryBbox(geometry) {
  const points = polygons(geometry).flat(2);
  return { minLon: Math.min(...points.map((p) => p[0])), minLat: Math.min(...points.map((p) => p[1])), maxLon: Math.max(...points.map((p) => p[0])), maxLat: Math.max(...points.map((p) => p[1])) };
}

await mkdir(REPORT_DIR, { recursive: true });
const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])));
assert(maxBatch === 195 && protocol.includes('| 195 | `frognerstranda` |') && !protocol.includes('| 196 |'), `Protocol hard gate failed at batch ${maxBatch}.`);
const [evidence, runtime, queueAudit, brynReport, closure] = await Promise.all([
  readFile(EVIDENCE_PATH, 'utf8').then(JSON.parse), readFile(INDEX_PATH, 'utf8').then(JSON.parse),
  readFile(QUEUE_PATH, 'utf8').then(JSON.parse), readFile(BRYN_REPORT_PATH, 'utf8').then(JSON.parse),
  readFile(BYGDOY_CLOSURE_PATH, 'utf8').then(JSON.parse)
]);
assert(evidence.placeId === PLACE_ID && evidence.evidenceStatus === 'needs_research' && evidence.currentCoordinate?.coordStatus === 'needs_source', 'Bygdøy evidence drifted.');
assert(brynReport.decision === 'keep_needs_source', 'Bryn blocking research drifted.');
assert(queueAudit.orderedQueue?.[1]?.placeId === PLACE_ID && closure.scopeLocks?.bygdoy === PLACE_ID, 'Bygdøy queue/scope lock drifted.');
const runtimeById = new Map(runtime.map((place) => [place.id, place]));
const anchors = EXPECTED_ANCHOR_IDS.map((id) => {
  const place = runtimeById.get(id);
  assert(place && Number.isFinite(place.lat) && Number.isFinite(place.lon), `Missing locked anchor ${id}.`);
  return { id, name: place.name, lat: place.lat, lon: place.lon, coordStatus: place.coordStatus ?? null, sourceObjectId: place.sourceObjectId ?? null };
});

const captures = [];
async function capture(label, url) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'History-Go-coordinate-research/196', accept: 'text/xml,text/html,text/plain,*/*' } });
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const extension = /xml/i.test(contentType) ? '.xml' : /html/i.test(contentType) ? '.html' : '.txt';
  const reportFile = `${REPORT_DIR}/${safeName(label)}${extension}`;
  await writeFile(reportFile, text, 'utf8');
  const row = { label, requestedUrl: url, finalUrl: response.url, status: response.status, ok: response.ok, contentType, bytes: Buffer.byteLength(text), sha256: sha256(text), reportFile, text };
  captures.push(row);
  return row;
}
const facts = await capture('official-gulliste-facts', FACTS_URL);
const capabilities = await capture('gulliste-wfs-capabilities', makeWfsUrl({ REQUEST: 'GetCapabilities' }));
const describe = await capture('gulliste-wfs-kulturmiljo-describe', makeWfsUrl({ REQUEST: 'DescribeFeatureType', TYPENAMES: 'ms:Kulturmiljo' }));
const featureCapture = await capture('gulliste-kulturmiljo-default-utm32-gml', makeWfsUrl({ REQUEST: 'GetFeature', TYPENAMES: 'ms:Kulturmiljo' }));
assert(facts.ok && capabilities.ok && describe.ok && featureCapture.ok, `Official request failure: facts=${facts.status}, caps=${capabilities.status}, describe=${describe.status}, features=${featureCapture.status}.`);
const factsText = normalizeText(facts.text).toLowerCase();
assert(factsText.includes('bare to områderegistreringer') && factsText.includes('bygdøy') && factsText.includes('birkelunden'), 'Official cultural-environment facts drifted.');
assert(capabilities.text.includes('ms:Kulturmiljo') && capabilities.text.includes('EPSG::25832'), 'Kulturmiljo WFS contract drifted.');
const utmFeatures = parseGmlFeatures(featureCapture.text);
assert(utmFeatures.length === 2, `Expected two Kulturmiljo features, found ${utmFeatures.length}.`);
const bygdoyMatches = utmFeatures.filter((feature) => /bygd[oø]y/.test(featureText(feature)));
const birkelundenMatches = utmFeatures.filter((feature) => /birkelund/.test(featureText(feature)));
assert(bygdoyMatches.length === 1 && birkelundenMatches.length === 1, `Property identity failed: Bygdøy=${bygdoyMatches.length}, Birkelunden=${birkelundenMatches.length}.`);
const bygdoyUtm = bygdoyMatches[0];
const bygdoyWgs = { ...bygdoyUtm, geometry: transformGeometry(bygdoyUtm.geometry) };
const coverage = anchors.map((anchor) => ({ ...anchor, insideOfficialCulturalEnvironment: pointInGeometry([anchor.lon, anchor.lat], bygdoyWgs.geometry) }));
const inside = coverage.filter((row) => row.insideOfficialCulturalEnvironment);
const outside = coverage.filter((row) => !row.insideOfficialCulturalEnvironment);
const legacyInside = pointInGeometry([LEGACY_POINT.lon, LEGACY_POINT.lat], bygdoyWgs.geometry);
const areaM2 = geometryArea(bygdoyUtm.geometry);
const bbox = geometryBbox(bygdoyWgs.geometry);
let decision = 'official_bygdoy_cultural_environment_is_partial_scope_keep_needs_source';
let nextAction = 'The official Bygdøy cultural-environment polygon does not cover the full locked peninsula-scale scope. Keep bygdoy_natur unresolved and do not substitute the protected landscape for the whole peninsula.';
if (outside.length === 0 && legacyInside) {
  decision = 'official_gulliste_polygon_matches_locked_peninsula_scope_requires_production_crosscheck';
  nextAction = 'The exact official polygon covers all locked anchors and the legacy marker. Re-fetch it from fresh main and derive a deterministic interior area anchor before any batch 196 production.';
}
const summary = {
  version: DATE, protocolMaxBatch: maxBatch, placeId: PLACE_ID, researchOnly: true, canonicalChanged: false,
  hardGates: { batch195Present: true, batch196Absent: true, brynResearchExhausted: true, bygdoySecondInQueue: true, evidenceStillUnresolved: true, visitOsloScopeLockPresent: true },
  officialFacts: { sourceUrl: FACTS_URL, status: facts.status, snippets: snippets(facts.text, ['bare to områderegistreringer', 'Bygdøy', 'Birkelunden', 'Kulturmiljø']) },
  officialWfs: {
    service: 'Oslo kommune Planinnsyn GULLISTE WFS', featureType: 'ms:Kulturmiljo', defaultCrs: 'EPSG:25832', featureCount: utmFeatures.length,
    featureSummaries: utmFeatures.map((feature) => ({ id: feature.id, properties: feature.properties, geometryType: feature.geometry.type })),
    bygdoyFeatureId: bygdoyUtm.id, bygdoyProperties: bygdoyUtm.properties, bygdoyGeometryType: bygdoyUtm.geometry.type,
    bygdoyAreaM2: Number(areaM2.toFixed(2)), bygdoyBboxWgs84: bbox,
    sourceObjectId: `oslo-planinnsyn:GULLISTE:Kulturmiljo:${bygdoyUtm.id ?? 'bygdoy'}`,
    transform: 'deterministic inverse WGS84 UTM zone 32N to EPSG:4326'
  },
  lockedScope: { expectedAnchorCount: EXPECTED_ANCHOR_IDS.length, insideCount: inside.length, outsideCount: outside.length, legacyMarkerInside: legacyInside, coverage, outsideAnchors: outside },
  decision, nextAction, captures: captures.map(({ text, ...row }) => row)
};
await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-utm32.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyUtm] }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-wgs84.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyWgs] }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/locked-anchor-coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`, 'utf8');
const outsideList = outside.length ? outside.map((row) => `- \`${row.id}\` — ${row.name}`).join('\n') : '- none';
await writeFile(`${REPORT_DIR}/README.md`, `# Bygdøy Gul liste UTM32 scope research after batch 195\n\n- Research only: **yes**\n- Canonical/evidence/protocol changed: **no**\n- Official Kulturmiljo features: **${utmFeatures.length}**\n- Bygdøy polygon area: **${Math.round(areaM2)} m²**\n- Locked anchors inside: **${inside.length}/${coverage.length}**\n- Legacy marker inside: **${legacyInside}**\n- Decision: **${decision}**\n\n## Locked anchors outside the official polygon\n\n${outsideList}\n\n${nextAction}\n\nThe WFS is consumed in its advertised EPSG:25832 default CRS. Geometry is transformed deterministically to WGS84 before the ten-anchor coverage test. The feature is selected by official properties, never by nearest geometry.\n`, 'utf8');
console.log(JSON.stringify({ status: 'research_complete', reportDir: REPORT_DIR, decision, featureId: bygdoyUtm.id, areaM2: Number(areaM2.toFixed(2)), insideAnchors: inside.length, outsideAnchors: outside.map((row) => row.id), legacyInside }, null, 2));
