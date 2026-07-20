import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-40';
const PLACE_MANIFEST = 'data/places/manifest.json';
const ENTUR_GEOCODER = 'https://api.entur.io/geocoder/v1/autocomplete';
const OSLO_LOCALITY = 'KVE:TopographicPlace:0301';

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

function featureCoordinate(feature) {
  const coords = feature?.geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const [lon, lat] = coords;
  return typeof lat === 'number' && typeof lon === 'number' ? { lat, lon } : null;
}

function featureName(feature) {
  return String(feature?.properties?.name || feature?.properties?.label || '').trim();
}

function featureId(feature) {
  return String(feature?.properties?.id || feature?.properties?.gid || '').trim();
}

function categoryValues(feature) {
  const category = feature?.properties?.category;
  if (Array.isArray(category)) return category.map(String);
  if (typeof category === 'string') return [category];
  const categories = feature?.properties?.categories;
  return Array.isArray(categories) ? categories.map(String) : [];
}

async function enturAutocomplete(name) {
  const url = new URL(ENTUR_GEOCODER);
  url.searchParams.set('text', name);
  url.searchParams.set('lang', 'no');
  url.searchParams.set('size', '25');
  url.searchParams.set('layers', 'venue');
  url.searchParams.set('boundary.locality_ids', OSLO_LOCALITY);
  url.searchParams.set('multiModal', 'all');
  const response = await fetch(url, {
    headers: {
      'ET-Client-Name': 'Paradispartiet-History-Go',
      'User-Agent': 'History-Go-coordinate-control/1.0'
    }
  });
  if (!response.ok) throw new Error(`Entur geocoder ${response.status} for ${name}`);
  return { url: url.toString(), payload: await response.json() };
}

const researched = [];
for (const anchor of anchors) {
  const { url, payload } = await enturAutocomplete(anchor.name);
  writeJson(`${REPORT_DIR}/entur-results/${anchor.key}.json`, { name: anchor.name, role: anchor.role, requestUrl: url, payload });
  const candidates = (payload.features || []).map((feature) => ({
    name: featureName(feature),
    id: featureId(feature),
    coordinate: featureCoordinate(feature),
    layer: feature?.properties?.layer || '',
    categories: categoryValues(feature),
    locality: feature?.properties?.locality || '',
    county: feature?.properties?.county || '',
    label: feature?.properties?.label || '',
    source: feature?.properties?.source || '',
    rawProperties: feature?.properties || {}
  }));
  const exactName = candidates.filter((candidate) => candidate.name.toLocaleLowerCase('nb-NO') === anchor.name.toLocaleLowerCase('nb-NO'));
  const tramRelevant = exactName.filter((candidate) => candidate.categories.some((category) => /tram/i.test(category)));
  const nsrCandidates = exactName.filter((candidate) => /^NSR:StopPlace:/i.test(candidate.id) || /NSR:StopPlace:/i.test(candidate.id));
  let decisionHint = 'needs_manual_candidate_review';
  let preferredCandidates = [];
  if (tramRelevant.length === 1) {
    decisionHint = 'unique_exact_tram_stop';
    preferredCandidates = tramRelevant;
  } else if (tramRelevant.length > 1) {
    decisionHint = 'multiple_exact_tram_stops';
    preferredCandidates = tramRelevant;
  } else if (nsrCandidates.length === 1) {
    decisionHint = 'unique_exact_nsr_stop_place';
    preferredCandidates = nsrCandidates;
  } else if (nsrCandidates.length > 1) {
    decisionHint = 'multiple_exact_nsr_stop_places';
    preferredCandidates = nsrCandidates;
  }
  researched.push({ ...anchor, candidates, exactName, tramRelevant, nsrCandidates, preferredCandidates, decisionHint });
}

writeJson(`${REPORT_DIR}/research-summary.json`, {
  date: '2026-07-20',
  method: 'Ruter current timetable defines the route branches. Entur National Stop Register/Geocoder supplies official stop-place anchor candidates. Exact name is required; a unique tram-relevant stop is preferred, otherwise a unique NSR StopPlace. No nearest or first result is selected.',
  activeSource: activeSource('trikk_17_18'),
  officialRouteDefinition: {
    sourceProvider: 'official_map',
    sourceName: 'Ruter tram timetable effective 20 April 2026',
    sourceUrl: 'https://ruter.no/planlegg-reise/rutetabeller-og-linjekart/trikk',
    sourceObjectId: 'ruter:tram-lines:17+18:2026-04-20',
    line17: 'Gaustadalléen – Sinsen – Grefsen stasjon',
    line18: 'Gaustadalléen – Storo – Grefsen stasjon',
    modellingNote: 'Combined record is a branched route pair. Required anchors: shared west terminus, shared central anchor, line-17 branch anchor, line-18 branch anchor, shared Grefsen terminus.'
  },
  stopRegistrySource: {
    sourceProvider: 'official_map',
    sourceName: 'Entur National Stop Register via Geocoder API',
    sourceUrl: 'https://api.entur.io/geocoder/v1/autocomplete',
    sourceObjectId: 'entur:nsr-geocoder',
    note: 'NSR is the national master database for public transport stops; Geocoder venue results expose current stop place IDs and positions.'
  },
  anchorResearch: researched
});

fs.mkdirSync(abs(REPORT_DIR), { recursive: true });
fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo koordinatkontroll – batch 40 research\n\nDato: 2026-07-20\n\nRuters gjeldende rutetabell fra 20. april 2026 dokumenterer linje 17 som Gaustadalléen–Sinsen–Grefsen stasjon og linje 18 som Gaustadalléen–Storo–Grefsen stasjon. Combined-recorden vurderes som et forgrenet rutepar, ikke ett symbolsk midtpunkt.\n\nAnkerresearch bruker Enturs nasjonale stoppregister via Geocoder API. Bare eksakt navnematch vurderes; ett entydig trikkerelevant stopp foretrekkes, ellers ett entydig NSR StopPlace. Ingen nærmeste- eller første-treff-gjetting er tillatt.\n`);

console.log(JSON.stringify({
  ok: true,
  anchorResearch: researched.map(({ key, name, role, decisionHint, preferredCandidates, exactName }) => ({
    key,
    name,
    role,
    decisionHint,
    preferredCandidates,
    exactName
  }))
}, null, 2));
