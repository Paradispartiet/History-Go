import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const SNAPSHOT_PATH = "reports/visitoslo-galleries-audit-20260723/api-source-discovery/gallery-source-snapshot.json";
const MACHINE_PATH = "reports/visitoslo-galleries-audit-20260723/full-coverage-audit/machine-coverage-audit.json";
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
    const placeShape = typeof value.id === "string" && typeof value.name === "string" && (typeof value.category === "string" || Number.isFinite(value.lat) || Number.isFinite(value.lon));
    if (placeShape) {
      if (!seen.has(value.id)) {
        seen.add(value.id);
        found.push(value);
      }
      return;
    }
    for (const child of Object.values(value)) visit(child, depth + 1);
  };
  visit(root);
  return found;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const r = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

const STOP = new Set(["galleri", "gallery", "oslo", "kunst", "art", "space", "contemporary", "senter", "for", "norske", "the", "of", "og"]);
function coreTokens(value) {
  return normalize(value).split(" ").filter((token) => token.length > 1 && !STOP.has(token));
}

function lexicalScore(sourceName, place) {
  const source = normalize(sourceName);
  const name = normalize(place.name);
  const id = normalize(place.id.replaceAll("_", " "));
  const sourceCore = coreTokens(sourceName);
  if (!sourceCore.length) return 0;
  const targetTokens = new Set([...name.split(" "), ...id.split(" ")]);
  const overlap = sourceCore.filter((token) => targetTokens.has(token)).length / sourceCore.length;
  if (sourceCore.every((token) => targetTokens.has(token))) return Math.max(0.82, overlap);
  if (source.includes(name) || name.includes(source)) return 0.8;
  return overlap;
}

function compact(place) {
  return { id: place.id, name: place.name, category: place.category ?? null, lat: place.lat ?? null, lon: place.lon ?? null };
}

const snapshot = readJson(SNAPSHOT_PATH);
const machine = readJson(MACHINE_PATH);
const places = extractPlaces(readJson(INDEX_PATH));
const productsById = new Map(snapshot.products.map((product) => [String(product.id), product]));
const manualRows = machine.rows.filter((row) => row.status === "no_exact_match" || row.status === "ambiguous_exact_match");

const rows = manualRows.map((row) => {
  const product = productsById.get(String(row.sourceId));
  const lat = Number(product?.geoLocation?.latitude);
  const lon = Number(product?.geoLocation?.longitude);
  const hasCoordinate = Number.isFinite(lat) && Number.isFinite(lon);
  const spatialCandidates = hasCoordinate
    ? places
        .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon))
        .map((place) => ({ ...compact(place), distanceMeters: Number(haversineMeters(lat, lon, place.lat, place.lon).toFixed(1)) }))
        .filter((candidate) => candidate.distanceMeters <= 150)
        .sort((left, right) => left.distanceMeters - right.distanceMeters)
        .slice(0, 10)
    : [];

  const lexicalCandidates = places
    .map((place) => ({ ...compact(place), score: Number(lexicalScore(row.sourceName, place).toFixed(3)) }))
    .filter((candidate) => candidate.score >= 0.5)
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name, "nb"))
    .slice(0, 10);

  const serializedHits = places
    .filter((place) => {
      const sourceCore = coreTokens(row.sourceName);
      if (!sourceCore.length) return false;
      const haystack = normalize(JSON.stringify(place));
      return sourceCore.length >= 2
        ? sourceCore.every((token) => haystack.includes(token))
        : haystack.includes(sourceCore[0]);
    })
    .map(compact)
    .slice(0, 10);

  return {
    sourceId: row.sourceId,
    sourceName: row.sourceName,
    sourceAddress: product?.address ?? null,
    sourcePlace: product?.place ?? null,
    sourceGeoLocation: product?.geoLocation ?? null,
    spatialCandidates,
    lexicalCandidates,
    serializedHits
  };
});

writeJson("manual-second-pass-leads.json", {
  version: "2026-07-23",
  sourceCount: rows.length,
  note: "Leads only. Coordinate proximity, lexical similarity, and serialized text hits do not by themselves resolve canonical identity.",
  rows
});

const lines = [
  "# VisitOSLO Galleries — manual identity second-pass leads",
  "",
  "Date: 2026-07-23",
  "",
  `Manual queue examined: **${rows.length}**`,
  "",
  "These are research leads only. Nearness is never treated as identity, especially for shared gallery buildings. A candidate must still be resolved against physical identity and canonical scope.",
  "",
  "| Source | Nearest canonical candidates ≤150 m | Lexical/text leads |",
  "|---|---|---|",
  ...rows.map((row) => {
    const spatial = row.spatialCandidates.slice(0, 4).map((candidate) => `${candidate.id} (${candidate.distanceMeters} m)`).join("; ") || "—";
    const lexicalIds = [...new Set([...row.lexicalCandidates.slice(0, 4).map((candidate) => candidate.id), ...row.serializedHits.slice(0, 4).map((candidate) => candidate.id)])];
    return `| ${String(row.sourceName).replaceAll("|", "\\|")} | ${spatial} | ${lexicalIds.join("; ") || "—"} |`;
  }),
  ""
];
writeFileSync(`${REPORT_DIR}/manual-second-pass-leads.md`, `${lines.join("\n")}\n`, "utf8");

console.log(JSON.stringify({
  manualQueueCount: rows.length,
  withSpatialCandidates: rows.filter((row) => row.spatialCandidates.length > 0).length,
  withLexicalCandidates: rows.filter((row) => row.lexicalCandidates.length > 0 || row.serializedHits.length > 0).length,
  rows: rows.map((row) => ({
    sourceName: row.sourceName,
    nearest: row.spatialCandidates[0] ?? null,
    lexical: row.lexicalCandidates[0] ?? null,
    textHit: row.serializedHits[0] ?? null
  }))
}, null, 2));
