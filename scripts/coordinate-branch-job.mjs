import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DATE = '2026-07-24';
const PLACE_ID = 'bygdoy_natur';
const REPORT_DIR = 'reports/oslo-coordinate-bygdoy-gulliste-scope-research-post-195';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/natur/bygdoy_natur.json';
const INDEX_PATH = 'data/places/places_index.json';
const QUEUE_PATH = 'reports/oslo-coordinate-unresolved-queue-audit-post-195/summary.json';
const BRYN_REPORT_PATH = 'reports/oslo-coordinate-bryn-official-scope-research-post-195/summary.json';
const BYGDOY_CLOSURE_PATH = 'reports/visitoslo-bygdoy-audit-20260721/closure.json';
const FACTS_URL = 'https://od2.pbe.oslo.kommune.no/pages/vedlegg/gulliste.html';
const PLANINNSYN_URL = 'https://od2.pbe.oslo.kommune.no/kart/?mode=gulliste';
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

function parseJsonMaybe(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&aring;', 'å')
    .replaceAll('&oslash;', 'ø')
    .replaceAll('&aelig;', 'æ')
    .replaceAll('&quot;', '"')
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
  const [x, y] = point;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const cross = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
  if (Math.abs(cross) > epsilon) return false;
  return x >= Math.min(x1, x2) - epsilon && x <= Math.max(x1, x2) + epsilon
    && y >= Math.min(y1, y2) - epsilon && y <= Math.max(y1, y2) + epsilon;
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
  for (const polygon of geometryPolygons(geometry)) {
    if (!polygon.length || !pointInRing(point, polygon[0])) continue;
    if (polygon.slice(1).some((hole) => pointInRing(point, hole))) continue;
    return true;
  }
  return false;
}

function ringSignedArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return sum / 2;
}

function geometryAreaProjected(geometry) {
  return geometryPolygons(geometry).reduce((total, polygon) => {
    if (!polygon.length) return total;
    const outer = Math.abs(ringSignedArea(polygon[0]));
    const holes = polygon.slice(1).reduce((sum, ring) => sum + Math.abs(ringSignedArea(ring)), 0);
    return total + Math.max(0, outer - holes);
  }, 0);
}

function geometryBbox(geometry) {
  const points = geometryPolygons(geometry).flat(2);
  assert(points.length > 0, 'Geometry has no polygon coordinates.');
  return {
    minLon: Math.min(...points.map((point) => point[0])),
    minLat: Math.min(...points.map((point) => point[1])),
    maxLon: Math.max(...points.map((point) => point[0])),
    maxLat: Math.max(...points.map((point) => point[1]))
  };
}

function makeWfsUrl(params) {
  const url = new URL(WFS_BASE);
  url.search = new URLSearchParams({ map: 'GULLISTE', SERVICE: 'WFS', VERSION: '2.0.0', ...params }).toString();
  return url.href;
}

await mkdir(REPORT_DIR, { recursive: true });

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batchNumbers);
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
assert(evidence.placeId === PLACE_ID, `Unexpected evidence placeId ${evidence.placeId}`);
assert(evidence.evidenceStatus === 'needs_research', `Bygdøy evidence status drifted: ${evidence.evidenceStatus}`);
assert(evidence.currentCoordinate?.coordStatus === 'needs_source', `Bygdøy coordinate status drifted: ${evidence.currentCoordinate?.coordStatus}`);
assert(evidence.identity?.identityStatus === 'resolved', `Bygdøy identity status drifted: ${evidence.identity?.identityStatus}`);
assert(brynReport.decision === 'keep_needs_source', `Bryn research is no longer exhausted: ${brynReport.decision}`);
assert(queueAudit.orderedQueue?.[0]?.placeId === 'bryn_industriomrade', 'Post-195 queue head drifted.');
assert(queueAudit.orderedQueue?.[1]?.placeId === PLACE_ID, `Bygdøy is no longer second in the post-195 queue: ${queueAudit.orderedQueue?.[1]?.placeId}`);
assert(closure.scopeLocks?.bygdoy === PLACE_ID, 'VisitOSLO Bygdøy scope lock drifted.');

const runtimeById = new Map(runtime.map((place) => [place.id, place]));
const anchorPlaces = EXPECTED_ANCHOR_IDS.map((id) => {
  const place = runtimeById.get(id);
  assert(place, `Missing locked Bygdøy anchor ${id} in runtime index.`);
  assert(Number.isFinite(place.lat) && Number.isFinite(place.lon), `Invalid coordinates for locked Bygdøy anchor ${id}.`);
  return { id, name: place.name, lat: place.lat, lon: place.lon, coordStatus: place.coordStatus ?? null, sourceObjectId: place.sourceObjectId ?? null };
});

const captures = [];
async function fetchCapture(label, url) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; History-Go-coordinate-research/196; +https://github.com/Paradispartiet/History-Go)',
        accept: 'application/json,application/geo+json,text/xml,text/html,text/plain,*/*',
        'accept-language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.6'
      }
    });
    const text = await response.text();
    const contentType = response.headers.get('content-type') ?? '';
    const extension = /json/i.test(contentType) || parseJsonMaybe(text) ? '.json' : /xml/i.test(contentType) ? '.xml' : /html/i.test(contentType) ? '.html' : '.txt';
    const reportFile = `${REPORT_DIR}/${safeName(label)}${extension}`;
    await writeFile(reportFile, text, 'utf8');
    const row = { label, requestedUrl: url, finalUrl: response.url, status: response.status, ok: response.ok, contentType, bytes: Buffer.byteLength(text), sha256: sha256(text), reportFile, text, json: parseJsonMaybe(text) };
    captures.push(row);
    return row;
  } catch (error) {
    const row = { label, requestedUrl: url, status: null, ok: false, error: String(error), bytes: 0, text: '', json: null, reportFile: null };
    captures.push(row);
    return row;
  }
}

const facts = await fetchCapture('official-gulliste-facts', FACTS_URL);
const planinnsyn = await fetchCapture('official-planinnsyn-gulliste', PLANINNSYN_URL);
const capabilities = await fetchCapture('gulliste-wfs-capabilities', makeWfsUrl({ REQUEST: 'GetCapabilities' }));
const describe = await fetchCapture('gulliste-wfs-kulturmiljo-describe', makeWfsUrl({ REQUEST: 'DescribeFeatureType', TYPENAMES: 'ms:Kulturmiljo' }));

assert(facts.ok, `Official Gul liste facts returned HTTP ${facts.status}.`);
const factsNormalized = normalizeText(facts.text).toLowerCase();
assert(factsNormalized.includes('bare to områderegistreringer'), 'Official facts no longer state that Gul liste has two cultural-environment areas.');
assert(factsNormalized.includes('bygdøy') && factsNormalized.includes('birkelunden'), 'Official facts no longer identify both Bygdøy and Birkelunden cultural environments.');
assert(capabilities.ok && capabilities.text.includes('ms:Kulturmiljo'), 'GULLISTE WFS no longer exposes ms:Kulturmiljo.');

async function fetchGeoJson(label, srsName) {
  const formats = ['geojson', 'application/json', 'application/vnd.geo+json'];
  const attempts = [];
  for (const outputFormat of formats) {
    const capture = await fetchCapture(`${label}-${safeName(outputFormat)}`, makeWfsUrl({
      REQUEST: 'GetFeature',
      TYPENAMES: 'ms:Kulturmiljo',
      OUTPUTFORMAT: outputFormat,
      SRSNAME: srsName
    }));
    attempts.push(capture);
    if (capture.json?.type === 'FeatureCollection' && Array.isArray(capture.json.features)) return { capture, attempts };
  }
  return { capture: null, attempts };
}

const wgsResult = await fetchGeoJson('gulliste-kulturmiljo-wgs84', 'EPSG:4326');
const utmResult = await fetchGeoJson('gulliste-kulturmiljo-utm32', 'EPSG:25832');
assert(wgsResult.capture, 'Could not retrieve Gul liste Kulturmiljo as GeoJSON in EPSG:4326.');
assert(utmResult.capture, 'Could not retrieve Gul liste Kulturmiljo as GeoJSON in EPSG:25832.');

const wgsFeatures = wgsResult.capture.json.features;
const utmFeatures = utmResult.capture.json.features;
assert(wgsFeatures.length === 2, `Expected exactly two official Kulturmiljo features, found ${wgsFeatures.length}.`);
assert(utmFeatures.length === 2, `Expected exactly two projected Kulturmiljo features, found ${utmFeatures.length}.`);

const bygdoyWgsMatches = wgsFeatures.filter((feature) => /bygd[oø]y/.test(featureText(feature)));
const birkelundenWgsMatches = wgsFeatures.filter((feature) => /birkelund/.test(featureText(feature)));
const bygdoyUtmMatches = utmFeatures.filter((feature) => /bygd[oø]y/.test(featureText(feature)));
assert(bygdoyWgsMatches.length === 1, `Expected one property-identified Bygdøy Kulturmiljo feature, found ${bygdoyWgsMatches.length}.`);
assert(birkelundenWgsMatches.length === 1, `Expected one property-identified Birkelunden Kulturmiljo feature, found ${birkelundenWgsMatches.length}.`);
assert(bygdoyUtmMatches.length === 1, `Expected one projected Bygdøy Kulturmiljo feature, found ${bygdoyUtmMatches.length}.`);

const bygdoyWgs = bygdoyWgsMatches[0];
const bygdoyUtm = bygdoyUtmMatches[0];
assert(['Polygon', 'MultiPolygon'].includes(bygdoyWgs.geometry?.type), `Unexpected Bygdøy geometry type ${bygdoyWgs.geometry?.type}.`);
assert(['Polygon', 'MultiPolygon'].includes(bygdoyUtm.geometry?.type), `Unexpected projected Bygdøy geometry type ${bygdoyUtm.geometry?.type}.`);

const coverage = anchorPlaces.map((anchor) => ({
  ...anchor,
  insideOfficialCulturalEnvironment: pointInGeometry([anchor.lon, anchor.lat], bygdoyWgs.geometry)
}));
const insideAnchors = coverage.filter((row) => row.insideOfficialCulturalEnvironment);
const outsideAnchors = coverage.filter((row) => !row.insideOfficialCulturalEnvironment);
const legacyInside = pointInGeometry([LEGACY_POINT.lon, LEGACY_POINT.lat], bygdoyWgs.geometry);
const areaM2 = geometryAreaProjected(bygdoyUtm.geometry);
const bbox = geometryBbox(bygdoyWgs.geometry);

let decision = 'official_bygdoy_cultural_environment_is_partial_scope_keep_needs_source';
let nextAction = 'The official Bygdøy cultural-environment polygon does not cover the full locked peninsula-scale canonical scope. Keep bygdoy_natur unresolved; do not substitute the protected cultural landscape for the whole peninsula.';
if (outsideAnchors.length === 0 && legacyInside) {
  decision = 'official_gulliste_polygon_matches_locked_peninsula_scope_requires_production_crosscheck';
  nextAction = 'The official Bygdøy cultural-environment polygon covers every locked Bygdøy anchor and the legacy marker. Re-fetch the exact feature on fresh main, verify identity fields and derive a deterministic interior area anchor before any batch 196 production.';
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
    featureSummaries: wgsFeatures.map((feature) => ({ id: feature.id ?? null, properties: feature.properties ?? {}, geometryType: feature.geometry?.type ?? null })),
    bygdoyFeatureId: bygdoyWgs.id ?? null,
    bygdoyProperties: bygdoyWgs.properties ?? {},
    bygdoyGeometryType: bygdoyWgs.geometry.type,
    bygdoyAreaM2: Number(areaM2.toFixed(2)),
    bygdoyBboxWgs84: bbox,
    sourceObjectId: `oslo-planinnsyn:GULLISTE:Kulturmiljo:${bygdoyWgs.id ?? 'bygdoy'}`
  },
  lockedScope: {
    expectedAnchorCount: EXPECTED_ANCHOR_IDS.length,
    anchorsFound: anchorPlaces.length,
    insideCount: insideAnchors.length,
    outsideCount: outsideAnchors.length,
    legacyMarkerInside: legacyInside,
    coverage,
    outsideAnchors
  },
  decision,
  nextAction,
  captures: captures.map(({ text, json, ...row }) => row)
};

await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-wgs84.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyWgs] }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/bygdoy-kulturmiljo-utm32.geojson`, `${JSON.stringify({ type: 'FeatureCollection', features: [bygdoyUtm] }, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/locked-anchor-coverage.json`, `${JSON.stringify(coverage, null, 2)}\n`, 'utf8');

const outsideList = outsideAnchors.length ? outsideAnchors.map((row) => `- \`${row.id}\` — ${row.name}`).join('\n') : '- none';
const readme = `# Bygdøy Gul liste cultural-environment scope research after batch 195\n\n- Research only: **yes**\n- Canonical/evidence/protocol data changed: **no**\n- Official Kulturmiljo features: **${wgsFeatures.length}**\n- Bygdøy polygon area: **${Number(areaM2.toFixed(0)).toLocaleString('nb-NO')} m²**\n- Locked Bygdøy anchors inside: **${insideAnchors.length}/${coverage.length}**\n- Legacy marker inside: **${legacyInside}**\n- Decision: **${decision}**\n\n## Locked anchors outside the official polygon\n\n${outsideList}\n\n${nextAction}\n\nThe exact Bygdøy feature is selected by its own official properties, never by nearest geometry. The polygon is evaluated against the ten canonical places locked by the closed VisitOSLO Bygdøy scope audit. A protected cultural-environment area is not silently treated as the whole peninsula if it omits material parts of that scope.\n`;
await writeFile(`${REPORT_DIR}/README.md`, readme, 'utf8');

console.log(JSON.stringify({
  status: 'research_complete',
  reportDir: REPORT_DIR,
  decision,
  featureId: bygdoyWgs.id ?? null,
  areaM2: Number(areaM2.toFixed(2)),
  insideAnchors: insideAnchors.length,
  outsideAnchors: outsideAnchors.map((row) => row.id),
  legacyInside
}, null, 2));
