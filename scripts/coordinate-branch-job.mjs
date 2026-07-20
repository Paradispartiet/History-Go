import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const reportDir = "reports/visitoslo-oslo-east-audit-20260720";
mkdirSync(reportDir, { recursive: true });

const sourceUrl = "https://www.visitoslo.com/no/aktiviteter-og-attraksjoner/omraader/oslo-ost/attraksjoner/";
const candidates = [
  { sourceName: "Tøyenbadet", aliases: ["toyenbadet"] },
  { sourceName: "EKT Rideskole og Husdyrpark", aliases: ["ekt_rideskole_husdyrpark"] },
  { sourceName: "Naturhistorisk museum", aliases: ["naturhistorisk_museum"] },
  { sourceName: "Ekebergparken skulpturpark", aliases: ["ekebergparken", "ekebergparken_skulpturpark"] },
  { sourceName: "Ekebergparken museum", aliases: ["ekebergparken_museum"] },
  { sourceName: "Middelalder-Oslo", aliases: ["middelalder_oslo", "middelalderparken"] },
  { sourceName: "Ekebergsletta parkrun", aliases: ["ekebergsletta_parkrun", "ekebergsletta"] },
  { sourceName: "Oslo ladegård", aliases: ["oslo_ladegard"] },
  { sourceName: "Kunsthall Oslo", aliases: ["kunsthall_oslo"] },
  { sourceName: "Gamlebyen kirke", aliases: ["gamlebyen_kirke", "oslo_hospital"] },
  { sourceName: "St. Hallvard kirke", aliases: ["st_hallvard_kirke_kloster", "st_hallvard_kirke"] },
  { sourceName: "Jordal skøytebane", aliases: ["jordal_skoytebane", "jordal_amfi", "jordal_idrettspark"] },
  { sourceName: "Arbeiderbolig i Tøyengata 38", aliases: ["toyengata_38", "arbeiderbolig_toyengata_38", "museumsleilighet_toyengata_38"] },
  { sourceName: "Sykkelrute: Utsiktspunkt Ekeberg", aliases: ["utsiktspunkt_ekeberg", "valhallsvingen"] },
  { sourceName: "Mariakirkeruinen", aliases: ["mariakirken", "mariakirken_ruin", "mariakirkeruinen"] },
  { sourceName: "Kampen Økologiske Barnebondegård", aliases: ["kampen_okologiske_barnebondegard"] },
  { sourceName: "Helleristningene på Ekeberg", aliases: ["ekeberg_helleristninger", "helleristningene_ekeberg"] },
  { sourceName: "Tøyen hovedgård", aliases: ["toyen_hovedgard"] },
  { sourceName: "Grønland kirke", aliases: ["gronland_kirke"] },
  { sourceName: "Vålerenga kirke", aliases: ["valerenga_kirke", "vaalerenga_kirke"] },
  { sourceName: "Klimahuset", aliases: ["klimahuset"] },
  { sourceName: "KÖSK", aliases: ["kosk"] },
  { sourceName: "Clemenskirkeruinen", aliases: ["clemenskirken", "clemenskirke_ruin", "clemenskirkeruinen"] },
  { sourceName: "FRIGO - Friluftssenter", aliases: ["frigo", "frigo_friluftssenter"] },
  { sourceName: "Galleri Mini", aliases: ["galleri_mini"] },
  { sourceName: "Brannmuseet i Oslo", aliases: ["brannmuseet_oslo"] },
  { sourceName: "Central Jam-e-Mosque", aliases: ["central_jam_e_mosque", "world_islamic_mission", "moskeen_akebergveien"] },
  { sourceName: "Biblo Tøyen", aliases: ["biblo_toyen"] },
  { sourceName: "Sørenga", aliases: ["sorenga"] },
  { sourceName: "Van Etten", aliases: ["van_etten"] }
];

const indexRaw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(indexRaw) ? indexRaw : indexRaw.places ?? [];

function normalize(value) {
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
  return new Set(normalize(value).split(/\s+/).filter((token) => token.length >= 3));
}

function jaccard(a, b) {
  const aa = tokens(a);
  const bb = tokens(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const token of aa) if (bb.has(token)) intersection += 1;
  return intersection / (aa.size + bb.size - intersection);
}

const rows = candidates.map((candidate) => {
  const aliasNorms = candidate.aliases.map(normalize);
  const sourceNorm = normalize(candidate.sourceName);
  const exactMatches = places.filter((place) => {
    const idNorm = normalize(place.id);
    const nameNorm = normalize(place.name);
    return (
      aliasNorms.includes(idNorm) ||
      aliasNorms.includes(nameNorm) ||
      idNorm === sourceNorm ||
      nameNorm === sourceNorm
    );
  });

  const fuzzyMatches = places
    .map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      score: Math.max(
        jaccard(candidate.sourceName, place.name),
        ...candidate.aliases.map((alias) => jaccard(alias, place.id)),
      ),
      sourceFile: place.sourceFile
    }))
    .filter((match) => match.score >= 0.45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return {
    sourceName: candidate.sourceName,
    aliases: candidate.aliases,
    exactMatches: exactMatches.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      sourceFile: place.sourceFile
    })),
    fuzzyMatches,
    preliminaryStatus:
      exactMatches.length > 0
        ? "covered_or_overlap_requires_manual_scope_check"
        : fuzzyMatches.some((match) => match.score >= 0.8)
          ? "probable_existing_match_requires_manual_check"
          : "no_canonical_match_found"
  };
});

const summary = {
  version: "2026-07-20",
  sourceUrl,
  sourceSnapshotNote:
    "Candidate names transcribed from the current VisitOSLO Oslo East attractions result set visible in web search on 2026-07-20. This runner audits canonical repository coverage only; source-scope and inclusion decisions remain manual.",
  totalSourceCandidates: rows.length,
  exactCovered: rows.filter((row) => row.exactMatches.length > 0).length,
  noExactMatch: rows.filter((row) => row.exactMatches.length === 0).length,
  rows
};

writeFileSync(
  path.join(reportDir, "source-to-repo-audit.json"),
  `${JSON.stringify(summary, null, 2)}\n`,
  "utf8",
);

const markdownRows = rows
  .map((row) => {
    const exact = row.exactMatches.length
      ? row.exactMatches.map((match) => `\`${match.id}\` (${match.name})`).join("; ")
      : "—";
    const fuzzy = row.fuzzyMatches.length
      ? row.fuzzyMatches
          .map((match) => `\`${match.id}\` ${match.name} (${match.score.toFixed(2)})`)
          .join("; ")
      : "—";
    return `| ${row.sourceName} | ${exact} | ${fuzzy} | ${row.preliminaryStatus} |`;
  })
  .join("\n");

const report = `# VisitOSLO Oslo East — source-to-repo audit\n\nDate: 2026-07-20\n\nSource: ${sourceUrl}\n\nThis is a repository-coverage pass over the 30 current VisitOSLO Oslo East attraction entries captured for this bounded audit. Exact alias matches are authoritative only for identity discovery; physical overlap, source scope and inclusion policy still require manual review.\n\n- Source candidates: **${rows.length}**\n- Exact canonical/alias matches: **${summary.exactCovered}**\n- Without exact canonical/alias match: **${summary.noExactMatch}**\n\n| VisitOSLO source name | Exact canonical/alias match | Fuzzy candidates | Preliminary status |\n| --- | --- | --- | --- |\n${markdownRows}\n\n## Manual review rule\n\nEntries without exact matches must be classified into one of four buckets before production: genuine canonical gap, represented by a broader/same physical place, transient activity rather than place, or intentionally deferred commercial/gallery listing.\n`;

writeFileSync(path.join(reportDir, "README.md"), report, "utf8");
console.log(`VisitOSLO Oslo East audit: ${rows.length} source candidates; ${summary.exactCovered} exact canonical/alias matches; ${summary.noExactMatch} without exact match.`);
