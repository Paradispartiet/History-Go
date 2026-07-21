import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_FILE = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json';
const INDEX_FILE = 'data/places/places_index.json';
const PROTOCOL_FILE = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-122-lekeplasser-trening-intake';
const EXPECTED_BATCH = 122;
const USER_AGENT = 'History-Go-coordinate-audit/1.0 (Paradispartiet/History-Go)';

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : `${value}\n`);
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function norm(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function haversineMeters(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function canonicalRows(indexRaw) {
  return Array.isArray(indexRaw) ? indexRaw : Array.isArray(indexRaw?.places) ? indexRaw.places : [];
}

function exactRowNames(row) {
  const values = [row.name, String(row.display_name ?? '').split(',')[0], ...Object.values(row.namedetails ?? {})];
  return [...new Set(values.filter((v) => typeof v === 'string').map(norm).filter(Boolean))];
}

function queryVariants(place) {
  const variants = [place.name];
  const stripped = String(place.name)
    .replace(/\s+lekeplass$/i, '')
    .replace(/\s+lekepark$/i, '')
    .replace(/\s+treningspark$/i, '')
    .replace(/\s+aktivitetspark$/i, '')
    .trim();
  if (stripped && norm(stripped) !== norm(place.name)) variants.push(stripped);
  if (place.id === 'korketrekkeren') variants.push('Korketrekkeren Oslo');
  return [...new Set(variants)].map((q) => `${q}, Oslo, Norway`);
}

function semanticFit(place, row) {
  const type = norm(row.type);
  const cls = norm(row.class);
  const leisure = norm(row.extratags?.leisure);
  const sport = norm(row.extratags?.sport);
  const placeType = norm(place.place_type);
  if (placeType.includes('lekeplass') || placeType.includes('lekepark')) {
    return type === 'playground' || leisure === 'playground';
  }
  if (placeType.includes('treningspark') || placeType.includes('fitness')) {
    return ['fitness station', 'fitness_station', 'sports centre', 'sports_centre'].includes(type) ||
      ['fitness station', 'fitness_station', 'sports centre', 'sports_centre'].includes(leisure) ||
      sport.includes('fitness');
  }
  if (placeType.includes('skate')) {
    return type === 'skatepark' || leisure === 'skatepark' || sport === 'skateboard';
  }
  if (placeType.includes('parkour')) {
    return type.includes('parkour') || sport.includes('parkour');
  }
  if (placeType.includes('ake') || placeType.includes('rute') || placeType.includes('trail')) {
    return ['way', 'relation'].includes(row.osm_type);
  }
  return ['playground', 'fitness station', 'fitness_station', 'sports centre', 'sports_centre', 'skatepark', 'pitch', 'track'].includes(type) ||
    cls === 'leisure' || cls === 'sport';
}

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '20');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('extratags', '1');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('countrycodes', 'no');
  url.searchParams.set('bounded', '1');
  url.searchParams.set('viewbox', '10.45,60.05,10.95,59.80');
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'nb,no,en'
    }
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Nominatim ${response.status} for ${query}: ${text.slice(0, 500)}`);
  return { query, url: url.toString(), rows: JSON.parse(text) };
}

const source = readJson(SOURCE_FILE);
if (!Array.isArray(source)) throw new Error(`${SOURCE_FILE} must be an array`);
const index = canonicalRows(readJson(INDEX_FILE));
const protocol = fs.readFileSync(abs(PROTOCOL_FILE), 'utf8');
const protocolLines = protocol.split('\n');
const osloIndex = protocolLines.findIndex((line) => line === '## Oslo');
const osloEnd = protocolLines.findIndex((line, i) => i > osloIndex && line.startsWith('## Vestland'));
if (osloIndex < 0 || osloEnd < 0) throw new Error('Could not resolve Oslo protocol scope');
const nextWorkLine = protocolLines.find((line, i) => i > osloIndex && i < osloEnd && line.startsWith('- Neste nye Oslo-kontroll er batch '));
const nextBatch = Number(nextWorkLine?.match(/batch (\d+)/)?.[1]);
if (nextBatch !== EXPECTED_BATCH) throw new Error(`Expected live batch ${EXPECTED_BATCH}, got ${nextBatch}`);

const controlledIds = new Set();
for (const line of protocolLines.slice(osloIndex, osloEnd)) {
  const numeric = line.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|/);
  if (numeric) controlledIds.add(numeric[1]);
  if (line.startsWith('| ') && line.includes('| needs_review |')) {
    const match = line.match(/`([^`]+)`/);
    if (match) controlledIds.add(match[1]);
  }
}

const sourceIds = new Set(source.map((p) => p.id));
const pending = source.filter((place) => !controlledIds.has(place.id));
const alreadyControlled = source.filter((place) => controlledIds.has(place.id));
const inventory = [];

for (let indexNo = 0; indexNo < pending.length; indexNo += 1) {
  const place = pending[indexNo];
  const point = { lat: Number(place.lat), lon: Number(place.lon) };
  const variants = queryVariants(place);
  const attempts = [];
  const unique = new Map();
  for (const query of variants) {
    const attempt = await nominatimSearch(query);
    attempts.push(attempt);
    for (const row of attempt.rows) {
      unique.set(`${row.osm_type}:${row.osm_id}`, row);
    }
    await sleep(1100);
  }
  const rows = [...unique.values()];
  const wantedNames = new Set(variants.flatMap((q) => {
    const base = q.replace(/, Oslo, Norway$/i, '');
    return [norm(base), norm(place.name)];
  }));
  const exactNamed = rows.filter((row) => exactRowNames(row).some((name) => wantedNames.has(name)));
  const semanticExact = exactNamed.filter((row) => semanticFit(place, row));

  const nearest = index
    .filter((candidate) => candidate.id !== place.id)
    .filter((candidate) => Number.isFinite(Number(candidate.lat)) && Number.isFinite(Number(candidate.lon)))
    .map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      category: candidate.category,
      distanceM: Math.round(haversineMeters(point, { lat: Number(candidate.lat), lon: Number(candidate.lon) }) * 10) / 10,
      sourceFile: candidate.sourceFile ?? null
    }))
    .filter((candidate) => candidate.distanceM <= 300)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, 15);

  const baseName = norm(place.name)
    .replace(/\b(lekeplass|lekepark|treningspark|aktivitetspark)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const parentNameMatches = index
    .filter((candidate) => candidate.id !== place.id)
    .filter((candidate) => {
      const n = norm(candidate.name);
      return baseName.length >= 4 && (n === baseName || n.includes(baseName) || baseName.includes(n));
    })
    .map((candidate) => ({ id: candidate.id, name: candidate.name, category: candidate.category, sourceFile: candidate.sourceFile ?? null }));

  let candidateStatus = 'needs_manual_identity_review';
  if (semanticExact.length === 1) candidateStatus = 'unique_exact_semantic_candidate';
  else if (semanticExact.length > 1) candidateStatus = 'ambiguous_exact_semantic_candidates';
  else if (exactNamed.length > 0) candidateStatus = 'exact_name_wrong_or_unclear_type';
  else candidateStatus = 'no_exact_semantic_candidate';

  const result = {
    sourceOrder: source.findIndex((p) => p.id === place.id) + 1,
    id: place.id,
    name: place.name,
    placeType: place.place_type ?? null,
    currentCoordinate: point,
    currentRadius: place.r ?? null,
    candidateStatus,
    queryVariants: variants,
    exactNamedCandidates: exactNamed.map((row) => ({
      sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
      osmType: row.osm_type,
      osmId: row.osm_id,
      class: row.class,
      type: row.type,
      displayName: row.display_name,
      lat: Number(row.lat),
      lon: Number(row.lon),
      geojsonType: row.geojson?.type ?? null,
      semanticFit: semanticFit(place, row)
    })),
    nearestCanonicalPlaces: nearest,
    parentNameMatches,
    overlapFlag: nearest.some((candidate) => candidate.distanceM <= 150) || parentNameMatches.length > 0,
    attempts
  };
  inventory.push(result);
  writeJson(`${REPORT_DIR}/candidates/${place.id}.json`, result);
}

const groups = {};
for (const item of inventory) {
  const key = item.placeType ?? 'unknown';
  (groups[key] ??= []).push(item.id);
}

const summary = {
  version: '2026-07-21',
  batch: EXPECTED_BATCH,
  sourceFile: SOURCE_FILE,
  sourceRecordCount: source.length,
  alreadyControlledCount: alreadyControlled.length,
  pendingCount: pending.length,
  alreadyControlled: alreadyControlled.map((p) => ({ id: p.id, name: p.name })),
  groups,
  resultCounts: inventory.reduce((acc, item) => {
    acc[item.candidateStatus] = (acc[item.candidateStatus] ?? 0) + 1;
    return acc;
  }, {}),
  uniqueExactSemanticCandidates: inventory.filter((item) => item.candidateStatus === 'unique_exact_semantic_candidate').map((item) => item.id),
  overlapReviewRequired: inventory.filter((item) => item.overlapFlag).map((item) => item.id),
  noExactCandidate: inventory.filter((item) => item.candidateStatus === 'no_exact_semantic_candidate').map((item) => item.id),
  inventory: inventory.map(({ attempts, ...item }) => item),
  nextAction: 'Resolve parent/subfeature overlap and physical identity per object type before any canonical coordinate updates. This intake intentionally changes no place or evidence data.'
};
writeJson(`${REPORT_DIR}/summary.json`, summary);

const lines = [
  '# Oslo coordinate batch 122 — lekeplasser/trening intake',
  '',
  `Source: \`${SOURCE_FILE}\``,
  `Records: ${source.length}; already controlled: ${alreadyControlled.length}; pending: ${pending.length}.`,
  '',
  'This is an intake-only pass. No canonical place or coordinate records are changed.',
  '',
  '## Groups',
  ''
];
for (const [type, ids] of Object.entries(groups)) lines.push(`- ${type}: ${ids.length} — ${ids.map((id) => `\`${id}\``).join(', ')}`);
lines.push('', '## Candidate-status counts', '');
for (const [status, count] of Object.entries(summary.resultCounts)) lines.push(`- ${status}: ${count}`);
lines.push('', 'Parent/subfeature overlap must be resolved explicitly before production; an exact playground object may still be intentionally represented by an existing parent park if the source record lacks a stable independent identity.');
writeText(`${REPORT_DIR}/README.md`, lines.join('\n'));

console.log(JSON.stringify({
  ok: true,
  batch: EXPECTED_BATCH,
  sourceRecords: source.length,
  alreadyControlled: alreadyControlled.length,
  pending: pending.length,
  groups: Object.fromEntries(Object.entries(groups).map(([key, ids]) => [key, ids.length])),
  resultCounts: summary.resultCounts,
  overlapReviewRequired: summary.overlapReviewRequired.length
}, null, 2));
