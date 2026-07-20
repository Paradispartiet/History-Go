import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const reportDir = "reports/visitoslo-oslo-east-audit-20260720";
mkdirSync(reportDir, { recursive: true });
const raw = JSON.parse(readFileSync("data/places/places_index.json", "utf8"));
const places = Array.isArray(raw) ? raw : raw.places ?? [];

function norm(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a");
}

const groups = {
  hallvard: ["hallvard"],
  maria_medieval: ["maria", "marikir"],
  clemens_medieval: ["clemen"],
  valerenga_church: ["valerenga", "vaalerenga"],
  toyen_manor: ["toyen", "hovedgard"],
  ekeberg_rock_carvings: ["ekeberg", "hellerist"],
  worker_apartment: ["toyengata", "arbeider", "museumsleilig"],
  central_mosque: ["moske", "mosque", "islamic", "akeberg"],
  biblo: ["biblo"],
  frigo: ["frigo"],
  kunsthall: ["kunsthall"],
  galleries: ["kosk", "van etten", "galleri mini"],
  ekeberg_museum: ["ekebergparken", "museum"]
};

const result = {};
for (const [group, keywords] of Object.entries(groups)) {
  result[group] = places
    .filter((place) => {
      const text = norm(`${place.id} ${place.name} ${place.desc ?? ""} ${place.sourceFile ?? ""}`);
      return keywords.some((keyword) => text.includes(norm(keyword)));
    })
    .map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      sourceFile: place.sourceFile,
      desc: place.desc
    }));
}

writeFileSync(
  `${reportDir}/keyword-scan.json`,
  `${JSON.stringify(result, null, 2)}\n`,
  "utf8"
);

const lines = ["# VisitOSLO Oslo East — targeted canonical keyword scan", "", "Date: 2026-07-20", ""];
for (const [group, matches] of Object.entries(result)) {
  lines.push(`## ${group}`);
  if (!matches.length) {
    lines.push("- No current canonical matches.", "");
    continue;
  }
  for (const match of matches) {
    lines.push(`- \`${match.id}\` — ${match.name} (${match.category}) — ${match.sourceFile}`);
  }
  lines.push("");
}
writeFileSync(`${reportDir}/keyword-scan.md`, `${lines.join("\n")}\n`, "utf8");
console.log("Completed targeted VisitOSLO Oslo East canonical keyword scan.");
