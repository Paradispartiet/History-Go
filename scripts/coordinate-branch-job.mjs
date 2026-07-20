import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "museumsleiligheten_grabein";
const addressQuery = "Tøyengata 38 Oslo";
const reportDir = "reports/visitoslo-oslo-east-audit-20260720/museumsleiligheten-grabein";
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
function norm(value) {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a").replace(/[^a-z0-9]+/g, " ").trim();
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
  throw new Error(`No verified Museumsleiligheten Gråbein address candidate: ${result?.status ?? "unknown"}`);
}
writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const point = { lat: Number(result.coordinate.lat), lon: Number(result.coordinate.lon) };
const needles = ["museumsleiligheten grabein", "museumsleiligheten_grabein", "toyengata 38", "arbeiderbolig toyengata 38", "grabein leiligheten"].map(norm);
const identityMatches = places.filter((place) => {
  const text = norm(`${place.id ?? ""} ${place.name ?? ""} ${place.desc ?? ""}`);
  return needles.some((needle) => text.includes(needle));
}).map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));

const nearest = places
  .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
  .map((place) => ({ id: place.id, name: place.name, category: place.category, distanceM: Math.round(haversineMeters(point, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10, sourceFile: place.sourceFile }))
  .sort((a, b) => a.distanceM - b.distanceM)
  .slice(0, 15);

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
  proposedYear: 1888,
  productionGate: "coordinate_ready_overlap_review_pending",
  representationDecision: "Model Museumsleiligheten Gråbein as the preserved museum apartment and public-history interior at Tøyengata 38. The coordinate may use the building address as a stable display/unlock marker, but the canonical identity is the museum apartment inside the building rather than the entire Gråbein tenement complex.",
  duplicateGate: {
    canonicalIdentityMatches: identityMatches,
    nearestCanonicalPlaces: nearest,
    conclusion: identityMatches.length === 0 ? "No canonical Museumsleiligheten Gråbein / Tøyengata 38 museum-apartment identity exists. Review the nearest-place list for physical overlap before production." : "Potential existing identity match found and must be resolved before production."
  },
  sourceNotes: [
    "Oslo Museum currently identifies the site as Museumsleiligheten Gråbein at Tøyengata 38.",
    "The preserved apartment interprets working-class housing around 1900 and includes the documented history of the Swedish Bjørklund family, who lived there from 1891.",
    "Oslo byleksikon places the preserved museum apartment in the Gråbein tenement complex and dates the complex to 1888.",
    "The apartment was restored in 1987 and taken over by Oslo Museum in 1990."
  ]
};
writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`, "utf8");

const nearestLines = nearest.map((place) => `- ${place.id} — ${place.name} (${place.category}), ${place.distanceM} m`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# Museumsleiligheten Gråbein — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Address: **${addressQuery}**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n- Coordinate: **${result.coordinate.lat}, ${result.coordinate.lon}**\n- Proposed primary category: **historie**\n\nThe normative address-first finder resolved the museum apartment's building address. No canonical place is created by this intake.\n\n## Canonical identity matches\n\n${identityMatches.length ? identityMatches.map((m) => `- \`${m.id}\` — ${m.name}`).join("\n") : "No current canonical identity match found."}\n\n## Nearest canonical places\n\n${nearestLines}\n\nThe final scope must remain the preserved museum apartment, even though the coordinate is a building-level address marker.\n`, "utf8");
console.log(`Saved Museumsleiligheten Gråbein coordinate intake: ${result.status}`);
