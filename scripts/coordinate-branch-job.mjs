#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const DATE = '2026-07-23';
const BATCH = 177;
const placeId = 'ring_3';
const bbox = '59.84,10.45,60.08,11.02';
const overpassUrl = 'https://overpass-api.de/api/interpreter';
const officialUrl = 'https://www.vegvesen.no/vegprosjekter/prosjekt/sykkelvegeroslo/';
const aggregateFile = 'data/places/by/oslo/places_by.json';
const childFile = 'data/places/by/oslo/places/ring_3.json';
const indexFile = 'data/places/by/oslo/places_by_index.json';
const manifestFile = 'data/places/by/oslo/places_by_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/by/ring_3.json';
const mappingFile = 'data/Civication/map/historyGoPlaceMapping.by.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const lockedResearchFile = 'reports/oslo-coordinate-ring3-route-mainline-research-post-176/result.json';
const reportDir = `reports/oslo-coordinate-control-batch-${BATCH}-ring3-route-production`;

const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');

function haversineMeters(a, b) {
  const rad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function geometryLengthM(geometry = []) {
  let total = 0;
  for (let i = 1; i < geometry.length; i += 1) total += haversineMeters(geometry[i - 1], geometry[i]);
  return total;
}
async function fetchText(url, init = {}) {
  const response = await fetch(url, {
    redirect: 'follow',
    ...init,
    headers: {
      'User-Agent': 'History-Go-coordinate-control/1.0',
      Accept: 'application/json,text/html,*/*',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(120000),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> ${response.status} ${response.statusText}: ${text.slice(0, 500)}`);
  return { finalUrl: response.url, text };
}
async function fetchJson(url, init = {}) {
  const result = await fetchText(url, init);
  return JSON.parse(result.text);
}
async function overpass(query) {
  return fetchJson(overpassUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }),
  });
}
function endpointCoordinate(row, nodeId) {
  if (row.startNodeId === nodeId) return row.geometry[0];
  if (row.endNodeId === nodeId) return row.geometry[row.geometry.length - 1];
  return null;
}
function sortedNumeric(values) {
  return [...values].map(Number).sort((a, b) => a - b);
}
function equalNumericSets(a, b) {
  const aa = sortedNumeric(a);
  const bb = sortedNumeric(b);
  return aa.length === bb.length && aa.every((value, index) => value === bb[index]);
}
function buildComponents(rows) {
  const endpointToWays = new Map();
  for (const row of rows) {
    for (const nodeId of [row.startNodeId, row.endNodeId].filter(Boolean)) {
      if (!endpointToWays.has(nodeId)) endpointToWays.set(nodeId, []);
      endpointToWays.get(nodeId).push(row.osmWayId);
    }
  }
  const adjacency = new Map(rows.map((row) => [row.osmWayId, new Set()]));
  for (const ids of endpointToWays.values()) {
    for (const a of ids) for (const b of ids) if (a !== b) adjacency.get(a)?.add(b);
  }
  const rowById = new Map(rows.map((row) => [row.osmWayId, row]));
  const seen = new Set();
  const components = [];
  for (const row of rows) {
    if (seen.has(row.osmWayId)) continue;
    const stack = [row.osmWayId];
    const ids = [];
    seen.add(row.osmWayId);
    while (stack.length) {
      const id = stack.pop();
      ids.push(id);
      for (const next of adjacency.get(id) || []) {
        if (seen.has(next)) continue;
        seen.add(next);
        stack.push(next);
      }
    }
    const componentRows = ids.map((id) => rowById.get(id));
    const degrees = new Map();
    for (const item of componentRows) {
      for (const nodeId of [item.startNodeId, item.endNodeId].filter(Boolean)) degrees.set(nodeId, (degrees.get(nodeId) || 0) + 1);
    }
    components.push({
      wayIds: sortedNumeric(ids),
      rows: componentRows,
      totalLengthM: componentRows.reduce((sum, item) => sum + item.lengthM, 0),
      openEndpointNodeIds: [...degrees.entries()].filter(([, degree]) => degree === 1).map(([node]) => node),
      branchNodeIds: [...degrees.entries()].filter(([, degree]) => degree > 2).map(([node]) => node),
    });
  }
  return components.sort((a, b) => b.totalLengthM - a.totalLengthM);
}
function orderUnbranchedComponent(component) {
  if (component.branchNodeIds.length !== 0 || component.openEndpointNodeIds.length !== 2) throw new Error('Component is not an unbranched open chain');
  const rowById = new Map(component.rows.map((row) => [row.osmWayId, row]));
  const endpointToWays = new Map();
  for (const row of component.rows) {
    for (const nodeId of [row.startNodeId, row.endNodeId]) {
      if (!endpointToWays.has(nodeId)) endpointToWays.set(nodeId, []);
      endpointToWays.get(nodeId).push(row.osmWayId);
    }
  }
  const endpoints = component.openEndpointNodeIds.map((nodeId) => {
    const wayId = endpointToWays.get(nodeId)?.[0];
    const row = rowById.get(wayId);
    const coordinate = endpointCoordinate(row, nodeId);
    return { nodeId, coordinate };
  });
  endpoints.sort((a, b) => a.coordinate.lon - b.coordinate.lon || a.coordinate.lat - b.coordinate.lat || String(a.nodeId).localeCompare(String(b.nodeId)));
  const startNodeId = endpoints[0].nodeId;
  const expectedEndNodeId = endpoints[1].nodeId;
  const unused = new Set(component.wayIds);
  const ordered = [];
  let currentNodeId = startNodeId;
  while (unused.size) {
    const candidates = (endpointToWays.get(currentNodeId) || []).filter((id) => unused.has(id));
    if (candidates.length !== 1) throw new Error(`Expected one unused Ring 3 way at node ${currentNodeId}, got ${candidates.length}`);
    const row = rowById.get(candidates[0]);
    const forward = row.startNodeId === currentNodeId;
    const geometry = forward ? row.geometry : [...row.geometry].reverse();
    const endNodeId = forward ? row.endNodeId : row.startNodeId;
    ordered.push({ ...row, geometry, traversal: forward ? 'forward' : 'reverse', orderedStartNodeId: currentNodeId, orderedEndNodeId: endNodeId });
    unused.delete(row.osmWayId);
    currentNodeId = endNodeId;
  }
  if (currentNodeId !== expectedEndNodeId) throw new Error(`Ordered Ring 3 chain ended at ${currentNodeId}, expected ${expectedEndNodeId}`);
  return {
    startNodeId,
    endNodeId: expectedEndNodeId,
    startCoordinate: endpoints[0].coordinate,
    endCoordinate: endpoints[1].coordinate,
    totalLengthM: ordered.reduce((sum, row) => sum + row.lengthM, 0),
    ordered,
  };
}
function pointAlongGeometry(geometry, distanceM) {
  let remaining = distanceM;
  for (let i = 1; i < geometry.length; i += 1) {
    const a = geometry[i - 1];
    const b = geometry[i];
    const length = haversineMeters(a, b);
    if (remaining <= length) {
      const ratio = length === 0 ? 0 : remaining / length;
      return { lat: a.lat + (b.lat - a.lat) * ratio, lon: a.lon + (b.lon - a.lon) * ratio };
    }
    remaining -= length;
  }
  return geometry[geometry.length - 1];
}
function chainMidpoint(chain) {
  const target = chain.totalLengthM / 2;
  let traversed = 0;
  for (const segment of chain.ordered) {
    if (traversed + segment.lengthM >= target) {
      return {
        coordinate: pointAlongGeometry(segment.geometry, target - traversed),
        sourceWayId: segment.osmWayId,
        segmentOrder: chain.ordered.indexOf(segment) + 1,
      };
    }
    traversed += segment.lengthM;
  }
  throw new Error('Could not resolve Ring 3 chain midpoint');
}

const protocolBefore = fs.readFileSync(abs(protocolFile), 'utf8');
const maxBatch = Math.max(...[...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1])).filter(Number.isFinite));
if (maxBatch !== 176) throw new Error(`Expected current coordinate max batch 176, got ${maxBatch}. Rebase before batch 177.`);

const locked = readJson(lockedResearchFile);
if (locked.status !== 'two_unbranched_ring3_mainline_carriageways_candidate' || locked.twoDirectionCandidate !== true || locked.majorComponents?.length !== 2) {
  throw new Error('Merged Ring 3 research does not contain the expected two-carriageway production lock');
}

const query = `[out:json][timeout:90];\n(\n  way["highway"="trunk"]["ref"~"Ring 3",i](${bbox});\n  way["highway"="motorway"]["ref"~"Ring 3",i](${bbox});\n);\nout body geom;`;
const [data, official] = await Promise.all([overpass(query), fetchText(officialUrl)]);
const ways = (data.elements || []).filter((element) => element.type === 'way');
const rows = ways.map((way) => ({
  osmWayId: Number(way.id),
  sourceObjectId: `osm-way:${way.id}`,
  ref: way.tags?.ref ?? null,
  name: way.tags?.name ?? null,
  highway: way.tags?.highway ?? null,
  oneway: way.tags?.oneway ?? null,
  tunnel: way.tags?.tunnel ?? null,
  bridge: way.tags?.bridge ?? null,
  surface: way.tags?.surface ?? null,
  lanes: way.tags?.lanes ?? null,
  startNodeId: String(way.nodes?.[0] ?? ''),
  endNodeId: String(way.nodes?.[way.nodes.length - 1] ?? ''),
  geometry: way.geometry || [],
  lengthM: geometryLengthM(way.geometry || []),
}));
const components = buildComponents(rows);
const major = components.filter((component) => component.totalLengthM >= 10000);
const minor = components.filter((component) => component.totalLengthM < 10000);
if (major.length !== 2 || major.some((component) => component.branchNodeIds.length !== 0 || component.openEndpointNodeIds.length !== 2)) {
  throw new Error(`Fresh Ring 3 topology no longer resolves as two unbranched major components: ${JSON.stringify(major.map((component) => ({ ways: component.wayIds.length, open: component.openEndpointNodeIds.length, branches: component.branchNodeIds.length, length: component.totalLengthM })))}`);
}
const lockedMajor = locked.majorComponents;
const unmatched = major.filter((component) => !lockedMajor.some((expected) => equalNumericSets(component.wayIds, expected.wayIds)));
if (unmatched.length) throw new Error('Fresh Ring 3 major-component way sets differ from the merged production lock');
const minorLengthM = minor.reduce((sum, component) => sum + component.totalLengthM, 0);
if (minorLengthM >= 2000) throw new Error(`Fresh Ring 3 residual mainline-tagged components are too large: ${minorLengthM.toFixed(1)} m`);
const officialText = official.text;
if (!/Ring\s*3/i.test(officialText) || !/rv\.?\s*150|riksvei\s*150/i.test(officialText)) throw new Error('Statens vegvesen source no longer confirms Ring 3 / rv. 150 identity');

const chains = major.map(orderUnbranchedComponent).sort((a, b) => Math.min(...a.ordered.map((row) => row.osmWayId)) - Math.min(...b.ordered.map((row) => row.osmWayId)));
const displayChain = chains[0];
const midpoint = chainMidpoint(displayChain);
const routeSegments = chains.flatMap((chain, carriagewayIndex) => chain.ordered.map((segment, index) => ({
  id: `ring3_carriageway_${carriagewayIndex + 1}_segment_${String(index + 1).padStart(3, '0')}`,
  carriageway: carriagewayIndex + 1,
  order: index + 1,
  osmWayId: segment.osmWayId,
  sourceProvider: 'osm',
  sourceObjectId: segment.sourceObjectId,
  sourceUrl: `https://www.openstreetmap.org/way/${segment.osmWayId}`,
  ref: segment.ref,
  name: segment.name,
  highway: segment.highway,
  oneway: segment.oneway,
  tunnel: segment.tunnel,
  bridge: segment.bridge,
  surface: segment.surface,
  lanes: segment.lanes,
  lengthM: Math.round(segment.lengthM * 10) / 10,
  startNodeId: segment.orderedStartNodeId,
  endNodeId: segment.orderedEndNodeId,
  traversal: segment.traversal,
})));
const totalMainlineLengthM = chains.reduce((sum, chain) => sum + chain.totalLengthM, 0);
const corridorLengthM = chains.reduce((sum, chain) => sum + chain.totalLengthM, 0) / 2;
const displaySourceObjectId = `osm-way:${midpoint.sourceWayId}`;
const coordNote = `Batch ${BATCH} route topology production: fresh OSM resolves Ring 3's explicit trunk mainline into exactly two unbranched endpoint-connected carriageway chains, with ${chains[0].ordered.length} and ${chains[1].ordered.length} ways and lengths ${chains[0].totalLengthM.toFixed(1)} m and ${chains[1].totalLengthM.toFixed(1)} m. Both chains explicitly carry Ring 3 in ref and together cover the rv. 150 and E6 overlap sections. All ${routeSegments.length} mainline ways are stored as routeSegments. A detached ${minorLengthM.toFixed(1)} m Ring 3-tagged side component is excluded because it is not part of either complete end-to-end carriageway. The canonical lat/lon is the deterministic length midpoint of carriageway 1 and lies on OSM way ${midpoint.sourceWayId}, which is used as the display coordinate source. No nearest/first-hit segment and no legacy symbolic midpoint is used.`;

const place = readJson(childFile);
if (place.id !== placeId) throw new Error('Ring 3 child source identity mismatch');
place.lat = midpoint.coordinate.lat;
place.lon = midpoint.coordinate.lon;
place.r = 500;
place.locatorType = 'route';
place.sourceProvider = 'osm';
place.sourceObjectId = displaySourceObjectId;
place.geocodeAccuracy = 'semantic_anchor';
place.coordRole = 'line_anchor';
place.coordType = 'multi_segment_route_display_anchor';
place.coordStatus = 'verified_geometry';
place.coordSource = `OpenStreetMap Ring 3 explicit mainline routeSegments: ${routeSegments.length} ways across two unbranched carriageways; display midpoint on way ${midpoint.sourceWayId}`;
place.coordSourceId = displaySourceObjectId;
place.coordSourceUrl = `https://www.openstreetmap.org/way/${midpoint.sourceWayId}`;
place.coordVerifiedAt = DATE;
place.coordNote = coordNote;
place.sourceHint = 'Canonical route is built from all fresh OSM trunk mainline ways whose ref explicitly contains Ring 3. Link ramps are excluded; the divided road is represented as two complete unbranched carriageway chains.';
place.routeSegments = routeSegments;
place.routeCarriageways = chains.map((chain, index) => ({
  id: `ring3_carriageway_${index + 1}`,
  order: index + 1,
  startNodeId: chain.startNodeId,
  endNodeId: chain.endNodeId,
  startCoordinate: chain.startCoordinate,
  endCoordinate: chain.endCoordinate,
  wayCount: chain.ordered.length,
  lengthM: Math.round(chain.totalLengthM * 10) / 10,
}));

const aggregate = readJson(aggregateFile);
if (!Array.isArray(aggregate) || aggregate.filter((row) => row?.id === placeId).length !== 1) throw new Error('Ring 3 must exist exactly once in places_by aggregate');
writeJson(aggregateFile, aggregate.map((row) => row?.id === placeId ? place : row));
writeJson(childFile, place);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error('Ring 3 missing from places_by index');
for (const key of ['lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource', 'coordSourceId', 'coordSourceUrl', 'coordVerifiedAt', 'coordNote', 'sourceHint', 'routeSegments', 'routeCarriageways']) indexRow[key] = place[key];
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error('Ring 3 missing from places_by split manifest');
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

const mapping = readJson(mappingFile);
let mappingCount = 0;
for (const entry of Object.values(mapping.mappings || {})) {
  if (entry?.historyGoPlaceId !== placeId) continue;
  entry.lat = place.lat;
  entry.lon = place.lon;
  entry.name = place.name;
  entry.category = place.category;
  mappingCount += 1;
}
if (mappingCount < 1) throw new Error('No Civication mapping found for ring_3');
writeJson(mappingFile, mapping);

writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: childFile,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: place.coordStatus,
    coordSource: place.coordSource,
    coordType: place.coordType,
    coordNote: place.coordNote,
  },
  identity: {
    currentName: 'Ring 3',
    resolvedIdentity: 'Ring 3 – det eksplisitt Ring 3-merkede hovedløpet gjennom Oslo, modellert som to komplette kjøreretninger',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'route',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [
    'offisiell eller stabil rutekilde',
    'traségeometri eller flere kildebelagte ruteankre',
    'egen representasjonsregel for lineært unlock/display',
  ],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Ring 3 explicit trunk mainline',
      sourceUrl: `https://www.openstreetmap.org/way/${midpoint.sourceWayId}`,
      sourceObjectId: displaySourceObjectId,
      sourceQuality: 'two_complete_unbranched_explicit_ring3_carriageway_chains',
      finding: `Fresh topology yields two complete unbranched Ring 3 mainline chains with ${chains[0].ordered.length} and ${chains[1].ordered.length} ways; ${routeSegments.length} explicit routeSegments in total. Deterministic display midpoint lies on way ${midpoint.sourceWayId}.`,
      canVerifyCoordinate: true,
      reason: coordNote,
    },
    {
      sourceProvider: 'official_map',
      sourceName: 'Statens vegvesen – Ring 3 / rv. 150',
      sourceUrl: officialUrl,
      sourceObjectId: 'statens-vegvesen:ring3-rv150',
      sourceQuality: 'official_route_identity',
      finding: 'Statens vegvesen identifies Ring 3 and rv. 150 in the official route/project context; OSM supplies the explicit current mainline segment geometry, including the E6 overlap carrying Ring 3 in ref.',
      canVerifyCoordinate: false,
      reason: 'Confirms route identity; exact route geometry comes from the fresh explicit Ring 3 OSM mainline topology.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: displaySourceObjectId, canApplyToPlace: true },
    { sourceProvider: 'official_map', sourceObjectId: 'statens-vegvesen:ring3-rv150', canApplyToPlace: false },
  ],
  geometryCandidates: chains.map((chain, index) => ({
    sourceProvider: 'osm',
    sourceObjectId: displaySourceObjectId,
    geometryType: 'ordered_route_segments',
    carriageway: index + 1,
    wayCount: chain.ordered.length,
    lengthM: Math.round(chain.totalLengthM * 10) / 10,
    coordRole: 'line_anchor',
    canApplyToPlace: true,
  })),
  coordinateCandidates: [{ sourceProvider: 'osm', sourceObjectId: displaySourceObjectId, lat: place.lat, lon: place.lon, coordRole: 'line_anchor', canApplyToPlace: true }],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Ring 3 is verified as an explicit two-carriageway multi-segment route; the deterministic carriageway midpoint is applied as display anchor.' },
  notes: [coordNote],
});

let protocol = protocolBefore;
const unresolvedPattern = new RegExp(`^\\|[^\\n]*\\\`${placeId}\\\`[^\\n]*needs_review[^\\n]*\\n?`, 'm');
if (!unresolvedPattern.test(protocol)) throw new Error('Ring 3 unresolved protocol row not found');
protocol = protocol.replace(unresolvedPattern, '');
const protocolRow = `| ${BATCH} | \`${placeId}\` | Ring 3 | verified_geometry | \`${displaySourceObjectId}\` |`;
let insertionIndex = protocol.search(/\n### Dokumenterte Oslo-kontroller uten godkjent koordinat/i);
if (insertionIndex < 0) insertionIndex = protocol.search(/\n##+ [^\n]*Dokumenterte Oslo-kontroller uten godkjent koordinat/i);
if (insertionIndex < 0) throw new Error('Could not locate unresolved Oslo protocol section');
protocol = `${protocol.slice(0, insertionIndex)}\n${protocolRow}${protocol.slice(insertionIndex)}`;
protocol = protocol.replace(/(Oslo-protokollen dekker nå )(\d+)( aktive current `verified\*` canonical Oslo-steder\.)/, (_, prefix, count, suffix) => `${prefix}${Number(count) + 1}${suffix}`);
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
writeJson(`${reportDir}/batch-${BATCH}-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId,
  status: 'verified_geometry_applied_to_place',
  displayCoordinate: { lat: place.lat, lon: place.lon, sourceObjectId: displaySourceObjectId, carriageway: 1, segmentOrder: midpoint.segmentOrder },
  carriageways: place.routeCarriageways,
  routeSegmentCount: routeSegments.length,
  totalDirectionalMainlineLengthM: Math.round(totalMainlineLengthM * 10) / 10,
  approximateCorridorLengthM: Math.round(corridorLengthM * 10) / 10,
  excludedResidualComponents: minor.map((component) => ({ wayIds: component.wayIds, totalLengthM: Math.round(component.totalLengthM * 10) / 10, openEndpoints: component.openEndpointNodeIds.length, branchNodes: component.branchNodeIds.length })),
  gates: {
    officialIdentity: true,
    twoMajorUnbranchedCarriageways: true,
    freshWaySetsMatchMergedResearch: true,
    minorResidualUnder2km: true,
    noNearestOrFirstHit: true,
  },
});
writeJson(`${reportDir}/fresh-overpass-ring3-mainline.json`, data);
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Ring 3 route production sources\n\n- Statens vegvesen: ${officialUrl}\n- OSM explicit Ring 3 trunk mainline: ${routeSegments.length} ways across two unbranched carriageways\n- Display source: https://www.openstreetmap.org/way/${midpoint.sourceWayId}\n\nThe short detached residual component is excluded because it is not part of either complete end-to-end mainline carriageway.\n`);

console.log(JSON.stringify({ batch: BATCH, placeId, displayCoordinate: { lat: place.lat, lon: place.lon }, displaySourceObjectId, routeSegmentCount: routeSegments.length, carriageways: place.routeCarriageways, excludedResidualLengthM: Math.round(minorLengthM * 10) / 10 }, null, 2));
