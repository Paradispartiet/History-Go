import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const PLACE_ID = 'bygdoy_natur';
const REPORT_DIR = 'reports/oslo-coordinate-bygdoy-gulliste-scope-research-post-195-v5';
const WFS = 'https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const FACTS = 'https://od2.pbe.oslo.kommune.no/pages/vedlegg/gulliste.html';
const LEGACY = { lat: 59.9048, lon: 10.6849 };
const BYGDOY_IDS = [
  'kon_tiki_museet', 'frammuseet', 'norsk_maritimt_museum', 'norsk_folkemuseum',
  'bygdoy_kongsgard', 'villa_grande', 'oscarshall', 'vikingtidsmuseet',
  'bygdoy_huk', 'bygdoy_paradisbukta'
];
const FILES = {
  protocol: 'docs/coordinates/coordinate-control-protocol.md',
  evidence: 'data/coordinate-evidence/oslo/natur/bygdoy_natur.json',
  index: 'data/places/places_index.json',
  queue: 'reports/oslo-coordinate-unresolved-queue-audit-post-195/summary.json',
  bryn: 'reports/oslo-coordinate-bryn-official-scope-research-post-195/summary.json',
  closure: 'reports/visitoslo-bygdoy-audit-20260721/closure.json'
};

const axisCounts = { northing_easting: 0, easting_northing: 0 };
function assert(value, message) { if (!value) throw new Error(message); }
function sha256(value) { return createHash('sha256').update(value).digest('hex'); }
function clean(value) {
  return String(value ?? '')
    .replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function safe(value) { return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase(); }
function wfsUrl(params) {
  const url = new URL(WFS);
  url.search = new URLSearchParams({ map: 'GULLISTE', SERVICE: 'WFS', VERSION: '2.0.0', ...params }).toString();
  return url.href;
}
function normalizeUtmPair(first, second) {
  const firstLooksNorthing = first > 5_000_000 && first < 8_000_000;
  const secondLooksNorthing = second > 5_000_000 && second < 8_000_000;
  const firstLooksEasting = first > 100_000 && first < 1_000_000;
  const secondLooksEasting = second > 100_000 && second < 1_000_000;
  if (firstLooksNorthing && secondLooksEasting) {
    axisCounts.northing_easting += 1;
    return [second, first];
  }
  if (firstLooksEasting && secondLooksNorthing) {
    axisCounts.easting_northing += 1;
    return [first, second];
  }
  throw new Error(`Unrecognised EPSG:25832 pair ${first},${second}`);
}
function parsePosList(value) {
  const numbers = String(value).trim().split(/\s+/).map(Number);
  assert(numbers.length >= 8 && numbers.length % 2 === 0 && numbers.every(Number.isFinite), 'Invalid GML posList.');
  const points = [];
  for (let i = 0; i < numbers.length; i += 2) points.push(normalizeUtmPair(numbers[i], numbers[i + 1]));
  const first = points[0], last = points.at(-1);
  if (first[0] !== last[0] || first[1] !== last[1]) points.push([...first]);
  return points;
}
function parseRing(block) {
  const match = block.match(/<gml:posList\b[^>]*>([\s\S]*?)<\/gml:posList>/i);
  assert(match, 'GML ring lacks posList.');
  return parsePosList(match[1]);
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
    for (const property of feature[2].matchAll(/<ms:([A-Za-z0-9_]+)\b[^>]*>([^<]*)<\/ms:\1>/gi)) {
      const value = clean(property[2]);
      if (value) properties[property[1]] = value;
    }
    const polygonBodies = [...feature[2].matchAll(/<gml:Polygon\b[^>]*>([\s\S]*?)<\/gml:Polygon>/gi)].map((m) => m[1]);
    assert(polygonBodies.length > 0, 'Kulturmiljo feature lacks polygon geometry.');
    const polygonCoordinates = polygonBodies.map((body) => {
      const exterior = body.match(/<gml:exterior\b[^>]*>([\s\S]*?)<\/gml:exterior>/i);
      assert(exterior, 'Polygon lacks exterior ring.');
      const holes = [...body.matchAll(/<gml:interior\b[^>]*>([\s\S]*?)<\/gml:interior>/gi)].map((m) => parseRing(m[1]));
      return [parseRing(exterior[1]), ...holes];
    });
    return [{
      type: 'Feature',
      id: feature[1].match(/gml:id=["']([^"']+)["']/i)?.[1] ?? null,
      properties,
      geometry: polygonCoordinates.length === 1
        ? { type: 'Polygon', coordinates: polygonCoordinates[0] }
        : { type: 'MultiPolygon', coordinates: polygonCoordinates }
    }];
  });
}
function utm32ToWgs84([easting, northing]) {
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
function transformGeometry(geometry) {
  const convert = (polygon) => polygon.map((ring) => ring.map(utm32ToWgs84));
  return geometry.type === 'Polygon'
    ? { type: 'Polygon', coordinates: convert(geometry.coordinates) }
    : { type: 'MultiPolygon', coordinates: geometry.coordinates.map(convert) };
}
function pointOnSegment(point, a, b, epsilon = 1e-10) {
  const cross = (point[0] - a[0]) * (b[1] - a[1]) - (point[1] - a[1]) * (b[0] - a[0]);
  return Math.abs(cross) <= epsilon
    && point[0] >= Math.min(a[0], b[0]) - epsilon && point[0] <= Math.max(a[0], b[0]) + epsilon
    && point[1] >= Math.min(a[1], b[1]) - epsilon && point[1] <= Math.max(a[1], b[1]) + epsilon;
}
function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    if (pointOnSegment(point, ring[j], ring[i])) return true;
    const intersects = ((ring[i][1] > point[1]) !== (ring[j][1] > point[1]))
      && point[0] < (ring[j][0] - ring[i][0]) * (point[1] - ring[i][1]) / ((ring[j][1] - ring[i][1]) || Number.EPSILON) + ring[i][0];
    if (intersects) inside = !inside;
  }
  return inside;
}
function contains(point, geometry) {
  return polygons(geometry).some((polygon) => pointInRing(point, polygon[0]) && !polygon.slice(1).some((hole) => pointInRing(point, hole)));
}
function ringArea(ring) {
  let total = 0;
  for (let i = 0; i < ring.length - 1; i += 1) total += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return total / 2;
}
function geometryArea(geometry) {
  return polygons(geometry).reduce((total, polygon) => total + Math.max(0,
    Math.abs(ringArea(polygon[0])) - polygon.slice(1).reduce((holes, ring) => holes + Math.abs(ringArea(ring)), 0)), 0);
}
function geometryBbox(geometry) {
  const points = polygons(geometry).flat(2);
  return {
    minLon: Math.min(...points.map((p) => p[0])), minLat: Math.min(...points.map((p) => p[1])),
    maxLon: Math.max(...points.map((p) => p[0])), maxLat: Math.max(...points.map((p) => p[1]))
  };
}

await mkdir(REPORT_DIR, { recursive: true });
const protocol = await readFile(FILES.protocol, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])));
assert(maxBatch === 195 && protocol.includes('| 195 | `frognerstranda` |') && !protocol.includes('| 196 |'), `Protocol gate failed at ${maxBatch}.`);
const [evidence, runtime, queue, bryn, closure] = await Promise.all([
  readFile(FILES.evidence, 'utf8').then(JSON.parse), readFile(FILES.index, 'utf8').then(JSON.parse),
  readFile(FILES.queue, 'utf8').then(JSON.parse), readFile(FILES.bryn, 'utf8').then(JSON.parse),
  readFile(FILES.closure, 'utf8').then(JSON.parse)
]);
assert(evidence.placeId === PLACE_ID && evidence.evidenceStatus === 'needs_research' && evidence.currentCoordinate?.coordStatus === 'needs_source', 'Bygdøy evidence drifted.');
assert(bryn.decision === 'keep_needs_source' && queue.orderedQueue?.[1]?.placeId === PLACE_ID && closure.scopeLocks?.bygdoy === PLACE_ID, 'Queue/scope prerequisites drifted.');
const runtimeById = new Map(runtime.map((place) => [place.id, place]));
const anchors = BYGDOY_IDS.map((id) => {
  const place = runtimeById.get(id);
  assert(place && Number.isFinite(place.lat) && Number.isFinite(place.lon), `Missing locked Bygdøy anchor ${id}.`);
  return { id, name: place.name, lat: place.lat, lon: place.lon, coordStatus: place.coordStatus ?? null, sourceObjectId: place.sourceObjectId ?? null };
});
const kongsgard = runtimeById.get('bygdoy_kongsgard');
const birkelunden = runtimeById.get('birkelunden');
assert(kongsgard && birkelunden, 'Canonical crosswalk anchors are missing.');

const captures = [];
async function capture(label, target) {
  const response = await fetch(target, { headers: { 'user-agent': 'History-Go-coordinate-research/196', accept: 'text/xml,text/html,*/*' } });
  const text = await response.text(), contentType = response.headers.get('content-type') ?? '', extension = /xml/i.test(contentType) ? '.xml' : '.html';
  const file = `${REPORT_DIR}/${safe(label)}${extension}`;
  await writeFile(file, text, 'utf8');
  captures.push({ label, requestedUrl: target, finalUrl: response.url, status: response.status, ok: response.ok, contentType, bytes: Buffer.byteLength(text), sha256: sha256(text), file });
  return { response, text };
}
const facts = await capture('official-gulliste-facts', FACTS);
const capabilities = await capture('gulliste-wfs-capabilities', wfsUrl({ REQUEST: 'GetCapabilities' }));
const featureResponse = await capture('gulliste-kulturmiljo-default-utm32-gml', wfsUrl({ REQUEST: 'GetFeature', TYPENAMES: 'ms:Kulturmiljo' }));
assert(facts.response.ok && capabilities.response.ok && featureResponse.response.ok, `Official request failed: ${facts.response.status}/${capabilities.response.status}/${featureResponse.response.status}.`);
const factsText = clean(facts.text).toLowerCase();
assert(factsText.includes('bare to områderegistreringer') && factsText.includes('bygdøy') && factsText.includes('birkelunden'), 'Published Gul liste facts drifted.');
assert(capabilities.text.includes('ms:Kulturmiljo') && capabilities.text.includes('EPSG::25832'), 'WFS contract drifted.');

const utmFeatures = parseFeatures(featureResponse.text);
assert(utmFeatures.length >= 2, `Expected at least two live Kulturmiljo features, found ${utmFeatures.length}.`);
assert(axisCounts.northing_easting + axisCounts.easting_northing > 0, 'No EPSG:25832 coordinate pairs were parsed.');
const features = utmFeatures.map((feature) => ({ ...feature, wgs84Geometry: transformGeometry(feature.geometry) }));
const bygdoyMatches = features.filter((feature) => contains([kongsgard.lon, kongsgard.lat], feature.wgs84Geometry));
const birkelundenMatches = features.filter((feature) => contains([birkelunden.lon, birkelunden.lat], feature.wgs84Geometry));
assert(bygdoyMatches.length === 1, `Kongsgård containment crosswalk found ${bygdoyMatches.length} candidate features.`);
assert(birkelundenMatches.length === 1, `Birkelunden containment crosswalk found ${birkelundenMatches.length} candidate features.`);
assert(bygdoyMatches[0].id !== birkelundenMatches[0].id, 'Bygdøy and Birkelunden resolved to the same feature after axis normalization.');

const bygdoyFeature = bygdoyMatches[0];
const bygdoyWgs = { type: 'Feature', id: bygdoyFeature.id, properties: bygdoyFeature.properties, geometry: bygdoyFeature.wgs84Geometry };
const coverage = anchors.map((anchor) => ({ ...anchor, insideOfficialCulturalEnvironment: contains([anchor.lon, anchor.lat], bygdoyFeature.wgs84Geometry) }));
const inside = coverage.filter((row) => row.insideOfficialCulturalEnvironment);
const outside = coverage.filter((row) => !row.insideOfficialCulturalEnvironment);
const legacyInside = contains([LEGACY.lon, LEGACY.lat], bygdoyFeature.wgs84Geometry);
const areaM2 = geometryArea(bygdoyFeature.geometry);
const classified = new Set([bygdoyFeature.id, birkelundenMatches[0].id]);
let decision = 'official_bygdoy_cultural_environment_is_partial_scope_keep_needs_source';
let nextAction = 'The official Bygdøy cultural-environment polygon omits material parts of the locked peninsula-scale scope. Keep bygdoy_natur unresolved; do not substitute the protected cultural landscape for the whole peninsula.';
if (outside.length === 0 && legacyInside) {
  decision = 'official_gulliste_polygon_matches_locked_peninsula_scope_requires_production_crosscheck';
  nextAction = 'The exact official polygon covers all locked anchors and the legacy marker. Re-fetch it on fresh main and derive an interior area anchor before batch 196.';
}
const summary = {
  version: '2026-07-24', protocolMaxBatch: maxBatch, placeId: PLACE_ID, researchOnly: true, canonicalChanged: false,
  publishedFactsClaimedFeatureCount: 2, liveWfsFeatureCount: features.length, featureCountDrift: features.length !== 2,
  parsedAxisOrderCounts: axisCounts,
  crosswalkMethod: 'official facts naming plus unique exact containment of canonical Bygdøy kongsgård and Birkelunden anchors; no nearest selection',
  featureSummaries: features.map((feature) => ({
    id: feature.id, properties: feature.properties, geometryType: feature.geometry.type,
    classification: feature.id === bygdoyFeature.id ? 'Bygdøy' : feature.id === birkelundenMatches[0].id ? 'Birkelunden' : 'unclassified_live_feature'
  })),
  officialBygdoy: {
    featureId: bygdoyFeature.id, properties: bygdoyFeature.properties, areaM2: Number(areaM2.toFixed(2)),
    bboxWgs84: geometryBbox(bygdoyFeature.wgs84Geometry),
    sourceObjectId: `oslo-planinnsyn:GULLISTE:Kulturmiljo:${bygdoyFeature.id}`,
    transform: 'axis-normalized EPSG:25832 plus inverse WGS84 UTM zone 32N'
  },
  unclassifiedLiveFeatures: features.filter((feature) => !classified.has(feature.id)).map((feature) => ({
    id: feature.id, properties: feature.properties, geometryType: feature.geometry.type, bboxWgs84: geometryBbox(feature.wgs84Geometry)
  })),
  lockedScope: { expectedAnchorCount: anchors.length, insideCount: inside.length, outsideCount: outside.length, legacyMarkerInside: legacyInside, coverage, outsideAnchors: outside },
  decision, nextAction, captures
};
await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/all-kulturmiljo-utm32.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: utmFeatures }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-wgs84.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyWgs] }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/locked-anchor-coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`, 'utf8');
const outsideList = outside.length ? outside.map((row) => `- \`${row.id}\` — ${row.name}`).join('\n') : '- none';
await writeFile(`${REPORT_DIR}/README.md`, `# Bygdøy Gul liste axis-normalized scope research after batch 195\n\n- Published facts feature count: **2**\n- Live WFS feature count: **${features.length}**\n- Parsed northing/easting pairs: **${axisCounts.northing_easting}**\n- Parsed easting/northing pairs: **${axisCounts.easting_northing}**\n- Unclassified live features: **${features.length - 2}**\n- Bygdøy area: **${Math.round(areaM2)} m²**\n- Locked anchors inside: **${inside.length}/${coverage.length}**\n- Legacy marker inside: **${legacyInside}**\n- Decision: **${decision}**\n\n## Outside anchors\n${outsideList}\n\n${nextAction}\n\nEvery EPSG:25832 coordinate pair is normalized from its numeric ranges before transformation. Bygdøy and Birkelunden are crosswalked by unique exact containment of canonical anchors; no nearest-object method is used.\n`, 'utf8');
console.log(JSON.stringify({ status: 'research_complete', reportDir: REPORT_DIR, decision, axisCounts, liveFeatureCount: features.length, bygdoyFeatureId: bygdoyFeature.id, areaM2: Number(areaM2.toFixed(2)), inside: inside.length, outside: outside.map((row) => row.id), legacyInside }, null, 2));
