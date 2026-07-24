import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DATE = '2026-07-24';
const PLACE_ID = 'sigrid_undset_statue';
const REJECTED_OSM_NODE = 7596280553;
const REPORT_DIR = 'reports/oslo-coordinate-sigrid-undset-art-collection-research-post-195';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json';
const PLACE_PATH = 'data/places/litteratur/oslo/places_litteratur.json';

const OFFICIAL_COLLECTION_HOME = 'https://www.kunstsamlingen.no/';
const OFFICIAL_COLLECTION_OBJECTS = 'https://okk.kunstsamlingen.no/objects';
const OFFICIAL_OSLO_IDENTITY = 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/';
const LEGACY_POINT = { lat: 59.9242, lon: 10.7297 };
const STENSPARKEN_BBOX = { south: 59.9208, west: 10.7245, north: 59.9295, east: 10.7445 };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function safeName(value) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function contentExtension(contentType, url) {
  if (/json/i.test(contentType)) return '.json';
  if (/javascript/i.test(contentType) || /\.js(?:\?|$)/i.test(url)) return '.js';
  if (/html/i.test(contentType)) return '.html';
  return '.txt';
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&aring;', 'å')
    .replaceAll('&oslash;', 'ø')
    .replaceAll('&aelig;', 'æ')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function snippets(text, needles, radius = 280) {
  const lower = text.toLowerCase();
  const rows = [];
  for (const needle of needles) {
    let from = 0;
    while (true) {
      const index = lower.indexOf(needle.toLowerCase(), from);
      if (index < 0) break;
      rows.push({
        needle,
        snippet: normalizeText(text.slice(Math.max(0, index - radius), Math.min(text.length, index + needle.length + radius)))
      });
      from = index + needle.length;
      if (rows.length >= 40) return rows;
    }
  }
  return rows;
}

function extractScriptUrls(html, baseUrl) {
  const out = new Set();
  for (const match of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
    try {
      out.add(new URL(match[1], baseUrl).href);
    } catch {}
  }
  return [...out];
}

function extractEndpointHints(text, baseUrl) {
  const candidates = new Set();
  for (const match of text.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=%-]+/g)) {
    const raw = match[0].replaceAll('\\/', '/');
    if (/(api|graphql|object|search|collection|kunst)/i.test(raw)) candidates.add(raw.slice(0, 500));
  }
  for (const match of text.matchAll(/["'`](\/(?:api|graphql|objects?|search)[^"'`\s]{0,240})["'`]/gi)) {
    try {
      candidates.add(new URL(match[1].replaceAll('\\/', '/'), baseUrl).href);
    } catch {}
  }
  return [...candidates].slice(0, 100);
}

function parseJsonMaybe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function candidateFromObject(value, path = '$') {
  if (!value || typeof value !== 'object') return [];
  const out = [];
  const queue = [{ value, path }];
  while (queue.length) {
    const current = queue.shift();
    const object = current.value;
    if (!object || typeof object !== 'object') continue;
    const raw = JSON.stringify(object);
    const lower = raw.toLowerCase();
    if (
      lower.includes('sigrid') &&
      lower.includes('undset') &&
      (lower.includes('stensparken') || lower.includes('fagerborg') || lower.includes('wexelsen') || lower.includes('goksøyr') || lower.includes('goksoyr'))
    ) {
      const lat = Number(object.lat ?? object.latitude ?? object.y ?? object?.coordinates?.lat);
      const lon = Number(object.lon ?? object.lng ?? object.longitude ?? object.x ?? object?.coordinates?.lon ?? object?.coordinates?.lng);
      out.push({
        path: current.path,
        id: object.id ?? object.objectId ?? object.identifier ?? object.uuid ?? null,
        title: object.title ?? object.name ?? object.objectName ?? null,
        artist: object.artist ?? object.creator ?? object.author ?? null,
        location: object.location ?? object.place ?? object.address ?? null,
        lat: Number.isFinite(lat) && Math.abs(lat) <= 90 ? lat : null,
        lon: Number.isFinite(lon) && Math.abs(lon) <= 180 ? lon : null,
        rawSnippet: raw.slice(0, 3000)
      });
    }
    if (Array.isArray(object)) {
      object.forEach((child, index) => queue.push({ value: child, path: `${current.path}[${index}]` }));
    } else {
      for (const [key, child] of Object.entries(object)) {
        if (child && typeof child === 'object') queue.push({ value: child, path: `${current.path}.${key}` });
      }
    }
  }
  return out;
}

function haversineM(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const radius = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

await mkdir(REPORT_DIR, { recursive: true });

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const protocolBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...protocolBatches);
assert(maxBatch === 195, `Research hard gate failed: protocol max batch is ${maxBatch}, expected 195.`);
assert(protocol.includes('| 195 | `frognerstranda` |'), 'Batch 195 Frognerstranda protocol row is missing.');
assert(!protocol.includes('| 196 |'), 'Batch 196 already exists; research must be replayed from fresh main.');

const evidenceRaw = await readFile(EVIDENCE_PATH, 'utf8');
const evidence = JSON.parse(evidenceRaw);
assert(evidence.placeId === PLACE_ID, `Unexpected evidence placeId ${evidence.placeId}`);
assert(evidence.evidenceStatus === 'needs_research', `Evidence is no longer research-pending: ${evidence.evidenceStatus}`);
assert(evidence.currentCoordinate?.coordStatus === 'needs_source', `Canonical status changed: ${evidence.currentCoordinate?.coordStatus}`);
assert(
  evidence.evidence?.some((row) => row?.sourceObjectId === `osm-node:${REJECTED_OSM_NODE}` && row?.canVerifyCoordinate === false),
  'Explicit rejection of OSM node 7596280553 is missing.'
);

const placePayload = JSON.parse(await readFile(PLACE_PATH, 'utf8'));
const places = Array.isArray(placePayload) ? placePayload : placePayload.places;
const place = places.find((row) => row?.id === PLACE_ID);
assert(place, `Missing ${PLACE_ID} in ${PLACE_PATH}`);
assert(place.lat === LEGACY_POINT.lat && place.lon === LEGACY_POINT.lon, 'Legacy marker drifted before research.');
assert(place.coordStatus === 'needs_source', `Place status drifted: ${place.coordStatus}`);

const captures = [];
async function fetchCapture(label, url, options = {}) {
  const startedAt = new Date().toISOString();
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; History-Go-coordinate-research/196; +https://github.com/Paradispartiet/History-Go)',
        accept: 'text/html,application/xhtml+xml,application/json,text/plain,*/*',
        'accept-language': 'nb-NO,nb;q=0.9,no;q=0.8,en;q=0.6',
        ...options.headers
      },
      ...options
    });
    const text = await response.text();
    const contentType = response.headers.get('content-type') ?? '';
    const fileName = `${safeName(label)}${contentExtension(contentType, response.url || url)}`;
    await writeFile(`${REPORT_DIR}/${fileName}`, text, 'utf8');
    const row = {
      label,
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      contentType,
      bytes: Buffer.byteLength(text),
      sha256: sha256(text),
      startedAt,
      file: `${REPORT_DIR}/${fileName}`,
      text,
      json: parseJsonMaybe(text)
    };
    captures.push(row);
    return row;
  } catch (error) {
    const row = {
      label,
      requestedUrl: url,
      finalUrl: null,
      status: null,
      ok: false,
      contentType: null,
      bytes: 0,
      sha256: null,
      startedAt,
      error: String(error),
      file: null,
      text: '',
      json: null
    };
    captures.push(row);
    return row;
  }
}

const officialIdentity = await fetchCapture('official-oslo-wreath-identity', OFFICIAL_OSLO_IDENTITY);
const collectionHome = await fetchCapture('official-art-collection-home', OFFICIAL_COLLECTION_HOME);
const collectionObjects = await fetchCapture('official-art-collection-objects', OFFICIAL_COLLECTION_OBJECTS);
const collectionSearch = await fetchCapture(
  'official-art-collection-objects-search-sigrid-undset',
  `${OFFICIAL_COLLECTION_OBJECTS}?search=${encodeURIComponent('Sigrid Undset')}`
);
const collectionQuery = await fetchCapture(
  'official-art-collection-objects-query-sigrid-undset',
  `${OFFICIAL_COLLECTION_OBJECTS}?q=${encodeURIComponent('Sigrid Undset')}`
);

const portalHtmlRows = [collectionHome, collectionObjects, collectionSearch, collectionQuery].filter((row) => /html/i.test(row.contentType ?? ''));
const portalScriptUrls = [...new Set(portalHtmlRows.flatMap((row) => extractScriptUrls(row.text, row.finalUrl ?? row.requestedUrl)))];
const relevantScriptUrls = portalScriptUrls
  .filter((url) => !/google|gtag|analytics|cookie|consent/i.test(url))
  .slice(0, 12);
const portalScriptCaptures = [];
for (const [index, url] of relevantScriptUrls.entries()) {
  portalScriptCaptures.push(await fetchCapture(`official-art-portal-script-${index + 1}`, url));
}

const endpointHints = [...new Set(
  [...portalHtmlRows, ...portalScriptCaptures].flatMap((row) => extractEndpointHints(row.text, row.finalUrl ?? row.requestedUrl))
)].slice(0, 120);

const cautiousApiUrls = [
  'https://okk.kunstsamlingen.no/api/objects?search=Sigrid%20Undset',
  'https://okk.kunstsamlingen.no/api/search?query=Sigrid%20Undset',
  'https://okk.kunstsamlingen.no/api/search?q=Sigrid%20Undset',
  'https://okk.kunstsamlingen.no/api/objects/search?q=Sigrid%20Undset'
];
for (const hint of endpointHints) {
  if (/^https:\/\/okk\.kunstsamlingen\.no\//i.test(hint) && /(api|graphql)/i.test(hint)) cautiousApiUrls.push(hint);
}
const uniqueApiUrls = [...new Set(cautiousApiUrls)].slice(0, 12);
const portalApiCaptures = [];
for (const [index, url] of uniqueApiUrls.entries()) {
  portalApiCaptures.push(await fetchCapture(`official-art-portal-api-attempt-${index + 1}`, url));
}

const wikidataSearches = [
  'Sigrid Undset Stensparken',
  'Sigrid Undset statue Oslo',
  'Kjersti Wexelsen Goksøyr Sigrid Undset'
];
const wikidataCaptures = [];
for (const [index, search] of wikidataSearches.entries()) {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(search)}&language=nb&uselang=nb&type=item&limit=20&format=json&origin=*`;
  wikidataCaptures.push(await fetchCapture(`wikidata-search-${index + 1}`, url));
}

const commonsSearchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent('"Sigrid Undset" Stensparken')}&gsrnamespace=6&gsrlimit=50&prop=coordinates|imageinfo|categories|info&iiprop=url|extmetadata&cllimit=max&format=json&origin=*`;
const commonsGeoUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggsprimary=all&ggsnamespace=6&ggsradius=1000&ggscoord=${LEGACY_POINT.lat}|${LEGACY_POINT.lon}&ggslimit=100&prop=coordinates|imageinfo|categories|info&iiprop=url|extmetadata&cllimit=max&format=json&origin=*`;
const commonsSearch = await fetchCapture('commons-search-sigrid-undset-stensparken', commonsSearchUrl);
const commonsGeo = await fetchCapture('commons-geosearch-stensparken-1km', commonsGeoUrl);

const overpassQuery = `[out:json][timeout:40];\n(\n  nwr["tourism"="artwork"](${STENSPARKEN_BBOX.south},${STENSPARKEN_BBOX.west},${STENSPARKEN_BBOX.north},${STENSPARKEN_BBOX.east});\n  nwr["historic"="memorial"](${STENSPARKEN_BBOX.south},${STENSPARKEN_BBOX.west},${STENSPARKEN_BBOX.north},${STENSPARKEN_BBOX.east});\n  nwr["memorial"="statue"](${STENSPARKEN_BBOX.south},${STENSPARKEN_BBOX.west},${STENSPARKEN_BBOX.north},${STENSPARKEN_BBOX.east});\n);\nout center tags;`;
const overpass = await fetchCapture('overpass-stensparken-artwork-memorials', 'https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: `data=${encodeURIComponent(overpassQuery)}`
});

const nominatimQueries = [
  'Sigrid Undset statue Stensparken Oslo',
  'Sigrid Undset-statuen Oslo',
  'Sigrid Undset Stensparken'
];
const nominatimCaptures = [];
for (const [index, query] of nominatimQueries.entries()) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&namedetails=1&extratags=1&limit=20&q=${encodeURIComponent(query)}`;
  nominatimCaptures.push(await fetchCapture(`nominatim-search-${index + 1}`, url));
}

const allJsonCaptures = captures.filter((row) => row.json);
const structuredMatches = allJsonCaptures.flatMap((row) =>
  candidateFromObject(row.json).map((candidate) => ({ ...candidate, capture: row.label, sourceUrl: row.finalUrl ?? row.requestedUrl }))
);

const overpassElements = Array.isArray(overpass.json?.elements) ? overpass.json.elements : [];
const osmCandidates = overpassElements
  .filter((element) => Number(element.id) !== REJECTED_OSM_NODE)
  .map((element) => {
    const tags = element.tags ?? {};
    const text = JSON.stringify(tags).toLowerCase();
    const lat = Number(element.lat ?? element.center?.lat);
    const lon = Number(element.lon ?? element.center?.lon);
    return {
      osmType: element.type,
      osmId: element.id,
      sourceObjectId: `osm-${element.type}:${element.id}`,
      tags,
      lat: Number.isFinite(lat) ? lat : null,
      lon: Number.isFinite(lon) ? lon : null,
      distanceFromLegacyM: Number.isFinite(lat) && Number.isFinite(lon) ? Number(haversineM(LEGACY_POINT, { lat, lon }).toFixed(1)) : null,
      semanticMatch: /sigrid|undset|wexelsen|goksøyr|goksoyr/.test(text)
    };
  });
const semanticOsmCandidates = osmCandidates.filter((row) => row.semanticMatch);
assert(!semanticOsmCandidates.some((row) => Number(row.osmId) === REJECTED_OSM_NODE), 'Rejected OSM node re-entered candidate set.');

const officialPortalCandidates = structuredMatches.filter((row) => row.capture.startsWith('official-art-'));
const officialExactCandidates = officialPortalCandidates.filter((row) => {
  const text = JSON.stringify(row).toLowerCase();
  return Number.isFinite(row.lat) && Number.isFinite(row.lon)
    && text.includes('sigrid') && text.includes('undset')
    && (text.includes('stensparken') || text.includes('fagerborg'))
    && (text.includes('wexelsen') || text.includes('goksøyr') || text.includes('goksoyr'));
});

const independentExactCandidates = structuredMatches.filter((row) => {
  const text = JSON.stringify(row).toLowerCase();
  return !row.capture.startsWith('official-art-')
    && Number.isFinite(row.lat) && Number.isFinite(row.lon)
    && text.includes('sigrid') && text.includes('undset')
    && (text.includes('stensparken') || text.includes('fagerborg'));
});

const textEvidence = captures.map((row) => ({
  label: row.label,
  status: row.status,
  finalUrl: row.finalUrl,
  sha256: row.sha256,
  snippets: snippets(row.text, ['Sigrid Undset', 'Stensparken', 'Kjersti Wexelsen', 'Goksøyr', 'Goksoyr', 'latitude', 'longitude', 'coordinates', 'graphql', '/api/'])
})).filter((row) => row.snippets.length > 0);

let decision = 'keep_needs_source';
let nextAction = 'No new exact authoritative monument anchor was found. Keep the canonical marker at needs_source and do not create batch 196.';
if (officialExactCandidates.length > 0) {
  decision = 'official_exact_anchor_found_requires_identity_and_drift_crosscheck';
  nextAction = 'Crosscheck the official art-collection object identity, coordinate semantics and live drift in a fresh production batch 196 before changing canonical data.';
} else if (independentExactCandidates.length > 0 || semanticOsmCandidates.length > 0) {
  decision = 'new_exact_candidate_requires_visual_and_authoritative_crosscheck';
  nextAction = 'Visually identify the new exact candidate and crosslink it to an authoritative Sigrid Undset/Stensparken source. Do not promote from proximity or name alone.';
}

const summary = {
  version: DATE,
  protocolMaxBatch: maxBatch,
  placeId: PLACE_ID,
  researchOnly: true,
  canonicalChanged: false,
  evidenceSha256Before: sha256(evidenceRaw),
  hardGates: {
    unresolvedEvidence: true,
    protocolBatch195Present: true,
    batch196Absent: true,
    rejectedOsmNodePreserved: true
  },
  officialIdentity: {
    status: officialIdentity.status,
    sourceUrl: OFFICIAL_OSLO_IDENTITY,
    identitySnippets: snippets(officialIdentity.text, ['Sigrid Undset', 'Stensparken'])
  },
  officialArtCollection: {
    homeStatus: collectionHome.status,
    objectsStatus: collectionObjects.status,
    searchStatus: collectionSearch.status,
    queryStatus: collectionQuery.status,
    scriptUrlCount: portalScriptUrls.length,
    fetchedRelevantScriptCount: portalScriptCaptures.length,
    endpointHints,
    apiAttemptCount: portalApiCaptures.length,
    structuredCandidateCount: officialPortalCandidates.length,
    exactCandidateCount: officialExactCandidates.length,
    exactCandidates: officialExactCandidates
  },
  wikimedia: {
    wikidataSearchCount: wikidataCaptures.length,
    commonsSearchStatus: commonsSearch.status,
    commonsGeoStatus: commonsGeo.status,
    independentExactCandidateCount: independentExactCandidates.length,
    independentExactCandidates
  },
  openStreetMap: {
    overpassStatus: overpass.status,
    boundedElementCount: overpassElements.length,
    rejectedNodeId: REJECTED_OSM_NODE,
    semanticCandidateCountExcludingRejected: semanticOsmCandidates.length,
    semanticCandidatesExcludingRejected: semanticOsmCandidates,
    allBoundedCandidatesExcludingRejected: osmCandidates,
    nominatimStatuses: nominatimCaptures.map((row) => ({ label: row.label, status: row.status }))
  },
  textEvidence,
  fetches: captures.map(({ text, json, ...row }) => row),
  decision,
  nextAction
};

await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/portal-endpoint-hints.json`, `${JSON.stringify(endpointHints, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/structured-candidates.json`, `${JSON.stringify(structuredMatches, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/osm-bounded-candidates.json`, `${JSON.stringify(osmCandidates, null, 2)}\n`, 'utf8');

const readme = `# Sigrid Undset monument exact-anchor research after batch 195\n\n- Research only: **yes**\n- Canonical/evidence/protocol data changed: **no**\n- Protocol hard gate: batch **195**\n- Existing rejected object preserved: \`osm-node:${REJECTED_OSM_NODE}\`\n- Official art-collection exact candidates: **${officialExactCandidates.length}**\n- Independent exact candidates: **${independentExactCandidates.length}**\n- New semantic OSM candidates excluding rejected node: **${semanticOsmCandidates.length}**\n- Decision: **${decision}**\n\n${nextAction}\n\nThe job stores every HTTP response and all validation output in repository reports. A blocked/403 art portal is recorded as a source result, not silently bypassed. Proximity, nearest-hit and the already rejected OSM node are never accepted as coordinate evidence.\n`;
await writeFile(`${REPORT_DIR}/README.md`, readme, 'utf8');

console.log(JSON.stringify({
  status: 'research_complete',
  reportDir: REPORT_DIR,
  decision,
  officialExactCandidates: officialExactCandidates.length,
  independentExactCandidates: independentExactCandidates.length,
  semanticOsmCandidates: semanticOsmCandidates.length,
  fetchCount: captures.length
}, null, 2));
