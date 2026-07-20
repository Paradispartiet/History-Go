import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const featureId = '42178';
const placeId = 'mariakirken_ruin_oslo';
const sourceUrl = `https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/${featureId}?f=json`;
const reportDir = 'reports/visitoslo-oslo-east-audit-20260720/mariakirken-ruin';
mkdirSync(reportDir, { recursive: true });

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
  const polygons = geometry?.type === 'Polygon' ? [geometry.coordinates] : geometry?.type === 'MultiPolygon' ? geometry.coordinates : null;
  if (!polygons) throw new Error(`Expected Polygon/MultiPolygon geometry, got ${geometry?.type}`);
  const centers = polygons.map((polygon) => ringCentroid(polygon[0]));
  const totalWeight = centers.reduce((sum, center) => sum + center.weight, 0);
  return {
    lon: centers.reduce((sum, center) => sum + center.lon * center.weight, 0) / totalWeight,
    lat: centers.reduce((sum, center) => sum + center.lat * center.weight, 0) / totalWeight,
  };
}

function haversineMeters(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const response = await fetch(sourceUrl, { headers: { accept: 'application/geo+json, application/json' } });
if (!response.ok) throw new Error(`Riksantikvaren lookup failed: HTTP ${response.status}`);
const feature = await response.json();
const p = feature.properties ?? {};
const identityText = `${p.navn ?? ''} ${p.informasjon ?? ''}`.toLowerCase();
if (String(feature.id) !== featureId) throw new Error(`Expected feature ${featureId}, got ${feature.id}`);
if (String(p.kulturminneId) !== featureId) throw new Error(`Expected kulturminneId ${featureId}, got ${p.kulturminneId}`);
if (String(p.kommune) !== '0301') throw new Error(`Expected Oslo kommune 0301, got ${p.kommune}`);
if (!String(p.linkKulturminnesøk ?? '').includes(`/lokalitet/${featureId}`)) throw new Error('Feature does not link to Kulturminnesøk locality 42178.');
if (!identityText.includes('mariakirken') || !identityText.includes('oslo') || !identityText.includes('kongsgårdkirke')) {
  throw new Error(`Feature identity does not resolve Oslo Mariakirken: ${p.navn}`);
}

const center = geometryCenter(feature.geometry);
const officialCenter = Array.isArray(p.senterpunkt?.coordinates) ? { lon: p.senterpunkt.coordinates[0], lat: p.senterpunkt.coordinates[1] } : null;
const centerDistanceM = officialCenter ? Math.round(haversineMeters(center, officialCenter) * 10) / 10 : null;

const indexRaw = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const canonicalIdentityMatches = places.filter((place) => {
  const text = `${place.id ?? ''} ${place.name ?? ''} ${place.desc ?? ''}`.toLowerCase();
  return text.includes('mariakirken') || text.includes('maria kirke');
}).map(({ id, name, category, sourceFile }) => ({ id, name, category, sourceFile }));

const point = { lat: center.lat, lon: center.lon };
const nearestCanonicalPlaces = places
  .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    distanceM: Math.round(haversineMeters(point, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
    sourceFile: place.sourceFile,
  }))
  .sort((a, b) => a.distanceM - b.distanceM)
  .slice(0, 12);

const decision = {
  version: '2026-07-20-direct-object-v2',
  placeId,
  candidateName: 'Mariakirken-ruinen i middelalder-Oslo',
  status: 'verified_geometry_candidate',
  productionGate: canonicalIdentityMatches.length === 0 ? 'ready_for_canonical_production' : 'identity_review_required',
  primaryCategory: 'historie',
  source: {
    sourceProvider: 'official_heritage_registry',
    sourceName: 'Riksantikvaren – Lokaliteter, Enkeltminner og Sikringssoner OGC API',
    sourceUrl,
    sourceObjectId: 'kulturminnesok:42178',
    collection: 'lokaliteter',
    featureId,
  },
  identity: {
    officialName: p.navn,
    officialKulturminneId: String(p.kulturminneId),
    municipality: String(p.kommune),
    linkKulturminnesok: p.linkKulturminnesøk,
    geometryType: feature.geometry?.type ?? null,
    origin: p.opphav ?? null,
    summary: 'Ruin of Mariakirken, Oslo royal church from the mid-1000s; later royal chapel and burial church.',
  },
  coordinate: {
    lat: center.lat,
    lon: center.lon,
    r: 75,
    locatorType: 'poi',
    sourceProvider: 'manual_research',
    sourceObjectId: 'kulturminnesok:42178',
    geocodeAccuracy: 'geometric_center',
    coordRole: 'site_center',
    coordStatus: 'verified_geometry',
    coordSource: 'kulturminnesok_askeladden',
    coordType: 'heritage_site_centroid',
    coordNote: 'Geometrisk representasjonspunkt beregnet fra Riksantikvarens offisielle MultiPolygon-geometri for Mariakirken kirkested, Kulturminne-ID 42178. Punktet representerer den konkrete kirke-/ruinlokaliteten og ikke Middelalderparken som helhet.',
  },
  geometryAudit: {
    officialCenterpoint: officialCenter,
    derivedGeometryCenter: center,
    distanceBetweenCentersM: centerDistanceM,
  },
  duplicateGate: {
    canonicalIdentityMatches,
    nearestCanonicalPlaces,
    conclusion: canonicalIdentityMatches.length === 0
      ? 'No canonical Mariakirken ruin identity exists; broad Middelalderparken and Hallvardskirken are distinct physical identities.'
      : 'Potential canonical identity match requires review before production.',
  },
};

writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`);
writeFileSync(`${reportDir}/README.md`, `# Mariakirken-ruinen — direkte offisielt objektintak\n\n- Riksantikvaren-feature: **42178**\n- Offisielt navn: **${p.navn}**\n- Kommune: **${p.kommune}**\n- Geometri: **${feature.geometry?.type}**\n- Geometrisk representasjonspunkt: **${center.lat}, ${center.lon}**\n- Avstand til feature-feltets offisielle senterpunkt: **${centerDistanceM ?? 'ukjent'} m**\n- Canonical identitetsmatcher: **${canonicalIdentityMatches.length}**\n- Produksjonsgate: **${decision.productionGate}**\n\nKoordinaten er avledet direkte fra Riksantikvarens offisielle feature 42178. Ingen parkcentroid, adresseproxy eller bred Middelalderbyen-markør brukes.\n`);
console.log(`Mariakirken 42178 verified: ${center.lat}, ${center.lon}; identity matches=${canonicalIdentityMatches.length}; gate=${decision.productionGate}`);
rmSync(new URL(import.meta.url));
