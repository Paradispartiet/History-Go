import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_roykenvika.json';
const aggregateRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/bygdoy_roykenvika.json';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .trim();

const variants = [
  'Røykensvika',
  'Røykensvik',
  'Røykenvika',
  'Røykenvik',
  'Røykensviken',
  'Røykensviga',
  'Røikensvika',
  'Røkensvika',
];
const normalizedVariants = new Set(variants.map(normalize));
const bygdoyTokens = ['bygdøy', 'bygdoy', 'oslo', '0301'];

const containsVariant = (value) => {
  const text = normalize(value);
  return [...normalizedVariants].some((variant) => text.includes(variant));
};

const containsBygdoyContext = (value) => {
  const text = normalize(value);
  return bygdoyTokens.some((token) => text.includes(normalize(token)));
};

const collectObjects = (value, output = []) => {
  if (!value || typeof value !== 'object') return output;
  if (!Array.isArray(value)) output.push(value);
  for (const child of Object.values(value)) collectObjects(child, output);
  return output;
};

const compactObject = (value) => {
  const text = JSON.stringify(value);
  return text.length <= 1600 ? value : { excerpt: text.slice(0, 1600), truncated: true };
};

const extractRelevantObjects = (json) => collectObjects(json)
  .filter((object) => containsVariant(JSON.stringify(object)))
  .slice(0, 50)
  .map(compactObject);

const extractTextSnippets = (text, needles) => {
  const lower = text.toLowerCase();
  const snippets = [];
  for (const needle of needles) {
    const encodedNeedle = needle.toLowerCase();
    let index = lower.indexOf(encodedNeedle);
    let found = 0;
    while (index >= 0 && found < 8) {
      snippets.push({
        needle,
        snippet: text.slice(Math.max(0, index - 240), Math.min(text.length, index + encodedNeedle.length + 420))
          .replace(/\s+/g, ' ')
          .trim(),
      });
      found += 1;
      index = lower.indexOf(encodedNeedle, index + encodedNeedle.length);
    }
  }
  return snippets;
};

const safeName = (value) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

await fs.mkdir(reportDir, { recursive: true });

const captures = [];
const fetchCapture = async ({ label, url, options = {}, expect = 'auto' }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const headers = {
    'user-agent': 'History-Go-coordinate-audit/1.0 (+https://github.com/Paradispartiet/History-Go)',
    accept: '*/*',
    ...(options.headers ?? {}),
  };
  let status = 0;
  let finalUrl = url;
  let contentType = '';
  let body = '';
  let error = null;
  try {
    const response = await fetch(url, { ...options, headers, signal: controller.signal });
    status = response.status;
    finalUrl = response.url;
    contentType = response.headers.get('content-type') ?? '';
    body = await response.text();
  } catch (caught) {
    error = String(caught);
  } finally {
    clearTimeout(timeout);
  }

  const extension = expect === 'json' || contentType.includes('json') ? 'json' : expect === 'xml' || contentType.includes('xml') ? 'xml' : 'html';
  const file = `${safeName(label)}.${extension}`;
  await fs.writeFile(path.join(reportDir, file), body, 'utf8');

  let json = null;
  if (body && (extension === 'json' || body.trim().startsWith('{') || body.trim().startsWith('['))) {
    try {
      json = JSON.parse(body);
    } catch {
      json = null;
    }
  }

  const capture = {
    label,
    requestedUrl: url,
    finalUrl,
    status,
    ok: status >= 200 && status < 300,
    contentType,
    bytes: Buffer.byteLength(body),
    sha256: sha256(body),
    reportFile: `${reportRel}/${file}`,
    error,
  };
  captures.push(capture);
  return { ...capture, body, json };
};

const protocol = await readText('docs/coordinates/coordinate-control-protocol.md');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 already exists; rerun identity research from the new state.');

const exhaustionAudit = await readJson('reports/oslo-coordinate-research-exhaustion-audit-post-195/summary.json');
assert(exhaustionAudit.nextCandidate?.placeId === 'bygdoy_roykenvika', 'Røykensvika is no longer the audited next candidate.');
assert(exhaustionAudit.nextCandidate?.decision === 'research_identity_before_coordinate', 'The queue no longer requires identity-first research.');

const placeBeforeText = await readText(placeRel);
const aggregateBeforeText = await readText(aggregateRel);
const evidenceBeforeText = await readText(evidenceRel);
const place = JSON.parse(placeBeforeText);
const evidence = JSON.parse(evidenceBeforeText);
assert(place.id === 'bygdoy_roykenvika', 'Split place record has the wrong placeId.');
assert(place.coordStatus === 'needs_source', 'Røykensvika is no longer unresolved.');
assert(evidence.placeId === 'bygdoy_roykenvika', 'Evidence file has the wrong placeId.');
assert(evidence.identity?.identityStatus === 'unresolved', 'Røykensvika identity is no longer unresolved.');
assert(evidence.decision?.canBecomeVerified === false, 'Evidence already allows coordinate verification.');

const kartverketResults = [];
for (const variant of variants) {
  const base = new URL('https://api.kartverket.no/stedsnavn/v1/navn');
  base.searchParams.set('sok', variant);
  base.searchParams.set('fuzzy', 'true');
  base.searchParams.set('treffPerSide', '100');
  base.searchParams.set('side', '1');
  const nationwide = await fetchCapture({
    label: `kartverket-stedsnavn-${variant}-nationwide`,
    url: base.toString(),
    expect: 'json',
  });
  kartverketResults.push({ variant, scope: 'nationwide', ...nationwide });
  await sleep(150);

  const oslo = new URL(base);
  oslo.searchParams.set('kommunenummer', '0301');
  const municipality = await fetchCapture({
    label: `kartverket-stedsnavn-${variant}-oslo`,
    url: oslo.toString(),
    expect: 'json',
  });
  kartverketResults.push({ variant, scope: 'oslo', ...municipality });
  await sleep(150);
}

const mediaWikiSources = [
  ['oslo-byleksikon', 'https://oslobyleksikon.no/api.php'],
  ['lokalhistoriewiki', 'https://lokalhistoriewiki.no/api.php'],
];
const mediaWikiResults = [];
for (const [source, endpoint] of mediaWikiSources) {
  for (const variant of ['Røykensvika', 'Røykensvik', 'Røykenvika']) {
    const url = new URL(endpoint);
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', `"${variant}" Bygdøy`);
    url.searchParams.set('srlimit', '50');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');
    const result = await fetchCapture({
      label: `${source}-search-${variant}-bygdoy`,
      url: url.toString(),
      expect: 'json',
    });
    mediaWikiResults.push({ source, variant, ...result });
    await sleep(150);
  }
}

const nbResults = [];
for (const query of [
  '"Røykensvika"',
  '"Røykensvik"',
  '"Røykenvika"',
  '"Røykensvika" Bygdøy',
  '"Røykensvik" Bygdøy',
]) {
  const url = new URL('https://api.nb.no/catalog/v1/items');
  url.searchParams.set('q', query);
  url.searchParams.set('size', '50');
  const result = await fetchCapture({
    label: `nasjonalbiblioteket-${query}`,
    url: url.toString(),
    expect: 'json',
  });
  nbResults.push({ query, ...result });
  await sleep(150);
}

const osloSearchResults = [];
for (const query of ['Røykensvika Bygdøy', 'Røykensvik Bygdøy', 'Røykenvika Bygdøy']) {
  const url = new URL('https://www.oslo.kommune.no/sok/');
  url.searchParams.set('q', query);
  const result = await fetchCapture({
    label: `oslo-kommune-search-${query}`,
    url: url.toString(),
    expect: 'html',
  });
  osloSearchResults.push({ query, ...result });
  await sleep(150);
}

const wikidataResults = [];
for (const query of ['Røykensvika', 'Røykensvik', 'Røykenvika']) {
  const url = new URL('https://www.wikidata.org/w/api.php');
  url.searchParams.set('action', 'wbsearchentities');
  url.searchParams.set('search', query);
  url.searchParams.set('language', 'nb');
  url.searchParams.set('uselang', 'nb');
  url.searchParams.set('limit', '50');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  const result = await fetchCapture({
    label: `wikidata-search-${query}`,
    url: url.toString(),
    expect: 'json',
  });
  wikidataResults.push({ query, ...result });
  await sleep(150);
}

const nominatimResults = [];
for (const query of ['Røykensvika Bygdøy Oslo', 'Røykensvik Bygdøy Oslo', 'Røykenvika Bygdøy Oslo']) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '50');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  const result = await fetchCapture({
    label: `nominatim-search-${query}`,
    url: url.toString(),
    expect: 'json',
  });
  nominatimResults.push({ query, ...result });
  await sleep(1000);
}

const reverseUrl = new URL('https://nominatim.openstreetmap.org/reverse');
reverseUrl.searchParams.set('format', 'jsonv2');
reverseUrl.searchParams.set('lat', String(place.lat));
reverseUrl.searchParams.set('lon', String(place.lon));
reverseUrl.searchParams.set('zoom', '18');
reverseUrl.searchParams.set('addressdetails', '1');
const reverseResult = await fetchCapture({
  label: 'nominatim-reverse-current-legacy-marker',
  url: reverseUrl.toString(),
  expect: 'json',
});

const overpassQuery = `[out:json][timeout:30];\n(\n  nwr["name"~"Røykensvik|Røykenvik|Røikensvik|Røkensvik",i](59.87,10.62,59.94,10.75);\n  nwr["alt_name"~"Røykensvik|Røykenvik|Røikensvik|Røkensvik",i](59.87,10.62,59.94,10.75);\n  nwr["old_name"~"Røykensvik|Røykenvik|Røikensvik|Røkensvik",i](59.87,10.62,59.94,10.75);\n);\nout center tags;`;
const overpassResult = await fetchCapture({
  label: 'overpass-bygdoy-name-variants',
  url: 'https://overpass-api.de/api/interpreter',
  options: {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: overpassQuery }).toString(),
  },
  expect: 'json',
});

const candidateGroups = {
  kartverket: kartverketResults.flatMap((result) => result.json ? extractRelevantObjects(result.json).map((candidate) => ({
    variant: result.variant,
    scope: result.scope,
    candidate,
  })) : []),
  mediaWiki: mediaWikiResults.flatMap((result) => result.json ? extractRelevantObjects(result.json).map((candidate) => ({
    source: result.source,
    variant: result.variant,
    candidate,
  })) : []),
  nasjonalbiblioteket: nbResults.flatMap((result) => result.json ? extractRelevantObjects(result.json).map((candidate) => ({
    query: result.query,
    candidate,
  })) : []),
  wikidata: wikidataResults.flatMap((result) => result.json ? extractRelevantObjects(result.json).map((candidate) => ({
    query: result.query,
    candidate,
  })) : []),
  nominatim: nominatimResults.flatMap((result) => result.json ? extractRelevantObjects(result.json).map((candidate) => ({
    query: result.query,
    candidate,
  })) : []),
  overpass: overpassResult.json ? extractRelevantObjects(overpassResult.json) : [],
};

const mediaWikiBygdoyHits = mediaWikiResults.flatMap((result) => {
  const rows = result.json?.query?.search ?? [];
  return rows.filter((row) => containsVariant(`${row.title ?? ''} ${row.snippet ?? ''}`) && containsBygdoyContext(`${row.title ?? ''} ${row.snippet ?? ''}`))
    .map((row) => ({ source: result.source, variant: result.variant, row }));
});

const kartverketBygdoyHits = candidateGroups.kartverket.filter((entry) =>
  containsBygdoyContext(JSON.stringify(entry.candidate)) || entry.scope === 'oslo');

const nbBygdoyHits = candidateGroups.nasjonalbiblioteket.filter((entry) =>
  containsBygdoyContext(JSON.stringify(entry.candidate)));

const wikidataBygdoyHits = candidateGroups.wikidata.filter((entry) =>
  containsBygdoyContext(JSON.stringify(entry.candidate)));

const nominatimBygdoyHits = candidateGroups.nominatim.filter((entry) =>
  containsBygdoyContext(JSON.stringify(entry.candidate)));

const osloHtmlSnippets = osloSearchResults.flatMap((result) => extractTextSnippets(result.body, variants)
  .filter((entry) => containsBygdoyContext(entry.snippet))
  .map((entry) => ({ query: result.query, ...entry })));

const authoritativeAvailability = {
  kartverketSuccessfulQueries: kartverketResults.filter((result) => result.ok && result.json).length,
  mediaWikiSuccessfulQueries: mediaWikiResults.filter((result) => result.ok && result.json).length,
  nationalLibrarySuccessfulQueries: nbResults.filter((result) => result.ok && result.json).length,
  osloMunicipalitySuccessfulQueries: osloSearchResults.filter((result) => result.ok).length,
};

const strongIdentitySignals = [
  ...kartverketBygdoyHits.map((hit) => ({ source: 'Kartverket stedsnavn', hit })),
  ...mediaWikiBygdoyHits.map((hit) => ({ source: hit.source, hit })),
  ...nbBygdoyHits.map((hit) => ({ source: 'Nasjonalbiblioteket', hit })),
].slice(0, 100);

let decision;
if (authoritativeAvailability.kartverketSuccessfulQueries === 0 ||
    authoritativeAvailability.mediaWikiSuccessfulQueries === 0 ||
    authoritativeAvailability.nationalLibrarySuccessfulQueries === 0) {
  decision = 'research_inconclusive_source_availability';
} else if (strongIdentitySignals.length > 0) {
  decision = 'identity_candidate_found_requires_manual_source_review';
} else {
  decision = 'identity_unsubstantiated_recommend_retirement';
}

const currentMarkerContext = {
  lat: place.lat,
  lon: place.lon,
  reverseStatus: reverseResult.status,
  reverseObject: reverseResult.json ?? null,
};

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId: place.id,
  researchOnly: true,
  canonicalChanged: false,
  sourceAudit: 'reports/oslo-coordinate-research-exhaustion-audit-post-195/summary.json',
  hardGates: {
    queueHeadIsRoykenvika: true,
    identityWasUnresolved: true,
    coordinateWasNeedsSource: true,
    noBatch196: true,
  },
  variants,
  authoritativeAvailability,
  matchCounts: {
    kartverketRelevantObjects: candidateGroups.kartverket.length,
    kartverketBygdoyHits: kartverketBygdoyHits.length,
    mediaWikiRelevantObjects: candidateGroups.mediaWiki.length,
    mediaWikiBygdoyHits: mediaWikiBygdoyHits.length,
    nationalLibraryRelevantObjects: candidateGroups.nasjonalbiblioteket.length,
    nationalLibraryBygdoyHits: nbBygdoyHits.length,
    osloMunicipalityBygdoySnippets: osloHtmlSnippets.length,
    wikidataRelevantObjects: candidateGroups.wikidata.length,
    wikidataBygdoyHits: wikidataBygdoyHits.length,
    nominatimRelevantObjects: candidateGroups.nominatim.length,
    nominatimBygdoyHits: nominatimBygdoyHits.length,
    overpassRelevantObjects: candidateGroups.overpass.length,
  },
  strongIdentitySignals,
  contextualOnlySignals: {
    osloMunicipalitySnippets: osloHtmlSnippets,
    wikidataBygdoyHits,
    nominatimBygdoyHits,
    overpassCandidates: candidateGroups.overpass,
  },
  currentMarkerContext,
  decision,
  recommendation: decision === 'identity_unsubstantiated_recommend_retirement'
    ? 'Do not select or verify a coordinate. Retire the active place marker unless a new independent credible source documents the local Bygdøy identity.'
    : decision === 'identity_candidate_found_requires_manual_source_review'
      ? 'Review each source-backed candidate and resolve identity before any coordinate or geometry is selected.'
      : 'Repeat only the unavailable authoritative source families; do not infer identity from OSM, Nominatim or the legacy point.',
  captures,
  sourceHashesBefore: {
    splitPlace: sha256(placeBeforeText),
    aggregate: sha256(aggregateBeforeText),
    evidence: sha256(evidenceBeforeText),
  },
};

await fs.writeFile(path.join(reportDir, 'candidate-groups.json'), `${JSON.stringify(candidateGroups, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const readme = `# Bygdøy Røykensvika identity research after batch 195\n\n- Place: **\`${place.id}\` — ${place.name}**\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical data changed: **no**\n- Decision: **\`${decision}\`**\n- Kartverket Bygdøy/Oslo candidate hits: **${kartverketBygdoyHits.length}**\n- Reference/wiki Bygdøy candidate hits: **${mediaWikiBygdoyHits.length}**\n- National Library Bygdøy candidate hits: **${nbBygdoyHits.length}**\n\nThis is an identity-first pass. OSM, Nominatim, Wikidata and the legacy marker are contextual only and cannot establish the place identity. No coordinate or geometry is promoted by this research.\n\n${summary.recommendation}\n`;
await fs.writeFile(path.join(reportDir, 'README.md'), readme, 'utf8');

const placeAfterText = await readText(placeRel);
const aggregateAfterText = await readText(aggregateRel);
const evidenceAfterText = await readText(evidenceRel);
assert(placeAfterText === placeBeforeText, 'Research-only job changed the split place record.');
assert(aggregateAfterText === aggregateBeforeText, 'Research-only job changed the aggregate place source.');
assert(evidenceAfterText === evidenceBeforeText, 'Research-only job changed coordinate evidence.');

console.log(JSON.stringify({
  status: 'research_complete',
  reportDir: reportRel,
  placeId: place.id,
  decision,
  strongIdentitySignalCount: strongIdentitySignals.length,
  kartverketBygdoyHits: kartverketBygdoyHits.length,
  mediaWikiBygdoyHits: mediaWikiBygdoyHits.length,
  nationalLibraryBygdoyHits: nbBygdoyHits.length,
  canonicalChanged: false,
}, null, 2));
