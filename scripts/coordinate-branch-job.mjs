import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-23";
const reportDir = "reports/visitoslo-galleries-audit-20260723/priority-tranche";
mkdirSync(reportDir, { recursive: true });

const source = {
  name: "VisitOSLO — Kunsthovedstaden / Flere kunstgallerier",
  url: "https://www.visitoslo.com/no/artikler/kunsthovedstaden/",
  relationshipToBlockedCategory: "Official current VisitOSLO editorial gallery tranche used as a bounded fallback while the client-rendered full Galleries category cannot be fetched reproducibly from GitHub Actions.",
  capturedAt: DATE,
  sourceItems: 13
};

const items = [
  {
    sourceName: "Fineart Oslo",
    aliases: ["fineart oslo", "fineart_oslo"],
    policyClass: "already_deferred_private_commercial",
    policyBasis: "Explicitly deferred in both the completed museum-source pass and Aker Brygge/Tjuvholmen area closure pending a systematic commercial-gallery inclusion framework."
  },
  {
    sourceName: "Fotografiens Hus",
    aliases: ["fotografiens hus", "fotografiens_hus"],
    policyClass: "institutional_public_interest"
  },
  {
    sourceName: "Fotogalleriet",
    aliases: ["fotogalleriet", "fotogalleriet photo gallery", "the photo gallery"],
    policyClass: "institutional_public_interest"
  },
  {
    sourceName: "Kunsthall Oslo",
    aliases: ["kunsthall oslo", "kunsthall_oslo"],
    policyClass: "institutional_public_interest"
  },
  {
    sourceName: "Kunstnerforbundet",
    aliases: ["kunstnerforbundet", "kunstnerforbundet oslo"],
    policyClass: "institutional_public_interest"
  },
  {
    sourceName: "Soft galleri: Norske tekstilkunstnere",
    aliases: ["soft galleri", "soft gallery", "norske tekstilkunstnere", "soft galleri norske tekstilkunstnere"],
    policyClass: "institutional_public_interest"
  },
  {
    sourceName: "Oslo Kunstforening",
    aliases: ["oslo kunstforening", "oslo_kunstforening"],
    policyClass: "institutional_public_interest"
  },
  {
    sourceName: "VI, VII",
    aliases: ["vi vii", "vi_vii", "vi, vii"],
    policyClass: "private_commercial_review"
  },
  {
    sourceName: "Galleri K",
    aliases: ["galleri k", "galleri_k"],
    policyClass: "private_commercial_review"
  },
  {
    sourceName: "Galleri Haaken",
    aliases: ["galleri haaken", "galleri_haaken"],
    policyClass: "already_deferred_private_commercial",
    policyBasis: "Explicitly deferred in the Aker Brygge/Tjuvholmen closure under the existing gallery policy."
  },
  {
    sourceName: "Buer Gallery",
    aliases: ["buer gallery", "buer_gallery"],
    policyClass: "private_commercial_review"
  },
  {
    sourceName: "KÖSK",
    aliases: ["kösk", "kosk", "kosk oslo", "kosk_oslo"],
    policyClass: "institutional_or_scene_space"
  },
  {
    sourceName: "Van Etten",
    aliases: ["van etten", "van_etten"],
    policyClass: "private_commercial_review"
  }
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
function compact(value) {
  return norm(value).replace(/\s+/g, "");
}
function exactMatch(place, aliases) {
  const candidates = [place.id, place.name].flatMap((value) => [norm(value), compact(value)]);
  return aliases.some((alias) => {
    const forms = [norm(alias), compact(alias)];
    return forms.some((form) => candidates.includes(form));
  });
}
function fuzzyScore(sourceName, place) {
  const a = new Set(norm(sourceName).split(/\s+/).filter(Boolean));
  const b = new Set(norm(`${place.id ?? ""} ${place.name ?? ""}`).split(/\s+/).filter(Boolean));
  const intersection = [...a].filter((token) => b.has(token)).length;
  const union = new Set([...a, ...b]).size || 1;
  let score = intersection / union;
  if (norm(place.name) && (norm(sourceName).includes(norm(place.name)) || norm(place.name).includes(norm(sourceName)))) score += 0.5;
  return Number(score.toFixed(3));
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];

const results = items.map((item) => {
  const exactMatches = places
    .filter((place) => exactMatch(place, item.aliases))
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
  const fuzzyCandidates = places
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile, score: fuzzyScore(item.sourceName, place) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  let status;
  if (exactMatches.length === 1) {
    status = "existing_canonical";
  } else if (exactMatches.length > 1) {
    status = "manual_review_multiple_matches";
  } else if (item.policyClass === "already_deferred_private_commercial") {
    status = "deferred_by_existing_gallery_policy";
  } else if (item.policyClass === "private_commercial_review") {
    status = "commercial_gallery_policy_review_not_auto_gap";
  } else {
    status = "manual_review_potential_institutional_gap";
  }

  return { ...item, status, exactMatches, fuzzyCandidates };
});

const summary = results.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}, {});

const report = {
  version: DATE,
  source,
  scopeGuard: [
    "This is a bounded 13-item official VisitOSLO editorial gallery tranche, not a claim of full current Galleries-category completeness.",
    "The full client-rendered Galleries category remains technically source-blocked for reproducible direct snapshotting; failed discovery PR #3433 is retained as audit trail.",
    "Existing commercial-gallery deferrals remain binding and cannot be converted into gaps merely because the same venue appears in this editorial list.",
    "Potential institutional gaps require independent status, longevity, address and physical-identity research before coordinate intake or production."
  ],
  summary,
  results
};
writeFileSync(`${reportDir}/source-to-repo-audit.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const rows = results.map((row, index) => {
  const exact = row.exactMatches.map((m) => `\`${m.id}\``).join(", ") || "—";
  const fuzzy = row.fuzzyCandidates.slice(0, 5).map((m) => `${m.id} (${m.score})`).join("; ") || "—";
  return `| ${index + 1} | ${row.sourceName} | ${row.policyClass} | ${row.status} | ${exact} | ${fuzzy} |`;
}).join("\n");

writeFileSync(`${reportDir}/SOURCE_TO_REPO_AUDIT.md`, `# VisitOSLO Galleries — curated priority tranche source-to-repo audit\n\nDate: ${DATE}\n\nSource: ${source.url}\n\nThis audit covers the **13 galleries explicitly surfaced in VisitOSLO's current “Flere kunstgallerier” editorial carousel**. It is a bounded fallback tranche, not a claim that the client-rendered Galleries category itself has been completely snapshotted.\n\n## Machine summary\n\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n\n| # | Source item | Policy class | Machine status | Exact canonical hit | Top fuzzy candidates |\n|---|---|---|---|---|---|\n${rows}\n\n## Manual review gate\n\nOnly potential institutional gaps proceed to independent research. Private/commercial galleries are never auto-approved as missing canonical places. Existing defer decisions remain binding until a consistent gallery-inclusion policy explicitly changes them.\n`, "utf8");

console.log(`Audited ${results.length} VisitOSLO curated gallery items against ${places.length} canonical runtime places.`);
console.log(JSON.stringify(summary, null, 2));
