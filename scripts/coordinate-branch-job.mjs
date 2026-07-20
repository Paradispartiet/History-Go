import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-38';
const PLACE_MANIFEST = 'data/places/manifest.json';

const candidates = [
  { id: 'bislett', queries: ['Bislett Oslo', 'Bislettrundkjøringen Oslo'] },
  { id: 'sigrid_undset_statue', queries: ['Sigrid Undset Stensparken Oslo', 'Sigrid Undset statue Oslo'] },
  { id: 'st_halvard_bryggeri', queries: ['St. Halvards Bryggeri Pilestredet 75C Oslo', 'Nora Bryggeri Pilestredet 75C Oslo'] },
  { id: 'grensen_kjopesenter', queries: ['Grensen Oslo', 'Grensen gate Oslo sentrum'] }
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function resultName(result) {
  return result?.namedetails?.name || result?.name || String(result?.display_name || '').split(',')[0].trim();
}

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '15');
  url.searchParams.set('countrycodes', 'no');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('extratags', '1');
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)',
      'Accept-Language': 'nb,en;q=0.8'
    }
  });
  if (!response.ok) throw new Error(`Nominatim ${response.status} for ${query}`);
  return await response.json();
}

function activeSource(placeId) {
  const manifest = readJson(PLACE_MANIFEST);
  const hits = [];
  for (const entry of manifest.files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const place of rowsFrom(readJson(rel))) {
      if (place?.id === placeId) hits.push({
        sourceFile: rel,
        name: place.name,
        lat: place.lat,
        lon: place.lon,
        r: place.r,
        coordStatus: place.coordStatus || '',
        coordSource: place.coordSource || '',
        sourceObjectId: place.sourceObjectId || '',
        locatorType: place.locatorType || '',
        coordType: place.coordType || ''
      });
    }
  }
  return hits;
}

async function main() {
  const summary = [];
  for (const candidate of candidates) {
    const all = [];
    for (const query of candidate.queries) {
      const results = await nominatimSearch(query);
      all.push(...results.map((result) => ({ query, ...result })));
      writeJson(`${REPORT_DIR}/nominatim-results/${candidate.id}-${normalize(query).replace(/ /g, '-')}.json`, { query, results });
      await delay(1100);
    }
    const deduped = new Map();
    for (const result of all) deduped.set(`${result.osm_type}:${result.osm_id}`, result);
    summary.push({
      id: candidate.id,
      activeSources: activeSource(candidate.id),
      candidates: [...deduped.values()].map((result) => ({
        query: result.query,
        name: resultName(result),
        osm_type: result.osm_type,
        osm_id: result.osm_id,
        lat: result.lat,
        lon: result.lon,
        category: result.category,
        type: result.type,
        display_name: result.display_name,
        address: result.address,
        extratags: result.extratags || {}
      }))
    });
  }

  writeJson(`${REPORT_DIR}/research-summary.json`, {
    date: '2026-07-20',
    method: 'Research only. Object type first; no result is applied automatically.',
    sourceNotes: {
      bislett: 'Oslo byleksikon defines Bislett as a strøk with Bislett idrettsplass as midpoint; Oslo kommune separately treats Bislettrundkjøringen and surrounding streets as a current urban node.',
      sigrid_undset_statue: 'Oslo kommune explicitly documents Sigrid Undsets skulptur in Stensparken, but an exact pedestal coordinate is still required.',
      st_halvard_bryggeri: 'Oslo byleksikon documents the brewery history at Pilestredet 75C: Nora Bryggeri from 1877, renamed/reorganized before St. Halvards Bryggeri in 1905, closed 1918. Existing active record year/geography are wrong and must be corrected before applying the saved Geonorge 75C point.',
      grensen_kjopesenter: 'Oslo byleksikon defines Grensen as the street from Møllergata at Stortorvet to Professor Aschehougs plass. The active record should be normalized as a linear street, not a shopping-centre/node object.'
    },
    candidates: summary
  });

  fs.mkdirSync(abs(REPORT_DIR), { recursive: true });
  fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 38 research\n\nDato: 2026-07-20\n\nResearch-passet undersøker \`bislett\`, \`sigrid_undset_statue\`, \`st_halvard_bryggeri\` og \`grensen_kjopesenter\`. Ingen canonical koordinater endres i dette passet.\n\nMetoden er objekt-type-først: Bislett vurderes som strøk/byknutepunkt separat fra stadion, Sigrid Undset som monument, St. Halvards Bryggeri som historisk industristed med identitetsretting før koordinat, og Grensen som lineær gate. Alle rå Nominatim-svar lagres i \`nominatim-results/\`.\n`);

  console.log(JSON.stringify({ ok: true, summary }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
