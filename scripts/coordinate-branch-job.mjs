import fs from 'node:fs';
import path from 'node:path';

const sourcePath = 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute.json';
const reportDir = 'reports/oslo-coordinate-control-batch-36-diagnostic';
const places = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const ids = [
  'alnsjoen_alna_kilde',
  'alnaparken',
  'groruddammen',
  'alna_smalvoll',
  'alna_bryn',
  'svartdalen',
  'kvaernerbyen_alna',
  'alna_utlop_bjorvika',
];
const selected = places.filter((p) => ids.includes(p.id));
if (selected.length !== ids.length) throw new Error(`Expected ${ids.length} Alna records, got ${selected.length}`);
fs.mkdirSync(reportDir, { recursive: true });

const headers = { 'User-Agent': 'History-Go-coordinate-control/1.0 contact=repository-audit' };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function nominatimSearch(q, limit = 10) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  const rows = await getJson(url.toString());
  await sleep(1100);
  return rows;
}

async function nominatimReverse(lat, lon) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('namedetails', '1');
  const row = await getJson(url.toString());
  await sleep(1100);
  return row;
}

async function overpass(query) {
  const body = new URLSearchParams({ data: query });
  return getJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  });
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function geometryCoordinates(element) {
  const geom = element.geometry || [];
  return geom
    .filter((g) => Number.isFinite(g.lat) && Number.isFinite(g.lon))
    .map((g) => ({ lat: Number(g.lat), lon: Number(g.lon) }));
}

function representativePoint(element) {
  if (element.center && Number.isFinite(element.center.lat) && Number.isFinite(element.center.lon)) {
    return { lat: Number(element.center.lat), lon: Number(element.center.lon) };
  }
  const coords = geometryCoordinates(element);
  if (coords.length) return coords[Math.floor(coords.length / 2)];
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: Number(element.lat), lon: Number(element.lon) };
  return null;
}

function summarizeElement(element) {
  const coords = geometryCoordinates(element);
  return {
    type: element.type,
    id: element.id,
    sourceObjectId: `osm-${element.type}:${element.id}`,
    tags: element.tags || {},
    center: element.center || null,
    representativePoint: representativePoint(element),
    geometryCount: coords.length,
    start: coords[0] || null,
    end: coords.at(-1) || null,
    bounds: coords.length ? {
      minLat: Math.min(...coords.map((p) => p.lat)),
      maxLat: Math.max(...coords.map((p) => p.lat)),
      minLon: Math.min(...coords.map((p) => p.lon)),
      maxLon: Math.max(...coords.map((p) => p.lon)),
    } : null,
  };
}

const reverseCurrent = {};
for (const place of selected) reverseCurrent[place.id] = await nominatimReverse(place.lat, place.lon);

const searchQueries = {
  alnsjoen: 'Alnsjøen, Oslo, Norway',
  alna_river: 'Alna, Oslo, Norway',
  alnaparken: 'Alnaparken, Oslo, Norway',
  groruddammen: 'Groruddammen, Oslo, Norway',
  grorudparken: 'Grorudparken, Oslo, Norway',
  smalvoll: 'Smalvoll, Oslo, Norway',
  bryn: 'Bryn, Oslo, Norway',
  brynsfossen: 'Brynsfossen, Oslo, Norway',
  bryn_bru: 'Bryn bru, Oslo, Norway',
  svartdalen: 'Svartdalen, Oslo, Norway',
  svartdalsparken: 'Svartdalsparken, Oslo, Norway',
  kvaernerbyen: 'Kværnerbyen, Oslo, Norway',
  kvaernerfossene: 'Kværnerfossene, Oslo, Norway',
  kongshavn: 'Kongshavn, Oslo, Norway',
  bjorvika: 'Bjørvika, Oslo, Norway',
  sorenga: 'Sørenga, Oslo, Norway',
};
const searches = {};
for (const [key, query] of Object.entries(searchQueries)) searches[key] = await nominatimSearch(query);

const broadQuery = `[out:json][timeout:120];
(
  nwr["name"~"^(Alnsjøen|Alnaparken|Groruddammen|Grorudparken|Svartdalen|Svartdalsparken|Brynsfossen|Bryn bru|Kværnerfossene|Kværnerbyen|Kongshavn)$",i](59.885,10.74,59.985,10.91);
  nwr["waterway"]["name"~"^(Alna|Alnaelva|Loelva)$",i](59.885,10.74,59.985,10.91);
  nwr["natural"="water"]["name"~"^(Alnsjøen|Groruddammen)$",i](59.885,10.74,59.985,10.91);
  nwr["water"]["name"~"^(Alnsjøen|Groruddammen)$",i](59.885,10.74,59.985,10.91);
);
out tags center geom;`;
const broad = await overpass(broadQuery);
const candidates = broad.elements.map(summarizeElement);

const localQueries = {};
for (const place of selected) {
  const q = `[out:json][timeout:90];
  (
    way["waterway"](around:900,${place.lat},${place.lon});
    relation["waterway"](around:900,${place.lat},${place.lon});
    nwr["natural"="water"](around:900,${place.lat},${place.lon});
    nwr["leisure"="park"](around:900,${place.lat},${place.lon});
    nwr["boundary"="protected_area"](around:900,${place.lat},${place.lon});
    nwr["place"](around:900,${place.lat},${place.lon});
    nwr["man_made"="bridge"](around:900,${place.lat},${place.lon});
  );
  out tags center geom;`;
  const result = await overpass(q);
  localQueries[place.id] = result.elements.map(summarizeElement);
}

const nearestNamedAlna = {};
for (const place of selected) {
  const here = { lat: place.lat, lon: place.lon };
  const ranked = [];
  for (const element of candidates) {
    const tags = element.tags || {};
    const name = String(tags.name || tags.alt_name || '');
    if (!/(^|\b)(Alna|Alnaelva|Loelva)(\b|$)/i.test(name) && tags.waterway !== 'river') continue;
    const points = [];
    if (element.representativePoint) points.push(element.representativePoint);
    if (element.start) points.push(element.start);
    if (element.end) points.push(element.end);
    for (const p of geometryCoordinates(broad.elements.find((e) => e.type === element.type && e.id === element.id) || {})) points.push(p);
    if (!points.length) continue;
    const distance = Math.min(...points.map((p) => haversineMeters(here, p)));
    ranked.push({ distanceM: Math.round(distance), ...element });
  }
  nearestNamedAlna[place.id] = ranked.sort((a, b) => a.distanceM - b.distanceM).slice(0, 12);
}

const sourceContext = {
  alnsjoen_alna_kilde: {
    authoritativeIdentity: 'Oslo byleksikon describes the actual Alna as running from Alnsjøen; upper source streams exist north of the lake.',
    sourceUrls: ['https://oslobyleksikon.no/side/Alnaelva'],
    question: 'Can the record use exact Alnsjøen geometry or a documented Alna outflow/source-line anchor rather than a generic route point?'
  },
  alnaparken: {
    authoritativeIdentity: 'Oslo byleksikon documents Alnaparken/Nylandsparken as a park along Alnaelva south of Østre Aker vei.',
    sourceUrls: ['https://oslobyleksikon.no/side/Alnaparken'],
    question: 'Is there one exact named park geometry suitable for an area anchor?'
  },
  groruddammen: {
    authoritativeIdentity: 'Oslo municipality and Oslo byleksikon document Groruddammen as part of Grorudparken along Alnaelva.',
    sourceUrls: ['https://www.oslo.kommune.no/natur-kultur-og-fritid/tur-og-friluftsliv/parker-og-lekeplasser/grorudparken/', 'https://oslobyleksikon.no/side/Grorudparken'],
    question: 'Is there one exact named water geometry for Groruddammen?'
  },
  alna_smalvoll: {
    authoritativeIdentity: 'The Alna trail and river are documented through Smalvollveien/Smalvolldalen, but this record names a local river stretch rather than a unique object.',
    sourceUrls: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
    question: 'Can one named Alna segment be explicitly bounded as the Smalvoll line anchor, or must this remain needs_source?'
  },
  alna_bryn: {
    authoritativeIdentity: 'Oslo byleksikon documents Alna at Bryn and the industrial use of Brynsfossen; the current record is a generic local river stretch.',
    sourceUrls: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Bryn_(strøk)'],
    question: 'Can the record be anchored to an exact named Alna/Brynsfossen geometry without silently changing its identity?'
  },
  svartdalen: {
    authoritativeIdentity: 'Oslo byleksikon documents Svartdalen as the named ravine valley above Kværner through which Alna runs; Svartdalsparken is a distinct nearby park.',
    sourceUrls: ['https://oslobyleksikon.no/side/Svartdalen', 'https://oslobyleksikon.no/side/Svartdalsparken'],
    question: 'Is there an exact named Svartdalen area object, or should a documented area anchor be used instead of confusing it with Svartdalsparken?'
  },
  kvaernerbyen_alna: {
    authoritativeIdentity: 'The record describes the Alna river point at Kværnerbyen, not Kværnerbyen as a whole.',
    sourceUrls: ['https://oslobyleksikon.no/side/Alnaelva', 'https://oslobyleksikon.no/side/Alnastien'],
    question: 'Is there an exact named visible Alna segment at Kværner that can serve as a line anchor?'
  },
  alna_utlop_bjorvika: {
    authoritativeIdentity: 'The record text treats Bjørvika as a present outlet, but Oslo byleksikon documents Sørenga/Bjørvika as the original outlet and the post-1922 river as tunnelled to Kongshavn roughly 900 m farther south.',
    sourceUrls: ['https://oslobyleksikon.no/side/Alnaelva'],
    question: 'This is an identity/time-layer problem: can a historical original-outlet anchor be documented precisely, or must the record be downgraded until content is corrected?'
  }
};

const result = {
  generatedAt: new Date().toISOString(),
  sourcePath,
  places: Object.fromEntries(selected.map((p) => [p.id, p])),
  reverseCurrent,
  nominatimSearches: searches,
  broadNamedCandidates: candidates,
  localCandidates: localQueries,
  nearestNamedAlna,
  sourceContext,
};
fs.writeFileSync(path.join(reportDir, 'results.json'), `${JSON.stringify(result, null, 2)}\n`);

const lines = [
  '# Oslo coordinate control batch 36 – Alnaelva diagnostic',
  '',
  'Read-only source/geometry audit of all eight uncontrolled Alnaelva-route records.',
  '',
];
for (const place of selected) {
  const reverse = reverseCurrent[place.id];
  lines.push(`## ${place.id}`);
  lines.push(`- current: \`${place.lat}, ${place.lon}\``);
  lines.push(`- current status: \`${place.coordStatus || ''}\` / \`${place.coordSource || ''}\``);
  lines.push(`- reverse: ${reverse?.display_name || ''}`);
  lines.push(`- identity question: ${sourceContext[place.id].question}`);
  lines.push('- nearest named Alna/waterway candidates:');
  for (const candidate of nearestNamedAlna[place.id].slice(0, 5)) {
    lines.push(`  - ${candidate.distanceM} m — \`${candidate.sourceObjectId}\` — name=\`${candidate.tags?.name || candidate.tags?.alt_name || ''}\` waterway=\`${candidate.tags?.waterway || ''}\` tunnel=\`${candidate.tags?.tunnel || ''}\``);
  }
  lines.push('');
}
lines.push('## Named object candidates');
for (const c of candidates) {
  lines.push(`- \`${c.sourceObjectId}\` — name=\`${c.tags?.name || ''}\` alt=\`${c.tags?.alt_name || ''}\` natural=\`${c.tags?.natural || ''}\` water=\`${c.tags?.water || ''}\` waterway=\`${c.tags?.waterway || ''}\` leisure=\`${c.tags?.leisure || ''}\` tunnel=\`${c.tags?.tunnel || ''}\` center=\`${JSON.stringify(c.representativePoint)}\``);
}
fs.writeFileSync(path.join(reportDir, 'README.md'), `${lines.join('\n')}\n`);

console.log(JSON.stringify({ reportDir, records: ids.length, broadCandidates: candidates.length }, null, 2));
