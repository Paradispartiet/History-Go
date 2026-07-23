import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/candidate-coordinate-intake";
const INDEX_PATH = "data/places/places_index.json";
mkdirSync(REPORT_DIR, { recursive: true });

const candidates = [
  { placeId: "edvard_munchs_atelier_ekely", address: "Jarlsborgveien 14 Oslo", mode: "address_ready" },
  { placeId: "tegnerforbundet", address: "Rådhusgata 17 Oslo", mode: "address_ready" },
  { placeId: "unge_kunstneres_samfund", address: "Keysers gate 1 Oslo", mode: "address_ready" },
  { placeId: "norske_grafikere", address: "Tollbugata 24 Oslo", mode: "address_ready" },
  { placeId: "rom_for_kunst_og_arkitektur", address: "Maridalsveien 3 Oslo", mode: "shared_property_control_only" },
  { placeId: "the_mini_bottle_gallery", address: "Kirkegata 10 Oslo", mode: "address_ready" },
  { placeId: "galleri_lnm", address: "Rådhusgata 37 Oslo", mode: "address_ready" },
  { placeId: "ram_galleri", address: "Kongens gate 15 Oslo", mode: "address_ready" },
  { placeId: "galleri_schaeffers_gate_5", address: "Schæffers gate 5 Oslo", mode: "address_ready" },
  { placeId: "grafill", address: "Møllergata 39 Oslo", mode: "address_ready" }
];

function writeJson(name, value) {
  writeFileSync(`${REPORT_DIR}/${name}`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function parseFinderJson(stdout) {
  const text = String(stdout ?? "").trim();
  if (!text) return null;
  const first = text.indexOf("{");
  if (first < 0) return null;
  try {
    return JSON.parse(text.slice(first));
  } catch {
    return null;
  }
}

function extractPlaces(root) {
  const result = [];
  const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 6 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    if (typeof value.id === "string" && typeof value.name === "string" && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) {
        seen.add(value.id);
        result.push(value);
      }
      return;
    }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root);
  return result;
}

function distanceMeters(lat1, lon1, lat2, lon2) {
  const rad = (degrees) => degrees * Math.PI / 180;
  const r = 6371000;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build:tools failed with status ${build.status}`);

const canonicalPlaces = extractPlaces(JSON.parse(readFileSync(INDEX_PATH, "utf8")));
const rows = [];

for (const candidate of candidates) {
  const run = spawnSync(
    "node",
    ["dist/tools/address-first-coordinate-finder.mjs", "--address", candidate.address],
    { encoding: "utf8" }
  );
  const raw = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  writeFileSync(`${REPORT_DIR}/${candidate.placeId}-address-first.log`, raw, "utf8");
  const parsed = parseFinderJson(run.stdout);
  if (!parsed) {
    rows.push({ ...candidate, commandStatus: run.status, parseError: true, rawPreview: raw.slice(0, 2000) });
    continue;
  }

  const lat = Number(parsed?.coordinate?.lat);
  const lon = Number(parsed?.coordinate?.lon);
  const nearbyCanonical = Number.isFinite(lat) && Number.isFinite(lon)
    ? canonicalPlaces
        .map((place) => ({
          id: place.id,
          name: place.name,
          category: place.category ?? null,
          distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)),
          lat: place.lat,
          lon: place.lon
        }))
        .filter((place) => place.distanceMeters <= 120)
        .sort((left, right) => left.distanceMeters - right.distanceMeters)
        .slice(0, 12)
    : [];

  rows.push({
    ...candidate,
    commandStatus: run.status,
    finderStatus: parsed.status ?? null,
    finderReason: parsed.reason ?? null,
    sourceProvider: parsed.sourceProvider ?? null,
    sourceUrl: parsed.sourceUrl ?? null,
    sourceObjectId: parsed.sourceObjectId ?? null,
    coordinate: parsed.coordinate ?? null,
    rawHit: parsed.rawHit ?? null,
    nearbyCanonical,
    exactOrNearCollision: nearbyCanonical.filter((place) => place.distanceMeters <= 3)
  });
}

const readyRows = rows.filter((row) => row.mode === "address_ready");
const summary = {
  version: "2026-07-23",
  method: "Repository address-first-coordinate-finder using Geonorge Adresser API, followed by canonical coordinate overlap lead audit",
  candidateCount: rows.length,
  addressReadyCount: readyRows.length,
  counts: {
    verifiedAddressReady: readyRows.filter((row) => row.finderStatus === "verified_candidate").length,
    blockedAddressReady: readyRows.filter((row) => row.finderStatus !== "verified_candidate").length,
    addressReadyWithExactOrNearCollision: readyRows.filter((row) => row.exactOrNearCollision?.length).length,
    sharedPropertyControls: rows.filter((row) => row.mode === "shared_property_control_only").length
  },
  guards: [
    "A verified address candidate is only an address coordinate candidate, not automatic production approval.",
    "Nearby canonical points are overlap leads only; physical identity must be resolved manually.",
    "ROM's Maridalsveien 3 lookup is control evidence only and must not be used as its canonical marker because X-Ray already uses the ordinary address point.",
    "VisitOSLO source coordinates are not used by this intake."
  ],
  rows
};
writeJson("coordinate-intake.json", summary);

const lines = [
  "# VisitOSLO gallery candidates — address-first coordinate intake",
  "",
  "Date: 2026-07-23",
  "",
  `Address-ready candidates: **${readyRows.length}**`,
  `Verified address candidates: **${summary.counts.verifiedAddressReady}**`,
  `Blocked/ambiguous address candidates: **${summary.counts.blockedAddressReady}**`,
  `Verified candidates with canonical point ≤3 m: **${summary.counts.addressReadyWithExactOrNearCollision}**`,
  "",
  "| Candidate | Finder status | Source object | Coordinate | Nearest canonical lead |",
  "|---|---|---|---|---|",
  ...rows.map((row) => {
    const coordinate = row.coordinate ? `${row.coordinate.lat}, ${row.coordinate.lon}` : "—";
    const nearest = row.nearbyCanonical?.[0] ? `${row.nearbyCanonical[0].id} (${row.nearbyCanonical[0].distanceMeters} m)` : "—";
    return `| ${row.placeId} | ${row.finderStatus ?? "parse/error"} | ${row.sourceObjectId ?? "—"} | ${coordinate} | ${nearest} |`;
  }),
  "",
  "ROM is included only as a shared-property control. Its ordinary Maridalsveien 3 address point is not eligible as a distinct ROM production marker.",
  ""
];
writeFileSync(`${REPORT_DIR}/README.md`, lines.join("\n"), "utf8");
console.log(JSON.stringify(summary, null, 2));
