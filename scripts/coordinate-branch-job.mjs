import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DATE = "2026-07-21";
const reportDir = "reports/visitoslo-holmenkollen-audit-20260721";
mkdirSync(reportDir, { recursive: true });

const source = {
  name: "VisitOSLO — Holmenkollen attractions",
  url: "https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/holmenkollen/attraksjoner/",
  capturedAt: DATE,
  visibleResultCards: 28,
  introHighlightedAdditionalItems: 1,
  auditedItems: 29
};

const items = [
  { sourceName: "Skimore Oslo", scopeClass: "fixed_place_candidate", aliases: ["skimore_oslo", "skimore oslo", "oslo vinterpark", "tryvann vinterpark"] },
  { sourceName: "Ski Simulator Holmenkollen", scopeClass: "sub_attraction_or_parent_scope", aliases: ["ski simulator holmenkollen", "skisimulator holmenkollen"], parentAliases: ["holmenkollen nasjonalanlegg", "holmenkollen skimuseum", "skimuseet holmenkollen"] },
  { sourceName: "Emanuel Vigeland Museum", scopeClass: "fixed_place_candidate", aliases: ["emanuel_vigeland_mausoleum", "emanuel vigeland museum", "emanuel vigeland mausoleum"] },
  { sourceName: "Bogstadvannet lake", scopeClass: "fixed_place_candidate", aliases: ["bogstadvannet", "bogstadvannet lake"] },
  { sourceName: "Holmenkollen Chapel", scopeClass: "fixed_place_candidate", aliases: ["holmenkollen_kapell", "holmenkollen kapell", "holmenkollen chapel"] },
  { sourceName: "Toboggan run: Korketrekkeren", scopeClass: "fixed_place_candidate", aliases: ["korketrekkeren", "toboggan run korketrekkeren"] },
  { sourceName: "Bogstad Manor", scopeClass: "fixed_place_candidate", aliases: ["bogstad_gard", "bogstad gård", "bogstad gard", "bogstad manor"] },
  { sourceName: "Open farm with animals at Bogstad", scopeClass: "sub_attraction_or_parent_scope", aliases: ["åpen gård bogstad", "apen gard bogstad", "open farm bogstad"], parentAliases: ["bogstad_gard", "bogstad gård", "bogstad gard", "bogstad manor"] },
  { sourceName: "Oslo Golf Club Bogstad", scopeClass: "fixed_place_candidate", aliases: ["oslo_golfklubb", "oslo golf club", "oslo golfklubb", "bogstad golf", "bogstad golfbane"] },
  { sourceName: "Holmenkollen National Ski Arena", scopeClass: "fixed_place_candidate", aliases: ["holmenkollen_nasjonalanlegg", "holmenkollen nasjonalanlegg", "holmenkollen national ski arena", "holmenkollbakken", "holmenkollen ski arena"] },
  { sourceName: "The Holmenkollen Troll", scopeClass: "fixed_place_candidate", aliases: ["kollentrollet", "holmenkollen troll", "the holmenkollen troll"] },
  { sourceName: "Ski & Guide", scopeClass: "service_or_activity", aliases: ["ski & guide", "ski and guide"] },
  { sourceName: "Skiglede ski school", scopeClass: "service_or_activity", aliases: ["skiglede", "skiglede ski school", "skiglede skiskole"] },
  { sourceName: "Holmenkollen Ski Museum & Tower", scopeClass: "fixed_place_candidate", aliases: ["holmenkollen_skimuseum", "holmenkollen skimuseum", "skimuseet_holmenkollen", "skimuseet i holmenkollen", "ski museum holmenkollen"] },
  { sourceName: "Skimore Oslo Ski School", scopeClass: "service_or_activity", aliases: ["skimore oslo ski school", "skimore skiskole"], parentAliases: ["skimore_oslo", "skimore oslo"] },
  { sourceName: "Skimore Oslo - Summer Park", scopeClass: "sub_attraction_or_parent_scope", aliases: ["skimore oslo summer park", "skimore sommerpark"], parentAliases: ["skimore_oslo", "skimore oslo", "oslo vinterpark"] },
  { sourceName: "Holmenkollen zipline", scopeClass: "sub_attraction_or_parent_scope", aliases: ["holmenkollen zipline", "kollensvevet"], parentAliases: ["holmenkollen_nasjonalanlegg", "holmenkollen nasjonalanlegg", "holmenkollbakken"] },
  { sourceName: "Race up Oslos Bratteste", scopeClass: "route_or_event", aliases: ["oslos bratteste", "oslo bratteste"] },
  { sourceName: "Hike to Vettakollen", scopeClass: "fixed_place_candidate", aliases: ["vettakollen", "hike to vettakollen"] },
  { sourceName: "Green Bike Route: Bogstadvannet Lake to Radiumhospitalet", scopeClass: "route_or_event", aliases: ["bogstadvannet radiumhospitalet", "green bike route bogstadvannet"] },
  { sourceName: "Rose Castle", scopeClass: "fixed_place_candidate", aliases: ["roseslottet", "rose castle"] },
  { sourceName: "Bull Superski Shop, ski school and ski rental at Holmenkollen", scopeClass: "service_or_activity", aliases: ["bull superski", "bull superski holmenkollen"] },
  { sourceName: "Holmenkollen Park Fitness & Spa", scopeClass: "service_or_activity", aliases: ["holmenkollen park fitness spa", "holmenkollen park hotel"] },
  { sourceName: "XP Coaching", scopeClass: "service_or_activity", aliases: ["xp coaching"] },
  { sourceName: "GoSki Oslo", scopeClass: "service_or_activity", aliases: ["goski oslo", "go ski oslo"] },
  { sourceName: "Bike Rental Holmenkollen", scopeClass: "service_or_activity", aliases: ["bike rental holmenkollen", "sykkelutleie holmenkollen"] },
  { sourceName: "Ski Pass at Skimore Oslo, Tryvann", scopeClass: "service_or_activity", aliases: ["ski pass skimore oslo", "skipass tryvann"], parentAliases: ["skimore_oslo", "skimore oslo"] },
  { sourceName: "Gressbanen", scopeClass: "fixed_place_candidate", aliases: ["gressbanen", "gressbanen stadion", "ready gressbanen"] },
  { sourceName: "Kragstøtten", scopeClass: "fixed_place_candidate", aliases: ["kragstotten", "kragstøtten", "kragstøtta", "kragstotta"] }
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

function aliasMatch(place, alias) {
  const a = norm(alias);
  const ac = compact(alias);
  const id = norm(place.id);
  const name = norm(place.name);
  const idc = compact(place.id);
  const namec = compact(place.name);
  return id === a || name === a || idc === ac || namec === ac;
}

function fuzzyScore(sourceName, place) {
  const sourceTokens = new Set(norm(sourceName).split(/\s+/).filter((token) => token.length > 2));
  const candidateTokens = new Set(norm(`${place.id ?? ""} ${place.name ?? ""}`).split(/\s+/).filter((token) => token.length > 2));
  if (!sourceTokens.size || !candidateTokens.size) return 0;
  const overlap = [...sourceTokens].filter((token) => candidateTokens.has(token)).length;
  const union = new Set([...sourceTokens, ...candidateTokens]).size;
  return overlap / union;
}

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];

const results = items.map((item) => {
  const exactMatches = places
    .filter((place) => item.aliases.some((alias) => aliasMatch(place, alias)))
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }));
  const parentMatches = (item.parentAliases ?? []).length
    ? places
      .filter((place) => item.parentAliases.some((alias) => aliasMatch(place, alias)))
      .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile }))
    : [];
  const fuzzyCandidates = places
    .map((place) => ({ id: place.id, name: place.name, category: place.category, sourceFile: place.sourceFile, score: Number(fuzzyScore(item.sourceName, place).toFixed(3)) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  let machineStatus;
  if (item.scopeClass === "service_or_activity" || item.scopeClass === "route_or_event") {
    machineStatus = "non_place_scope_no_production";
  } else if (exactMatches.length === 1) {
    machineStatus = "candidate_exact_or_alias_match";
  } else if (exactMatches.length > 1) {
    machineStatus = "manual_review_multiple_identity_matches";
  } else if (item.scopeClass === "sub_attraction_or_parent_scope" && parentMatches.length === 1) {
    machineStatus = "candidate_resolved_to_parent_scope";
  } else if (item.scopeClass === "sub_attraction_or_parent_scope") {
    machineStatus = "manual_review_sub_attraction_scope";
  } else {
    machineStatus = "unresolved_fixed_place_candidate";
  }

  return {
    ...item,
    machineStatus,
    exactMatches,
    parentMatches,
    fuzzyCandidates
  };
});

const summary = results.reduce((acc, row) => {
  acc[row.machineStatus] = (acc[row.machineStatus] ?? 0) + 1;
  return acc;
}, {});
const scopeSummary = results.reduce((acc, row) => {
  acc[row.scopeClass] = (acc[row.scopeClass] ?? 0) + 1;
  return acc;
}, {});

const report = {
  version: DATE,
  source,
  rules: [
    "Only fixed physical identities may become canonical gap candidates.",
    "Service vendors, rentals, schools, event entries and route products are audited as source rows but cannot automatically create places.",
    "Sub-attractions inside an existing parent place require a separate physical inclusion case before they can become canonical.",
    "Exact/alias matching is used for the machine gate; fuzzy candidates are review aids only and never automatic matches."
  ],
  scopeSummary,
  machineSummary: summary,
  results
};
writeFileSync(`${reportDir}/source-to-repo-audit.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const table = results.map((row, index) => {
  const exact = row.exactMatches.map((match) => `\`${match.id}\``).join(", ") || "—";
  const parent = row.parentMatches.map((match) => `\`${match.id}\``).join(", ") || "—";
  const fuzzy = row.fuzzyCandidates.slice(0, 4).map((match) => `${match.id} (${match.score})`).join("; ") || "—";
  return `| ${index + 1} | ${row.sourceName} | ${row.scopeClass} | ${row.machineStatus} | ${exact} | ${parent} | ${fuzzy} |`;
}).join("\n");

writeFileSync(`${reportDir}/source-to-repo-audit.md`, `# VisitOSLO Holmenkollen — source-to-repo audit\n\nDate: ${DATE}\n\nSource: ${source.url}\n\nAudited source items: **${source.auditedItems}** (${source.visibleResultCards} visible result cards + Kragstøtten from the source introduction).\n\nThe Holmenkollen source page mixes stable physical places with commercial services, activities, event products, routes and sub-attractions. This audit classifies scope before considering canonical gaps.\n\n## Scope summary\n\n\`\`\`json\n${JSON.stringify(scopeSummary, null, 2)}\n\`\`\`\n\n## Machine status summary\n\n\`\`\`json\n${JSON.stringify(summary, null, 2)}\n\`\`\`\n\n| # | Source item | Scope class | Machine status | Exact/alias canonical hits | Parent hits | Top fuzzy review candidates |\n|---|---|---|---|---|---|---|\n${table}\n\n## Review gate\n\nOnly rows with \`unresolved_fixed_place_candidate\`, multiple identity matches, or unresolved sub-attraction scope require manual review. Rows classified as services/activities/routes/events are source-resolved as non-place scope unless independent research proves a distinct stable physical identity.\n`, "utf8");

console.log(`Audited ${results.length} VisitOSLO Holmenkollen source items against ${places.length} canonical runtime places.`);
console.log(JSON.stringify({ scopeSummary, machineSummary: summary }, null, 2));
