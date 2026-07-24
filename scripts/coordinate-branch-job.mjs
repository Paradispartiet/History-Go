import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-frognerstranda-multi-anchor-chain-post-194');
const responseDir = join(reportDir, 'responses');
const officialUrl = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/';
const byleksikonUrl = 'https://oslobyleksikon.no/side/Frognerstranda';

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function textFromHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&aring;|&#229;/gi, 'å')
    .replace(/&oslash;|&#248;/gi, 'ø')
    .replace(/&aelig;|&#230;/gi, 'æ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function get(url, options = {}) {
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

async function getJson(url, options = {}) {
  const response = await get(url, options);
  return { ...response, json: JSON.parse(response.buffer.toString('utf8')) };
}

function haversine(a, b) {
  const rad = (value) => value * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function summarizeWay(payload, id) {
  const nodes = new Map(payload.elements.filter((item) => item.type === 'node').map((item) => [item.id, item]));
  const way = payload.elements.find((item) => item.type === 'way' && item.id === id);
  assert(way, `OSM way ${id} missing.`);
  const geometry = way.nodes.map((nodeId) => {
    const node = nodes.get(nodeId);
    assert(node, `OSM node ${nodeId} missing from way ${id}.`);
    return { nodeId, lat: node.lat, lon: node.lon };
  });
  let total = 0;
  for (let index = 1; index < geometry.length; index += 1) total += haversine(geometry[index - 1], geometry[index]);
  let walked = 0;
  let midpoint = geometry[0];
  for (let index = 1; index < geometry.length; index += 1) {
    const segment = haversine(geometry[index - 1], geometry[index]);
    if (walked + segment >= total / 2) {
      const ratio = segment ? (total / 2 - walked) / segment : 0;
      midpoint = {
        lat: geometry[index - 1].lat + (geometry[index].lat - geometry[index - 1].lat) * ratio,
        lon: geometry[index - 1].lon + (geometry[index].lon - geometry[index - 1].lon) * ratio
      };
      break;
    }
    walked += segment;
  }
  return {
    sourceObjectId: `osm-way:${id}`,
    id,
    tags: way.tags ?? {},
    version: way.version,
    timestamp: way.timestamp,
    nodeCount: geometry.length,
    lengthMeters: Number(total.toFixed(2)),
    firstNode: geometry[0],
    lastNode: geometry.at(-1),
    midpoint,
    geometry
  };
}

function center(element) {
  if (Number.isFinite(element.lat) && Number.isFinite(element.lon)) return { lat: element.lat, lon: element.lon };
  if (Number.isFinite(element.center?.lat) && Number.isFinite(element.center?.lon)) return element.center;
  const points = Array.isArray(element.geometry) ? element.geometry.filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon)) : [];
  if (!points.length) return null;
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length
  };
}

function normalizeName(value) {
  return String(value ?? '').toLocaleLowerCase('nb-NO').replace(/[^a-z0-9æøå]+/g, ' ').trim();
}

function scoreEast(candidate) {
  const name = normalizeName(candidate.name ?? candidate.tags?.name);
  const tags = candidate.tags ?? {};
  let score = 0;
  if (['hjortneskaia', 'hjortneskaiene', 'framnesbrygga', 'framnes brygge'].includes(name)) score += 10;
  else if (name.includes('hjortnes') || name.includes('framnes')) score += 4;
  if (tags.man_made === 'pier') score += 7;
  if (['footway', 'cycleway', 'path', 'pedestrian'].includes(tags.highway)) score += 5;
  if (tags.place) score += 3;
  if (tags.amenity === 'ferry_terminal' || tags.public_transport === 'platform') score += 2;
  if (tags.highway === 'bus_stop') score -= 20;
  if (candidate.coordinate.lon >= 10.7055 && candidate.coordinate.lon <= 10.7135) score += 2;
  if (candidate.coordinate.lat >= 59.907 && candidate.coordinate.lat <= 59.913) score += 1;
  return score;
}

await mkdir(responseDir, { recursive: true });

const protocol = await readFile(join(root, 'docs/coordinates/coordinate-control-protocol.md'), 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batches) === 194, `Expected protocol max batch 194, got ${Math.max(...batches)}.`);

const place = JSON.parse(await readFile(join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json'), 'utf8'));
const evidence = JSON.parse(await readFile(join(root, 'data/coordinate-evidence/oslo/popkultur/frognerstranda.json'), 'utf8'));
assert(place.id === 'frognerstranda' && place.coordStatus === 'needs_source' && place.coordType === 'legacy_unverified', 'Canonical Frognerstranda state changed.');
assert(place.lat === 59.9129 && place.lon === 10.7098 && place.r === 180, 'Legacy Frognerstranda marker changed.');
assert(place.popupDesc.includes('langstrakt fjordkant'), 'Canonical full-waterfront identity changed.');
assert(evidence.evidenceStatus === 'needs_research' && evidence.coordinateDecision === 'needs_geometry', 'Frognerstranda evidence state changed.');

const official = await get(officialUrl);
const officialText = textFromHtml(official.buffer.toString('utf8'));
assert(officialText.includes('Den strekker seg fra den innerste delen av Frognerkilen og Bygdøy i vest, til Hjortnes/Framnes i øst.'), 'Official Frognerstranda scope changed.');
assert(officialText.includes('Frognerstranda er en strandlinje'), 'Official shoreline identity missing.');
assert(officialText.includes('havnepromenaden') && officialText.includes('hovedsykkelveien'), 'Official promenade/cycle context missing.');
await writeFile(join(responseDir, 'official-frognerstranda.html'), official.buffer);

const byleksikon = await get(byleksikonUrl);
const byleksikonText = textFromHtml(byleksikon.buffer.toString('utf8'));
assert(byleksikonText.includes('fra Filipstad til Sjølystveien'), 'Byleksikon extent changed.');
assert(byleksikonText.includes('Ytre del av veien er anlagt som strandpromenade'), 'Byleksikon promenade identity missing.');
assert(byleksikonText.includes('Framnesbrygga'), 'Byleksikon Framnesbrygga anchor missing.');
await writeFile(join(responseDir, 'oslo-byleksikon-frognerstranda.html'), byleksikon.buffer);

const frognerFetch = await getJson('https://api.openstreetmap.org/api/0.6/way/71423688/full.json');
const frognerWay = summarizeWay(frognerFetch.json, 71423688);
assert(frognerWay.tags.name === 'Frognerstranda' && frognerWay.tags.highway === 'footway', 'Exact Frognerstranda footway changed.');
await writeFile(join(responseDir, 'osm-way-71423688-full.json'), `${JSON.stringify(frognerFetch.json, null, 2)}\n`);

const tourFetch = await getJson('https://api.openstreetmap.org/api/0.6/way/118364891/full.json');
const tourWay = summarizeWay(tourFetch.json, 118364891);
assert(tourWay.tags.name === 'Tour de Finance' && tourWay.tags.highway === 'cycleway', 'Tour de Finance changed.');
assert(tourWay.geometry.some((point) => point.nodeId === 849847795), 'Tour de Finance no longer intersects Frognerstranda at pinned node 849847795.');
await writeFile(join(responseDir, 'osm-way-118364891-full.json'), `${JSON.stringify(tourFetch.json, null, 2)}\n`);

const query = `[out:json][timeout:90];\n(\n nwr["name"~"Frognerstranda|Tour de Finance|Hjortnes|Hjortneskai|Hjortneskaia|Hjortneskaiene|Framnes|Framnesbrygga|Framnes brygge|Strandpromenaden",i](59.9060,10.6870,59.9195,10.7145);\n way["highway"~"footway|cycleway|path|pedestrian"](59.9060,10.7020,59.9135,10.7145);\n nwr["man_made"="pier"](59.9060,10.7020,59.9135,10.7145);\n nwr["amenity"="ferry_terminal"](59.9060,10.7020,59.9135,10.7145);\n);\nout tags center geom;`;
const overpass = await getJson('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
  body: new URLSearchParams({ data: query }).toString()
});
await writeFile(join(responseDir, 'overpass-anchor-search.json'), `${JSON.stringify(overpass.json, null, 2)}\n`);

const searches = [];
for (const q of ['Frognerkilen, Oslo, Norway', 'Hjortneskaia, Oslo, Norway', 'Hjortneskaiene, Oslo, Norway', 'Framnesbrygga, Oslo, Norway', 'Framnes, Oslo, Norway', 'Hjortnes, Oslo, Norway', 'Sjølystveien, Oslo, Norway', 'Filipstad, Oslo, Norway']) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '10');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('namedetails', '1');
  url.searchParams.set('polygon_geojson', '1');
  const response = await getJson(url.toString(), { headers: { 'accept-language': 'nb,en;q=0.8' } });
  searches.push({ query: q, finalUrl: response.finalUrl, status: response.status, results: response.json });
  await new Promise((resolve) => setTimeout(resolve, 1100));
}
await writeFile(join(responseDir, 'nominatim-anchor-searches.json'), `${JSON.stringify(searches, null, 2)}\n`);

const candidates = [];
for (const element of overpass.json.elements) {
  const coordinate = center(element);
  if (!coordinate) continue;
  candidates.push({
    source: 'overpass',
    sourceObjectId: `osm-${element.type}:${element.id}`,
    osmType: element.type,
    osmId: element.id,
    name: element.tags?.name ?? null,
    tags: element.tags ?? {},
    coordinate,
    geometry: element.geometry ?? null
  });
}
for (const row of searches) {
  for (const result of row.results) {
    const coordinate = { lat: Number(result.lat), lon: Number(result.lon) };
    if (!Number.isFinite(coordinate.lat) || !Number.isFinite(coordinate.lon)) continue;
    candidates.push({
      source: 'nominatim',
      query: row.query,
      sourceObjectId: result.osm_type && result.osm_id ? `osm-${result.osm_type}:${result.osm_id}` : null,
      osmType: result.osm_type,
      osmId: result.osm_id,
      name: result.namedetails?.name ?? result.name ?? null,
      displayName: result.display_name,
      tags: {
        name: result.namedetails?.name ?? result.name ?? null,
        place: result.category === 'place' ? result.type : undefined,
        highway: result.category === 'highway' ? result.type : undefined,
        man_made: result.category === 'man_made' ? result.type : undefined,
        amenity: result.category === 'amenity' ? result.type : undefined
      },
      coordinate,
      geojson: result.geojson ?? null
    });
  }
}

const unique = new Map();
for (const candidate of candidates) {
  const key = candidate.sourceObjectId ?? `${candidate.source}:${candidate.query}:${candidate.name}:${candidate.coordinate.lat}:${candidate.coordinate.lon}`;
  const old = unique.get(key);
  if (!old || candidate.source === 'overpass') unique.set(key, candidate);
}
const eastCandidates = [...unique.values()]
  .filter((candidate) => candidate.coordinate.lon >= 10.704 && candidate.coordinate.lon <= 10.7145 && candidate.coordinate.lat >= 59.906 && candidate.coordinate.lat <= 59.9135)
  .map((candidate) => ({ ...candidate, score: scoreEast(candidate) }))
  .sort((a, b) => b.score - a.score || String(a.sourceObjectId).localeCompare(String(b.sourceObjectId)));
const east = eastCandidates.find((candidate) => candidate.score >= 9) ?? null;

const west = {
  sourceObjectId: tourWay.sourceObjectId,
  name: tourWay.tags.name,
  role: 'west_corridor_extent_anchor',
  coordinate: { lat: tourWay.firstNode.lat, lon: tourWay.firstNode.lon }
};
const middle = {
  sourceObjectId: frognerWay.sourceObjectId,
  name: frognerWay.tags.name,
  role: 'middle_display_anchor',
  coordinate: frognerWay.midpoint,
  lengthMeters: frognerWay.lengthMeters
};
const ordered = Boolean(east && west.coordinate.lon < middle.coordinate.lon && middle.coordinate.lon < east.coordinate.lon);
const westToMiddle = haversine(west.coordinate, middle.coordinate);
const middleToEast = east ? haversine(middle.coordinate, east.coordinate) : null;
const ready = Boolean(
  east
  && ordered
  && east.tags?.highway !== 'bus_stop'
  && westToMiddle >= 300 && westToMiddle <= 1500
  && middleToEast >= 150 && middleToEast <= 1200
);

const summary = {
  version: '2026-07-24',
  placeId: 'frognerstranda',
  coordinateMaxBatch: 194,
  canonicalIdentity: {
    name: place.name,
    locatorType: place.locatorType,
    interpretation: 'full_linear_waterfront_area',
    popupDesc: place.popupDesc
  },
  officialScope: {
    sourceUrl: officialUrl,
    sourceSha256: official.sha256,
    westBoundary: 'inner Frognerkilen and Bygdøy',
    eastBoundary: 'Hjortnes/Framnes',
    objectType: 'shoreline / westernmost Fjordbyen subarea'
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
    west,
    middle,
    east: east ? {
      sourceObjectId: east.sourceObjectId,
      name: east.name,
      role: 'east_hjortnes_framnes_physical_anchor',
      coordinate: east.coordinate,
      tags: east.tags,
      score: east.score,
      displayName: east.displayName ?? null
    } : null,
    ordered,
    distancesMeters: {
      westToMiddle: Number(westToMiddle.toFixed(2)),
      middleToEast: middleToEast === null ? null : Number(middleToEast.toFixed(2))
    }
  },
  eastCandidateCount: eastCandidates.length,
  eastCandidates,
  canBuildProductionModel: ready,
  canPromoteNow: false,
  decision: ready ? 'ordered_multi_anchor_chain_ready_for_fresh_production_batch' : 'east_boundary_physical_anchor_unresolved_keep_needs_source',
  nextAction: ready
    ? 'Run a fresh production batch with the exact west–middle–east chain and the Frognerstranda footway midpoint as declared display anchor. Preserve the full waterfront identity.'
    : 'Keep needs_source. Resolve one exact non-bus-stop physical Hjortnes/Framnes shoreline or promenade anchor before production.'
};

await writeFile(join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
await writeFile(join(reportDir, 'README.md'), `# Frognerstranda multi-anchor chain research after batch 194\n\n- official scope: inner Frognerkilen/Bygdøy → Hjortnes/Framnes\n- canonical identity: full long waterfront, not one path\n- exact west corridor candidate: \`${west.sourceObjectId}\`\n- exact middle/display candidate: \`${middle.sourceObjectId}\`\n- exact east physical candidate: \`${east?.sourceObjectId ?? 'none'}\`\n- ordered anchor chain: \`${ordered}\`\n- production model ready: \`${ready}\`\n\nDecision: **${summary.decision}**\n\n${summary.nextAction}\n\nNo canonical place, coordinate, evidence or protocol data changed in this research PR.\n`);
await writeFile(join(reportDir, 'source-fetch-metadata.json'), `${JSON.stringify({
  official: { finalUrl: official.finalUrl, status: official.status, bytes: official.buffer.length, sha256: official.sha256 },
  byleksikon: { finalUrl: byleksikon.finalUrl, status: byleksikon.status, bytes: byleksikon.buffer.length, sha256: byleksikon.sha256 },
  frognerWay: { finalUrl: frognerFetch.finalUrl, status: frognerFetch.status, bytes: frognerFetch.buffer.length, sha256: frognerFetch.sha256 },
  tourWay: { finalUrl: tourFetch.finalUrl, status: tourFetch.status, bytes: tourFetch.buffer.length, sha256: tourFetch.sha256 },
  overpass: { finalUrl: overpass.finalUrl, status: overpass.status, bytes: overpass.buffer.length, sha256: overpass.sha256 }
}, null, 2)}\n`);

console.log(JSON.stringify({
  placeId: summary.placeId,
  coordinateMaxBatch: summary.coordinateMaxBatch,
  westAnchor: west.sourceObjectId,
  middleAnchor: middle.sourceObjectId,
  eastAnchor: east?.sourceObjectId ?? null,
  eastCandidateCount: eastCandidates.length,
  canBuildProductionModel: ready,
  decision: summary.decision
}, null, 2));
