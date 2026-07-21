import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-21";
const placeId = "holmenkollen_skimuseum";
const reportDir = "reports/visitoslo-holmenkollen-audit-20260721/skimuseum-coordinate-intake-v2";
mkdirSync(reportDir, { recursive: true });

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
function runAddress(address) {
  const run = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", address], { encoding: "utf8" });
  if (run.stdout) process.stdout.write(run.stdout);
  if (run.stderr) process.stderr.write(run.stderr);
  const result = JSON.parse(String(run.stdout || "").trim());
  return { address, exitCode: run.status, result };
}
function nearest(places, point) {
  return places.filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lon))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile, distanceM: Math.round(haversineMeters(point, { lat: Number(p.lat), lon: Number(p.lon) }) * 10) / 10 })).sort((a, b) => a.distanceM - b.distanceM).slice(0, 15);
}
function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const duplicates = places.filter((p) => p.id === placeId || ["skimuseet i holmenkollen", "holmenkollen ski museum", "skimuseet"].includes(norm(p.name))).map((p) => ({ id: p.id, name: p.name, category: p.category, sourceFile: p.sourceFile }));
if (duplicates.length) throw new Error(`Canonical Ski Museum identity already exists: ${JSON.stringify(duplicates)}`);
const parent = places.find((p) => p.id === "holmenkollen_nasjonalanlegg");
if (!parent) throw new Error("Expected holmenkollen_nasjonalanlegg on current main.");

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });
const address5 = runAddress("Kongeveien 5 Oslo");
const address40 = runAddress("Kongeveien 40 Oslo");
if (address5.result?.status !== "verified_candidate") throw new Error(`Kongeveien 5 did not resolve cleanly: ${address5.result?.status ?? "unknown"}`);
if (address40.result?.status !== "verified_candidate") throw new Error(`Kongeveien 40 did not resolve cleanly: ${address40.result?.status ?? "unknown"}`);

const point5 = { lat: Number(address5.result.coordinate.lat), lon: Number(address5.result.coordinate.lon) };
const point40 = { lat: Number(address40.result.coordinate.lat), lon: Number(address40.result.coordinate.lon) };
const addressSeparationM = Math.round(haversineMeters(point5, point40) * 10) / 10;
const parentDistance5M = Math.round(haversineMeters(point5, { lat: Number(parent.lat), lon: Number(parent.lon) }) * 10) / 10;
const parentDistance40M = Math.round(haversineMeters(point40, { lat: Number(parent.lat), lon: Number(parent.lon) }) * 10) / 10;

// Current visitor-facing sources (VisitOSLO listing + booking location + Holmenkollen.com/Skiforeningen footer)
// consistently identify Kongeveien 5. Kongeveien 40 remains documented as a conflicting access/directions address.
const selected = address5.result;
const coordinate = {
  lat: point5.lat,
  lon: point5.lon,
  r: 55,
  locatorType: "building",
  sourceProvider: "official_address",
  sourceObjectId: selected.sourceObjectId,
  geocodeAccuracy: "rooftop",
  coordRole: "display_marker",
  coordStatus: "verified",
  coordSource: "geonorge_adresser_v1",
  coordSourceId: selected.sourceObjectId,
  coordSourceUrl: selected.sourceUrl,
  coordType: "address_point",
  coordNote: `Offisiell adressekoordinat fra Geonorge for Kongeveien 5, valgt som Skimuseets besøksmarkør fordi dagens VisitOSLO-oppføring, VisitOSLOs bookinglokasjon og Holmenkollen.com/Skiforeningen-kontaktinformasjon bruker Kongeveien 5. En offisiell Skiforeningen-veibeskrivelse nevner også Kongeveien 40; dette punktet ligger ${addressSeparationM} meter unna og beholdes som dokumentert alternativ adkomst-/anleggsadresse, ikke som canonical museumsanker.`
};

const result = {
  version: DATE,
  placeId,
  name: "Skimuseet i Holmenkollen",
  status: "verified_museum_candidate",
  productionGate: "ready_for_canonical_production",
  primaryCategory: "historie",
  representationDecision: "Create the Ski Museum as a distinct persistent museum institution inside Holmenkollen National Ski Arena. The jump tower remains part of the parent arena identity.",
  addressConflictDecision: {
    selectedAddress: "Kongeveien 5, 0787 Oslo",
    selectedReason: "Current visitor-facing VisitOSLO listing and booking location, plus current Holmenkollen.com/Skiforeningen contact information, identify Kongeveien 5 for the Ski Museum. Kongeveien 40 is retained as a documented conflicting access/directions address rather than silently ignored.",
    addressSeparationM,
    selected: { query: address5.address, result: address5.result },
    alternate: { query: address40.address, result: address40.result }
  },
  coordinate,
  parentOverlapAudit: {
    parentPlaceId: "holmenkollen_nasjonalanlegg",
    parentName: parent.name,
    selectedAddressDistanceToParentM: parentDistance5M,
    alternateAddressDistanceToParentM: parentDistance40M,
    conclusion: "Physical proximity to the broad arena anchor is expected parent/child overlap, not identity duplication. The museum is a separate persistent institution; the arena remains the broader sports-infrastructure place."
  },
  duplicateGate: {
    canonicalIdentityMatches: [],
    nearestCanonicalPlaces: nearest(places, point5)
  }
};
writeJson(`${reportDir}/result.json`, result);
writeJson(`${reportDir}/decision.json`, result);
writeFileSync(`${reportDir}/README.md`, `# Skimuseet i Holmenkollen — corrected coordinate intake\n\nDate: ${DATE}\n\nStatus: **ready_for_canonical_production**\n\nSelected visitor address: **Kongeveien 5, 0787 Oslo**\n\nSelected source object: **${coordinate.sourceObjectId}**\n\nCoordinate: **${coordinate.lat}, ${coordinate.lon}**\n\nAlternative documented address: **Kongeveien 40**\n\nDistance between the two official address points: **${addressSeparationM} m**\n\nDistance from selected museum point to existing Holmenkollen National Ski Arena anchor: **${parentDistance5M} m**\n\nKongeveien 5 is selected because the current visitor-facing VisitOSLO listing, VisitOSLO booking location and current Holmenkollen.com/Skiforeningen contact information use that museum location. Kongeveien 40 is retained transparently as a conflicting access/directions address. No separate jump-tower marker is approved.\n`, "utf8");

console.log(`Skimuseet corrected intake: selected=${coordinate.sourceObjectId}; ${coordinate.lat},${coordinate.lon}; addressSeparationM=${addressSeparationM}; parentDistanceM=${parentDistance5M}`);
