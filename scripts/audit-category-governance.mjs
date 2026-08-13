import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const readText = (file) => readFile(path.resolve(root, file), "utf8");
const readJson = async (file) => JSON.parse(await readText(file));
const sorted = (values) => [...values].sort();
const same = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

function extractStringArray(source, constantName) {
  const pattern = new RegExp(`const\\s+${constantName}\\s*=\\s*\\[([\\s\\S]*?)\\]`, "m");
  const match = source.match(pattern);
  if (!match) return null;
  return [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]);
}

function runtimeIdsFromCategoriesSource(source) {
  return [...source.matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?scope:\s*"runtime_domain(?:_alias)?"[\s\S]*?\}/g)]
    .map((entry) => entry[1]);
}

const contract = await readJson("data/categories/category_contract.json");
const manifest = await readJson("data/fag/fag_manifest.json");
const templateRegistry = await readJson("data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json");
const badgeIndex = await readJson("data/badges/index.json");
const domainRegistrySource = await readText("js/DomainRegistry.js");
const categoriesSource = await readText("js/core/categories.ts");
const placePolicySource = await readText("tools/placeSchemaPolicy.mts");

const failures = [];
const requireSame = (name, actual, expected) => {
  if (!same(actual, expected)) failures.push({ name, actual: sorted(actual), expected: sorted(expected) });
};

requireSame("fag manifest", Object.keys(manifest), contract.fagSubjects);
requireSame("quiz template registry", Object.keys(templateRegistry.category_profiles || {}), contract.fagSubjects);

const expectedBadgeFiles = [
  ...contract.runtimeCategories.map((id) => `data/badges/${id}.json`),
  ...contract.nonPlaceBadges.map((id) => `data/badges/${id}.json`)
];
requireSame("badge index", badgeIndex.files || [], expectedBadgeFiles);

const registryFag = extractStringArray(domainRegistrySource, "CANONICAL");
const registryRuntime = extractStringArray(domainRegistrySource, "RUNTIME_CATEGORY_IDS");
const placeOfficial = extractStringArray(placePolicySource, "OFFICIAL_HISTORY_GO_CATEGORIES");
const categoryUiIds = runtimeIdsFromCategoriesSource(categoriesSource);

if (!registryFag) failures.push({ name: "DomainRegistry CANONICAL", reason: "array not found" });
else requireSame("DomainRegistry fag ids", registryFag, contract.fagSubjects);

if (!registryRuntime) failures.push({ name: "DomainRegistry runtime ids", reason: "array not found" });
else requireSame("DomainRegistry runtime ids", registryRuntime, contract.runtimeCategories);

if (!placeOfficial) failures.push({ name: "place policy", reason: "official array not found" });
else requireSame("place policy runtime ids", placeOfficial, contract.runtimeCategories);

requireSame("category UI runtime ids", categoryUiIds, contract.runtimeCategories);

for (const forbidden of ["kultur", "teater", "film", "tv", "journalistikk"]) {
  if (contract.runtimeCategories.includes(forbidden) || contract.fagSubjects.includes(forbidden)) {
    failures.push({ name: "forbidden top-level alias", id: forbidden });
  }
}

if (!contract.runtimeCategories.includes("filosofi")) failures.push({ name: "filosofi", reason: "missing runtime category" });
if (!contract.fagSubjects.includes("filosofi")) failures.push({ name: "filosofi", reason: "missing fag subject" });
if (contract.runtimeToFag?.filosofi) failures.push({ name: "filosofi", reason: "must not map to another fag subject" });
if (!contract.runtimeCategories.includes("scenekunst")) failures.push({ name: "scenekunst", reason: "missing runtime category" });
if (!contract.fagSubjects.includes("scenekunst")) failures.push({ name: "scenekunst", reason: "missing fag subject" });
if (contract.runtimeCategories.includes("sosial_laering") || contract.fagSubjects.includes("sosial_laering")) failures.push({ name: "sosial_laering", reason: "must not be a canonical category or subject" });
if ((contract.nonPlaceBadges || []).includes("sosial_laering")) failures.push({ name: "sosial_laering", reason: "must not be registered as a badge" });
if ((badgeIndex.files || []).includes("data/badges/sosial_laering.json")) failures.push({ name: "sosial_laering", reason: "must not be present in the badge index" });
if (contract.runtimeCategories.includes("teknologi") || contract.fagSubjects.includes("teknologi")) failures.push({ name: "teknologi", reason: "must be a specialization under vitenskap, not a top category" });
for (const alias of ["technology", "teknologi", "tech", "it", "informasjonsteknologi"]) { if (contract.aliases?.[alias] !== "vitenskap") failures.push({ name: "teknologi alias", alias, expected: "vitenskap", actual: contract.aliases?.[alias] }); }
if (contract.labels?.vitenskap !== "Vitenskap & teknologi") failures.push({ name: "vitenskap label", reason: "must include technology" });
const technologySpecialization = manifest.vitenskap?.specializations?.teknologi;
if (technologySpecialization?.canonicalParentSubject !== "vitenskap" || technologySpecialization?.badgeId !== "vitenskap") failures.push({ name: "teknologi specialization", reason: "missing canonical parent or shared badge" });
if (templateRegistry.category_profiles?.teknologi) failures.push({ name: "teknologi quiz profile", reason: "must not be registered as a top category profile" });
if (templateRegistry.subject_specialization_profiles?.vitenskap?.teknologi !== "data/fag/teknologi/supersetQUIZMAL_teknologi.json") failures.push({ name: "teknologi quiz specialization", reason: "missing nested specialization profile" });

// Keep the academic core, business-school breadth and individual professional depth independently auditable.
for (const validator of [
  {
    name: "Økonomi og næringsliv university framework",
    module: "../tools/validate-okonomi-naeringsliv-universitetsramme.mjs"
  },
  {
    name: "Økonomi og næringsliv university quality",
    module: "../tools/validate-okonomi-naeringsliv-universitetskvalitet.mjs"
  },
  {
    name: "Økonomi og næringsliv individual emne revision",
    module: "../tools/validate-okonomi-naeringsliv-emnerevisjon.mjs"
  },
  {
    name: "Økonomi og næringsliv business-school coverage",
    module: "../tools/validate-okonomi-naeringsliv-handelshogskole.mjs"
  },
  {
    name: "Økonomi og næringsliv professional module depth",
    module: "../tools/validate-okonomi-naeringsliv-profesjonsfordypning.mjs"
  },
  {
    name: "Økonomi og næringsliv Oslo professional materialization",
    module: "../tools/validate-naeringsliv-oslo-profesjonsmaterialisering.mjs"
  }
]) {
  try {
    await import(validator.module);
  } catch (error) {
    failures.push({
      name: validator.name,
      reason: error instanceof Error ? error.message : String(error)
    });
  }
}

const report = {
  status: failures.length ? "failed" : "passed",
  runtimeCategories: contract.runtimeCategories.length,
  fagSubjects: contract.fagSubjects.length,
  failures
};

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length ? 1 : 0;
