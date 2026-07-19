import fs from 'node:fs';
import path from 'node:path';

const sourcePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json';
const reportDir = 'reports/oslo-coordinate-control-batch-36-diagnostic';
const ids = [
  'alnsjoen_alna_kilde', 'alnaparken', 'groruddammen', 'alna_smalvoll',
  'alna_bryn', 'svartdalen', 'kvaernerbyen_alna', 'alna_utlop_bjorvika',
];
const all = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const places = Object.fromEntries(all.filter((p) => ids.includes(p.id)).map((p) => [p.id, p]));
if (Object.keys(places).length !== ids.length) throw new Error('Batch 36 source does not contain all eight expected records');
fs.mkdirSync(reportDir, { recursive: true });

const userAgent = 'History-Go-coordinate-control/1.0 repository-coordinate-audit';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function jsonWithRetry(url, options = {}, attempts = 4) {
  let last;
  for (let i = 1; i <= attempts; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'User-Agent': userAgent, ...(options.headers || {}) },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      last = error;
      if (i < attempts) await sleep(1500 * i);
    }
  }
  throw new Error(`Request failed after ${attempts} attempts: ${url}: ${last}`);
}

async function nominatim(endpoint, params) {
  const url = new URL(`https://nominatim.openstreetmap.org/${endpoint}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value));
  const result = await jsonWithRetry(url.toString());
  await sleep(1100);
  return result;
}

const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
async function overpass(query) {
  let last;
  for (const endpoint of overpassEndpoints) {
    try {
      const body = new URLSearchParams({ data: query });
      return await jsonWithRetry(endpoint, {
        method: 'POST',
        body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      }, 2);
    } catch (error) {
      last = error;
    }
  }
  throw new Error(`All Overpass endpoints failed: ${last}`);
}

function summarize(e) {
  const geom = (e.geometry || []).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
  return {
    type: e.type,
    id: e.id,
    sourceObjectId: `osm-${e.type}:${e.id}`,
    tags: e.tags || {},
    center: e.center || null,
    lat: e.lat ?? null,
    lon: e.lon ?? null,
    geometryCount: geom.length,
    start: geom[0] || null,
    end: geom.at(-1) || null,
    bounds: geom.length ? {
      minLat: Math.min(...geom.map((p) => p.lat)),
      maxLat: Math.max(...geom.map((p) => p.lat)),
      minLon: Math.min(...geom.map((p) => p.lon)),
      maxLon: Math.max(...geom.map((p) => p.lon)),
    } : null,
  };
}

const reverse = {};
for (const id of ids) {
  const p = places[id];
  reverse[id] = await nominatim('reverse', {
    lat: p.lat, lon: p.lon, format: 'jsonv2', zoom: 18, addressdetails: 1, extratags: 1,
  });
}

const searchTerms = {
  alnsjoen_alna_kilde: 'Alnsjøen Oslo Norway',
  alnaparken: 'Alnaparken Oslo Norway',
  groruddammen: 'Groruddammen Oslo Norway',
  alna_smalvoll: 'Smalvoll Oslo Norway',
  alna_bryn: 'Brynsfossen Oslo Norway',
  svartdalen: 'Svartdalen Oslo Norway',
  kvaernerbyen_alna: 'Kværnerbyen Oslo Norway',
  alna_utlop_bjorvika: 'Kongshavn Oslo Norway',
};
const searches = {};
for (const id of ids) {
  searches[id] = await nominatim('search', {
    q: searchTerms[id], format: 'jsonv2', limit: 8, addressdetails: 1, extratags: 1, namedetails: 1,
  });
}

const localGeometry = {};
for (const id of ids.filter((x) => x !== 'alna_utlop_bjorvika')) {
  const p = places[id];
  const exactName = id === 'alnsjoen_alna_kilde' ? 'Alnsjøen'
    : id === 'alnaparken' ? 'Alnaparken|Nylandsparken'
    : id === 'groruddammen' ? 'Groruddammen'
    : id === 'svartdalen' ? 'Svartdalen|Svartdalsparken'
    : id === 'alna_bryn' ? 'Brynsfossen|Bryn bru'
    : id === 'kvaernerbyen_alna' ? 'Kværnerbyen|Kværnerfossene'
    : 'Smalvoll';
  const query = `[out:json][timeout:50];(
    way["waterway"]["name"~"^(Alna|Alnaelva|Loelva)$",i](around:700,${p.lat},${p.lon});
    relation["waterway"]["name"~"^(Alna|Alnaelva|Loelva)$",i](around:700,${p.lat},${p.lon});
    nwr["name"~"^(${exactName})$",i](around:1200,${p.lat},${p.lon});
  );out tags center geom;`;
  localGeometry[id] = (await overpass(query)).elements.map(summarize);
}

const outletQuery = `[out:json][timeout:60];(
  way["waterway"]["name"~"^(Alna|Alnaelva|Loelva)$",i](59.887,10.742,59.910,10.775);
  relation["waterway"]["name"~"^(Alna|Alnaelva|Loelva)$",i](59.887,10.742,59.910,10.775);
  nwr["name"~"^(Kongshavn|Sørenga|Bjørvika)$",i](59.887,10.742,59.910,10.775);
);out tags center geom;`;
localGeometry.alna_utlop_bjorvika = (await overpass(outletQuery)).elements.map(summarize);

const identitySources = {
  alnsjoen_alna_kilde: ['https://oslobyleksikon.no/side/Alnaelva'],
  alnaparken: ['https://oslobyleksikon.no/side/Alnaparken', 'https://oslobyleksikon.no/side/Alnaelva'],
  groruddammen: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken/', 'https://oslobyleksikon.no/side/Grorudparken'],
  alna_smalvoll: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
  alna_bryn: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Bryn_(strøk)'],
  svartdalen: ['https://oslobyleksikon.no/side/Svartdalen', 'https://oslobyleksikon.no/side/Svartdalsparken'],
  kvaernerbyen_alna: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
  alna_utlop_bjorvika: ['https://oslobyleksikon.no/side/Alnaelva'],
};

const result = {
  generatedAt: new Date().toISOString(),
  purpose: 'Read-only geometry/identity diagnostic for Oslo coordinate control Batch 36.',
  sourcePath,
  ids,
  places,
  reverseCurrentCoordinates: reverse,
  nominatimSearches: searches,
  localGeometry,
  identitySources,
  knownIdentityConstraint: {
    alna_utlop_bjorvika: 'Oslo byleksikon documents Sørenga/Bjørvika as the original outlet, while the river has been tunnelled to Kongshavn since 1922. Do not verify this record as a present-day Bjørvika river mouth without correcting its time layer/identity.',
  },
};
fs.writeFileSync(path.join(reportDir, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);

const lines = ['# Oslo coordinate control batch 36 – Alnaelva diagnostic', '', 'Read-only audit. No place coordinates are changed.', ''];
for (const id of ids) {
  const p = places[id];
  const rev = reverse[id];
  lines.push(`## ${id}`);
  lines.push(`- current: \`${p.lat}, ${p.lon}\``);
  lines.push(`- legacy status/source: \`${p.coordStatus || ''}\` / \`${p.coordSource || ''}\``);
  lines.push(`- reverse: ${rev?.display_name || ''}`);
  lines.push(`- Nominatim exact/name search hits: ${searches[id].length}`);
  lines.push(`- local geometry candidates: ${localGeometry[id].length}`);
  for (const e of localGeometry[id].slice(0, 15)) {
    lines.push(`  - \`${e.sourceObjectId}\` name=\`${e.tags.name || ''}\` alt=\`${e.tags.alt_name || ''}\` waterway=\`${e.tags.waterway || ''}\` natural=\`${e.tags.natural || ''}\` leisure=\`${e.tags.leisure || ''}\` tunnel=\`${e.tags.tunnel || ''}\` center=\`${JSON.stringify(e.center || (e.lat != null ? {lat:e.lat,lon:e.lon}:null))}\``);
  }
  if (id === 'alna_utlop_bjorvika') lines.push('- identity constraint: historical Bjørvika/Sørenga outlet must not be confused with the post-1922 Kongshavn outlet.');
  lines.push('');
}
fs.writeFileSync(path.join(reportDir, 'README.md'), `${lines.join('\n')}\n`);

console.log(JSON.stringify({ reportDir, records: ids.length, candidateCounts: Object.fromEntries(ids.map((id) => [id, localGeometry[id].length])) }, null, 2));
