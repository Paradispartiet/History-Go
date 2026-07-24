import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-frognerstranda-multi-anchor-chain-post-194');
const responseDir = join(reportDir, 'responses');
const placePath = join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json');
const evidencePath = join(root, 'data/coordinate-evidence/oslo/popkultur/frognerstranda.json');
const protocolPath = join(root, 'docs/coordinates/coordinate-control-protocol.md');
const officialUrl = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/';
const byleksikonUrl = 'https://oslobyleksikon.no/side/Frognerstranda';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function normalizeText(value) {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&aring;|&#229;/gi, 'å')
    .replace(/&oslash;|&#248;/gi, 'ø')
    .replace(/&aelig;|&#230;/gi, 'æ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchBuffer(url, options = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    ...options,
    headers: {
      'user-agent': 'History-Go coordinate control/1.0 (Paradispartiet/History-Go)',
      accept: '*/*',
      ...(options.headers ?? {})
    }
  });
  const buffer = Buffer.from(await response.arrayBuffer());
  assert(response.ok, `Fetch failed ${response.status}: ${url}`);
  return {
    requestedUrl: url,
    finalUrl: response.url,
    status: response.status,
    contentType: response.headers.get('content-type') ?? '',
    buffer,
    sha256: sha256(buffer)
  };
}

async function fetchJson(url, options = {}) {
  const result = await fetchBuffer(url, options);
  const text = result.buffer.toString('utf8');
  return { ...result, text, json: JSON.parse(text) };
}

function haversineMeters(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const earth = 6371008.8;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earth * Math.asin(Math.min(1, Math.sqrt(h)));
}

function summarizeFullWay(payload, expectedId) {
  const nodes = new Map(payload.elements.filter((element) => element.type === 'node').map((node) => [node.id, node]));
  const way = payload.elements.find((element) => element.type === 'way' && element.id === expectedId);
  assert(way, `OSM way ${expectedId} missing from full response.`);
  const geometry = way.nodes.map((nodeId) => {
    const node = nodes.get(nodeId);
    assert(node, `OSM way ${expectedId} node ${nodeId} missing.`);
    return { nodeId, lat: node.lat, lon: node.lon };
  });
  let lengthMeters = 0;
  for (let index = 1; index < geometry.length; index += 1) {
    lengthMeters += haversineMeters(geometry[index - 1], geometry[index]);
  }
  const half = lengthMeters / 2;
  let walked = 0;
  let midpoint = geometry[0];
  for (let index = 1; index < geometry.length; index += 1) {
    const segment = haversineMeters(geometry[index - 1], geometry[index]);
    if (walked + segment >= half) {
      const ratio = segment === 0 ? 0 : (half - walked) / segment;
      midpoint = {
        lat: geometry[index - 1].lat + (geometry[index].lat - geometry[index - 1].lat) * ratio,
        lon: geometry[index - 1].lon + (geometry[index].lon - geometry[index - 1].lon) * ratio
      };
      break;
    }
    walked += segment;
  }
  return {
    osmObjectId: `osm-way:${expectedId}`,
    id: expectedId,
    tags: way.tags ?? {},
    version: way.version,
    timestamp: way.timestamp,
    nodeCount: geometry.length,
    lengthMeters: Number(lengthMeters.toFixed(2)),
    firstNode: geometry[0],
    lastNode: geometry.at(-1),
    midpoint,
    geometry
  };
}

function centerOfElement(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon };
  if (element.center && Number.isFinite(element.center.lat) && Number.isFinite(element.center.lon)) return { lat: element.center.lat, lon: element.center.lon };
  if (Array.isArray(element.geometry) && element.geometry.length > 0) {
    const valid = element.geometry.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon));
    if (valid.length > 0) {
      return {
        lat: valid.reduce((sum, point) => sum + point.lat, 0) / valid.length,
        lon: valid.reduce((sum, point) => sum + point.lon, 0) / valid.length
      };
    }
  }
  return null;
}

function normalizedName(value) {
  return String(value ?? '').toLocaleLowerCase('nb-NO').replace(/[^a-z0-9æøå]+/g, ' ').trim();
}

function eastCandidateScore(candidate) {
  const name = normalizedName(candidate.tags?.name ?? candidate.name);
  const tags = candidate.tags ?? {};
  let score = 0;
  if (['hjortneskaia', 'hjortneskaiene', 'framnesbrygga', 'framnes brygge'].includes(name)) score += 10;
  else if (name.includes('hjortnes') || name.includes('framnes')) score += 4;
  if (tags.man_made === 'pier') score += 7;
  if (['footway', 'cycleway', 'path', 'pedestrian'].includes(tags.highway)) score += 5;
  if (tags.place) score += 3;
  if (tags.amenity === 'ferry_terminal' || tags.public_transport === 'platform') score += 2;
  if (tags.highway === 'bus_stop') score -= 20;
  if (candidate.center?.lon >= 10.7055 && candidate.center?.lon <= 10.7135) score += 2;
  if (candidate.center?.lat >= 59.907 && candidate.center?.lat <= 59.913) score += 1;
  return score;
}

await mkdir(responseDir, { recursive: true });

const protocol = await readFile(protocolPath, 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(batches.length > 0, 'Coordinate protocol has no batch rows.');
assert(Math.max(...batches) === 194, `Expected protocol max batch 194, got ${Math.max(...batches)}.`);

const place = JSON.parse(await readFile(placePath, 'utf8'));
const evidence = JSON.parse(await readFile(evidencePath, 'utf8'));
assert(place.id === 'frognerstranda', 'Unexpected canonical place.');
assert(place.name === 'Frognerstranda', 'Canonical name changed.');
assert(place.coordStatus === 'needs_source' && place.coordType === 'legacy_unverified', 'Canonical coordinate is no longer unresolved.');
assert(place.lat === 59.9129 && place.lon === 10.7098 && place.r === 180, 'Legacy Frognerstranda marker changed.');
assert(place.popupDesc.includes('langstrakt fjordkant'), 'Canonical full-waterfront identity changed.');
assert(evidence.placeId === 'frognerstranda' && evidence.evidenceStatus === 'needs_research', 'Unexpected evidence state.');
assert(evidence.coordinateDecision === 'needs_geometry', 'Unexpected evidence coordinate decision.');

const official = await fetchBuffer(officialUrl);
const officialHtml = official.buffer.toString('utf8');
const officialText = normalizeText(officialHtml);
assert(officialText.includes('Den strekker seg fra den innerste delen av Frognerkilen og Bygdøy i vest, til Hjortnes/Framnes i øst.'), 'Official west/east scope wording changed.');
assert(officialText.includes('Frognerstranda er en strandlinje'), 'Official shoreline identity missing.');
assert(officialText.includes('havnepromenaden') && officialText.includes('hovedsykkelveien'), 'Official promenade/cycle scope missing.');
await writeFile(join(responseDir, 'official-frognerstranda.html'), official.buffer);

const byleksikon = await fetchBuffer(byleksikonUrl);
const byleksikonHtml = byleksikon.buffer.toString('utf8');
const byleksikonText = normalizeText(byleksikonHtml);
assert(byleksikonText.includes('fra Filipstad til Sjølystveien'), 'Oslo byleksikon route extent changed.');
assert(byleksikonText.includes('Ytre del av veien er anlagt som strandpromenade'), 'Oslo byleksikon promenade identity missing.');
assert(byleksikonText.includes('Framnesbrygga'), 'Oslo byleksikon east crossing anchor missing.');
await writeFile(join(responseDir, 'oslo-byleksikon-frognerstranda.html'), byleksikon.buffer);

const frognerWayFetch = await fetchJson('https://api.openstreetmap.org/api/0.6/way/71423688/full.json');
const frognerWay = summarizeFullWay(frognerWayFetch.json, 71423688);
assert(frognerWay.tags.name === 'Frognerstranda' && frognerWay.tags.highway === 'footway', 'Exact named Frognerstranda footway changed.');
await writeFile(join(responseDir, 'osm-way-71423688-full.json'), `${JSON.stringify(frognerWayFetch.json, null, 2)}\n`, 'utf8');

const tourWayFetch = await fetchJson('https://api.openstreetmap.org/api/0.6/way/118364891/full.json');
const tourWay = summarizeFullWay(tourWayFetch.json, 118364891);
assert(tourWay.tags.name === 'Tour de Finance' && tourWay.tags.highway === 'cycleway', 'Tour de Finance corridor changed.');
assert(tourWay.geometry.some((point) => point.nodeId === 849847795), 'Tour de Finance no longer intersects the exact Frognerstranda footway at the pinned west-side node.');
await writeFile(join(responseDir, 'osm-way-118364891-full.json'), `${JSON.stringify(tourWayFetch.json, null, 2)}\n`, 'utf8');

const overpassQuery = `[out:json][timeout:90];\n(\n  nwr["name"~"Frognerstranda|Tour de Finance|Hjortnes|Hjortneskai|Hjortneskaia|Hjortneskaiene|Framnes|Framnesbrygga|Framnes brygge|Strandpromenaden",i](59.9060,10.6870,59.9195,10.7145);\n  way["highway"~"footway|cycleway|path|pedestrian"](59.9060,10.7020,59.9135,10.7145);\n  nwr["man_made"="pier"](59.9060,10.7020,59.9135,10.7145);\n  nwr["amenity"="ferry_terminal"](59.9060,10.7020,59.9135,10.7145);\n);\nout tags center geom;`;
const overpass = await fetchJson('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: new URLSearchParams({ data: overpassQuery }).toString()
});
await writeFile(join(responseDir, 'overpass-anchor-search.json'), `${JSON.stringify(overpass.json, null, 2)}\n`, 'utf8');

const nominatimQueries = [
  'Frognerkilen, Oslo, Norway',
  'Hjortneskaia, Oslo, Norway',
  'Hjortneskaiene, Oslo, Norway',
  'Framnesbrygga, Oslo, Norway',
  'Framnes, Oslo, Norway',
  'Hjortnes, Oslo, Norway',
  'Sjølystveien, Oslo, Norway',
  'Filipstad, Oslo, Norway'
];
const nominatimRows = [];
for (const query of nominatimQueries) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '10');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  const response = await fetchJson(url.toString(), { headers: { 'accept-language': 'nb,en;q=0.8' } });
  nominatimRows.push({ query, status: response.status, finalUrl: response.finalUrl, results: response.json });
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
await writeFile(join(responseDir, 'nominatim-anchor-searches.json'), `${JSON.stringify(nominatimRows, null, 2)}\n`, 'utf8');

const overpassCandidates = overpass.json.elements.map((element) => ({
  source: 'overpass',
  osmType: element.type,
  osmId: element.id,
  sourceObjectId: `osm-${element.type}:${element.id}`,
  name: element.tags?.name ?? null,
  tags: element.tags ?? {},
  center: centerOfElement(element),
  geometry: element.geometry ?? null
})).filter((candidate) => candidate.center);

const nominatimCandidates = nominatimRows.flatMap((row) => row.results.map((result) => ({
  source: 'nominatim',
  query: row.query,
  osmType: result.osm_type,
  osmId: result.osm_id,
  sourceObjectId: result.osm_type && result.osm_id ? `osm-${result.osm_type}:${result.osm_id}` : null,
  name: result.namedetails?.name ?? result.name ?? null,
  displayName: result.display_name,
  category: result.category,
  type: result.type,
  tags: {
    name: result.namedetails?.name ?? result.name ?? null,
    place: result.category === 'place' ? result.type : undefined,
    highway: result.category === 'highway' ? result.type : undefined,
    man_made: result.category === 'man_made' ? result.type : undefined,
    amenity: result.category === 'amenity' ? result.type : undefined
  },
  center: { lat: Number(result.lat), lon: Number(result.lon) },
  geojson: result.geojson ?? null
})).filter((candidate) => Number.isFinite(candidate.center.lat) && Number.isFinite(candidate.center.lon));

const deduped = new Map();
for (const candidate of [...overpassCandidates, ...nominatimCandidates]) {
  const key = candidate.sourceObjectId ?? `${candidate.source}:${candidate.query}:${candidate.name}:${candidate.center.lat}:${candidate.center.lon}`;
  const existing = deduped.get(key);
  if (!existing || candidate.source === 'overpass') deduped.set(key, candidate);
}
const allCandidates = [...deduped.values()];
const eastCandidates = allCandidates
  .filter((candidate) => candidate.center.lon >= 10.704 && candidate.center.lon <= 10.7145 && candidate.center.lat >= 59.906 && candidate.center.lat <= 59.9135)
  .map((candidate) => ({ ...candidate, score: eastCandidateScore(candidate) }))
  .sort((a, b) => b.score - a.score || a.sourceObjectId.localeCompare(b.sourceObjectId));

const eastBoundary = eastCandidates.find((candidate) => candidate.score >= 9) ?? null;
const westBoundary = {
  sourceProvider: 'osm',
  sourceObjectId: tourWay.osmObjectId,
  sourceName: tourWay.tags.name,
  role: 'west_corridor_extent_anchor',
  coordinate: { lat: tourWay.firstNode.lat, lon: tourWay.firstNode.lon },
  reason: 'The exact named public cycleway reaches the inner Frognerkilen side of the municipal scope and intersects the exact Frognerstranda footway.'
};
const displayAnchor = {
  sourceProvider: 'osm',
  sourceObjectId: frognerWay.osmObjectId,
  sourceName: frognerWay.tags.name,
  role: 'middle_display_anchor',
  coordinate: frognerWay.midpoint,
  lengthMeters: frognerWay.lengthMeters,
  reason: 'Exact named public Frognerstranda footway; used only as the central display anchor, not as a proxy for the full waterfront.'
};

const ordered = Boolean(
  westBoundary.coordinate.lon < displayAnchor.coordinate.lon &&
  (!eastBoundary || displayAnchor.coordinate.lon < eastBoundary.center.lon)
);
const westToMiddleMeters = haversineMeters(westBoundary.coordinate, displayAnchor.coordinate);
const middleToEastMeters = eastBoundary ? haversineMeters(displayAnchor.coordinate, eastBoundary.center) : null;
const canBuildProductionModel = Boolean(
  eastBoundary &&
  ordered &&
  eastBoundary.tags?.highway !== 'bus_stop' &&
  westToMiddleMeters >= 300 && westToMiddleMeters <= 1500 &&
  middleToEastMeters >= 150 && middleToEastMeters <= 1200
);

const summary = {
  version: '2026-07-24',
  placeId: 'frognerstranda',
  coordinateMaxBatch: 194,
  canonicalIdentity: {
    name: place.name,
    locatorType: place.locatorType,
    popupDesc: place.popupDesc,
    interpretation: 'full_linear_waterfront_area'
  },
  officialScope: {
    sourceUrl: officialUrl,
    sourceSha256: official.sha256,
    westBoundary: 'inner Frognerkilen and Bygdøy',
    eastBoundary: 'Hjortnes/Framnes',
    objectType: 'shoreline / westernmost Fjordbyen subarea',
    requiresPromenadeAndCycleContext: true
  },
  historicalScope: {
    sourceUrl: byleksikonUrl,
    sourceSha256: byleksikon.sha256,
    routeExtent: 'Filipstad to Sjølystveien',
    outerFunction: 'strandpromenade with walking and cycling',
    documentedEastCrossing: 'Framnesbrygga'
  },
  exactPhysicalWays: {
    frognerstrandaFootway: frognerWay,
    tourDeFinanceCycleway: tourWay
  },
  proposedAnchorChain: {
    west: westBoundary,
    middle: displayAnchor,
    east: eastBoundary ? {
      sourceProvider: 'osm',
      sourceObjectId: eastBoundary.sourceObjectId,
      sourceName: eastBoundary.name,
      role: 'east_hjortnes_framnes_physical_anchor',
      coordinate: eastBoundary.center,
      tags: eastBoundary.tags,
      score: eastBoundary.score,
      displayName: eastBoundary.displayName ?? null
    } : null,
    ordered,
    distancesMeters: {
      westToMiddle: Number(westToMiddleMeters.toFixed(2)),
      middleToEast: middleToEastMeters === null ? null : Number(middleToEastMeters.toFixed(2))
    }
  },
  eastCandidateCount: eastCandidates.length,
  eastCandidates,
  canBuildProductionModel,
  canPromoteNow: false,
  decision: canBuildProductionModel
    ? 'ordered_multi_anchor_chain_ready_for_fresh_production_batch'
    : 'east_boundary_physical_anchor_unresolved_keep_needs_source',
  nextAction: canBuildProductionModel
    ? 'Run a fresh production batch with the exact west–middle–east chain and the Frognerstranda footway midpoint as declared display anchor. Preserve the full waterfront identity.'
    : 'Keep needs_source. Resolve one exact non-bus-stop physical Hjortnes/Framnes shoreline or promenade anchor before production.'
};

await writeFile(join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(join(reportDir, 'README.md'), `# Frognerstranda multi-anchor chain research after batch 194\n\n- official scope: inner Frognerkilen/Bygdøy → Hjortnes/Framnes\n- canonical identity: full long waterfront, not one path\n- exact middle/display candidate: \`${displayAnchor.sourceObjectId}\`\n- exact west corridor candidate: \`${westBoundary.sourceObjectId}\`\n- exact east physical candidate: \`${eastBoundary?.sourceObjectId ?? 'none'}\`\n- ordered anchor chain: \`${ordered}\`\n- production model ready: \`${canBuildProductionModel}\`\n\nDecision: **${summary.decision}**\n\n${summary.nextAction}\n\nNo canonical place, coordinate, evidence or protocol data changed in this research PR.\n`, 'utf8');
await writeFile(join(reportDir, 'source-fetch-metadata.json'), `${JSON.stringify({
  official: { requestedUrl: official.requestedUrl, finalUrl: official.finalUrl, status: official.status, contentType: official.contentType, bytes: official.buffer.length, sha256: official.sha256 },
  byleksikon: { requestedUrl: byleksikon.requestedUrl, finalUrl: byleksikon.finalUrl, status: byleksikon.status, contentType: byleksikon.contentType, bytes: byleksikon.buffer.length, sha256: byleksikon.sha256 },
  frognerWay: { requestedUrl: frognerWayFetch.requestedUrl, finalUrl: frognerWayFetch.finalUrl, status: frognerWayFetch.status, bytes: frognerWayFetch.buffer.length, sha256: frognerWayFetch.sha256 },
  tourWay: { requestedUrl: tourWayFetch.requestedUrl, finalUrl: tourWayFetch.finalUrl, status: tourWayFetch.status, bytes: tourWayFetch.buffer.length, sha256: tourWayFetch.sha256 },
  overpass: { requestedUrl: overpass.requestedUrl, finalUrl: overpass.finalUrl, status: overpass.status, bytes: overpass.buffer.length, sha256: overpass.sha256 }
}, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  placeId: summary.placeId,
  coordinateMaxBatch: summary.coordinateMaxBatch,
  westAnchor: westBoundary.sourceObjectId,
  middleAnchor: displayAnchor.sourceObjectId,
  eastAnchor: eastBoundary?.sourceObjectId ?? null,
  eastCandidateCount: eastCandidates.length,
  canBuildProductionModel,
  decision: summary.decision
}, null, 2));
