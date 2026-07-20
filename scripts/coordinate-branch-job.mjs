import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const placeId = "christian_radich";
const addressQuery = "Akershusstranda 9 Oslo";
const reportDir = path.join(
  "reports",
  "oslo-attractions-completeness-20260720",
  "christian-radich-home-berth",
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
    if (firstBrace >= 0) return JSON.parse(trimmed.slice(firstBrace));
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

console.log(`Running address-first land-base intake for ${placeId}: ${addressQuery}`);
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
const addressPoint = {
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
    distanceM:
      Math.round(
        haversineMeters(addressPoint, {
          lat: Number(place.lat),
          lon: Number(place.lon),
        }) * 10,
      ) / 10,
  }))
  .sort((a, b) => a.distanceM - b.distanceM)
  .slice(0, 15);

const canonicalNameMatches = places
  .filter((place) => {
    const haystack = `${place?.id ?? ""} ${place?.name ?? ""}`.toLowerCase();
    return haystack.includes("christian radich") || haystack.includes("christian_radich");
  })
  .map((place) => ({ id: place.id, name: place.name, category: place.category }));

const akershusEvidence = JSON.parse(
  readFileSync("data/coordinate-evidence/oslo/havnefront/akershus_kaier.json", "utf8"),
);
const akershusAnchor = {
  lat: Number(akershusEvidence.currentCoordinate.lat),
  lon: Number(akershusEvidence.currentCoordinate.lon),
};
const distanceToAkershusKaierAnchorM =
  Math.round(haversineMeters(addressPoint, akershusAnchor) * 10) / 10;

const decision = {
  version: "2026-07-20",
  placeId,
  model: "historic_mobile_vessel_with_documented_home_berth",
  addressQuery,
  finderStatus: result.status,
  ok: result.ok,
  sourceProvider: result.sourceProvider,
  sourceObjectId: result.sourceObjectId,
  sourceUrl: result.sourceUrl,
  landBaseCoordinate: result.coordinate,
  documentedHomeBerth: {
    name: "Akershusutstikkeren",
    broaderCanonicalPlaceId: "akershus_kaier",
    broaderAnchor: akershusEvidence.currentCoordinate,
    distanceFromSkur32AddressPointM: distanceToAkershusKaierAnchorM,
    sourceBasis: [
      "VisitOSLO states that Christian Radich lies at Akershusutstikkeren when it is not away on assignment.",
      "Oslo Havn identifies Akershusutstikkeren as Christian Radich's home harbour and says the vessel has had its permanent place there since 1994.",
      "The Christian Radich foundation describes the quay office as being where the ship stays when it is in Oslo."
    ]
  },
  productionGate: "land_base_verified_home_berth_geometry_review_pending",
  proposedPrimaryCategory: "historie",
  representationDecision:
    "Create Christian Radich as one historic-vessel place using an explicit non-live home-berth anchor at Akershusutstikkeren. The final marker represents the vessel's documented Oslo home base and normal berth when in Oslo, not its instantaneous AIS position. Akershusstranda 9 / Skur 32 is evidence for the land base and should only become the final marker if berth geometry confirms it is an appropriate quay/home-base anchor rather than merely an office doorway.",
  overlapGate: {
    canonicalNameMatches,
    nearestCanonicalPlaces,
    broaderQuayPlace: {
      id: "akershus_kaier",
      identity: akershusEvidence.identity?.resolvedIdentity,
      coordType: akershusEvidence.currentCoordinate?.coordType,
      sourceObjectId:
        akershusEvidence.geometryCandidates?.[0]?.sourceObjectId ?? null,
      distanceFromAddressPointM: distanceToAkershusKaierAnchorM
    },
    conclusion:
      "No canonical Christian Radich identity match exists. The existing `akershus_kaier` record represents the broad linear quay system and is not a duplicate of the historic vessel. The final vessel marker must remain explicitly scoped as a home-berth anchor."
  },
  sourceNotes: [
    "Christian Radich was launched in 1937 and remains an actively sailing full-rigged historic vessel.",
    "Akershusutstikkeren is documented by Oslo Havn as the vessel's home harbour and by VisitOSLO as its berth when it is not away on assignment.",
    "The ship may be away on voyages, charter, maintenance or shipyard stays; the canonical marker therefore must not imply live physical presence.",
    "Akershusstranda 9 / Skur 32 is the documented operational shore base adjoining the home berth."
  ]
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

const readme = `# Christian Radich — home-berth coordinate intake\n\nDate: 2026-07-20\n\n- Candidate: \`${placeId}\`\n- Model: **historic mobile vessel with documented home berth**\n- Land-base address tested: **${addressQuery}**\n- Finder status: **${result.status}**\n- Source object: **${result.sourceObjectId}**\n- Land-base coordinate: **${result.coordinate.lat}, ${result.coordinate.lon}**\n- Existing broader quay place: **akershus_kaier**\n- Distance from Skur 32 address point to current broad Akershuskaiene line anchor: **${distanceToAkershusKaierAnchorM} m**\n\nChristian Radich is not treated as a permanently stationary ship. The candidate is approved because authoritative sources document Akershusutstikkeren as the vessel's home harbour and regular Oslo berth when it is not away on assignment.\n\nThis pass verifies the exact Akershusstranda 9 / Skur 32 land-base point and compares it with the existing broad Akershuskaiene geometry. No canonical place is created here. The next gate must decide the final berth/home-base marker and record explicit non-live semantics.\n\n## Active canonical identity search\n\n${canonicalNameMatches.length === 0 ? "No canonical Christian Radich identity match was found in the active runtime index." : JSON.stringify(canonicalNameMatches)}\n\n## Nearest active canonical places\n\n${nearestLines}\n\nProximity to Akershuskaiene is expected and is not a duplicate signal: the quay place represents the harbour infrastructure, while Christian Radich represents the historic vessel attached to its documented home berth.\n`;

writeFileSync(path.join(reportDir, "README.md"), readme, "utf8");

console.log(
  `Saved Christian Radich home-berth intake evidence to ${reportDir} (${result.status})`,
);
