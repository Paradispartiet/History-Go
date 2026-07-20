import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-39';
const PLACE_MANIFEST = 'data/places/manifest.json';
const GRENSEN_WAYS = [67882889, 179095459, 696754516];
const RING3_QUERIES = [
  'Granfosstunnelen Oslo',
  'Smestadkrysset Oslo',
  'Ullevålskrysset Oslo',
  'Storokrysset Oslo',
  'Sinsenkrysset Oslo',
  'Ryen Ring 3 Oslo'
];

function abs(rel) { return path.join(ROOT, rel); }
function readJson(rel) { return JSON.parse(fs.readFileSync(abs(rel), 'utf8')); }
function writeJson(rel, data) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), JSON.stringify(data, null, 2) + '\n');
}
function rowsFrom(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.places)) return data.places;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function activeSource(placeId) {
  const hits = [];
  for (const entry of readJson(PLACE_MANIFEST).files || []) {
    const rel = `data/${entry}`;
    if (!fs.existsSync(abs(rel))) continue;
    for (const place of rowsFrom(readJson(rel))) {
      if (place?.id === placeId) hits.push({
        sourceFile: rel, name: place.name, lat: place.lat, lon: place.lon, r: place.r,
        coordStatus: place.coordStatus || '', coordType: place.coordType || '', coordSource: place.coordSource || '',
        sourceObjectId: place.sourceObjectId || '', locatorType: place.locatorType || '', anchors: place.anchors || [], geometry: place.geometry || null
      });
    }
  }
  return hits;
}
function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
function resultName(result) {
  return result?.namedetails?.name || result?.name || String(result?.display_name || '').split(',')[0].trim();
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers: { 'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)', ...headers } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return await response.json();
}

async function fetchOsmWayFull(id) {
  return await fetchJson(`https://api.openstreetmap.org/api/0.6/way/${id}/full.json`);
}

function extractWayGeometry(payload, wayId) {
  const nodes = new Map(payload.elements.filter((e) => e.type === 'node').map((e) => [e.id, { id: e.id, lat: e.lat, lon: e.lon }]));
  const way = payload.elements.find((e) => e.type === 'way' && e.id === wayId);
  if (!way) throw new Error(`OSM way ${wayId} missing from full response`);
  return {
    id: wayId,
    tags: way.tags || {},
    nodeIds: way.nodes,
    coordinates: way.nodes.map((id) => nodes.get(id)).filter(Boolean)
  };
}

function reverseSegment(segment) {
  return { ...segment, nodeIds: [...segment.nodeIds].reverse(), coordinates: [...segment.coordinates].reverse() };
}

function stitchSegments(input) {
  const segments = input.map((s) => ({ ...s, nodeIds: [...s.nodeIds], coordinates: [...s.coordinates] }));
  if (!segments.length) return { orderedSegments: [], coordinates: [], fullyConnected: false };
  const ordered = [segments.shift()];
  while (segments.length) {
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const firstStart = first.nodeIds[0];
    const firstEnd = first.nodeIds[first.nodeIds.length - 1];
    const lastStart = last.nodeIds[0];
    const lastEnd = last.nodeIds[last.nodeIds.length - 1];
    let matched = false;
    for (let i = 0; i < segments.length; i += 1) {
      const seg = segments[i];
      const start = seg.nodeIds[0];
      const end = seg.nodeIds[seg.nodeIds.length - 1];
      if (start === lastEnd) { ordered.push(seg); segments.splice(i, 1); matched = true; break; }
      if (end === lastEnd) { ordered.push(reverseSegment(seg)); segments.splice(i, 1); matched = true; break; }
      if (end === firstStart) { ordered.unshift(seg); segments.splice(i, 1); matched = true; break; }
      if (start === firstStart) { ordered.unshift(reverseSegment(seg)); segments.splice(i, 1); matched = true; break; }
      if (start === firstEnd && ordered.length === 1) { ordered.push(seg); segments.splice(i, 1); matched = true; break; }
      if (end === lastStart && ordered.length === 1) { ordered.unshift(seg); segments.splice(i, 1); matched = true; break; }
    }
    if (!matched) break;
  }
  const coordinates = [];
  for (const segment of ordered) {
    for (const point of segment.coordinates) {
      const prev = coordinates[coordinates.length - 1];
      if (!prev || prev.id !== point.id) coordinates.push(point);
    }
  }
  return { orderedSegments: ordered.map((s) => s.id), coordinates, fullyConnected: segments.length === 0, unstitchedSegments: segments.map((s) => s.id) };
}

function haversine(a, b) {
  const R = 6371000;
  const toRad = (v) => v * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function pathMidpoint(points) {
  if (!points.length) return null;
  if (points.length === 1) return { lat: points[0].lat, lon: points[0].lon };
  const lengths = [];
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const d = haversine(points[i - 1], points[i]);
    lengths.push(d); total += d;
  }
  let target = total / 2;
  for (let i = 1; i < points.length; i += 1) {
    const d = lengths[i - 1];
    if (target <= d) {
      const t = d ? target / d : 0;
      return { lat: points[i - 1].lat + (points[i].lat - points[i - 1].lat) * t, lon: points[i - 1].lon + (points[i].lon - points[i - 1].lon) * t };
    }
    target -= d;
  }
  const last = points[points.length - 1];
  return { lat: last.lat, lon: last.lon };
}

async function nominatim(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '12');
  url.searchParams.set('countrycodes', 'no');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('extratags', '1');
  return await fetchJson(url.toString(), { 'Accept-Language': 'nb,en;q=0.8' });
}

async function main() {
  const grensenSegments = [];
  for (const id of GRENSEN_WAYS) {
    const payload = await fetchOsmWayFull(id);
    writeJson(`${REPORT_DIR}/osm-raw/grensen-way-${id}-full.json`, payload);
    grensenSegments.push(extractWayGeometry(payload, id));
    await delay(500);
  }
  const stitched = stitchSegments(grensenSegments);
  const grensen = {
    wayIds: GRENSEN_WAYS,
    segments: grensenSegments,
    stitched,
    midpoint: pathMidpoint(stitched.coordinates),
    endpoints: stitched.coordinates.length ? [stitched.coordinates[0], stitched.coordinates[stitched.coordinates.length - 1]] : []
  };

  const ring3 = [];
  for (const query of RING3_QUERIES) {
    const results = await nominatim(query);
    writeJson(`${REPORT_DIR}/nominatim-results/ring3-${normalize(query).replace(/ /g, '-')}.json`, { query, results });
    ring3.push({
      query,
      candidates: results.map((result) => ({
        name: resultName(result), osm_type: result.osm_type, osm_id: result.osm_id,
        lat: result.lat, lon: result.lon, category: result.category, type: result.type,
        display_name: result.display_name, address: result.address, extratags: result.extratags || {}
      }))
    });
    await delay(1100);
  }

  writeJson(`${REPORT_DIR}/research-summary.json`, {
    date: '2026-07-20',
    method: 'Research only. Grensen way geometry is fetched and stitched deterministically; Ring 3 anchor candidates are collected without applying first/nearest results.',
    activeSources: {
      grensen_kjopesenter: activeSource('grensen_kjopesenter'),
      ring_3: activeSource('ring_3')
    },
    grensen,
    ring3,
    sourceNotes: {
      grensen: 'Oslo byleksikon defines Grensen from Møllergata at Stortorvet to Professor Aschehougs plass. The three exact named OSM street ways are evaluated as one linear object.',
      ring3: 'Statens vegvesen documents Ring 3 as rv. 150 on multiple Oslo sections and explicitly refers to the Ryen–Granfosstunnelen corridor. Multiple route anchors are required; one midpoint is insufficient.'
    }
  });

  fs.mkdirSync(abs(REPORT_DIR), { recursive: true });
  fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 39 research\n\nDato: 2026-07-20\n\nResearch-passet bygger lineært grunnlag for \`grensen_kjopesenter\` og \`ring_3\`.\n\n- Grensen: de tre eksakte navngitte OSM-way-segmentene hentes med full nodegeometri og forsøkes sydd sammen deterministisk.\n- Ring 3: flere navngitte kryss/tunnelankre langs rv. 150 samles; ingen første-/nærmeste-treff brukes automatisk.\n\nIngen canonical koordinater endres i research-passet.\n`);
  console.log(JSON.stringify({ ok: true, grensen: { fullyConnected: stitched.fullyConnected, midpoint: grensen.midpoint, endpoints: grensen.endpoints }, ring3Queries: ring3.length }, null, 2));
}

main().catch((error) => { console.error(error); process.exit(1); });
