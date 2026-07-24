import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placeId = 'ostensjovannet_sivbelte';
const parentId = 'ostensjovannet';
const reportRel = 'reports/oslo-coordinate-ostensjovannet-sivbelte-model-audit-post-195';
const reportDir = path.join(root, reportRel);
const placeRel = 'data/places/natur/oslo/places_oslo_natur_ostensjovannet/ostensjovannet_sivbelte.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/ostensjovannet_sivbelte.json';
const parentRel = 'data/places/natur/oslo/places_oslo_natur_hovedsteder/ostensjovannet.json';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9æøå]+/g, ' ')
  .trim();
const safeName = (value) => normalize(value).replace(/\s+/g, '-').replace(/^-|-$/g, '');
const containsAny = (value, needles) => {
  const text = normalize(value);
  return needles.some((needle) => text.includes(normalize(needle)));
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
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 already exists; rerun this audit from the new state.');

const predecessor = await readJson('reports/oslo-coordinate-retire-bygdoy-kongsgard-salamanderdam-post-195/summary.json');
assert(predecessor.decision === 'disabled_separate_marker_migrated_to_verified_host', 'Salamander migration is not the merged queue predecessor.');
assert(predecessor.nextQueueCandidate === placeId, `Expected next queue candidate ${placeId}, got ${predecessor.nextQueueCandidate}`);

const placeBeforeText = await readText(placeRel);
const evidenceBeforeText = await readText(evidenceRel);
const parentBeforeText = await readText(parentRel);
const place = JSON.parse(placeBeforeText);
const evidence = JSON.parse(evidenceBeforeText);
const parent = JSON.parse(parentBeforeText);
assert(place.id === placeId, 'Sivbelte place file has the wrong ID.');
assert(place.coordStatus === 'needs_source', 'Sivbelte place is no longer unresolved.');
assert(place.locatorType === 'natural_area', 'Sivbelte locator type changed.');
assert(evidence.placeId === placeId, 'Coordinate evidence has the wrong place ID.');
assert(evidence.identity?.identityStatus === 'resolved', 'Sivbelte identity is no longer resolved.');
assert(evidence.decision?.canBecomeVerified === false, 'Evidence already permits coordinate verification.');
assert(parent.id === parentId, 'Parent place has the wrong ID.');
assert(parent.coordStatus === 'verified_geometry', 'Østensjøvannet parent is not verified geometry.');
assert(parent.sourceObjectId === 'miljodirektoratet-naturvern:VV00000972', 'Parent no longer uses the official reserve geometry.');
assert(containsAny(parent.popupDesc, ['sivbeltene', 'sivbelter']), 'Parent popup no longer preserves sivbelte knowledge.');
assert(containsAny(JSON.stringify(parent.nature_profile), ['sivbelter', 'våtmarkskanter']), 'Parent nature profile no longer preserves sivbelte knowledge.');

const reserve = await capture({
  label: 'naturbase-ostensjovannet-reserve',
  url: 'https://faktaark.naturbase.no/?id=VV00000972',
});
const friendNature = await capture({
  label: 'ostensjovannet-venner-natur',
  url: 'https://www.ostensjovannet.no/natur',
});
const friendPlants = await capture({
  label: 'ostensjovannet-venner-planter',
  url: 'https://www.ostensjovannet.no/planter',
});
const friendTours = await capture({
  label: 'ostensjovannet-venner-turforslag',
  url: 'https://www.ostensjovannet.no/turforslag',
});

const bbox = { xmin: 10.815, ymin: 59.875, xmax: 10.845, ymax: 59.902, spatialReference: { wkid: 4326 } };
const arcgisQuery = async ({ label, endpoint }) => {
  const url = new URL(endpoint);
  url.searchParams.set('where', '1=1');
  url.searchParams.set('geometry', JSON.stringify(bbox));
  url.searchParams.set('geometryType', 'esriGeometryEnvelope');
  url.searchParams.set('inSR', '4326');
  url.searchParams.set('spatialRel', 'esriSpatialRelIntersects');
  url.searchParams.set('outFields', '*');
  url.searchParams.set('returnGeometry', 'true');
  url.searchParams.set('outSR', '4326');
  url.searchParams.set('f', 'geojson');
  return capture({ label, url: url.toString(), expect: 'json' });
};
const nin = await arcgisQuery({
  label: 'miljodirektoratet-naturtyper-nin-ostensjovannet',
  endpoint: 'https://kart.miljodirektoratet.no/arcgis/rest/services/naturtyper_nin/FeatureServer/0/query',
});
const hb13 = await arcgisQuery({
  label: 'miljodirektoratet-naturtyper-hb13-ostensjovannet',
  endpoint: 'https://arcgis06.miljodirektoratet.no/arcgis/rest/services/faktaark/naturtyper/MapServer/0/query',
});

const nameVariants = [
  'Østensjøvannet sivbelte',
  'Sivbeltet ved Østensjøvannet',
  'Østensjøvannet siv',
  'Østensjøvannet rørsump',
];
const exactNames = new Set(nameVariants.map(normalize));
const kartverketRows = [];
for (const term of nameVariants) {
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
for (const term of ['"Østensjøvannet sivbelte"', '"sivbelte" Østensjøvannet', '"rørsump" Østensjøvannet']) {
  const url = new URL('https://www.oslo.kommune.no/sok/');
  url.searchParams.set('q', term);
  const result = await capture({ label: `oslo-kommune-${term}`, url: url.toString() });
  osloSearches.push({ term, result });
}

const overpassQuery = `[out:json][timeout:30];\n(\n  nwr["natural"="wetland"]["wetland"="reedbed"](59.875,10.815,59.902,10.845);\n  nwr["landuse"="reedbed"](59.875,10.815,59.902,10.845);\n  nwr["name"~"siv|rørsump|takrør|reed",i](59.875,10.815,59.902,10.845);\n);\nout center tags;`;
const overpass = await capture({
  label: 'overpass-ostensjovannet-reedbed-context',
  url: 'https://overpass-api.de/api/interpreter',
  options: {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: overpassQuery }).toString(),
  },
  expect: 'json',
});

const officialFeatures = [
  ...(Array.isArray(nin.json?.features) ? nin.json.features.map((feature) => ({ source: 'naturtyper_nin', feature })) : []),
  ...(Array.isArray(hb13.json?.features) ? hb13.json.features.map((feature) => ({ source: 'naturtyper_hb13', feature })) : []),
];
const reedTokens = ['sivbelte', 'siv', 'rørsump', 'takrør', 'helofytt', 'reedbed'];
const officialReedFeatures = officialFeatures.filter(({ feature }) =>
  feature?.geometry && containsAny(JSON.stringify(feature.properties ?? {}), reedTokens));
const officialExactFeatures = officialFeatures.filter(({ feature }) => {
  const values = Object.values(feature.properties ?? {}).map(normalize);
  return feature?.geometry && values.some((value) => exactNames.has(value) || (value.includes('ostensjovannet') && containsAny(value, reedTokens)));
});

const kartverketOsloExact = kartverketRows.filter(({ row }) => {
  const oslo = (row.kommuner ?? []).some((municipality) => municipality.kommunenummer === '0301' || normalize(municipality.kommunenavn) === 'oslo');
  return oslo && exactNames.has(normalize(row.skrivemåte));
});
const overpassElements = Array.isArray(overpass.json?.elements) ? overpass.json.elements : [];
const overpassNamed = overpassElements.filter((element) => element.tags?.name || element.tags?.official_name || element.tags?.alt_name);
const overpassExactNamed = overpassNamed.filter((element) => {
  const names = [element.tags?.name, element.tags?.official_name, element.tags?.alt_name].filter(Boolean).map(normalize);
  return names.some((name) => exactNames.has(name) || (name.includes('ostensjovannet') && containsAny(name, reedTokens)));
});

const osloExactSnippets = osloSearches.flatMap(({ term, result }) => {
  const body = normalize(result.body);
  return body.includes(normalize('Østensjøvannet sivbelte')) || (body.includes('ostensjovannet') && containsAny(body, ['sivbelte', 'rørsump']))
    ? [{ term, excerpt: result.body.replace(/\s+/g, ' ').slice(0, 2200) }]
    : [];
});

const sourceFamiliesAvailable = {
  reserve: reserve.ok,
  localReference: friendNature.ok && friendPlants.ok && friendTours.ok,
  naturtyperNiN: nin.ok && Array.isArray(nin.json?.features),
  naturtyperHB13: hb13.ok && Array.isArray(hb13.json?.features),
  kartverket: captures.filter((item) => item.label.startsWith('kartverket-')).every((item) => item.ok),
  osloMunicipality: osloSearches.every(({ result }) => result.ok),
  overpassContext: overpass.ok && Boolean(overpass.json),
};
assert(sourceFamiliesAvailable.reserve, 'Naturbase reserve source was unavailable.');
assert(sourceFamiliesAvailable.naturtyperNiN, 'Official NiN nature-type query was unavailable.');
assert(sourceFamiliesAvailable.naturtyperHB13, 'Official HB13 nature-type query was unavailable.');
assert(sourceFamiliesAvailable.kartverket, 'Kartverket source family was incomplete.');
assert(sourceFamiliesAvailable.osloMunicipality, 'Oslo municipality source family was incomplete.');

const publicSpecificGeometryFound = officialExactFeatures.length > 0 || officialReedFeatures.length > 0 || kartverketOsloExact.length > 0;
const decision = publicSpecificGeometryFound
  ? 'public_siv_habitat_geometry_candidate_requires_manual_review'
  : 'model_as_parent_habitat_retire_separate_marker';
const recommendation = decision === 'model_as_parent_habitat_retire_separate_marker'
  ? 'Disable the separate active marker. Preserve sivbelte knowledge in the verified Østensjøvannet parent, which already treats sivbelter and wetland edges as part of the whole habitat complex. Keep concrete route stops only where they have independent public geometry, such as Vadedammen, the bird hide, Bølerbekkens outlet and Bogerudmyra.'
  : 'Manually inspect each official habitat polygon before any coordinate is selected. Do not convert an unnamed or broad nature-type polygon into a named sivbelte marker without explicit source support.';

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId,
  parentId,
  researchOnly: true,
  canonicalChanged: false,
  coordinatePromoted: false,
  sourcePredecessor: 'reports/oslo-coordinate-retire-bygdoy-kongsgard-salamanderdam-post-195/summary.json',
  hardGates: {
    queueHeadMatches: true,
    identityResolved: true,
    coordinateNeedsSource: true,
    parentVerified: true,
    parentAlreadyPreservesSivbelteKnowledge: true,
    noBatch196: true,
  },
  findings: {
    officialNatureTypeFeatureCount: officialFeatures.length,
    officialReedFeatureCount: officialReedFeatures.length,
    officialExactFeatureCount: officialExactFeatures.length,
    kartverketOsloExactCandidates: kartverketOsloExact.length,
    osloMunicipalityExactSnippets: osloExactSnippets.length,
    overpassElements: overpassElements.length,
    overpassNamedElements: overpassNamed.length,
    overpassExactNamedElements: overpassExactNamed.length,
  },
  officialCandidateDetails: {
    exactFeatures: officialExactFeatures,
    reedFeatures: officialReedFeatures,
    kartverket: kartverketOsloExact,
  },
  contextualOnly: {
    osloMunicipalitySnippets: osloExactSnippets,
    overpassExactNamed,
  },
  sourceFamiliesAvailable,
  decision,
  recommendation,
  modelReason: 'The record describes a changing vegetation belt rather than a stable named object. The verified parent already carries the wetland and reed-belt learning model, while its concrete child anchors are restricted to independently verifiable public objects or geometries.',
  sourceHashesBefore: {
    place: sha256(placeBeforeText),
    evidence: sha256(evidenceBeforeText),
    parent: sha256(parentBeforeText),
  },
  captures,
};

await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Østensjøvannet sivbelte model audit after batch 195\n\n- Place: **\`${placeId}\`**\n- Verified parent: **\`${parentId}\`**\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical data changed: **no**\n- Official nature-type polygons in search area: **${officialFeatures.length}**\n- Official reed-classified polygons: **${officialReedFeatures.length}**\n- Official exact sivbelte candidates: **${officialExactFeatures.length}**\n- Exact Kartverket Oslo candidates: **${kartverketOsloExact.length}**\n- Exact named bounded OSM context: **${overpassExactNamed.length}**\n- Decision: **\`${decision}\`**\n\n${recommendation}\n`, 'utf8');

assert(await readText(placeRel) === placeBeforeText, 'Research-only audit changed the sivbelte place.');
assert(await readText(evidenceRel) === evidenceBeforeText, 'Research-only audit changed coordinate evidence.');
assert(await readText(parentRel) === parentBeforeText, 'Research-only audit changed the parent place.');

console.log(JSON.stringify({
  status: 'model_audit_complete',
  reportDir: reportRel,
  placeId,
  parentId,
  decision,
  officialNatureTypeFeatureCount: officialFeatures.length,
  officialReedFeatureCount: officialReedFeatures.length,
  officialExactFeatureCount: officialExactFeatures.length,
  kartverketOsloExactCandidates: kartverketOsloExact.length,
  overpassExactNamedElements: overpassExactNamed.length,
  canonicalChanged: false,
}, null, 2));
