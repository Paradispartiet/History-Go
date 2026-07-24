import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const REPORT_DIR = 'reports/oslo-coordinate-bygdoy-gulliste-scope-research-post-195-v4';
const WFS = 'https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const FACTS = 'https://od2.pbe.oslo.kommune.no/pages/vedlegg/gulliste.html';
const LEGACY = { lat: 59.9048, lon: 10.6849 };
const ANCHOR_IDS = [
  'kon_tiki_museet', 'frammuseet', 'norsk_maritimt_museum', 'norsk_folkemuseum',
  'bygdoy_kongsgard', 'villa_grande', 'oscarshall', 'vikingtidsmuseet',
  'bygdoy_huk', 'bygdoy_paradisbukta'
];

const paths = {
  protocol: 'docs/coordinates/coordinate-control-protocol.md',
  evidence: 'data/coordinate-evidence/oslo/natur/bygdoy_natur.json',
  index: 'data/places/places_index.json',
  queue: 'reports/oslo-coordinate-unresolved-queue-audit-post-195/summary.json',
  bryn: 'reports/oslo-coordinate-bryn-official-scope-research-post-195/summary.json',
  closure: 'reports/visitoslo-bygdoy-audit-20260721/closure.json'
};

function assert(ok, message) { if (!ok) throw new Error(message); }
function hash(value) { return createHash('sha256').update(value).digest('hex'); }
function safe(value) { return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase(); }
function decode(value) {
  return String(value ?? '').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&#248;', 'ø').replaceAll('&#216;', 'Ø')
    .replaceAll('&#229;', 'å').replaceAll('&#197;', 'Å').replaceAll('&#230;', 'æ').replaceAll('&#198;', 'Æ');
}
function clean(value) {
  return decode(value).replace(/<[^>]+>/g, ' ').replaceAll('&nbsp;', ' ').replaceAll('&aring;', 'å')
    .replaceAll('&oslash;', 'ø').replaceAll('&aelig;', 'æ').replace(/\s+/g, ' ').trim();
}
function excerpts(text, needles, radius = 300, max = 40) {
  const source = String(text);
  const lower = source.toLowerCase();
  const rows = [];
  for (const needle of needles) {
    let start = 0;
    while (rows.length < max) {
      const index = lower.indexOf(needle.toLowerCase(), start);
      if (index < 0) break;
      rows.push({ needle, snippet: clean(source.slice(Math.max(0, index - radius), index + needle.length + radius)) });
      start = index + needle.length;
    }
  }
  return rows;
}
function url(params) {
  const endpoint = new URL(WFS);
  endpoint.search = new URLSearchParams({ map: 'GULLISTE', SERVICE: 'WFS', VERSION: '2.0.0', ...params }).toString();
  return endpoint.href;
}
function parsePairs(value) {
  const values = String(value).trim().split(/\s+/).map(Number);
  assert(values.length >= 8 && values.length % 2 === 0 && values.every(Number.isFinite), 'Invalid GML posList.');
  const points = [];
  for (let i = 0; i < values.length; i += 2) points.push([values[i], values[i + 1]]);
  if (points[0][0] !== points.at(-1)[0] || points[0][1] !== points.at(-1)[1]) points.push([...points[0]]);
  return points;
}
function ring(block) {
  const match = block.match(/<gml:posList\b[^>]*>([\s\S]*?)<\/gml:posList>/i);
  assert(match, 'Polygon ring lacks gml:posList.');
  return parsePairs(match[1]);
}
function parseFeatures(xml) {
  const members = [
    ...[...xml.matchAll(/<wfs:member\b[^>]*>([\s\S]*?)<\/wfs:member>/gi)].map((m) => m[1]),
    ...[...xml.matchAll(/<gml:featureMember\b[^>]*>([\s\S]*?)<\/gml:featureMember>/gi)].map((m) => m[1])
  ];
  return members.flatMap((member) => {
    const feature = member.match(/<ms:Kulturmiljo\b([^>]*)>([\s\S]*?)<\/ms:Kulturmiljo>/i);
    if (!feature) return [];
    const properties = {};
    for (const match of feature[2].matchAll(/<ms:([A-Za-z0-9_]+)\b[^>]*>([^<]*)<\/ms:\1>/gi)) {
      const value = clean(match[2]);
      if (value) properties[match[1]] = value;
    }
    const polygons = [...feature[2].matchAll(/<gml:Polygon\b[^>]*>([\s\S]*?)<\/gml:Polygon>/gi)].map((polygon) => {
      const exterior = polygon[1].match(/<gml:exterior\b[^>]*>([\s\S]*?)<\/gml:exterior>/i);
      assert(exterior, 'Polygon lacks exterior ring.');
      return [ring(exterior[1]), ...[...polygon[1].matchAll(/<gml:interior\b[^>]*>([\s\S]*?)<\/gml:interior>/gi)].map((hole) => ring(hole[1]))];
    });
    assert(polygons.length, 'Kulturmiljo feature has no polygon geometry.');
    return [{
      type: 'Feature',
      id: feature[1].match(/gml:id=["']([^"']+)["']/i)?.[1] ?? null,
      properties,
      geometry: polygons.length === 1 ? { type: 'Polygon', coordinates: polygons[0] } : { type: 'MultiPolygon', coordinates: polygons }
    }];
  });
}
function utmToWgs([easting, northing]) {
  const a = 6378137, e2 = 0.00669438, k0 = 0.9996, ep2 = e2 / (1 - e2);
  const x = easting - 500000, m = northing / k0;
  const mu = m / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const p = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + 151 * e1 ** 3 / 96 * Math.sin(6 * mu) + 1097 * e1 ** 4 / 512 * Math.sin(8 * mu);
  const n = a / Math.sqrt(1 - e2 * Math.sin(p) ** 2), t = Math.tan(p) ** 2, c = ep2 * Math.cos(p) ** 2;
  const r = a * (1 - e2) / (1 - e2 * Math.sin(p) ** 2) ** 1.5, d = x / (n * k0);
  const lat = p - n * Math.tan(p) / r * (d ** 2 / 2 - (5 + 3 * t + 10 * c - 4 * c ** 2 - 9 * ep2) * d ** 4 / 24
    + (61 + 90 * t + 298 * c + 45 * t ** 2 - 252 * ep2 - 3 * c ** 2) * d ** 6 / 720);
  const lon = (d - (1 + 2 * t + c) * d ** 3 / 6 + (5 - 2 * c + 28 * t - 3 * c ** 2 + 8 * ep2 + 24 * t ** 2) * d ** 5 / 120) / Math.cos(p);
  return [9 + lon * 180 / Math.PI, lat * 180 / Math.PI];
}
function polygons(geometry) { return geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates; }
function transform(geometry) {
  const convert = (polygon) => polygon.map((r) => r.map(utmToWgs));
  return geometry.type === 'Polygon' ? { type: 'Polygon', coordinates: convert(geometry.coordinates) }
    : { type: 'MultiPolygon', coordinates: geometry.coordinates.map(convert) };
}
function onSegment(p, a, b, epsilon = 1e-10) {
  const cross = (p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]);
  return Math.abs(cross) <= epsilon && p[0] >= Math.min(a[0], b[0]) - epsilon && p[0] <= Math.max(a[0], b[0]) + epsilon
    && p[1] >= Math.min(a[1], b[1]) - epsilon && p[1] <= Math.max(a[1], b[1]) + epsilon;
}
function inRing(p, r) {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i, i += 1) {
    if (onSegment(p, r[j], r[i])) return true;
    if (((r[i][1] > p[1]) !== (r[j][1] > p[1])) && p[0] < (r[j][0] - r[i][0]) * (p[1] - r[i][1]) / ((r[j][1] - r[i][1]) || Number.EPSILON) + r[i][0]) inside = !inside;
  }
  return inside;
}
function contains(p, geometry) { return polygons(geometry).some((poly) => inRing(p, poly[0]) && !poly.slice(1).some((hole) => inRing(p, hole))); }
function ringArea(r) { let s = 0; for (let i = 0; i < r.length - 1; i += 1) s += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1]; return s / 2; }
function area(geometry) { return polygons(geometry).reduce((sum, poly) => sum + Math.max(0, Math.abs(ringArea(poly[0])) - poly.slice(1).reduce((v, hole) => v + Math.abs(ringArea(hole)), 0)), 0); }
function bbox(geometry) {
  const pts = polygons(geometry).flat(2);
  return { minLon: Math.min(...pts.map((p) => p[0])), minLat: Math.min(...pts.map((p) => p[1])), maxLon: Math.max(...pts.map((p) => p[0])), maxLat: Math.max(...pts.map((p) => p[1])) };
}

await mkdir(REPORT_DIR, { recursive: true });
const protocol = await readFile(paths.protocol, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])));
assert(maxBatch === 195 && protocol.includes('| 195 | `frognerstranda` |') && !protocol.includes('| 196 |'), `Protocol gate failed at ${maxBatch}.`);
const [evidence, runtime, queue, bryn, closure] = await Promise.all([
  readFile(paths.evidence, 'utf8').then(JSON.parse), readFile(paths.index, 'utf8').then(JSON.parse),
  readFile(paths.queue, 'utf8').then(JSON.parse), readFile(paths.bryn, 'utf8').then(JSON.parse),
  readFile(paths.closure, 'utf8').then(JSON.parse)
]);
assert(evidence.placeId === PLACE_ID && evidence.evidenceStatus === 'needs_research' && evidence.currentCoordinate?.coordStatus === 'needs_source', 'Bygdøy evidence drifted.');
assert(bryn.decision === 'keep_needs_source' && queue.orderedQueue?.[1]?.placeId === PLACE_ID && closure.scopeLocks?.bygdoy === PLACE_ID, 'Queue/scope prerequisites drifted.');
const byId = new Map(runtime.map((p) => [p.id, p]));
const anchors = ANCHOR_IDS.map((id) => { const p = byId.get(id); assert(p && Number.isFinite(p.lat) && Number.isFinite(p.lon), `Missing ${id}.`); return { id, name: p.name, lat: p.lat, lon: p.lon, coordStatus: p.coordStatus ?? null, sourceObjectId: p.sourceObjectId ?? null }; });
const captures = [];
async function capture(label, target) {
  const response = await fetch(target, { headers: { 'user-agent': 'History-Go-coordinate-research/196', accept: 'text/xml,text/html,*/*' } });
  const text = await response.text(), type = response.headers.get('content-type') ?? '', ext = /xml/i.test(type) ? '.xml' : '.html';
  const file = `${REPORT_DIR}/${safe(label)}${ext}`;
  await writeFile(file, text, 'utf8');
  captures.push({ label, target, finalUrl: response.url, status: response.status, ok: response.ok, contentType: type, bytes: Buffer.byteLength(text), sha256: hash(text), file });
  return { response, text };
}
const facts = await capture('official-gulliste-facts', FACTS);
const caps = await capture('gulliste-wfs-capabilities', url({ REQUEST: 'GetCapabilities' }));
const featuresResponse = await capture('gulliste-kulturmiljo-default-utm32-gml', url({ REQUEST: 'GetFeature', TYPENAMES: 'ms:Kulturmiljo' }));
assert(facts.response.ok && caps.response.ok && featuresResponse.response.ok, `Official request failed: ${facts.response.status}/${caps.response.status}/${featuresResponse.response.status}.`);
const factsText = clean(facts.text).toLowerCase();
assert(factsText.includes('bare to områderegistreringer') && factsText.includes('bygdøy') && factsText.includes('birkelunden'), 'Published Gul liste facts drifted.');
assert(caps.text.includes('ms:Kulturmiljo') && caps.text.includes('EPSG::25832'), 'WFS contract drifted.');
const features = parseFeatures(featuresResponse.text);
assert(features.length >= 2, `Expected at least two Kulturmiljo features, found ${features.length}.`);
const identify = (pattern) => features.filter((f) => pattern.test(JSON.stringify({ id: f.id, properties: f.properties }).toLowerCase()));
const bygdoyMatches = identify(/bygd[oø]y/), birkelundenMatches = identify(/birkelund/);
assert(bygdoyMatches.length === 1 && birkelundenMatches.length === 1, `Identity failed: Bygdøy=${bygdoyMatches.length}, Birkelunden=${birkelundenMatches.length}.`);
const bygdoyUtm = bygdoyMatches[0], bygdoyWgs = { ...bygdoyUtm, geometry: transform(bygdoyUtm.geometry) };
const coverage = anchors.map((p) => ({ ...p, insideOfficialCulturalEnvironment: contains([p.lon, p.lat], bygdoyWgs.geometry) }));
const inside = coverage.filter((p) => p.insideOfficialCulturalEnvironment), outside = coverage.filter((p) => !p.insideOfficialCulturalEnvironment);
const legacyInside = contains([LEGACY.lon, LEGACY.lat], bygdoyWgs.geometry), areaM2 = area(bygdoyUtm.geometry);
let decision = 'official_bygdoy_cultural_environment_is_partial_scope_keep_needs_source';
let nextAction = 'The official Bygdøy cultural-environment polygon omits material parts of the locked peninsula-scale scope. Keep bygdoy_natur unresolved; do not substitute the protected cultural landscape for the whole peninsula.';
if (!outside.length && legacyInside) {
  decision = 'official_gulliste_polygon_matches_locked_peninsula_scope_requires_production_crosscheck';
  nextAction = 'The exact official polygon covers all locked anchors and the legacy marker. Re-fetch it on fresh main and derive an interior area anchor before batch 196.';
}
const summary = {
  version: '2026-07-24', protocolMaxBatch: maxBatch, placeId: PLACE_ID, researchOnly: true, canonicalChanged: false,
  publishedFactsClaimedFeatureCount: 2, liveWfsFeatureCount: features.length, featureCountDrift: features.length !== 2,
  featureSummaries: features.map((f) => ({ id: f.id, properties: f.properties, geometryType: f.geometry.type })),
  officialBygdoy: { featureId: bygdoyUtm.id, properties: bygdoyUtm.properties, areaM2: Number(areaM2.toFixed(2)), bboxWgs84: bbox(bygdoyWgs.geometry), sourceObjectId: `oslo-planinnsyn:GULLISTE:Kulturmiljo:${bygdoyUtm.id}`, transform: 'inverse WGS84 UTM zone 32N' },
  lockedScope: { expectedAnchorCount: anchors.length, insideCount: inside.length, outsideCount: outside.length, legacyMarkerInside: legacyInside, coverage, outsideAnchors: outside },
  decision, nextAction, captures
};
await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`);
await writeFile(`${REPORT_DIR}/all-kulturmiljo-utm32.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features }, null, 2)}\n`);
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-wgs84.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyWgs] }, null, 2)}\n`);
await writeFile(`${REPORT_DIR}/locked-anchor-coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`);
const outsideList = outside.length ? outside.map((p) => `- \`${p.id}\` — ${p.name}`).join('\n') : '- none';
await writeFile(`${REPORT_DIR}/README.md`, `# Bygdøy Gul liste live-scope research after batch 195\n\n- Published facts feature count: **2**\n- Live WFS feature count: **${features.length}**\n- Feature-count drift: **${features.length !== 2}**\n- Bygdøy area: **${Math.round(areaM2)} m²**\n- Locked anchors inside: **${inside.length}/${coverage.length}**\n- Legacy marker inside: **${legacyInside}**\n- Decision: **${decision}**\n\n## Outside anchors\n${outsideList}\n\n${nextAction}\n\nThe Bygdøy feature is selected by its own official properties. The live third feature is retained and reported rather than discarded to fit the older facts page. Geometry is consumed in EPSG:25832 and transformed deterministically before scope testing.\n`);
console.log(JSON.stringify({ status: 'research_complete', reportDir: REPORT_DIR, decision, liveFeatureCount: features.length, featureId: bygdoyUtm.id, areaM2: Number(areaM2.toFixed(2)), inside: inside.length, outside: outside.map((p) => p.id), legacyInside }, null, 2));
