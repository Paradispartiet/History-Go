import { access, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reportMode = process.argv.includes("--report");
const manifestPath = "data/fag/fag_manifest.json";
const registryPath = "data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json";
const standardPath = "data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md";
const schemaPath = "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json";
const reportPath = "reports/quiz-template-governance-audit.json";

const expectedManifestStandard = "../quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md";
const expectedManifestSchema = "../quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json";

function abs(file) {
  return path.resolve(root, file);
}

async function exists(file) {
  try {
    await access(abs(file));
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(abs(file), "utf8"));
}

const failures = [];
const checkedProfiles = [];

for (const file of [manifestPath, registryPath, standardPath, schemaPath]) {
  if (!(await exists(file))) failures.push({ file, reason: "missing canonical governance file" });
}

let manifest = null;
let registry = null;

try {
  manifest = await readJson(manifestPath);
} catch (error) {
  failures.push({ file: manifestPath, reason: `invalid JSON: ${error.message}` });
}

try {
  registry = await readJson(registryPath);
} catch (error) {
  failures.push({ file: registryPath, reason: `invalid JSON: ${error.message}` });
}

if (manifest && registry) {
  const registryProfiles = registry.category_profiles || {};
  const manifestCategories = Object.keys(manifest).sort();
  const registryCategories = Object.keys(registryProfiles).sort();

  if (JSON.stringify(manifestCategories) !== JSON.stringify(registryCategories)) {
    failures.push({
      file: registryPath,
      reason: "category list differs from data/fag/fag_manifest.json",
      manifestCategories,
      registryCategories
    });
  }

  for (const [categoryId, entry] of Object.entries(manifest)) {
    if (!entry || typeof entry !== "object") {
      failures.push({ categoryId, reason: "manifest entry is not an object" });
      continue;
    }

    for (const forbiddenKey of ["quizGeneratorRules", "setScopeReadme"]) {
      if (Object.hasOwn(entry, forbiddenKey)) {
        failures.push({ categoryId, reason: `legacy authority key remains in manifest: ${forbiddenKey}` });
      }
    }

    if (entry.quizStandard !== expectedManifestStandard) {
      failures.push({ categoryId, reason: "quizStandard does not point to canonical v2" });
    }
    if (entry.quizQuestionSchema !== expectedManifestSchema) {
      failures.push({ categoryId, reason: "quizQuestionSchema does not point to canonical v2" });
    }
    if (typeof entry.supersetQuizMal !== "string" || !entry.supersetQuizMal.trim()) {
      failures.push({ categoryId, reason: "missing category quiz profile" });
      continue;
    }

    const profilePath = `data/fag/${entry.supersetQuizMal}`;
    if (!(await exists(profilePath))) {
      failures.push({ categoryId, file: profilePath, reason: "category profile does not exist" });
      continue;
    }

    let profile;
    try {
      profile = await readJson(profilePath);
    } catch (error) {
      failures.push({ categoryId, file: profilePath, reason: `invalid JSON: ${error.message}` });
      continue;
    }

    checkedProfiles.push(profilePath);

    const checks = [
      [profile.status === "canonical_category_profile", "profile status is not canonical_category_profile"],
      [profile.type === "category_quiz_profile", "profile type is not category_quiz_profile"],
      [profile.categoryId === categoryId, "profile categoryId does not match manifest"],
      [profile.governance?.production_standard === standardPath, "profile points to wrong production standard"],
      [profile.governance?.question_schema === schemaPath, "profile points to wrong question schema"],
      [profile.governance?.template_registry === registryPath, "profile points to wrong template registry"],
      [profile.governance?.authority === "category_content_only", "profile authority is not category_content_only"],
      [profile.governance?.may_override_global_rules === false, "profile may override global rules"],
      [typeof profile.required_emne_prefix === "string" && profile.required_emne_prefix.startsWith("em_"), "missing required emne prefix"],
      [Array.isArray(profile.content_priorities) && profile.content_priorities.length >= 4, "too few content priorities"],
      [Array.isArray(profile.essential_concepts) && profile.essential_concepts.length >= 6, "too few essential concepts"],
      [Array.isArray(profile.preferred_source_types) && profile.preferred_source_types.length >= 3, "too few preferred source types"]
    ];

    for (const [ok, reason] of checks) {
      if (!ok) failures.push({ categoryId, file: profilePath, reason });
    }

    const expectedRegistryPath = profilePath;
    if (registryProfiles[categoryId] !== expectedRegistryPath) {
      failures.push({ categoryId, file: registryPath, reason: "registry profile path differs from manifest" });
    }
  }
}

const report = {
  status: failures.length === 0 ? "passed" : "failed",
  canonicalStandard: standardPath,
  canonicalSchema: schemaPath,
  categoriesChecked: manifest ? Object.keys(manifest).length : 0,
  profilesChecked: checkedProfiles.length,
  failures
};

if (reportMode) {
  await mkdir(abs("reports"), { recursive: true });
  await writeFile(abs(reportPath), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Wrote ${reportPath}`);
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = failures.length === 0 ? 0 : 1;
