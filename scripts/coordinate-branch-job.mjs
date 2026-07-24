import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const PLACE_ID = 'sigrid_undset_statue';
const EXPECTED_BATCH = 194;
const REPORT_DATE = '2026-07-24';
const BASE = 'https://okk.kunstsamlingen.no';
const OSM_NODE_ID = 7596280553;
const reportDir = join(root, 'reports/oslo-coordinate-sigrid-undset-emuseum-research-post-194');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function safeName(url, index) {
  const parsed = new URL(url);
  const slug = `${parsed.pathname}${parsed.search}`
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 140) || 'root';
  return `${String(index).padStart(2, '0')}-${slug}.html`;
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

function extractObjectLinks(html, baseUrl) {
  const links = new Set();
  for (const match of html.matchAll(/href=["']([^"']*\/objects\/\d+\/[^"'#?]+)["']/gi)) {
    try {
      const url = new URL(decodeEntities(match[1]), baseUrl);
      if (url.hostname === 'okk.kunstsamlingen.no') links.add(url.href);
    } catch {}
  }
  return [...links];
}

function extractScripts(html, baseUrl) {
  const links = new Set();
  for (const match of html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)) {
    try {
      links.add(new URL(decodeEntities(match[1]), baseUrl).href);
    } catch {}
  }
  return [...links];
}

function termFlags(text) {
  const folded = text.toLocaleLowerCase('nb-NO');
  return {
    sigridUndset: folded.includes('sigrid undset'),
    artistFull: folded.includes('kjersti wexelsen goksøyr') || folded.includes('kjersti wexelsen goksoyr'),
    artistSurname: folded.includes('goksøyr') || folded.includes('goksoyr'),
    stensparken: folded.includes('stensparken'),
    sculpture: folded.includes('skulptur') || folded.includes('statue'),
    granite: folded.includes('granitt') || folded.includes('granite'),
    bronze: folded.includes('bronse') || folded.includes('bronze'),
  };
}

function extractField(text, label, nextLabels = []) {
  const labels = [label, ...nextLabels].map((item) => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const stop = labels.slice(1).length ? `(?=${labels.slice(1).join('|')}|$)` : '$';
  const regex = new RegExp(`${labels[0]}\\s+(.+?)\\s*${stop}`, 'i');
  return text.match(regex)?.[1]?.trim() ?? null;
}

function coordinateSignals(html, text) {
  const patterns = [
    /(?:latitude|lat)["'\s:=]+(-?\d{1,3}\.\d{4,})/gi,
    /(?:longitude|lng|lon)["'\s:=]+(-?\d{1,3}\.\d{4,})/gi,
    /(-?\d{2}\.\d{4,})\s*[,;]\s*(-?\d{2}\.\d{4,})/g,
    /maps[^"']*[?&](?:q|query)=(-?\d{2}\.\d+)%?2C(-?\d{2}\.\d+)/gi,
  ];
  const found = new Set();
  for (const pattern of patterns) {
    for (const match of `${html}\n${text}`.matchAll(pattern)) found.add(match[0].slice(0, 240));
  }
  return [...found];
}

async function fetchCapture(url) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
      accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
    },
  });
  const body = await response.text();
  return {
    requestedUrl: url,
    finalUrl: response.url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    body: body.slice(0, 2_500_000),
    bodyLength: body.length,
  };
}

const protocol = await readFile(join(root, 'docs/coordinates/coordinate-control-protocol.md'), 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batches) === EXPECTED_BATCH, `Expected protocol max batch ${EXPECTED_BATCH}.`);
assert(protocol.includes('| 194 | `regjeringskvartalet` |'), 'Batch 194 Regjeringskvartalet is missing from protocol.');

const centralAudit = await readJson(join(root, 'reports/oslo-coordinate-central-unresolved-audit-post-194/summary.json'));
assert(centralAudit.coordinateMaxBatch === EXPECTED_BATCH, 'Central audit is not post-194.');
assert(centralAudit.nextCandidate?.placeId === PLACE_ID, `Central audit next candidate is ${centralAudit.nextCandidate?.placeId}.`);

const evidence = await readJson(join(root, 'data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json'));
assert(evidence.placeId === PLACE_ID, 'Unexpected Sigrid Undset evidence file.');
assert(evidence.evidenceStatus === 'needs_research', `Expected needs_research, got ${evidence.evidenceStatus}.`);
assert(evidence.coordinateDecision === 'needs_exact_object', `Expected needs_exact_object, got ${evidence.coordinateDecision}.`);

const endpoints = [
  `${BASE}/robots.txt`,
  `${BASE}/sitemap.xml`,
  `${BASE}/sitemap_index.xml`,
  `${BASE}/search/Sigrid%20Undset`,
  `${BASE}/search/Sigrid%20Undset/objects`,
  `${BASE}/search/Sigrid%20Undset/objects/images`,
  `${BASE}/search/Kjersti%20Wexelsen%20Goks%C3%B8yr`,
  `${BASE}/search/Kjersti%20Wexelsen%20Goks%C3%B8yr/objects`,
  `${BASE}/search/Stensparken`,
  `${BASE}/search/Stensparken/objects`,
  `${BASE}/objects?search=Sigrid%20Undset`,
  `${BASE}/?search=Sigrid%20Undset`,
];

await mkdir(join(reportDir, 'responses'), { recursive: true });
const captures = [];
const objectLinks = new Set();
const scriptLinks = new Set();
for (let i = 0; i < endpoints.length; i += 1) {
  const capture = await fetchCapture(endpoints[i]);
  const text = visibleText(capture.body);
  const row = {
    requestedUrl: capture.requestedUrl,
    finalUrl: capture.finalUrl,
    status: capture.status,
    ok: capture.ok,
    contentType: capture.contentType,
    bodyLength: capture.bodyLength,
    termFlags: termFlags(text),
    objectLinks: extractObjectLinks(capture.body, capture.finalUrl),
    scriptLinks: extractScripts(capture.body, capture.finalUrl),
    coordinateSignals: coordinateSignals(capture.body, text),
    responseFile: `responses/${safeName(capture.requestedUrl, i)}`,
  };
  captures.push(row);
  row.objectLinks.forEach((url) => objectLinks.add(url));
  row.scriptLinks.forEach((url) => scriptLinks.add(url));
  await writeFile(join(reportDir, row.responseFile), capture.body, 'utf8');
}

const scriptFindings = [];
for (const [index, url] of [...scriptLinks].slice(0, 30).entries()) {
  const capture = await fetchCapture(url);
  const body = capture.body;
  const folded = body.toLocaleLowerCase('nb-NO');
  const hits = [];
  for (const needle of ['sigrid undset', 'goksøyr', 'goksoyr', 'stensparken', '/api/', 'graphql', 'objects/search']) {
    let cursor = 0;
    while ((cursor = folded.indexOf(needle, cursor)) >= 0 && hits.length < 80) {
      hits.push({ needle, snippet: body.slice(Math.max(0, cursor - 180), cursor + needle.length + 260) });
      cursor += needle.length;
    }
  }
  const apiUrls = [...new Set([...body.matchAll(/https?:\\?\/\\?\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]+/g)].map((match) => match[0].replaceAll('\\/', '/')).filter((value) => /api|graphql|search|object/i.test(value)).slice(0, 100))];
  scriptFindings.push({
    url,
    status: capture.status,
    contentType: capture.contentType,
    bodyLength: capture.bodyLength,
    hits,
    apiUrls,
  });
  if (hits.length || apiUrls.length) {
    await writeFile(join(reportDir, `responses/script-${String(index).padStart(2, '0')}.txt`), body, 'utf8');
  }
}

const objectRecords = [];
for (const [index, url] of [...objectLinks].slice(0, 80).entries()) {
  const capture = await fetchCapture(url);
  const text = visibleText(capture.body);
  const flags = termFlags(text);
  const title = text.match(/(?:^|\s)(Sigrid Undset)(?:\s|$)/i)?.[1]
    ?? capture.body.match(/<h1[^>]*>\s*([^<]+?)\s*<\/h1>/i)?.[1]?.trim()
    ?? null;
  const record = {
    url: capture.finalUrl,
    requestedUrl: url,
    status: capture.status,
    contentType: capture.contentType,
    bodyLength: capture.bodyLength,
    title,
    termFlags: flags,
    coordinateSignals: coordinateSignals(capture.body, text),
    visibleTextExcerpt: text.slice(0, 12_000),
    responseFile: `responses/object-${String(index).padStart(2, '0')}-${new URL(url).pathname.split('/').filter(Boolean).slice(-2).join('-')}.html`,
  };
  objectRecords.push(record);
  await writeFile(join(reportDir, record.responseFile), capture.body, 'utf8');
}

const exactRecords = objectRecords.filter((record) => record.termFlags.sigridUndset && (record.termFlags.artistFull || record.termFlags.artistSurname));
const exactWithCoordinates = exactRecords.filter((record) => record.coordinateSignals.length > 0);

const osmResponse = await fetch(`https://api.openstreetmap.org/api/0.6/node/${OSM_NODE_ID}.json`, {
  headers: { 'user-agent': 'History-Go-coordinate-control/1.0', accept: 'application/json' },
});
assert(osmResponse.ok, `OSM node fetch failed ${osmResponse.status}.`);
const osmPayload = await osmResponse.json();
const osmNode = osmPayload.elements?.find((element) => element.type === 'node' && element.id === OSM_NODE_ID);
assert(osmNode, `OSM node ${OSM_NODE_ID} missing.`);
const osmTags = osmNode.tags ?? {};

const officialMaterialSignals = {
  granite: exactRecords.some((record) => record.termFlags.granite),
  bronze: exactRecords.some((record) => record.termFlags.bronze),
};
const materialCrosscheck = {
  osmMaterial: osmTags.material ?? null,
  officialMaterialSignals,
  contradiction: officialMaterialSignals.granite && String(osmTags.material).toLowerCase() === 'bronze',
  unresolved: exactRecords.length === 0 || (!officialMaterialSignals.granite && !officialMaterialSignals.bronze),
};

const summary = {
  version: REPORT_DATE,
  placeId: PLACE_ID,
  coordinateMaxBatch: EXPECTED_BATCH,
  source: {
    provider: 'Oslo kommunes kunstsamling',
    system: 'eMuseum',
    baseUrl: BASE,
  },
  endpointCaptures: captures,
  discoveredObjectLinkCount: objectLinks.size,
  discoveredScriptLinkCount: scriptLinks.size,
  scriptFindings,
  objectRecords,
  exactRecordCount: exactRecords.length,
  exactRecords,
  exactRecordWithCoordinateCount: exactWithCoordinates.length,
  exactRecordsWithCoordinates: exactWithCoordinates,
  osmCandidate: {
    sourceObjectId: `osm-node:${OSM_NODE_ID}`,
    lat: osmNode.lat,
    lon: osmNode.lon,
    tags: osmTags,
  },
  materialCrosscheck,
  canPromote: exactWithCoordinates.length === 1 && !materialCrosscheck.contradiction,
  decision: exactWithCoordinates.length === 1 && !materialCrosscheck.contradiction
    ? 'official_exact_object_coordinate_candidate'
    : exactRecords.length > 0
      ? 'official_identity_found_but_exact_coordinate_still_blocked'
      : 'official_collection_search_did_not_resolve_exact_object_record',
  nextAction: exactWithCoordinates.length === 1 && !materialCrosscheck.contradiction
    ? 'Use the one official eMuseum coordinate only after canonical collision and source-contract validation.'
    : materialCrosscheck.contradiction
      ? 'Do not promote the nearby OSM node until its bronze tag is visually or authoritatively reconciled with the official granite sculpture.'
      : 'Retain needs_source; request or locate one machine-traceable collection/location record rather than using nearest artwork logic.',
};

await writeJson(join(reportDir, 'summary.json'), summary);
await writeJson(join(reportDir, 'osm-node-7596280553.json'), osmPayload);

const readme = [
  '# Sigrid Undset statue — Oslo eMuseum exact-object research after batch 194',
  '',
  `Date: ${REPORT_DATE}`,
  '',
  `- searched official eMuseum endpoints: ${captures.length}`,
  `- discovered object links: ${objectLinks.size}`,
  `- inspected object records: ${objectRecords.length}`,
  `- exact Sigrid Undset + Goksøyr records: ${exactRecords.length}`,
  `- exact official records with coordinate signals: ${exactWithCoordinates.length}`,
  `- OSM candidate material: ${osmTags.material ?? 'missing'}`,
  `- official material contradiction: ${materialCrosscheck.contradiction}`,
  '',
  `Decision: **${summary.decision}**`,
  '',
  summary.nextAction,
  '',
  'No canonical place, coordinate, evidence or protocol data changed in this research PR.',
  '',
].join('\n');
await writeFile(join(reportDir, 'README.md'), `${readme}\n`, 'utf8');

console.log(JSON.stringify({
  placeId: PLACE_ID,
  coordinateMaxBatch: EXPECTED_BATCH,
  discoveredObjectLinkCount: objectLinks.size,
  exactRecordCount: exactRecords.length,
  exactRecordWithCoordinateCount: exactWithCoordinates.length,
  materialCrosscheck,
  decision: summary.decision,
  nextAction: summary.nextAction,
}, null, 2));
