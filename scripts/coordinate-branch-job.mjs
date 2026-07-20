import fs from 'node:fs';
import path from 'node:path';

const outDir = path.join(process.cwd(), 'reports/sigrid-undset-statue-exact-object-research-20260720');
fs.mkdirSync(outDir, { recursive: true });

const center = { lat: 59.9280, lon: 10.7305 };

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'History-Go-coordinate-research/1.0',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.json();
}

function matchesIdentity(tags = {}) {
  const haystack = [
    tags.name,
    tags['name:no'],
    tags['name:nb'],
    tags.inscription,
    tags.artist_name,
    tags.artist,
    tags.description,
    tags.subject,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return (
    haystack.includes('sigrid') ||
    haystack.includes('undset') ||
    haystack.includes('goksøyr') ||
    haystack.includes('goksoyr')
  );
}

const overpassQuery = `[out:json][timeout:40];\n(\n  nwr(around:700,${center.lat},${center.lon})[\"tourism\"=\"artwork\"];\n  nwr(around:700,${center.lat},${center.lon})[\"historic\"=\"memorial\"];\n  nwr(around:700,${center.lat},${center.lon})[\"memorial\"];\n  nwr(around:700,${center.lat},${center.lon})[\"artwork_type\"];\n);\nout tags center geom;`;
const overpassEndpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let overpassData = null;
let overpassEndpoint = null;
let lastOverpassError = null;
for (const endpoint of overpassEndpoints) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'User-Agent': 'History-Go-coordinate-research/1.0',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams({ data: overpassQuery }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    overpassData = await response.json();
    overpassEndpoint = endpoint;
    break;
  } catch (error) {
    lastOverpassError = String(error);
  }
}
if (!overpassData) throw new Error(`All Overpass endpoints failed: ${lastOverpassError}`);
fs.writeFileSync(
  path.join(outDir, 'overpass-raw.json'),
  `${JSON.stringify({ endpoint: overpassEndpoint, query: overpassQuery, data: overpassData }, null, 2)}\n`,
);

const allOsmObjects = (overpassData.elements || []).map((element) => ({
  osmType: element.type,
  osmId: element.id,
  lat: element.type === 'node' ? element.lat : element.center?.lat ?? null,
  lon: element.type === 'node' ? element.lon : element.center?.lon ?? null,
  tags: element.tags || {},
}));
const identityMatches = allOsmObjects.filter((element) => matchesIdentity(element.tags));

const nominatimQueries = [
  'Sigrid Undset statue Stensparken Oslo',
  'Sigrid Undset skulptur Stensparken Oslo',
  'Kjersti Wexelsen Goksøyr Stensparken Oslo',
];
const nominatim = [];
for (const query of nominatimQueries) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&extratags=1&namedetails=1&limit=20`;
  const data = await fetchJson(url);
  nominatim.push({ query, url, data });
}
fs.writeFileSync(path.join(outDir, 'nominatim.json'), `${JSON.stringify(nominatim, null, 2)}\n`);

const commonsSearchUrl =
  'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=' +
  encodeURIComponent('Sigrid Undset Stensparken') +
  '&gsrnamespace=6&gsrlimit=50&prop=coordinates|imageinfo&iiprop=url|extmetadata&format=json&origin=*';
let commons = null;
try {
  commons = await fetchJson(commonsSearchUrl);
} catch (error) {
  commons = { error: String(error) };
}
fs.writeFileSync(
  path.join(outDir, 'commons-search.json'),
  `${JSON.stringify({ url: commonsSearchUrl, data: commons }, null, 2)}\n`,
);

const commonsPages = Object.values(commons?.query?.pages || {}).map((page) => ({
  pageid: page.pageid,
  title: page.title,
  coordinates: page.coordinates || [],
  imageinfo: page.imageinfo || [],
}));
const geotaggedCommons = commonsPages.filter((page) => page.coordinates.length > 0);

const conclusion = {
  exactOsmIdentityMatchCount: identityMatches.length,
  identityMatches,
  geotaggedCommonsCount: geotaggedCommons.length,
  geotaggedCommons,
  decision:
    identityMatches.length === 1
      ? 'single_named_osm_object_ready_for_manual_crosscheck'
      : identityMatches.length > 1
        ? 'multiple_osm_identity_matches_need_disambiguation'
        : geotaggedCommons.length === 1
          ? 'single_geotagged_commons_candidate_ready_for_manual_crosscheck'
          : 'keep_needs_review',
  reason:
    identityMatches.length === 1
      ? 'Exactly one nearby OSM artwork/memorial object carries Sigrid Undset or artist identity metadata. Cross-check its position against the official Oslo municipality monument identity and visual park context before production.'
      : identityMatches.length > 1
        ? 'More than one nearby OSM object matches the identity terms, so no single object can be selected automatically.'
        : geotaggedCommons.length === 1
          ? 'No exact OSM identity match was found, but one geotagged Commons image candidate exists. Its coordinates require independent cross-check before use.'
          : 'No single machine-traceable exact monument object was found in this pass.',
};

const summary = {
  date: '2026-07-20',
  placeId: 'sigrid_undset_statue',
  officialIdentityCrosscheck: {
    source: 'Oslo kommune – 17. mai-bekransninger',
    finding: 'Sigrid Undsets skulptur is documented in Stensparken.',
    artistHistoryCrosscheck:
      'Oslo byleksikon and Lokalhistoriewiki identify the 1991 sculpture as a work by Kjersti Wexelsen Goksøyr.',
  },
  center,
  overpassEndpoint,
  allOsmObjects,
  identityMatches,
  nominatim,
  geotaggedCommons,
  conclusion,
};
fs.writeFileSync(path.join(outDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Sigrid Undset-statuen — exact object research\n\nDate: 2026-07-20\n\nThis pass searches for an exact machine-traceable monument object inside and around Stensparken. It queries nearby OSM artwork/memorial objects, Nominatim identity searches and geotagged Wikimedia Commons results.\n\nThe identity itself is already resolved by Oslo kommune and local-history sources. No canonical coordinate is changed here. A production candidate is allowed only if one exact point/object can be independently cross-checked as the Sigrid Undset sculpture by Kjersti Wexelsen Goksøyr.\n\nDecision: **${conclusion.decision}**\n\n${conclusion.reason}\n`,
);

console.log(JSON.stringify(summary, null, 2));
