#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-164-oset-slusebru-identity-research');
fs.mkdirSync(reportDir, { recursive: true });

const USER_AGENT = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*' },
        signal: AbortSignal.timeout(30000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1500 * attempt);
    }
  }
  throw lastError;
}

async function fetchJson(url, attempts = 3) {
  return JSON.parse(await fetchText(url, attempts));
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

const all = searches.flatMap(({ query, results }) => results.map((result) => ({ query, ...result })));
const deduped = [...new Map(all.map((candidate) => [`${candidate.osm_type}:${candidate.osm_id}`, candidate])).values()];
const exactOset = deduped.filter((candidate) => {
  const names = [candidate.name, candidate.display_name, candidate.namedetails?.name, candidate.namedetails?.['name:no']]
    .filter(Boolean)
    .map(norm);
  return names.some((name) => name === 'oset slusebru' || name.startsWith('oset slusebru,'));
});

if (exactOset.length !== 1) {
  fs.writeFileSync(path.join(reportDir, 'candidate-summary.json'), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    queries,
    exactOsetCount: exactOset.length,
    exactOset,
    candidates: deduped,
  }, null, 2)}\n`);
  throw new Error(`Expected exactly one exact Oset slusebru candidate, found ${exactOset.length}`);
}

const selected = exactOset[0];
const typeMap = { node: 'node', way: 'way', relation: 'relation' };
const osmType = typeMap[selected.osm_type];
if (!osmType) throw new Error(`Unsupported OSM type ${selected.osm_type}`);
const osmApiUrl = `https://api.openstreetmap.org/api/0.6/${osmType}/${selected.osm_id}${osmType === 'way' || osmType === 'relation' ? '/full' : ''}`;
const osmXml = await fetchText(osmApiUrl);
fs.writeFileSync(path.join(reportDir, `osm-${osmType}-${selected.osm_id}${osmType === 'way' || osmType === 'relation' ? '-full' : ''}.xml`), osmXml);

const candidateSummary = {
  generatedAt: new Date().toISOString(),
  placeId: 'frysjadammen',
  currentIdentityProblem: 'Legacy name Frysjadammen conflicts with content about the regulated outlet at Maridalsoset.',
  exactOsetCount: exactOset.length,
  selected: {
    query: selected.query,
    osmType: selected.osm_type,
    osmId: selected.osm_id,
    displayName: selected.display_name,
    name: selected.name || selected.namedetails?.name || null,
    lat: Number(selected.lat),
    lon: Number(selected.lon),
    category: selected.category,
    type: selected.type,
    boundingbox: selected.boundingbox?.map(Number) || null,
    geojson: selected.geojson || null,
    sourceObjectId: `osm-${selected.osm_type}:${selected.osm_id}`,
    sourceUrl: `https://www.openstreetmap.org/${selected.osm_type}/${selected.osm_id}`,
  },
  allCandidates: deduped.map((candidate) => ({
    query: candidate.query,
    osmType: candidate.osm_type,
    osmId: candidate.osm_id,
    displayName: candidate.display_name,
    name: candidate.name || candidate.namedetails?.name || null,
    lat: Number(candidate.lat),
    lon: Number(candidate.lon),
    category: candidate.category,
    type: candidate.type,
  })),
  identityDecision: {
    canonicalNameCandidate: 'Oset slusebru – damanlegget ved Maridalsoset',
    retainPlaceId: 'frysjadammen',
    rationale: 'The current record content, works, nature profile and sources all describe the regulated outlet of Maridalsvannet at Maridalsoset, while official/source material identifies Brekkedammen/Kjelsåsdammen as a different impoundment at Frysja. Oset slusebru is a concrete surviving component of the Maridalsoset dam installation and can serve as the exact physical anchor if its OSM identity is unique.',
    nextAction: 'Production may rename the display identity and anchor the record to the unique exact Oset slusebru OSM object. Do not move the record to Brekkedammen merely because of the legacy placeId/name.',
  },
};

fs.writeFileSync(path.join(reportDir, 'candidate-summary.json'), `${JSON.stringify(candidateSummary, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'nominatim-searches.json'), `${JSON.stringify(searches, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 164 identity research sources\n\n- Oslo kommune: https://www.oslo.kommune.no/natur-kultur-og-fritid/kunst-og-kultur/kultureiendommer/frysja-33/\n- Oslo kommune: https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/badeplasser/brekkedammen-ved-frysja\n- Oslo byleksikon: https://oslobyleksikon.no/side/Oset_slusebru\n- Oslo byleksikon: https://oslobyleksikon.no/side/Akerselva\n- Nominatim search results and fresh OSM API XML are stored in this report directory.\n`);

console.log(JSON.stringify({
  batch: 164,
  placeId: 'frysjadammen',
  exactOsetCount: exactOset.length,
  selected: candidateSummary.selected,
  decision: candidateSummary.identityDecision,
}, null, 2));
