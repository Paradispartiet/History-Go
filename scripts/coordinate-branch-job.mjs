import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-subculture-anchors-research-20260725');
await fs.mkdir(reportDir, { recursive: true });
const userAgent = 'History-Go coordinate research/2026-07-25';

const candidates = [
  ['gronland_underganger', 'data/places/subkultur/oslo/places_subkultur/gronland_underganger.json', 'linear_area'],
  ['grunerlokka_bakgardsvegger', 'data/places/subkultur/oslo/places_subkultur/grunerlokka_bakgardsvegger.json', 'linear_area'],
  ['hausmannsgate_aksen', 'data/places/subkultur/oslo/places_subkultur/hausmannsgate_aksen.json', 'route'],
  ['kolstadgata_toyen_vegger', 'data/places/subkultur/oslo/places_subkultur/kolstadgata_toyen_vegger.json', 'linear_area'],
  ['kuba_akselpassasjer', 'data/places/subkultur/oslo/places_subkultur/kuba_akselpassasjer.json', 'linear_area'],
  ['nybrua_pilarrom', 'data/places/subkultur/oslo/places_subkultur/nybrua_pilarrom.json', 'current_place'],
  ['schweigaards_gate_lodalen', 'data/places/subkultur/oslo/places_subkultur/schweigaards_gate_lodalen.json', 'route'],
  ['vulkan_murvegger', 'data/places/subkultur/oslo/places_subkultur/vulkan_murvegger.json', 'linear_area'],
];

const fetchChecked = async (url, options = {}) => {
  const response = await fetch(url, {
    redirect: 'follow',
    ...options,
    headers: { 'user-agent': userAgent, accept: '*/*', ...(options.headers || {}) },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  return response;
};
const toRadians = (value) => value * Math.PI / 180;
const distanceMeters = (aLat, aLon, bLat, bLon) => {
  const r = 6371008.8;
  const dLat = toRadians(bLat - aLat);
  const dLon = toRadians(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(h)));
};
const writeJson = async (name, value) => fs.writeFile(path.join(reportDir, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');

function walkObjects(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (!Array.isArray(value)) out.push(value);
  for (const child of Array.isArray(value) ? value : Object.values(value)) walkObjects(child, out);
  return out;
}
function findText(value, pattern) {
  return pattern.test(JSON.stringify(value));
}
function extractPoint(obj) {
  const containers = [obj.representasjonspunkt, obj.posisjon, obj.punkt, obj.koordinat, obj.coordinate, obj.coordinates, obj];
  for (const p of containers) {
    if (!p || typeof p !== 'object') continue;
    const lat = Number(p.lat ?? p.latitude ?? p.nord ?? p.y);
    const lon = Number(p.lon ?? p.lng ?? p.longitude ?? p.øst ?? p.ost ?? p.x);
    if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return { lat, lon };
    if (Array.isArray(p) && p.length >= 2) {
      const a = Number(p[0]);
      const b = Number(p[1]);
      if (Number.isFinite(a) && Number.isFinite(b)) {
        if (Math.abs(a) <= 20 && Math.abs(b) >= 50 && Math.abs(b) <= 90) return { lat: b, lon: a };
        if (Math.abs(b) <= 20 && Math.abs(a) >= 50 && Math.abs(a) <= 90) return { lat: a, lon: b };
      }
    }
  }
  return null;
}
function extractSsrCandidates(payload) {
  const seen = new Set();
  const rows = [];
  for (const obj of walkObjects(payload)) {
    const point = extractPoint(obj);
    if (!point) continue;
    const text = JSON.stringify(obj);
    if (!/Nybrua/i.test(text)) continue;
    const stedsnummer = obj.stedsnummer ?? obj.stednummer ?? obj.id ?? null;
    const key = `${stedsnummer || 'none'}:${point.lat.toFixed(8)},${point.lon.toFixed(8)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      stedsnummer,
      point,
      exactName: /Nybrua/i.test(text),
      inOslo: /Oslo|0301/i.test(text),
      objectTypeBridge: /Bru|bridge/i.test(text),
      raw: obj,
    });
  }
  return rows;
}

const records = [];
for (const [id, sourcePath, locatorType] of candidates) {
  const place = JSON.parse(await fs.readFile(path.join(root, sourcePath), 'utf8'));
  const hasSourceContract = Boolean(place.sourceProvider || place.sourceObjectId || place.coordSourceUrl || place.geometry || place.anchors || place.externalLinks?.length);
  records.push({ id, sourcePath, locatorType, place, hasSourceContract });
}

const broadIds = new Set(candidates.map(([id]) => id).filter((id) => id !== 'nybrua_pilarrom'));
const decisions = [];
for (const record of records.filter((record) => broadIds.has(record.id))) {
  const scopeText = `${record.place.name}\n${record.place.desc || ''}\n${record.place.popupDesc || ''}`;
  const pluralSignals = ['underganger', 'vegger', 'bakgårder', 'sidegater', 'aksen', 'passasjer', 'bakrom', 'støttemurer', 'tekniske flater', 'området'];
  const matchedSignals = pluralSignals.filter((signal) => scopeText.toLocaleLowerCase('nb').includes(signal.toLocaleLowerCase('nb')));
  decisions.push({
    placeId: record.id,
    name: record.place.name,
    currentCoordinate: { lat: record.place.lat, lon: record.place.lon, r: record.place.r },
    canonicalScopeEvidence: {
      sourcePath: record.sourcePath,
      matchedDiffuseScopeSignals: matchedSignals,
      hasExistingSourceContract: record.hasSourceContract,
      description: record.place.desc || null,
    },
    decision: {
      canBecomeVerified: false,
      coordinateDecision: 'keep_current_point_as_unverified_editorial_proxy',
      coordStatus: 'needs_source',
      coordType: 'unverified_area_anchor',
      locatorType: record.locatorType,
      sourceProvider: 'manual_research',
      blockedReason: 'Canonical scope is a diffuse editorial environment spanning multiple changing walls, passages or street segments. The record contains no source-backed geometry, stable named physical object or explicit anchor set that matches the whole scope.',
      nextAction: 'Define an explicit geometry or a finite set of source-backed anchors for the complete canonical scope; otherwise retain as needs_source and do not present the current midpoint as verified.',
    },
  });
}

const nybruaRecord = records.find((record) => record.id === 'nybrua_pilarrom');
const nybrua = nybruaRecord.place;
const ssrUrl = 'https://api.kartverket.no/stedsnavn/v1/sted?sok=Nybrua&utkoordsys=4258&treffPerSide=50&side=1';
const ssrPayload = await (await fetchChecked(ssrUrl, { headers: { accept: 'application/json' } })).json();
await writeJson('kartverket-ssr-nybrua.json', ssrPayload);
const ssrCandidates = extractSsrCandidates(ssrPayload).filter((candidate) => candidate.inOslo);
ssrCandidates.sort((a, b) => Number(b.objectTypeBridge) - Number(a.objectTypeBridge) || distanceMeters(nybrua.lat, nybrua.lon, a.point.lat, a.point.lon) - distanceMeters(nybrua.lat, nybrua.lon, b.point.lat, b.point.lon));
const selectedSsr = ssrCandidates[0] || null;
if (!selectedSsr) throw new Error('No Oslo Nybrua SSR candidate with coordinates found');

const { lat, lon } = selectedSsr.point;
const overpassQuery = `[out:json][timeout:60];(way(around:250,${lat},${lon})[bridge][name~"Nybrua",i];way(around:250,${lat},${lon})[man_made=bridge][name~"Nybrua",i];relation(around:250,${lat},${lon})[name~"Nybrua",i];nwr(around:250,${lat},${lon})[name~"Nybrua",i];);out center tags geom;`;
let overpass = null;
let endpointUsed = null;
let lastError = null;
for (const endpoint of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
  try {
    const response = await fetchChecked(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
      body: new URLSearchParams({ data: overpassQuery }).toString(),
    });
    overpass = await response.json();
    endpointUsed = endpoint;
    break;
  } catch (error) { lastError = String(error); }
}
if (!overpass) throw new Error(`Overpass failed: ${lastError}`);
await writeJson('overpass-nybrua.json', overpass);
const elements = overpass.elements || [];
const bridgeWays = elements.filter((element) => element.type === 'way' && Array.isArray(element.geometry) && element.geometry.length >= 2 && /Nybrua/i.test(String(element.tags?.name || '')) && (element.tags?.bridge || element.tags?.man_made === 'bridge'));
const allVertices = bridgeWays.flatMap((way) => way.geometry);
const center = allVertices.length ? {
  lat: allVertices.reduce((sum, point) => sum + point.lat, 0) / allVertices.length,
  lon: allVertices.reduce((sum, point) => sum + point.lon, 0) / allVertices.length,
} : { lat, lon };
const maximumGeometryDistance = allVertices.length ? Math.max(...allVertices.map((point) => distanceMeters(center.lat, center.lon, point.lat, point.lon))) : 0;
const recommendedRadius = Math.max(80, Math.ceil((maximumGeometryDistance + 30) / 10) * 10);
const nearestBridgeDistance = bridgeWays.length ? Math.min(...bridgeWays.map((way) => {
  const c = way.center || { lat: way.geometry.reduce((sum, point) => sum + point.lat, 0) / way.geometry.length, lon: way.geometry.reduce((sum, point) => sum + point.lon, 0) / way.geometry.length };
  return distanceMeters(lat, lon, c.lat, c.lon);
})) : null;
const nybruaCanVerify = selectedSsr.objectTypeBridge && bridgeWays.length > 0 && nearestBridgeDistance !== null && nearestBridgeDistance < 120;
decisions.push({
  placeId: nybrua.id,
  name: nybrua.name,
  currentCoordinate: { lat: nybrua.lat, lon: nybrua.lon, r: nybrua.r },
  kartverketSsr: {
    sourceUrl: ssrUrl,
    selected: { stedsnummer: selectedSsr.stedsnummer, ...selectedSsr.point, objectTypeBridge: selectedSsr.objectTypeBridge },
    candidateCount: ssrCandidates.length,
  },
  bridgeGeometry: {
    overpassEndpoint: endpointUsed,
    namedBridgeWayCount: bridgeWays.length,
    bridgeWays: bridgeWays.map((way) => ({ id: way.id, sourceObjectId: `osm-way:${way.id}`, tags: way.tags || {}, vertexCount: way.geometry.length })),
    geometryCenter: center,
    maximumGeometryDistanceMeters: Math.round(maximumGeometryDistance * 10) / 10,
    nearestBridgeDistanceMeters: nearestBridgeDistance === null ? null : Math.round(nearestBridgeDistance * 10) / 10,
  },
  displacementMeters: Math.round(distanceMeters(nybrua.lat, nybrua.lon, center.lat, center.lon) * 10) / 10,
  radiusRecommendation: { bufferMeters: 30, minimumRadiusMeters: 80, recommendedRadius },
  decision: nybruaCanVerify ? {
    canBecomeVerified: true,
    coordinateDecision: 'use_named_nybrua_bridge_geometry_as_pillar_room_anchor',
    recommendedLat: center.lat,
    recommendedLon: center.lon,
    recommendedRadius,
    coordStatus: 'verified_geometry',
    coordType: 'bridge_substructure_anchor',
    coordRole: 'area_anchor',
    geocodeAccuracy: 'semantic_anchor',
    locatorType: 'current_place',
    sourceProvider: 'kartverket',
    sourceObjectId: selectedSsr.stedsnummer ? `kartverket-ssr:${selectedSsr.stedsnummer}:${lat.toFixed(8)},${lon.toFixed(8)}` : `kartverket-ssr:nybrua:${lat.toFixed(8)},${lon.toFixed(8)}`,
    nextAction: 'Create a production PR with the bridge geometry and explicit under-bridge semantic anchor.',
  } : {
    canBecomeVerified: false,
    coordinateDecision: 'keep_research_only',
    coordStatus: 'needs_source',
    coordType: 'unverified_area_anchor',
    locatorType: 'current_place',
    sourceProvider: 'manual_research',
    blockedReason: 'Nybrua identity or bridge geometry did not resolve uniquely enough to represent the under-bridge pillar room.',
    nextAction: 'Find a unique official bridge object and geometry before production.',
  },
});

decisions.sort((a, b) => a.placeId.localeCompare(b.placeId, 'nb'));
const summary = {
  version: '2026-07-25',
  researchOnly: true,
  canonicalChanged: false,
  candidateCount: decisions.length,
  verifiableCount: decisions.filter((item) => item.decision.canBecomeVerified).length,
  blockedCount: decisions.filter((item) => !item.decision.canBecomeVerified).length,
  candidates: decisions,
};
await writeJson('summary.json', summary);
const lines = decisions.map((item) => `- ${item.placeId}: ${item.decision.canBecomeVerified ? `verifiable (${item.decision.coordStatus})` : `blocked (${item.decision.coordStatus})`}`);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Oslo subculture anchor research — 2026-07-25\n\nResearch only. No canonical coordinates changed.\n\n${lines.join('\n')}\n`, 'utf8');
console.log(JSON.stringify({ verifiable: decisions.filter((item) => item.decision.canBecomeVerified).map((item) => item.placeId), blocked: decisions.filter((item) => !item.decision.canBecomeVerified).map((item) => item.placeId) }, null, 2));
