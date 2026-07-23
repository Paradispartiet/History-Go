import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const reportDir = "reports/visitoslo-galleries-audit-20260723/institutional-scope-intake-v4";
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
function nearest(places, point, limit = 15) {
  return places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile, distanceM: Math.round(haversineMeters(point, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM).slice(0, limit);
}
function identityMatches(places, id, name) {
  return places.filter((p) => norm(p.id) === norm(id) || norm(p.name) === norm(name)).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile }));
}
function save(id, result) {
  mkdirSync(`${reportDir}/${id}`, { recursive: true });
  writeFileSync(`${reportDir}/${id}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
}
async function geonorgeRaw(query) {
  const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Geonorge HTTP ${response.status} for ${query}`);
  return { url, payload: await response.json() };
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];
const results = [];

// Fotogalleriet: preserve the unresolved official address cluster without inventing a production coordinate.
const fotoId = "fotogalleriet";
const fotoIdentity = identityMatches(places, fotoId, "Fotogalleriet");
if (fotoIdentity.length) throw new Error(`Fotogalleriet already canonical: ${JSON.stringify(fotoIdentity)}`);
const fotoGeo = await geonorgeRaw("Møllergata 34 0179 Oslo");
const letterHits = (fotoGeo.payload?.adresser ?? []).filter((hit) => norm(hit.adressenavn) === norm("Møllergata") && String(hit.nummer ?? "") === "34" && String(hit.postnummer ?? "") === "0179" && String(hit.kommunenummer ?? "") === "0301" && ["A", "B", "C", "D"].includes(String(hit.bokstav ?? "")));
if (letterHits.length !== 4) throw new Error(`Expected four Møllergata 34A-D hits, got ${letterHits.length}.`);
const cluster = letterHits.map((hit) => ({
  label: `Møllergata 34${hit.bokstav}`,
  sourceObjectId: `geonorge-adresser-v1:${hit.kommunenummer}:${hit.adressekode}:${hit.nummer}${hit.bokstav}`,
  lat: Number(hit.representasjonspunkt?.lat),
  lon: Number(hit.representasjonspunkt?.lon)
}));
const auditCentroid = {
  lat: cluster.reduce((sum, p) => sum + p.lat, 0) / cluster.length,
  lon: cluster.reduce((sum, p) => sum + p.lon, 0) / cluster.length
};
const fotoNearest = nearest(places, auditCentroid);
const fotoResult = {
  version: DATE,
  placeId: fotoId,
  name: "Fotogalleriet",
  founded: 1977,
  institutionClass: "noncommercial_camera_based_art_institution",
  status: "institutional_scope_supported_coordinate_blocked",
  productionCoordinate: null,
  coordinateBlockReason: "The official published address is Møllergata 34 without a letter, while Geonorge exposes four distinct address points 34A-D and no exact named OSM institution object was found. No first-hit, nearest-letter or synthetic centroid may be applied as canonical coordinate.",
  officialAddressCluster: { publishedAddress: "Møllergata 34, 0179 Oslo", sourceUrl: fotoGeo.url, addressPoints: cluster },
  auditOnlyCentroid: { ...auditCentroid, canApplyToPlace: false, purpose: "proximity review only" },
  physicalScopeGate: { canonicalIdentityMatches: [], canonicalPlacesWithin35mOfAuditCentroid: fotoNearest.filter((p) => p.distanceM <= 35), nearestCanonicalPlacesFromAuditCentroid: fotoNearest }
};
save(fotoId, fotoResult);
results.push(fotoResult);
console.log(`fotogalleriet: institutional scope supported; coordinate blocked; cluster=${cluster.map((p) => p.label).join(",")}`);

const addressCandidates = [
  { placeId: "kunstnerforbundet", name: "Kunstnerforbundet", query: "Kjeld Stubs gate 3 0160 Oslo", founded: 1910, institutionClass: "artist_run_noncommercial_exhibition_institution" },
  { placeId: "soft_galleri", name: "SOFT galleri", query: "Rådhusgata 20 0151 Oslo", founded: 2006, institutionClass: "artist_organization_run_textile_art_gallery" },
  { placeId: "oslo_kunstforening", name: "Oslo Kunstforening", query: "Rådhusgata 19 0158 Oslo", founded: 1836, institutionClass: "noncommercial_membership_art_institution" }
];

for (const candidate of addressCandidates) {
  const existing = identityMatches(places, candidate.placeId, candidate.name);
  if (existing.length) throw new Error(`${candidate.placeId} already canonical: ${JSON.stringify(existing)}`);
  const run = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", candidate.query], { encoding: "utf8" });
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  const addressResult = JSON.parse(String(run.stdout || "").trim());
  if (addressResult?.status !== "verified_candidate") throw new Error(`${candidate.placeId}: expected verified address candidate, got ${addressResult?.status ?? "unknown"}.`);
  const point = { lat: Number(addressResult.coordinate.lat), lon: Number(addressResult.coordinate.lon) };
  const nearby = nearest(places, point);
  const result = {
    version: DATE,
    ...candidate,
    status: "verified_address_scope_candidate",
    coordinate: { ...addressResult.coordinate, sourceUrl: addressResult.sourceUrl },
    physicalScopeGate: { canonicalIdentityMatches: [], canonicalPlacesWithin35m: nearby.filter((p) => p.distanceM <= 35), nearestCanonicalPlaces: nearby, requiresManualParentOverlapDecision: nearby.some((p) => p.distanceM <= 35) }
  };
  save(candidate.placeId, result);
  results.push(result);
  console.log(`${candidate.placeId}: ${addressResult.sourceObjectId}; <=35m=${result.physicalScopeGate.canonicalPlacesWithin35m.map((p) => `${p.id}:${p.distanceM}`).join(",") || "none"}`);
}

const summary = {
  version: DATE,
  total: 4,
  coordinateReady: results.filter((r) => r.coordinate).length,
  coordinateBlocked: results.filter((r) => !r.coordinate).length,
  candidates: results.map((r) => ({ placeId: r.placeId, name: r.name, status: r.status, coordinate: r.coordinate ?? null, coordinateBlockReason: r.coordinateBlockReason ?? null, canonicalPlacesWithin35m: r.physicalScopeGate.canonicalPlacesWithin35m ?? r.physicalScopeGate.canonicalPlacesWithin35mOfAuditCentroid ?? [], nearestCanonicalPlaces: r.physicalScopeGate.nearestCanonicalPlaces ?? r.physicalScopeGate.nearestCanonicalPlacesFromAuditCentroid ?? [], officialAddressCluster: r.officialAddressCluster ?? null }))
};
writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
const table = summary.candidates.map((r) => `| ${r.placeId} | ${r.status} | ${r.coordinate ? `${r.coordinate.lat}, ${r.coordinate.lon}` : "BLOCKED"} | ${r.canonicalPlacesWithin35m.map((p) => `${p.id} (${p.distanceM} m)`).join("; ") || "—"} |`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# Institutional gallery physical-scope intake v4\n\nDate: ${DATE}\n\n| placeId | Status | Coordinate | Canonical places within 35 m |\n|---|---|---|---|\n${table}\n\nFotogalleriet is deliberately coordinate-blocked rather than assigned a guessed Møllergata 34A-D point. The four official address points are preserved in its result file. The remaining three candidates use normal address-first coordinates and are ready for parent/co-location scope review.\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
