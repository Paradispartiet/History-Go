import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const outDir = 'reports/visitoslo-bjorvika-audit-20260721/coordinate-intake';
fs.mkdirSync(outDir, { recursive: true });

function addressLookup(label, address) {
  try {
    const output = execFileSync('npm', ['run', 'places:coords:find:address', '--', '--address', address], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    fs.writeFileSync(path.join(outDir, `${label}-geonorge.txt`), output);
    return { label, address, ok: true };
  } catch (error) {
    fs.writeFileSync(path.join(outDir, `${label}-geonorge.txt`), `${error.stdout || ''}${error.stderr || ''}`);
    return { label, address, ok: false, exitCode: error.status ?? null };
  }
}

async function nominatim(label, query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '10');
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go coordinate audit (github.com/Paradispartiet/History-Go)' },
  });
  if (!response.ok) throw new Error(`${label}: Nominatim HTTP ${response.status}`);
  const data = await response.json();
  fs.writeFileSync(path.join(outDir, `${label}-nominatim.json`), `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

async function overpass() {
  const query = `[out:json][timeout:90];area["name"="Oslo"]["boundary"="administrative"]->.a;(nwr["name"~"Sukkerbiten|Losæter|Losaeter|Friluftshuset|Operastranda",i](area.a););out center tags;`;
  const url = new URL('https://overpass-api.de/api/interpreter');
  url.searchParams.set('data', query);
  const response = await fetch(url, {
    headers: { 'User-Agent': 'History-Go coordinate audit (github.com/Paradispartiet/History-Go)' },
  });
  if (!response.ok) throw new Error(`Overpass HTTP ${response.status}`);
  const data = await response.json();
  fs.writeFileSync(path.join(outDir, 'named-objects-overpass.json'), `${JSON.stringify(data, null, 2)}\n`);
  return data;
}

function normalize(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const addressResults = [
  addressLookup('sukkerbiten', 'Nylandsveien 28 Oslo'),
  addressLookup('friluftshuset-sorenga', 'Sørengkaia 124 Oslo'),
];

const queries = {
  sukkerbiten: 'Sukkerbiten Oslo Norway',
  losaeter: 'Losæter Oslo Norway',
  friluftshuset_sorenga: 'Friluftshuset Sørenga Oslo Norway',
  operastranda: 'Operastranda Oslo Norway',
};
const namedResults = {};
for (const [label, query] of Object.entries(queries)) {
  try {
    namedResults[label] = await nominatim(label, query);
  } catch (error) {
    namedResults[label] = { error: String(error) };
    fs.writeFileSync(path.join(outDir, `${label}-nominatim-error.txt`), `${String(error)}\n`);
  }
}

let overpassData;
try {
  overpassData = await overpass();
} catch (error) {
  overpassData = { error: String(error) };
  fs.writeFileSync(path.join(outDir, 'named-objects-overpass-error.txt'), `${String(error)}\n`);
}

const places = JSON.parse(fs.readFileSync('data/places/places_index.json', 'utf8'));
const terms = {
  sukkerbiten_badstulandsby: ['sukkerbiten', 'oslo badstuforening sukkerbiten'],
  losaeter: ['losæter', 'losaeter'],
  friluftshuset_sorenga: ['friluftshuset', 'friluftshuset sørenga', 'friluftshuset sorenga'],
  operastranda: ['operastranda'],
};
const duplicateHits = {};
for (const [candidateId, candidateTerms] of Object.entries(terms)) {
  const needles = candidateTerms.map(normalize);
  duplicateHits[candidateId] = places.filter((place) => {
    const haystack = normalize([place.id, place.name, place.desc, place.popupDesc, ...(Array.isArray(place.aliases) ? place.aliases : [])].join(' '));
    return needles.some((needle) => haystack.includes(needle));
  }).map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    lat: place.lat,
    lon: place.lon,
    sourceFile: place.sourceFile,
  }));
}
fs.writeFileSync(path.join(outDir, 'duplicate-audit.json'), `${JSON.stringify(duplicateHits, null, 2)}\n`);

const summary = {
  createdAt: '2026-07-21',
  candidates: Object.keys(terms),
  addressResults,
  nominatimResultCounts: Object.fromEntries(Object.entries(namedResults).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
  overpassElementCount: Array.isArray(overpassData?.elements) ? overpassData.elements.length : 0,
  duplicateHits,
  representationLocks: {
    sukkerbiten_badstulandsby: 'one current stable sauna-village site; no individual-sauna markers',
    losaeter: 'named art-and-urban-agriculture place; not generic Bjørvika area proxy',
    friluftshuset_sorenga: 'distinct institution/building; audit overlap with sorenga and sorenga_sjobad',
    operastranda: 'named municipal beach; do not substitute broad bjorvika anchor',
  },
};
fs.writeFileSync(path.join(outDir, 'intake-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
