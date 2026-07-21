import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const outDir = path.join(root, 'reports/visitoslo-parks-nature-audit-20260721/coordinate-intake');
fs.mkdirSync(outDir, { recursive: true });

const candidates = {
  frognerparken: {
    queries: ['Frognerparken, Oslo, Norway', 'Frogner Park, Oslo, Norway'],
    exactNames: ['Frognerparken', 'Frogner Park'],
    rule: 'Require the named park geometry. Keep Vigelandsparken as a nested/distinct sculpture-park identity rather than using it as a proxy for the whole park.'
  },
  lillomarka: {
    queries: ['Lillomarka, Oslo, Norway'],
    exactNames: ['Lillomarka'],
    rule: 'Require a named forest/Marka area object or authoritative boundary-aware semantic anchor. Do not reduce the large forest area to a trailhead address.'
  },
  grorudparken: {
    queries: ['Grorudparken, Oslo, Norway'],
    exactNames: ['Grorudparken'],
    rule: 'Require the named park geometry, distinct from the broad Grorud district place.'
  },
  aamot_bru: {
    queries: ['Aamot bru, Oslo, Norway', 'Åmot bru, Oslo, Norway', 'Aamodt bru, Oslo, Norway'],
    exactNames: ['Aamot bru', 'Åmot bru', 'Aamodt bru', 'Aamodtbrua'],
    rule: 'Require the exact physical bridge object/geometry and normalize the canonical display name only after source cross-check.'
  },
  klosterenga_skulpturpark: {
    queries: ['Klosterenga skulpturpark, Oslo, Norway', 'Klosterenga park, Oslo, Norway'],
    exactNames: ['Klosterenga skulpturpark', 'Klosterenga park', 'Klosterenga'],
    rule: 'Require the named park/sculpture-park geometry and keep individual artworks as nested exact objects where already canonical.'
  },
  brekkedammen: {
    queries: ['Brekkedammen, Oslo, Norway', 'Kjelsåsdammen, Oslo, Norway'],
    exactNames: ['Brekkedammen', 'Kjelsåsdammen', 'Sagdammen'],
    rule: 'Require the named Brekkedammen/Kjelsåsdammen water or recreation geometry. Explicitly reject the existing frysjadammen record, which represents Maridalsoset.'
  },
  peer_gynt_parken: {
    queries: ['Peer Gynt-parken, Oslo, Norway', 'Peer Gynt park, Oslo, Norway'],
    exactNames: ['Peer Gynt-parken', 'Peer Gynt park', 'Peer Gynt Park'],
    rule: 'Require the named sculpture-park geometry at Løren, distinct from individual sculptures and the wider neighbourhood.'
  }
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'History-Go-coordinate-audit/1.0 (github.com/Paradispartiet/History-Go)',
      ...(options.headers ?? {})
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

const nominatimSummary = {};
for (const [id, spec] of Object.entries(candidates)) {
  const results = [];
  for (const query of spec.queries) {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '10');
    url.searchParams.set('countrycodes', 'no');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('polygon_geojson', '1');
    try {
      const data = await fetchJson(url);
      results.push({ query, ok: true, count: data.length, results: data });
    } catch (error) {
      results.push({ query, ok: false, count: 0, error: String(error), results: [] });
    }
  }
  nominatimSummary[id] = {
    rule: spec.rule,
    queries: results.map(({ query, ok, count, error }) => ({ query, ok, count, ...(error ? { error } : {}) }))
  };
  fs.writeFileSync(path.join(outDir, `${id}-nominatim.json`), `${JSON.stringify(results, null, 2)}\n`);
}

const allNames = [...new Set(Object.values(candidates).flatMap((spec) => spec.exactNames))];
const escaped = allNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const overpassQuery = `[out:json][timeout:90];
(
  nwr["name"~"^(${escaped})$",i](59.80,10.45,60.10,11.05);
);
out center tags geom;`;
let overpass = { ok: false, elementCount: 0, elements: [] };
try {
  const body = new URLSearchParams({ data: overpassQuery }).toString();
  const data = await fetchJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body
  });
  overpass = { ok: true, elementCount: Array.isArray(data.elements) ? data.elements.length : 0, elements: data.elements ?? [] };
} catch (error) {
  overpass = { ok: false, elementCount: 0, error: String(error), elements: [] };
}
fs.writeFileSync(path.join(outDir, 'named-objects-overpass.json'), `${JSON.stringify(overpass, null, 2)}\n`);

const indexRaw = JSON.parse(fs.readFileSync(path.join(root, 'data/places/places_index.json'), 'utf8'));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
function norm(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, ' ').trim();
}
const duplicateHits = {};
for (const [id, spec] of Object.entries(candidates)) {
  const terms = [id, ...spec.exactNames, ...spec.queries];
  duplicateHits[id] = places.filter((place) => {
    const hay = `${norm(place.id)} ${norm(place.name)}`;
    return terms.some((term) => {
      const needle = norm(term.replace(/, Oslo, Norway$/i, ''));
      return needle.length >= 5 && (hay === needle || hay.includes(needle) || needle.includes(norm(place.name)));
    });
  }).map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    sourceFile: place.sourceFile
  }));
}
fs.writeFileSync(path.join(outDir, 'duplicate-audit.json'), `${JSON.stringify(duplicateHits, null, 2)}\n`);

const byCandidate = {};
for (const [id, spec] of Object.entries(candidates)) {
  const exactNameSet = new Set(spec.exactNames.map((name) => name.toLocaleLowerCase('nb-NO')));
  const objectMatches = overpass.elements.filter((element) => exactNameSet.has(String(element.tags?.name ?? '').toLocaleLowerCase('nb-NO')));
  byCandidate[id] = {
    rule: spec.rule,
    duplicateHits: duplicateHits[id],
    nominatim: nominatimSummary[id],
    overpassObjectCount: objectMatches.length,
    overpassObjects: objectMatches.map((element) => ({
      type: element.type,
      id: element.id,
      lat: element.lat ?? element.center?.lat,
      lon: element.lon ?? element.center?.lon,
      tags: element.tags
    }))
  };
}

const summary = {
  capturedAt: '2026-07-21',
  sourceScopePr: 3144,
  candidates: Object.keys(candidates),
  duplicateHitsTotal: Object.values(duplicateHits).reduce((sum, rows) => sum + rows.length, 0),
  overpass: { ok: overpass.ok, elementCount: overpass.elementCount, ...(overpass.error ? { error: overpass.error } : {}) },
  byCandidate
};
fs.writeFileSync(path.join(outDir, 'intake-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);

fs.rmSync(fileURLToPath(import.meta.url));
console.log(JSON.stringify({ candidates: Object.keys(candidates).length, duplicateHitsTotal: summary.duplicateHitsTotal, overpass: summary.overpass }, null, 2));
