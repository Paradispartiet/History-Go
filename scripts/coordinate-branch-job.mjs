import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const PLACE_ID = "akershus_energi";
const REPORT_DIR = "reports/oslo-coordinate-akershus-energipark-research";
mkdirSync(REPORT_DIR, { recursive: true });

const index = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(index) ? index : (index.places ?? []);
const current = places.find((place) => place?.id === PLACE_ID);
if (!current) throw new Error(`${PLACE_ID} missing from places_index`);

const build = spawnSync("npm", ["run", "build:tools"], { encoding: "utf8" });
writeFileSync(`${REPORT_DIR}/build-tools.log`, `${build.stdout ?? ""}${build.stderr ?? ""}`, "utf8");
if (build.status !== 0) throw new Error(`build failed ${build.status}`);

const queries = [
  "Rolf Olsens vei 50 2007 Kjeller",
  "Rolf Olsensvei 50 Kjeller"
];
const results = [];
for (const query of queries) {
  const run = spawnSync("node", ["dist/tools/address-first-coordinate-finder.mjs", "--address", query], { encoding: "utf8" });
  writeFileSync(`${REPORT_DIR}/${query.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.log`, `${run.stdout ?? ""}${run.stderr ?? ""}`, "utf8");
  const text = String(run.stdout ?? "").trim();
  const start = text.indexOf("{");
  let parsed = null;
  if (start >= 0) {
    try { parsed = JSON.parse(text.slice(start)); } catch {}
  }
  results.push({ query, exitCode: run.status, parsed });
}

const verified = results.filter((item) => item.parsed?.status === "verified_candidate");
if (!verified.length) throw new Error("No verified Geonorge address candidate for Akershus EnergiPark");
const ids = [...new Set(verified.map((item) => item.parsed.sourceObjectId))];
if (ids.length !== 1) throw new Error(`Address variants resolved to different objects: ${ids.join(", ")}`);

const result = {
  version: "2026-07-23",
  placeId: PLACE_ID,
  currentCoordinate: { lat: current.lat, lon: current.lon, r: current.r },
  resolvedIdentity: "Akershus EnergiPark, the physical district-heating plant opened in 2011 at Kjeller",
  identitySources: [
    "https://www.mynewsdesk.com/no/akershus-energi/pressreleases/skal-investere-naermere-400-millioner-kroner-for-aa-gi-mer-varme-til-lillestroem-3365257"
  ],
  addressResearch: results,
  selectedCandidate: verified[0].parsed,
  conclusion: "The legacy Oslo marker should not be treated as a verified Akershus Energi Varme plant. Production should anchor the canonical place to the exact official-address point for Akershus EnergiPark at Rolf Olsens vei 50, Kjeller, after a fresh collision check."
};
writeFileSync(`${REPORT_DIR}/summary.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ placeId: PLACE_ID, sourceObjectId: verified[0].parsed.sourceObjectId, coordinate: verified[0].parsed.coordinate }, null, 2));
