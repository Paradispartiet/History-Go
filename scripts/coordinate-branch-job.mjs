import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const id = "st_hallvard_kirke_kloster";
const reportDir = "reports/visitoslo-oslo-east-audit-20260720";
mkdirSync(reportDir, { recursive: true });

function grep(args) {
  try {
    return execFileSync("git", ["grep", ...args], { encoding: "utf8" }).trim();
  } catch (error) {
    if (error.status === 1) return "";
    throw error;
  }
}

const sourceHits = grep(["-n", id, "--", "data", "docs", "reports"]);
const fileHits = grep(["-l", id, "--", "data"]);
const manifestText = readFileSync("data/places/manifest.json", "utf8");
const runtimeText = readFileSync("data/places/places_index.json", "utf8");
const relevantFiles = fileHits ? fileHits.split("\n") : [];

const possibleControlFiles = [
  "data/places/split-manifest.json",
  "data/places/split_manifest.json",
  "data/places/places_split_manifest.json",
  "data/places/disabled.json",
  "data/places/disabled_places.json",
  "data/places/disabled-place-ids.json",
  "data/places/places_disabled.json"
];
const controls = {};
for (const file of possibleControlFiles) {
  try {
    const text = readFileSync(file, "utf8");
    controls[file] = {
      exists: true,
      containsId: text.includes(id),
      matchingLines: text.split("\n").filter((line) => line.includes(id))
    };
  } catch {
    controls[file] = { exists: false, containsId: false, matchingLines: [] };
  }
}

const aggregatePath = "data/places/historie/oslo/places_historie_added_batch_01.json";
const aggregate = JSON.parse(readFileSync(aggregatePath, "utf8"));
const aggregateRecord = Array.isArray(aggregate) ? aggregate.find((place) => place.id === id) : null;
const aggregateManifestEntry = "places/historie/oslo/places_historie_added_batch_01.json";

const result = {
  placeId: id,
  aggregatePath,
  aggregateRecordPresent: Boolean(aggregateRecord),
  aggregateManifestEntryPresent: manifestText.includes(aggregateManifestEntry),
  runtimeIndexContainsId: runtimeText.includes(`\"id\": \"${id}\"`),
  dataFilesContainingId: relevantFiles,
  controls,
  sourceHits: sourceHits.split("\n").filter(Boolean)
};

writeFileSync(`${reportDir}/st-hallvard-materialization-audit.json`, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const report = `# St. Hallvard kirke og kloster — materialization audit\n\nDate: 2026-07-20\n\n- Place id: \`${id}\`\n- Record present in aggregate source: **${result.aggregateRecordPresent}**\n- Aggregate source listed in place manifest: **${result.aggregateManifestEntryPresent}**\n- Present in generated runtime index: **${result.runtimeIndexContainsId}**\n\n## Data files containing the id\n\n${relevantFiles.length ? relevantFiles.map((file) => `- ${file}`).join("\n") : "- None"}\n\n## Known control-file probes\n\n${Object.entries(controls).map(([file, value]) => `- ${file}: exists=${value.exists}, containsId=${value.containsId}${value.matchingLines.length ? ` — ${value.matchingLines.join(" | ")}` : ""}`).join("\n")}\n\n## Conclusion\n\n${result.aggregateRecordPresent && result.aggregateManifestEntryPresent && !result.runtimeIndexContainsId ? "The canonical source record is active at the manifest level but is excluded from the generated runtime index. The next debugging step is to inspect the index builder's disabled-place and split-source filtering logic rather than creating a duplicate place." : "The observed state does not match the expected source-present/runtime-missing pattern; inspect the JSON evidence before acting."}\n`;
writeFileSync(`${reportDir}/st-hallvard-materialization-audit.md`, report, "utf8");
console.log(`St. Hallvard materialization audit: source=${result.aggregateRecordPresent}, manifest=${result.aggregateManifestEntryPresent}, runtime=${result.runtimeIndexContainsId}`);
