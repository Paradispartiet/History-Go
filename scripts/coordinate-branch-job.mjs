import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "toyen_hovedgard";
const addressQuery = "Trondheimsveien 23B Oslo";
const reportDir = "reports/visitoslo-oslo-east-audit-20260720/toyen-hovedgard";
mkdirSync(reportDir, { recursive: true });

function run(command, args) {
  const output = execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  process.stdout.write(output);
  return output;
}
function parseJson(output) {
  const text = output.trim();
  try { return JSON.parse(text); } catch {
    const start = text.indexOf("{");
    if (start >= 0) return JSON.parse(text.slice(start));
    throw new Error("Coordinate finder did not return JSON.");
  }
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

run("npm", ["run", "build:tools"]);
const result = parseJson(run("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", addressQuery]));
if (!result?.ok || result.status !== "verified_candidate" || !result.coordinate) {
  throw new Error(`No verified Tøyen hovedgård address candidate: ${result?.status ?? "unknown"}`);
}
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const point = { lat: Number(result.coordinate.lat), lon: Number(result.coordinate.lon) };
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

const identityMatches = places.filter((place) => {
  const text = `${place.id ?? ""} ${place.name ?? ""}`.toLowerCase();
  return text.includes("toyen_hovedgard") || text.includes("tøyen hovedgård") || text.includes("toyen hovedgard");
}).map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));

const expectedParents = nearest.filter((place) => ["botanisk_hage", "naturhistorisk_museum", "klimahuset", "toyen_torg"].includes(place.id));
const decision = {
  version: "2026-07-20",
  placeId,
  addressQuery,
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: result.coordinate,
  proposedPrimaryCategory: "historie",
  productionGate: "coordinate_ready_overlap_review_pending",
  representationDecision: "Model Tøyen hovedgård as the historic protected manor complex itself. Keep it distinct from Botanisk hage as the enclosing garden, Naturhistorisk museum as the broader institution, Klimahuset as a separate modern exhibition building, and Tøyen torg as the urban neighbourhood square.",
  duplicateGate: {
    canonicalIdentityMatches: identityMatches,
    nearestCanonicalPlaces: nearest,
    expectedRelatedPlaces: expectedParents,
    conclusion: identityMatches.length === 0
      ? "No canonical Tøyen hovedgård identity exists. Review the exact address point against the nearby parent/campus places; institutional or geographic containment is not a duplicate condition."
      : "Potential identity match found and must be resolved before production.",
  },
  sourceNotes: [
    "Oslo byleksikon identifies Tøyen hovedgård as gnr. 128/1 at Trondheimsveien 23B and describes the protected main building as first recorded in 1721, partly over a 17th-century cellar.",
    "VisitOSLO describes the manor as a historic protected building inside Botanisk hage, separate from the garden as a whole.",
    "The estate was transferred to the University in 1812 and the surrounding land later became the Botanical Garden."
  ]
};
writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`, "utf8");

const nearestLines = nearest.map((place) => `- ${place.id} — ${place.name} (${place.category}), ${place.distanceM} m`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# Tøyen hovedgård — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Address tested: **${addressQuery}**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n- Coordinate: **${result.coordinate.lat}, ${result.coordinate.lon}**\n- Proposed primary category: **historie**\n\nNo canonical place is created by this intake. The address point must be checked against the nearby garden/museum parent places before production.\n\n## Nearest canonical places\n\n${nearestLines}\n`, "utf8");
console.log(`Saved Tøyen hovedgård coordinate intake: ${result.status}`);
