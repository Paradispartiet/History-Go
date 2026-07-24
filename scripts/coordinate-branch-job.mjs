import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const PLACE_ID = 'sigrid_undset_statue';
const EXPECTED_BATCH = 194;
const BASE = 'https://okk.kunstsamlingen.no';
const EXACT_EMUSEUM_ID = '168573';
const EXACT_OBJECT_ID = '2339';
const EXACT_TITLE = 'Sigrid Undset (1882-1949)';
const EXACT_ARTIST = 'Kjersti Wexelsen Goksøyr';
const EXACT_YEAR = '1990';
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

function cookieHeader(setCookies) {
  return setCookies
    .map((value) => value.split(';', 1)[0])
    .filter(Boolean)
    .join('; ');
}

async function fetchCapture(url, cookie = '') {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
      accept: 'text/html,application/xhtml+xml,application/json,application/xml;q=0.9,*/*;q=0.8',
      ...(cookie ? { cookie } : {}),
    },
  });
  const body = await response.text();
  const setCookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : response.headers.get('set-cookie')
      ? [response.headers.get('set-cookie')]
      : [];
  return {
    requestedUrl: url,
    finalUrl: response.url,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get('content-type'),
    body: body.slice(0, 3_000_000),
    bodyLength: body.length,
    setCookies,
  };
}

function exactCard(html) {
  const marker = `data-emuseum-id="${EXACT_EMUSEUM_ID}"`;
  const start = html.indexOf(marker);
  assert(start >= 0, `Exact eMuseum card ${EXACT_EMUSEUM_ID} not found.`);
  const next = html.indexOf('data-emuseum-id="', start + marker.length);
  const card = html.slice(start, next >= 0 ? next : Math.min(html.length, start + 40_000));
  const href = card.match(/<a[^>]+title="Sigrid Undset \(1882-1949\)"[^>]+href="([^"]+)"/i)?.[1]
    ?? card.match(/<a[^>]+href="([^"]+)"[^>]+title="Sigrid Undset \(1882-1949\)"/i)?.[1]
    ?? null;
  const text = visibleText(card);
  assert(href, 'Exact eMuseum card lacks detail href.');
  assert(text.includes(EXACT_ARTIST), `Exact card artist mismatch: ${text.slice(0, 500)}.`);
  assert(text.includes(EXACT_TITLE), `Exact card title mismatch: ${text.slice(0, 500)}.`);
  assert(text.includes(EXACT_YEAR), `Exact card year mismatch: ${text.slice(0, 500)}.`);
  const pathObjectId = href.match(/update-detailview-zone\/(\d+)\//)?.[1] ?? null;
  assert(pathObjectId === EXACT_OBJECT_ID, `Expected internal object ID ${EXACT_OBJECT_ID}, got ${pathObjectId}.`);
  return { html: card, text, href: decodeEntities(href), pathObjectId };
}

function metaLinks(html, baseUrl) {
  const links = [];
  for (const tagMatch of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    if (!/application\/(?:json|xml|rdf\+xml)/i.test(tag)) continue;
    const href = tag.match(/href="([^"]+)"/i)?.[1] ?? tag.match(/href='([^']+)'/i)?.[1];
    const type = tag.match(/type="([^"]+)"/i)?.[1] ?? tag.match(/type='([^']+)'/i)?.[1] ?? null;
    if (!href) continue;
    try {
      links.push({ url: new URL(decodeEntities(href), baseUrl).href, type });
    } catch {}
  }
  return links;
}

function permanentObjectLinks(html, baseUrl) {
  const links = new Set();
  for (const match of html.matchAll(/(?:href|content)=["']([^"']*\/objects\/\d+(?:\/[^"'#?\s]+)?)["']/gi)) {
    try {
      const url = new URL(decodeEntities(match[1]), baseUrl);
      if (url.hostname === 'okk.kunstsamlingen.no') links.add(url.href);
    } catch {}
  }
  return [...links];
}

function coordinateSignals(html, text) {
  const found = new Set();
  const source = `${html}\n${text}`;
  const patterns = [
    /(?:latitude|lat)["'\s:=]+(-?\d{1,3}\.\d{4,})/gi,
    /(?:longitude|lng|lon)["'\s:=]+(-?\d{1,3}\.\d{4,})/gi,
    /(-?\d{2}\.\d{4,})\s*[,;]\s*(-?\d{2}\.\d{4,})/g,
    /(?:center|coordinate|coordinates)[^\d-]{0,60}(-?\d{2}\.\d{4,})[^\d-]{1,20}(-?\d{2}\.\d{4,})/gi,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) found.add(match[0].slice(0, 300));
  }
  return [...found];
}

function fieldSignals(text) {
  const folded = text.toLocaleLowerCase('nb-NO');
  const keywords = [
    'kunstner', 'datering', 'medium', 'material', 'dimensions', 'mål', 'klassifikasjon',
    'object number', 'objektnummer', 'description', 'beskrivelse', 'on view', 'utstilt',
    'stensparken', 'sigrid undset', 'goksøyr', 'goksoyr', 'granitt', 'granite', 'bronse', 'bronze',
  ];
  const snippets = [];
  for (const keyword of keywords) {
    let cursor = 0;
    while ((cursor = folded.indexOf(keyword, cursor)) >= 0 && snippets.length < 150) {
      snippets.push({ keyword, snippet: text.slice(Math.max(0, cursor - 120), cursor + keyword.length + 320) });
      cursor += keyword.length;
    }
  }
  return snippets;
}

function materialSignals(text) {
  const folded = text.toLocaleLowerCase('nb-NO');
  return {
    granite: folded.includes('granitt') || folded.includes('granite'),
    bronze: folded.includes('bronse') || folded.includes('bronze'),
    stone: folded.includes('stein') || folded.includes('stone'),
  };
}

const protocol = await readFile(join(root, 'docs/coordinates/coordinate-control-protocol.md'), 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batches) === EXPECTED_BATCH, `Expected protocol max batch ${EXPECTED_BATCH}.`);
const evidence = await readJson(join(root, 'data/coordinate-evidence/oslo/litteratur/sigrid_undset_statue.json'));
assert(evidence.placeId === PLACE_ID, 'Unexpected evidence placeId.');
assert(evidence.evidenceStatus === 'needs_research' && evidence.coordinateDecision === 'needs_geometry', 'Evidence state changed before exact-detail follow-up.');
const previous = await readJson(join(reportDir, 'summary.json'));
assert(previous.placeId === PLACE_ID && previous.coordinateMaxBatch === EXPECTED_BATCH, 'Previous eMuseum report is not the expected post-194 pass.');
assert(previous.decision === 'official_collection_search_did_not_resolve_exact_object_record', `Unexpected prior decision ${previous.decision}.`);

const searchUrl = `${BASE}/search/Stensparken/objects/images`;
const search = await fetchCapture(searchUrl);
assert(search.ok, `Live Stensparken search failed ${search.status}.`);
const cookies = cookieHeader(search.setCookies);
const card = exactCard(search.body);
const detailUrl = new URL(card.href, search.finalUrl).href;
const detail = await fetchCapture(detailUrl, cookies);
assert(detail.ok, `Exact modal detail fetch failed ${detail.status}: ${detailUrl}.`);

const allMetaLinks = [
  ...metaLinks(search.body, search.finalUrl),
  ...metaLinks(detail.body, detail.finalUrl),
];
const uniqueMetaLinks = [...new Map(allMetaLinks.map((item) => [item.url, item])).values()];
const metaCaptures = [];
for (const [index, item] of uniqueMetaLinks.entries()) {
  const capture = await fetchCapture(item.url, cookies);
  let parsed = null;
  if (/json/i.test(item.type ?? '') || /json/i.test(capture.contentType ?? '')) {
    try { parsed = JSON.parse(capture.body); } catch {}
  }
  metaCaptures.push({
    url: item.url,
    type: item.type,
    status: capture.status,
    finalUrl: capture.finalUrl,
    contentType: capture.contentType,
    bodyLength: capture.bodyLength,
    parsed,
    responseFile: `responses/detail-meta-${String(index).padStart(2, '0')}.${/json/i.test(item.type ?? '') ? 'json' : 'txt'}`,
  });
  await writeFile(join(reportDir, metaCaptures.at(-1).responseFile), capture.body, 'utf8');
}

const directCandidates = [
  `${BASE}/objects/${EXACT_OBJECT_ID}/sigrid-undset-1882-1949`,
  `${BASE}/objects/${EXACT_OBJECT_ID}/sigrid-undset-18821949`,
  `${BASE}/objects/${EXACT_OBJECT_ID}/sigrid-undset`,
  `${BASE}/objects/${EXACT_OBJECT_ID}`,
  `${BASE}/objects/${EXACT_EMUSEUM_ID}/sigrid-undset-1882-1949`,
  `${BASE}/objects/${EXACT_EMUSEUM_ID}`,
];
const directCaptures = [];
for (const [index, url] of directCandidates.entries()) {
  const capture = await fetchCapture(url, cookies);
  const text = visibleText(capture.body);
  directCaptures.push({
    requestedUrl: url,
    finalUrl: capture.finalUrl,
    status: capture.status,
    ok: capture.ok,
    contentType: capture.contentType,
    bodyLength: capture.bodyLength,
    exactTitle: text.includes(EXACT_TITLE),
    exactArtist: text.includes(EXACT_ARTIST),
    exactYear: text.includes(EXACT_YEAR),
    coordinateSignals: coordinateSignals(capture.body, text),
    materialSignals: materialSignals(text),
    permanentObjectLinks: permanentObjectLinks(capture.body, capture.finalUrl),
    fieldSignals: fieldSignals(text),
    visibleTextExcerpt: text.slice(0, 18_000),
    responseFile: `responses/direct-object-${String(index).padStart(2, '0')}.html`,
  });
  await writeFile(join(reportDir, directCaptures.at(-1).responseFile), capture.body, 'utf8');
}

const detailText = visibleText(detail.body);
const detailResearch = {
  liveSearch: {
    requestedUrl: searchUrl,
    finalUrl: search.finalUrl,
    status: search.status,
    bodyLength: search.bodyLength,
    metaLinks: metaLinks(search.body, search.finalUrl),
    responseFile: 'responses/live-stensparken-search.html',
  },
  exactCard: {
    emuseumId: EXACT_EMUSEUM_ID,
    internalObjectId: card.pathObjectId,
    title: EXACT_TITLE,
    artist: EXACT_ARTIST,
    year: Number(EXACT_YEAR),
    detailHref: card.href,
    detailUrl,
    visibleText: card.text,
  },
  modalDetail: {
    status: detail.status,
    finalUrl: detail.finalUrl,
    contentType: detail.contentType,
    bodyLength: detail.bodyLength,
    exactTitle: detailText.includes(EXACT_TITLE),
    exactArtist: detailText.includes(EXACT_ARTIST),
    exactYear: detailText.includes(EXACT_YEAR),
    coordinateSignals: coordinateSignals(detail.body, detailText),
    materialSignals: materialSignals(detailText),
    permanentObjectLinks: permanentObjectLinks(detail.body, detail.finalUrl),
    fieldSignals: fieldSignals(detailText),
    visibleTextExcerpt: detailText.slice(0, 25_000),
    responseFile: 'responses/exact-modal-detail.html',
  },
  metaCaptures,
  directCaptures,
};
await writeFile(join(reportDir, detailResearch.liveSearch.responseFile), search.body, 'utf8');
await writeFile(join(reportDir, detailResearch.modalDetail.responseFile), detail.body, 'utf8');

const exactDirectPages = directCaptures.filter((capture) => capture.ok && capture.exactTitle && capture.exactArtist);
const coordinateBearingSources = [
  detailResearch.modalDetail,
  ...exactDirectPages,
].filter((source) => source.coordinateSignals.length > 0);
const allMaterial = [detailResearch.modalDetail, ...exactDirectPages].reduce((acc, source) => ({
  granite: acc.granite || source.materialSignals.granite,
  bronze: acc.bronze || source.materialSignals.bronze,
  stone: acc.stone || source.materialSignals.stone,
}), { granite: false, bronze: false, stone: false });
const osmMaterial = String(previous.osmCandidate?.tags?.material ?? '').toLocaleLowerCase('nb-NO');
const materialContradiction = (allMaterial.granite || allMaterial.stone) && osmMaterial === 'bronze';

const detailDecision = coordinateBearingSources.length === 1 && !materialContradiction
  ? 'official_exact_object_coordinate_candidate'
  : exactDirectPages.length > 0
    ? 'official_exact_object_record_without_usable_coordinate'
    : detailResearch.modalDetail.exactTitle && detailResearch.modalDetail.exactArtist
      ? 'official_modal_object_record_without_usable_coordinate'
      : 'official_exact_card_found_but_detail_record_unresolved';
const nextAction = coordinateBearingSources.length === 1 && !materialContradiction
  ? 'Validate the single official coordinate signal against the object record, canonical collision gate and live OSM before production.'
  : materialContradiction
    ? 'Do not promote osm-node:7596280553 until the bronze tag is reconciled with the official object material.'
    : 'Keep needs_source; the official object identity is machine-traceable, but one exact public coordinate or authoritative crosswalk to the physical node is still required.';

const revised = {
  ...previous,
  exactResultCardFound: true,
  exactResultCard: detailResearch.exactCard,
  detailResearch,
  exactDirectObjectPageCount: exactDirectPages.length,
  exactDirectObjectPages: exactDirectPages.map((capture) => ({
    requestedUrl: capture.requestedUrl,
    finalUrl: capture.finalUrl,
    status: capture.status,
    coordinateSignals: capture.coordinateSignals,
    materialSignals: capture.materialSignals,
  })),
  coordinateBearingOfficialSourceCount: coordinateBearingSources.length,
  officialDetailMaterialSignals: allMaterial,
  materialCrosscheck: {
    ...previous.materialCrosscheck,
    officialMaterialSignals: allMaterial,
    contradiction: materialContradiction,
    unresolved: !allMaterial.granite && !allMaterial.bronze && !allMaterial.stone,
  },
  canPromote: coordinateBearingSources.length === 1 && !materialContradiction,
  decision: detailDecision,
  nextAction,
};
await writeJson(join(reportDir, 'summary.json'), revised);
await writeJson(join(reportDir, 'detail-followup.json'), detailResearch);

const readme = [
  '# Sigrid Undset statue — Oslo eMuseum exact-object research after batch 194',
  '',
  'Date: 2026-07-24',
  '',
  `- exact eMuseum result card: ${EXACT_EMUSEUM_ID}`,
  `- internal eMuseum object ID: ${EXACT_OBJECT_ID}`,
  `- exact title: ${EXACT_TITLE}`,
  `- exact artist: ${EXACT_ARTIST}`,
  `- date: ${EXACT_YEAR}`,
  `- exact permanent object pages resolved: ${exactDirectPages.length}`,
  `- official coordinate-bearing sources: ${coordinateBearingSources.length}`,
  `- OSM candidate material: ${previous.osmCandidate?.tags?.material ?? 'missing'}`,
  `- official material contradiction: ${materialContradiction}`,
  '',
  `Decision: **${detailDecision}**`,
  '',
  nextAction,
  '',
  'No canonical place, coordinate, evidence or protocol data changed in this research PR.',
  '',
].join('\n');
await writeFile(join(reportDir, 'README.md'), `${readme}\n`, 'utf8');

console.log(JSON.stringify({
  placeId: PLACE_ID,
  exactResultCard: detailResearch.exactCard,
  modalDetailStatus: detail.status,
  exactDirectObjectPageCount: exactDirectPages.length,
  coordinateBearingOfficialSourceCount: coordinateBearingSources.length,
  officialDetailMaterialSignals: allMaterial,
  materialContradiction,
  decision: detailDecision,
  nextAction,
}, null, 2));
