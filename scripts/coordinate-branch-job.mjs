import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const VERIFIED_AT = "2026-07-25";
const TARGET_PLACE_IDS = [
  "biblo_toyen",
  "ibsen_museum_teater",
  "psykologisk_institutt_uio",
  "slottsplassen"
];
const NEW_PERSON_IDS = ["aat_vos", "henrik_ibsen", "harald_schjelderup"];
const NEW_PERSON_NAMES = ["Aat Vos", "Henrik Ibsen", "Harald Schjelderup"];

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), "utf8"));
}

function writeJson(rel, value) {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function run(command, args = []) {
  console.log(`\n$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env
  });
}

function peopleRows(data) {
  if (Array.isArray(data)) {
    return data.filter((row) => row && typeof row === "object");
  }
  if (data && typeof data === "object" && Array.isArray(data.people)) {
    return data.people.filter((row) => row && typeof row === "object");
  }
  if (data && typeof data === "object" && typeof data.id === "string") {
    return [data];
  }
  return [];
}

function loadManifestPeople(manifest) {
  const rows = [];
  for (const rel of manifest.files) {
    const fileRel = path.join("data", rel);
    for (const row of peopleRows(readJson(fileRel))) {
      rows.push({ ...row, __file: fileRel });
    }
  }
  return rows;
}

function categoryRow(report, category) {
  const row = report.categories.find((entry) => entry.category === category);
  if (!row) throw new Error(`Mangler kategori ${category} i Oslo People-rapporten.`);
  return row;
}

function assertTargetBaseline(report) {
  const uncovered = new Set(report.uncoveredRequired.map((row) => row.placeId));
  for (const placeId of TARGET_PLACE_IDS) {
    if (!uncovered.has(placeId)) {
      throw new Error(`Baseline-gate: ${placeId} er ikke et udekket Oslo-sted på gjeldende main.`);
    }
  }
}

function addUnique(array, value) {
  if (!array.includes(value)) array.push(value);
}

function addManifestPath(manifest, rel, beforeRel) {
  if (manifest.files.includes(rel)) {
    throw new Error(`Manifestbanen finnes allerede: ${rel}`);
  }
  const index = manifest.files.indexOf(beforeRel);
  if (index < 0) throw new Error(`Fant ikke manifestankeret ${beforeRel}`);
  manifest.files.splice(index, 0, rel);
}

console.log("Oslo People zero-gap batch 9: current-main audit");
run("npm", ["run", "build:tools"]);
run("node", ["dist/tools/audit-people-of-places-status.mjs"]);
run("node", ["dist/tools/audit-people-place-coverage.mjs"]);
run("node", ["dist/tools/audit-oslo-people-coverage.mjs"]);
run("node", ["dist/tools/audit-oslo-latent-people-coverage.mjs"]);

const baseline = readJson("reports/oslo-people-coverage.json");
assertTargetBaseline(baseline);
if (baseline.totals.uncoveredRequiredPlaces !== 222) {
  throw new Error(`Forventet 222 Oslo-hull i baseline, fikk ${baseline.totals.uncoveredRequiredPlaces}.`);
}

const manifest = readJson("data/people/manifest.json");
if (!Array.isArray(manifest.files)) throw new Error("Ugyldig People-manifest: files mangler.");
const baselinePeople = loadManifestPeople(manifest);
const ids = new Set();
const names = new Set();
for (const row of baselinePeople) {
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const name = typeof row.name === "string" ? row.name.trim().toLocaleLowerCase("nb-NO") : "";
  if (id) {
    if (ids.has(id)) throw new Error(`Eksisterende duplicate People ID i baseline: ${id}`);
    ids.add(id);
  }
  if (name) names.add(name);
}
for (const id of NEW_PERSON_IDS) {
  if (ids.has(id)) throw new Error(`Kandidat-ID finnes allerede i canonical People: ${id}`);
}
for (const name of NEW_PERSON_NAMES) {
  if (names.has(name.toLocaleLowerCase("nb-NO"))) {
    throw new Error(`Kandidatnavn finnes allerede i canonical People: ${name}`);
  }
}

const newPeopleFiles = {
  "data/people/litteratur/oslo/biblo_toyen/aat_vos.json": [
    {
      id: "aat_vos",
      name: "Aat Vos",
      initials: "AV",
      desc: "Bibliotekarkitekten som formet Biblo Tøyen som et særpreget lese-, skaper- og oppholdsrom for unge.",
      tags: [
        "litteratur",
        "bibliotek",
        "bibliotekarkitektur",
        "ungdomsbibliotek",
        "biblo_toyen"
      ],
      placeId: "biblo_toyen",
      category: "litteratur",
      year: 2016,
      popupDesc: "Aat Vos tegnet interiøret til Biblo Tøyen i dialog med unge i målgruppen. Resultatet ble et biblioteklandskap med scene, huler, flyttbare bokhyller og gjenbrukte objekter som gjør lesing, skapende aktivitet og sosialt opphold til deler av samme rom. Koblingen gjelder den dokumenterte utformingen av akkurat Biblo Tøyen, ikke en generell tilknytning til Deichman.",
      places: ["biblo_toyen"],
      image: "",
      cardImage: "",
      source_urls: [
        "https://www.arkitektur.no/prosjekter/kultur/biblo-toeyen-deichmanske-bibliotek/",
        "https://magasin.oslo.kommune.no/byplan/bibliotekene-mye-mer-enn-boker"
      ],
      verifiedAt: VERIFIED_AT
    }
  ],
  "data/people/litteratur/oslo/ibsen_museum_teater/henrik_ibsen.json": [
    {
      id: "henrik_ibsen",
      name: "Henrik Ibsen",
      initials: "HI",
      desc: "Dramatikeren hvis siste hjem i Arbins gate 1 er den historiske kjernen i IBSEN Museum & Teater.",
      tags: [
        "litteratur",
        "dramatikk",
        "forfatterhjem",
        "ibsen_museum_teater",
        "arbins_gate_1"
      ],
      placeId: "ibsen_museum_teater",
      category: "litteratur",
      year: 1895,
      popupDesc: "Henrik og Suzannah Ibsen flyttet inn i leiligheten i Arbins gate 1 i 1895. Ibsen bodde der til han døde i 1906 og skrev sine to siste skuespill i hjemmet. Den bevarte leiligheten er den historiske kjernen i dagens IBSEN Museum & Teater, mens den offentlige besøksinngangen ligger i Henrik Ibsens gate 26. Koblingen bygger derfor på et konkret bosted og arbeidssted, ikke bare på museets navn.",
      places: ["ibsen_museum_teater"],
      image: "",
      cardImage: "",
      source_urls: [
        "https://ibsenmt.no/om-oss",
        "https://ibsenmt.no/en/the-home-of-henrik-ibsen"
      ],
      verifiedAt: VERIFIED_AT
    }
  ],
  "data/people/psykologi/oslo/psykologisk_institutt_uio/harald_schjelderup.json": [
    {
      id: "harald_schjelderup",
      name: "Harald Schjelderup",
      initials: "HS",
      desc: "Norges første professor i psykologi og en grunnleggende institusjonsbygger for psykologifaget ved Universitetet i Oslo.",
      tags: [
        "psykologi",
        "universitetet_i_oslo",
        "psykologisk_institutt",
        "harald_schjelderups_hus",
        "faghistorie"
      ],
      placeId: "psykologisk_institutt_uio",
      category: "psykologi",
      year: 1928,
      popupDesc: "Harald Schjelderup fikk professoratet sitt omgjort fra filosofi til psykologi i 1928 og ble Norges første professor i psykologi. Han var sentral i oppbyggingen av psykologi som universitetsfag og klinisk disiplin ved Universitetet i Oslo, og tok senere initiativ til Norsk psykologforening. Psykologisk institutt holder i dag til i Harald Schjelderups hus; koblingen gjelder hans dokumenterte fag- og institusjonsbygging og bygningens minneforankring, ikke en påstand om at han arbeidet i det nåværende huset.",
      places: ["psykologisk_institutt_uio"],
      image: "",
      cardImage: "",
      source_urls: [
        "https://www.sv.uio.no/psi/english/about/contact/",
        "https://www.psykologforeningen.no/aktuelt/psykologforeningen-fyller-90-ar-en-historisk-reise",
        "https://snl.no/Harald_Krabbe_Schjelderup"
      ],
      verifiedAt: VERIFIED_AT
    }
  ]
};

for (const [rel, data] of Object.entries(newPeopleFiles)) {
  if (fs.existsSync(abs(rel))) throw new Error(`Målfil finnes allerede: ${rel}`);
  writeJson(rel, data);
}

const historyPeoplePath = "data/people/historie/oslo/people_historie_oslo.json";
const historyPeople = readJson(historyPeoplePath);
const haakon = historyPeople.find((row) => row && row.id === "haakon_vii_krigstid");
if (!haakon) throw new Error("Fant ikke canonical haakon_vii_krigstid.");
if (!Array.isArray(haakon.places)) throw new Error("haakon_vii_krigstid mangler places-array.");
if (haakon.places.includes("slottsplassen")) {
  throw new Error("haakon_vii_krigstid er allerede koblet til slottsplassen.");
}
haakon.tags = Array.isArray(haakon.tags) ? haakon.tags : [];
addUnique(haakon.tags, "slottsplassen");
addUnique(haakon.tags, "17_mai");
addUnique(haakon.tags, "kongelig_ritual");
addUnique(haakon.places, "slottsplassen");
haakon.popupDesc = "Under okkupasjonen ble Haakon VII et nasjonalt symbol på motstand. Oslo rådhus og Eidsvolls plass bevarer den offentlige etterkrigs- og minneforankringen, mens Slottsplassen gir et direkte kongelig ritualanker: Haakon VII og dronning Maud etablerte tradisjonen med å motta barnetoget fra slottsbalkongen i 1906, og store folkemengder fylte plassen da kongefamilien vendte tilbake 7. juni 1945. Koblingen til Slottsplassen bygger dermed på dokumenterte hendelser på selve stedet.";
haakon.source_urls = Array.isArray(haakon.source_urls) ? haakon.source_urls : [];
addUnique(haakon.source_urls, "https://www.kongehuset.no/kongelige-eiendommer/det-kongelige-slott/slottsparken/slottsplassen");
addUnique(haakon.source_urls, "https://www.kongehuset.no/monarkiet/historie/alt-for-norge/kong-haakon-vii/biografi");
haakon.verifiedAt = VERIFIED_AT;
writeJson(historyPeoplePath, historyPeople);

addManifestPath(
  manifest,
  "people/litteratur/oslo/biblo_toyen/aat_vos.json",
  "people/litteratur/europe/portugal/lisbon/people_litteratur_lisbon.json"
);
addManifestPath(
  manifest,
  "people/litteratur/oslo/ibsen_museum_teater/henrik_ibsen.json",
  "people/litteratur/europe/portugal/lisbon/people_litteratur_lisbon.json"
);
addManifestPath(
  manifest,
  "people/psykologi/oslo/psykologisk_institutt_uio/harald_schjelderup.json",
  "people/sport/oslo/people_sport_oslo.json"
);
writeJson("data/people/manifest.json", manifest);

console.log("Oslo People zero-gap batch 9: materialized; rebuilding generated outputs");
run("npm", ["run", "build:tools"]);
run("npm", ["run", "build:scripts"]);
run("npm", ["run", "civication:history-people:build"]);
run("node", ["dist/tools/audit-people-invalid-place-refs.mjs"]);
run("node", ["dist/tools/audit-people-of-places-status.mjs"]);
run("node", ["dist/tools/audit-people-place-coverage.mjs"]);
run("node", ["dist/tools/audit-oslo-people-coverage.mjs"]);
run("node", ["dist/tools/audit-oslo-latent-people-coverage.mjs"]);

const finalCoverage = readJson("reports/oslo-people-coverage.json");
if (finalCoverage.totals.uncoveredRequiredPlaces !== 218) {
  throw new Error(`Forventet 218 Oslo-hull etter batchen, fikk ${finalCoverage.totals.uncoveredRequiredPlaces}.`);
}
if (finalCoverage.totals.coveredRequiredPlaces !== 210) {
  throw new Error(`Forventet 210 dekkede kravsteder, fikk ${finalCoverage.totals.coveredRequiredPlaces}.`);
}
if (finalCoverage.totals.logicalPeople !== 1368) {
  throw new Error(`Forventet 1368 logical People, fikk ${finalCoverage.totals.logicalPeople}.`);
}
if (finalCoverage.totals.invalidPeopleRefs !== 0) {
  throw new Error(`Ugyldige People-referanser etter batchen: ${finalCoverage.totals.invalidPeopleRefs}.`);
}
for (const category of ["litteratur", "politikk", "psykologi"]) {
  const row = categoryRow(finalCoverage, category);
  if (row.uncovered !== 0) throw new Error(`${category} har fortsatt ${row.uncovered} Oslo-hull.`);
}
const remaining = new Set(finalCoverage.uncoveredRequired.map((row) => row.placeId));
for (const placeId of TARGET_PLACE_IDS) {
  if (remaining.has(placeId)) throw new Error(`${placeId} er fortsatt udekket etter materialisering.`);
}

const finalManifest = readJson("data/people/manifest.json");
const finalPeople = loadManifestPeople(finalManifest);
const finalIds = new Set();
for (const row of finalPeople) {
  if (typeof row.id !== "string" || !row.id.trim()) continue;
  if (finalIds.has(row.id)) throw new Error(`Duplicate People ID etter materialisering: ${row.id}`);
  finalIds.add(row.id);
}
for (const id of NEW_PERSON_IDS) {
  if (!finalIds.has(id)) throw new Error(`Ny People ID mangler etter materialisering: ${id}`);
}

run("bash", ["scripts/check-people.sh"]);
run("npm", ["run", "audit:categories"]);
run("npm", ["run", "civication:history-people:check"]);
run("npm", ["run", "typecheck:tools"]);
run("npm", ["run", "typecheck:scripts"]);
run("node", ["--test", "tests/oslo-people-coverage-single-records.test.mjs"]);
run("npm", ["run", "health:data"]);
run("git", ["diff", "--check"]);

const literature = categoryRow(finalCoverage, "litteratur");
const politics = categoryRow(finalCoverage, "politikk");
const psychology = categoryRow(finalCoverage, "psykologi");
const report = `# Oslo People zero-gap batch 9 – validation\n\nGenerated: ${new Date().toISOString()}\n\n## Scope\n\nThis People-only batch closes the remaining Oslo coverage holes in literature, politics and psychology. It changes no place or coordinate-evidence source files.\n\n## Fresh baseline\n\n- Required non-nature Oslo places: **${baseline.totals.requiredNonNaturePlaces}**\n- Covered required places: **${baseline.totals.coveredRequiredPlaces}**\n- Uncovered required places: **${baseline.totals.uncoveredRequiredPlaces}**\n- Logical People: **${baseline.totals.logicalPeople}**\n- Latent candidates for uncovered places: **0**\n\n## Target mapping\n\n- \`biblo_toyen\` → new \`aat_vos\`\n- \`ibsen_museum_teater\` → new \`henrik_ibsen\`\n- \`psykologisk_institutt_uio\` → new \`harald_schjelderup\`\n- \`slottsplassen\` → existing \`haakon_vii_krigstid\` extended\n\n## Final state\n\n- Required non-nature Oslo places: **${finalCoverage.totals.requiredNonNaturePlaces}**\n- Covered required places: **${finalCoverage.totals.coveredRequiredPlaces}**\n- Uncovered required places: **${finalCoverage.totals.uncoveredRequiredPlaces}**\n- Logical People: **${finalCoverage.totals.logicalPeople}**\n- New canonical People: **3**\n- Reused canonical People: **1**\n- Duplicate candidate IDs/names before materialization: **0**\n- Invalid People refs: **${finalCoverage.totals.invalidPeopleRefs}**\n- Literature coverage: **${literature.covered}/${literature.total} (${literature.uncovered} uncovered)**\n- Politics coverage: **${politics.covered}/${politics.total} (${politics.uncovered} uncovered)**\n- Psychology coverage: **${psychology.covered}/${psychology.total} (${psychology.uncovered} uncovered)**\n\n## Research gate\n\n- Aat Vos is documented as the architect of Biblo Tøyen and developed its interior in dialogue with the young target group.\n- Henrik Ibsen lived and worked in Arbins gate 1 from 1895 to 1906; the preserved home is the historical core of IBSEN Museum & Teater.\n- Harald Schjelderup became Norway's first professor of psychology in 1928 and was central to building psychology as a university discipline; the current institute is housed in the building bearing his name.\n- Haakon VII is extended only through documented on-site Slottsplassen events: the balcony tradition from 1906 and the royal return on 7 June 1945.\n\n## Validation gates\n\n- \`scripts/check-people.sh\`: **pass**\n- \`audit:categories\`: **pass**\n- \`civication:history-people:check\`: **pass**\n- \`typecheck:tools\`: **pass**\n- \`typecheck:scripts\`: **pass**\n- single-record Oslo coverage regression: **pass**\n- \`health:data\`: **pass**\n- \`git diff --check\`: **pass**\n- changed place/coordinate-evidence source files: **0**\n\n## Runner scope note\n\nThe coordinate branch runner performs its standard repository checks. This batch itself is restricted to People data, manifest/generated People outputs and audit reports.\n`;
fs.writeFileSync(abs("reports/people-oslo-zero-gap-batch9-validation.md"), report, "utf8");

console.log("Oslo People zero-gap batch 9 completed successfully.");
