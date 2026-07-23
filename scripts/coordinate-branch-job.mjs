import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const reportDir = "reports/visitoslo-parks-nature-audit-20260721/remaining-coordinate-intake-20260723";
mkdirSync(reportDir, { recursive: true });

const candidates = [
  { placeId: "lillomarka", name: "Lillomarka", osmId: "R5806405", expectedTypes: ["woodland", "forest"], scopeRule: "Named Marka/woodland area; never a trailhead proxy." },
  { placeId: "grorudparken", name: "Grorudparken", osmId: "W125848624", expectedTypes: ["park"], scopeRule: "Exact named park, distinct from the broad Grorud district." },
  { placeId: "aamot_bru", name: "Åmot bru", aliases: ["Aamot bru", "Aamodt bru"], osmId: "W791117473", expectedTypes: ["bridge"], scopeRule: "Exact physical bridge object in the Akerselva system." },
  { placeId: "klosterenga_skulpturpark", name: "Klosterenga skulpturpark", aliases: ["Klosterenga", "Klosterenga park"], osmId: "W4874898", expectedTypes: ["park"], scopeRule: "Whole named park/public-art environment; individual artworks remain nested or separate exact objects where already canonical." },
  { placeId: "brekkedammen", name: "Brekkedammen", aliases: ["Kjelsåsdammen"], osmId: "W66357555", expectedTypes: ["weir"], scopeRule: "VisitOSLO Frysja/Brekkedammen recreation identity; the named weir is evidence but must not automatically redefine the whole bathing/recreation place." },
  { placeId: "peer_gynt_parken", name: "Peer Gynt-parken", aliases: ["Peer Gynt park"], osmId: "W126850692", expectedTypes: ["park"], scopeRule: "Exact named sculpture park at Løren, distinct from individual sculptures and the wider neighbourhood." }
];

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}
function haversineMeters(a, b) {
  const rad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function nearest(places, point, limit = 15) {
  return places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile, distanceM: Math.round(haversineMeters(point, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM).slice(0, limit);
}
async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "History-Go-coordinate-audit/1.0" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const osmIds = candidates.map((c) => c.osmId).join(",");
const lookupParams = new URLSearchParams({ osm_ids: osmIds, format: "jsonv2", addressdetails: "1", extratags: "1", namedetails: "1", polygon_geojson: "1" });
const lookupUrl = `https://nominatim.openstreetmap.org/lookup?${lookupParams.toString()}`;
const rows = await fetchJson(lookupUrl);
const byObject = new Map(rows.map((row) => [`${String(row.osm_type).slice(0,1).toUpperCase()}${row.osm_id}`, row]));

const results = [];
for (const candidate of candidates) {
  const row = byObject.get(candidate.osmId);
  if (!row) throw new Error(`${candidate.placeId}: locked OSM object ${candidate.osmId} did not resolve in Nominatim lookup.`);
  const names = [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})].filter((v) => typeof v === "string").map(norm);
  const wanted = [candidate.name, ...(candidate.aliases ?? [])].map(norm);
  const exactName = names.some((name) => wanted.includes(name));
  if (!exactName) throw new Error(`${candidate.placeId}: locked object ${candidate.osmId} no longer carries an accepted exact name. Names: ${JSON.stringify(names)}`);
  const point = { lat: Number(row.lat), lon: Number(row.lon) };
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lon)) throw new Error(`${candidate.placeId}: missing representation point.`);
  const duplicates = places.filter((p) => norm(p.id) === norm(candidate.placeId) || wanted.includes(norm(p.name))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile }));
  const nearby = nearest(places, point);
  const type = String(row.type ?? "").toLowerCase();
  const category = String(row.category ?? row.class ?? "").toLowerCase();
  const typeAccepted = candidate.expectedTypes.some((expected) => type === expected || category === expected);
  const status = candidate.placeId === "brekkedammen"
    ? "locked_object_needs_recreation_scope_anchor_decision"
    : typeAccepted && duplicates.length === 0
      ? "verified_locked_object_candidate"
      : "manual_review_required";
  const result = {
    version: DATE,
    placeId: candidate.placeId,
    name: candidate.name,
    status,
    sourceScopePr: 3144,
    sourceIntakePr: 3146,
    scopeRule: candidate.scopeRule,
    lockedObject: {
      sourceProvider: "osm",
      sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
      sourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
      osmType: row.osm_type,
      osmId: row.osm_id,
      category: row.category,
      class: row.class,
      type: row.type,
      displayName: row.display_name,
      lat: point.lat,
      lon: point.lon,
      boundingbox: row.boundingbox,
      geojsonType: row.geojson?.type ?? null,
      geojson: row.geojson ?? null
    },
    gates: {
      exactAcceptedName: exactName,
      expectedObjectTypeAccepted: typeAccepted,
      canonicalIdentityMatches: duplicates,
      canonicalPlacesWithin50m: nearby.filter((p) => p.distanceM <= 50),
      nearestCanonicalPlaces: nearby
    }
  };
  mkdirSync(`${reportDir}/${candidate.placeId}`, { recursive: true });
  writeFileSync(`${reportDir}/${candidate.placeId}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  results.push(result);
  console.log(`${candidate.placeId}: ${status}; ${row.osm_type}:${row.osm_id}; ${point.lat},${point.lon}; type=${type}; duplicates=${duplicates.length}`);
}

const summary = {
  version: DATE,
  lookupUrl,
  total: results.length,
  verifiedLockedObjectCandidates: results.filter((r) => r.status === "verified_locked_object_candidate").length,
  recreationScopeAnchorReview: results.filter((r) => r.status === "locked_object_needs_recreation_scope_anchor_decision").length,
  manualReviewRequired: results.filter((r) => r.status === "manual_review_required").length,
  results: results.map((r) => ({ placeId: r.placeId, name: r.name, status: r.status, lockedObject: { sourceObjectId: r.lockedObject.sourceObjectId, lat: r.lockedObject.lat, lon: r.lockedObject.lon, type: r.lockedObject.type, category: r.lockedObject.category, geojsonType: r.lockedObject.geojsonType }, gates: r.gates }))
};
writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
const table = summary.results.map((r) => `| ${r.placeId} | ${r.status} | ${r.lockedObject.sourceObjectId} | ${r.lockedObject.lat}, ${r.lockedObject.lon} | ${r.lockedObject.type ?? "—"} | ${r.gates.canonicalPlacesWithin50m.map((p) => `${p.id} (${p.distanceM} m)`).join("; ") || "—"} |`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# VisitOSLO parks/nature — remaining coordinate revalidation\n\nDate: ${DATE}\n\nThe six unproduced candidates are revalidated against the exact OSM object IDs captured in intake PR #3146 and against current canonical runtime data. No nearest/first-hit selection is allowed.\n\n| placeId | Status | Locked object | Representation point | Type | Canonical places within 50 m |\n|---|---|---|---|---|---|\n${table}\n\nBrekkedammen is intentionally held to a separate recreation-scope anchor decision because the locked named OSM object is a weir; it is valid evidence for the place identity but does not automatically represent the full VisitOSLO bathing/recreation site.\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
