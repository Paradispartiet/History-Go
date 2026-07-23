import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SNAPSHOT_PATH = "reports/visitoslo-galleries-audit-20260723/api-source-discovery/gallery-source-snapshot.json";
const INDEX_PATH = "data/places/places_index.json";
const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/full-coverage-audit";
mkdirSync(REPORT_DIR, { recursive: true });

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(name, value) {
  writeFileSync(`${REPORT_DIR}/${name}`, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " og ")
    .replace(/[^a-z0-9æøå]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPlaces(root) {
  const found = [];
  const seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 5 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    const hasPlaceShape =
      typeof value.id === "string" &&
      typeof value.name === "string" &&
      (typeof value.category === "string" || Number.isFinite(value.lat) || Number.isFinite(value.lon));
    if (hasPlaceShape) {
      const key = value.id;
      if (!seen.has(key)) {
        seen.add(key);
        found.push(value);
      }
      return;
    }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root);
  return found;
}

function aliasValues(place) {
  const values = [];
  for (const key of ["aliases", "alias", "altNames", "alternateNames", "nameVariants", "formerNames"]) {
    const value = place?.[key];
    if (typeof value === "string") values.push(value);
    if (Array.isArray(value)) values.push(...value.filter((entry) => typeof entry === "string"));
  }
  return [...new Set(values)];
}

function tokenSet(value) {
  return new Set(normalize(value).split(" ").filter(Boolean));
}

function fuzzyScore(left, right) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length) * 0.92;
  const aa = tokenSet(a);
  const bb = tokenSet(b);
  const intersection = [...aa].filter((token) => bb.has(token)).length;
  const union = new Set([...aa, ...bb]).size;
  return union ? intersection / union : 0;
}

function compactPlace(place) {
  return {
    id: place.id,
    name: place.name,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    aliases: aliasValues(place)
  };
}

const snapshot = readJson(SNAPSHOT_PATH);
const index = readJson(INDEX_PATH);
const products = Array.isArray(snapshot.products) ? snapshot.products : [];
const places = extractPlaces(index);
if (products.length !== 66) throw new Error(`Expected 66 VisitOSLO gallery products, got ${products.length}`);
if (places.length === 0) throw new Error("Could not extract canonical places from places_index.json");

const rows = products.map((product) => {
  const sourceName = normalize(product.name);
  const exactNameMatches = places.filter((place) => normalize(place.name) === sourceName).map(compactPlace);
  const exactAliasMatches = places
    .filter((place) => aliasValues(place).some((alias) => normalize(alias) === sourceName))
    .filter((place) => !exactNameMatches.some((match) => match.id === place.id))
    .map(compactPlace);
  const secureIds = new Set([...exactNameMatches, ...exactAliasMatches].map((match) => match.id));
  const fuzzyCandidates = places
    .filter((place) => !secureIds.has(place.id))
    .map((place) => ({ ...compactPlace(place), score: Number(fuzzyScore(product.name, place.name).toFixed(3)) }))
    .filter((candidate) => candidate.score >= 0.34)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, "nb"))
    .slice(0, 8);

  const secureMatches = [...exactNameMatches, ...exactAliasMatches];
  let status = "no_exact_match";
  if (secureMatches.length === 1) status = exactNameMatches.length === 1 ? "exact_name_match" : "exact_alias_match";
  if (secureMatches.length > 1) status = "ambiguous_exact_match";

  return {
    sourceId: String(product.id),
    sourceName: product.name,
    sourceUrl: product.url,
    sourceAddress: product.address ?? null,
    sourcePlace: product.place ?? null,
    sourceGeoLocation: product.geoLocation ?? null,
    status,
    exactNameMatches,
    exactAliasMatches,
    fuzzyCandidates
  };
});

const counts = rows.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}, {});
const secureRows = rows.filter((row) => row.status === "exact_name_match" || row.status === "exact_alias_match");
const manualRows = rows.filter((row) => row.status === "no_exact_match" || row.status === "ambiguous_exact_match");

const result = {
  version: "2026-07-23",
  sourceSnapshot: SNAPSHOT_PATH,
  canonicalIndex: INDEX_PATH,
  sourceCount: products.length,
  canonicalPlaceCount: places.length,
  counts,
  secureCoverageCount: secureRows.length,
  manualAuditCount: manualRows.length,
  rows
};
writeJson("machine-coverage-audit.json", result);

const lines = [
  "# VisitOSLO Galleries — full canonical coverage machine audit",
  "",
  "Date: 2026-07-23",
  "",
  `Source entries: **${products.length}**`,
  `Canonical places scanned: **${places.length}**`,
  `Secure exact name/alias matches: **${secureRows.length}**`,
  `Manual identity decisions remaining: **${manualRows.length}**`,
  "",
  "This pass is deliberately conservative. Exact normalized names and explicit aliases may resolve coverage automatically. Fuzzy candidates are leads only and never count as canonical coverage.",
  "",
  "## Manual audit queue",
  "",
  "| VisitOSLO source | Status | Top candidate leads |",
  "|---|---|---|",
  ...manualRows.map((row) => {
    const leads = row.fuzzyCandidates.slice(0, 4).map((candidate) => `${candidate.id} — ${candidate.name} (${candidate.score})`).join("; ") || "—";
    return `| ${String(row.sourceName).replaceAll("|", "\\|")} | ${row.status} | ${leads.replaceAll("|", "\\|")} |`;
  }),
  "",
  "## Secure exact coverage",
  "",
  "| VisitOSLO source | Canonical place | Match type |",
  "|---|---|---|",
  ...secureRows.map((row) => {
    const match = row.exactNameMatches[0] ?? row.exactAliasMatches[0];
    return `| ${String(row.sourceName).replaceAll("|", "\\|")} | ${match.id} — ${String(match.name).replaceAll("|", "\\|")} | ${row.status} |`;
  }),
  ""
];
writeFileSync(`${REPORT_DIR}/README.md`, `${lines.join("\n")}\n`, "utf8");

console.log(JSON.stringify({
  sourceCount: products.length,
  canonicalPlaceCount: places.length,
  counts,
  secureCoverageCount: secureRows.length,
  manualAuditCount: manualRows.length,
  manualQueue: manualRows.map((row) => row.sourceName)
}, null, 2));
