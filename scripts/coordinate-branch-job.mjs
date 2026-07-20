import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const placeId = 'ekeberg_helleristninger';
const kulturminneId = '41907';
const base = 'https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner';
const bbox = [10.754, 59.894, 10.765, 59.901];
const reportDir = 'reports/visitoslo-oslo-east-audit-20260720/ekeberg-helleristninger-v4';
mkdirSync(reportDir, { recursive: true });

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: 'application/geo+json, application/json' } });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch {}
  return { url, ok: response.ok, status: response.status, data, text: data ? null : text.slice(0, 4000) };
}

function walkStrings(value, output = []) {
  if (value === null || value === undefined) return output;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    output.push(String(value));
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, output);
    return output;
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      output.push(String(key));
      walkStrings(item, output);
    }
  }
  return output;
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
  return {
    lon: xNumerator / (3 * twiceArea),
    lat: yNumerator / (3 * twiceArea),
    weight: Math.abs(twiceArea / 2),
  };
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

const collectionsResponse = await fetchJson(`${base}/collections?f=json`);
if (!collectionsResponse.ok || !Array.isArray(collectionsResponse.data?.collections)) {
  throw new Error(`Could not discover Riksantikvaren collections: HTTP ${collectionsResponse.status}`);
}
const selected = collectionsResponse.data.collections.filter((collection) => {
  const text = `${collection.id ?? ''} ${collection.title ?? ''}`.toLowerCase();
  return text.includes('lokalit') || text.includes('enkeltminn');
});

const pageAudit = [];
const exactMatches = [];
const preciseIdentityMatches = [];
for (const collection of selected) {
  let url = `${base}/collections/${encodeURIComponent(collection.id)}/items?f=json&limit=1000&bbox=${bbox.join(',')}`;
  const seenUrls = new Set();
  for (let page = 1; page <= 50 && url; page += 1) {
    if (seenUrls.has(url)) throw new Error(`Pagination loop detected for ${collection.id}: ${url}`);
    seenUrls.add(url);
    const response = await fetchJson(url);
    if (!response.ok || !Array.isArray(response.data?.features)) {
      throw new Error(`Riksantikvaren page failed for ${collection.id}: HTTP ${response.status} ${url}`);
    }
    const features = response.data.features;
    for (const feature of features) {
      const searchable = walkStrings({ id: feature.id, properties: feature.properties }).join(' ').toLowerCase();
      const exact = searchable.split(/\s+/).some((token) => token === kulturminneId) || searchable.includes(`kid=${kulturminneId}`) || searchable.includes(`/lokalitet/${kulturminneId}`);
      const preciseIdentity = (searchable.includes('sjømannsskol') || searchable.includes('sjomannsskol') || searchable.includes('ekeberg 2')) && (searchable.includes('hellerist') || searchable.includes('bergkunst'));
      if (exact) exactMatches.push({ collection: collection.id, feature });
      if (preciseIdentity) preciseIdentityMatches.push({ collection: collection.id, feature });
    }
    const nextLink = Array.isArray(response.data.links)
      ? response.data.links.find((link) => String(link.rel).toLowerCase() === 'next' && link.href)
      : null;
    pageAudit.push({
      collection: collection.id,
      page,
      url,
      returned: features.length,
      numberMatched: response.data.numberMatched ?? null,
      numberReturned: response.data.numberReturned ?? features.length,
      next: nextLink?.href ?? null,
    });
    url = nextLink?.href ? new URL(nextLink.href, url).href : null;
  }
}

const dedupedExact = [...new Map(exactMatches.map((entry) => [`${entry.collection}:${entry.feature.id}`, entry])).values()];
const dedupedIdentity = [...new Map(preciseIdentityMatches.map((entry) => [`${entry.collection}:${entry.feature.id}`, entry])).values()];
const resolved = dedupedExact.length === 1 ? dedupedExact[0] : null;

let decision = {
  version: '2026-07-20-v4',
  placeId,
  kulturminneId,
  bbox,
  selectedCollections: selected.map(({ id, title }) => ({ id, title })),
  pageAudit,
  exactMatchCount: dedupedExact.length,
  preciseIdentityMatchCount: dedupedIdentity.length,
  exactMatches: dedupedExact,
  preciseIdentityMatches: dedupedIdentity,
  productionGate: 'blocked',
};

if (resolved) {
  const center = geometryCenter(resolved.feature.geometry);
  const raw = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
  const places = Array.isArray(raw) ? raw : raw.places ?? [];
  const point = { lat: center.lat, lon: center.lon };
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
  decision = {
    ...decision,
    sourceProvider: 'official_heritage_registry',
    sourceName: 'Riksantikvaren – Lokaliteter, Enkeltminner og Sikringssoner',
    sourceObjectId,
    collection: resolved.collection,
    featureId: resolved.feature.id,
    properties: resolved.feature.properties,
    geometryType: resolved.feature.geometry.type,
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
      coordNote: `Representasjonspunkt fra Riksantikvarens offisielle ${resolved.feature.geometry.type}-geometri for Kulturminne-ID ${kulturminneId}. Punktet representerer helleristningsfeltet ved Sjømannsskolen på Ekeberg, ikke Karlsborgveien, Kongsveien eller Ekebergparken som helhet.`,
    },
    primaryCategory: 'historie',
    productionGate: identityMatches.length === 0 ? 'ready_for_canonical_production' : 'identity_review_required',
    duplicateGate: {
      canonicalIdentityMatches: identityMatches,
      nearestCanonicalPlaces: nearest,
    },
  };
}

writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`);
writeFileSync(`${reportDir}/README.md`, `# Ekeberg helleristninger — paginated official-geometry intake v4\n\n- Kulturminne ID: **${kulturminneId}**\n- Exact official matches: **${dedupedExact.length}**\n- Precise Ekeberg/Sjømannsskolen rock-art identity matches: **${dedupedIdentity.length}**\n- Production gate: **${decision.productionGate}**\n- Pages inspected: **${pageAudit.length}**\n\nThe runner follows the live OGC API's pagination links through the bounded Ekeberg query. No road address, park centroid or Wikidata coordinate is accepted as the applied coordinate source.\n`);
console.log(`Ekeberg v4: pages=${pageAudit.length}, exact41907=${dedupedExact.length}, preciseIdentity=${dedupedIdentity.length}, gate=${decision.productionGate}`);
rmSync(new URL(import.meta.url));
