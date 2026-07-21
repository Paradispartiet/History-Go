import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const sourceUrl = "https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/oslofjorden/attraksjoner";
const capturedAt = "2026-07-21";
const reportDir = "reports/visitoslo-oslofjord-audit-20260721";
mkdirSync(reportDir, { recursive: true });

const sourceRows = [
  {
    sourceName: "Gressholmen, Heggholmen og Rambergøya",
    kind: "combined_islands",
    requiredAliases: [
      ["gressholmen"],
      ["heggholmen"],
      ["rambergøya", "rambergoya"]
    ]
  },
  {
    sourceName: "Klosterruinene på Hovedøya",
    kind: "heritage_site",
    aliases: ["klosterruinene på hovedøya", "hovedøya klosterruin", "hovedoya klosterruin", "hovedøya kloster", "hovedoya kloster"]
  },
  {
    sourceName: "Ormøya og Malmøya",
    kind: "combined_islands",
    requiredAliases: [
      ["ormøya", "ormoya"],
      ["malmøya", "malmoya"]
    ]
  },
  { sourceName: "Nakholmen", kind: "island", aliases: ["nakholmen"] },
  { sourceName: "Steilene", kind: "island_group", aliases: ["steilene", "steilene fyrstasjon", "steilene fyr"] },
  { sourceName: "Langøyene", kind: "island", aliases: ["langøyene", "langoyene"] },
  { sourceName: "Lindøya", kind: "island", aliases: ["lindøya", "lindoya"] },
  { sourceName: "Hovedøya", kind: "island", aliases: ["hovedøya", "hovedoya"] },
  { sourceName: "Aker Brygge", kind: "urban_area", aliases: ["aker brygge", "aker_brygge"] },
  { sourceName: "Ingierstrand bad", kind: "beach_facility", aliases: ["ingierstrand bad", "ingierstrand", "ingierstrand_bad"] },
  { sourceName: "Bleikøya", kind: "island", aliases: ["bleikøya", "bleikoya"] },
  { sourceName: "Ulvøya", kind: "island", aliases: ["ulvøya", "ulvoya"] }
];

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

function tokens(value) {
  return new Set(norm(value).split(/\s+/).filter(Boolean));
}

function scoreCandidate(sourceName, place) {
  const sourceTokens = tokens(sourceName);
  const candidateText = `${place.id ?? ""} ${place.name ?? ""}`;
  const candidateTokens = tokens(candidateText);
  const intersection = [...sourceTokens].filter((token) => candidateTokens.has(token)).length;
  const union = new Set([...sourceTokens, ...candidateTokens]).size || 1;
  let score = intersection / union;
  const s = norm(sourceName);
  const c = norm(candidateText);
  if (c.includes(s) || s.includes(norm(place.name))) score += 0.5;
  return score;
}

function placeMatchesAlias(place, alias) {
  const target = norm(alias);
  const id = norm(place.id);
  const name = norm(place.name);
  return id === target || name === target || id.includes(target) || name.includes(target) || target.includes(name);
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];

const rows = sourceRows.map((row) => {
  if (row.requiredAliases) {
    const groups = row.requiredAliases.map((aliases) => {
      const matches = places
        .filter((place) => aliases.some((alias) => placeMatchesAlias(place, alias)))
        .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
      return { aliases, matches };
    });
    const allResolved = groups.every((group) => group.matches.length > 0);
    const uniqueIds = [...new Set(groups.flatMap((group) => group.matches.map((match) => match.id)))];
    return {
      ...row,
      status: allResolved ? "candidate_resolved_by_multiple_canonical_places" : "manual_review_required",
      aliasGroups: groups,
      resolvedCanonicalIds: uniqueIds,
      fuzzyCandidates: places
        .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile, score: scoreCandidate(row.sourceName, place) }))
        .filter((candidate) => candidate.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
    };
  }

  const aliases = row.aliases ?? [row.sourceName];
  const matches = places
    .filter((place) => aliases.some((alias) => placeMatchesAlias(place, alias)))
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
  return {
    ...row,
    status: matches.length === 1 ? "candidate_exact_or_alias_match" : matches.length > 1 ? "manual_review_multiple_matches" : "unresolved_no_alias_match",
    matches,
    fuzzyCandidates: places
      .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile, score: scoreCandidate(row.sourceName, place) }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  };
});

const summary = rows.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}, {});

const report = {
  version: "2026-07-21",
  source: {
    name: "VisitOSLO — Øyer og attraksjoner i Oslofjorden",
    url: sourceUrl,
    capturedAt,
    visibleResultCount: sourceRows.length
  },
  summary,
  rows
};
writeFileSync(`${reportDir}/source-to-repo-audit.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const markdownRows = rows.map((row, index) => {
  const resolved = row.resolvedCanonicalIds?.join(", ") || row.matches?.map((m) => m.id).join(", ") || "—";
  const fuzzy = row.fuzzyCandidates?.slice(0, 5).map((m) => `${m.id} (${m.name})`).join("; ") || "—";
  return `| ${index + 1} | ${row.sourceName} | ${row.kind} | ${row.status} | ${resolved} | ${fuzzy} |`;
}).join("\n");

writeFileSync(`${reportDir}/source-to-repo-audit.md`, `# VisitOSLO Oslofjorden — source-to-repo audit\n\nDate: ${capturedAt}\n\nSource: ${sourceUrl}\n\nVisible source rows captured: **${sourceRows.length}**.\n\nThis is a machine-assisted first pass against the current canonical runtime index. Combined VisitOSLO rows are allowed to resolve to multiple canonical physical places. No new canonical place is created by this audit.\n\n## Machine summary\n\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n\n| # | VisitOSLO row | Type | Machine status | Canonical/alias hits | Top fuzzy candidates |\n|---|---|---|---|---|---|\n${markdownRows}\n\n## Manual review rule\n\nEvery unresolved or multi-match row must be reviewed for physical scope before production. A combined source row must not be forced into one marker when the source itself bundles several distinct islands or sites. Retail/service/activity-only rows are not present in this bounded attractions list.\n`, "utf8");

console.log(`Audited ${sourceRows.length} VisitOSLO Oslofjorden attraction rows against ${places.length} canonical runtime places.`);
console.log(JSON.stringify(summary, null, 2));
