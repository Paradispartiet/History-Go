import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "fotografiens_hus";
const addressQuery = "Rådhusgata 20 Oslo";
const reportDir = path.join(
  "reports",
  "oslo-attractions-completeness-20260720",
  "fotografiens-hus",
);

mkdirSync(reportDir, { recursive: true });

function run(command, args) {
  const output = execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  process.stdout.write(output);
  return output;
}

function parseJsonOutput(output) {
  const trimmed = output.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    if (firstBrace >= 0) {
      return JSON.parse(trimmed.slice(firstBrace));
    }
    throw new Error("Coordinate finder did not return JSON output.");
  }
}

function haversineMeters(a, b) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusM = 6_371_000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusM * Math.asin(Math.sqrt(h));
}

console.log(`Running normative address-first intake for ${placeId}: ${addressQuery}`);
run("npm", ["run", "build:tools"]);
const finderOutput = run("node", [
  "dist/tools/address-first-coordinate-finder.mjs",
  "--address",
  addressQuery,
]);
const result = parseJsonOutput(finderOutput);

if (!result?.ok || !result?.coordinate) {
  throw new Error(
    `Address-first coordinate finder did not produce a verified candidate: ${result?.status ?? "unknown"}`,
  );
}

writeFileSync(
  path.join(reportDir, "result.json"),
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8",
);

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw)
  ? indexRaw
  : Array.isArray(indexRaw?.places)
    ? indexRaw.places
    : [];

const coordinate = {
  lat: Number(result.coordinate.lat),
  lon: Number(result.coordinate.lon),
};

const nearestCanonicalPlaces = places
  .filter(
    (place) =>
      Number.isFinite(Number(place?.lat)) && Number.isFinite(Number(place?.lon)),
  )
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category,
    distanceM: Math.round(
      haversineMeters(coordinate, {
        lat: Number(place.lat),
        lon: Number(place.lon),
      }) * 10,
    ) / 10,
  }))
  .sort((a, b) => a.distanceM - b.distanceM)
  .slice(0, 12);

const normalizedNeedles = ["fotografiens hus", "fotografiens_hus"];
const canonicalNameMatches = places
  .filter((place) => {
    const haystack = `${place?.id ?? ""} ${place?.name ?? ""}`.toLowerCase();
    return normalizedNeedles.some((needle) => haystack.includes(needle));
  })
  .map((place) => ({ id: place.id, name: place.name, category: place.category }));

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
  productionGate: "coordinate_ready_taxonomy_and_overlap_review_pending",
  proposedPrimaryCategory: "kunst",
  representationDecision:
    "Model Fotografiens Hus as the stable public photography gallery and photography institution at its documented visitor address in Rådhusgata 20. Do not create a generic Rådhusgata building place or split individual temporary exhibitions into overlapping place markers.",
  duplicateGate: {
    canonicalNameMatches,
    nearestCanonicalPlaces,
    conclusion:
      canonicalNameMatches.length === 0
        ? "No canonical Fotografiens Hus identity match was found in the active runtime index before this intake. Review the nearest-place list for physical overlap before production."
        : "A possible canonical identity match exists and must be resolved before production.",
  },
  sourceNotes: [
    "Fotografiens Hus describes itself as a public photography gallery and community resource for photographers and lens-based artists.",
    "The institution documents Rådhusgata 20 in Oslo as its visitor address and states that it has operated there since 1999.",
    "The venue has a recurring public exhibition programme and a durable photography-specific learning case rather than a one-off temporary event identity.",
    "The completed VisitOSLO City Centre source audit approved Fotografiens Hus as the remaining genuine canonical candidate from that bounded source pass.",
  ],
};

writeFileSync(
  path.join(reportDir, "decision.json"),
  `${JSON.stringify(decision, null, 2)}\n`,
  "utf8",
);

const nearestLines = nearestCanonicalPlaces
  .map(
    (place) =>
      `- ${place.id} — ${place.name} (${place.category ?? "unknown"}), ${place.distanceM} m`,
  )
  .join("\n");

const readme = `# Fotografiens Hus — coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Exact address tested: **${addressQuery}**\n- Proposed primary category: **kunst**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n- Coordinate: **${result.coordinate.lat}, ${result.coordinate.lon}**\n\nFotografiens Hus is the one remaining production candidate from the closed VisitOSLO City Centre source audit. The institution is a stable public photography gallery and photography-specific cultural venue at Rådhusgata 20, not a temporary exhibition identity.\n\nThis pass uses the repository's normative address-first finder. No canonical place is created by the intake itself. The exact result must proceed through the ordinary physical-overlap and taxonomy gates before production.\n\n## Active canonical identity search\n\n${canonicalNameMatches.length === 0 ? "No canonical Fotografiens Hus identity match was found in the active runtime index." : JSON.stringify(canonicalNameMatches)}\n\n## Nearest active canonical places\n\n${nearestLines}\n\nThe nearest-place list is evidence for the overlap review only. Proximity alone is not a duplicate decision.\n`;

writeFileSync(path.join(reportDir, "README.md"), readme, "utf8");

console.log(
  `Saved Fotografiens Hus address intake evidence to ${reportDir} (${result.status})`,
);
