import { mkdir, writeFile } from 'node:fs/promises';

const OUT = 'reports/oslo-politikk-expansion-research.json';
const USER_AGENT = 'History-Go politics expansion research/1.0 (github.com/Paradispartiet/History-Go)';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${url}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function geonorge(query) {
  const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}`;
  const json = await fetchJson(url);
  const hits = Array.isArray(json?.adresser) ? json.adresser : [];
  return { query, url, hits };
}

async function nominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=10&polygon_geojson=1&q=${encodeURIComponent(query)}`;
  const hits = await fetchJson(url);
  return { query, url, hits };
}

async function wikidata(query) {
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=nb&uselang=nb&limit=10&format=json&origin=*`;
  const search = await fetchJson(searchUrl);
  const rows = [];
  for (const hit of search?.search || []) {
    const entityUrl = `https://www.wikidata.org/wiki/Special:EntityData/${hit.id}.json`;
    let entity = null;
    try {
      entity = await fetchJson(entityUrl);
    } catch (error) {
      entity = { error: String(error) };
    }
    rows.push({ hit, entityUrl, entity });
  }
  return { query, searchUrl, rows };
}

async function overpass(names) {
  const filters = names.map((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return `nwr[\"name\"~\"^${escaped}$\",i](59.89,10.68,59.95,10.80);`;
  }).join('\n');
  const query = `[out:json][timeout:90];\n(\n${filters}\n);\nout tags center geom;`;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const json = await fetchJson(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      return { endpoint, query, elements: json?.elements || [] };
    } catch (error) {
      lastError = String(error);
    }
  }
  return { query, error: lastError, elements: [] };
}

const addressQueries = {
  '22_juli_senteret': 'Akersgata 42 Oslo',
  statsministerboligen: 'Inkognitogata 18 Oslo',
  hoyres_hus: 'Stortingsgata 20 Oslo',
  victoria_terrasse: '7. juni-plassen 1 Oslo',
  arbeidersamfunnets_plass_address: 'Arbeidersamfunnets plass 1 Oslo',
};

const namedQueries = [
  'Høyblokka Oslo',
  'Y-blokka Oslo',
  'Arbeidersamfunnets plass Oslo',
  'Victoria terrasse Oslo',
  '22. juli-senteret Oslo',
];

const report = {
  generated_at: new Date().toISOString(),
  purpose: 'Source-first coordinate research for seven Oslo politics places',
  addresses: {},
  nominatim: {},
  wikidata: {},
  overpass: null,
};

for (const [id, query] of Object.entries(addressQueries)) {
  try {
    report.addresses[id] = await geonorge(query);
  } catch (error) {
    report.addresses[id] = { query, error: String(error) };
  }
}

for (const query of namedQueries) {
  const key = normalize(query).replace(/ /g, '_');
  try {
    report.nominatim[key] = await nominatim(query);
  } catch (error) {
    report.nominatim[key] = { query, error: String(error) };
  }
  try {
    report.wikidata[key] = await wikidata(query);
  } catch (error) {
    report.wikidata[key] = { query, error: String(error) };
  }
}

report.overpass = await overpass([
  'Høyblokka',
  'Y-blokka',
  'Arbeidersamfunnets plass',
  'Victoria terrasse',
  '22. juli-senteret',
]);

await mkdir('reports', { recursive: true });
await writeFile(OUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUT}`);
