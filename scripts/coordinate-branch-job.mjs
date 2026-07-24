import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const PLACE_ID = 'frognerstranda';
const EXPECTED_BATCH = 194;
const REPORT_DATE = '2026-07-24';
const OFFICIAL_PAGE = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/';
const OFFICIAL_PLAN_PDF = 'https://www.oslo.kommune.no/get-file/110171/0a6e3b4d4b7b9620f2135bbe14163a5f704b922607261a4275d6f5a20bf07fc6';
const BBOX = { south: 59.900, west: 10.686, north: 59.923, east: 10.728 };
const reportDir = join(root, 'reports/oslo-coordinate-frognerstranda-linear-scope-research-post-194');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&aring;|&#229;/gi, 'å')
    .replace(/&oslash;|&#248;/gi, 'ø')
    .replace(/&aelig;|&#230;/gi, 'æ')
    .replace(/&Aring;|&#197;/g, 'Å')
    .replace(/&Oslash;|&#216;/g, 'Ø')
    .replace(/&AElig;|&#198;/g, 'Æ')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;|&#38;/gi, '&')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—');
}

function visibleText(html) {
  return decodeEntities(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function headers(accept = 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8') {
  return {
    'user-agent': 'History-Go-coordinate-control/1.0 (+https://github.com/Paradispartiet/History-Go)',
    'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
    accept,
  };
}

async function fetchCapture(url, accept) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: headers(accept),
  });
  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    requestedUrl: url,
    finalUrl: response.url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    bytes,
    text: bytes.toString('utf8'),
  };
}

function absoluteLinks(html, baseUrl, tag = null) {
  const regex = tag === 'script'
    ? /<script[^>]+src=["']([^"']+)["']/gi
    : /(?:href|src)=["']([^"']+)["']/gi;
  const links = new Set();
  for (const match of html.matchAll(regex)) {
    try {
      links.add(new URL(decodeEntities(match[1]), baseUrl).href);
    } catch {}
  }
  return [...links];
}

function mapSignals(text) {
  const folded = text.toLowerCase();
  const needles = [
    'frognerstranda', 'frognerkilen', 'hjortnes', 'framnes',
    'geojson', 'featureserver', 'mapserver', 'arcgis', 'wfs', 'wms',
    'leaflet', 'openlayers', 'mapbox', 'coordinates', 'latitude', 'longitude',
  ];
  const hits = [];
  for (const needle of needles) {
    let cursor = 0;
    while ((cursor = folded.indexOf(needle, cursor)) >= 0 && hits.length < 250) {
      hits.push({ needle, snippet: text.slice(Math.max(0, cursor - 180), cursor + needle.length + 360) });
      cursor += needle.length;
    }
  }
  const urls = [...new Set(
    [...text.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+/g)]
      .map((match) => match[0].replaceAll('\\/', '/'))
      .filter((url) => /map|geo|arcgis|feature|wfs|wms|fjord|api/i.test(url)),
  )].slice(0, 250);
  return { hits, urls };
}

function normalizeName(value) {
  return String(value ?? '').toLocaleLowerCase('nb-NO').replace(/[^a-z0-9æøå]+/g, ' ').trim();
}

function geometryOf(element) {
  if (Array.isArray(element.geometry) && element.geometry.length > 0) {
    return element.geometry.map(({ lat, lon }) => ({ lat, lon }));
  }
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return [{ lat: element.lat, lon: element.lon }];
  if (Number.isFinite(element.center?.lat) && Number.isFinite(element.center?.lon)) return [element.center];
  return [];
}

function haversineMeters(a, b) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

function lineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversineMeters(points[i - 1], points[i]);
  return total;
}

function summarizeElement(element) {
  const geometry = geometryOf(element);
  const center = element.center ?? (geometry.length === 1 ? geometry[0] : geometry.length > 1 ? {
    lat: geometry.reduce((sum, point) => sum + point.lat, 0) / geometry.length,
    lon: geometry.reduce((sum, point) => sum + point.lon, 0) / geometry.length,
  } : null);
  return {
    type: element.type,
    id: element.id,
    sourceObjectId: `osm-${element.type}:${element.id}`,
    tags: element.tags ?? {},
    center,
    first: geometry[0] ?? null,
    last: geometry.at(-1) ?? null,
    geometryPointCount: geometry.length,
    lengthM: geometry.length > 1 ? Number(lineLength(geometry).toFixed(2)) : null,
  };
}

function exactName(element, names) {
  const name = normalizeName(element.tags?.name);
  return names.some((candidate) => name === normalizeName(candidate));
}

function resultCenter(result) {
  return { lat: Number(result.lat), lon: Number(result.lon) };
}

function nearest(point, rows) {
  return rows
    .map((row) => ({ row, distanceM: haversineMeters(point, row.center ?? resultCenter(row)) }))
    .sort((a, b) => a.distanceM - b.distanceM)[0] ?? null;
}

const protocol = await readFile(join(root, 'docs/coordinates/coordinate-control-protocol.md'), 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batches) === EXPECTED_BATCH, `Expected protocol max batch ${EXPECTED_BATCH}.`);
assert(protocol.includes('| 194 | `regjeringskvartalet` |'), 'Protocol lacks batch 194 Regjeringskvartalet.');

const centralAudit = await readJson(join(root, 'reports/oslo-coordinate-central-unresolved-audit-post-194/summary.json'));
assert(centralAudit.coordinateMaxBatch === EXPECTED_BATCH, 'Central audit is not post-194.');
const auditRow = centralAudit.centralRows?.find((row) => row.placeId === PLACE_ID);
assert(auditRow?.productionReadiness === 'needs_source_or_scope', 'Frognerstranda central-audit state changed.');

const evidence = await readJson(join(root, 'data/coordinate-evidence/oslo/popkultur/frognerstranda.json'));
assert(evidence.placeId === PLACE_ID, 'Unexpected Frognerstranda evidence file.');
assert(evidence.evidenceStatus === 'needs_research' && evidence.coordinateDecision === 'needs_geometry', 'Frognerstranda evidence state changed.');
assert((evidence.requiredEvidence ?? []).some((text) => text.includes('flere kildebelagte strand-/promenadeankre')), 'Frognerstranda multi-anchor requirement changed.');

const place = await readJson(join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json'));
assert(place.id === PLACE_ID && place.coordStatus === 'needs_source', 'Frognerstranda canonical state changed.');
assert(Math.abs(place.lat - 59.9129) < 1e-10 && Math.abs(place.lon - 10.7098) < 1e-10, 'Frognerstranda legacy coordinate changed.');

await mkdir(join(reportDir, 'responses'), { recursive: true });

const official = await fetchCapture(OFFICIAL_PAGE);
assert(official.ok, `Official Frognerstranda page failed ${official.status}.`);
const officialText = visibleText(official.text);
const officialChecks = {
  title: officialText.includes('Frognerstranda'),
  west: officialText.includes('den innerste delen av Frognerkilen og Bygdøy i vest'),
  east: officialText.includes('Hjortnes/Framnes i øst'),
  shoreline: officialText.includes('Frognerstranda er en strandlinje'),
  westernSubarea: officialText.includes('vestligste delområdet av Fjordbyen'),
  pedestrianCycle: officialText.includes('gang- og sykkelveier'),
  harbourPromenade: officialText.toLocaleLowerCase('nb-NO').includes('havnepromenaden'),
};
assert(Object.values(officialChecks).every(Boolean), `Official scope hard gate failed: ${JSON.stringify(officialChecks)}.`);
await writeFile(join(reportDir, 'responses/official-frognerstranda-page.html'), official.bytes);

const pageLinks = absoluteLinks(official.text, official.finalUrl);
const pageScripts = absoluteLinks(official.text, official.finalUrl, 'script');
const pageSignals = mapSignals(official.text);
const scriptReports = [];
for (const [index, url] of pageScripts.slice(0, 40).entries()) {
  const capture = await fetchCapture(url, 'text/javascript,application/javascript,text/plain,*/*');
  const signals = mapSignals(capture.text);
  const responseFile = signals.hits.length || signals.urls.length ? `responses/script-${String(index).padStart(2, '0')}.txt` : null;
  scriptReports.push({ url, status: capture.status, contentType: capture.contentType, bytes: capture.bytes.length, signals, responseFile });
  if (responseFile) await writeFile(join(reportDir, responseFile), capture.bytes);
}

const planPdf = await fetchCapture(OFFICIAL_PLAN_PDF, 'application/pdf,*/*');
assert(planPdf.ok && /pdf/i.test(planPdf.contentType ?? ''), `Official Fjordbyplan PDF failed ${planPdf.status} ${planPdf.contentType}.`);
await writeFile(join(reportDir, 'responses/fjordbyplan-2008.pdf'), planPdf.bytes);

const overpassQuery = `[out:json][timeout:180];\n(\n  nwr["name"~"Frognerstranda|Frognerkilen|Hjortnes|Framnes|Bygdøy",i](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});\n  way["highway"~"footway|cycleway|path|pedestrian"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});\n  way["natural"="coastline"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});\n  relation["route"~"foot|bicycle"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});\n);\nout tags center geom;`;
const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
const overpass = await fetchCapture(overpassUrl, 'application/json');
assert(overpass.ok, `Overpass failed ${overpass.status}.`);
const overpassPayload = JSON.parse(overpass.text);
await writeJson(join(reportDir, 'overpass-raw.json'), overpassPayload);

const elements = (overpassPayload.elements ?? []).map(summarizeElement);
const exactFrognerstranda = elements.filter((element) => exactName(element, ['Frognerstranda']));
const westNamed = elements.filter((element) => exactName(element, ['Frognerkilen', 'Bygdøy']));
const eastNamed = elements.filter((element) => exactName(element, ['Hjortnes', 'Framnes']));
const coastlineWays = elements.filter((element) => element.tags?.natural === 'coastline');
const pedestrianWays = elements.filter((element) => /^(footway|cycleway|path|pedestrian)$/.test(element.tags?.highway ?? ''));

const queries = [
  'Frognerstranda, Oslo, Norway',
  'Frognerkilen, Oslo, Norway',
  'Bygdøy, Oslo, Norway',
  'Hjortnes, Oslo, Norway',
  'Framnes, Oslo, Norway',
];
const nominatimRuns = [];
for (const query of queries) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=20&polygon_geojson=1&addressdetails=1&namedetails=1&viewbox=${BBOX.west},${BBOX.north},${BBOX.east},${BBOX.south}&bounded=1`;
  const capture = await fetchCapture(url, 'application/json');
  assert(capture.ok, `Nominatim failed ${capture.status}: ${query}.`);
  nominatimRuns.push({ query, url, results: JSON.parse(capture.text) });
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
await writeJson(join(reportDir, 'nominatim.json'), { queryRuns: nominatimRuns });

const exactNominatim = nominatimRuns.find((run) => run.query.startsWith('Frognerstranda'))?.results ?? [];
const westCandidates = nominatimRuns
  .filter((run) => /Frognerkilen|Bygdøy/.test(run.query))
  .flatMap((run) => run.results.map((result) => ({ ...result, query: run.query, center: resultCenter(result) })));
const eastCandidates = nominatimRuns
  .filter((run) => /Hjortnes|Framnes/.test(run.query))
  .flatMap((run) => run.results.map((result) => ({ ...result, query: run.query, center: resultCenter(result) })));

const namedLines = exactFrognerstranda.filter((element) => element.geometryPointCount > 1).map((element) => ({
  ...element,
  nearestWestFromFirst: element.first && westCandidates.length ? nearest(element.first, westCandidates) : null,
  nearestWestFromLast: element.last && westCandidates.length ? nearest(element.last, westCandidates) : null,
  nearestEastFromFirst: element.first && eastCandidates.length ? nearest(element.first, eastCandidates) : null,
  nearestEastFromLast: element.last && eastCandidates.length ? nearest(element.last, eastCandidates) : null,
}));

const exactNamedLineCoversOfficialScope = namedLines.some((line) => {
  const westDistance = Math.min(line.nearestWestFromFirst?.distanceM ?? Infinity, line.nearestWestFromLast?.distanceM ?? Infinity);
  const eastDistance = Math.min(line.nearestEastFromFirst?.distanceM ?? Infinity, line.nearestEastFromLast?.distanceM ?? Infinity);
  return westDistance <= 150 && eastDistance <= 150;
});

const machineGeometrySignals = [...new Set([
  ...pageSignals.urls,
  ...scriptReports.flatMap((report) => report.signals.urls),
])];
const officialMachineGeometryFound = machineGeometrySignals.some((url) => /FeatureServer|MapServer|geojson|wfs/i.test(url));
const canBuildMultiAnchorModel = westCandidates.length > 0
  && eastCandidates.length > 0
  && (coastlineWays.length > 0 || pedestrianWays.length > 0)
  && !exactNamedLineCoversOfficialScope;

const decision = officialMachineGeometryFound
  ? 'official_machine_geometry_signal_requires_endpoint_followup'
  : exactNamedLineCoversOfficialScope
    ? 'exact_named_line_candidate_covers_official_scope'
    : canBuildMultiAnchorModel
      ? 'multi_anchor_linear_model_requires_semantic_chain_research'
      : 'keep_needs_source';
const nextAction = officialMachineGeometryFound
  ? 'Follow the official map service and isolate the exact Frognerstranda subarea geometry before production.'
  : exactNamedLineCoversOfficialScope
    ? 'Hard-gate the exact named line against both official endpoints before production.'
    : canBuildMultiAnchorModel
      ? 'Build and verify one ordered west–middle–east shoreline/promenade chain; the western named footway alone is insufficient.'
      : 'Retain needs_source because no official geometry or unambiguous endpoint chain is available.';

const summary = {
  version: REPORT_DATE,
  placeId: PLACE_ID,
  coordinateMaxBatch: EXPECTED_BATCH,
  canonicalBefore: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordType: place.coordType,
    locatorType: place.locatorType,
  },
  officialScope: {
    sourceUrl: OFFICIAL_PAGE,
    checks: officialChecks,
    interpretation: 'linear_coastal_zone',
    westBoundary: 'inner Frognerkilen and Bygdøy',
    eastBoundary: 'Hjortnes/Framnes',
    parentContext: 'westernmost Fjordbyen subarea',
    rejectedSingleProxies: ['E18 road', 'railway', 'arbitrary coastline way', 'western Frognerstranda footway alone'],
  },
  officialPage: {
    status: official.status,
    finalUrl: official.finalUrl,
    contentType: official.contentType,
    sha256: sha256(official.bytes),
    pageLinks,
    pageScripts,
    pageSignals,
    scriptReports,
    machineGeometrySignals,
    officialMachineGeometryFound,
  },
  officialPlanPdf: {
    url: OFFICIAL_PLAN_PDF,
    status: planPdf.status,
    contentType: planPdf.contentType,
    bytes: planPdf.bytes.length,
    sha256: sha256(planPdf.bytes),
    finding: 'The adopted 2008 Fjordbyplan overview map shows Frognerstranda as a distinct elongated western subarea adjoining Filipstad.',
  },
  osmInventory: {
    bbox: BBOX,
    elementCount: elements.length,
    exactFrognerstranda,
    westNamed,
    eastNamed,
    coastlineWayCount: coastlineWays.length,
    pedestrianWayCount: pedestrianWays.length,
    namedLines,
    exactNamedLineCoversOfficialScope,
  },
  nominatim: {
    exactFrognerstranda: exactNominatim,
    westBoundaryCandidates: westCandidates,
    eastBoundaryCandidates: eastCandidates,
  },
  canBuildMultiAnchorModel,
  canPromoteNow: decision === 'exact_named_line_candidate_covers_official_scope',
  decision,
  nextAction,
};
await writeJson(join(reportDir, 'summary.json'), summary);

const readme = [
  '# Frognerstranda linear scope and geometry research after batch 194',
  '',
  `Date: ${REPORT_DATE}`,
  '',
  '- official scope: inner Frognerkilen/Bygdøy → Hjortnes/Framnes',
  '- official interpretation: linear coastal zone',
  `- exact named OSM Frognerstranda objects: ${exactFrognerstranda.length}`,
  `- official machine-geometry signals: ${machineGeometrySignals.length}`,
  `- west boundary candidates: ${westCandidates.length}`,
  `- east boundary candidates: ${eastCandidates.length}`,
  `- exact named line covers official scope: ${exactNamedLineCoversOfficialScope}`,
  `- multi-anchor model worth follow-up: ${canBuildMultiAnchorModel}`,
  '',
  `Decision: **${decision}**`,
  '',
  nextAction,
  '',
  'No canonical place, coordinate, evidence or protocol data changed in this research PR.',
  '',
].join('\n');
await writeFile(join(reportDir, 'README.md'), `${readme}\n`, 'utf8');

console.log(JSON.stringify({
  placeId: PLACE_ID,
  coordinateMaxBatch: EXPECTED_BATCH,
  officialChecks,
  exactFrognerstrandaCount: exactFrognerstranda.length,
  officialMachineGeometryFound,
  exactNamedLineCoversOfficialScope,
  canBuildMultiAnchorModel,
  decision,
  nextAction,
}, null, 2));
