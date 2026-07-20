import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const placeId = "museumsleiligheten_grabein";
const broadAddressQuery = "Tøyengata 38 Oslo";
const exactAddressQuery = "Tøyengata 38B Oslo";
const reportDir = "reports/visitoslo-oslo-east-audit-20260720/museumsleiligheten-grabein";
mkdirSync(reportDir, { recursive: true });

function parseJson(output) {
  const text = String(output || "").trim();
  try { return JSON.parse(text); } catch {
    const start = text.indexOf("{");
    if (start >= 0) return JSON.parse(text.slice(start));
    throw new Error("Coordinate finder did not return JSON.");
  }
}
function runAttempt(address) {
  const attempt = spawnSync(process.execPath, ["dist/tools/address-first-coordinate-finder.mjs", "--address", address], { encoding: "utf8" });
  if (attempt.stdout) process.stdout.write(attempt.stdout);
  if (attempt.stderr) process.stderr.write(attempt.stderr);
  return { exitCode: attempt.status, result: parseJson(attempt.stdout) };
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

execFileSync("npm", ["run", "build:tools"], { stdio: "inherit" });

const broadAttempt = runAttempt(broadAddressQuery);
if (broadAttempt.result?.status !== "needs_review") {
  throw new Error(`Expected broad Tøyengata 38 lookup to require review, got ${broadAttempt.result?.status ?? "unknown"}.`);
}

const exactAttempt = runAttempt(exactAddressQuery);
const result = exactAttempt.result;
if (!result?.ok || result.status !== "verified_candidate" || !result.coordinate) {
  throw new Error(`Precise Tøyengata 38B lookup did not produce a verified candidate: ${result?.status ?? "unknown"}`);
}

writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const point = { lat: Number(result.coordinate.lat), lon: Number(result.coordinate.lon) };
const needles = ["museumsleiligheten grabein", "museumsleiligheten_grabein", "toyengata 38b", "arbeiderbolig toyengata 38", "grabein leiligheten"].map(norm);
const identityMatches = places.filter((place) => {
  const text = norm(`${place.id ?? ""} ${place.name ?? ""} ${place.desc ?? ""}`);
  return needles.some((needle) => text.includes(needle));
}).map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));

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

const decision = {
  version: "2026-07-20",
  placeId,
  broadAddressAttempt: broadAttempt.result,
  exactAddressQuery,
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  coordinate: result.coordinate,
  proposedPrimaryCategory: "historie",
  proposedYear: 1888,
  productionGate: "coordinate_ready_overlap_review_pending",
  representationDecision: "Model Museumsleiligheten Gråbein as the preserved museum apartment and public-history interior in Tøyengata 38B. The building address is the stable display/unlock marker, while the canonical identity remains the museum apartment inside the Gråbein tenement rather than the whole residential complex.",
  duplicateGate: {
    canonicalIdentityMatches: identityMatches,
    nearestCanonicalPlaces: nearest,
    conclusion: identityMatches.length === 0
      ? "No canonical Museumsleiligheten Gråbein / Tøyengata 38B museum-apartment identity exists. Review nearest places for physical overlap before production."
      : "Potential existing identity match found and must be resolved before production."
  },
  sourceNotes: [
    "Oslo Museum's main visitor page uses Tøyengata 38, while its event information explicitly identifies the museum apartment at Tøyengata 38 B.",
    "Oslo byleksikon identifies the preserved museum apartment specifically in Tøyengata 38b.",
    "The broad Tøyengata 38 address correctly returned needs_review; the precise 38B query is therefore the normative address input for the apartment's building marker.",
    "The preserved apartment interprets working-class housing around 1900 and includes the documented history of the Swedish Bjørklund family, who lived there from 1891.",
    "The apartment was restored in 1987 and taken over by Oslo Museum in 1990."
  ]
};
writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`, "utf8");

const nearestLines = nearest.map((place) => `- ${place.id} — ${place.name} (${place.category}), ${place.distanceM} m`).join("\n");
writeFileSync(`${reportDir}/README.md`, `# Museumsleiligheten Gråbein — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Broad address attempt: **${broadAddressQuery} → ${broadAttempt.result.status}**\n- Exact address: **${exactAddressQuery}**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n- Coordinate: **${result.coordinate.lat}, ${result.coordinate.lon}**\n- Proposed primary category: **historie**\n\nThe broad address was ambiguous, while Oslo Museum and Oslo byleksikon specifically identify the museum apartment in Tøyengata 38B. The precise address-first lookup is therefore used as the building-level anchor. No canonical place is created by this intake.\n\n## Canonical identity matches\n\n${identityMatches.length ? identityMatches.map((m) => `- \`${m.id}\` — ${m.name}`).join("\n") : "No current canonical identity match found."}\n\n## Nearest canonical places\n\n${nearestLines}\n\nThe final scope remains the preserved museum apartment, even though the coordinate is a building-level address marker.\n`, "utf8");

console.log(`Saved Museumsleiligheten Gråbein coordinate intake: broad=${broadAttempt.result.status}, exact=${result.status}`);
