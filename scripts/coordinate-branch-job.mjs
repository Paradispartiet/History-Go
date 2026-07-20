import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-40';
const PLACE_MANIFEST = 'data/places/manifest.json';
const queries = [
  { key: 'gaustadalleen', query: 'Gaustadalléen holdeplass Oslo' },
  { key: 'nybrua', query: 'Nybrua holdeplass Oslo' },
  { key: 'sinsenkrysset', query: 'Sinsenkrysset holdeplass Oslo' },
  { key: 'storo', query: 'Storo holdeplass trikk Oslo' },
  { key: 'grefsen_stasjon', query: 'Grefsen stasjon trikk Oslo' }
];

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, data) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
};
const rowsFrom = (data) => Array.isArray(data) ? data : Array.isArray(data?.places) ? data.places : Array.isArray(data?.items) ? data.items : data?.id ? [data] : [];
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const resultName = (result) => result?.namedetails?.name || result?.name || String(result?.display_name || '').split(',')[0].trim();

function activeSource(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const place of rowsFrom(readJson(rel))) {
      if (place?.id === placeId) hits.push({ sourceFile: rel, name: place.name, lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus || '', coordType: place.coordType || '', coordSource: place.coordSource || '', sourceObjectId: place.sourceObjectId || '', anchors: place.anchors || [] });
    }
  }
  return hits;
}

async function nominatim(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '12');
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

const results = [];
for (const item of queries) {
  const rows = await nominatim(item.query);
  writeJson(`${REPORT_DIR}/nominatim-results/${item.key}.json`, { query: item.query, results: rows });
  results.push({
    ...item,
    candidates: rows.map((result) => ({
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
  await delay(1100);
}

writeJson(`${REPORT_DIR}/research-summary.json`, {
  date: '2026-07-20',
  method: 'Research only. Current Ruter route identity is authoritative; exact named stop/station objects are collected as potential branch anchors without first/nearest-result selection.',
  activeSource: activeSource('trikk_17_18'),
  officialRouteDefinition: {
    sourceProvider: 'official_map',
    sourceName: 'Ruter tram timetable effective 20 April 2026',
    sourceUrl: 'https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/trikk',
    sourceObjectId: 'ruter:tram-lines:17+18:2026-04-20',
    line17: 'Gaustadalléen – Sinsen – Grefsen stasjon',
    line18: 'Gaustadalléen – Storo – Grefsen stasjon',
    modellingNote: 'The combined History Go record should be a branched route pair. Suggested anchors: shared west terminus, shared central/divergence corridor, one line-17 branch anchor, one line-18 branch anchor, shared Grefsen terminus.'
  },
  anchorResearch: results
});

fs.mkdirSync(abs(REPORT_DIR), { recursive: true });
fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 40 research\n\nDato: 2026-07-20\n\nRuters gjeldende rutetabell fra 20. april 2026 dokumenterer linje 17 som Gaustadalléen–Sinsen–Grefsen stasjon og linje 18 som Gaustadalléen–Storo–Grefsen stasjon. Combined-recorden vurderes derfor som et forgrenet rutepar med flere ankere, ikke ett symbolsk midtpunkt.\n\nResearch-passet samler eksakte navngitte objektkandidater for Gaustadalléen, Nybrua, Sinsenkrysset, Storo og Grefsen stasjon. Ingen canonical koordinater endres i dette passet.\n`);

console.log(JSON.stringify({ ok: true, anchorQueries: results.length }, null, 2));
