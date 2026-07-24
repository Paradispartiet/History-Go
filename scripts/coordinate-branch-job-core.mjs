import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-24';
const PLACE_ID = 'sigrid_undset_statue';
const REPORT_DIR = 'reports/oslo-coordinate-sigrid-undset-independent-anchor-post-195';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_PATH = 'data/places/litteratur/oslo/places_litteratur.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json';
const QUEUE_REPORT = 'reports/oslo-coordinate-central-unresolved-audit-post-195/summary.json';
const REJECTED_OSM_NODE = 7596280553;
const LEGACY = { lat: 59.9242, lon: 10.7297 };

const URLS = {
  artist: 'https://kjersti-wexelsen-goksoyr.no/portfolio_page/sigrid-undset/',
  osloIdentity: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/',
  emuseumSearch: 'https://okk.kunstsamlingen.no/search/Stensparken/objects/images',
  emuseumModal: 'https://okk.kunstsamlingen.no/search/2339?modal=true',
  commonsApi: 'https://commons.wikimedia.org/w/api.php',
  wikidataApi: 'https://www.wikidata.org/w/api.php',
  wikidataSparql: 'https://query.wikidata.org/sparql',
  overpass: 'https://overpass-api.de/api/interpreter',
  nominatim: 'https://nominatim.openstreetmap.org/search'
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeText(value) {
  return String(value ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
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

function decodeHtml(value) {
  return String(value)
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function extractUrls(html, baseUrl) {
  const urls = new Set();
  for (const match of html.matchAll(/(?:href|src|content)=["']([^"']+)["']/gi)) {
    try {
      const url = new URL(decodeHtml(match[1]), baseUrl).href;
      urls.add(url);
    } catch {}
  }
  for (const match of html.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%\\-]+/g)) {
    try {
      const cleaned = match[0].replaceAll('\\/', '/');
      urls.add(new URL(cleaned).href);
    } catch {}
  }
  return [...urls];
}

function extractCoordinateSignals(text) {
  const signals = [];
  const patterns = [
    /(?:lat(?:itude)?|breddegrad)["'\s:=]+(-?\d{1,2}\.\d{4,})/gi,
    /(?:lon(?:gitude)?|lng|lengdegrad)["'\s:=]+(-?\d{1,3}\.\d{4,})/gi,
    /(-?\d{1,2}\.\d{4,})\s*[,;]\s*(-?\d{1,3}\.\d{4,})/g
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      signals.push({ match: match[0], groups: match.slice(1) });
    }
  }
  return signals.slice(0, 200);
}

function termFlags(text) {
  const lower = normalizeText(text).toLowerCase();
  return {
    sigridUndset: lower.includes('sigrid undset'),
    stensparken: lower.includes('stensparken'),
    artist: lower.includes('kjersti wexelsen goksøyr') || lower.includes('kjersti wexelsen goksoyr'),
    granite: lower.includes('granitt') || lower.includes('granite'),
    bronze: lower.includes('bronse') || lower.includes('bronze'),
    sculpture: lower.includes('skulptur') || lower.includes('statue') || lower.includes('monument'),
    exactObject2339: /\b2339\b/.test(lower),
    emuseum168573: /\b168573\b/.test(lower)
  };
}

async function fetchCapture(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'History-Go-coordinate-research/195 (+https://github.com/Paradispartiet/History-Go)',
      accept: options.accept ?? '*/*',
      ...(options.headers ?? {})
    },
    method: options.method ?? 'GET',
    body: options.body
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    requestedUrl: url,
    finalUrl: response.url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    bytes: buffer.length,
    sha256: sha256(buffer),
    buffer,
    text: buffer.toString('utf8')
  };
}

function compactCapture(capture) {
  return {
    requestedUrl: capture.requestedUrl,
    finalUrl: capture.finalUrl,
    status: capture.status,
    ok: capture.ok,
    contentType: capture.contentType,
    bytes: capture.bytes,
    sha256: capture.sha256,
    flags: termFlags(capture.text),
    coordinateSignals: extractCoordinateSignals(capture.text)
  };
}

function haversineM(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseJsonSafely(text) {
  try { return JSON.parse(text); } catch { return null; }
}

function walk(value, path = '$', rows = []) {
  if (value == null) return rows;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (/(sigrid|undset|stenspark|goksøyr|goksoyr|granitt|granite|latitude|longitude|coordinate|location|sted)/i.test(lower)) {
      rows.push({ path, value: value.slice(0, 800) });
    }
    return rows;
  }
  if (typeof value !== 'object') return rows;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${path}[${index}]`, rows));
  } else {
    for (const [key, entry] of Object.entries(value)) {
      if (/(lat|lon|lng|coordinate|location|place|sted|title|name|artist|material)/i.test(key)) {
        rows.push({ path: `${path}.${key}`, value: typeof entry === 'object' ? JSON.stringify(entry).slice(0, 800) : String(entry).slice(0, 800) });
      }
      walk(entry, `${path}.${key}`, rows);
    }
  }
  return rows;
}

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batches) === 195, `Expected protocol max batch 195, found ${Math.max(...batches)}.`);
assert(protocol.includes('| 195 | `frognerstranda` | Frognerstranda | verified_geometry |'), 'Batch 195 protocol row missing.');

const [places, evidence, queue] = await Promise.all([
  readJson(PLACE_PATH),
  readJson(EVIDENCE_PATH),
  readJson(QUEUE_REPORT)
]);
const place = places.find((row) => row?.id === PLACE_ID);
assert(place, 'Sigrid Undset canonical place missing.');
assert(place.lat === LEGACY.lat && place.lon === LEGACY.lon, 'Legacy Sigrid coordinate drifted before research.');
assert(place.coordStatus === 'needs_source', `Unexpected coordStatus: ${place.coordStatus}`);
assert(evidence.evidenceStatus === 'needs_research', `Unexpected evidenceStatus: ${evidence.evidenceStatus}`);
assert(evidence.decision?.nextAction?.includes('Do not retry OSM node 7596280553'), 'Rejected-node hard gate missing from evidence.');
assert((evidence.sourceObjectCandidates ?? []).some((row) => row.sourceObjectId === `osm-node:${REJECTED_OSM_NODE}` && row.canApplyToPlace === false), 'Rejected OSM node is not blocked.');
assert(queue.activeUnresolvedCentralCount === 1 && queue.nextCandidate?.placeId === PLACE_ID, 'Post-195 central queue no longer points only to Sigrid Undset.');

await mkdir(REPORT_DIR, { recursive: true });
await mkdir(`${REPORT_DIR}/responses`, { recursive: true });
await mkdir(`${REPORT_DIR}/images`, { recursive: true });

const officialCaptures = {};
for (const [key, url] of Object.entries({ artist: URLS.artist, osloIdentity: URLS.osloIdentity, emuseumSearch: URLS.emuseumSearch, emuseumModal: URLS.emuseumModal })) {
  const capture = await fetchCapture(url, { accept: 'text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8' });
  officialCaptures[key] = compactCapture(capture);
  await writeFile(`${REPORT_DIR}/responses/${key}.html`, capture.buffer);
}
assert(officialCaptures.artist.ok && officialCaptures.artist.flags.sigridUndset && officialCaptures.artist.flags.granite, 'Artist identity/material source failed live hard gate.');
assert(officialCaptures.osloIdentity.ok && officialCaptures.osloIdentity.flags.sigridUndset && officialCaptures.osloIdentity.flags.stensparken, 'Oslo monument identity source failed live hard gate.');
assert(officialCaptures.emuseumSearch.ok && officialCaptures.emuseumSearch.flags.sigridUndset && officialCaptures.emuseumSearch.flags.artist, 'eMuseum exact search failed live hard gate.');
assert(officialCaptures.emuseumModal.ok && officialCaptures.emuseumModal.flags.sigridUndset && officialCaptures.emuseumModal.flags.artist, 'eMuseum modal detail failed live hard gate.');

const searchHtml = await readFile(`${REPORT_DIR}/responses/emuseumSearch.html`, 'utf8');
const modalHtml = await readFile(`${REPORT_DIR}/responses/emuseumModal.html`, 'utf8');
const emuseumRepresentationUrls = new Set();
for (const html of [searchHtml, modalHtml]) {
  for (const match of html.matchAll(/<link[^>]+(?:type|rel)=["'](?:application\/(?:json|xml|rdf\+xml)|alternate)["'][^>]+href=["']([^"']+)["']/gi)) {
    try { emuseumRepresentationUrls.add(new URL(decodeHtml(match[1]), URLS.emuseumSearch).href); } catch {}
  }
  for (const match of html.matchAll(/href=["']([^"']+\/(?:json|xml|rdf)(?:[?;][^"']*)?)["']/gi)) {
    try { emuseumRepresentationUrls.add(new URL(decodeHtml(match[1]), URLS.emuseumSearch).href); } catch {}
  }
}
for (const suffix of ['json', 'xml', 'rdf']) {
  emuseumRepresentationUrls.add(`https://okk.kunstsamlingen.no/search/2339/objects/${suffix}`);
  emuseumRepresentationUrls.add(`https://okk.kunstsamlingen.no/search/Stensparken/objects/${suffix}`);
}

const emuseumRepresentations = [];
let repIndex = 0;
for (const url of [...emuseumRepresentationUrls].slice(0, 30)) {
  const capture = await fetchCapture(url, { accept: 'application/json,application/xml,application/rdf+xml,text/xml,text/html;q=0.8,*/*;q=0.5' });
  const filename = `emuseum-representation-${String(repIndex).padStart(2, '0')}.txt`;
  await writeFile(`${REPORT_DIR}/responses/${filename}`, capture.buffer);
  const parsed = parseJsonSafely(capture.text);
  emuseumRepresentations.push({
    ...compactCapture(capture),
    responseFile: `responses/${filename}`,
    structuredSignals: parsed ? walk(parsed).slice(0, 300) : []
  });
  repIndex += 1;
}

const candidateMediaUrls = extractUrls(`${searchHtml}\n${modalHtml}`, URLS.emuseumSearch)
  .filter((url) => /\.(?:jpe?g|png|webp)(?:$|\?)/i.test(url) || /(?:image|media|asset|thumbnail|fullsize)/i.test(url))
  .filter((url) => !/(logo|favicon|icon|footer|sprite)/i.test(url));
const mediaCaptures = [];
let mediaIndex = 0;
for (const url of candidateMediaUrls.slice(0, 30)) {
  const capture = await fetchCapture(url, { accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' });
  if (!capture.ok || !String(capture.contentType ?? '').startsWith('image/')) continue;
  const extension = capture.contentType?.includes('png') ? 'png' : capture.contentType?.includes('webp') ? 'webp' : 'jpg';
  const filename = `emuseum-media-${String(mediaIndex).padStart(2, '0')}.${extension}`;
  const localPath = `${REPORT_DIR}/images/${filename}`;
  await writeFile(localPath, capture.buffer);
  const identify = spawnSync('identify', ['-verbose', localPath], { encoding: 'utf8' });
  mediaCaptures.push({
    ...compactCapture(capture),
    responseFile: `images/${filename}`,
    identifyAvailable: identify.status === 0,
    identifyCoordinateLines: identify.status === 0
      ? identify.stdout.split('\n').filter((line) => /(gps|latitude|longitude|location)/i.test(line)).slice(0, 100)
      : [],
    identifySummary: identify.status === 0 ? identify.stdout.split('\n').slice(0, 30) : [],
    error: identify.status === 0 ? null : String(identify.stderr || identify.error || '')
  });
  mediaIndex += 1;
}

const commonsSearchQueries = [
  'Sigrid Undset Stensparken',
  'Sigrid Undset statue Oslo',
  'Sigrid Undset skulptur Oslo',
  'Kjersti Wexelsen Goksøyr Stensparken'
];
const commonsSearchResponses = [];
for (const query of commonsSearchQueries) {
  const url = new URL(URLS.commonsApi);
  url.search = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', list: 'search', srnamespace: '6', srlimit: '100', srsearch: query
  }).toString();
  const capture = await fetchCapture(url.href, { accept: 'application/json' });
  commonsSearchResponses.push({ query, capture: compactCapture(capture), data: parseJsonSafely(capture.text) });
}

const geoUrl = new URL(URLS.commonsApi);
geoUrl.search = new URLSearchParams({
  action: 'query', format: 'json', origin: '*', list: 'geosearch',
  gsprimary: 'all', gsnamespace: '6', gsradius: '1500', gslimit: '500',
  gscoord: `${LEGACY.lat}|${LEGACY.lon}`, gsprop: 'type|name|dim|country|region'
}).toString();
const commonsGeoCapture = await fetchCapture(geoUrl.href, { accept: 'application/json' });
const commonsGeoData = parseJsonSafely(commonsGeoCapture.text) ?? {};
const geoRows = commonsGeoData?.query?.geosearch ?? [];

const geotitles = [...new Set(geoRows.map((row) => row.title).filter(Boolean))];
const commonsDetails = [];
for (let i = 0; i < geotitles.length; i += 40) {
  const titles = geotitles.slice(i, i + 40);
  const url = new URL(URLS.commonsApi);
  url.search = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', prop: 'imageinfo|coordinates|pageprops', titles: titles.join('|'),
    iiprop: 'url|mime|size|extmetadata|commonmetadata|metadata', coprop: 'type|name|dim|country|region'
  }).toString();
  const capture = await fetchCapture(url.href, { accept: 'application/json' });
  commonsDetails.push(parseJsonSafely(capture.text));
}
const commonsPages = commonsDetails.flatMap((data) => Object.values(data?.query?.pages ?? {}));
const commonsRelevant = commonsPages.filter((page) => {
  const text = JSON.stringify(page).toLowerCase();
  return /(sigrid|undset|stenspark|goksøyr|goksoyr)/i.test(text);
}).map((page) => ({
  pageid: page.pageid,
  title: page.title,
  coordinates: page.coordinates ?? [],
  imageinfo: page.imageinfo ?? [],
  distanceFromLegacyM: page.coordinates?.[0]
    ? haversineM(LEGACY, { lat: Number(page.coordinates[0].lat), lon: Number(page.coordinates[0].lon) })
    : null
}));

const wikidataSearchQueries = ['Sigrid Undset Stensparken', 'Sigrid Undset statue Oslo', 'Sigrid Undset skulptur Oslo', 'Kjersti Wexelsen Goksøyr'];
const wikidataSearch = [];
for (const query of wikidataSearchQueries) {
  const url = new URL(URLS.wikidataApi);
  url.search = new URLSearchParams({ action: 'wbsearchentities', format: 'json', origin: '*', language: 'nb', uselang: 'nb', limit: '50', search: query }).toString();
  const capture = await fetchCapture(url.href, { accept: 'application/json' });
  wikidataSearch.push({ query, capture: compactCapture(capture), data: parseJsonSafely(capture.text) });
}

const sparql = `SELECT ?item ?itemLabel ?coord ?image ?depicts ?depictsLabel WHERE {
  SERVICE wikibase:around {
    ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:center "Point(${LEGACY.lon} ${LEGACY.lat})"^^geo:wktLiteral ;
                    wikibase:radius "2" .
  }
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?item wdt:P180 ?depicts . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "nb,en". }
}`;
const sparqlUrl = new URL(URLS.wikidataSparql);
sparqlUrl.search = new URLSearchParams({ query: sparql, format: 'json' }).toString();
const sparqlCapture = await fetchCapture(sparqlUrl.href, { accept: 'application/sparql-results+json,application/json' });
const sparqlData = parseJsonSafely(sparqlCapture.text);
const sparqlRelevant = (sparqlData?.results?.bindings ?? []).filter((row) => /(sigrid|undset|goksøyr|goksoyr|statue|skulptur)/i.test(JSON.stringify(row)));

const overpassQuery = `[out:json][timeout:60];(
  nwr(around:900,${LEGACY.lat},${LEGACY.lon})[tourism=artwork];
  nwr(around:900,${LEGACY.lat},${LEGACY.lon})[historic=memorial];
  nwr(around:900,${LEGACY.lat},${LEGACY.lon})[memorial];
  nwr(around:900,${LEGACY.lat},${LEGACY.lon})[artwork_type];
);out center tags;`;
const overpassCapture = await fetchCapture(URLS.overpass, {
  method: 'POST', accept: 'application/json', headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString()
});
const overpassData = parseJsonSafely(overpassCapture.text) ?? {};
const overpassRows = (overpassData.elements ?? []).map((row) => {
  const lat = Number(row.lat ?? row.center?.lat);
  const lon = Number(row.lon ?? row.center?.lon);
  return {
    type: row.type,
    id: row.id,
    lat,
    lon,
    tags: row.tags ?? {},
    rejectedKnownNode: row.type === 'node' && row.id === REJECTED_OSM_NODE,
    distanceFromLegacyM: Number.isFinite(lat) && Number.isFinite(lon) ? haversineM(LEGACY, { lat, lon }) : null
  };
}).sort((a, b) => (a.distanceFromLegacyM ?? Infinity) - (b.distanceFromLegacyM ?? Infinity));
const newOsmIdentityCandidates = overpassRows.filter((row) => !row.rejectedKnownNode && /(sigrid|undset|goksøyr|goksoyr)/i.test(JSON.stringify(row.tags)));

const nominatimQueries = ['Sigrid Undset statue, Stensparken, Oslo', 'Sigrid Undset skulptur, Stensparken, Oslo', 'S. Undset Styrke, Oslo'];
const nominatim = [];
for (const query of nominatimQueries) {
  const url = new URL(URLS.nominatim);
  url.search = new URLSearchParams({ q: query, format: 'jsonv2', addressdetails: '1', namedetails: '1', extratags: '1', polygon_geojson: '1', limit: '50' }).toString();
  const capture = await fetchCapture(url.href, { accept: 'application/json' });
  nominatim.push({ query, capture: compactCapture(capture), data: parseJsonSafely(capture.text) });
}

const exactCoordinateSignals = [];
for (const rep of emuseumRepresentations) {
  for (const signal of rep.coordinateSignals ?? []) exactCoordinateSignals.push({ source: rep.finalUrl, signal });
  for (const signal of rep.structuredSignals ?? []) {
    if (/(lat|lon|lng|coordinate|location)/i.test(signal.path)) exactCoordinateSignals.push({ source: rep.finalUrl, signal });
  }
}
for (const media of mediaCaptures) {
  for (const line of media.identifyCoordinateLines ?? []) exactCoordinateSignals.push({ source: media.finalUrl, signal: line });
}

const exactIndependentCandidates = [];
for (const page of commonsRelevant) {
  if (page.coordinates?.length && /(sigrid|undset)/i.test(JSON.stringify(page))) {
    exactIndependentCandidates.push({ provider: 'wikimedia_commons', sourceObjectId: `commons:${page.title}`, coordinate: page.coordinates[0], basis: 'geotagged Commons file with matching Sigrid/Undset metadata', requiresManualVisualReview: true });
  }
}
for (const row of newOsmIdentityCandidates) {
  exactIndependentCandidates.push({ provider: 'openstreetmap', sourceObjectId: `${row.type}:${row.id}`, coordinate: { lat: row.lat, lon: row.lon }, basis: 'new exact-name/tag identity candidate distinct from rejected node', requiresManualVisualReview: true });
}

const summary = {
  version: DATE,
  placeId: PLACE_ID,
  coordinateMaxBatch: 195,
  hardGates: {
    legacyCoordinateUnchanged: true,
    statusNeedsSource: true,
    rejectedOsmNodeBlocked: true,
    soleCentralCandidate: true
  },
  officialIdentity: {
    emuseumId: '168573',
    internalObjectId: '2339',
    title: 'Sigrid Undset (1882-1949)',
    artist: 'Kjersti Wexelsen Goksøyr',
    material: 'granite',
    location: 'Stensparken'
  },
  officialCaptures,
  emuseum: {
    representationCount: emuseumRepresentations.length,
    representations: emuseumRepresentations,
    candidateMediaUrlCount: candidateMediaUrls.length,
    downloadedMediaCount: mediaCaptures.length,
    media: mediaCaptures,
    exactCoordinateSignals
  },
  wikimedia: {
    searchQueries: commonsSearchResponses.map((row) => ({ query: row.query, capture: row.capture, resultCount: row.data?.query?.searchinfo?.totalhits ?? null, results: row.data?.query?.search ?? [] })),
    geosearchCapture: compactCapture(commonsGeoCapture),
    geosearchCount: geoRows.length,
    relevantPages: commonsRelevant
  },
  wikidata: {
    searches: wikidataSearch.map((row) => ({ query: row.query, capture: row.capture, results: row.data?.search ?? [] })),
    sparqlCapture: compactCapture(sparqlCapture),
    nearbyBindingCount: sparqlData?.results?.bindings?.length ?? null,
    relevantBindings: sparqlRelevant
  },
  openstreetmap: {
    overpassCapture: compactCapture(overpassCapture),
    nearbyArtworkAndMemorialCount: overpassRows.length,
    rows: overpassRows,
    knownRejectedNodePresent: overpassRows.some((row) => row.rejectedKnownNode),
    newExactIdentityCandidates: newOsmIdentityCandidates
  },
  nominatim: nominatim.map((row) => ({ query: row.query, capture: row.capture, results: row.data ?? [] })),
  exactIndependentCandidates,
  coordinateChanged: false,
  decision: exactIndependentCandidates.length > 0
    ? 'independent_candidate_requires_manual_visual_identity_review'
    : 'keep_needs_source_no_independent_exact_anchor',
  nextAction: exactIndependentCandidates.length > 0
    ? 'Manually inspect every candidate image/object and promote only if it visibly matches the official grey-granite Sigrid Undset monument.'
    : 'Keep needs_source. Seek a new authoritative public-art point dataset or a geotagged image that visibly matches the official monument; do not retry OSM node 7596280553.'
};

await writeJson(`${REPORT_DIR}/summary.json`, summary);
await writeJson(`${REPORT_DIR}/commons-geosearch.json`, commonsGeoData);
await writeJson(`${REPORT_DIR}/commons-details.json`, commonsPages);
await writeJson(`${REPORT_DIR}/wikidata-sparql.json`, sparqlData ?? { raw: sparqlCapture.text });
await writeJson(`${REPORT_DIR}/overpass-artwork-memorials.json`, overpassData);
await writeFile(`${REPORT_DIR}/README.md`, `# Sigrid Undset independent-anchor research after batch 195\n\n- Canonical coordinate remains unchanged and \`needs_source\`.\n- Exact official object identity: Oslo kommunes kunstsamling object 2339 / eMuseum 168573.\n- Rejected node \`osm-node:7596280553\` is hard-blocked and not reconsidered.\n- eMuseum representations inspected: ${emuseumRepresentations.length}.\n- eMuseum images downloaded: ${mediaCaptures.length}.\n- Commons geotagged files inspected: ${geoRows.length}.\n- Nearby OSM artwork/memorial objects inspected: ${overpassRows.length}.\n- New exact independent candidates: ${exactIndependentCandidates.length}.\n- Decision: \`${summary.decision}\`.\n\nNo canonical place, coordinate, evidence or protocol data changes are made in this research pass.\n`, 'utf8');

console.log(JSON.stringify({
  decision: summary.decision,
  exactIndependentCandidates: summary.exactIndependentCandidates,
  emuseumRepresentations: summary.emuseum.representationCount,
  emuseumMedia: summary.emuseum.downloadedMediaCount,
  commonsGeosearch: summary.wikimedia.geosearchCount,
  nearbyOsmObjects: summary.openstreetmap.nearbyArtworkAndMemorialCount
}, null, 2));
