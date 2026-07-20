import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "ekeberg_helleristninger";
const kulturminneId = "41907";
const reportDir = "reports/visitoslo-oslo-east-audit-20260720/ekeberg-helleristninger";
mkdirSync(reportDir, { recursive: true });

// Wikidata Q11974886 is used only to define a small search window around the known object.
// The applied geometry must come from Riksantikvaren and must itself contain Kulturminne ID 41907.
const bbox = [10.754, 59.894, 10.765, 59.901];
const collections = ["lokaliteter", "enkeltminner"];

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/geo+json, application/json" } });
  if (!response.ok) return { ok: false, status: response.status, url, data: null };
  return { ok: true, status: response.status, url, data: await response.json() };
}

function walkStrings(value, output = []) {
  if (value === null || value === undefined) return output;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    output.push(String(value));
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, output);
    return output;
  }
  if (typeof value === "object") {
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
    return {
      lon: (Math.min(...xs) + Math.max(...xs)) / 2,
      lat: (Math.min(...ys) + Math.max(...ys)) / 2,
      weight: 1,
    };
  }
  return {
    lon: xNumerator / (3 * twiceArea),
    lat: yNumerator / (3 * twiceArea),
    weight: Math.abs(twiceArea / 2),
  };
}

function geometryCenter(geometry) {
  if (!geometry) throw new Error("Official heritage feature has no geometry.");
  if (geometry.type === "Point") {
    return { lon: geometry.coordinates[0], lat: geometry.coordinates[1], method: "official_point" };
  }
  if (geometry.type === "MultiPoint") {
    const coordinates = geometry.coordinates;
    return {
      lon: coordinates.reduce((sum, [x]) => sum + x, 0) / coordinates.length,
      lat: coordinates.reduce((sum, [, y]) => sum + y, 0) / coordinates.length,
      method: "official_multipoint_center",
    };
  }
  const polygons = geometry.type === "Polygon"
    ? [geometry.coordinates]
    : geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : null;
  if (!polygons) throw new Error(`Unsupported official geometry type: ${geometry.type}`);
  const centers = polygons.map((polygon) => ringCentroid(polygon[0]));
  const totalWeight = centers.reduce((sum, center) => sum + center.weight, 0);
  return {
    lon: centers.reduce((sum, center) => sum + center.lon * center.weight, 0) / totalWeight,
    lat: centers.reduce((sum, center) => sum + center.lat * center.weight, 0) / totalWeight,
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
const candidates = [];
for (const collection of collections) {
  const url = `https://api.ra.no/LokaliteterEnkeltminnerOgSikringssoner/collections/${collection}/items?f=json&limit=100&bbox=${bbox.join(",")}`;
  const attempt = await fetchJson(url);
  attempts.push({ collection, url, ok: attempt.ok, status: attempt.status, returned: attempt.data?.features?.length ?? 0 });
  if (!attempt.ok || !Array.isArray(attempt.data?.features)) continue;
  for (const feature of attempt.data.features) {
    const searchable = walkStrings({ id: feature.id, properties: feature.properties }).join(" ").toLowerCase();
    if (!searchable.includes(kulturminneId)) continue;
    candidates.push({ collection, url, feature });
  }
}

if (candidates.length !== 1) {
  throw new Error(`Expected exactly one official Riksantikvaren feature containing Kulturminne ID ${kulturminneId}, found ${candidates.length}: ${JSON.stringify(candidates.map(({collection, feature}) => ({collection, id: feature.id, properties: feature.properties})))}`);
}

const resolved = candidates[0];
const feature = resolved.feature;
const searchableIdentity = walkStrings(feature.properties).join(" ").toLowerCase();
if (!searchableIdentity.includes("ekeberg") && !searchableIdentity.includes("hellerist")) {
  throw new Error(`Feature containing Kulturminne ID ${kulturminneId} does not carry an Ekeberg/helleristning identity: ${JSON.stringify(feature.properties)}`);
}

const center = geometryCenter(feature.geometry);
const point = { lat: center.lat, lon: center.lon };

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const identityMatches = places
  .filter((place) => {
    const text = `${place.id ?? ""} ${place.name ?? ""} ${place.desc ?? ""}`.toLowerCase();
    return text.includes("ekeberg_hellerist") || text.includes("helleristningene på ekeberg") || text.includes("ekeberg 2 hellerist");
  })
  .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));

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

const sourceObjectId = `kulturminnesok:${kulturminneId}`;
const sourceUrl = resolved.url;
const result = {
  ok: true,
  status: "verified_geometry_candidate",
  placeId,
  kulturminneId,
  sourceProvider: "official_heritage_registry",
  sourceName: "Riksantikvaren – Lokaliteter, Enkeltminner og Sikringssoner",
  sourceUrl,
  sourceObjectId,
  collection: resolved.collection,
  featureId: feature.id,
  geometryType: feature.geometry.type,
  center,
  properties: feature.properties,
  attempts,
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const decision = {
  version: "2026-07-20",
  placeId,
  kulturminneId,
  sourceProvider: result.sourceProvider,
  sourceObjectId,
  sourceUrl,
  coordinate: {
    lat: center.lat,
    lon: center.lon,
    r: 65,
    locatorType: "poi",
    sourceProvider: "manual_research",
    sourceObjectId,
    geocodeAccuracy: "geometric_center",
    coordRole: "site_center",
    coordStatus: "verified_geometry",
    coordSource: "kulturminnesok_askeladden",
    coordType: center.method === "official_point" ? "heritage_object_point" : "heritage_site_centroid",
    coordNote: `Representasjonspunkt fra Riksantikvarens offisielle ${feature.geometry.type}-geometri for Kulturminne-ID ${kulturminneId}. Punktet representerer helleristningsfeltet på Ekeberg, ikke Karlsborgveien, Kongsveien eller Ekebergparken som helhet.`,
  },
  primaryCategory: "historie",
  productionGate: identityMatches.length === 0 ? "ready_for_canonical_production" : "identity_review_required",
  representationDecision: "Create one canonical history place for the registered Ekeberg rock-carving field. Use the Riksantikvaren feature containing Kulturminne ID 41907 as the primary physical identity and geometry; do not use nearby road addresses or park centroids.",
  duplicateGate: {
    canonicalIdentityMatches: identityMatches,
    nearestCanonicalPlaces: nearest,
    conclusion: identityMatches.length === 0
      ? "No canonical Ekeberg rock-carving-field identity exists. Nearby Ekeberg places represent other physical identities and scales."
      : "Potential existing identity match found and must be resolved before production.",
  },
};
writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`, "utf8");

const nearestLines = nearest.map((place) => `- ${place.id} — ${place.name} (${place.category}), ${place.distanceM} m`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# Helleristningene på Ekeberg — object-first coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Kulturminne ID: **${kulturminneId}**\n- Official collection: **${resolved.collection}**\n- Official feature id: **${feature.id}**\n- Geometry type: **${feature.geometry.type}**\n- Representation point: **${center.lat}, ${center.lon}**\n- Proposed category: **historie**\n\nThe approved coordinate is derived from the single Riksantikvaren feature in the local Ekeberg search window whose official feature data contains Kulturminne ID 41907. Wikidata was used only to define the small search window; it is not the applied coordinate source.\n\n## Official identity properties\n\n\`\`\`json\n${JSON.stringify(feature.properties, null, 2)}\n\`\`\`\n\n## Nearest canonical places\n\n${nearestLines}\n`, "utf8");

console.log(`Resolved Ekeberg rock carvings through official Riksantikvaren ${resolved.collection} feature ${feature.id}: ${center.lat}, ${center.lon} (${feature.geometry.type}).`);
