import fs from 'node:fs';
import path from 'node:path';

const sourcePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json';
const reportDir = 'reports/oslo-coordinate-control-batch-36-diagnostic-v3';
const ids = [
  'alnsjoen_alna_kilde', 'alnaparken', 'groruddammen', 'alna_smalvoll',
  'alna_bryn', 'svartdalen', 'kvaernerbyen_alna', 'alna_utlop_bjorvika',
];
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const places = Object.fromEntries(source.filter((p) => ids.includes(p.id)).map((p) => [p.id, p]));
if (Object.keys(places).length !== ids.length) throw new Error('Missing expected Alna route records');
fs.mkdirSync(reportDir, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const headers = { 'User-Agent': 'History-Go-coordinate-control/1.0 repository-coordinate-audit' };

async function getJson(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 1300);
    }
  }
  throw new Error(`Nominatim request failed: ${url}: ${lastError}`);
}

async function search(query, viewbox = null, bounded = false) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '12');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  if (viewbox) url.searchParams.set('viewbox', viewbox.join(','));
  if (bounded) url.searchParams.set('bounded', '1');
  const rows = await getJson(url.toString());
  await sleep(1100);
  return rows;
}

async function reverse(lat, lon) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  const row = await getJson(url.toString());
  await sleep(1100);
  return row;
}

function flattenCoordinates(value, out = []) {
  if (!Array.isArray(value)) return out;
  if (value.length >= 2 && Number.isFinite(value[0]) && Number.isFinite(value[1])) {
    out.push({ lon: Number(value[0]), lat: Number(value[1]) });
    return out;
  }
  for (const child of value) flattenCoordinates(child, out);
  return out;
}

function summarize(row) {
  const points = flattenCoordinates(row.geojson?.coordinates || []);
  return {
    osm_type: row.osm_type,
    osm_id: row.osm_id,
    sourceObjectId: row.osm_type && row.osm_id ? `osm-${row.osm_type}:${row.osm_id}` : null,
    display_name: row.display_name,
    name: row.namedetails?.name || row.name || null,
    type: row.type,
    category: row.category,
    lat: Number(row.lat),
    lon: Number(row.lon),
    boundingbox: row.boundingbox,
    extratags: row.extratags || {},
    geojsonType: row.geojson?.type || null,
    geometryPointCount: points.length,
    start: points[0] || null,
    end: points.at(-1) || null,
    bounds: points.length ? {
      minLat: Math.min(...points.map((p) => p.lat)),
      maxLat: Math.max(...points.map((p) => p.lat)),
      minLon: Math.min(...points.map((p) => p.lon)),
      maxLon: Math.max(...points.map((p) => p.lon)),
    } : null,
  };
}

const reverseCurrent = {};
for (const id of ids) reverseCurrent[id] = await reverse(places[id].lat, places[id].lon);

const queries = [
  ['alnsjoen_exact', 'Alnsjøen, Oslo, Norway', [10.82, 59.98, 10.88, 59.94], true],
  ['alna_alnsjoen_local', 'Alna, Oslo, Norway', [10.82, 59.98, 10.88, 59.94], true],
  ['alnaparken_exact', 'Alnaparken, Oslo, Norway', [10.85, 59.96, 10.90, 59.92], true],
  ['groruddammen_exact', 'Groruddammen, Oslo, Norway', [10.85, 59.98, 10.90, 59.94], true],
  ['grorudparken_exact', 'Grorudparken, Oslo, Norway', [10.84, 59.98, 10.91, 59.93], true],
  ['alna_smalvoll_local', 'Alna, Oslo, Norway', [10.82, 59.94, 10.86, 59.91], true],
  ['smalvoll_exact', 'Smalvoll, Oslo, Norway', [10.81, 59.94, 10.87, 59.90], true],
  ['alna_bryn_local', 'Alna, Oslo, Norway', [10.79, 59.925, 10.83, 59.895], true],
  ['brynsfossen_exact', 'Brynsfossen, Oslo, Norway', [10.79, 59.925, 10.83, 59.895], true],
  ['bryn_bru_exact', 'Bryn bru, Oslo, Norway', [10.79, 59.925, 10.83, 59.895], true],
  ['svartdalen_exact', 'Svartdalen, Oslo, Norway', [10.77, 59.92, 10.82, 59.89], true],
  ['svartdalsparken_exact', 'Svartdalsparken, Oslo, Norway', [10.77, 59.92, 10.82, 59.89], true],
  ['alna_kvaerner_local', 'Alna, Oslo, Norway', [10.77, 59.915, 10.81, 59.89], true],
  ['kvaernerfossene_exact', 'Kværnerfossene, Oslo, Norway', [10.77, 59.915, 10.81, 59.89], true],
  ['kvaernerbyen_exact', 'Kværnerbyen, Oslo, Norway', [10.77, 59.915, 10.81, 59.89], true],
  ['vannspeilet_exact', 'Vannspeilet Middelalderparken, Oslo, Norway', [10.74, 59.915, 10.78, 59.895], true],
  ['middelalderparken_exact', 'Middelalderparken, Oslo, Norway', [10.74, 59.915, 10.78, 59.895], true],
  ['kongshavn_exact', 'Kongshavn, Oslo, Norway', [10.74, 59.91, 10.79, 59.88], true],
  ['alna_lower_local', 'Alna, Oslo, Norway', [10.74, 59.915, 10.80, 59.88], true],
];

const searches = {};
for (const [key, query, viewbox, bounded] of queries) {
  searches[key] = (await search(query, viewbox, bounded)).map(summarize);
}

const decisionsToTest = {
  alnsjoen_alna_kilde: {
    searches: ['alnsjoen_exact', 'alna_alnsjoen_local'],
    constraint: 'Prefer exact Alnsjøen water geometry or an explicit Alna outflow/source-line object. Do not use an arbitrary lake-edge midpoint.',
  },
  alnaparken: {
    searches: ['alnaparken_exact'],
    constraint: 'Prefer one exact named park geometry.',
  },
  groruddammen: {
    searches: ['groruddammen_exact', 'grorudparken_exact'],
    constraint: 'Prefer exact named dam water geometry; Grorudparken may only be context.',
  },
  alna_smalvoll: {
    searches: ['alna_smalvoll_local', 'smalvoll_exact'],
    constraint: 'Generic river stretch requires one explicitly bounded local Alna line object or remains needs_source.',
  },
  alna_bryn: {
    searches: ['alna_bryn_local', 'brynsfossen_exact', 'bryn_bru_exact'],
    constraint: 'Do not silently replace generic Alna-at-Bryn identity with Brynsfossen or Bryn bru unless the record is explicitly narrowed.',
  },
  svartdalen: {
    searches: ['svartdalen_exact', 'svartdalsparken_exact'],
    constraint: 'Svartdalen ravine and Svartdalsparken are distinct identities.',
  },
  kvaernerbyen_alna: {
    searches: ['alna_kvaerner_local', 'kvaernerfossene_exact', 'kvaernerbyen_exact'],
    constraint: 'Do not confuse Kværnerbyen water mirror/Kværnerdammen with actual Alna without direct geometry support.',
  },
  alna_utlop_bjorvika: {
    searches: ['vannspeilet_exact', 'middelalderparken_exact', 'kongshavn_exact', 'alna_lower_local'],
    constraint: 'Historical Bjørvika/Sørenga outlet and present post-1922 Kongshavn outlet are different time layers. Current record content is not eligible for present-day verification as written.',
  },
};

const result = {
  generatedAt: new Date().toISOString(),
  purpose: 'Nominatim-only exact-object and geometry diagnostic for Oslo coordinate control Batch 36.',
  sourcePath,
  places,
  reverseCurrent,
  searches,
  decisionsToTest,
  authoritativeSourceUrls: {
    alnsjoen_alna_kilde: ['https://oslobyleksikon.no/side/Alnaelva'],
    alnaparken: ['https://oslobyleksikon.no/side/Alnaparken'],
    groruddammen: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken/', 'https://oslobyleksikon.no/side/Grorudparken'],
    alna_smalvoll: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
    alna_bryn: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Bryn_(strøk)'],
    svartdalen: ['https://oslobyleksikon.no/side/Svartdalen', 'https://oslobyleksikon.no/side/Svartdalsparken'],
    kvaernerbyen_alna: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
    alna_utlop_bjorvika: ['https://oslobyleksikon.no/side/Alnaelva', 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/middelalderbyen/'],
  },
};
fs.writeFileSync(path.join(reportDir, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);

const lines = ['# Oslo coordinate control batch 36 – Alnaelva diagnostic v3', '', 'Read-only Nominatim geometry audit. No place coordinates are changed.', ''];
for (const id of ids) {
  const p = places[id];
  const spec = decisionsToTest[id];
  lines.push(`## ${id}`);
  lines.push(`- current: \`${p.lat}, ${p.lon}\``);
  lines.push(`- legacy: \`${p.coordStatus || ''}\` / \`${p.coordSource || ''}\``);
  lines.push(`- reverse: ${reverseCurrent[id]?.display_name || ''}`);
  lines.push(`- constraint: ${spec.constraint}`);
  for (const key of spec.searches) {
    lines.push(`- ${key}: ${searches[key].length} hit(s)`);
    for (const hit of searches[key].slice(0, 8)) {
      lines.push(`  - \`${hit.sourceObjectId}\` — ${hit.name || hit.display_name} — type=\`${hit.category}/${hit.type}\` geo=\`${hit.geojsonType}\` center=\`${hit.lat},${hit.lon}\` bounds=\`${JSON.stringify(hit.bounds)}\``);
    }
  }
  lines.push('');
}
fs.writeFileSync(path.join(reportDir, 'README.md'), `${lines.join('\n')}\n`);
console.log(JSON.stringify({ reportDir, queryCounts: Object.fromEntries(Object.entries(searches).map(([k,v]) => [k,v.length])) }, null, 2));
