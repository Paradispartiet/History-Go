#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const date = '2026-07-23';
const abs = (file) => path.join(root, file);
const readJson = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const gitShow = (ref, file) => execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8', maxBuffer: 80 * 1024 * 1024 });
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(abs(file))).digest('hex');

// First apply the already validated batch-164 exact-main replay logic.
const batch164ReplayCommit = 'dcb7a6e3205e0879ad0e7c1e51fe529d76e5c2bc';
const batch164Source = execFileSync('git', ['show', `${batch164ReplayCommit}:scripts/coordinate-branch-job.mjs`], {
  encoding: 'utf8',
  maxBuffer: 50 * 1024 * 1024,
});
const batch164Temp = path.join('/tmp', `history-go-batch-164-replay-${Date.now()}.mjs`);
fs.writeFileSync(batch164Temp, batch164Source);
await import(`${pathToFileURL(batch164Temp).href}?v=${Date.now()}`);

// Batch 165: resolve the canonical elveparti below Nydalsdammen through direct outflow topology.
const batch = 165;
const placeId = 'stilla_nydalen';
const researchRef = 'origin/agent/oslo-coordinate-control-batch-165-nydalsdammen-outflow-research';
const researchFile = 'reports/oslo-coordinate-control-batch-165-nydalsdammen-outflow-research/topology-summary.json';
const aggregateFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const childFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/stilla_nydalen.json';
const indexFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const manifestFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const evidenceFile = 'data/coordinate-evidence/oslo/natur/stilla_nydalen.json';
const protocolFile = 'docs/coordinates/coordinate-control-protocol.md';
const reportDir = 'reports/oslo-coordinate-control-batch-165-nydalsdammen-outflow-production';

const research = JSON.parse(gitShow(researchRef, researchFile));
if (research?.reservoir?.osmRelationId !== 14637129 || research?.reservoir?.boundaryNodeCount < 1) {
  throw new Error('Batch 165 research does not contain a valid Nydalsdammen boundary');
}
const outletCandidates = (research.directReservoirOutflows || []).filter((river) =>
  river.osmWayId === 66098212 &&
  river.startNodeId === '802312309' &&
  river.sharedReservoirNodeIds?.includes('802312309') &&
  river.lengthM > 100 && river.lengthM < 500
);
if (outletCandidates.length !== 1) throw new Error(`Expected one direct Nydalsdammen outflow way, found ${outletCandidates.length}`);
const upstreamCandidates = (research.directReservoirOutflows || []).filter((river) =>
  river.osmWayId === 1456110817 &&
  river.sharedReservoirNodeIds?.includes(river.endNodeId) &&
  river.lengthM > 2000
);
if (upstreamCandidates.length !== 1) throw new Error('Could not reproduce the upstream Akerselva inflow relationship to Nydalsdammen');
const damResearch = (research.structures || []).find((item) =>
  item.osmWayId === 66098763 &&
  item.tags?.waterway === 'dam' &&
  item.sharedReservoirNodeIds?.includes('802312309') &&
  item.sharedRiverNodeIds?.includes('802312309')
);
if (!damResearch) throw new Error('Could not reproduce Nydalsdammen dam/outflow shared-node topology');

const USER_AGENT = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';
async function fetchText(url, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/xml,text/xml,*/*' },
        signal: AbortSignal.timeout(45000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError;
}
const parseAttrs = (text) => Object.fromEntries([...text.matchAll(/([:\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
function parseWayXml(xml, expectedWayId) {
  const nodeMap = new Map();
  for (const match of xml.matchAll(/<node\b([^>]*)\/?\s*>/g)) {
    const attrs = parseAttrs(match[1]);
    if (attrs.id && attrs.lat !== undefined && attrs.lon !== undefined) {
      nodeMap.set(attrs.id, { id: attrs.id, lat: Number(attrs.lat), lon: Number(attrs.lon) });
    }
  }
  const wayMatch = [...xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)]
    .find((match) => parseAttrs(match[1]).id === String(expectedWayId));
  if (!wayMatch) throw new Error(`Could not find way ${expectedWayId}`);
  const refs = [...wayMatch[2].matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((entry) => parseAttrs(entry[1]).ref).filter(Boolean);
  const tags = Object.fromEntries([...wayMatch[2].matchAll(/<tag\b([^>]*)\/?\s*>/g)]
    .map((entry) => parseAttrs(entry[1])).filter((attrs) => attrs.k !== undefined).map((attrs) => [attrs.k, attrs.v || '']));
  const coordinates = refs.map((ref) => nodeMap.get(ref)).filter(Boolean);
  if (coordinates.length !== refs.length || coordinates.length < 2) throw new Error(`Incomplete geometry for way ${expectedWayId}`);
  return { id: expectedWayId, refs, tags, coordinates };
}
function parseRelationBoundary(xml, relationId) {
  const wayMap = new Map();
  for (const match of xml.matchAll(/<way\b([^>]*)>([\s\S]*?)<\/way>/g)) {
    const attrs = parseAttrs(match[1]);
    if (!attrs.id) continue;
    const refs = [...match[2].matchAll(/<nd\b([^>]*)\/?\s*>/g)].map((entry) => parseAttrs(entry[1]).ref).filter(Boolean);
    wayMap.set(attrs.id, refs);
  }
  const relation = [...xml.matchAll(/<relation\b([^>]*)>([\s\S]*?)<\/relation>/g)]
    .find((match) => parseAttrs(match[1]).id === String(relationId));
  if (!relation) throw new Error(`Relation ${relationId} not found`);
  const memberWayIds = [...relation[2].matchAll(/<member\b([^>]*)\/?\s*>/g)]
    .map((entry) => parseAttrs(entry[1])).filter((attrs) => attrs.type === 'way' && attrs.ref).map((attrs) => attrs.ref);
  const boundaryNodes = new Set();
  for (const wayId of memberWayIds) for (const ref of wayMap.get(wayId) || []) boundaryNodes.add(ref);
  return { memberWayIds, boundaryNodes };
}
function haversine(a, b) {
  const R = 6371000;
  const rad = (degree) => degree * Math.PI / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function lineLength(coordinates) {
  let total = 0;
  for (let i = 1; i < coordinates.length; i += 1) total += haversine(coordinates[i - 1], coordinates[i]);
  return total;
}
function lineMidpoint(coordinates) {
  const lengths = coordinates.slice(1).map((point, index) => haversine(coordinates[index], point));
  const total = lengths.reduce((sum, value) => sum + value, 0);
  const half = total / 2;
  let walked = 0;
  for (let index = 0; index < lengths.length; index += 1) {
    const segment = lengths[index];
    if (walked + segment >= half) {
      const ratio = (half - walked) / segment;
      const a = coordinates[index];
      const b = coordinates[index + 1];
      return {
        lat: a.lat + ratio * (b.lat - a.lat),
        lon: a.lon + ratio * (b.lon - a.lon),
        totalLengthM: total,
      };
    }
    walked += segment;
  }
  throw new Error('Could not calculate line midpoint');
}

const reservoirRelationId = 14637129;
const outflowWayId = 66098212;
const upstreamWayId = 1456110817;
const damWayId = 66098763;
const outletNodeId = '802312309';
const [reservoirXml, outflowXml, upstreamXml, damXml] = await Promise.all([
  fetchText(`https://api.openstreetmap.org/api/0.6/relation/${reservoirRelationId}/full`),
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${outflowWayId}/full`),
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${upstreamWayId}/full`),
  fetchText(`https://api.openstreetmap.org/api/0.6/way/${damWayId}/full`),
]);
const reservoir = parseRelationBoundary(reservoirXml, reservoirRelationId);
const outflow = parseWayXml(outflowXml, outflowWayId);
const upstream = parseWayXml(upstreamXml, upstreamWayId);
const dam = parseWayXml(damXml, damWayId);
if (outflow.tags.name !== 'Akerselva' || outflow.tags.waterway !== 'river') throw new Error('Fresh outflow way is no longer exact Akerselva river geometry');
if (outflow.refs[0] !== outletNodeId || !reservoir.boundaryNodes.has(outletNodeId)) throw new Error('Fresh outflow no longer starts at the Nydalsdammen boundary node');
if (dam.tags.waterway !== 'dam' || !dam.refs.includes(outletNodeId)) throw new Error('Fresh dam way no longer shares the outflow node');
if (upstream.tags.name !== 'Akerselva' || upstream.refs.at(-1) !== '7876345294' || !reservoir.boundaryNodes.has(upstream.refs.at(-1))) {
  throw new Error('Fresh upstream Akerselva way no longer ends at the opposite Nydalsdammen boundary');
}
const outflowLengthM = lineLength(outflow.coordinates);
if (outflowLengthM < 150 || outflowLengthM > 175) throw new Error(`Unexpected fresh outflow length ${outflowLengthM.toFixed(1)} m`);
const midpoint = lineMidpoint(outflow.coordinates);

const oldPlace = readJson(childFile);
if (oldPlace.id !== placeId || oldPlace.coordStatus !== 'needs_source') throw new Error(`${placeId} is no longer unresolved on this production base`);
if (oldPlace.name !== 'Elvepartiet nedenfor Nydalsdammen') throw new Error(`Unexpected canonical display identity: ${oldPlace.name}`);
const place = structuredClone(oldPlace);
place.lat = midpoint.lat;
place.lon = midpoint.lon;
place.locatorType = 'route';
place.sourceProvider = 'osm';
place.sourceObjectId = `osm-way:${outflowWayId}`;
place.geocodeAccuracy = 'semantic_anchor';
place.coordRole = 'line_anchor';
place.coordType = 'direct_outflow_segment_anchor';
place.coordStatus = 'verified_geometry';
place.coordSource = `OpenStreetMap way ${outflowWayId} – first downstream Akerselva segment from Nydalsdammen outlet node ${outletNodeId}`;
place.coordSourceId = `osm-way:${outflowWayId}`;
place.coordSourceUrl = `https://www.openstreetmap.org/way/${outflowWayId}`;
place.coordVerifiedAt = date;
place.coordNote = `Batch 165 løser den korrigerte identiteten Elvepartiet nedenfor Nydalsdammen med direkte vassdragstopologi. Fresh OSM way ${outflowWayId} er eksakt name=Akerselva/waterway=river, starter i node ${outletNodeId}, og samme node ligger både i verified Nydalsdammen relation ${reservoirRelationId} og dam way ${damWayId}. Wayen er ${outflowLengthM.toFixed(1)} meter lang og representerer dermed en lokal første nedstrømsstrekning; canonical lat/lon er det deterministiske lengdemidtpunktet langs hele wayen. Den andre Akerselva-wayen som møter Nydalsdammen, way ${upstreamWayId}, slutter ved magasinets andre grensenode og er 2,3 km lang oppstrømsinnløp, ikke kandidat for dette stedet. Den tekniske ID-en stilla_nydalen beholdes for kompatibilitet, men historiske Stilla lenger nord brukes ikke som proxy. Legacy-punktet og nearest/first-hit brukes ikke.`;
place.outflowScope = {
  method: 'direct_reservoir_outflow_shared_node',
  reservoirRelationId,
  damWayId,
  outflowWayId,
  outletNodeId,
  upstreamInflowWayId: upstreamWayId,
  outflowLengthM: Number(outflowLengthM.toFixed(1)),
  displayAnchorMethod: 'deterministic_length_midpoint',
  excludedLegacyIdentity: 'Historiske Stilla-badekulper lenger nord i Akerselva',
};

const aggregate = readJson(aggregateFile);
if (aggregate.filter((entry) => entry?.id === placeId).length !== 1) throw new Error(`${placeId} must exist exactly once in aggregate`);
writeJson(aggregateFile, aggregate.map((entry) => entry?.id === placeId ? place : entry));
writeJson(childFile, place);

const index = readJson(indexFile);
const indexRow = index.find((row) => row?.id === placeId);
if (!indexRow) throw new Error(`${placeId} missing from split index`);
for (const key of [
  'name', 'lat', 'lon', 'r', 'year', 'coordStatus', 'coordType', 'locatorType', 'sourceProvider',
  'sourceObjectId', 'geocodeAccuracy', 'coordRole', 'coordSource', 'coordSourceId', 'coordSourceUrl',
  'coordVerifiedAt', 'coordNote',
]) if (place[key] !== undefined) indexRow[key] = place[key];
writeJson(indexFile, index);

const manifest = readJson(manifestFile);
const manifestRow = (manifest.places || []).find((row) => row?.id === placeId);
if (!manifestRow) throw new Error(`${placeId} missing from split manifest`);
manifest.source_sha256 = sha256File(aggregateFile);
manifest.generated_at = new Date().toISOString();
manifestRow.name = place.name;
manifestRow.sha256 = sha256File(childFile);
writeJson(manifestFile, manifest);

const note = place.coordNote;
writeJson(evidenceFile, {
  schemaVersion: '1.0',
  placeId,
  placeFile: aggregateFile,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: place.lat, lon: place.lon, r: place.r, coordStatus: place.coordStatus,
    coordSource: place.coordSource, coordType: place.coordType, coordNote: note,
  },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'Akerselva-strekningen direkte nedenfor Nydalsdammen',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'route',
    requiresSplit: false,
    splitReason: '',
  },
  requiredEvidence: [],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap – Nydalsdammen relation, dam and direct Akerselva outflow',
      sourceUrl: place.coordSourceUrl,
      sourceObjectId: place.sourceObjectId,
      sourceQuality: 'direct_shared_node_outflow_geometry',
      finding: `Way ${outflowWayId} starts at node ${outletNodeId}, shared with Nydalsdammen relation ${reservoirRelationId} and dam way ${damWayId}, and continues ${outflowLengthM.toFixed(1)} m downstream as exact named Akerselva geometry.`,
      canVerifyCoordinate: true,
      reason: 'The place is the local river section immediately below the reservoir; the exact first downstream way is topologically connected to the verified reservoir and dam at its start node.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${outflowWayId}`, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: `osm-relation:${reservoirRelationId}`, canApplyToPlace: false, role: 'upstream_boundary' },
    { sourceProvider: 'osm', sourceObjectId: `osm-way:${damWayId}`, canApplyToPlace: false, role: 'outlet_topology_crosscheck' },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'osm', sourceObjectId: `osm-way:${outflowWayId}`,
      geometryRole: 'direct_outflow_route_segment', canApplyToPlace: true,
      segmentScope: place.outflowScope,
    },
  ],
  coordinateCandidates: [
    {
      lat: place.lat, lon: place.lon, geocodeAccuracy: place.geocodeAccuracy,
      coordRole: place.coordRole, sourceObjectId: place.sourceObjectId, canApplyToPlace: true,
    },
  ],
  decision: { canBecomeVerified: true, blockedReason: '', nextAction: 'Applied to canonical place.' },
  notes: [note],
});

let protocol = fs.readFileSync(abs(protocolFile), 'utf8');
protocol = protocol.replace(/^Sist oppdatert: .*$/m, `Sist oppdatert: ${date}`);
if (!protocol.includes(`| ${batch} | \`${placeId}\``)) {
  protocol = protocol.replace(
    /Oslo-protokollen dekker nå (\d+) aktive current `verified\*` canonical Oslo-steder\./,
    (_, count) => `Oslo-protokollen dekker nå ${Number(count) + 1} aktive current \`verified*\` canonical Oslo-steder.`,
  );
  const insertion = `| ${batch} | \`${placeId}\` | ${place.name} | verified_geometry | \`osm-way:${outflowWayId}\` |\n\nBatch ${batch} (${date}) løser den siste unresolved Akerselva-routeposten med direkte utløpstopologi. Verified Nydalsdammen relation ${reservoirRelationId}, dam way ${damWayId} og exact name=Akerselva way ${outflowWayId} deler node ${outletNodeId}; river-wayen starter i denne noden og fortsetter ${outflowLengthM.toFixed(1)} meter nedstrøms. Den andre Akerselva-wayen som møter magasinet, way ${upstreamWayId}, slutter ved magasinets andre grensenode og representerer det lange oppstrøms innløpet. Canonical lat/lon er det deterministiske lengdemidtpunktet på den lokale outflow-wayen. Den tekniske ID-en \`stilla_nydalen\` beholdes, men historiske Stilla-badekulper lenger nord brukes ikke som identitet eller koordinatproxy; legacy-punkt og nearest/first-hit brukes ikke.\n\n`;
  const marker = 'Retrospektiv compliance-audit batch 1–120';
  const markerIndex = protocol.indexOf(marker);
  if (markerIndex < 0) throw new Error('Could not find protocol insertion marker');
  protocol = `${protocol.slice(0, markerIndex)}${insertion}${protocol.slice(markerIndex)}`;
}
protocol = protocol.split('\n').filter((line) => !(line.includes(`\`${placeId}\``) && line.includes('needs_review'))).join('\n');
fs.writeFileSync(abs(protocolFile), protocol);

fs.mkdirSync(abs(reportDir), { recursive: true });
fs.writeFileSync(abs(`${reportDir}/osm-relation-${reservoirRelationId}-full.xml`), reservoirXml);
fs.writeFileSync(abs(`${reportDir}/osm-way-${outflowWayId}-full.xml`), outflowXml);
fs.writeFileSync(abs(`${reportDir}/osm-way-${upstreamWayId}-full.xml`), upstreamXml);
fs.writeFileSync(abs(`${reportDir}/osm-way-${damWayId}-full.xml`), damXml);
fs.writeFileSync(abs(`${reportDir}/topology-research-summary.json`), `${JSON.stringify(research, null, 2)}\n`);
fs.writeFileSync(abs(`${reportDir}/sources.md`), `# Batch 165 sources\n\n- Verified Nydalsdammen geometry: OSM relation ${reservoirRelationId}.\n- Direct downstream Akerselva geometry: OSM way ${outflowWayId}.\n- Nydalsdammen dam topology: OSM way ${damWayId}.\n- Upstream Akerselva comparison: OSM way ${upstreamWayId}.\n- Fresh OSM API XML and the topology research snapshot are stored in this directory.\n`);
writeJson(`${reportDir}/batch-165-result.json`, {
  generatedAt: new Date().toISOString(),
  batch,
  placeId,
  name: place.name,
  oldCoordinate: { lat: oldPlace.lat, lon: oldPlace.lon },
  newCoordinate: { lat: place.lat, lon: place.lon },
  sourceProvider: place.sourceProvider,
  sourceObjectId: place.sourceObjectId,
  reservoirRelationId,
  damWayId,
  outletNodeId,
  upstreamInflowWayId: upstreamWayId,
  outflowLengthM: Number(outflowLengthM.toFixed(1)),
  status: place.coordStatus,
  coordType: place.coordType,
});

console.log(JSON.stringify({
  batches: [164, 165],
  batch165: {
    placeId,
    name: place.name,
    coordinate: { lat: place.lat, lon: place.lon },
    sourceObjectId: place.sourceObjectId,
    outflowLengthM: Number(outflowLengthM.toFixed(1)),
    status: place.coordStatus,
  },
}, null, 2));
