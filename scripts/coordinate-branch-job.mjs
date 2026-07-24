import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placeId = 'bygdoy_kongsgard_salamanderdam';
const hostPlaceId = 'bygdoy_kongsgard';
const reportRel = 'reports/oslo-coordinate-bygdoy-kongsgard-salamander-model-audit-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/bygdoy_kongsgard_salamanderdam.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/bygdoy_kongsgard_salamanderdam.json';
const hostRel = 'data/places/historie/oslo/places_historie/bygdoy_kongsgard.json';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .trim();
const containsAny = (value, needles) => {
  const text = normalize(value);
  return needles.some((needle) => text.includes(normalize(needle)));
};
const safeName = (value) => normalize(value).replace(/\s+/g, '-').replace(/^-|-$/g, '');
const haversineMeters = (a, b) => {
  const rad = (degrees) => degrees * Math.PI / 180;
  const earth = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
};

await fs.mkdir(reportDir, { recursive: true });

const captures = [];
const capture = async ({ label, url, options = {}, expect = 'auto' }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let status = 0;
  let finalUrl = url;
  let contentType = '';
  let body = '';
  let error = null;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'user-agent': 'History-Go-coordinate-audit/1.0 (+https://github.com/Paradispartiet/History-Go)',
        accept: '*/*',
        ...(options.headers ?? {}),
      },
      signal: controller.signal,
    });
    status = response.status;
    finalUrl = response.url;
    contentType = response.headers.get('content-type') ?? '';
    body = await response.text();
  } catch (caught) {
    error = String(caught);
  } finally {
    clearTimeout(timeout);
  }

  const extension = expect === 'json' || contentType.includes('json') ? 'json' : 'html';
  const file = `${safeName(label)}.${extension}`;
  await fs.writeFile(path.join(reportDir, file), body, 'utf8');
  let json = null;
  if (extension === 'json' || body.trim().startsWith('{') || body.trim().startsWith('[')) {
    try { json = JSON.parse(body); } catch { json = null; }
  }
  const metadata = {
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
  captures.push(metadata);
  return { ...metadata, body, json };
};

const protocol = await readText('docs/coordinates/coordinate-control-protocol.md');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 already exists; rerun this model audit from the new state.');

const previous = await readJson('reports/oslo-coordinate-retire-bygdoy-roykenvika-post-195/summary.json');
assert(previous.decision === 'retired_without_replacement', 'Røykensvika retirement is not the merged queue predecessor.');
assert(previous.nextQueueCandidate === placeId, `Expected next queue candidate ${placeId}, got ${previous.nextQueueCandidate}`);

const placeBeforeText = await readText(placeRel);
const evidenceBeforeText = await readText(evidenceRel);
const hostBeforeText = await readText(hostRel);
const place = JSON.parse(placeBeforeText);
const evidence = JSON.parse(evidenceBeforeText);
const host = JSON.parse(hostBeforeText);

assert(place.id === placeId, 'Salamander place file has the wrong ID.');
assert(place.coordStatus === 'needs_source', 'Salamander place is no longer unresolved.');
assert(place.locatorType === 'thematic_locality', 'Salamander place is no longer modeled as a thematic locality.');
assert(evidence.placeId === placeId, 'Coordinate evidence has the wrong place ID.');
assert(evidence.identity?.identityStatus === 'resolved', 'Salamander locality identity is no longer resolved.');
assert(evidence.decision?.canBecomeVerified === false, 'Evidence already permits coordinate verification.');
assert(host.id === hostPlaceId, 'Host place has the wrong ID.');
assert(host.coordStatus === 'verified_geometry', 'Host place is not a verified canonical place.');
assert(place.quiz_profile?.avoid_angles?.includes('presis_lokalisering_av_sarbare_individer'), 'The canonical safety constraint against precise sensitive locality is missing.');

const naturarvExact = await capture({
  label: 'norsk-naturarv-dam-kongsgaarden-bygdoy',
  url: 'https://www.naturarv.no/dam-paa-kongsgaarden-bygdoey-oslo.323262-36137.html',
});
const naturarvHost = await capture({
  label: 'norsk-naturarv-bygdoy-kongsgard',
  url: 'https://www.naturarv.no/bygdoey-kongsgaard.371995-72064.html',
});
const royalCourt = await capture({
  label: 'royal-court-bygdo-royal-farm',
  url: 'https://www.royalcourt.no/the-royal-residences/bygdo-royal-farm',
});
const officialFarm = await capture({
  label: 'bygdoy-kongsgard-home',
  url: 'https://bygdokongsgard.no/',
});

const kartverketTerms = [
  'Bygdøy Kongsgård salamanderdam',
  'Bygdøy Kongsgård dam',
  'Kongsgårdsdammen Bygdøy',
  'Salamanderdammen Bygdøy',
];
const kartverketRows = [];
for (const term of kartverketTerms) {
  const url = new URL('https://api.kartverket.no/stedsnavn/v1/navn');
  url.searchParams.set('sok', term);
  url.searchParams.set('fuzzy', 'true');
  url.searchParams.set('treffPerSide', '100');
  url.searchParams.set('side', '1');
  const result = await capture({ label: `kartverket-${term}`, url: url.toString(), expect: 'json' });
  const rows = Array.isArray(result.json?.navn) ? result.json.navn : [];
  kartverketRows.push(...rows.map((row) => ({ term, row })));
}

const osloSearches = [];
for (const term of ['"Bygdøy Kongsgård" salamander dam', '"Bygdøy Kongsgård salamanderdam"']) {
  const url = new URL('https://www.oslo.kommune.no/sok/');
  url.searchParams.set('q', term);
  const result = await capture({ label: `oslo-kommune-${term}`, url: url.toString() });
  osloSearches.push({ term, result });
}

const overpassQuery = `[out:json][timeout:30];\n(\n  nwr["natural"="water"](59.9000,10.6700,59.9180,10.6940);\n  nwr["water"="pond"](59.9000,10.6700,59.9180,10.6940);\n  nwr["name"~"salamander|kongsgård|kongsgard|dam",i](59.9000,10.6700,59.9180,10.6940);\n);\nout center tags;`;
const overpass = await capture({
  label: 'overpass-bygdoy-kongsgard-water-context',
  url: 'https://overpass-api.de/api/interpreter',
  options: {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: overpassQuery }).toString(),
  },
  expect: 'json',
});

const reverseUrl = new URL('https://nominatim.openstreetmap.org/reverse');
reverseUrl.searchParams.set('format', 'jsonv2');
reverseUrl.searchParams.set('lat', String(place.lat));
reverseUrl.searchParams.set('lon', String(place.lon));
reverseUrl.searchParams.set('zoom', '18');
reverseUrl.searchParams.set('addressdetails', '1');
const reverse = await capture({ label: 'nominatim-reverse-current-proxy', url: reverseUrl.toString(), expect: 'json' });

const sourceText = `${naturarvExact.body}\n${naturarvHost.body}`;
const identityDocumented = naturarvExact.ok && containsAny(sourceText, ['Dam på Kongsgården', 'Bygdøy kongsgård']) && containsAny(sourceText, ['stor salamander', 'storsalamander']);
const sourceHasPublicCoordinates = containsAny(sourceText, ['GPS-koordinat', 'GPS koordinat', 'latitude', 'longitude', 'breddegrad', 'lengdegrad']);
const sourceHasAreaDescription = containsAny(sourceText, ['1800 m²', '1800 m2']) && containsAny(sourceText, ['lysåpent parklandskap', 'parklandskap']);

const exactNameTerms = ['bygdøy kongsgård salamanderdam', 'bygdøy kongsgård dam', 'kongsgårdsdammen', 'salamanderdammen'];
const kartverketOsloExact = kartverketRows.filter(({ row }) => {
  const exactName = exactNameTerms.includes(normalize(row.skrivemåte));
  const oslo = (row.kommuner ?? []).some((municipality) => municipality.kommunenummer === '0301' || normalize(municipality.kommunenavn) === 'oslo');
  return exactName && oslo;
});

const waterElements = Array.isArray(overpass.json?.elements) ? overpass.json.elements : [];
const namedWaterElements = waterElements.filter((element) => element.tags?.name || element.tags?.official_name || element.tags?.alt_name);
const exactNamedWaterElements = namedWaterElements.filter((element) => containsAny(
  `${element.tags?.name ?? ''} ${element.tags?.official_name ?? ''} ${element.tags?.alt_name ?? ''}`,
  exactNameTerms,
));

const osloMunicipalityExactSnippets = osloSearches.flatMap(({ term, result }) => {
  const text = result.body.replace(/\s+/g, ' ');
  const normalized = normalize(text);
  return exactNameTerms.some((needle) => normalized.includes(normalize(needle))) ? [{ term, excerpt: text.slice(0, 2000) }] : [];
});

const currentProxyDistanceToHostMeters = Math.round(haversineMeters(
  { lat: Number(place.lat), lon: Number(place.lon) },
  { lat: Number(host.lat), lon: Number(host.lon) },
));

const sourceFamiliesAvailable = {
  norskNaturarv: naturarvExact.ok && naturarvHost.ok,
  officialHostSources: royalCourt.ok || officialFarm.ok,
  kartverket: captures.filter((item) => item.label.startsWith('kartverket-')).every((item) => item.ok),
  osloMunicipality: osloSearches.every(({ result }) => result.ok),
  overpassContext: overpass.ok && Boolean(overpass.json),
};
assert(sourceFamiliesAvailable.norskNaturarv, 'Norsk Naturarv source family was unavailable.');
assert(sourceFamiliesAvailable.kartverket, 'Kartverket source family was incomplete.');
assert(sourceFamiliesAvailable.osloMunicipality, 'Oslo municipality source family was incomplete.');
assert(identityDocumented, 'The locality identity was not recovered from the locked source.');

const publicNamedGeometryFound = kartverketOsloExact.length > 0 || exactNamedWaterElements.length > 0;
const decision = publicNamedGeometryFound
  ? 'public_named_geometry_candidate_requires_manual_review'
  : 'model_as_thematic_relation_retire_separate_marker';

const recommendation = decision === 'model_as_thematic_relation_retire_separate_marker'
  ? 'Preserve the documented salamander knowledge as a thematic nature relation, leksikon/quiz material or route content attached to bygdoy_kongsgard, but remove the separate active map marker. Do not publish a precise habitat coordinate. Rewrite the host place text that currently asserts the salamander pond must remain a separate canonical place.'
  : 'Manually review the public named geometry and its sensitivity before any coordinate can be selected. Unnamed OSM water geometry and the current proxy are not sufficient.';

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId,
  hostPlaceId,
  researchOnly: true,
  canonicalChanged: false,
  coordinatePromoted: false,
  sourcePredecessor: 'reports/oslo-coordinate-retire-bygdoy-roykenvika-post-195/summary.json',
  hardGates: {
    queueHeadMatches: true,
    identityResolved: true,
    coordinateNeedsSource: true,
    currentLocatorType: place.locatorType,
    preciseSensitiveLocalityAvoidancePresent: true,
    hostPlaceVerified: true,
    noBatch196: true,
  },
  findings: {
    identityDocumented,
    sourceHasAreaDescription,
    sourceHasPublicCoordinates,
    currentProxyDistanceToHostMeters,
    kartverketOsloExactCandidates: kartverketOsloExact.length,
    osloMunicipalityExactSnippets: osloMunicipalityExactSnippets.length,
    overpassWaterElements: waterElements.length,
    overpassNamedWaterElements: namedWaterElements.length,
    overpassExactNamedWaterElements: exactNamedWaterElements.length,
    currentProxyReverse: reverse.json ?? null,
  },
  publicNamedGeometryCandidates: {
    kartverket: kartverketOsloExact,
    overpassContextualOnly: exactNamedWaterElements,
  },
  sourceFamiliesAvailable,
  decision,
  recommendation,
  safetyReason: 'The canonical quiz profile explicitly forbids precise localization of vulnerable individuals, while the source documents an amphibian breeding locality but supplies no public coordinate. A broad farm proxy cannot truthfully represent the pond and a newly inferred precise pond marker would be unnecessary exposure.',
  sourceHashesBefore: {
    place: sha256(placeBeforeText),
    evidence: sha256(evidenceBeforeText),
    hostPlace: sha256(hostBeforeText),
  },
  captures,
};

await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Bygdøy Kongsgård salamander model audit after batch 195\n\n- Place: **\`${placeId}\`**\n- Host place: **\`${hostPlaceId}\`**\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical data changed: **no**\n- Identity documented: **${identityDocumented ? 'yes' : 'no'}**\n- Public source coordinate: **${sourceHasPublicCoordinates ? 'yes' : 'no'}**\n- Exact Kartverket Oslo candidate: **${kartverketOsloExact.length}**\n- Exact named water geometry in bounded OSM context: **${exactNamedWaterElements.length}**\n- Decision: **\`${decision}\`**\n\n${recommendation}\n`, 'utf8');

assert(await readText(placeRel) === placeBeforeText, 'Research-only audit changed the salamander place.');
assert(await readText(evidenceRel) === evidenceBeforeText, 'Research-only audit changed coordinate evidence.');
assert(await readText(hostRel) === hostBeforeText, 'Research-only audit changed the host place.');

console.log(JSON.stringify({
  status: 'model_audit_complete',
  reportDir: reportRel,
  placeId,
  decision,
  sourceHasPublicCoordinates,
  kartverketOsloExactCandidates: kartverketOsloExact.length,
  overpassExactNamedWaterElements: exactNamedWaterElements.length,
  canonicalChanged: false,
}, null, 2));
