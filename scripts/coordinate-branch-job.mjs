import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const reportDir = "reports/visitoslo-galleries-audit-20260723/institutional-scope-intake";
mkdirSync(reportDir, { recursive: true });

const candidates = [
  {
    placeId: "fotogalleriet",
    name: "Fotogalleriet",
    address: "Møllergata 34, 0179 Oslo",
    founded: 1977,
    institutionClass: "noncommercial_camera_based_art_institution",
    officialSource: "https://fotogalleriet.no/no/visit/"
  },
  {
    placeId: "kunstnerforbundet",
    name: "Kunstnerforbundet",
    address: "Kjeld Stubs gate 3 Oslo",
    founded: 1910,
    institutionClass: "artist_run_noncommercial_exhibition_institution",
    officialSource: "https://kunstnerforbundet.no/om-kunstnerforbundet"
  },
  {
    placeId: "soft_galleri",
    name: "SOFT galleri",
    address: "Rådhusgata 20 Oslo",
    founded: 2006,
    institutionClass: "artist_organization_run_textile_art_gallery",
    officialSource: "https://www.softgalleri.no/about-soft-gallery/"
  },
  {
    placeId: "oslo_kunstforening",
    name: "Oslo Kunstforening",
    address: "Rådhusgata 19 Oslo",
    founded: 1836,
    institutionClass: "noncommercial_membership_art_institution",
    officialSource: "https://oslokunstforening.no/om-oss"
  }
];

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
function haversineMeters(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function nearestPlaces(places, point, limit = 15) {
  return places
    .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
    .map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      distanceM: Math.round(haversineMeters(point, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
      sourceFile: place.sourceFile,
      lat: Number(place.lat),
      lon: Number(place.lon)
    }))
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, limit);
}

async function resolveStructuredFotogallerietAddress() {
  const url = new URL("https://ws.geonorge.no/adresser/v1/sok");
  url.searchParams.set("adressenavn", "Møllergata");
  url.searchParams.set("nummer", "34");
  url.searchParams.set("kommunenummer", "0301");
  url.searchParams.set("treffPerSide", "100");
  url.searchParams.set("side", "0");

  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`fotogalleriet: structured Geonorge query failed with HTTP ${response.status}.`);
  const payload = await response.json();
  const addresses = Array.isArray(payload?.adresser) ? payload.adresser : [];
  const exact = addresses.filter((hit) =>
    norm(hit?.adressenavn) === norm("Møllergata") &&
    Number(hit?.nummer) === 34 &&
    String(hit?.kommunenummer ?? "") === "0301" &&
    String(hit?.postnummer ?? "") === "0179"
  );

  writeFileSync(`${reportDir}/fotogalleriet-geonorge-structured-query.json`, `${JSON.stringify({ sourceUrl: url.toString(), total: addresses.length, exact }, null, 2)}\n`, "utf8");

  if (exact.length !== 1) {
    throw new Error(`fotogalleriet: expected one exact structured Geonorge hit, got ${exact.length}. See saved structured-query evidence.`);
  }
  const hit = exact[0];
  const point = hit?.representasjonspunkt;
  if (!Number.isFinite(Number(point?.lat)) || !Number.isFinite(Number(point?.lon))) {
    throw new Error("fotogalleriet: exact Geonorge hit has no usable representasjonspunkt.");
  }
  const addressCode = hit?.adressekode;
  if (addressCode === undefined || addressCode === null) throw new Error("fotogalleriet: exact Geonorge hit has no adressekode.");

  return {
    status: "verified_candidate",
    coordinate: { lat: Number(point.lat), lon: Number(point.lon) },
    sourceObjectId: `geonorge-adresser-v1:0301:${addressCode}:34`,
    sourceUrl: url.toString(),
    address: {
      street: hit.adressenavn,
      number: `${hit.nummer}${hit.bokstav ?? ""}`,
      postcode: hit.postnummer,
      city: hit.poststed,
      country: "NO"
    },
    resolutionNote: "Structured official Geonorge field query used because the repository free-text address finder returned multiple ambiguous hits for Møllergata 34."
  };
}

function resolveWithRepositoryFinder(candidate) {
  const run = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", candidate.address], { encoding: "utf8" });
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  let addressResult;
  try {
    addressResult = JSON.parse(String(run.stdout || "").trim());
  } catch {
    throw new Error(`${candidate.placeId}: address runner did not return JSON.`);
  }
  if (addressResult?.status !== "verified_candidate") {
    throw new Error(`${candidate.placeId}: expected verified address candidate, got ${addressResult?.status ?? "unknown"}.`);
  }
  return addressResult;
}

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const results = [];

for (const candidate of candidates) {
  const addressResult = candidate.placeId === "fotogalleriet"
    ? await resolveStructuredFotogallerietAddress()
    : resolveWithRepositoryFinder(candidate);

  const point = { lat: Number(addressResult.coordinate.lat), lon: Number(addressResult.coordinate.lon) };
  const identityMatches = places
    .filter((place) => norm(place.id) === norm(candidate.placeId) || norm(place.name) === norm(candidate.name))
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
  const nearest = nearestPlaces(places, point);
  const exactOrNearOccupants = nearest.filter((place) => place.distanceM <= 35);

  const result = {
    version: DATE,
    ...candidate,
    status: identityMatches.length ? "identity_review_required" : "verified_address_scope_candidate",
    coordinate: {
      lat: point.lat,
      lon: point.lon,
      sourceProvider: "official_address",
      sourceObjectId: addressResult.sourceObjectId,
      sourceUrl: addressResult.sourceUrl,
      address: addressResult.address,
      locatorType: "building",
      geocodeAccuracy: "rooftop",
      coordRole: "display_marker",
      coordStatus: "verified",
      coordSource: "geonorge_adresser_v1",
      coordType: "address_point",
      resolutionNote: addressResult.resolutionNote ?? null
    },
    physicalScopeGate: {
      canonicalIdentityMatches: identityMatches,
      canonicalPlacesWithin35m: exactOrNearOccupants,
      nearestCanonicalPlaces: nearest,
      requiresManualParentOverlapDecision: exactOrNearOccupants.length > 0
    }
  };
  mkdirSync(`${reportDir}/${candidate.placeId}`, { recursive: true });
  writeFileSync(`${reportDir}/${candidate.placeId}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  results.push(result);
  console.log(`${candidate.placeId}: ${result.status}; ${point.lat}, ${point.lon}; <=35m canonical=${exactOrNearOccupants.map((p) => `${p.id}:${p.distanceM}`).join(",") || "none"}`);
}

const summary = {
  version: DATE,
  total: results.length,
  verifiedAddressScopeCandidates: results.filter((r) => r.status === "verified_address_scope_candidate").length,
  identityReviewRequired: results.filter((r) => r.status === "identity_review_required").length,
  candidatesRequiringParentOverlapDecision: results.filter((r) => r.physicalScopeGate.requiresManualParentOverlapDecision).length,
  results: results.map((r) => ({
    placeId: r.placeId,
    name: r.name,
    founded: r.founded,
    status: r.status,
    coordinate: r.coordinate,
    canonicalPlacesWithin35m: r.physicalScopeGate.canonicalPlacesWithin35m,
    nearestCanonicalPlaces: r.physicalScopeGate.nearestCanonicalPlaces.slice(0, 8)
  }))
};
writeFileSync(`${reportDir}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const rows = summary.results.map((r) => `| ${r.placeId} | ${r.name} | ${r.coordinate.lat}, ${r.coordinate.lon} | ${r.canonicalPlacesWithin35m.map((p) => `${p.id} (${p.distanceM} m)`).join("; ") || "—"} |`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# VisitOSLO gallery priority tranche — institutional physical-scope intake\n\nDate: ${DATE}\n\nFour noncommercial or institutionally durable gallery candidates from the bounded VisitOSLO priority tranche were resolved through official Geonorge address methods and checked against current canonical proximity. Fotogalleriet required a structured field query because the repository free-text finder returned ambiguous Møllergata 34 results.\n\n| placeId | Institution | Exact address coordinate | Canonical places within 35 m |\n|---|---|---|---|\n${rows}\n\nA nearby or co-located canonical place is not automatically a duplicate. The next manual gate must decide whether the institution has an independently meaningful visitor/place identity or should resolve to the existing physical parent.\n`, "utf8");

console.log(JSON.stringify(summary, null, 2));
