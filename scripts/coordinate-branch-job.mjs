import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "central_jam_e_mosque";
const addressQuery = "Åkebergveien 28B Oslo";
const reportDir = "reports/visitoslo-oslo-east-audit-20260720/central-jam-e-mosque";
mkdirSync(reportDir, { recursive: true });

function run(command, args) {
  const output = execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
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
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const R = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

run("npm", ["run", "build:tools"]);
const finderOutput = run("node", [
  "dist/tools/address-first-coordinate-finder.mjs",
  "--address",
  addressQuery
]);
const result = parseJson(finderOutput);
if (!result?.ok || !result?.coordinate) {
  throw new Error(`No verified address candidate: ${result?.status ?? "unknown"}`);
}

writeFileSync(`${reportDir}/result.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];
const point = { lat: Number(result.coordinate.lat), lon: Number(result.coordinate.lon) };
const identityNeedles = [
  "central jam e mosque",
  "world islamic mission",
  "moskeen akebergveien",
  "akebergveien moske"
].map(norm);

const canonicalIdentityMatches = places
  .filter((place) => {
    const text = norm(`${place.id} ${place.name} ${place.desc ?? ""}`);
    return identityNeedles.some((needle) => text.includes(needle));
  })
  .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));

const nearestCanonicalPlaces = places
  .filter((place) => Number.isFinite(Number(place.lat)) && Number.isFinite(Number(place.lon)))
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    distanceM: Math.round(haversineMeters(point, { lat: Number(place.lat), lon: Number(place.lon) }) * 10) / 10,
    sourceFile: place.sourceFile
  }))
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
  productionGate: "coordinate_ready_overlap_and_taxonomy_review_pending",
  representationDecision:
    "Model one canonical place for the purpose-built Central Jam-e-Mosque / World Islamic Mission mosque building and its congregation's institutional home at Åkebergveien 28B. Do not create separate overlapping records for the organisation and building at the same physical site.",
  duplicateGate: {
    canonicalIdentityMatches,
    nearestCanonicalPlaces,
    conclusion:
      canonicalIdentityMatches.length === 0
        ? "No current canonical place matches the Central Jam-e-Mosque / World Islamic Mission identity. Review nearest places for physical overlap before production."
        : "Potential existing identity match found; resolve before production."
  },
  sourceNotes: [
    "World Islamic Mission documents Åkebergveien 28B as the current mosque and institutional address.",
    "The congregation states that the foundation stone was laid in 1991 and the purpose-built mosque was ready for occupancy in 1994/95.",
    "Store norske leksikon describes Central Jam-e-Mosque as opened in 1995 and the first mosque in Norway built as a mosque from the ground up.",
    "Oslo byleksikon identifies the building as the oldest Oslo building erected specifically for mosque use."
  ]
};
writeFileSync(`${reportDir}/decision.json`, `${JSON.stringify(decision, null, 2)}\n`, "utf8");

const nearestLines = nearestCanonicalPlaces.map((place) => `- ${place.id} — ${place.name} (${place.category}), ${place.distanceM} m`).join("\n");
const readme = `# Central Jam-e-Mosque — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Address: **${addressQuery}**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n- Coordinate: **${result.coordinate.lat}, ${result.coordinate.lon}**\n- Proposed primary category: **historie**\n\nThe normative address-first finder resolved the purpose-built mosque address. No canonical place is created by this intake pass.\n\n## Canonical identity matches\n\n${canonicalIdentityMatches.length ? canonicalIdentityMatches.map((m) => `- \`${m.id}\` — ${m.name}`).join("\n") : "No current canonical identity match found."}\n\n## Nearest canonical places\n\n${nearestLines}\n\nProximity alone is not a duplicate decision. The next gate must confirm physical and institutional scope before canonical production.\n`;
writeFileSync(`${reportDir}/README.md`, readme, "utf8");
console.log(`Saved Central Jam-e-Mosque coordinate intake to ${reportDir}: ${result.status}`);
