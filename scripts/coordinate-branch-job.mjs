import fs from 'node:fs';
import path from 'node:path';

const OUT = 'reports/visitoslo-galleries-audit-20260723/distinct-anchor-research';
const writeJson = (name, value) => fs.writeFileSync(path.join(OUT, name), `${JSON.stringify(value, null, 2)}\n`);
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(OUT, name), 'utf8'));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'History-Go-coordinate-research/1.0 (Paradispartiet/History-Go)',
      'Accept': 'application/json,*/*',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { ok: response.ok, status: response.status, url: response.url, json, text };
}

async function overpass(query) {
  return fetchJson('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ data: query }).toString()
  });
}

const rad = (x) => x * Math.PI / 180;
function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lon, yi = polygon[i].lat;
    const xj = polygon[j].lon, yj = polygon[j].lat;
    const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
      (point.lon < (xj - xi) * (point.lat - yi) / ((yj - yi) || 1e-15) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function centerOfGeometry(geometry = []) {
  if (!geometry.length) return null;
  return {
    lat: geometry.reduce((s, p) => s + p.lat, 0) / geometry.length,
    lon: geometry.reduce((s, p) => s + p.lon, 0) / geometry.length
  };
}

const romAddress = { lat: 59.92065765555904, lon: 10.751597362221323 };
const softAddress = { lat: 59.90951628354778, lon: 10.74209892031479 };

// Fetch exact road ways with node ids so shared intersection nodes can be resolved without geometric guessing.
const romRoads = await overpass(`[out:json][timeout:60];
(
  way(around:500,${romAddress.lat},${romAddress.lon})["name"="Maridalsveien"]["highway"];
  way(around:500,${romAddress.lat},${romAddress.lon})["name"="Brenneriveien"]["highway"];
);
out body;`);
await sleep(1200);
const roadElements = romRoads.json?.elements || [];
const maridalsWays = roadElements.filter((e) => e.type === 'way' && e.tags?.name === 'Maridalsveien');
const brenneriWays = roadElements.filter((e) => e.type === 'way' && e.tags?.name === 'Brenneriveien');
const maridalsNodes = new Set(maridalsWays.flatMap((e) => e.nodes || []));
const brenneriNodes = new Set(brenneriWays.flatMap((e) => e.nodes || []));
const sharedRoadNodeIds = [...maridalsNodes].filter((id) => brenneriNodes.has(id));
let sharedRoadNodes = [];
if (sharedRoadNodeIds.length) {
  const nodeQuery = `[out:json][timeout:30];node(id:${sharedRoadNodeIds.join(',')});out body;`;
  const result = await overpass(nodeQuery);
  sharedRoadNodes = (result.json?.elements || []).map((e) => ({ id: e.id, lat: e.lat, lon: e.lon, tags: e.tags || {} }));
  await sleep(1200);
}

// Fetch building geometry and entrance nodes close enough to the ROM property.
const romBuildingsResult = await overpass(`[out:json][timeout:60];
(
  way(around:180,${romAddress.lat},${romAddress.lon})["building"];
  relation(around:180,${romAddress.lat},${romAddress.lon})["building"];
  node(around:180,${romAddress.lat},${romAddress.lon})["entrance"];
);
out body center tags geom;`);
await sleep(1200);
const romElements = romBuildingsResult.json?.elements || [];
const romEntrances = romElements.filter((e) => e.type === 'node' && e.tags?.entrance).map((e) => ({
  id: e.id, lat: e.lat, lon: e.lon, tags: e.tags,
  distanceToAddressM: Number(distanceMeters(romAddress, e).toFixed(2)),
  nearestOfficialIntersectionM: sharedRoadNodes.length ? Number(Math.min(...sharedRoadNodes.map((n) => distanceMeters(n, e))).toFixed(2)) : null
}));
const romBuildings = romElements.filter((e) => ['way','relation'].includes(e.type) && e.tags?.building).map((e) => ({
  type: e.type,
  id: e.id,
  tags: e.tags,
  center: e.center || centerOfGeometry(e.geometry),
  nodeIds: e.nodes || [],
  bounds: e.bounds || null,
  geometry: e.geometry || []
}));
for (const entrance of romEntrances) {
  entrance.memberOfBuildingIds = romBuildings.filter((b) => b.nodeIds.includes(entrance.id)).map((b) => `osm:${b.type}/${b.id}`);
}

// Fetch SOFT's containing building and entrance nodes. Matching entrance node membership is stronger than nearest-point guessing.
const softBuildingsResult = await overpass(`[out:json][timeout:60];
(
  way(around:100,${softAddress.lat},${softAddress.lon})["building"];
  relation(around:100,${softAddress.lat},${softAddress.lon})["building"];
  node(around:100,${softAddress.lat},${softAddress.lon})["entrance"];
  way(around:120,${softAddress.lat},${softAddress.lon})["highway"]["name"];
);
out body center tags geom;`);
const softElements = softBuildingsResult.json?.elements || [];
const softBuildings = softElements.filter((e) => ['way','relation'].includes(e.type) && e.tags?.building).map((e) => ({
  type: e.type,
  id: e.id,
  tags: e.tags,
  center: e.center || centerOfGeometry(e.geometry),
  nodeIds: e.nodes || [],
  bounds: e.bounds || null,
  geometry: e.geometry || []
}));
const softContainingBuildings = softBuildings.filter((b) => b.geometry?.length >= 3 && pointInPolygon(softAddress, b.geometry));
const softEntrances = softElements.filter((e) => e.type === 'node' && e.tags?.entrance).map((e) => ({
  id: e.id, lat: e.lat, lon: e.lon, tags: e.tags,
  distanceToAddressM: Number(distanceMeters(softAddress, e).toFixed(2)),
  memberOfContainingBuildingIds: softContainingBuildings.filter((b) => b.nodeIds.includes(e.id)).map((b) => `osm:${b.type}/${b.id}`),
  memberOfAnyBuildingIds: softBuildings.filter((b) => b.nodeIds.includes(e.id)).map((b) => `osm:${b.type}/${b.id}`)
}));
const softRoads = softElements.filter((e) => e.type === 'way' && e.tags?.highway && e.tags?.name).map((e) => ({
  id: e.id,
  name: e.tags.name,
  geometry: e.geometry || [],
  bounds: e.bounds || null
}));

// Retry Kartverket's public WFS in GML and explicitly request the FeatureTypeList section.
const capsSectionsUrl = 'https://wfs.geonorge.no/skwms1/wfs.matrikkelen-bygningspunkt?service=WFS&Request=GetCapabilities&Sections=FeatureTypeList';
const capsResponse = await fetch(capsSectionsUrl, { headers: { 'User-Agent': 'History-Go-coordinate-research/1.0' } });
const capsText = await capsResponse.text();
fs.writeFileSync(path.join(OUT, 'kartverket-bygningspunkt-featuretypes.xml'), capsText);
const typeNames = [...capsText.matchAll(/<(?:\w+:)?Name>([^<]+)<\/(?:\w+:)?Name>/g)].map((m) => m[1]).filter((name) => !['WFS','GetCapabilities','GetFeature'].includes(name));

async function fetchWfsGml(name, bbox) {
  const tried = [];
  for (const typeName of [...new Set(typeNames)]) {
    const params = new URLSearchParams({
      service: 'WFS', version: '2.0.0', request: 'GetFeature', typeNames: typeName,
      bbox: `${bbox.join(',')},urn:ogc:def:crs:EPSG::4326`,
      srsName: 'urn:ogc:def:crs:EPSG::4326',
      count: '100'
    });
    const response = await fetch(`https://wfs.geonorge.no/skwms1/wfs.matrikkelen-bygningspunkt?${params}`, { headers: { 'User-Agent': 'History-Go-coordinate-research/1.0' } });
    const text = await response.text();
    tried.push({ typeName, status: response.status, ok: response.ok, preview: text.slice(0, 1000) });
    if (response.ok && /FeatureCollection|featureMember|member/i.test(text) && !/ExceptionReport/i.test(text)) {
      fs.writeFileSync(path.join(OUT, `${name}.gml`), text);
      return { status: 'fetched', typeName, httpStatus: response.status, featureMemberCount: (text.match(/<wfs:member>|<gml:featureMember>/g) || []).length, preview: text.slice(0, 2500) };
    }
  }
  return { status: 'not_fetched', tried };
}

const kartverketRom = await fetchWfsGml('kartverket-rom-bygningspunkt', [59.9196,10.7498,59.9220,10.7533]);
const kartverketSoft = await fetchWfsGml('kartverket-soft-bygningspunkt', [59.9085,10.7408,59.9106,10.7440]);

const refined = {
  version: '2026-07-24-refined',
  rom: {
    officialAnchorStatement: 'Building O; entrance from the Maridalsveien/Brenneriveien intersection.',
    sharedRoadNodes,
    roadWayIds: {
      Maridalsveien: maridalsWays.map((e) => e.id),
      Brenneriveien: brenneriWays.map((e) => e.id)
    },
    entrances: romEntrances.sort((a,b) => (a.nearestOfficialIntersectionM ?? 1e9) - (b.nearestOfficialIntersectionM ?? 1e9)),
    buildings: romBuildings.map(({geometry,nodeIds,...rest}) => ({...rest, nodeCount: nodeIds.length, geometryPointCount: geometry.length})),
    resolutionRule: 'A ROM production anchor requires a stable entrance/building object that can be tied to building O or the institution-defined intersection entrance. No unnamed nearest entrance is accepted solely because it is close.'
  },
  soft: {
    officialAnchorStatement: 'Entrance on the corner at Rådhusgata 20; large window faces northeast toward Rådhusgata.',
    containingBuildings: softContainingBuildings.map(({geometry,nodeIds,...rest}) => ({...rest, nodeCount: nodeIds.length, geometryPointCount: geometry.length})),
    entrances: softEntrances.sort((a,b) => a.distanceToAddressM - b.distanceToAddressM),
    nearbyRoads: softRoads.map(({geometry,...rest}) => ({...rest, geometryPointCount: geometry.length})),
    resolutionRule: 'A SOFT production anchor requires an entrance node on the containing Rådhusgata 20 building or another stable source object that uniquely identifies SOFT’s stated corner entrance. No arbitrary building corner is accepted.'
  },
  kartverket: {
    featureTypeNames: [...new Set(typeNames)],
    rom: kartverketRom,
    soft: kartverketSoft
  }
};

// Correct the first-pass false positive and record only evidence-backed conclusions.
const report = readJson('anchor-research.json');
report.status = 'research_complete_corrected';
report.decisions.rom_for_kunst_og_arkitektur = {
  status: 'still_requires_anchor_resolution',
  rejectedFalsePositive: 'osm:node/13812242924 matched the substring "rom" inside the Norwegian word "klasserom" and is unrelated to ROM for kunst og arkitektur.',
  sharedRoadNodes,
  candidateEntranceObjects: romEntrances.filter((e) => (e.nearestOfficialIntersectionM ?? Infinity) <= 60),
  nextGate: 'Tie exactly one stable entrance or building object to ROM building O / the institution-defined Maridalsveien-Brenneriveien entrance before production.'
};
report.decisions.soft_galleri = {
  status: 'still_requires_anchor_resolution',
  containingBuildingObjects: softContainingBuildings.map((b) => `osm:${b.type}/${b.id}`),
  candidateEntranceObjectsOnContainingBuilding: softEntrances.filter((e) => e.memberOfContainingBuildingIds.length > 0),
  nextGate: 'Require an entrance object on the Rådhusgata 20 building that uniquely matches SOFT’s stated corner entrance, or another stable authoritative object. Do not select a polygon corner by proximity alone.'
};
report.queries.refined_geometry_analysis = {
  file: 'refined-anchor-analysis.json',
  kartverketFeatureTypeNames: [...new Set(typeNames)]
};

writeJson('refined-anchor-analysis.json', refined);
writeJson('anchor-research.json', report);

console.log(JSON.stringify({
  sharedRoadNodes,
  romCandidateEntrancesNearIntersection: report.decisions.rom_for_kunst_og_arkitektur.candidateEntranceObjects,
  softContainingBuildings: report.decisions.soft_galleri.containingBuildingObjects,
  softEntrancesOnContainingBuilding: report.decisions.soft_galleri.candidateEntranceObjectsOnContainingBuilding,
  kartverketTypeNames: refined.kartverket.featureTypeNames,
  kartverketRom: refined.kartverket.rom.status,
  kartverketSoft: refined.kartverket.soft.status
}, null, 2));
