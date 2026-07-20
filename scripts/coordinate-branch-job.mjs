import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const placeId = 'ekeberg_helleristninger';
const kulturminneId = '41907';
const featureId = '41907-1';
const collection = 'lokaliteter';
const base = 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner';
const sourceUrl = `${base}/collections/${collection}/items/${featureId}?f=json`;
const reportDir = 'reports/visitoslo-oslo-east-audit-20260720/ekeberg-helleristninger';
mkdirSync(reportDir, { recursive: true });

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/geo+json, application/json' } });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  if (!response.ok || !data) throw new Error(`Official Riksantikvaren feature lookup failed: HTTP ${response.status} ${text.slice(0, 1000)}`);
  return data;
}

function ringCentroid(ring) {
  let twiceArea = 0;
  let xNumerator = 0;
  let yNumerator = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    xNumerator += (x1 + x2) * cross;
    yNumerator += (y1 + y2) * cross;
  }
  if (Math.abs(twiceArea) < 1e-12) {
    const xs = ring.map(([x]) => x);
    const ys = ring.map(([, y]) => y);
    return { lon: (Math.min(...xs) + Math.max(...xs)) / 2, lat: (Math.min(...ys) + Math.max(...ys)) / 2, weight: 1 };
  }
  return { lon: xNumerator / (3 * twiceArea), lat: yNumerator / (3 * twiceArea), weight: Math.abs(twiceArea / 2) };
}

function geometryCenter(geometry) {
  if (!geometry) throw new Error('Official heritage feature has no geometry.');
  if (geometry.type === 'Point') return { lon: geometry.coordinates[0], lat: geometry.coordinates[1], method: 'official_point' };
  if (geometry.type === 'MultiPoint') {
    return {
      lon: geometry.coordinates.reduce((sum, [x]) => sum + x, 0) / geometry.coordinates.length,
      lat: geometry.coordinates.reduce((sum, [, y]) => sum + y, 0) / geometry.coordinates.length,
      method: 'official_multipoint_center',
    };
  }
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : null;
  if (!polygons) throw new Error(`Unsupported official geometry type: ${geometry.type}`);
  const centers = polygons.map((polygon) => ringCentroid(polygon[0]));
  const totalWeight = centers.reduce((sum, center) => sum + center.weight, 0);
  return {
    lon: centers.reduce((sum, center) => sum + center.lon * center.weight, 0) / totalWeight,
    lat: centers.reduce((sum, center) => sum + center.lat * center.weight, 0) / totalWeight,
    method: 'official_geometry_centroid',
  };
}

function haversineMeters(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const feature = await fetchJson(sourceUrl);
const properties = feature.properties ?? {};
const name = String(properties.navn ?? '');
const objectId = String(properties.kulturminneId ?? feature.id ?? '');
const kulturminneLink = String(properties.linkKulturminnesøk ?? properties.linkKulturminnesok ?? '');

if (String(feature.id) !== featureId) throw new Error(`Expected feature id ${featureId}, got ${feature.id}`);
if (objectId !== featureId) throw new Error(`Expected official kulturminneId ${featureId}, got ${objectId}`);
if (!kulturminneLink.includes(`/lokalitet/${kulturminneId}`)) throw new Error(`Official feature does not link to Kulturminne ID ${kulturminneId}: ${kulturminneLink}`);
const identityText = `${name} ${properties.informasjon ?? ''}`.toLowerCase();
if (!(identityText.includes('ekeberg 2') || identityText.includes('sjømannsskol') || identityText.includes('sjomannsskol')) || !identityText.includes('ristning')) {
  throw new Error(`Official feature identity does not resolve the Ekeberg rock-carving field: ${name}`);
}

const center = geometryCenter(feature.geometry);
const point = { lat: center.lat, lon: center.lon };
const raw = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const identityMatches = places.filter((place) => {
  const text = `${place.id ?? ''} ${place.name ?? ''} ${place.desc ?? ''}`.toLowerCase();
  return text.includes('ekeberg_hellerist') || text.includes('helleristningene på ekeberg') || text.includes('ekeberg 2 hellerist');
}).map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
const nearest = places.filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon))).map((place) => ({
  id: place.id,
  name: place.name,
  category: place.category,
  distanceM: Math.round(haversineMeters(point, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
  sourceFile: place.sourceFile,
})).sort((a, b) => a.distanceM - b.distanceM).slice(0, 15);

const sourceObjectId = `kulturminnesok:${kulturminneId}`;
const decision = {
  version: '2026-07-20-v5-direct-object',
  placeId,
  kulturminneId,
  sourceProvider: 'official_heritage_registry',
  sourceName: 'Riksantikvaren – Lokaliteter, Enkeltminner og Sikringssoner OGC API',
  sourceUrl,
  sourceObjectId,
  collection,
  featureId,
  identity: {
    name,
    officialKulturminneId: objectId,
    linkKulturminnesøk: kulturminneLink,
    geometryType: feature.geometry?.type ?? null,
  },
  coordinate: {
    lat: center.lat,
    lon: center.lon,
    r: 65,
    locatorType: 'poi',
    sourceProvider: 'manual_research',
    sourceObjectId,
    geocodeAccuracy: 'geometric_center',
    coordRole: 'site_center',
    coordStatus: 'verified_geometry',
    coordSource: 'kulturminnesok_askeladden',
    coordType: center.method === 'official_point' ? 'heritage_object_point' : 'heritage_site_centroid',
    coordNote: `Representasjonspunkt fra Riksantikvarens offisielle ${feature.geometry.type}-geometri for Kulturminne-ID ${kulturminneId}, objekt ${featureId}. Punktet representerer helleristningsfeltet ved Sjømannsskolen på Ekeberg, ikke Karlsborgveien, Kongsveien eller Ekebergparken som helhet.`,
  },
  primaryCategory: 'historie',
  duplicateGate: {
    canonicalIdentityMatches: identityMatches,
    nearestCanonicalPlaces: nearest,
    conclusion: identityMatches.length === 0 ? 'No canonical Ekeberg rock-carving-field identity exists.' : 'Potential canonical identity match requires review before production.',
  },
  productionGate: identityMatches.length === 0 ? 'ready_for_canonical_production' : 'identity_review_required',
  officialFeature: feature,
};

writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`);
writeFileSync(`${reportDir}/README.md`, `# Helleristningene på Ekeberg — direct official-object coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Kulturminne ID: **${kulturminneId}**\n- Official feature: **${featureId}**\n- Official name: **${name}**\n- Geometry: **${feature.geometry.type}**\n- Representation point: **${center.lat}, ${center.lon}**\n- Proposed category: **historie**\n- Production gate: **${decision.productionGate}**\n\nThe applied coordinate is derived directly from Riksantikvaren's official feature \`${featureId}\`. No road address, park centroid, Wikidata coordinate or broad Ekeberg area proxy is used.\n`);
console.log(`Resolved Ekeberg rock carvings directly from official feature ${featureId}: ${center.lat}, ${center.lon}; gate=${decision.productionGate}`);
rmSync(new URL(import.meta.url));
