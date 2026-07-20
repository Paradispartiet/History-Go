import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-40';
const PLACE_MANIFEST = 'data/places/manifest.json';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const BBOX = '59.85,10.60,60.02,10.90';

const anchors = [
  { key: 'gaustadalleen', name: 'Gaustadalléen', role: 'shared_west_terminus' },
  { key: 'nybrua', name: 'Nybrua', role: 'shared_central_anchor' },
  { key: 'sinsenkrysset', name: 'Sinsenkrysset', role: 'line_17_branch_anchor' },
  { key: 'storo', name: 'Storo', role: 'line_18_branch_anchor' },
  { key: 'grefsen_stasjon', name: 'Grefsen stasjon', role: 'shared_east_terminus' }
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
      if (place?.id === placeId) {
        hits.push({
          sourceFile: rel,
          name: place.name,
          lat: place.lat,
          lon: place.lon,
          r: place.r,
          coordStatus: place.coordStatus || '',
          coordType: place.coordType || '',
          coordSource: place.coordSource || '',
          sourceObjectId: place.sourceObjectId || '',
          anchors: place.anchors || []
        });
      }
    }
  }
  return hits;
}

function escapeOverpassString(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function overpassForName(name) {
  const escaped = escapeOverpassString(name);
  const query = `[out:json][timeout:60];\n(\n  rel["name"="${escaped}"]["type"="public_transport"]["public_transport"="stop_area"](${BBOX});\n  nwr["name"="${escaped}"]["railway"="tram_stop"](${BBOX});\n  nwr["name"="${escaped}"]["public_transport"="stop_position"](${BBOX});\n  nwr["name"="${escaped}"]["public_transport"="platform"](${BBOX});\n);\nout center tags;`;
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': 'History-Go-coordinate-control/1.0 (repository audit)'
    },
    body: new URLSearchParams({ data: query }).toString()
  });
  if (!response.ok) throw new Error(`Overpass ${response.status} for ${name}`);
  return { query, payload: await response.json() };
}

function coordinateFor(element) {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') return { lat: element.lat, lon: element.lon };
  if (element.center && typeof element.center.lat === 'number' && typeof element.center.lon === 'number') return { lat: element.center.lat, lon: element.center.lon };
  return null;
}

const researched = [];
for (const anchor of anchors) {
  const { query, payload } = await overpassForName(anchor.name);
  writeJson(`${REPORT_DIR}/overpass-results/${anchor.key}.json`, { name: anchor.name, role: anchor.role, query, payload });
  const candidates = (payload.elements || []).map((element) => ({
    osm_type: element.type,
    osm_id: element.id,
    sourceObjectId: `osm-${element.type}:${element.id}`,
    coordinate: coordinateFor(element),
    tags: element.tags || {},
    memberCount: Array.isArray(element.members) ? element.members.length : 0
  }));
  const preferredStopAreas = candidates.filter((candidate) => candidate.osm_type === 'relation' && candidate.tags.type === 'public_transport' && candidate.tags.public_transport === 'stop_area');
  const tramStops = candidates.filter((candidate) => candidate.tags.railway === 'tram_stop');
  const stopPositions = candidates.filter((candidate) => candidate.tags.public_transport === 'stop_position');
  researched.push({
    ...anchor,
    candidates,
    preferredStopAreas,
    tramStops,
    stopPositions,
    decisionHint: preferredStopAreas.length === 1
      ? 'unique_stop_area_relation'
      : preferredStopAreas.length > 1
        ? 'multiple_stop_area_relations'
        : tramStops.length === 1
          ? 'unique_tram_stop_object'
          : stopPositions.length === 1
            ? 'unique_stop_position_object'
            : 'needs_manual_candidate_review'
  });
}

writeJson(`${REPORT_DIR}/research-summary.json`, {
  date: '2026-07-20',
  method: 'Current Ruter route definition is authoritative. Exact-name OSM public-transport objects are collected via Overpass; stop_area relation is preferred, then a unique tram_stop/stop_position object. No nearest or first result is selected.',
  activeSource: activeSource('trikk_17_18'),
  officialRouteDefinition: {
    sourceProvider: 'official_map',
    sourceName: 'Ruter tram timetable effective 20 April 2026',
    sourceUrl: 'https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/trikk',
    sourceObjectId: 'ruter:tram-lines:17+18:2026-04-20',
    line17: 'Gaustadalléen – Sinsen – Grefsen stasjon',
    line18: 'Gaustadalléen – Storo – Grefsen stasjon',
    modellingNote: 'Combined record is a branched route pair. Required anchors: shared west terminus, shared central anchor before/at route split, line-17 branch anchor, line-18 branch anchor, shared Grefsen terminus.'
  },
  anchorResearch: researched
});

fs.mkdirSync(abs(REPORT_DIR), { recursive: true });
fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 40 research\n\nDato: 2026-07-20\n\nRuters gjeldende rutetabell fra 20. april 2026 dokumenterer linje 17 som Gaustadalléen–Sinsen–Grefsen stasjon og linje 18 som Gaustadalléen–Storo–Grefsen stasjon. Combined-recorden vurderes som et forgrenet rutepar, ikke ett symbolsk midtpunkt.\n\nAndre research-pass bruker eksakte navn mot OSM/Overpass og foretrekker ett entydig public_transport=stop_area-objekt. Hvis det ikke finnes, kan bare ett entydig tram_stop- eller stop_position-objekt brukes. Ingen nærmeste- eller første-treff-gjetting er tillatt.\n`);

console.log(JSON.stringify({
  ok: true,
  anchorResearch: researched.map(({ key, name, role, decisionHint, preferredStopAreas, tramStops, stopPositions }) => ({
    key,
    name,
    role,
    decisionHint,
    preferredStopAreas,
    tramStops,
    stopPositions
  }))
}, null, 2));
