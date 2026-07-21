import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const reportDir = "reports/visitoslo-oslofjord-audit-20260721/island-coordinate-intake";
mkdirSync(reportDir, { recursive: true });

const candidates = [
  { id: "heggholmen", name: "Heggholmen", kind: "island", viewbox: "10.60,59.94,10.84,59.80" },
  { id: "rambergoya", name: "Rambergøya", aliases: ["Rambergoya"], kind: "island", viewbox: "10.60,59.94,10.84,59.80" },
  { id: "ormoya", name: "Ormøya", aliases: ["Ormoya"], kind: "island", viewbox: "10.60,59.94,10.84,59.80" },
  { id: "malmoya", name: "Malmøya", aliases: ["Malmoya"], kind: "island", viewbox: "10.60,59.94,10.84,59.80" },
  { id: "nakholmen", name: "Nakholmen", kind: "island", viewbox: "10.60,59.94,10.84,59.80" },
  { id: "steilene", name: "Steilene", kind: "archipelago", viewbox: "10.40,59.95,10.75,59.72" },
  { id: "langoyene", name: "Langøyene", aliases: ["Langoyene"], kind: "island", viewbox: "10.55,59.94,10.82,59.78" },
  { id: "lindoya", name: "Lindøya", aliases: ["Lindoya"], kind: "island", viewbox: "10.60,59.94,10.84,59.80" },
  { id: "bleikoya", name: "Bleikøya", aliases: ["Bleikoya"], kind: "island", viewbox: "10.60,59.94,10.84,59.80" },
  { id: "ulvoya", name: "Ulvøya", aliases: ["Ulvoya"], kind: "island", viewbox: "10.65,59.94,10.86,59.80" }
];

const acceptedTypes = new Set(["island", "islet", "archipelago"]);

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function searchNominatim(candidate) {
  const names = [candidate.name, ...(candidate.aliases ?? [])];
  const attempts = [];
  const seen = new Map();
  for (const name of names) {
    const params = new URLSearchParams({
      q: `${name}, Norway`,
      format: "jsonv2",
      addressdetails: "1",
      extratags: "1",
      namedetails: "1",
      polygon_geojson: "1",
      limit: "20",
      bounded: "1",
      viewbox: candidate.viewbox
    });
    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "History-Go-coordinate-audit/1.0 (repo audit)"
      }
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Nominatim ${response.status} for ${candidate.id}: ${text.slice(0, 500)}`);
    const rows = JSON.parse(text);
    attempts.push({ query: name, url, resultCount: rows.length, rows });
    for (const row of rows) {
      const key = `${row.osm_type}:${row.osm_id}`;
      if (!seen.has(key)) seen.set(key, row);
    }
  }
  return { attempts, rows: [...seen.values()] };
}

function exactNameMatch(candidate, row) {
  const wanted = new Set([candidate.name, ...(candidate.aliases ?? [])].map(norm));
  const names = new Set();
  const firstDisplay = String(row.display_name ?? "").split(",")[0];
  if (firstDisplay) names.add(norm(firstDisplay));
  if (row.name) names.add(norm(row.name));
  for (const value of Object.values(row.namedetails ?? {})) {
    if (typeof value === "string") names.add(norm(value));
  }
  return [...names].some((name) => wanted.has(name));
}

function semanticallyAccepted(row) {
  const type = String(row.type ?? "").toLowerCase();
  const osmClass = String(row.class ?? "").toLowerCase();
  if (acceptedTypes.has(type)) return true;
  if (osmClass === "place" && (type.includes("island") || type.includes("islet") || type.includes("archipelago"))) return true;
  return false;
}

function geometryCenter(row) {
  const geometry = row.geojson;
  if (!geometry) return { lat: Number(row.lat), lon: Number(row.lon), method: "nominatim_object_point" };
  if (geometry.type === "Point") {
    return { lon: Number(geometry.coordinates[0]), lat: Number(geometry.coordinates[1]), method: "osm_object_point" };
  }
  const coords = [];
  const walk = (value) => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && !Array.isArray(value[0]) && Number.isFinite(Number(value[0])) && Number.isFinite(Number(value[1]))) {
      coords.push([Number(value[0]), Number(value[1])]);
      return;
    }
    for (const child of value) walk(child);
  };
  walk(geometry.coordinates);
  if (!coords.length) return { lat: Number(row.lat), lon: Number(row.lon), method: "nominatim_centroid_fallback" };
  return {
    lon: coords.reduce((sum, [lon]) => sum + lon, 0) / coords.length,
    lat: coords.reduce((sum, [, lat]) => sum + lat, 0) / coords.length,
    method: "osm_geometry_vertex_mean"
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

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const results = [];

for (const candidate of candidates) {
  const search = await searchNominatim(candidate);
  const exact = search.rows.filter((row) => exactNameMatch(candidate, row));
  const accepted = exact.filter(semanticallyAccepted);
  const selected = accepted.length === 1 ? accepted[0] : null;
  const center = selected ? geometryCenter(selected) : null;

  const identityMatches = places
    .filter((place) => norm(place.id) === norm(candidate.id) || norm(place.name) === norm(candidate.name))
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));

  const nearest = center
    ? places
      .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
      .map((place) => ({
        id: place.id,
        name: place.name,
        category: place.category,
        distanceM: Math.round(haversineMeters(center, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
        sourceFile: place.sourceFile
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 12)
    : [];

  const result = {
    version: "2026-07-21",
    placeId: candidate.id,
    name: candidate.name,
    kind: candidate.kind,
    status: selected && identityMatches.length === 0 ? "verified_object_candidate" : selected ? "identity_review_required" : "needs_review",
    selectionRule: "exact normalized name + accepted physical type within predefined Oslofjord viewbox; no nearest/first-hit",
    exactMatchCount: exact.length,
    acceptedExactMatchCount: accepted.length,
    selected: selected ? {
      osmType: selected.osm_type,
      osmId: selected.osm_id,
      sourceObjectId: `osm-${selected.osm_type}:${selected.osm_id}`,
      class: selected.class,
      type: selected.type,
      displayName: selected.display_name,
      lat: Number(center.lat),
      lon: Number(center.lon),
      geometryMethod: center.method,
      boundingbox: selected.boundingbox,
      geojsonType: selected.geojson?.type ?? null
    } : null,
    duplicateGate: {
      canonicalIdentityMatches: identityMatches,
      nearestCanonicalPlaces: nearest
    },
    exactCandidates: exact.map((row) => ({
      osmType: row.osm_type,
      osmId: row.osm_id,
      class: row.class,
      type: row.type,
      displayName: row.display_name,
      boundingbox: row.boundingbox,
      geojsonType: row.geojson?.type ?? null
    })),
    searchAttempts: search.attempts
  };

  mkdirSync(`${reportDir}/${candidate.id}`, { recursive: true });
  writeFileSync(`${reportDir}/${candidate.id}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  results.push(result);
  console.log(`${candidate.id}: ${result.status}; accepted exact matches=${accepted.length}; selected=${result.selected?.sourceObjectId ?? "none"}`);
}

const summary = {
  total: results.length,
  verifiedObjectCandidates: results.filter((row) => row.status === "verified_object_candidate").length,
  identityReviewRequired: results.filter((row) => row.status === "identity_review_required").length,
  needsReview: results.filter((row) => row.status === "needs_review").length
};
writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify({ version: "2026-07-21", summary, results: results.map((row) => ({ placeId: row.placeId, name: row.name, status: row.status, selected: row.selected, duplicateGate: row.duplicateGate })) }, null, 2)}\n`, "utf8");

const lines = results.map((row) => `| ${row.placeId} | ${row.name} | ${row.status} | ${row.selected?.sourceObjectId ?? "—"} | ${row.selected ? `${row.selected.lat}, ${row.selected.lon}` : "—"} | ${row.duplicateGate.canonicalIdentityMatches.map((m) => m.id).join(", ") || "—"} |`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# VisitOSLO Oslofjorden — island object-first coordinate intake\n\nDate: 2026-07-21\n\nMethod: exact normalized name plus accepted physical island/islet/archipelago object type inside a predefined Oslofjord search scope. The runner never accepts a nearest or first result merely because it is geographically close.\n\n## Summary\n\n- Total candidates: ${summary.total}\n- Verified object candidates: ${summary.verifiedObjectCandidates}\n- Identity review required: ${summary.identityReviewRequired}\n- Needs review: ${summary.needsReview}\n\n| placeId | Name | Status | Source object | Representation point | Canonical identity match |\n|---|---|---|---|---|---|\n${lines}\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
