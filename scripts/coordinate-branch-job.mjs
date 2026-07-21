import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "ekeberg_helleristninger";
const localityId = 41907;
const reportDir = "reports/visitoslo-oslo-east-audit-20260720/ekeberg-helleristninger";
mkdirSync(reportDir, { recursive: true });

const serviceBase = "https://kart.ra.no/arcgis/rest/services/Betatjenester/BetaKulturminner/MapServer";
const layers = [
  { id: 1, name: "BetaKulturminner", role: "official_polygon_geometry" },
  { id: 0, name: "BetaKulturminnepunkter", role: "official_point_crosscheck" },
];

function buildQueryUrl(layerId) {
  const where = `(LokalitetID=${localityId} OR KulturminneID='${localityId}' OR KulturminneID LIKE '${localityId}-%')`;
  const params = new URLSearchParams({
    where,
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
  });
  return `${serviceBase}/${layerId}/query?${params.toString()}`;
}

async function fetchGeoJson(url) {
  const response = await fetch(url, { headers: { accept: "application/geo+json, application/json" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`Riksantikvaren query failed ${response.status}: ${text.slice(0, 500)}`);
  const data = JSON.parse(text);
  if (!Array.isArray(data?.features)) throw new Error(`Riksantikvaren query returned no GeoJSON feature array: ${text.slice(0, 500)}`);
  return data;
}

function flattenCoordinates(value, out = []) {
  if (!Array.isArray(value)) return out;
  if (value.length >= 2 && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1])) && !Array.isArray(value[0])) {
    out.push([Number(value[0]), Number(value[1])]);
    return out;
  }
  for (const child of value) flattenCoordinates(child, out);
  return out;
}

function geometryCenter(geometry) {
  if (!geometry) throw new Error("Official Riksantikvaren feature has no geometry.");
  if (geometry.type === "Point") {
    return { lon: Number(geometry.coordinates[0]), lat: Number(geometry.coordinates[1]), method: "official_point" };
  }
  const coords = flattenCoordinates(geometry.coordinates);
  if (!coords.length) throw new Error(`Could not derive a representation point from geometry type ${geometry.type}.`);
  return {
    lon: coords.reduce((sum, [lon]) => sum + lon, 0) / coords.length,
    lat: coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length,
    method: "official_geometry_vertex_mean",
  };
}

function textOf(feature) {
  return JSON.stringify({ id: feature.id, properties: feature.properties ?? {} }).toLowerCase();
}

function idMatch(feature) {
  const p = feature.properties ?? {};
  const kulturminneId = String(p.KulturminneID ?? "").trim();
  return Number(p.LokalitetID) === localityId || kulturminneId === String(localityId) || kulturminneId.startsWith(`${localityId}-`);
}

function identityMatch(feature) {
  const text = textOf(feature);
  return text.includes("ekeberg") || text.includes("hellerist") || text.includes("sjømannsskol") || text.includes("sjomannsskol");
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

const layerResults = [];
for (const layer of layers) {
  const url = buildQueryUrl(layer.id);
  const geojson = await fetchGeoJson(url);
  const matches = geojson.features.filter(idMatch);
  layerResults.push({ ...layer, url, matches });
  console.log(`${layer.name}: ${matches.length} feature(s) matching LokalitetID/KulturminneID ${localityId}.`);
}

const allMatches = layerResults.flatMap((layer) => layer.matches.map((feature) => ({ layer, feature })));
if (!allMatches.length) {
  throw new Error(`No official Riksantikvaren feature matched LokalitetID/KulturminneID ${localityId}.`);
}

const relevant = allMatches.filter(({ feature }) => identityMatch(feature));
if (!relevant.length) {
  throw new Error(`Official features matched ID ${localityId}, but none carried Ekeberg/helleristning/Sjømannsskolen identity: ${JSON.stringify(allMatches.map(({layer, feature}) => ({layer: layer.name, id: feature.id, properties: feature.properties})))}`);
}

const preferred = relevant.find(({ layer, feature }) => layer.id === 1 && String(feature.properties?.Minnetype ?? "").toUpperCase() === "LOK")
  ?? relevant.find(({ layer }) => layer.id === 1)
  ?? relevant.find(({ layer }) => layer.id === 0)
  ?? relevant[0];

const center = geometryCenter(preferred.feature.geometry);
const pointCrosscheck = relevant.find(({ layer }) => layer.id === 0);
const pointCenter = pointCrosscheck ? geometryCenter(pointCrosscheck.feature.geometry) : null;
const crosscheckDistanceM = pointCenter ? Math.round(haversineMeters({ lat: center.lat, lon: center.lon }, { lat: pointCenter.lat, lon: pointCenter.lon }) * 10) / 10 : null;

if (pointCenter && crosscheckDistanceM > 150) {
  throw new Error(`Official polygon/site representation point and official point layer differ by ${crosscheckDistanceM} m; manual review required.`);
}

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const point = { lat: center.lat, lon: center.lon };
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

const sourceObjectId = `askeladden-lokalitet:${localityId}`;
const result = {
  ok: true,
  status: "verified_geometry_candidate",
  placeId,
  localityId,
  sourceProvider: "official_heritage_registry",
  sourceName: "Riksantikvaren BetaKulturminner / Askeladden distribution service",
  sourceObjectId,
  selectedLayer: preferred.layer.name,
  selectedLayerId: preferred.layer.id,
  selectedFeatureId: preferred.feature.id,
  sourceUrl: preferred.layer.url,
  geometryType: preferred.feature.geometry.type,
  center,
  pointCrosscheck: pointCrosscheck ? {
    layer: pointCrosscheck.layer.name,
    featureId: pointCrosscheck.feature.id,
    center: pointCenter,
    distanceM: crosscheckDistanceM,
  } : null,
  properties: preferred.feature.properties,
  matchedFeatures: relevant.map(({ layer, feature }) => ({
    layer: layer.name,
    layerId: layer.id,
    featureId: feature.id,
    properties: feature.properties,
  })),
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const decision = {
  version: "2026-07-21",
  placeId,
  localityId,
  sourceProvider: result.sourceProvider,
  sourceObjectId,
  sourceUrl: result.sourceUrl,
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
    coordSource: "riksantikvaren_askeladden_distribution",
    coordType: center.method === "official_point" ? "heritage_object_point" : "heritage_site_centroid",
    coordNote: `Representasjonspunkt avledet fra Riksantikvarens offisielle registrerte geometri for Askeladden-lokalitet ${localityId}. Punktet representerer helleristningsfeltet på Ekeberg, ikke Karlsborgveien, Kongsveien eller Ekebergparken som helhet.`,
  },
  primaryCategory: "historie",
  productionGate: identityMatches.length === 0 ? "ready_for_canonical_production" : "identity_review_required",
  representationDecision: "Create one canonical history place for the registered Ekeberg rock-carving field. The physical anchor is the official Askeladden/Riksantikvaren feature matched through LokalitetID/KulturminneID 41907; no postal-address or park proxy is used.",
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
writeFileSync(`${reportDir}/README.md`, `# Helleristningene på Ekeberg — official Askeladden coordinate intake\n\nDate: 2026-07-21\n\n- Candidate: \`${placeId}\`\n- Askeladden locality ID: **${localityId}**\n- Selected official layer: **${preferred.layer.name} (${preferred.layer.id})**\n- Selected feature: **${preferred.feature.id}**\n- Geometry type: **${preferred.feature.geometry.type}**\n- Representation point: **${center.lat}, ${center.lon}**\n- Official point cross-check distance: **${crosscheckDistanceM ?? "not available"} m**\n- Proposed category: **historie**\n\nThe runner queries Riksantikvaren's official ArcGIS distribution service using both Askeladden ID models: \`LokalitetID = 41907\` and \`KulturminneID = 41907 / 41907-*\`. The selected feature must also identify Ekeberg, the rock carvings or Sjømannsskolen. No nearby postal address or Ekebergparken proxy is accepted.\n\n## Selected official properties\n\n\`\`\`json\n${JSON.stringify(preferred.feature.properties, null, 2)}\n\`\`\`\n\n## Nearest canonical places\n\n${nearestLines}\n`, "utf8");

console.log(`Resolved Ekeberg rock carvings through official Askeladden ID fields: ${center.lat}, ${center.lon} (${preferred.feature.geometry.type}).`);
