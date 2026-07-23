#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-164-oset-slusebru-topology-research');
fs.mkdirSync(reportDir, { recursive: true });

const USER_AGENT = 'History-Go-coordinate-control/1.0 (https://github.com/Paradispartiet/History-Go)';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchText(url, attempts = 3, options = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: '*/*', ...(options.headers || {}) },
        method: options.method || 'GET',
        body: options.body,
        signal: AbortSignal.timeout(60000),
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1800 * attempt);
    }
  }
  throw lastError;
}

async function fetchJson(url, attempts = 3, options = {}) {
  return JSON.parse(await fetchText(url, attempts, options));
}

function haversine(a, b) {
  const R = 6371000;
  const toRad = (deg) => deg * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function centerOfGeometry(geometry = []) {
  if (!geometry.length) return null;
  return {
    lat: geometry.reduce((sum, p) => sum + p.lat, 0) / geometry.length,
    lon: geometry.reduce((sum, p) => sum + p.lon, 0) / geometry.length,
  };
}

const bbox = '59.962,10.748,59.982,10.798';
const overpassQuery = `[out:json][timeout:45];\n(\n  way["bridge"](${bbox});\n  way["man_made"="bridge"](${bbox});\n  way["waterway"="dam"](${bbox});\n  way["waterway"="river"](${bbox});\n  way["waterway"="stream"](${bbox});\n  nwr["name"~"Oset|Maridals|Akerselva|Grønvold|Brekke",i](${bbox});\n);\nout body geom;`;

const endpoints = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
let data;
let usedEndpoint;
let lastError;
for (const endpoint of endpoints) {
  try {
    const body = new URLSearchParams({ data: overpassQuery }).toString();
    data = await fetchJson(endpoint, 2, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    usedEndpoint = endpoint;
    break;
  } catch (error) {
    lastError = String(error?.message || error);
  }
}
if (!data) throw new Error(`Overpass failed: ${lastError}`);

const ways = (data.elements || []).filter((e) => e.type === 'way');
const bridges = ways.filter((e) => e.tags?.bridge || e.tags?.man_made === 'bridge');
const dams = ways.filter((e) => e.tags?.waterway === 'dam');
const waterways = ways.filter((e) => e.tags?.waterway === 'river' || e.tags?.waterway === 'stream');
const akerselva = waterways.filter((e) => String(e.tags?.name || '').toLocaleLowerCase('nb-NO') === 'akerselva');

const bridgeSummaries = bridges.map((bridge) => {
  const center = bridge.center || centerOfGeometry(bridge.geometry);
  const sharedRiverNodes = akerselva.flatMap((river) => {
    const bridgeNodes = new Set(bridge.nodes || []);
    return (river.nodes || []).filter((nodeId) => bridgeNodes.has(nodeId)).map((nodeId) => ({ riverWayId: river.id, nodeId }));
  });
  const riverDistances = akerselva.map((river) => {
    const riverCenter = river.center || centerOfGeometry(river.geometry);
    return riverCenter && center ? { riverWayId: river.id, centerDistanceM: Number(haversine(center, riverCenter).toFixed(1)) } : null;
  }).filter(Boolean).sort((a, b) => a.centerDistanceM - b.centerDistanceM);
  return {
    osmWayId: bridge.id,
    tags: bridge.tags || {},
    nodeIds: bridge.nodes || [],
    center,
    sharedRiverNodes,
    nearestNamedAkerselvaWay: riverDistances[0] || null,
    pedestrianLike: ['footway', 'path', 'pedestrian'].includes(bridge.tags?.highway),
    vehicleLike: ['service', 'residential', 'unclassified', 'tertiary', 'secondary', 'primary'].includes(bridge.tags?.highway),
    woodLike: bridge.tags?.surface === 'wood' || bridge.tags?.material === 'wood',
  };
});

const outletCandidates = bridgeSummaries
  .filter((bridge) => bridge.center && bridge.center.lat >= 59.962 && bridge.center.lat <= 59.978)
  .sort((a, b) => b.center.lat - a.center.lat);

const candidatePairs = [];
for (const pedestrian of outletCandidates.filter((b) => b.pedestrianLike)) {
  for (const vehicle of outletCandidates.filter((b) => b.vehicleLike)) {
    if (!pedestrian.center || !vehicle.center) continue;
    const distanceM = haversine(pedestrian.center, vehicle.center);
    const pedestrianDownstream = pedestrian.center.lat < vehicle.center.lat;
    if (distanceM <= 250 && pedestrianDownstream) {
      candidatePairs.push({
        slusebruCandidateWayId: pedestrian.osmWayId,
        anleggsbruCandidateWayId: vehicle.osmWayId,
        distanceM: Number(distanceM.toFixed(1)),
        pedestrianDownstream,
        pedestrianTags: pedestrian.tags,
        vehicleTags: vehicle.tags,
        pedestrianCenter: pedestrian.center,
        vehicleCenter: vehicle.center,
      });
    }
  }
}

const uniqueStrictPairs = candidatePairs.filter((pair) => {
  const pedestrian = outletCandidates.find((b) => b.osmWayId === pair.slusebruCandidateWayId);
  return pedestrian?.woodLike || pedestrian?.tags?.lit || pedestrian?.tags?.foot === 'designated';
});

for (const bridge of outletCandidates) {
  const url = `https://api.openstreetmap.org/api/0.6/way/${bridge.osmWayId}/full`;
  try {
    const xml = await fetchText(url);
    fs.writeFileSync(path.join(reportDir, `osm-way-${bridge.osmWayId}-full.xml`), xml);
  } catch (error) {
    fs.writeFileSync(path.join(reportDir, `osm-way-${bridge.osmWayId}-fetch-error.txt`), `${String(error?.message || error)}\n`);
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  placeId: 'frysjadammen',
  bbox,
  overpassEndpoint: usedEndpoint,
  counts: {
    ways: ways.length,
    bridges: bridges.length,
    dams: dams.length,
    waterways: waterways.length,
    namedAkerselvaWays: akerselva.length,
    outletBridgeCandidates: outletCandidates.length,
    candidatePairs: candidatePairs.length,
    strictPairs: uniqueStrictPairs.length,
  },
  dams: dams.map((dam) => ({ id: dam.id, tags: dam.tags || {}, center: dam.center || centerOfGeometry(dam.geometry), nodes: dam.nodes || [] })),
  akerselvaWays: akerselva.map((river) => ({ id: river.id, tags: river.tags || {}, center: river.center || centerOfGeometry(river.geometry), nodes: river.nodes || [] })),
  outletBridgeCandidates: outletCandidates,
  candidatePairs,
  strictPairs: uniqueStrictPairs,
  decision: {
    sourceIdentity: 'Oset slusebru is documented as the pedestrian bridge immediately downstream of Oset anleggsbru at the Maridalsvannet outlet.',
    productionReady: uniqueStrictPairs.length === 1,
    selectedPair: uniqueStrictPairs.length === 1 ? uniqueStrictPairs[0] : null,
    nextAction: uniqueStrictPairs.length === 1
      ? 'Use the unique downstream pedestrian bridge as the exact physical anchor for the corrected Maridalsoset record, with the upstream vehicle bridge stored as topology crosscheck.'
      : 'Inspect the bounded bridge set; do not select by nearest distance alone.',
  },
};

fs.writeFileSync(path.join(reportDir, 'topology-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-query.txt'), `${overpassQuery}\n`);
fs.writeFileSync(path.join(reportDir, 'overpass-response.json'), `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'sources.md'), `# Batch 164 Oset topology research\n\n- Oslo byleksikon – Oset slusebru: https://oslobyleksikon.no/side/Oset_slusebru\n- Oslo byleksikon – Oset anleggsbru: https://oslobyleksikon.no/side/Oset_anleggsbru\n- Oslo byleksikon – Akerselva: https://oslobyleksikon.no/side/Akerselva\n- Fresh bounded OSM topology is stored in this directory.\n`);

console.log(JSON.stringify({
  batch: 164,
  counts: summary.counts,
  selectedPair: summary.decision.selectedPair,
  productionReady: summary.decision.productionReady,
  nextAction: summary.decision.nextAction,
}, null, 2));
