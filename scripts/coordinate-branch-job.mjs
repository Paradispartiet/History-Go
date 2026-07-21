import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const outDir = 'reports/visitoslo-bygdoy-audit-20260721/coordinate-intake';
fs.mkdirSync(outDir, { recursive: true });

function runAddress(label, address) {
  try {
    const output = execFileSync(
      'npm',
      ['run', 'places:coords:find:address', '--', '--address', address],
      { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 },
    );
    fs.writeFileSync(path.join(outDir, `${label}-geonorge.txt`), output);
    return { ok: true, address, file: `${label}-geonorge.txt` };
  } catch (error) {
    const output = `${error.stdout || ''}${error.stderr || ''}`;
    fs.writeFileSync(path.join(outDir, `${label}-geonorge.txt`), output);
    return { ok: false, address, file: `${label}-geonorge.txt`, exitCode: error.status ?? null };
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
  const query = `[out:json][timeout:90];area["name"="Oslo"]["boundary"="administrative"]->.a;(nwr["name"~"Bygdø Kongsgård|Bygdøy Kongsgård|Bygdø Royal Farm",i](area.a);nwr["name"~"Oscarshall",i](area.a);nwr["name"~"Vikingtidsmuseet|Vikingskipshuset|Viking Ship Museum|Museum of the Viking Age",i](area.a););out center tags;`;
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
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function duplicateAudit() {
  const places = JSON.parse(fs.readFileSync('data/places/places_index.json', 'utf8'));
  const terms = {
    bygdoy_kongsgard: ['bygdø kongsgård', 'bygdøy kongsgård', 'bygdø royal farm', 'bygdoy kongsgard'],
    oscarshall: ['oscarshall'],
    vikingtidsmuseet: ['vikingtidsmuseet', 'vikingskipshuset', 'vikingskipsmuseet', 'viking ship museum', 'museum of the viking age'],
  };
  const result = {};
  for (const [candidate, candidateTerms] of Object.entries(terms)) {
    const normalizedTerms = candidateTerms.map(normalize);
    result[candidate] = places
      .filter((place) => {
        const haystack = normalize([
          place.id,
          place.name,
          place.desc,
          place.popupDesc,
          ...(Array.isArray(place.aliases) ? place.aliases : []),
        ].join(' '));
        return normalizedTerms.some((term) => haystack.includes(term));
      })
      .map((place) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        lat: place.lat,
        lon: place.lon,
        sourceFile: place.sourceFile,
      }));
  }
  fs.writeFileSync(path.join(outDir, 'duplicate-audit.json'), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

const addressResults = [
  runAddress('oscarshall', 'Oscarshallveien 15 Oslo'),
  runAddress('vikingtidsmuseet', 'Huk Aveny 35 Oslo'),
];

const named = {};
for (const [label, query] of [
  ['bygdoy-kongsgard', 'Bygdø Kongsgård Oslo Norway'],
  ['oscarshall', 'Oscarshall Oslo Norway'],
  ['vikingtidsmuseet', 'Vikingtidsmuseet Huk Aveny 35 Oslo Norway'],
  ['vikingskipshuset', 'Vikingskipshuset Huk Aveny 35 Oslo Norway'],
]) {
  try {
    named[label] = await nominatim(label, query);
  } catch (error) {
    named[label] = { error: String(error) };
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

const duplicates = duplicateAudit();
const summary = {
  createdAt: '2026-07-21',
  candidates: ['bygdoy_kongsgard', 'oscarshall', 'vikingtidsmuseet'],
  addressResults,
  nominatimResultCounts: Object.fromEntries(
    Object.entries(named).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]),
  ),
  overpassElementCount: Array.isArray(overpassData?.elements) ? overpassData.elements.length : 0,
  duplicateHits: duplicates,
  representationRules: {
    bygdoy_kongsgard: 'Do not reuse the separate salamander-dam nature locality as coverage for the royal farm / residence.',
    oscarshall: 'Model the palace as the primary visitor place; do not create a second park marker from this source alone.',
    vikingtidsmuseet: 'Use one stable physical site identity for the retained Vikingskipshuset plus new museum complex; opening status is separate from coordinate verification.',
  },
};
fs.writeFileSync(path.join(outDir, 'intake-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary, null, 2));
