import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORT_DIR = 'reports/oslo-attractions-completeness-20260720/vikaterrassen';
const USER_AGENT = 'History-Go coordinate audit/1.0 (Paradispartiet/History-Go)';

const abs = (rel) => path.join(ROOT, rel);
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const writeText = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), value.endsWith('\n') ? value : `${value}\n`);
};

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '20');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  url.searchParams.set('countrycodes', 'no');

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'nb,no,en'
    }
  });
  if (!response.ok) {
    throw new Error(`Nominatim ${response.status} for ${query}: ${await response.text()}`);
  }
  return { query, url: url.toString(), results: await response.json() };
}

const searches = [];
for (const query of [
  'Vikaterrassen, Oslo',
  'Vikaterrassen, Ruseløkkveien, Oslo',
  'Ruseløkkveien 3-5, Oslo'
]) {
  searches.push(await nominatimSearch(query));
  await new Promise((resolve) => setTimeout(resolve, 1100));
}

writeJson(`${REPORT_DIR}/nominatim-searches.json`, searches);

const candidates = searches.flatMap((search, searchIndex) =>
  search.results.map((result) => ({ ...result, auditQuery: search.query, auditSearchIndex: searchIndex }))
);

const normalized = (value) => String(value ?? '').trim().toLocaleLowerCase('nb-NO');
const exactNamed = candidates.filter((candidate) => {
  const names = [
    candidate.name,
    candidate.namedetails?.name,
    candidate.namedetails?.['name:nb'],
    candidate.namedetails?.['name:no']
  ].map(normalized);
  return names.includes('vikaterrassen');
});

const physicalCandidates = exactNamed.filter((candidate) =>
  ['way', 'relation'].includes(candidate.osm_type) ||
  ['pedestrian', 'retail', 'commercial', 'mall'].includes(candidate.type)
);

const deduped = [];
const seen = new Set();
for (const candidate of physicalCandidates) {
  const key = `${candidate.osm_type}:${candidate.osm_id}`;
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(candidate);
}

let status = 'needs_review';
let selectedCandidate = null;
let reason = 'No single exact named physical OSM object for Vikaterrassen was resolved.';

if (deduped.length === 1) {
  status = 'verified_object_candidate';
  selectedCandidate = deduped[0];
  reason = 'One exact named physical OSM object for Vikaterrassen was resolved across the object-first searches.';
} else if (deduped.length > 1) {
  reason = `Multiple exact named physical OSM objects remain plausible (${deduped.map((c) => `${c.osm_type}:${c.osm_id}`).join(', ')}).`;
}

const decision = {
  version: '2026-07-20',
  candidateId: 'vikaterrassen',
  candidateName: 'Vikaterrassen',
  status,
  reason,
  duplicateGate: {
    activeCanonicalSearch: 'No active canonical Vikaterrassen place found before intake.',
    nameDistinction: 'Vikaterrassen is the 1960s commercial/pedestrian complex below Victoria terrasse, not the 1890 Victoria terrasse residential/office complex.'
  },
  objectTypeDecision: 'pedestrian_street_and_commercial_complex',
  addressContext: 'Ruseløkkveien 3–5, 0251 Oslo',
  addressUseDecision: 'Do not use a single Geonorge address point as the canonical marker unless no real object geometry can be verified. The place is a pedestrian urban space/commercial complex spanning more than one address.',
  selectedCandidate,
  exactNamedCandidates: deduped,
  sourceFacts: [
    'Vikaterrassen describes itself as a pedestrian street/urban space with shops, restaurants, services and culture at Ruseløkkveien 3–5.',
    'The current Vikaterrassen identity emerged from the 1960s redevelopment below Victoria terrasse and the area was later rebuilt as a car-free pedestrian space.',
    'VisitOSLO currently lists Vikaterrassen as a pedestrian shopping and cultural area in Vika.'
  ],
  nextAction: status === 'verified_object_candidate'
    ? 'Visually and semantically audit the selected OSM geometry against the official Vikaterrassen footprint before canonical production.'
    : 'Keep the candidate out of canonical production until one physical object/geometry can be resolved without guessing.'
};
writeJson(`${REPORT_DIR}/decision.json`, decision);

writeText(`${REPORT_DIR}/README.md`, `# Vikaterrassen — object-first coordinate intake

Date: 2026-07-20

- Candidate: \`vikaterrassen\`
- Result: **${status}**
- Identity: the Vikaterrassen pedestrian/commercial complex at Ruseløkkveien 3–5, explicitly distinct from Victoria terrasse
- Method: object-first Nominatim/OSM lookup with geometry, because the canonical object is a pedestrian urban space spanning multiple addresses and should not be anchored blindly to one building address point

${reason}

No canonical place or coordinate is created by this intake. A production batch may proceed only if one selected object can be confirmed to represent the actual Vikaterrassen footprint/axis.
`);

console.log(JSON.stringify({
  ok: true,
  candidateId: 'vikaterrassen',
  status,
  selected: selectedCandidate ? {
    osmType: selectedCandidate.osm_type,
    osmId: selectedCandidate.osm_id,
    type: selectedCandidate.type,
    displayName: selectedCandidate.display_name,
    lat: selectedCandidate.lat,
    lon: selectedCandidate.lon,
    geojsonType: selectedCandidate.geojson?.type ?? null
  } : null,
  exactPhysicalCandidateCount: deduped.length
}, null, 2));
