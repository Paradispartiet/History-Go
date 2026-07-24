import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PLACE_ID = 'frognerstranda';
const EXPECTED_MAX_BATCH = 194;
const OSM_WAY_ID = 71423688;
const REPORT_DIR = 'reports/oslo-coordinate-frognerstranda-footway-topology-post-194';
const PINNED_SCOPE_REPORT_URL = 'https://raw.githubusercontent.com/Paradispartiet/History-Go/9ec8ac5d2ca00b8ac4b67fca8331f2f84f012174/reports/oslo-coordinate-frognerstranda-scope-research-post-194/summary.json';
const OFFICIAL_URL = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/';
const BYLEKSIKON_URL = 'https://oslobyleksikon.no/side/Frognerstranda';
const OSM_API = 'https://api.openstreetmap.org/api/0.6';
const LEGACY = { lat: 59.9129, lon: 10.7098 };

mkdirSync(REPORT_DIR, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function maxProtocolBatch() {
  const text = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
  const batches = [...text.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
  return Math.max(...batches);
}

function toRad(value) {
  return value * Math.PI / 180;
}

function distanceMeters(a, b) {
  const R = 6371008.8;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distanceMeters(points[i - 1], points[i]);
  return total;
}

function lineMidpoint(points) {
  const total = lineLength(points);
  const target = total / 2;
  let walked = 0;
  for (let i = 1; i < points.length; i += 1) {
    const segment = distanceMeters(points[i - 1], points[i]);
    if (walked + segment >= target) {
      const ratio = segment === 0 ? 0 : (target - walked) / segment;
      return {
        lat: points[i - 1].lat + (points[i].lat - points[i - 1].lat) * ratio,
        lon: points[i - 1].lon + (points[i].lon - points[i - 1].lon) * ratio,
      };
    }
    walked += segment;
  }
  return points.at(-1);
}

function normalizeHtml(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&aring;|&#229;/gi, 'å')
    .replace(/&oslash;|&#248;/gi, 'ø')
    .replace(/&aelig;|&#230;/gi, 'æ')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'user-agent': 'History-Go coordinate topology research/1.0',
          accept: '*/*',
          ...(options.headers || {}),
        },
        signal: AbortSignal.timeout(90000),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
      return { text, status: response.status, contentType: response.headers.get('content-type') || '', url };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1400 * attempt));
    }
  }
  throw lastError;
}

async function fetchJson(url, options = {}, attempts = 3) {
  const result = await fetchText(url, { ...options, headers: { accept: 'application/json', ...(options.headers || {}) } }, attempts);
  return { ...result, json: JSON.parse(result.text) };
}

function geometryFromFull(full, wayId) {
  const elements = Array.isArray(full?.elements) ? full.elements : [];
  const way = elements.find((element) => element.type === 'way' && Number(element.id) === Number(wayId));
  assert(way, `Missing way ${wayId} in OSM full response.`);
  const nodeMap = new Map(elements.filter((element) => element.type === 'node').map((node) => [Number(node.id), node]));
  const geometry = (way.nodes || []).map((nodeId) => {
    const node = nodeMap.get(Number(nodeId));
    assert(node && Number.isFinite(Number(node.lat)) && Number.isFinite(Number(node.lon)), `Missing node ${nodeId} geometry for way ${wayId}.`);
    return { nodeId: Number(nodeId), lat: Number(node.lat), lon: Number(node.lon) };
  });
  return { way, geometry };
}

function summarizeFull(full, wayId) {
  const { way, geometry } = geometryFromFull(full, wayId);
  const points = geometry.map(({ lat, lon }) => ({ lat, lon }));
  return {
    osmObjectId: `osm-way:${wayId}`,
    id: Number(wayId),
    tags: way.tags || {},
    nodeCount: geometry.length,
    lengthMeters: Number(lineLength(points).toFixed(2)),
    midpoint: lineMidpoint(points),
    firstNode: geometry[0],
    lastNode: geometry.at(-1),
    geometry,
  };
}

function isPedestrianWay(way) {
  const highway = String(way?.tags?.highway || '');
  return /^(footway|cycleway|path|pedestrian)$/.test(highway) || way?.tags?.footway === 'promenade';
}

async function fetchConnectedWaySummaries(nodeId) {
  const waysResponse = await fetchJson(`${OSM_API}/node/${nodeId}/ways.json`);
  const ways = (waysResponse.json?.elements || [])
    .filter((element) => element.type === 'way' && Number(element.id) !== OSM_WAY_ID)
    .filter((element) => isPedestrianWay(element) || /Frognerstranda|Frognerkilen|Skarpsno|Sjølyst|Filipstad|Framnes|Hjortnes/i.test(`${element.tags?.name || ''} ${element.tags?.ref || ''}`))
    .slice(0, 25);
  const summaries = [];
  for (const way of ways) {
    try {
      const full = await fetchJson(`${OSM_API}/way/${way.id}/full.json`, {}, 2);
      const summary = summarizeFull(full.json, way.id);
      const endpointNodeIds = [summary.firstNode.nodeId, summary.lastNode.nodeId];
      summaries.push({
        ...summary,
        sharesEndpoint: endpointNodeIds.includes(Number(nodeId)),
        sharedNodeId: Number(nodeId),
      });
    } catch (error) {
      summaries.push({ id: Number(way.id), tags: way.tags || {}, sharedNodeId: Number(nodeId), error: String(error) });
    }
  }
  return { nodeId: Number(nodeId), rawWayCount: (waysResponse.json?.elements || []).filter((element) => element.type === 'way').length, summaries };
}

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '8');
  url.searchParams.set('countrycodes', 'no');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('q', `${query} Oslo`);
  const response = await fetchJson(url.href);
  return (response.json || []).map((row) => ({
    query,
    osmType: row.osm_type || null,
    osmId: row.osm_id || null,
    displayName: row.display_name || null,
    category: row.category || null,
    type: row.type || null,
    lat: Number(row.lat),
    lon: Number(row.lon),
  })).filter((row) => Number.isFinite(row.lat) && Number.isFinite(row.lon));
}

const protocolMax = maxProtocolBatch();
assert(protocolMax === EXPECTED_MAX_BATCH, `Coordinate sequence changed: expected ${EXPECTED_MAX_BATCH}, found ${protocolMax}`);
const activePlace = JSON.parse(readFileSync('data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json', 'utf8'));
assert(activePlace.id === PLACE_ID && activePlace.coordStatus === 'needs_source', 'Frognerstranda active state changed before topology research.');

const [scopeReportResponse, officialResponse, byleksikonResponse, exactWayResponse, relationResponse] = await Promise.all([
  fetchJson(PINNED_SCOPE_REPORT_URL),
  fetchText(OFFICIAL_URL),
  fetchText(BYLEKSIKON_URL),
  fetchJson(`${OSM_API}/way/${OSM_WAY_ID}/full.json`),
  fetchJson(`${OSM_API}/way/${OSM_WAY_ID}/relations.json`),
]);
writeFileSync(`${REPORT_DIR}/pinned-scope-summary.json`, `${JSON.stringify(scopeReportResponse.json, null, 2)}\n`, 'utf8');
writeFileSync(`${REPORT_DIR}/oslo-kommune-frognerstranda.html`, officialResponse.text, 'utf8');
writeFileSync(`${REPORT_DIR}/oslo-byleksikon-frognerstranda.html`, byleksikonResponse.text, 'utf8');
writeFileSync(`${REPORT_DIR}/osm-way-${OSM_WAY_ID}-full.json`, exactWayResponse.text, 'utf8');
writeFileSync(`${REPORT_DIR}/osm-way-${OSM_WAY_ID}-relations.json`, relationResponse.text, 'utf8');

const pinned = scopeReportResponse.json;
assert(pinned?.placeId === PLACE_ID, 'Pinned scope report placeId mismatch.');
assert(pinned?.coordinateMaxBatch === EXPECTED_MAX_BATCH, 'Pinned scope report batch mismatch.');
assert(pinned?.officialSources?.kartverketExactNameCount === 1, 'Pinned Kartverket exact-name count changed.');
assert(pinned?.officialSources?.officialToponymTypes?.[0]?.navneobjekttype === 'Adressenavn', 'Pinned Kartverket type is not Adressenavn.');
assert(pinned?.nominatim?.exactGeometry?.some((row) => Number(row.osmId) === OSM_WAY_ID && row.geojsonType === 'LineString'), 'Pinned exact Nominatim LineString is missing.');

const exactWay = summarizeFull(exactWayResponse.json, OSM_WAY_ID);
assert(exactWay.tags?.name === 'Frognerstranda', `Unexpected exact-way name=${exactWay.tags?.name}`);
assert(exactWay.tags?.highway === 'footway', `Unexpected exact-way highway=${exactWay.tags?.highway}`);
assert(exactWay.nodeCount === 41, `Unexpected exact-way node count=${exactWay.nodeCount}`);
assert(Math.abs(exactWay.lengthMeters - 918.4) <= 2, `Exact-way length drifted: ${exactWay.lengthMeters}`);

const eastEndpoint = exactWay.firstNode.lon >= exactWay.lastNode.lon ? exactWay.firstNode : exactWay.lastNode;
const westEndpoint = exactWay.firstNode.lon < exactWay.lastNode.lon ? exactWay.firstNode : exactWay.lastNode;
const [eastConnected, westConnected] = await Promise.all([
  fetchConnectedWaySummaries(eastEndpoint.nodeId),
  fetchConnectedWaySummaries(westEndpoint.nodeId),
]);
writeFileSync(`${REPORT_DIR}/endpoint-connected-ways.json`, `${JSON.stringify({ eastEndpoint, westEndpoint, eastConnected, westConnected }, null, 2)}\n`, 'utf8');

const anchorQueries = ['Frognerkilen', 'Bygdøy', 'Hjortnes', 'Framnes', 'Filipstad', 'Sjølystveien'];
const anchorResults = [];
for (const query of anchorQueries) {
  anchorResults.push(...await nominatimSearch(query));
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
writeFileSync(`${REPORT_DIR}/scope-anchor-searches.json`, `${JSON.stringify(anchorResults, null, 2)}\n`, 'utf8');

function nearestAnchor(endpoint, queryNames) {
  const candidates = anchorResults.filter((row) => queryNames.includes(row.query));
  const measured = candidates.map((row) => ({ ...row, distanceMeters: Number(distanceMeters(endpoint, row).toFixed(2)) })).sort((a, b) => a.distanceMeters - b.distanceMeters);
  return measured[0] || null;
}

const officialText = normalizeHtml(officialResponse.text);
const byleksikonText = normalizeHtml(byleksikonResponse.text);
const sourceChecks = {
  officialDefinesWestEastScope: /innerste delen av Frognerkilen og Bygdøy i vest, til Hjortnes\/?Framnes i øst/i.test(officialText),
  officialCallsItShoreline: /Frognerstranda er en strandlinje sør i bydel Frogner/i.test(officialText),
  officialMentionsPedestrianCycleMotorwayRail: /gang- og sykkelveier, motorvei \(E18\) og togskinner/i.test(officialText),
  officialPlansHarbourPromenade: /havnepromenaden.*hovedsykkelveien.*Frognerstranda/i.test(officialText),
  byleksikonDefinesFilipstadToSjolystveien: /fra Filipstad til Sjølystveien/i.test(byleksikonText),
  byleksikonDefinesOuterPromenade: /Ytre del av veien er anlagt som strandpromenade, med gang- og sykkelvei mot Frognerkilen/i.test(byleksikonText),
  byleksikonDefinesInnerE18: /Indre del er fra 1959 firefelts vei, del av E 18/i.test(byleksikonText),
};

const westScopeAnchor = nearestAnchor(westEndpoint, ['Frognerkilen', 'Bygdøy', 'Sjølystveien']);
const eastScopeAnchor = nearestAnchor(eastEndpoint, ['Hjortnes', 'Framnes', 'Filipstad']);
const relationMemberships = (relationResponse.json?.elements || []).filter((element) => element.type === 'relation').map((relation) => ({
  id: Number(relation.id),
  osmObjectId: `osm-relation:${relation.id}`,
  tags: relation.tags || {},
}));

const eastContinuation = eastConnected.summaries.filter((way) => way.sharesEndpoint && isPedestrianWay(way));
const westContinuation = westConnected.summaries.filter((way) => way.sharesEndpoint && isPedestrianWay(way));
const broadScopeCovered = Boolean(westScopeAnchor && eastScopeAnchor && westScopeAnchor.distanceMeters <= 250 && eastScopeAnchor.distanceMeters <= 250);
const exactPromenadeIdentitySupported = exactWay.tags.highway === 'footway'
  && exactWay.tags.name === 'Frognerstranda'
  && sourceChecks.officialCallsItShoreline
  && sourceChecks.officialMentionsPedestrianCycleMotorwayRail
  && sourceChecks.byleksikonDefinesOuterPromenade;

let decision = 'keep_blocked';
let proposedModel = null;
let reason = 'The exact named footway cannot yet be reconciled with the documented Frognerstranda scope.';
if (exactPromenadeIdentitySupported && !broadScopeCovered) {
  decision = 'exact_named_strandpromenade_segment_supports_identity_narrowing';
  proposedModel = {
    canonicalName: 'Frognerstranda – strandpromenaden',
    locatorType: 'route',
    sourceProvider: 'osm',
    sourceObjectId: `osm-way:${OSM_WAY_ID}`,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'line_anchor',
    coordType: 'named_waterfront_footway_midpoint',
    coordinate: exactWay.midpoint,
    lengthMeters: exactWay.lengthMeters,
    endpointAnchors: [westEndpoint, eastEndpoint],
    contentScope: 'The exact public footway is the physical anchor; the wider Frognerstranda shoreline, E18, railway and planned harbour promenade remain contextual layers.',
  };
  reason = 'The exact 918.4 m public footway is explicitly named Frognerstranda and matches the documented outer strandpromenade, but it does not cover the full municipal Frognerkilen–Hjortnes/Framnes corridor. Production is supportable only with explicit identity narrowing to the strandpromenade segment.';
} else if (exactPromenadeIdentitySupported && broadScopeCovered) {
  decision = 'exact_named_footway_covers_documented_scope';
  proposedModel = {
    canonicalName: 'Frognerstranda',
    locatorType: 'route',
    sourceProvider: 'osm',
    sourceObjectId: `osm-way:${OSM_WAY_ID}`,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'line_anchor',
    coordType: 'named_waterfront_footway_midpoint',
    coordinate: exactWay.midpoint,
    lengthMeters: exactWay.lengthMeters,
    endpointAnchors: [westEndpoint, eastEndpoint],
  };
  reason = 'The exact named public footway aligns with both documented scope endpoints and can represent Frognerstranda as a linear waterfront route.';
}

const summary = {
  version: '2026-07-24',
  placeId: PLACE_ID,
  coordinateMaxBatch: protocolMax,
  pinnedScopeReport: PINNED_SCOPE_REPORT_URL,
  sourceChecks,
  exactWay,
  eastEndpoint,
  westEndpoint,
  eastConnected,
  westConnected,
  eastContinuation,
  westContinuation,
  relationMemberships,
  scopeAnchors: {
    west: westScopeAnchor,
    east: eastScopeAnchor,
    broadScopeCovered,
  },
  legacyDistanceToMidpointMeters: Number(distanceMeters(LEGACY, exactWay.midpoint).toFixed(2)),
  exactPromenadeIdentitySupported,
  decision,
  proposedModel,
  reason,
  nextAction: proposedModel
    ? 'Run a fresh production batch only with the explicit identity and content-scope constraints recorded here.'
    : 'Keep the place unresolved and obtain official line geometry or a documented multi-segment corridor model.',
};
writeFileSync(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
writeFileSync(`${REPORT_DIR}/README.md`, `# Frognerstranda footway topology and scope\n\nDate: 2026-07-24\n\n- exact OSM object: osm-way:${OSM_WAY_ID}\n- type: ${exactWay.tags.highway}\n- nodes: ${exactWay.nodeCount}\n- length: ${exactWay.lengthMeters} m\n- deterministic midpoint: ${exactWay.midpoint.lat}, ${exactWay.midpoint.lon}\n- east endpoint connected pedestrian ways: ${eastContinuation.length}\n- west endpoint connected pedestrian ways: ${westContinuation.length}\n- west scope-anchor distance: ${westScopeAnchor?.distanceMeters ?? 'n/a'} m\n- east scope-anchor distance: ${eastScopeAnchor?.distanceMeters ?? 'n/a'} m\n- broad municipal scope covered: ${broadScopeCovered}\n\nDecision: **${decision}**\n\n${reason}\n\n${summary.nextAction}\n`, 'utf8');

console.log(JSON.stringify({ reportDir: REPORT_DIR, decision, midpoint: exactWay.midpoint, lengthMeters: exactWay.lengthMeters, broadScopeCovered }, null, 2));
