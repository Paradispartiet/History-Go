#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-164-oset-slusebru-identity-research');
fs.mkdirSync(reportDir, { recursive: true });

const USER_AGENT = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, attempts = 3, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*', ...(options.headers || {}) },
        method: options.method || 'GET',
        body: options.body,
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1800 * attempt);
    }
  }
  throw lastError;
}

async function fetchJson(url, attempts = 3, options = {}) {
  return JSON.parse(await fetchText(url, attempts, options));
}

function norm(value) {
  return String(value || '').trim().toLocaleLowerCase('nb-NO');
}

const queries = [
  'Oset slusebru, Oslo, Norway',
  'Oset slusebru, Oslo',
  'Oset slusebru',
  'Maridalsoset, Oslo, Norway',
];

const searches = [];
for (const query of queries) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '20');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  const results = await fetchJson(url.toString());
  searches.push({ query, url: url.toString(), results });
  await sleep(1100);
}

const all = searches.flatMap(({ query, results }) => results.map((result) => ({ query, source: 'nominatim', ...result })));
const nominatimCandidates = [...new Map(all.map((candidate) => [`${candidate.osm_type}:${candidate.osm_id}`, candidate])).values()];

const overpassQuery = `[out:json][timeout:35];\n(\n  nwr["name"="Oset slusebru"](59.975,10.755,59.99,10.795);\n  nwr["name"~"Oset|Maridals",i](59.975,10.755,59.99,10.795);\n  way["bridge"](59.975,10.755,59.99,10.795);\n  way["man_made"="bridge"](59.975,10.755,59.99,10.795);\n  way["waterway"="dam"](59.975,10.755,59.99,10.795);\n);\nout center tags geom;`;

const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let overpass = null;
let overpassError = null;
for (const endpoint of overpassEndpoints) {
  try {
    const body = new URLSearchParams({ data: overpassQuery }).toString();
    overpass = await fetchJson(endpoint, 2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    overpass.endpoint = endpoint;
    break;
  } catch (error) {
    overpassError = String(error?.message || error);
  }
}

const overpassCandidates = (overpass?.elements || []).map((element) => ({
  source: 'overpass',
  osm_type: element.type,
  osm_id: element.id,
  name: element.tags?.name || null,
  display_name: element.tags?.name || null,
  lat: element.lat ?? element.center?.lat ?? null,
  lon: element.lon ?? element.center?.lon ?? null,
  category: element.tags?.man_made || element.tags?.waterway || element.tags?.highway || null,
  type: element.tags?.bridge || element.tags?.man_made || element.tags?.waterway || element.tags?.highway || null,
  tags: element.tags || {},
  geometry: element.geometry || null,
}));

const combined = [...nominatimCandidates, ...overpassCandidates];
const deduped = [...new Map(combined.map((candidate) => [`${candidate.osm_type}:${candidate.osm_id}`, candidate])).values()];
const exactOset = deduped.filter((candidate) => norm(candidate.name) === 'oset slusebru' || norm(candidate.display_name) === 'oset slusebru');

for (const candidate of exactOset) {
  const suffix = candidate.osm_type === 'way' || candidate.osm_type === 'relation' ? '/full' : '';
  const osmApiUrl = `https://api.openstreetmap.org/api/0.6/${candidate.osm_type}/${candidate.osm_id}${suffix}`;
  try {
    const osmXml = await fetchText(osmApiUrl);
    fs.writeFileSync(path.join(reportDir, `osm-${candidate.osm_type}-${candidate.osm_id}${suffix ? '-full' : ''}.xml`), osmXml);
  } catch (error) {
    fs.writeFileSync(path.join(reportDir, `osm-${candidate.osm_type}-${candidate.osm_id}-fetch-error.txt`), `${String(error?.message || error)}\n`);
  }
}

const selected = exactOset.length === 1 ? exactOset[0] : null;
const candidateSummary = {
  generatedAt: new Date().toISOString(),
  placeId: 'frysjadammen',
  currentIdentityProblem: 'Legacy name Frysjadammen conflicts with content about the regulated outlet at Maridalsoset.',
  nominatimCandidateCount: nominatimCandidates.length,
  overpassAvailable: Boolean(overpass),
  overpassEndpoint: overpass?.endpoint || null,
  overpassError,
  overpassCandidateCount: overpassCandidates.length,
  exactOsetCount: exactOset.length,
  exactOset,
  selected: selected ? {
    osmType: selected.osm_type,
    osmId: selected.osm_id,
    name: selected.name,
    lat: selected.lat === null ? null : Number(selected.lat),
    lon: selected.lon === null ? null : Number(selected.lon),
    tags: selected.tags || null,
    geometry: selected.geometry || selected.geojson || null,
    sourceObjectId: `osm-${selected.osm_type}:${selected.osm_id}`,
    sourceUrl: `https://www.openstreetmap.org/${selected.osm_type}/${selected.osm_id}`,
  } : null,
  candidates: deduped.map((candidate) => ({
    source: candidate.source,
    osmType: candidate.osm_type,
    osmId: candidate.osm_id,
    name: candidate.name || candidate.namedetails?.name || null,
    displayName: candidate.display_name || null,
    lat: candidate.lat === null || candidate.lat === undefined ? null : Number(candidate.lat),
    lon: candidate.lon === null || candidate.lon === undefined ? null : Number(candidate.lon),
    category: candidate.category || null,
    type: candidate.type || null,
    tags: candidate.tags || null,
  })),
  identityDecision: {
    canonicalNameCandidate: 'Oset slusebru – damanlegget ved Maridalsoset',
    retainPlaceId: 'frysjadammen',
    externalIdentityResolution: 'The current record content describes the Maridalsoset regulated outlet, while Brekkedammen/Kjelsåsdammen is a separate impoundment at Frysja.',
    productionReady: exactOset.length === 1,
    nextAction: exactOset.length === 1
      ? 'Use the unique exact Oset slusebru OSM object as the physical anchor and correct the canonical display identity on a fresh-main production branch.'
      : 'Inspect the bounded physical bridge/dam candidate set manually; do not promote by nearest distance.',
  },
};

fs.writeFileSync(path.join(reportDir, 'candidate-summary.json'), `${JSON.stringify(candidateSummary, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'nominatim-searches.json'), `${JSON.stringify(searches, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-query.txt'), `${overpassQuery}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-response.json'), `${JSON.stringify(overpass || { error: overpassError }, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 164 identity research sources\n\n- Oslo kommune: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/\n- Oslo kommune: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/brekkedammen-ved-frysja\n- Oslo byleksikon: https://oslobyleksikon.no/side/Oset_slusebru\n- Oslo byleksikon: https://oslobyleksikon.no/side/Akerselva\n- Nominatim and bounded Overpass candidate sets are stored in this report directory.\n`);

console.log(JSON.stringify({
  batch: 164,
  placeId: 'frysjadammen',
  exactOsetCount: exactOset.length,
  selected: candidateSummary.selected,
  productionReady: candidateSummary.identityDecision.productionReady,
  nextAction: candidateSummary.identityDecision.nextAction,
}, null, 2));
