import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "ekeberg_helleristninger";
const kulturminneId = "41907";
const reportDir = "reports/visitoslo-oslo-east-audit-20260720/ekeberg-helleristninger";
mkdirSync(reportDir, { recursive: true });

const endpoints = [
  `https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/lokaliteter/items/${kulturminneId}?f=json`,
  `https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/enkeltminner/items/${kulturminneId}?f=json`,
];

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) return { ok: false, status: response.status, url };
  return { ok: true, status: response.status, url, data: await response.json() };
}

function polygonCentroid(ring) {
  let area2 = 0;
  let cx6a = 0;
  let cy6a = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    area2 += cross;
    cx6a += (x1 + x2) * cross;
    cy6a += (y1 + y2) * cross;
  }
  if (Math.abs(area2) < 1e-12) {
    const xs = ring.map(([x]) => x);
    const ys = ring.map(([, y]) => y);
    return { lon: (Math.min(...xs) + Math.max(...xs)) / 2, lat: (Math.min(...ys) + Math.max(...ys)) / 2, weight: 1 };
  }
  return { lon: cx6a / (3 * area2), lat: cy6a / (3 * area2), weight: Math.abs(area2 / 2) };
}

function geometryCenter(geometry) {
  if (!geometry) throw new Error("Riksantikvaren item has no geometry.");
  if (geometry.type === "Point") return { lon: geometry.coordinates[0], lat: geometry.coordinates[1], method: "official_point" };
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : null;
  if (!polygons) throw new Error(`Unsupported official geometry type: ${geometry.type}`);
  const centers = polygons.map((polygon) => polygonCentroid(polygon[0]));
  const total = centers.reduce((sum, center) => sum + center.weight, 0);
  return {
    lon: centers.reduce((sum, center) => sum + center.lon * center.weight, 0) / total,
    lat: centers.reduce((sum, center) => sum + center.lat * center.weight, 0) / total,
    method: "official_geometry_centroid",
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

const attempts = [];
let resolved = null;
for (const endpoint of endpoints) {
  const attempt = await fetchJson(endpoint);
  attempts.push({ url: endpoint, ok: attempt.ok, status: attempt.status });
  if (attempt.ok && attempt.data?.geometry) {
    resolved = attempt;
    break;
  }
}
if (!resolved) throw new Error(`Riksantikvaren did not return official geometry for Kulturminne ID ${kulturminneId}: ${JSON.stringify(attempts)}`);

const feature = resolved.data;
const center = geometryCenter(feature.geometry);
const properties = feature.properties ?? {};
const propertyText = JSON.stringify(properties).toLowerCase();
const identityLooksRelevant = propertyText.includes("ekeberg") || propertyText.includes("hellerist") || propertyText.includes(kulturminneId);
if (!identityLooksRelevant) {
  throw new Error(`Official object ${kulturminneId} geometry resolved, but identity properties do not mention Ekeberg/helleristning/ID: ${JSON.stringify(properties)}`);
}

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const point = { lat: center.lat, lon: center.lon };
const identityMatches = places.filter((place) => {
  const text = `${place.id ?? ""} ${place.name ?? ""} ${place.desc ?? ""}`.toLowerCase();
  return text.includes("ekeberg_hellerist") || text.includes("helleristningene på ekeberg") || text.includes("ekeberg 2 hellerist");
}).map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
const nearest = places
  .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    distanceM: Math.round(haversineMeters(point, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
    sourceFile: place.sourceFile,
  }))
  .sort((a, b) => a.distanceM - b.distanceM)
  .slice(0, 15);

const result = {
  ok: true,
  status: "verified_geometry_candidate",
  placeId,
  kulturminneId,
  sourceProvider: "official_heritage_registry",
  sourceName: "Riksantikvaren – Lokaliteter, Enkeltminner og Sikringssoner",
  sourceUrl: resolved.url,
  sourceObjectId: `kulturminnesok:${kulturminneId}`,
  geometryType: feature.geometry.type,
  center,
  properties,
  attempts,
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const decision = {
  version: "2026-07-20",
  placeId,
  kulturminneId,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: {
    lat: center.lat,
    lon: center.lon,
    r: 65,
    locatorType: "poi",
    sourceProvider: "manual_research",
    sourceObjectId: `kulturminnesok:${kulturminneId}`,
    geocodeAccuracy: "geometric_center",
    coordRole: "site_center",
    coordStatus: "verified_geometry",
    coordSource: "kulturminnesok_askeladden",
    coordType: center.method === "official_point" ? "heritage_object_point" : "heritage_site_centroid",
    coordNote: `Representasjonspunkt beregnet fra Riksantikvarens offisielle geometri for Kulturminne-ID ${kulturminneId}. Punktet representerer helleristningsfeltet på Ekeberg, ikke Karlsborgveien, Kongsveien eller Ekebergparken som helhet.`
  },
  primaryCategory: "historie",
  productionGate: identityMatches.length === 0 ? "ready_for_canonical_production" : "identity_review_required",
  representationDecision: "Create one canonical history place for the registered Ekeberg rock-carving field. Use the official Riksantikvaren heritage-object geometry as the primary physical anchor; do not use nearby road addresses or park centroids.",
  duplicateGate: {
    canonicalIdentityMatches: identityMatches,
    nearestCanonicalPlaces: nearest,
    conclusion: identityMatches.length === 0
      ? "No canonical Ekeberg rock-carving-field identity exists. Nearby Ekeberg places represent other physical identities and scales."
      : "Potential existing identity match found and must be resolved before production."
  }
};
writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`, "utf8");

const nearestLines = nearest.map((place) => `- ${place.id} — ${place.name} (${place.category}), ${place.distanceM} m`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# Helleristningene på Ekeberg — object-first coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Kulturminne ID: **${kulturminneId}**\n- Riksantikvaren endpoint: **${resolved.url}**\n- Geometry type: **${feature.geometry.type}**\n- Representation point: **${center.lat}, ${center.lon}**\n- Proposed category: **historie**\n\nThe coordinate comes from Riksantikvaren's official registered cultural-heritage geometry, not from a road address or Ekebergparken proxy.\n\n## Identity properties\n\n\`\`\`json\n${JSON.stringify(properties, null, 2)}\n\`\`\`\n\n## Nearest canonical places\n\n${nearestLines}\n`, "utf8");

console.log(`Resolved Ekeberg rock carvings from Riksantikvaren object ${kulturminneId}: ${center.lat}, ${center.lon} (${feature.geometry.type}).`);
