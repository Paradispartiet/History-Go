import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'reports/visitoslo-holmenkollen-audit-20260721/coordinate-intake');
mkdirSync(outDir, { recursive: true });

function runAddress(label, address) {
  const outputPath = path.join(outDir, `${label}-geonorge.txt`);
  const quotedAddress = address.replaceAll("'", "'\\''");
  const quotedOutput = outputPath.replaceAll("'", "'\\''");
  const command = `set -o pipefail; npm run places:coords:find:address -- --address '${quotedAddress}' 2>&1 | tee '${quotedOutput}'`;
  const result = spawnSync('bash', ['-lc', command], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'inherit',
  });
  return {
    address,
    file: path.relative(root, outputPath),
    ok: result.status === 0,
    exitCode: result.status,
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'History-Go-coordinate-audit/1.0 (github.com/Paradispartiet/History-Go)',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

const addressResults = [
  runAddress('holmenkollen-kapell', 'Holmenkollveien 142 Oslo'),
  runAddress('oslo-golfklubb-bogstad', 'Ankerveien 127 Oslo'),
];

const objectQueries = [
  ['bogstadvannet', 'Bogstadvannet, Oslo, Norway'],
  ['kollentrollet', 'Kollentrollet, Oslo, Norway'],
  ['vettakollen', 'Vettakollen, Oslo, Norway'],
  ['kragstotten', 'Kragstøtten, Oslo, Norway'],
];

const nominatim = {};
for (const [label, query] of objectQueries) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '10');
  url.searchParams.set('countrycodes', 'no');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  try {
    const data = await fetchJson(url);
    nominatim[label] = { ok: true, count: data.length };
    writeFileSync(path.join(outDir, `${label}-nominatim.json`), `${JSON.stringify(data, null, 2)}\n`);
  } catch (error) {
    nominatim[label] = { ok: false, count: 0, error: String(error) };
    writeFileSync(path.join(outDir, `${label}-nominatim.json`), `${JSON.stringify({ error: String(error) }, null, 2)}\n`);
  }
}

const overpassQuery = `[out:json][timeout:60];
(
  nwr["name"="Bogstadvannet"](59.80,10.35,60.10,10.95);
  nwr["name"="Kollentrollet"](59.80,10.35,60.10,10.95);
  nwr["name"="Vettakollen"](59.80,10.35,60.10,10.95);
  nwr["name"="Kragstøtten"](59.80,10.35,60.10,10.95);
);
out center tags;`;
let overpassSummary = { ok: false, elementCount: 0 };
try {
  const body = new URLSearchParams({ data: overpassQuery }).toString();
  const data = await fetchJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
  });
  overpassSummary = { ok: true, elementCount: Array.isArray(data.elements) ? data.elements.length : 0 };
  writeFileSync(path.join(outDir, 'named-objects-overpass.json'), `${JSON.stringify(data, null, 2)}\n`);
} catch (error) {
  overpassSummary = { ok: false, elementCount: 0, error: String(error) };
  writeFileSync(path.join(outDir, 'named-objects-overpass.json'), `${JSON.stringify({ error: String(error) }, null, 2)}\n`);
}

const indexPath = path.join(root, 'data/places/places_index.json');
let places = [];
try {
  const parsed = JSON.parse(readFileSync(indexPath, 'utf8'));
  places = Array.isArray(parsed) ? parsed : Array.isArray(parsed.places) ? parsed.places : [];
} catch {
  places = [];
}

const candidateTerms = {
  bogstadvannet: ['bogstadvannet'],
  holmenkollen_kapell: ['holmenkollen kapell', 'holmenkollen_kapell'],
  oslo_golfklubb_bogstad: ['oslo golfklubb', 'golfklubb bogstad', 'oslo_golfklubb_bogstad'],
  kollentrollet: ['kollentrollet'],
  vettakollen: ['vettakollen'],
  kragstotten: ['kragstøtten', 'kragstotten'],
};
function norm(value) {
  return String(value ?? '').toLocaleLowerCase('nb-NO');
}
const duplicateHits = {};
for (const [candidate, terms] of Object.entries(candidateTerms)) {
  duplicateHits[candidate] = places
    .filter((place) => {
      const haystack = `${norm(place.id)} ${norm(place.name)}`;
      return terms.some((term) => haystack.includes(norm(term)));
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

const summary = {
  createdAt: new Date().toISOString(),
  candidates: Object.keys(candidateTerms),
  addressResults,
  nominatim,
  overpass: overpassSummary,
  duplicateHits,
  coordinateRules: {
    bogstadvannet: 'Use exact named lake geometry; select a representative point that remains on the lake and document the Oslo/Bærum boundary context.',
    holmenkollen_kapell: 'Use normative Geonorge address-first for Holmenkollveien 142 before any production coordinate is approved.',
    oslo_golfklubb_bogstad: 'Use Ankerveien 127 to verify site identity, then explicitly decide whether the canonical display anchor represents the clubhouse/address or the named golf-course geometry.',
    kollentrollet: 'Require one exact named sculpture object or independently verified physical point; do not inherit the Holmenkollen arena coordinate.',
    vettakollen: 'Require the exact summit/hill object; reject station and residential-area namesakes.',
    kragstotten: 'Require the exact monument object and cross-check identity against the documented 1909 monument at Voksenkollen.',
  },
};
writeFileSync(path.join(outDir, 'intake-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(path.join(outDir, 'duplicate-audit.json'), `${JSON.stringify(duplicateHits, null, 2)}\n`);

// Keep the one-shot runner out of the final branch after it has produced its evidence.
rmSync(fileURLToPath(import.meta.url));
