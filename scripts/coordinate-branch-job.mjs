import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DATE = '2026-07-24';
const PLACE_ID = 'sigrid_undset_statue';
const REPORT_DIR = 'reports/oslo-coordinate-sigrid-undset-independent-anchor-post-195-replay';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const PLACE_PATH = 'data/places/litteratur/oslo/places_litteratur.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json';
const QUEUE_PATH = 'reports/oslo-coordinate-central-unresolved-audit-post-195/summary.json';
const EMUSEUM_CONTRACT_PATH = 'reports/oslo-coordinate-sigrid-undset-emuseum-research-post-194/detail-followup.json';
const REJECTED_OSM_NODE = 'osm-node:7596280553';
const LEGACY = { lat: 59.9242, lon: 10.7297 };

const URLS = {
  artist: 'https://kjersti-wexelsen-goksoyr.no/portfolio_page/sigrid-undset/',
  oslo: 'https://www.oslo.kommune.no/natur-kultur-og-fritid/17-mai/bekransninger/',
  commons: 'https://commons.wikimedia.org/w/api.php',
  wikidata: 'https://www.wikidata.org/w/api.php',
  nominatim: 'https://nominatim.openstreetmap.org/search',
  overpass: 'https://overpass-api.de/api/interpreter'
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

function visibleText(html) {
  return String(html)
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

async function fetchText(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method ?? 'GET',
      body: options.body,
      redirect: 'follow',
      headers: {
        'user-agent': 'History-Go-coordinate-research/195-replay (+https://github.com/Paradispartiet/History-Go)',
        accept: options.accept ?? '*/*',
        ...(options.headers ?? {})
      }
    });
    const text = await response.text();
    return {
      requestedUrl: url,
      finalUrl: response.url,
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      bytes: Buffer.byteLength(text),
      sha256: sha256(text),
      text,
      error: null
    };
  } catch (error) {
    return {
      requestedUrl: url,
      finalUrl: null,
      status: null,
      ok: false,
      contentType: null,
      bytes: 0,
      sha256: null,
      text: '',
      error: String(error?.stack ?? error)
    };
  }
}

function parseJson(text) {
  try { return JSON.parse(text); } catch { return null; }
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
    error: capture.error
  };
}

function exactMonumentText(value) {
  const text = String(value ?? '').toLowerCase();
  const exactPerson = text.includes('sigrid undset');
  const objectSignal = /(statue|statuen|skulptur|sculpture|monument|stensparken|goksøyr|goksoyr|s\.\s*undset|styrke)/i.test(text);
  return exactPerson && objectSignal;
}

function isExactCandidateObject(value) {
  return exactMonumentText(JSON.stringify(value));
}

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batches) === 195, `Expected protocol max batch 195, found ${Math.max(...batches)}.`);
assert(protocol.includes('| 195 | `frognerstranda` | Frognerstranda | verified_geometry |'), 'Batch 195 protocol row missing.');

const [places, evidence, queue, emuseumContract] = await Promise.all([
  readJson(PLACE_PATH),
  readJson(EVIDENCE_PATH),
  readJson(QUEUE_PATH),
  readJson(EMUSEUM_CONTRACT_PATH)
]);
const place = places.find((row) => row?.id === PLACE_ID);
assert(place, 'Canonical Sigrid Undset place missing.');
assert(place.lat === LEGACY.lat && place.lon === LEGACY.lon, 'Legacy coordinate drifted before replay.');
assert(place.coordStatus === 'needs_source', `Unexpected coordStatus: ${place.coordStatus}`);
assert(evidence.evidenceStatus === 'needs_research', `Unexpected evidenceStatus: ${evidence.evidenceStatus}`);
assert((evidence.sourceObjectCandidates ?? []).some((row) => row.sourceObjectId === REJECTED_OSM_NODE && row.canApplyToPlace === false), 'Rejected OSM node is not hard-blocked.');
assert(queue.activeUnresolvedCentralCount === 1 && queue.nextCandidate?.placeId === PLACE_ID, 'Post-195 queue no longer identifies Sigrid Undset as sole central unresolved place.');
assert(emuseumContract?.exactCard?.emuseumId === '168573', 'Merged eMuseum ID drifted.');
assert(emuseumContract?.exactCard?.internalObjectId === '2339', 'Merged eMuseum internal object ID drifted.');
assert(emuseumContract?.exactCard?.title === 'Sigrid Undset (1882-1949)', 'Merged eMuseum title drifted.');
assert(emuseumContract?.exactCard?.artist === 'Kjersti Wexelsen Goksøyr', 'Merged eMuseum artist drifted.');

const artistCapture = await fetchText(URLS.artist, { accept: 'text/html,application/xhtml+xml' });
const osloCapture = await fetchText(URLS.oslo, { accept: 'text/html,application/xhtml+xml' });
const artistText = visibleText(artistCapture.text);
const osloText = visibleText(osloCapture.text);
assert(artistCapture.ok, `Artist source HTTP failure: ${artistCapture.status}`);
assert(/S\.\s*Undset\s*[–-]\s*Styrke/i.test(artistText), 'Artist source work title missing.');
assert(/Stensparken/i.test(artistText), 'Artist source Stensparken signal missing.');
assert(/Granitt/i.test(artistText), 'Artist source granite signal missing.');
assert(osloCapture.ok, `Oslo source HTTP failure: ${osloCapture.status}`);
assert(/Sigrid Undset/i.test(osloText) && /Stensparken/i.test(osloText), 'Oslo monument identity/location signal missing.');

const commonsQueries = [
  '"Sigrid Undset" Stensparken',
  '"Sigrid Undset" statue Oslo',
  '"Sigrid Undset" skulptur Oslo',
  '"S. Undset" Styrke',
  '"Kjersti Wexelsen Goksøyr" Stensparken'
];
const commonsSearches = [];
for (const query of commonsQueries) {
  const url = new URL(URLS.commons);
  url.search = new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    list: 'search',
    srnamespace: '6',
    srlimit: '100',
    srsearch: query
  }).toString();
  const capture = await fetchText(url.href, { accept: 'application/json' });
  const data = parseJson(capture.text);
  const results = data?.query?.search ?? [];
  commonsSearches.push({
    query,
    capture: compactCapture(capture),
    totalHits: data?.query?.searchinfo?.totalhits ?? null,
    exactCandidates: results.filter(isExactCandidateObject).map((row) => ({ pageid: row.pageid, title: row.title, snippet: visibleText(row.snippet) }))
  });
}

const wikidataQueries = [
  'Sigrid Undset Stensparken',
  'Sigrid Undset statue Oslo',
  'Sigrid Undset skulptur Oslo',
  'S. Undset Styrke',
  'Kjersti Wexelsen Goksøyr'
];
const wikidataSearches = [];
for (const query of wikidataQueries) {
  const url = new URL(URLS.wikidata);
  url.search = new URLSearchParams({
    action: 'wbsearchentities',
    format: 'json',
    origin: '*',
    language: 'nb',
    uselang: 'nb',
    limit: '50',
    search: query
  }).toString();
  const capture = await fetchText(url.href, { accept: 'application/json' });
  const data = parseJson(capture.text);
  const results = data?.search ?? [];
  wikidataSearches.push({
    query,
    capture: compactCapture(capture),
    resultCount: results.length,
    exactCandidates: results.filter(isExactCandidateObject).map((row) => ({ id: row.id, label: row.label, description: row.description, concepturi: row.concepturi })),
    artistIdentityResults: results.filter((row) => row.id === 'Q11980972').map((row) => ({ id: row.id, label: row.label, description: row.description }))
  });
}

const nominatimQueries = [
  'Sigrid Undset statue, Stensparken, Oslo',
  'Sigrid Undset skulptur, Stensparken, Oslo',
  'S. Undset Styrke, Oslo'
];
const nominatimSearches = [];
for (const query of nominatimQueries) {
  const url = new URL(URLS.nominatim);
  url.search = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    namedetails: '1',
    extratags: '1',
    limit: '50'
  }).toString();
  const capture = await fetchText(url.href, { accept: 'application/json' });
  const rows = parseJson(capture.text) ?? [];
  nominatimSearches.push({
    query,
    capture: compactCapture(capture),
    resultCount: Array.isArray(rows) ? rows.length : 0,
    exactCandidates: Array.isArray(rows) ? rows.filter(isExactCandidateObject).map((row) => ({
      osm_type: row.osm_type,
      osm_id: row.osm_id,
      lat: row.lat,
      lon: row.lon,
      display_name: row.display_name,
      namedetails: row.namedetails,
      extratags: row.extratags
    })) : []
  });
}

const overpassQuery = `[out:json][timeout:60];(
  nwr(around:1500,${LEGACY.lat},${LEGACY.lon})[name~"Sigrid[ _.-]*Undset",i];
  nwr(around:1500,${LEGACY.lat},${LEGACY.lon})[subject~"Sigrid[ _.-]*Undset",i];
  nwr(around:1500,${LEGACY.lat},${LEGACY.lon})[inscription~"Sigrid[ _.-]*Undset",i];
  nwr(around:1500,${LEGACY.lat},${LEGACY.lon})[artist_name~"Kjersti[ _.-]*Wexelsen[ _.-]*Goks",i];
);out center tags;`;
const overpassCapture = await fetchText(URLS.overpass, {
  method: 'POST',
  accept: 'application/json',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString()
});
const overpassData = parseJson(overpassCapture.text);
const overpassRows = (overpassData?.elements ?? []).map((row) => ({
  type: row.type,
  id: row.id,
  lat: row.lat ?? row.center?.lat ?? null,
  lon: row.lon ?? row.center?.lon ?? null,
  tags: row.tags ?? {}
}));
const overpassExactCandidates = overpassRows.filter((row) => `${row.type === 'node' ? 'osm-node' : row.type === 'way' ? 'osm-way' : 'osm-relation'}:${row.id}` !== REJECTED_OSM_NODE && isExactCandidateObject(row));

const exactCandidates = [
  ...commonsSearches.flatMap((row) => row.exactCandidates.map((candidate) => ({ provider: 'wikimedia_commons', query: row.query, ...candidate }))),
  ...wikidataSearches.flatMap((row) => row.exactCandidates.map((candidate) => ({ provider: 'wikidata', query: row.query, ...candidate }))),
  ...nominatimSearches.flatMap((row) => row.exactCandidates.map((candidate) => ({ provider: 'nominatim', query: row.query, ...candidate }))),
  ...overpassExactCandidates.map((candidate) => ({ provider: 'openstreetmap', ...candidate }))
];

const summary = {
  version: DATE,
  placeId: PLACE_ID,
  coordinateMaxBatch: 195,
  officialIdentity: {
    emuseumId: '168573',
    internalObjectId: '2339',
    title: 'Sigrid Undset (1882-1949)',
    artist: 'Kjersti Wexelsen Goksøyr',
    officialWorkTitle: 'S. Undset – Styrke',
    material: 'granite',
    location: 'Stensparken'
  },
  hardGates: {
    legacyCoordinateUnchanged: true,
    statusNeedsSource: true,
    rejectedOsmNodeBlocked: true,
    soleCentralCandidate: true,
    mergedEmuseumIdentityContractIntact: true
  },
  liveOfficialSources: {
    artist: { ...compactCapture(artistCapture), workTitle: true, stensparken: true, granite: true },
    oslo: { ...compactCapture(osloCapture), sigridUndset: true, stensparken: true }
  },
  previousBroadSweep: {
    sourcePr: 3626,
    sourceCommit: '0b07bbc7345b98e9ca6b3e359cbe8af1ac9a7daa',
    commonsNearbyFilesInspected: 500,
    wikidataNearbyCoordinateItemsInspected: 2036,
    osmNearbyArtworkAndMemorialObjectsInspected: 93,
    automatedFalsePositivesRejected: [
      'commons:File:Bislett Games 2026 - Sigrid Borge.jpg',
      'commons:File:Bislett Games 2026 - Sigrid Borge (2).jpg'
    ],
    falsePositiveReason: 'Both files depict athlete Sigrid Borge at Bislett Games 2026; neither is connected to Sigrid Undset, the artist, Stensparken or the granite monument.'
  },
  exactSearches: {
    commons: commonsSearches,
    wikidata: wikidataSearches,
    nominatim: nominatimSearches,
    overpass: {
      capture: compactCapture(overpassCapture),
      query: overpassQuery,
      resultCount: overpassRows.length,
      exactCandidates: overpassExactCandidates
    }
  },
  exactIndependentCandidates: exactCandidates,
  coordinateChanged: false,
  decision: exactCandidates.length === 0
    ? 'keep_needs_source_no_independent_exact_anchor'
    : 'independent_exact_candidate_requires_manual_identity_review',
  nextAction: exactCandidates.length === 0
    ? 'Keep needs_source. Seek a new authoritative public-art point dataset or a geotagged image explicitly identifying and visibly matching the official grey-granite Sigrid Undset monument. Do not retry OSM node 7596280553.'
    : 'Manually inspect each exact candidate and promote only if it visibly matches the official grey-granite Sigrid Undset monument.'
};

await mkdir(REPORT_DIR, { recursive: true });
await writeJson(`${REPORT_DIR}/summary.json`, summary);
await writeFile(`${REPORT_DIR}/README.md`, `# Sigrid Undset independent-anchor replay after batch 195\n\n- Canonical coordinate remains unchanged and \`needs_source\`.\n- Official identity: eMuseum 168573 / internal object 2339 / Kjersti Wexelsen Goksøyr / \`S. Undset – Styrke\` / granite / Stensparken.\n- Rejected \`osm-node:7596280553\` remains hard-blocked.\n- Live artist and Oslo municipality sources passed.\n- Exact Commons, Wikidata, Nominatim and Overpass searches found ${exactCandidates.length} independent candidate(s).\n- The earlier broad sweep inspected 500 Commons files, 2,036 Wikidata items and 93 OSM objects; two Sigrid Borge false positives were rejected.\n- Decision: \`${summary.decision}\`.\n\nNo canonical place, coordinate, evidence or protocol data changes are made.\n`, 'utf8');

console.log(JSON.stringify({
  decision: summary.decision,
  exactIndependentCandidateCount: summary.exactIndependentCandidates.length,
  commonsExactCandidates: commonsSearches.reduce((sum, row) => sum + row.exactCandidates.length, 0),
  wikidataExactCandidates: wikidataSearches.reduce((sum, row) => sum + row.exactCandidates.length, 0),
  nominatimExactCandidates: nominatimSearches.reduce((sum, row) => sum + row.exactCandidates.length, 0),
  overpassExactCandidates: overpassExactCandidates.length
}, null, 2));
