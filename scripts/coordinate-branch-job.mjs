import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DATE = '2026-07-24';
const PLACE_ID = 'bygdoy_natur';
const REPORT_DIR = 'reports/oslo-coordinate-bygdoy-gulliste-scope-research-post-195-v2';
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
  'kon_tiki_museet',
  'frammuseet',
  'norsk_maritimt_museum',
  'norsk_folkemuseum',
  'bygdoy_kongsgard',
  'villa_grande',
  'oscarshall',
  'vikingtidsmuseet',
  'bygdoy_huk',
  'bygdoy_paradisbukta'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function safeName(value) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function decodeXml(value) {
  return String(value ?? '')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&#248;', 'ø')
    .replaceAll('&#216;', 'Ø')
    .replaceAll('&#229;', 'å')
    .replaceAll('&#197;', 'Å')
    .replaceAll('&#230;', 'æ')
    .replaceAll('&#198;', 'Æ');
}

function normalizeText(value) {
  return decodeXml(String(value ?? ''))
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&aring;', 'å')
    .replaceAll('&oslash;', 'ø')
    .replaceAll('&aelig;', 'æ')
    .replace(/\s+/g, ' ')
    .trim();
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

function parseCoordinateList(text, srsName) {
  const numbers = String(text).trim().split(/\s+/).map(Number);
  assert(numbers.length >= 8 && numbers.length % 2 === 0, `Invalid GML coordinate count ${numbers.length}.`);
  const points = [];
  for (let index = 0; index < numbers.length; index += 2) {
    const first = numbers[index];
    const second = numbers[index + 1];
    assert(Number.isFinite(first) && Number.isFinite(second), 'GML coordinate contains non-finite values.');
    if (srsName === 'EPSG:4326' && Math.abs(first) > 20 && Math.abs(second) < 30) points.push([second, first]);
    else points.push([first, second]);
  }
  const first = points[0];
  const last = points.at(-1);
  if (first[0] !== last[0] || first[1] !== last[1]) points.push([...first]);
  return points;
}

function firstPosList(block, srsName) {
  const match = String(block).match(/<gml:posList\b[^>]*>([\s\S]*?)<\/gml:posList>/i);
  assert(match, 'GML ring has no gml:posList.');
  return parseCoordinateList(match[1], srsName);
}

function parseGmlFeatures(xml, srsName) {
  const memberBodies = [
    ...[...String(xml).matchAll(/<wfs:member\b[^>]*>([\s\S]*?)<\/wfs:member>/gi)].map((match) => match[1]),
    ...[...String(xml).matchAll(/<gml:featureMember\b[^>]*>([\s\S]*?)<\/gml:featureMember>/gi)].map((match) => match[1])
  ];
  const features = [];
  for (const member of memberBodies) {
    const featureMatch = member.match(/<ms:Kulturmiljo\b([^>]*)>([\s\S]*?)<\/ms:Kulturmiljo>/i);
    if (!featureMatch) continue;
    const attributes = featureMatch[1];
    const body = featureMatch[2];
    const id = attributes.match(/gml:id=["']([^"']+)["']/i)?.[1] ?? null;
    const properties = {};
    for (const match of body.matchAll(/<ms:([A-Za-z0-9_]+)\b[^>]*>([^<]*)<\/ms:\1>/gi)) {
      const key = match[1];
      const value = normalizeText(match[2]);
      if (value) properties[key] = value;
    }
    const polygons = [];
    for (const polygonMatch of body.matchAll(/<gml:Polygon\b[^>]*>([\s\S]*?)<\/gml:Polygon>/gi)) {
      const polygonBody = polygonMatch[1];
      const exterior = polygonBody.match(/<gml:exterior\b[^>]*>([\s\S]*?)<\/gml:exterior>/i);
      assert(exterior, `Feature ${id ?? '?'} polygon lacks exterior ring.`);
      const rings = [firstPosList(exterior[1], srsName)];
      for (const interior of polygonBody.matchAll(/<gml:interior\b[^>]*>([\s\S]*?)<\/gml:interior>/gi)) {
        rings.push(firstPosList(interior[1], srsName));
      }
      polygons.push(rings);
    }
    assert(polygons.length > 0, `Feature ${id ?? '?'} has no GML polygons.`);
    features.push({
      type: 'Feature',
      id,
      properties,
      geometry: polygons.length === 1
        ? { type: 'Polygon', coordinates: polygons[0] }
        : { type: 'MultiPolygon', coordinates: polygons }
    });
  }
  return features;
}

function featureText(feature) {
  return JSON.stringify({ id: feature?.id, properties: feature?.properties ?? {} }).toLowerCase();
}

function geometryPolygons(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function pointOnSegment(point, a, b, epsilon = 1e-10) {
  const cross = (point[0] - a[0]) * (b[1] - a[1]) - (point[1] - a[1]) * (b[0] - a[0]);
  if (Math.abs(cross) > epsilon) return false;
  return point[0] >= Math.min(a[0], b[0]) - epsilon && point[0] <= Math.max(a[0], b[0]) + epsilon
    && point[1] >= Math.min(a[1], b[1]) - epsilon && point[1] <= Math.max(a[1], b[1]) + epsilon;
}

function pointInRing(point, ring) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const a = ring[previous];
    const b = ring[index];
    if (pointOnSegment(point, a, b)) return true;
    const intersects = ((b[1] > point[1]) !== (a[1] > point[1]))
      && point[0] < (a[0] - b[0]) * (point[1] - b[1]) / ((a[1] - b[1]) || Number.EPSILON) + b[0];
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInGeometry(point, geometry) {
  return geometryPolygons(geometry).some((polygon) => {
    if (!polygon.length || !pointInRing(point, polygon[0])) return false;
    return !polygon.slice(1).some((hole) => pointInRing(point, hole));
  });
}

function ringSignedArea(ring) {
  let sum = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    sum += ring[index][0] * ring[index + 1][1] - ring[index + 1][0] * ring[index][1];
  }
  return sum / 2;
}

function geometryAreaProjected(geometry) {
  return geometryPolygons(geometry).reduce((total, polygon) => {
    const outer = Math.abs(ringSignedArea(polygon[0]));
    const holes = polygon.slice(1).reduce((sum, ring) => sum + Math.abs(ringSignedArea(ring)), 0);
    return total + Math.max(0, outer - holes);
  }, 0);
}

function geometryBbox(geometry) {
  const points = geometryPolygons(geometry).flat(2);
  return {
    minLon: Math.min(...points.map((point) => point[0])),
    minLat: Math.min(...points.map((point) => point[1])),
    maxLon: Math.max(...points.map((point) => point[0])),
    maxLat: Math.max(...points.map((point) => point[1]))
  };
}

await mkdir(REPORT_DIR, { recursive: true });

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1])));
assert(maxBatch === 195, `Bygdøy research hard gate failed: protocol max batch ${maxBatch}, expected 195.`);
assert(protocol.includes('| 195 | `frognerstranda` |'), 'Batch 195 row is missing.');
assert(!protocol.includes('| 196 |'), 'Batch 196 already exists; replay from fresh main.');

const [evidence, runtime, queueAudit, brynReport, closure] = await Promise.all([
  readFile(EVIDENCE_PATH, 'utf8').then(JSON.parse),
  readFile(INDEX_PATH, 'utf8').then(JSON.parse),
  readFile(QUEUE_PATH, 'utf8').then(JSON.parse),
  readFile(BRYN_REPORT_PATH, 'utf8').then(JSON.parse),
  readFile(BYGDOY_CLOSURE_PATH, 'utf8').then(JSON.parse)
]);
assert(evidence.placeId === PLACE_ID && evidence.evidenceStatus === 'needs_research', 'Bygdøy evidence is no longer research-pending.');
assert(evidence.currentCoordinate?.coordStatus === 'needs_source', 'Bygdøy coordinate status drifted.');
assert(brynReport.decision === 'keep_needs_source', 'Bryn research no longer has its merged blocking decision.');
assert(queueAudit.orderedQueue?.[1]?.placeId === PLACE_ID, 'Bygdøy is no longer second in the post-195 queue.');
assert(closure.scopeLocks?.bygdoy === PLACE_ID, 'VisitOSLO Bygdøy scope lock drifted.');

const runtimeById = new Map(runtime.map((place) => [place.id, place]));
const anchorPlaces = EXPECTED_ANCHOR_IDS.map((id) => {
  const place = runtimeById.get(id);
  assert(place && Number.isFinite(place.lat) && Number.isFinite(place.lon), `Missing or invalid locked Bygdøy anchor ${id}.`);
  return { id, name: place.name, lat: place.lat, lon: place.lon, coordStatus: place.coordStatus ?? null, sourceObjectId: place.sourceObjectId ?? null };
});

const captures = [];
async function fetchCapture(label, url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; History-Go-coordinate-research/196; +https://github.com/Paradispartiet/History-Go)',
      accept: 'text/xml,text/html,text/plain,*/*',
      'accept-language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.6'
    }
  });
  const text = await response.text();
  const contentType = response.headers.get('content-type') ?? '';
  const extension = /xml/i.test(contentType) ? '.xml' : /html/i.test(contentType) ? '.html' : '.txt';
  const reportFile = `${REPORT_DIR}/${safeName(label)}${extension}`;
  await writeFile(reportFile, text, 'utf8');
  const row = { label, requestedUrl: url, finalUrl: response.url, status: response.status, ok: response.ok, contentType, bytes: Buffer.byteLength(text), sha256: sha256(text), reportFile, text };
  captures.push(row);
  return row;
}

const facts = await fetchCapture('official-gulliste-facts', FACTS_URL);
const capabilities = await fetchCapture('gulliste-wfs-capabilities', makeWfsUrl({ REQUEST: 'GetCapabilities' }));
const describe = await fetchCapture('gulliste-wfs-kulturmiljo-describe', makeWfsUrl({ REQUEST: 'DescribeFeatureType', TYPENAMES: 'ms:Kulturmiljo' }));
const wgsCapture = await fetchCapture('gulliste-kulturmiljo-wgs84-gml', makeWfsUrl({
  REQUEST: 'GetFeature',
  TYPENAMES: 'ms:Kulturmiljo',
  OUTPUTFORMAT: 'text/xml; subtype=gml/3.2.1',
  SRSNAME: 'EPSG:4326'
}));
const utmCapture = await fetchCapture('gulliste-kulturmiljo-utm32-gml', makeWfsUrl({
  REQUEST: 'GetFeature',
  TYPENAMES: 'ms:Kulturmiljo',
  OUTPUTFORMAT: 'text/xml; subtype=gml/3.2.1',
  SRSNAME: 'EPSG:25832'
}));

assert(facts.ok, `Official Gul liste facts returned HTTP ${facts.status}.`);
const factsText = normalizeText(facts.text).toLowerCase();
assert(factsText.includes('bare to områderegistreringer') && factsText.includes('bygdøy') && factsText.includes('birkelunden'), 'Official facts no longer document the two cultural environments.');
assert(capabilities.ok && capabilities.text.includes('ms:Kulturmiljo'), 'GULLISTE WFS no longer exposes ms:Kulturmiljo.');
assert(describe.ok, `DescribeFeatureType returned HTTP ${describe.status}.`);
assert(wgsCapture.ok, `WGS84 GetFeature returned HTTP ${wgsCapture.status}.`);
assert(utmCapture.ok, `UTM32 GetFeature returned HTTP ${utmCapture.status}.`);

const wgsFeatures = parseGmlFeatures(wgsCapture.text, 'EPSG:4326');
const utmFeatures = parseGmlFeatures(utmCapture.text, 'EPSG:25832');
assert(wgsFeatures.length === 2, `Expected exactly two WGS84 Kulturmiljo features, found ${wgsFeatures.length}.`);
assert(utmFeatures.length === 2, `Expected exactly two UTM32 Kulturmiljo features, found ${utmFeatures.length}.`);

const bygdoyWgsMatches = wgsFeatures.filter((feature) => /bygd[oø]y/.test(featureText(feature)));
const birkelundenMatches = wgsFeatures.filter((feature) => /birkelund/.test(featureText(feature)));
const bygdoyUtmMatches = utmFeatures.filter((feature) => /bygd[oø]y/.test(featureText(feature)));
assert(bygdoyWgsMatches.length === 1, `Expected one property-identified Bygdøy feature, found ${bygdoyWgsMatches.length}.`);
assert(birkelundenMatches.length === 1, `Expected one property-identified Birkelunden feature, found ${birkelundenMatches.length}.`);
assert(bygdoyUtmMatches.length === 1, `Expected one projected Bygdøy feature, found ${bygdoyUtmMatches.length}.`);

const bygdoyWgs = bygdoyWgsMatches[0];
const bygdoyUtm = bygdoyUtmMatches[0];
const coverage = anchorPlaces.map((anchor) => ({ ...anchor, insideOfficialCulturalEnvironment: pointInGeometry([anchor.lon, anchor.lat], bygdoyWgs.geometry) }));
const insideAnchors = coverage.filter((row) => row.insideOfficialCulturalEnvironment);
const outsideAnchors = coverage.filter((row) => !row.insideOfficialCulturalEnvironment);
const legacyInside = pointInGeometry([LEGACY_POINT.lon, LEGACY_POINT.lat], bygdoyWgs.geometry);
const areaM2 = geometryAreaProjected(bygdoyUtm.geometry);
const bbox = geometryBbox(bygdoyWgs.geometry);

let decision = 'official_bygdoy_cultural_environment_is_partial_scope_keep_needs_source';
let nextAction = 'The official Bygdøy cultural-environment polygon does not cover the full locked peninsula-scale canonical scope. Keep bygdoy_natur unresolved; do not substitute the protected cultural landscape for the whole peninsula.';
if (outsideAnchors.length === 0 && legacyInside) {
  decision = 'official_gulliste_polygon_matches_locked_peninsula_scope_requires_production_crosscheck';
  nextAction = 'The official Bygdøy cultural-environment polygon covers every locked Bygdøy anchor and the legacy marker. Re-fetch the feature on fresh main and derive a deterministic interior area anchor before any batch 196 production.';
}

const summary = {
  version: DATE,
  protocolMaxBatch: maxBatch,
  placeId: PLACE_ID,
  researchOnly: true,
  canonicalChanged: false,
  hardGates: {
    batch195Present: true,
    batch196Absent: true,
    brynResearchExhausted: true,
    bygdoySecondInQueue: true,
    evidenceStillUnresolved: true,
    visitOsloScopeLockPresent: true
  },
  officialFacts: {
    sourceUrl: FACTS_URL,
    status: facts.status,
    snippets: snippets(facts.text, ['bare to områderegistreringer', 'Bygdøy', 'Birkelunden', 'Kulturmiljø'])
  },
  officialWfs: {
    service: 'Oslo kommune Planinnsyn GULLISTE WFS',
    featureType: 'ms:Kulturmiljo',
    featureCount: wgsFeatures.length,
    featureSummaries: wgsFeatures.map((feature) => ({ id: feature.id, properties: feature.properties, geometryType: feature.geometry.type })),
    bygdoyFeatureId: bygdoyWgs.id,
    bygdoyProperties: bygdoyWgs.properties,
    bygdoyGeometryType: bygdoyWgs.geometry.type,
    bygdoyAreaM2: Number(areaM2.toFixed(2)),
    bygdoyBboxWgs84: bbox,
    sourceObjectId: `oslo-planinnsyn:GULLISTE:Kulturmiljo:${bygdoyWgs.id ?? 'bygdoy'}`
  },
  lockedScope: {
    expectedAnchorCount: EXPECTED_ANCHOR_IDS.length,
    insideCount: insideAnchors.length,
    outsideCount: outsideAnchors.length,
    legacyMarkerInside: legacyInside,
    coverage,
    outsideAnchors
  },
  decision,
  nextAction,
  captures: captures.map(({ text, ...row }) => row)
};

await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-wgs84.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyWgs] }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-utm32.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyUtm] }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/locked-anchor-coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`, 'utf8');

const outsideList = outsideAnchors.length ? outsideAnchors.map((row) => `- \`${row.id}\` — ${row.name}`).join('\n') : '- none';
const readme = `# Bygdøy Gul liste GML scope research after batch 195\n\n- Research only: **yes**\n- Canonical/evidence/protocol data changed: **no**\n- Official Kulturmiljo features: **${wgsFeatures.length}**\n- Bygdøy polygon area: **${Math.round(areaM2)} m²**\n- Locked Bygdøy anchors inside: **${insideAnchors.length}/${coverage.length}**\n- Legacy marker inside: **${legacyInside}**\n- Decision: **${decision}**\n\n## Locked anchors outside the official polygon\n\n${outsideList}\n\n${nextAction}\n\nThe exact Bygdøy feature is selected by official feature properties, never by nearest geometry. GML axis order is normalized explicitly. The polygon is tested against all ten canonical places locked by the VisitOSLO Bygdøy scope audit.\n`;
await writeFile(`${REPORT_DIR}/README.md`, readme, 'utf8');

console.log(JSON.stringify({
  status: 'research_complete',
  reportDir: REPORT_DIR,
  decision,
  featureId: bygdoyWgs.id,
  areaM2: Number(areaM2.toFixed(2)),
  insideAnchors: insideAnchors.length,
  outsideAnchors: outsideAnchors.map((row) => row.id),
  legacyInside
}, null, 2));
