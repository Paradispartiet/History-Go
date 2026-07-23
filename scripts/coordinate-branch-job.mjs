import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const CLASSIFICATION_PATH = "reports/visitoslo-galleries-audit-20260723/full-scope-classification/final-classification.json";
const SNAPSHOT_PATH = "reports/visitoslo-galleries-audit-20260723/api-source-discovery/gallery-source-snapshot.json";
const INDEX_PATH = "data/places/places_index.json";
const REPORT_DIR = "reports/visitoslo-galleries-audit-20260723/candidate-identity-audit";
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
    if (depth > 6 || value === null || value === undefined) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1);
      return;
    }
    if (typeof value !== "object") return;
    const looksLikePlace = typeof value.id === "string" && typeof value.name === "string" &&
      (typeof value.category === "string" || Number.isFinite(value.lat) || Number.isFinite(value.lon));
    if (looksLikePlace) {
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

function aliases(place) {
  const result = [];
  for (const key of ["aliases", "alias", "altNames", "alternateNames", "nameVariants", "formerNames"]) {
    const value = place?.[key];
    if (typeof value === "string") result.push(value);
    if (Array.isArray(value)) result.push(...value.filter((entry) => typeof entry === "string"));
  }
  return [...new Set(result)];
}

function compact(place) {
  return {
    id: place.id,
    name: place.name,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    aliases: aliases(place)
  };
}

const classification = readJson(CLASSIFICATION_PATH);
const snapshot = readJson(SNAPSHOT_PATH);
const places = extractPlaces(readJson(INDEX_PATH));
const productsByName = new Map(snapshot.products.map((product) => [product.name, product]));
const candidates = classification.newCanonicalCandidates;

if (!Array.isArray(candidates) || candidates.length !== 10) {
  throw new Error(`Expected 10 approved gallery candidates, got ${candidates?.length ?? "n/a"}`);
}

const rows = candidates.map((candidate) => {
  const product = productsByName.get(candidate.sourceItem) ?? null;
  const proposedIdMatch = places.find((place) => place.id === candidate.proposedPlaceId) ?? null;
  const normalizedName = normalize(candidate.sourceItem);
  const exactNameMatches = places.filter((place) => normalize(place.name) === normalizedName).map(compact);
  const exactAliasMatches = places.filter((place) => aliases(place).some((alias) => normalize(alias) === normalizedName)).map(compact);

  const lat = Number(product?.geoLocation?.latitude);
  const lon = Number(product?.geoLocation?.longitude);
  const hasSourceLeadCoordinate = Number.isFinite(lat) && Number.isFinite(lon);
  const nearby = hasSourceLeadCoordinate
    ? places
        .filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon))
        .map((place) => ({ ...compact(place), distanceMeters: Number(haversineMeters(lat, lon, place.lat, place.lon).toFixed(1)) }))
        .filter((place) => place.distanceMeters <= 200)
        .sort((left, right) => left.distanceMeters - right.distanceMeters)
        .slice(0, 12)
    : [];

  const sourceTokens = normalize(candidate.sourceItem).split(" ").filter((token) => token.length >= 4 && !["galleri", "kunst", "oslo", "senter"].includes(token));
  const textHits = places
    .filter((place) => {
      if (!sourceTokens.length) return false;
      const haystack = normalize(JSON.stringify(place));
      return sourceTokens.length >= 2
        ? sourceTokens.every((token) => haystack.includes(token))
        : haystack.includes(sourceTokens[0]);
    })
    .map(compact)
    .slice(0, 12);

  let machineDecision = "no_direct_duplicate_signal";
  if (proposedIdMatch) machineDecision = "proposed_id_already_exists";
  else if (exactNameMatches.length || exactAliasMatches.length) machineDecision = "exact_identity_signal_requires_manual_resolution";

  return {
    sourceItem: candidate.sourceItem,
    proposedPlaceId: candidate.proposedPlaceId,
    classificationBasis: candidate.basis,
    machineDecision,
    proposedIdMatch: proposedIdMatch ? compact(proposedIdMatch) : null,
    exactNameMatches,
    exactAliasMatches,
    sourceLead: product ? {
      id: product.id,
      url: product.url,
      address: product.address ?? null,
      place: product.place ?? null,
      geoLocation: product.geoLocation ?? null
    } : null,
    nearbyCanonicalLeads: nearby,
    serializedTextHits: textHits
  };
});

const summary = {
  version: "2026-07-23",
  sourceClassification: CLASSIFICATION_PATH,
  candidateCount: rows.length,
  canonicalPlacesScanned: places.length,
  counts: rows.reduce((acc, row) => {
    acc[row.machineDecision] = (acc[row.machineDecision] ?? 0) + 1;
    return acc;
  }, {}),
  warning: "VisitOSLO source coordinates and nearby-place distances are research leads only. They are not coordinate evidence and do not establish physical identity.",
  rows
};
writeJson("candidate-identity-audit.json", summary);

const lines = [
  "# VisitOSLO Galleries — approved candidate identity audit",
  "",
  "Date: 2026-07-23",
  "",
  `Approved candidates audited: **${rows.length}**`,
  `Canonical places scanned: **${places.length}**`,
  "",
  "VisitOSLO coordinates are used only to surface nearby canonical places for manual physical-parent review. They are not accepted as production coordinate evidence.",
  "",
  "| Candidate | Proposed id | Machine decision | Nearest canonical leads | Text hits |",
  "|---|---|---|---|---|",
  ...rows.map((row) => {
    const nearby = row.nearbyCanonicalLeads.slice(0, 5).map((lead) => `${lead.id} (${lead.distanceMeters} m)`).join("; ") || "—";
    const textHits = row.serializedTextHits.slice(0, 5).map((lead) => lead.id).join("; ") || "—";
    return `| ${row.sourceItem.replaceAll("|", "\\|")} | ${row.proposedPlaceId} | ${row.machineDecision} | ${nearby} | ${textHits} |`;
  }),
  "",
  "Next step: manually resolve physical identity/parent reuse for every candidate, then perform source-first coordinate research only for candidates that remain distinct new places.",
  ""
];
writeFileSync(`${REPORT_DIR}/README.md`, lines.join("\n"), "utf8");

console.log(JSON.stringify({
  candidateCount: rows.length,
  canonicalPlacesScanned: places.length,
  counts: summary.counts,
  rows: rows.map((row) => ({
    sourceItem: row.sourceItem,
    proposedPlaceId: row.proposedPlaceId,
    machineDecision: row.machineDecision,
    nearest: row.nearbyCanonicalLeads[0] ?? null,
    textHits: row.serializedTextHits.map((lead) => lead.id)
  }))
}, null, 2));
