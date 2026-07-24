import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const batch = 195;
const reportDir = join(root, 'reports/oslo-coordinate-control-batch-195-frognerstranda-multi-anchor');
const responseDir = join(reportDir, 'responses');
const aggregatePath = join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur.json');
const childPath = join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json');
const evidencePath = join(root, 'data/coordinate-evidence/oslo/popkultur/frognerstranda.json');
const civicationPath = join(root, 'data/Civication/map/historyGoPlaceMapping.popkultur.json');
const protocolPath = join(root, 'docs/coordinates/coordinate-control-protocol.md');
const researchPath = join(root, 'reports/oslo-coordinate-frognerstranda-multi-anchor-chain-post-194/summary.json');
const officialUrl = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/';
const byleksikonUrl = 'https://oslobyleksikon.no/side/Frognerstranda';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function normalizeHtml(html) {
  return html
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
    buffer
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetchBuffer(url, options);
  return { ...response, json: JSON.parse(response.buffer.toString('utf8')) };
}

function haversineMeters(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function summarizeWay(payload, id) {
  const nodes = new Map(payload.elements.filter((element) => element.type === 'node').map((node) => [node.id, node]));
  const way = payload.elements.find((element) => element.type === 'way' && element.id === id);
  assert(way, `OSM way ${id} missing.`);
  const geometry = way.nodes.map((nodeId) => {
    const node = nodes.get(nodeId);
    assert(node, `OSM node ${nodeId} missing from way ${id}.`);
    return { nodeId, lat: node.lat, lon: node.lon };
  });
  let totalLength = 0;
  for (let index = 1; index < geometry.length; index += 1) {
    totalLength += haversineMeters(geometry[index - 1], geometry[index]);
  }
  let walked = 0;
  let midpoint = { lat: geometry[0].lat, lon: geometry[0].lon };
  for (let index = 1; index < geometry.length; index += 1) {
    const segmentLength = haversineMeters(geometry[index - 1], geometry[index]);
    if (walked + segmentLength >= totalLength / 2) {
      const ratio = segmentLength === 0 ? 0 : (totalLength / 2 - walked) / segmentLength;
      midpoint = {
        lat: geometry[index - 1].lat + (geometry[index].lat - geometry[index - 1].lat) * ratio,
        lon: geometry[index - 1].lon + (geometry[index].lon - geometry[index - 1].lon) * ratio
      };
      break;
    }
    walked += segmentLength;
  }
  return {
    sourceObjectId: `osm-way:${id}`,
    id,
    tags: way.tags ?? {},
    version: way.version,
    timestamp: way.timestamp,
    nodeCount: geometry.length,
    lengthMeters: Number(totalLength.toFixed(2)),
    firstNode: geometry[0],
    lastNode: geometry.at(-1),
    midpoint,
    geometry
  };
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon;
    const yi = polygon[i].lat;
    const xj = polygon[j].lon;
    const yj = polygon[j].lat;
    const intersects = ((yi > point.lat) !== (yj > point.lat))
      && point.lon < ((xj - xi) * (point.lat - yi)) / ((yj - yi) || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonCentroid(polygon) {
  const ring = polygon[0].lat === polygon.at(-1).lat && polygon[0].lon === polygon.at(-1).lon
    ? polygon
    : [...polygon, polygon[0]];
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const current = ring[index];
    const next = ring[index + 1];
    const cross = current.lon * next.lat - next.lon * current.lat;
    twiceArea += cross;
    cx += (current.lon + next.lon) * cross;
    cy += (current.lat + next.lat) * cross;
  }
  assert(Math.abs(twiceArea) > 1e-14, 'East anchor polygon has zero area.');
  return {
    lat: cy / (3 * twiceArea),
    lon: cx / (3 * twiceArea)
  };
}

function deterministicInteriorPoint(polygon) {
  const centroid = polygonCentroid(polygon);
  if (pointInPolygon(centroid, polygon)) return { ...centroid, method: 'polygon_centroid' };
  const minLat = Math.min(...polygon.map((point) => point.lat));
  const maxLat = Math.max(...polygon.map((point) => point.lat));
  const minLon = Math.min(...polygon.map((point) => point.lon));
  const maxLon = Math.max(...polygon.map((point) => point.lon));
  for (let row = 1; row < 20; row += 1) {
    for (let column = 1; column < 20; column += 1) {
      const candidate = {
        lat: minLat + (maxLat - minLat) * row / 20,
        lon: minLon + (maxLon - minLon) * column / 20
      };
      if (pointInPolygon(candidate, polygon)) return { ...candidate, method: 'deterministic_grid_interior' };
    }
  }
  throw new Error('Could not derive deterministic interior point for Hjortneskaia.');
}

function extractPlaces(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.places)) return value.places;
  if (value && typeof value === 'object' && typeof value.id === 'string') return [value];
  return [];
}

function roundCoordinate(value) {
  return Number(value.toFixed(12));
}

await mkdir(responseDir, { recursive: true });

const protocol = await readFile(protocolPath, 'utf8');
const existingBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...existingBatches) === 194, `Expected protocol max batch 194, got ${Math.max(...existingBatches)}.`);
assert(!protocol.includes('| 195 |'), 'Batch 195 already exists in protocol.');

const research = JSON.parse(await readFile(researchPath, 'utf8'));
assert(research.placeId === 'frognerstranda', 'Unexpected research place.');
assert(research.coordinateMaxBatch === 194, 'Research does not follow batch 194.');
assert(research.decision === 'ordered_multi_anchor_chain_ready_for_fresh_production_batch', 'Research is not production ready.');
assert(research.canBuildProductionModel === true, 'Research production model is not ready.');
assert(research.proposedAnchorChain?.west?.sourceObjectId === 'osm-way:118364891', 'Research west anchor changed.');
assert(research.proposedAnchorChain?.middle?.sourceObjectId === 'osm-way:71423688', 'Research middle anchor changed.');
assert(research.proposedAnchorChain?.east?.sourceObjectId === 'osm-way:1205417997', 'Research east anchor changed.');
assert(research.canonicalIdentity?.interpretation === 'full_linear_waterfront_area', 'Research canonical scope changed.');

const aggregate = JSON.parse(await readFile(aggregatePath, 'utf8'));
assert(Array.isArray(aggregate), 'Popkultur aggregate is not a JSON array.');
const aggregateIndex = aggregate.findIndex((place) => place.id === 'frognerstranda');
assert(aggregateIndex >= 0, 'frognerstranda missing from aggregate.');
const child = JSON.parse(await readFile(childPath, 'utf8'));
assert(child.id === 'frognerstranda', 'Unexpected split child.');
assert(deepEqual(aggregate[aggregateIndex], child), 'Aggregate and split child differ before batch 195.');
assert(child.name === 'Frognerstranda', 'Canonical name changed.');
assert(child.popupDesc.includes('langstrakt fjordkant'), 'Canonical full-waterfront text changed.');
assert(child.lat === 59.9129 && child.lon === 10.7098 && child.r === 180, 'Legacy marker/radius changed before batch 195.');
assert(child.coordStatus === 'needs_source' && child.coordType === 'legacy_unverified', 'Frognerstranda is no longer unresolved.');

const currentEvidence = JSON.parse(await readFile(evidencePath, 'utf8'));
assert(currentEvidence.placeId === 'frognerstranda', 'Unexpected coordinate evidence.');
assert(currentEvidence.evidenceStatus === 'needs_research' && currentEvidence.coordinateDecision === 'needs_geometry', 'Coordinate evidence state changed before batch 195.');

const official = await fetchBuffer(officialUrl);
const officialText = normalizeHtml(official.buffer.toString('utf8'));
assert(officialText.includes('Den strekker seg fra den innerste delen av Frognerkilen og Bygdøy i vest, til Hjortnes/Framnes i øst.'), 'Official Frognerstranda scope changed.');
assert(officialText.includes('Frognerstranda er en strandlinje'), 'Official shoreline identity missing.');
assert(officialText.includes('havnepromenaden') && officialText.includes('hovedsykkelveien'), 'Official promenade/cycle context missing.');
await writeFile(join(responseDir, 'official-frognerstranda.html'), official.buffer);

const byleksikon = await fetchBuffer(byleksikonUrl);
const byleksikonText = normalizeHtml(byleksikon.buffer.toString('utf8'));
assert(byleksikonText.includes('fra Filipstad til Sjølystveien'), 'Oslo byleksikon route extent changed.');
assert(byleksikonText.includes('Ytre del av veien er anlagt som strandpromenade'), 'Oslo byleksikon promenade identity missing.');
assert(byleksikonText.includes('Framnesbrygga'), 'Oslo byleksikon east crossing anchor missing.');
await writeFile(join(responseDir, 'oslo-byleksikon-frognerstranda.html'), byleksikon.buffer);

const westFetch = await fetchJson('https://api.openstreetmap.org/api/0.6/way/118364891/full.json');
const westWay = summarizeWay(westFetch.json, 118364891);
await writeFile(join(responseDir, 'osm-way-118364891-full.json'), `${JSON.stringify(westFetch.json, null, 2)}\n`, 'utf8');
assert(westWay.tags.name === 'Tour de Finance' && westWay.tags.highway === 'cycleway', 'Live west anchor identity changed.');
assert(westWay.version === research.exactPhysicalWays.tourDeFinanceCycleway.version, 'West anchor OSM version drifted after research.');
assert(westWay.timestamp === research.exactPhysicalWays.tourDeFinanceCycleway.timestamp, 'West anchor timestamp drifted after research.');
assert(deepEqual(westWay.geometry, research.exactPhysicalWays.tourDeFinanceCycleway.geometry), 'West anchor geometry drifted after research.');
assert(westWay.geometry.some((point) => point.nodeId === 849847795), 'West corridor no longer intersects middle footway at node 849847795.');

const middleFetch = await fetchJson('https://api.openstreetmap.org/api/0.6/way/71423688/full.json');
const middleWay = summarizeWay(middleFetch.json, 71423688);
await writeFile(join(responseDir, 'osm-way-71423688-full.json'), `${JSON.stringify(middleFetch.json, null, 2)}\n`, 'utf8');
assert(middleWay.tags.name === 'Frognerstranda' && middleWay.tags.highway === 'footway', 'Live middle anchor identity changed.');
assert(middleWay.version === research.exactPhysicalWays.frognerstrandaFootway.version, 'Middle anchor OSM version drifted after research.');
assert(middleWay.timestamp === research.exactPhysicalWays.frognerstrandaFootway.timestamp, 'Middle anchor timestamp drifted after research.');
assert(deepEqual(middleWay.geometry, research.exactPhysicalWays.frognerstrandaFootway.geometry), 'Middle anchor geometry drifted after research.');
assert(Math.abs(middleWay.lengthMeters - research.exactPhysicalWays.frognerstrandaFootway.lengthMeters) < 0.01, 'Middle anchor length drifted after research.');
assert(haversineMeters(middleWay.midpoint, research.proposedAnchorChain.middle.coordinate) < 0.02, 'Middle anchor midpoint drifted after research.');

const eastFetch = await fetchJson('https://api.openstreetmap.org/api/0.6/way/1205417997/full.json');
const eastWay = summarizeWay(eastFetch.json, 1205417997);
await writeFile(join(responseDir, 'osm-way-1205417997-full.json'), `${JSON.stringify(eastFetch.json, null, 2)}\n`, 'utf8');
assert(eastWay.tags.name === 'Hjortneskaia' && eastWay.tags.landuse === 'commercial', 'Live east anchor identity changed.');
const researchEast = research.eastCandidates.find((candidate) => candidate.sourceObjectId === 'osm-way:1205417997');
assert(researchEast, 'Research east candidate geometry missing.');
const eastCoordinateGeometry = eastWay.geometry.map(({ lat, lon }) => ({ lat, lon }));
assert(deepEqual(eastCoordinateGeometry, researchEast.geometry), 'East anchor geometry drifted after research.');
assert(eastWay.geometry.length >= 4, 'Hjortneskaia polygon geometry is incomplete.');
assert(eastWay.geometry[0].nodeId === eastWay.geometry.at(-1).nodeId, 'Hjortneskaia way is no longer a closed polygon.');
const eastInterior = deterministicInteriorPoint(eastCoordinateGeometry);
assert(pointInPolygon(eastInterior, eastCoordinateGeometry), 'Derived Hjortneskaia anchor is outside polygon.');

const displayCoordinate = {
  lat: roundCoordinate(middleWay.midpoint.lat),
  lon: roundCoordinate(middleWay.midpoint.lon)
};
const westCoordinate = {
  lat: westWay.firstNode.lat,
  lon: westWay.firstNode.lon
};
const eastCoordinate = {
  lat: roundCoordinate(eastInterior.lat),
  lon: roundCoordinate(eastInterior.lon)
};
const westToMiddleMeters = haversineMeters(westCoordinate, displayCoordinate);
const middleToEastMeters = haversineMeters(displayCoordinate, eastCoordinate);
assert(westCoordinate.lon < displayCoordinate.lon && displayCoordinate.lon < eastCoordinate.lon, 'Anchor chain is not ordered west–middle–east.');
assert(westToMiddleMeters >= 300 && westToMiddleMeters <= 1500, `West–middle distance out of bounds: ${westToMiddleMeters}.`);
assert(middleToEastMeters >= 150 && middleToEastMeters <= 1200, `Middle–east distance out of bounds: ${middleToEastMeters}.`);

const manifest = JSON.parse(await readFile(join(root, 'data/places/manifest.json'), 'utf8'));
assert(Array.isArray(manifest.files), 'Place manifest files missing.');
const allActivePlaces = [];
for (const relativePath of manifest.files) {
  const fullPath = join(root, 'data', relativePath);
  let parsed;
  try {
    parsed = JSON.parse(await readFile(fullPath, 'utf8'));
  } catch {
    continue;
  }
  for (const place of extractPlaces(parsed)) {
    if (!place?.id || place.hidden || place.stub || place.meta?.status === 'disabled') continue;
    allActivePlaces.push({ ...place, sourceFile: relativePath });
  }
}
const exactIdRows = allActivePlaces.filter((place) => place.id === 'frognerstranda');
assert(exactIdRows.length >= 1, 'frognerstranda not active through manifest.');
const sourceObjectCollisions = allActivePlaces.filter((place) => place.id !== 'frognerstranda' && ['osm-way:118364891', 'osm-way:71423688', 'osm-way:1205417997'].includes(place.sourceObjectId));
assert(sourceObjectCollisions.length === 0, `Anchor source-object collision: ${JSON.stringify(sourceObjectCollisions.map((place) => ({ id: place.id, sourceObjectId: place.sourceObjectId, sourceFile: place.sourceFile })))}.`);
const veryClose = allActivePlaces
  .filter((place) => place.id !== 'frognerstranda' && Number.isFinite(place.lat) && Number.isFinite(place.lon))
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: haversineMeters(displayCoordinate, place), sourceFile: place.sourceFile }))
  .filter((place) => place.distanceMeters < 8)
  .sort((a, b) => a.distanceMeters - b.distanceMeters);
assert(veryClose.length === 0, `Unexpected active place within 8m of Frognerstranda display anchor: ${JSON.stringify(veryClose)}.`);
const nearby = allActivePlaces
  .filter((place) => place.id !== 'frognerstranda' && Number.isFinite(place.lat) && Number.isFinite(place.lon))
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(haversineMeters(displayCoordinate, place).toFixed(2)), sourceFile: place.sourceFile }))
  .filter((place) => place.distanceMeters < 250)
  .sort((a, b) => a.distanceMeters - b.distanceMeters);

const coordSource = 'Verifisert Frognerstranda multi-anchor waterfront; display-anchor OpenStreetMap way 71423688 – Frognerstranda; west scope anchor osm-way:118364891 – Tour de Finance; east scope anchor osm-way:1205417997 – Hjortneskaia';
const coordNote = `Batch 195 løser Frognerstranda som hele den langstrakte fjordsonen Oslo kommune avgrenser fra innerst i Frognerkilen/Bygdøy til Hjortnes/Framnes. Canonical lat/lon er det deterministiske lengdemidtpunktet på den eksakt navngitte offentlige gangveien Frognerstranda (OSM way 71423688), men punktet er bare display- og innsjekkingsanker. Fullt scope dokumenteres av en ordnet multi-anchor-kjede: Tour de Finance-way 118364891 i vest, Frognerstranda-way 71423688 i midten og det eksakt navngitte Hjortneskaia-polygonet way 1205417997 i øst. Radius 180 beholdes som lokal displayradius; den påstås ikke å dekke hele fjordsonen. E18, jernbanen, Hjortnes-busstoppet, én tilfeldig kystlinje og nærmeste/first-hit er ikke brukt som koordinatkilde.`;
const sourceHint = 'Oslo kommune definerer Frognerstranda som strandlinjen og det vestligste Fjordbyen-delområdet fra innerst i Frognerkilen/Bygdøy til Hjortnes/Framnes. Den eksakte Frognerstranda-gangveien brukes som sentralt displayanker; Tour de Finance og Hjortneskaia dokumenterer vestlig og østlig scope.';

const anchors = [
  {
    id: 'frognerstranda_west_frognerkilen',
    name: 'Frognerstranda – vest mot Frognerkilen',
    lat: westCoordinate.lat,
    lon: westCoordinate.lon,
    r: 110,
    type: 'line_anchor',
    role: 'west_scope_anchor',
    coordStatus: 'verified_geometry',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:118364891',
    sourceUrl: 'https://www.openstreetmap.org/way/118364891',
    note: 'Vestlig korridoranker på den eksakt navngitte offentlige gang-/sykkelforbindelsen Tour de Finance. Wayen krysser den eksakte Frognerstranda-gangveien i delt node 849847795 og strekker kjeden inn mot Frognerkilen.'
  },
  {
    id: 'frognerstranda_display',
    name: 'Frognerstranda – sentralt promenadeanker',
    lat: displayCoordinate.lat,
    lon: displayCoordinate.lon,
    r: 180,
    type: 'line_anchor',
    role: 'display_anchor',
    coordStatus: 'verified_geometry',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:71423688',
    sourceUrl: 'https://www.openstreetmap.org/way/71423688',
    note: `Deterministisk lengdemidtpunkt på den ${middleWay.lengthMeters.toFixed(1)} meter lange, eksakt navngitte offentlige gangveien Frognerstranda. Dette er canonical displayanker, ikke en proxy for hele fjordsonen.`
  },
  {
    id: 'frognerstranda_east_hjortneskaia',
    name: 'Frognerstranda – øst ved Hjortneskaia',
    lat: eastCoordinate.lat,
    lon: eastCoordinate.lon,
    r: 150,
    type: 'area_anchor',
    role: 'east_scope_anchor',
    coordStatus: 'verified_geometry',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:1205417997',
    sourceUrl: 'https://www.openstreetmap.org/way/1205417997',
    note: `Deterministisk innvendig områdeanker (${eastInterior.method}) i det eksakt navngitte Hjortneskaia-polygonet. Ankeret dokumenterer den østlige Hjortnes/Framnes-avgrensningen; busstoppet Hjortnes brukes ikke.`
  }
];

const updatedPlace = {
  ...child,
  lat: displayCoordinate.lat,
  lon: displayCoordinate.lon,
  r: 180,
  locatorType: 'linear_area',
  sourceProvider: 'osm',
  sourceObjectId: 'osm-way:71423688',
  sourceUrl: 'https://www.openstreetmap.org/way/71423688',
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordType: 'multi_anchor_linear_area_display_anchor',
  coordStatus: 'verified_geometry',
  coordSource,
  coordVerifiedAt: '2026-07-24',
  coordNote,
  sourceHint,
  anchors
};

aggregate[aggregateIndex] = updatedPlace;
await writeFile(aggregatePath, `${JSON.stringify(aggregate, null, 2)}\n`, 'utf8');
await writeFile(childPath, `${JSON.stringify(updatedPlace, null, 2)}\n`, 'utf8');

const evidence = {
  schemaVersion: '1.0',
  placeId: 'frognerstranda',
  placeFile: 'data/places/popkultur/oslo/places_oslo_populaerkultur.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: displayCoordinate.lat,
    lon: displayCoordinate.lon,
    r: 180,
    coordStatus: 'verified_geometry',
    coordSource,
    coordType: 'multi_anchor_linear_area_display_anchor',
    coordNote
  },
  identity: {
    currentName: 'Frognerstranda',
    resolvedIdentity: 'Frognerstranda som hele den langstrakte fjordsonen fra innerst i Frognerkilen/Bygdøy til Hjortnes/Framnes, modellert med en verifisert vest–midt–øst-kjede',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'linear_area',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Frognerstranda, Fjordbyen',
      sourceUrl: officialUrl,
      sourceObjectId: 'oslo-kommune:fjordbyen:frognerstranda',
      sourceQuality: 'official_full_linear_waterfront_scope',
      finding: 'Oslo kommune definerer Frognerstranda som en strandlinje fra innerst i Frognerkilen og Bygdøy i vest til Hjortnes/Framnes i øst, og som det vestligste delområdet av Fjordbyen. Havnepromenade og hovedsykkelvei inngår i samme område.',
      canVerifyCoordinate: false,
      reason: 'Fastsetter full identitet og endepunkter; de konkrete fysiske ankrene kommer fra live OSM-geometri.'
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo byleksikon – Frognerstranda',
      sourceUrl: byleksikonUrl,
      sourceObjectId: 'oslobyleksikon:frognerstranda',
      sourceQuality: 'documented_historical_route_and_promenade_scope',
      finding: 'Kilden beskriver Frognerstranda fra Filipstad til Sjølystveien, ytre del som strandpromenade for gående og syklende og Framnesbrygga som østlig krysningspunkt.',
      canVerifyCoordinate: false,
      reason: 'Dokumenterer funksjon og historisk utstrekning, men er ikke alene koordinatkilde.'
    },
    {
      sourceProvider: 'osm',
      sourceName: 'Vestlig scope-anker – Tour de Finance',
      sourceUrl: 'https://www.openstreetmap.org/way/118364891',
      sourceObjectId: 'osm-way:118364891',
      sourceQuality: 'verified_component_west_corridor_anchor',
      finding: 'Eksakt navngitt offentlig cycleway/foot-korridor som når inn mot Frognerkilen og deler node 849847795 med den navngitte Frognerstranda-gangveien.',
      canVerifyCoordinate: false,
      reason: 'Dokumenterer vestlig scope, men brukes ikke alene som canonical displaymarker.'
    },
    {
      sourceProvider: 'osm',
      sourceName: 'Sentralt displayanker – Frognerstranda',
      sourceUrl: 'https://www.openstreetmap.org/way/71423688',
      sourceObjectId: 'osm-way:71423688',
      sourceQuality: 'verified_component_display_anchor',
      finding: `Eksakt navngitt offentlig footway Frognerstranda, ${middleWay.lengthMeters.toFixed(1)} meter lang. Canonical lat/lon er det deterministiske lengdemidtpunktet på selve way-geometrien.`,
      canVerifyCoordinate: true,
      reason: 'Brukes som eksplisitt sentralt display-/innsjekkingsanker; resten av det brede fjordsonescope-et dokumenteres av hele anchor-kjeden.'
    },
    {
      sourceProvider: 'osm',
      sourceName: 'Østlig scope-anker – Hjortneskaia',
      sourceUrl: 'https://www.openstreetmap.org/way/1205417997',
      sourceObjectId: 'osm-way:1205417997',
      sourceQuality: 'verified_component_east_area_anchor',
      finding: `Eksakt navngitt Hjortneskaia-polygon med deterministisk innvendig områdeanker (${eastInterior.method}) i Hjortnes/Framnes-enden av kommunens scope.`,
      canVerifyCoordinate: false,
      reason: 'Dokumenterer østlig scope, men brukes ikke alene som canonical displaymarker.'
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: anchors.map((anchor) => ({
    sourceProvider: anchor.sourceProvider,
    sourceObjectId: anchor.sourceObjectId,
    canApplyToPlace: true
  })),
  geometryCandidates: [
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:118364891',
      lat: westCoordinate.lat,
      lon: westCoordinate.lon,
      coordRole: 'line_anchor',
      componentRole: 'west_scope_anchor',
      canApplyToPlace: true
    },
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:71423688',
      lat: displayCoordinate.lat,
      lon: displayCoordinate.lon,
      coordRole: 'line_anchor',
      componentRole: 'display_anchor',
      canApplyToPlace: true
    },
    {
      sourceProvider: 'osm',
      sourceObjectId: 'osm-way:1205417997',
      lat: eastCoordinate.lat,
      lon: eastCoordinate.lon,
      coordRole: 'area_anchor',
      componentRole: 'east_scope_anchor',
      canApplyToPlace: true
    }
  ],
  coordinateCandidates: [
    {
      lat: displayCoordinate.lat,
      lon: displayCoordinate.lon,
      coordRole: 'line_anchor',
      sourceObjectId: 'osm-way:71423688',
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Multi-anchor-kjeden er anvendt på hovedrecorden; Frognerstranda-wayens lengdemidtpunkt brukes som eksplisitt displayanker.'
  },
  notes: [coordNote]
};
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');

const civication = JSON.parse(await readFile(civicationPath, 'utf8'));
const mapping = civication.mappings?.map_frognerstranda;
assert(mapping?.historyGoPlaceId === 'frognerstranda', 'Civication Frognerstranda mapping missing.');
assert(mapping.lat === 59.9129 && mapping.lon === 10.7098, 'Civication legacy coordinate changed before batch 195.');
mapping.lat = displayCoordinate.lat;
mapping.lon = displayCoordinate.lon;
await writeFile(civicationPath, `${JSON.stringify(civication, null, 2)}\n`, 'utf8');

const protocolAppendix = `\n\n| 195 | \`frognerstranda\` | Frognerstranda | verified_geometry | \`osm-way:71423688\` |\n\nBatch 195 (2026-07-24) løser \`frognerstranda\` som hele den langstrakte fjordsonen Oslo kommune avgrenser fra innerst i Frognerkilen/Bygdøy til Hjortnes/Framnes. Recorden snevres ikke inn til én vestlig sti: canonical lat/lon er det deterministiske lengdemidtpunktet på den eksakt navngitte offentlige Frognerstranda-gangveien \`osm-way:71423688\`, men wayen brukes bare som sentralt display- og innsjekkingsanker. Fullt scope dokumenteres av en ordnet multi-anchor-kjede med Tour de Finance \`osm-way:118364891\` i vest, Frognerstranda-wayen i midten og det eksakt navngitte Hjortneskaia-polygonet \`osm-way:1205417997\` i øst. Hovedradius 180 beholdes som lokal displayradius og påstås ikke å dekke hele fjordsonen. E18, jernbanen, Hjortnes-busstoppet, én tilfeldig kystlinje og nearest/first-hit er eksplisitt ikke brukt som koordinatkilde.`;
await writeFile(protocolPath, `${protocol.trimEnd()}${protocolAppendix}\n`, 'utf8');

const result = {
  generatedAt: new Date().toISOString(),
  batch,
  placeId: 'frognerstranda',
  status: 'verified_geometry',
  identity: 'full_linear_waterfront_area',
  sourceObjectChain: ['osm-way:118364891', 'osm-way:71423688', 'osm-way:1205417997'],
  before: {
    lat: child.lat,
    lon: child.lon,
    r: child.r,
    locatorType: child.locatorType,
    coordStatus: child.coordStatus,
    coordSource: child.coordSource,
    coordType: child.coordType
  },
  after: {
    lat: displayCoordinate.lat,
    lon: displayCoordinate.lon,
    r: 180,
    locatorType: 'linear_area',
    coordStatus: 'verified_geometry',
    coordSource,
    coordType: 'multi_anchor_linear_area_display_anchor',
    sourceProvider: 'osm',
    sourceObjectId: 'osm-way:71423688',
    geocodeAccuracy: 'semantic_anchor',
    coordRole: 'line_anchor'
  },
  anchors,
  anchorDistancesMeters: {
    westToMiddle: Number(westToMiddleMeters.toFixed(2)),
    middleToEast: Number(middleToEastMeters.toFixed(2))
  },
  middleWayLengthMeters: middleWay.lengthMeters,
  eastInteriorMethod: eastInterior.method,
  nearbyActivePlacesWithin250M: nearby,
  sourceObjectCollisions: sourceObjectCollisions,
  radiusDecision: 'Preserve r=180 as local display/check-in radius; the multi-anchor chain documents the wider physical scope.',
  method: 'object-type-first full-scope linear-area model; deterministic midpoint on exact named Frognerstranda footway as display anchor; exact Tour de Finance and Hjortneskaia component anchors; no legacy point, nearest, first-hit, bus-stop, E18, railway or arbitrary coastline proxy'
};
await writeFile(join(reportDir, 'batch-195-result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
await writeFile(join(reportDir, 'README.md'), `# Oslo coordinate control batch 195 – Frognerstranda multi-anchor waterfront\n\nBatch 195 preserves Frognerstranda as the full long waterfront area defined by Oslo kommune.\n\n- canonical display anchor: \`osm-way:71423688\` midpoint at ${displayCoordinate.lat}, ${displayCoordinate.lon}\n- west scope anchor: \`osm-way:118364891\`\n- east scope anchor: \`osm-way:1205417997\`\n- locator type: \`linear_area\`\n- coordinate status: \`verified_geometry\`\n- radius: 180 m, preserved as local display/check-in radius\n- west→middle distance: ${westToMiddleMeters.toFixed(2)} m\n- middle→east distance: ${middleToEastMeters.toFixed(2)} m\n\nThe exact named footway is not presented as the whole place. Full scope is documented by the ordered three-anchor chain and the official Frognerkilen/Bygdøy→Hjortnes/Framnes definition.\n`, 'utf8');
await writeFile(join(reportDir, 'sources.md'), `# Sources\n\n- Oslo kommune: ${officialUrl}\n- Oslo byleksikon: ${byleksikonUrl}\n- West anchor: https://www.openstreetmap.org/way/118364891\n- Display anchor: https://www.openstreetmap.org/way/71423688\n- East anchor: https://www.openstreetmap.org/way/1205417997\n- Merged research: reports/oslo-coordinate-frognerstranda-multi-anchor-chain-post-194/summary.json\n`, 'utf8');

console.log(JSON.stringify({
  batch,
  placeId: 'frognerstranda',
  before: result.before,
  after: result.after,
  anchors: anchors.map(({ id, sourceObjectId, lat, lon, role }) => ({ id, sourceObjectId, lat, lon, role })),
  anchorDistancesMeters: result.anchorDistancesMeters,
  nearbyActivePlacesWithin250M: nearby,
  protocolMaxBefore: 194,
  protocolMaxAfter: 195
}, null, 2));
