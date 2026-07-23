import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const placeId = "soft_galleri";
const reportDir = "reports/visitoslo-galleries-audit-20260723/soft-gallery-anchor";
mkdirSync(reportDir, { recursive: true });

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
async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "History-Go-coordinate-audit/1.0" } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
if (places.some((p) => p.id === placeId || norm(p.name) === norm("SOFT galleri"))) throw new Error("SOFT galleri already canonical on current main.");
const photoHouse = places.find((p) => p.id === "fotografiens_hus");
if (!photoHouse) throw new Error("Expected fotografiens_hus canonical parent/co-located institution is missing.");

const queries = ["SOFT galleri, Oslo, Norway", "SOFT Gallery, Oslo, Norway", "Norske Tekstilkunstnere SOFT galleri, Oslo"];
const attempts = [];
const unique = new Map();
for (const q of queries) {
  const params = new URLSearchParams({ q, format: "jsonv2", addressdetails: "1", namedetails: "1", extratags: "1", polygon_geojson: "1", limit: "20", bounded: "1", viewbox: "10.72,59.93,10.76,59.89" });
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const rows = await fetchJson(url);
  attempts.push({ q, url, rows });
  for (const row of rows) unique.set(`${row.osm_type}:${row.osm_id}`, row);
}

const aliases = new Set(["soft galleri", "soft gallery", "norske tekstilkunstnere soft galleri"].map(norm));
const exact = [...unique.values()].filter((row) => {
  const names = [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})].filter((v) => typeof v === "string").map(norm);
  return names.some((name) => aliases.has(name));
});
const accepted = exact.filter((row) => {
  const type = String(row.type ?? "").toLowerCase();
  const category = String(row.category ?? row.class ?? "").toLowerCase();
  return ["gallery", "arts_centre", "artwork"].includes(type) || ["tourism", "amenity"].includes(category);
});

let status = "coordinate_blocked_no_distinct_named_object";
let selected = null;
if (accepted.length === 1) {
  const row = accepted[0];
  const point = { lat: Number(row.lat), lon: Number(row.lon) };
  const distanceFromPhotoHouseM = Math.round(haversineMeters(point, { lat: Number(photoHouse.lat), lon: Number(photoHouse.lon) }) * 10) / 10;
  const addressPoint = { lat: 59.90951628354778, lon: 10.74209892031479 };
  const distanceFromAddressM = Math.round(haversineMeters(point, addressPoint) * 10) / 10;
  if (distanceFromAddressM <= 80 && distanceFromPhotoHouseM >= 3) {
    status = "verified_distinct_entrance_candidate";
    selected = {
      sourceProvider: "osm",
      sourceObjectId: `osm-${row.osm_type}:${row.osm_id}`,
      sourceUrl: `https://www.openstreetmap.org/${row.osm_type}/${row.osm_id}`,
      lat: point.lat,
      lon: point.lon,
      r: 45,
      locatorType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "building" : "poi",
      geocodeAccuracy: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "geometric_center" : "semantic_anchor",
      coordRole: "display_marker",
      coordStatus: "verified_geometry",
      coordSource: `OpenStreetMap ${row.osm_type} ${row.osm_id} – SOFT galleri`,
      coordType: row.geojson?.type === "Polygon" || row.geojson?.type === "MultiPolygon" ? "gallery_center" : "gallery_point",
      distanceFromRadhusgata20AddressM: distanceFromAddressM,
      distanceFromFotografiensHusMarkerM: distanceFromPhotoHouseM,
      rawObject: { osmType: row.osm_type, osmId: row.osm_id, category: row.category, class: row.class, type: row.type, displayName: row.display_name, geojsonType: row.geojson?.type ?? null }
    };
  } else {
    status = "coordinate_blocked_object_not_physically_distinct_enough";
    selected = { candidateObject: { osmType: row.osm_type, osmId: row.osm_id, lat: point.lat, lon: point.lon, type: row.type, category: row.category, class: row.class }, distanceFromRadhusgata20AddressM: distanceFromAddressM, distanceFromFotografiensHusMarkerM: distanceFromPhotoHouseM };
  }
} else if (accepted.length > 1) {
  status = "coordinate_blocked_multiple_exact_objects";
}

const result = {
  version: DATE,
  placeId,
  status,
  scopeStatus: "approved_new_canonical_candidate",
  officialPhysicalEvidence: {
    address: "Rådhusgata 20, 0151 Oslo",
    ordinaryAddressPoint: { lat: 59.90951628354778, lon: 10.74209892031479, sourceObjectId: "geonorge-adresser-v1:0301:16115:20" },
    entranceStatement: "SOFT galleri oppgir inngang på hjørnet ved Rådhusgata 20 og et eget 33 m² utstillingsrom med stort vindu mot Rådhusgata.",
    sourceUrl: "https://www.softgalleri.no/om-oss/"
  },
  coLocatedCanonical: { placeId: "fotografiens_hus", lat: Number(photoHouse.lat), lon: Number(photoHouse.lon) },
  exactNamedCandidates: exact.map((row) => ({ osmType: row.osm_type, osmId: row.osm_id, category: row.category, class: row.class, type: row.type, displayName: row.display_name, lat: row.lat, lon: row.lon, geojsonType: row.geojson?.type ?? null })),
  acceptedCandidateCount: accepted.length,
  selected,
  searchAttempts: attempts
};
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
writeFileSync(`${reportDir}/README.md`, `# SOFT galleri — distinct entrance anchor audit\n\nDate: ${DATE}\n\nStatus: **${status}**\n\nThe ordinary Rådhusgata 20 address point is already used by \`fotografiens_hus\`. This audit accepts a separate SOFT marker only when one exact named gallery object is both close to the official address and at least 3 metres physically separated from the existing marker. No nearest/first-hit fallback is allowed.\n`, "utf8");
console.log(`SOFT galleri anchor audit: ${status}; exact=${exact.length}; accepted=${accepted.length}; selected=${selected?.sourceObjectId ?? "none"}`);
