import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-37';
const PLACE_MANIFEST = 'data/places/manifest.json';

const candidates = [
  {
    id: 'seilduksfabrikken_nydalen',
    queries: ['Øvre Spinneri Nydalen Oslo', 'Seilduksfabrikken Nydalen Oslo', 'Nydalens Compagnie Øvre Spinneri Oslo']
  },
  {
    id: 'norli_universitetsgata',
    queries: ['Norli Universitetsgata Oslo', 'Norli Bokhandel Universitetsgata Oslo']
  },
  {
    id: 'bankall_gard',
    queries: ['Bånkall gård Oslo', 'Bånkall Gård Trondheimsveien 640 Oslo']
  }
];

function abs(rel) { return path.join(ROOT, rel); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function normalize(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function resultName(result) {
  return result?.namedetails?.name || result?.name || String(result?.display_name || '').split(',')[0].trim();
}

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '10');
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
        coordStatus: place.coordStatus || '',
        sourceObjectId: place.sourceObjectId || ''
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
      const slug = normalize(query).replace(/ /g, '-');
      writeJson(`${REPORT_DIR}/nominatim-results/${candidate.id}-${slug}.json`, { query, results });
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

  const frysja = activeSource('frysja_33_brekke_kraftstasjon');
  writeJson(`${REPORT_DIR}/research-summary.json`, {
    date: '2026-07-20',
    method: 'Object-type-first research only. No candidate is applied in this pass.',
    candidates: summary,
    staleProtocolCheck: {
      id: 'frysja_33_brekke_kraftstasjon',
      activeSources: frysja,
      note: 'If canonical is already verified, the old unresolved protocol row must be removed in the application pass.'
    }
  });

  const readme = `# Oslo koordinatkontroll – batch 37 research\n\nDato: 2026-07-20\n\nFørste pass samler eksakte navngitte objektkandidater for \`seilduksfabrikken_nydalen\`, \`norli_universitetsgata\` og Bånkall gård. Ingen koordinater endres i research-passet. Alle rå Nominatim-svar lagres i \`nominatim-results/\`.\n\nBatchen kontrollerer også om protokollraden for \`frysja_33_brekke_kraftstasjon\` er foreldet i forhold til aktiv canonical data.\n`;
  fs.mkdirSync(abs(REPORT_DIR), { recursive: true });
  fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), readme);
  console.log(JSON.stringify({ ok: true, summary, frysja }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
