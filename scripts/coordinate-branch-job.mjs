import fs from 'node:fs';
import path from 'node:path';

const sourcePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json';
const reportDir = 'reports/oslo-coordinate-control-batch-36-diagnostic-v2';
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

async function getJson(url, options = {}, attempts = 3, timeoutMs = 30000) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...headers, ...(options.headers || {}) },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 1200);
    }
  }
  throw new Error(`Request failed: ${url}: ${lastError}`);
}

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '10');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  const result = await getJson(url.toString(), {}, 3, 20000);
  await sleep(1050);
  return result;
}

async function overpass(query) {
  const endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
  ];
  let lastError;
  for (const endpoint of endpoints) {
    try {
      return await getJson(endpoint, {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      }, 2, 35000);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(`All Overpass endpoints failed: ${lastError}`);
}

function summarize(e) {
  const geometry = (e.geometry || []).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
  return {
    type: e.type,
    id: e.id,
    sourceObjectId: `osm-${e.type}:${e.id}`,
    tags: e.tags || {},
    lat: e.lat ?? null,
    lon: e.lon ?? null,
    center: e.center || null,
    geometryCount: geometry.length,
    start: geometry[0] || null,
    end: geometry.at(-1) || null,
    bounds: geometry.length ? {
      minLat: Math.min(...geometry.map((p) => p.lat)),
      maxLat: Math.max(...geometry.map((p) => p.lat)),
      minLon: Math.min(...geometry.map((p) => p.lon)),
      maxLon: Math.max(...geometry.map((p) => p.lon)),
    } : null,
  };
}

const searchQueries = {
  alnsjoen_alna_kilde: 'Alnsjøen, Oslo, Norway',
  alnaparken: 'Alnaparken, Oslo, Norway',
  groruddammen: 'Groruddammen, Oslo, Norway',
  alna_smalvoll: 'Smalvoll, Oslo, Norway',
  alna_bryn: 'Brynsfossen, Oslo, Norway',
  svartdalen: 'Svartdalen, Oslo, Norway',
  kvaernerbyen_alna: 'Kværnerbyen, Oslo, Norway',
  alna_utlop_bjorvika: 'Kongshavn, Oslo, Norway',
};
const searches = {};
for (const id of ids) searches[id] = await nominatimSearch(searchQueries[id]);

const nameRegex = 'Alna|Alnaelva|Loelva|Alnsjøen|Alnaparken|Nylandsparken|Groruddammen|Grorudparken|Smalvoll|Brynsfossen|Bryn bru|Svartdalen|Svartdalsparken|Kværnerbyen|Kværnerfossene|Kongshavn|Sørenga|Bjørvika|Vannspeilet';
function regionalQuery(south, west, north, east) {
  return `[out:json][timeout:30];(
    nwr["name"~"^(${nameRegex})$",i](${south},${west},${north},${east});
    way["waterway"]["name"~"^(Alna|Alnaelva|Loelva)$",i](${south},${west},${north},${east});
    relation["waterway"]["name"~"^(Alna|Alnaelva|Loelva)$",i](${south},${west},${north},${east});
    nwr["natural"="water"](${south},${west},${north},${east});
  );out tags center geom;`;
}

const regions = {
  upper: (await overpass(regionalQuery(59.935, 10.835, 59.975, 10.905))).elements.map(summarize),
  middle: (await overpass(regionalQuery(59.900, 10.775, 59.940, 10.855))).elements.map(summarize),
  lower: (await overpass(regionalQuery(59.885, 10.740, 59.910, 10.800))).elements.map(summarize),
};

const identityConstraints = {
  alnsjoen_alna_kilde: 'Alna proper is documented from Alnsjøen; distinguish exact lake geometry from the actual outflow/source-line anchor.',
  alnaparken: 'Use exact named park geometry if available; do not substitute a generic nearby Alna segment for the named park record.',
  groruddammen: 'Use exact named dam geometry if available.',
  alna_smalvoll: 'Generic local river stretch; requires an explicitly bounded/source-backed line anchor or needs_source.',
  alna_bryn: 'Generic Alna-at-Bryn record; an exact Brynsfossen or bridge object may only be used if the identity is explicitly narrowed, not silently substituted.',
  svartdalen: 'Svartdalen is the named ravine/valley and is distinct from Svartdalsparken.',
  kvaernerbyen_alna: 'Record describes actual Alna at Kværnerbyen; do not confuse the planned water mirror/Kværnerdammen with the river without source support.',
  alna_utlop_bjorvika: 'Identity/time-layer conflict: Bjørvika/Sørenga is the historical original outlet; since 1922 the river is tunnelled to Kongshavn. Do not verify as a present-day Bjørvika outlet.',
};

const result = {
  generatedAt: new Date().toISOString(),
  sourcePath,
  ids,
  places,
  nominatimSearches: searches,
  regionalGeometry: regions,
  identityConstraints,
  authoritativeSourceUrls: {
    alnsjoen_alna_kilde: ['https://oslobyleksikon.no/side/Alnaelva'],
    alnaparken: ['https://oslobyleksikon.no/side/Alnaparken', 'https://oslobyleksikon.no/side/Alnaelva'],
    groruddammen: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken/', 'https://oslobyleksikon.no/side/Grorudparken'],
    alna_smalvoll: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
    alna_bryn: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Bryn_(strøk)'],
    svartdalen: ['https://oslobyleksikon.no/side/Svartdalen', 'https://oslobyleksikon.no/side/Svartdalsparken'],
    kvaernerbyen_alna: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
    alna_utlop_bjorvika: ['https://oslobyleksikon.no/side/Alnaelva', 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/middelalderbyen/'],
  },
};
fs.writeFileSync(path.join(reportDir, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);

const lines = ['# Oslo coordinate control batch 36 – Alnaelva diagnostic v2', '', 'Read-only audit. No place coordinates are changed.', ''];
for (const id of ids) {
  const p = places[id];
  lines.push(`## ${id}`);
  lines.push(`- current: \`${p.lat}, ${p.lon}\``);
  lines.push(`- legacy: \`${p.coordStatus || ''}\` / \`${p.coordSource || ''}\``);
  lines.push(`- Nominatim hits: ${searches[id].length}`);
  lines.push(`- identity constraint: ${identityConstraints[id]}`);
  lines.push('');
}
for (const [region, elements] of Object.entries(regions)) {
  lines.push(`## ${region} region geometry`);
  for (const e of elements) {
    const t = e.tags || {};
    lines.push(`- \`${e.sourceObjectId}\` name=\`${t.name || ''}\` waterway=\`${t.waterway || ''}\` natural=\`${t.natural || ''}\` water=\`${t.water || ''}\` leisure=\`${t.leisure || ''}\` tunnel=\`${t.tunnel || ''}\` center=\`${JSON.stringify(e.center || (e.lat != null ? {lat:e.lat,lon:e.lon}:null))}\` start=\`${JSON.stringify(e.start)}\` end=\`${JSON.stringify(e.end)}\``);
  }
  lines.push('');
}
fs.writeFileSync(path.join(reportDir, 'README.md'), `${lines.join('\n')}\n`);
console.log(JSON.stringify({ reportDir, counts: Object.fromEntries(Object.entries(regions).map(([k,v]) => [k,v.length])) }, null, 2));
