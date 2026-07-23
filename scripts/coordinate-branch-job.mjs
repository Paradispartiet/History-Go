#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-167-blindern-forskningsparken-dam-research');
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
        signal: AbortSignal.timeout(60000),
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

function haversine(a, b) {
  const R = 6371000;
  const rad = (degree) => degree * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function centerOfGeometry(geometry = []) {
  if (!geometry.length) return null;
  return {
    lat: geometry.reduce((sum, point) => sum + point.lat, 0) / geometry.length,
    lon: geometry.reduce((sum, point) => sum + point.lon, 0) / geometry.length,
  };
}

async function nominatim(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '10');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  const results = await fetchJson(url.toString());
  await sleep(1100);
  return { query, url: url.toString(), results };
}

const institutionSearches = [];
for (const query of [
  'Ole-Johan Dahls hus Oslo Norway',
  'Institutt for informatikk Universitetet i Oslo',
  'Forskningsparken Oslo Norway',
]) institutionSearches.push(await nominatim(query));

const flatten = institutionSearches.flatMap((search) => search.results.map((result) => ({ query: search.query, ...result })));
const ifiCandidates = flatten.filter((result) => /ole-johan dahls hus|institutt for informatikk/i.test(`${result.display_name || ''} ${result.namedetails?.name || ''}`));
const forskningsparkenCandidates = flatten.filter((result) => /forskningsparken/i.test(`${result.display_name || ''} ${result.namedetails?.name || ''}`));
if (!ifiCandidates.length) throw new Error('Could not identify IFI/Ole-Johan Dahls hus with Nominatim');
if (!forskningsparkenCandidates.length) throw new Error('Could not identify Forskningsparken with Nominatim');
const ifi = { lat: Number(ifiCandidates[0].lat), lon: Number(ifiCandidates[0].lon), osmType: ifiCandidates[0].osm_type, osmId: ifiCandidates[0].osm_id, displayName: ifiCandidates[0].display_name };
const forskningsparken = { lat: Number(forskningsparkenCandidates[0].lat), lon: Number(forskningsparkenCandidates[0].lon), osmType: forskningsparkenCandidates[0].osm_type, osmId: forskningsparkenCandidates[0].osm_id, displayName: forskningsparkenCandidates[0].display_name };

const bbox = '59.9400,10.7130,59.9470,10.7280';
const overpassQuery = `[out:json][timeout:45];\n(\n  nwr["natural"="water"](${bbox});\n  nwr["water"~"pond|basin|reservoir",i](${bbox});\n  way["waterway"~"stream|river"](${bbox});\n  nwr["name"~"Gaustadbekken|Forskningsparken|Ole-Johan Dahl|Institutt for informatikk",i](${bbox});\n);\nout center tags geom;`;
const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
let data;
let usedEndpoint;
let lastError;
for (const endpoint of endpoints) {
  try {
    const body = new URLSearchParams({ data: overpassQuery }).toString();
    data = await fetchJson(endpoint, 2, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    usedEndpoint = endpoint;
    break;
  } catch (error) {
    lastError = String(error?.message || error);
  }
}
if (!data) throw new Error(`Overpass failed: ${lastError}`);

const waterCandidates = (data.elements || []).filter((element) => {
  const tags = element.tags || {};
  return tags.natural === 'water' || ['pond', 'basin', 'reservoir'].includes(tags.water);
}).map((element) => {
  const center = element.center || (element.lat !== undefined ? { lat: element.lat, lon: element.lon } : centerOfGeometry(element.geometry));
  const minLat = Math.min(ifi.lat, forskningsparken.lat) - 0.0010;
  const maxLat = Math.max(ifi.lat, forskningsparken.lat) + 0.0010;
  const minLon = Math.min(ifi.lon, forskningsparken.lon) - 0.0018;
  const maxLon = Math.max(ifi.lon, forskningsparken.lon) + 0.0018;
  return {
    osmType: element.type,
    osmId: element.id,
    tags: element.tags || {},
    center,
    geometry: element.geometry || null,
    distanceToIfiM: center ? Number(haversine(center, ifi).toFixed(1)) : null,
    distanceToForskningsparkenM: center ? Number(haversine(center, forskningsparken).toFixed(1)) : null,
    insideExpandedBetweenCorridor: center ? center.lat >= minLat && center.lat <= maxLat && center.lon >= minLon && center.lon <= maxLon : false,
  };
}).sort((a, b) => Math.max(a.distanceToIfiM ?? Infinity, a.distanceToForskningsparkenM ?? Infinity) - Math.max(b.distanceToIfiM ?? Infinity, b.distanceToForskningsparkenM ?? Infinity));

const corridorCandidates = waterCandidates.filter((candidate) =>
  candidate.center &&
  candidate.insideExpandedBetweenCorridor &&
  candidate.distanceToIfiM < 350 &&
  candidate.distanceToForskningsparkenM < 350
);

for (const candidate of corridorCandidates) {
  const suffix = candidate.osmType === 'way' || candidate.osmType === 'relation' ? '/full' : '';
  const url = `https://api.openstreetmap.org/api/0.6/${candidate.osmType}/${candidate.osmId}${suffix}`;
  try {
    fs.writeFileSync(path.join(reportDir, `osm-${candidate.osmType}-${candidate.osmId}${suffix ? '-full' : ''}.xml`), await fetchText(url));
  } catch (error) {
    fs.writeFileSync(path.join(reportDir, `osm-${candidate.osmType}-${candidate.osmId}-fetch-error.txt`), `${String(error?.message || error)}\n`);
  }
}

const strictPondCandidates = corridorCandidates.filter((candidate) => {
  const water = String(candidate.tags?.water || '').toLowerCase();
  return candidate.tags?.natural === 'water' && (water === 'pond' || water === 'basin' || water === '' || water === 'reservoir');
});

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'blindern_forskningsparken_salamanderdam',
  sourceDefinedScope: 'The pond is documented by Forskningsparken as lying between UiO Institute of Informatics (Ole-Johan Dahls hus) and Forskningsparken; Oslo kommune independently documents salamanders in a pond at Forskningsparken on Blindern.',
  institutions: { ifi, forskningsparken },
  overpassEndpoint: usedEndpoint,
  counts: {
    allWaterCandidates: waterCandidates.length,
    corridorCandidates: corridorCandidates.length,
    strictPondCandidates: strictPondCandidates.length,
  },
  waterCandidates,
  corridorCandidates,
  strictPondCandidates,
  decision: {
    productionReady: strictPondCandidates.length === 1,
    selectedCandidate: strictPondCandidates.length === 1 ? strictPondCandidates[0] : null,
    selectionRule: 'The production object may be selected only if exactly one physical OSM water polygon falls in the source-defined IFI–Forskningsparken corridor and is within 350 m of both independently identified institution anchors. The legacy History Go point is not used for selection.',
    nextAction: strictPondCandidates.length === 1
      ? 'Refetch the unique water polygon from the OSM API, validate its water geometry, and use its area centroid/interior anchor for production.'
      : 'Inspect the corridor candidates and strengthen the source-defined physical relation; do not choose the nearest water object.',
  },
};

fs.writeFileSync(path.join(reportDir, 'candidate-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'nominatim-institution-searches.json'), `${JSON.stringify(institutionSearches, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-query.txt'), `${overpassQuery}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-response.json'), `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 167 sources\n\n- Oslo kommune, Oslos ukjente amfibiedammer kartlegges: https://aktuelt.oslo.kommune.no/oslos-ukjente-amfibiedammer-kartlegges\n- Forskningsparken, grøntområde rundt Gaustadbekken: https://www.forskningsparken.no/en/news/2019-mosekunst-og-grontomradet-rundt-gaustadbekken\n- Forskningsparken, biologisk mangfold: https://www.forskningsparken.no/news/la-humla-suse-slik-bidrar-forskningsparken-til-biologisk-mangfold\n- Fresh Nominatim and bounded OSM/Overpass data are stored in this directory.\n`);

console.log(JSON.stringify({
  batch: 167,
  placeId: summary.placeId,
  counts: summary.counts,
  productionReady: summary.decision.productionReady,
  selectedCandidate: summary.decision.selectedCandidate,
  nextAction: summary.decision.nextAction,
}, null, 2));
