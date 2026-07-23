import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const reportDir = "reports/visitoslo-galleries-audit-20260723/institutional-scope-intake-v3";
mkdirSync(reportDir, { recursive: true });

const addressCandidates = [
  { placeId: "kunstnerforbundet", name: "Kunstnerforbundet", query: "Kjeld Stubs gate 3 0160 Oslo", founded: 1910, institutionClass: "artist_run_noncommercial_exhibition_institution" },
  { placeId: "soft_galleri", name: "SOFT galleri", query: "Rådhusgata 20 0151 Oslo", founded: 2006, institutionClass: "artist_organization_run_textile_art_gallery" },
  { placeId: "oslo_kunstforening", name: "Oslo Kunstforening", query: "Rådhusgata 19 0158 Oslo", founded: 1836, institutionClass: "noncommercial_membership_art_institution" }
];

function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
}
function haversineMeters(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function nearestPlaces(places, point, limit = 15) {
  return places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile, distanceM: Math.round(haversineMeters(point, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM).slice(0, limit);
}
function identityMatches(places, placeId, name) {
  return places.filter((place) => norm(place.id) === norm(placeId) || norm(place.name) === norm(name)).map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
}
function writeResult(placeId, result) {
  mkdirSync(`${reportDir}/${placeId}`, { recursive: true });
  writeFileSync(`${reportDir}/${placeId}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
}
async function fetchJson(url, headers = {}) {
  const response = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  const text = await response.text();
  if (!response.ok) throw new Error(`${url} -> HTTP ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const results = [];

// Fotogalleriet: official address is Møllergata 34 without a letter, while Geonorge exposes four
// separate exact address objects 34A-D on the same property. Resolve the institution through an
// exact named OSM gallery object, then cross-check it against all four official address points.
const fotogallerietId = "fotogalleriet";
const fotoIdentity = identityMatches(places, fotogallerietId, "Fotogalleriet");
if (fotoIdentity.length) throw new Error(`Fotogalleriet identity already exists: ${JSON.stringify(fotoIdentity)}`);

const geoUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent("Møllergata 34 0179 Oslo")}`;
const geoPayload = await fetchJson(geoUrl);
const geoHits = (geoPayload?.adresser ?? []).filter((hit) =>
  norm(hit.adressenavn) === norm("Møllergata") &&
  String(hit.nummer ?? "").trim() === "34" &&
  String(hit.postnummer ?? "").trim() === "0179" &&
  String(hit.kommunenummer ?? "").trim() === "0301" &&
  ["A", "B", "C", "D"].includes(String(hit.bokstav ?? "").trim())
);
if (geoHits.length !== 4) throw new Error(`Fotogalleriet: expected four Møllergata 34A-D cross-check hits, found ${geoHits.length}.`);
const geoPoints = geoHits.map((hit) => ({
  label: `Møllergata 34${hit.bokstav}`,
  sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}${hit.bokstav}`,
  lat: Number(hit.representasjonspunkt?.lat),
  lon: Number(hit.representasjonspunkt?.lon)
}));
if (geoPoints.some((p) => !Number.isFinite(p.lat) || !Number.isFinite(p.lon))) throw new Error("Fotogalleriet: one or more 34A-D address points lack coordinates.");

const nomParams = new URLSearchParams({
  q: "Fotogalleriet, Oslo, Norway",
  format: "jsonv2",
  addressdetails: "1",
  extratags: "1",
  namedetails: "1",
  polygon_geojson: "1",
  limit: "20",
  bounded: "1",
  viewbox: "10.72,59.94,10.78,59.89"
});
const nomUrl = `https://nominatim.openstreetmap.org/search?${nomParams.toString()}`;
const nomRows = await fetchJson(nomUrl, { "User-Agent": "History-Go-coordinate-audit/1.0" });
const exactFotoRows = nomRows.filter((row) => {
  const names = [row.name, String(row.display_name ?? "").split(",")[0], ...Object.values(row.namedetails ?? {})].filter((v) => typeof v === "string").map(norm);
  return names.includes(norm("Fotogalleriet"));
});
const acceptedFotoRows = exactFotoRows.filter((row) => {
  const type = String(row.type ?? "").toLowerCase();
  const category = String(row.category ?? row.class ?? "").toLowerCase();
  return ["gallery", "arts_centre", "museum"].includes(type) || ["tourism", "amenity"].includes(category);
});
if (acceptedFotoRows.length !== 1) throw new Error(`Fotogalleriet: expected one exact named gallery/arts object, found ${acceptedFotoRows.length}: ${JSON.stringify(exactFotoRows.map((r) => ({ osm_type: r.osm_type, osm_id: r.osm_id, category: r.category, class: r.class, type: r.type, display_name: r.display_name })))}`);
const fotoRow = acceptedFotoRows[0];
const fotoPoint = { lat: Number(fotoRow.lat), lon: Number(fotoRow.lon) };
const fotoAddressDistances = geoPoints.map((p) => ({ ...p, distanceM: Math.round(haversineMeters(fotoPoint, p) * 10) / 10 }));
const nearestAddressDistanceM = Math.min(...fotoAddressDistances.map((p) => p.distanceM));
if (nearestAddressDistanceM > 100) throw new Error(`Fotogalleriet exact named object is ${nearestAddressDistanceM} m from nearest official Møllergata 34A-D point.`);
const fotoSourceObjectId = `osm-${fotoRow.osm_type}:${fotoRow.osm_id}`;
const fotoNearest = nearestPlaces(places, fotoPoint);
const fotoResult = {
  version: DATE,
  placeId: fotogallerietId,
  name: "Fotogalleriet",
  founded: 1977,
  institutionClass: "noncommercial_camera_based_art_institution",
  status: "verified_object_scope_candidate",
  coordinate: {
    lat: fotoPoint.lat,
    lon: fotoPoint.lon,
    r: 55,
    locatorType: fotoRow.geojson?.type === "Polygon" || fotoRow.geojson?.type === "MultiPolygon" ? "building" : "poi",
    sourceProvider: "osm",
    sourceObjectId: fotoSourceObjectId,
    geocodeAccuracy: fotoRow.geojson?.type === "Polygon" || fotoRow.geojson?.type === "MultiPolygon" ? "geometric_center" : "semantic_anchor",
    coordRole: "display_marker",
    coordStatus: "verified_geometry",
    coordSource: `OpenStreetMap ${fotoRow.osm_type} ${fotoRow.osm_id} – Fotogalleriet`,
    coordSourceUrl: `https://www.openstreetmap.org/${fotoRow.osm_type}/${fotoRow.osm_id}`,
    coordType: fotoRow.geojson?.type === "Polygon" || fotoRow.geojson?.type === "MultiPolygon" ? "gallery_center" : "gallery_point",
    coordNote: `Eksakt navngitt Fotogalleriet-objekt valgt etter at den offisielle besøksadressen Møllergata 34 viste seg å være fordelt på fire Geonorge-adresseobjekter 34A-D. Objektet ligger ${nearestAddressDistanceM} meter fra nærmeste offisielle adressepunkt og brukes som institusjonsmarkør uten å gjette hvilken bokstavadresse inngangen tilhører.`
  },
  addressCrosscheck: { sourceUrl: geoUrl, officialPublishedAddress: "Møllergata 34, 0179 Oslo", letteredAddressPoints: fotoAddressDistances },
  physicalScopeGate: { canonicalIdentityMatches: [], canonicalPlacesWithin35m: fotoNearest.filter((p) => p.distanceM <= 35), nearestCanonicalPlaces: fotoNearest, requiresManualParentOverlapDecision: fotoNearest.some((p) => p.distanceM <= 35) },
  exactObject: { osmType: fotoRow.osm_type, osmId: fotoRow.osm_id, category: fotoRow.category, class: fotoRow.class, type: fotoRow.type, displayName: fotoRow.display_name, geojsonType: fotoRow.geojson?.type ?? null },
  nominatimUrl: nomUrl
};
writeResult(fotogallerietId, fotoResult);
results.push(fotoResult);
console.log(`fotogalleriet: ${fotoSourceObjectId}; ${fotoPoint.lat},${fotoPoint.lon}; nearest34=${nearestAddressDistanceM}m; <=35m=${fotoResult.physicalScopeGate.canonicalPlacesWithin35m.map((p) => `${p.id}:${p.distanceM}`).join(",") || "none"}`);

// Remaining three institutions: normal address-first, now with postcode included.
for (const candidate of addressCandidates) {
  const existing = identityMatches(places, candidate.placeId, candidate.name);
  if (existing.length) throw new Error(`${candidate.placeId} identity already exists: ${JSON.stringify(existing)}`);
  const run = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", candidate.query], { encoding: "utf8" });
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  let addressResult;
  try { addressResult = JSON.parse(String(run.stdout || "").trim()); } catch { throw new Error(`${candidate.placeId}: address runner returned invalid JSON.`); }
  if (addressResult?.status !== "verified_candidate") throw new Error(`${candidate.placeId}: expected verified address candidate, got ${addressResult?.status ?? "unknown"}.`);
  const point = { lat: Number(addressResult.coordinate.lat), lon: Number(addressResult.coordinate.lon) };
  const nearest = nearestPlaces(places, point);
  const result = {
    version: DATE,
    ...candidate,
    status: "verified_address_scope_candidate",
    coordinate: { ...addressResult.coordinate, sourceUrl: addressResult.sourceUrl },
    physicalScopeGate: { canonicalIdentityMatches: [], canonicalPlacesWithin35m: nearest.filter((p) => p.distanceM <= 35), nearestCanonicalPlaces: nearest, requiresManualParentOverlapDecision: nearest.some((p) => p.distanceM <= 35) }
  };
  writeResult(candidate.placeId, result);
  results.push(result);
  console.log(`${candidate.placeId}: ${addressResult.sourceObjectId}; ${point.lat},${point.lon}; <=35m=${result.physicalScopeGate.canonicalPlacesWithin35m.map((p) => `${p.id}:${p.distanceM}`).join(",") || "none"}`);
}

const summary = {
  version: DATE,
  total: results.length,
  verifiedCandidates: results.length,
  candidatesRequiringParentOverlapDecision: results.filter((r) => r.physicalScopeGate.requiresManualParentOverlapDecision).length,
  results: results.map((r) => ({ placeId: r.placeId, name: r.name, founded: r.founded, institutionClass: r.institutionClass, status: r.status, coordinate: r.coordinate, canonicalPlacesWithin35m: r.physicalScopeGate.canonicalPlacesWithin35m, nearestCanonicalPlaces: r.physicalScopeGate.nearestCanonicalPlaces.slice(0, 10), addressCrosscheck: r.addressCrosscheck ?? null }))
};
writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
const rows = summary.results.map((r) => `| ${r.placeId} | ${r.name} | ${r.coordinate.lat}, ${r.coordinate.lon} | ${r.coordinate.sourceObjectId} | ${r.canonicalPlacesWithin35m.map((p) => `${p.id} (${p.distanceM} m)`).join("; ") || "—"} |`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# VisitOSLO gallery priority tranche — institutional physical-scope intake v3\n\nDate: ${DATE}\n\nFotogalleriet uses an exact named OSM institution object because the officially published house number Møllergata 34 maps to four separate Geonorge letter addresses A-D. All four official address points are retained as cross-checks. The remaining three institutions use the repository's normal Geonorge address-first method with postcode.\n\n| placeId | Institution | Coordinate | Source object | Canonical places within 35 m |\n|---|---|---|---|---|\n${rows}\n\nA co-located or nearby canonical place is not automatically a duplicate. The next clean scope decision evaluates institutional identity against any physical parent.\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
