import { access, readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const reportMode = process.argv.includes("--report");
const manifestPath = "data/fag/fag_manifest.json";
const registryPath = "data/quiz/regler/QUIZ_TEMPLATE_REGISTRY_V2.json";
const standardPath = "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md";
const normalOpeningPolicyPath = "data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json";
const legacyStandardPath = "data/quiz/regler/QUIZ_STANDARD_CANONICAL_V2.md";
const schemaPath = "data/quiz/regler/QUIZ_QUESTION_SCHEMA_V2.json";
const packageSchemaPath = "data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json";
const reportPath = "reports/quiz-template-governance-audit.json";

const expectedManifestStandard = "../quiz/regler/QUIZ_PRODUCTION_CANONICAL.md";
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

async function legacyAuthorityCandidates(directory) {
  const output = [];
  for (const entry of await readdir(abs(directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      output.push(...await legacyAuthorityCandidates(relative));
    } else if (/(?:SET_MAL|QUIZ_SET_SCOPE|quiz_generator|supersetQUIZMAL|fag_manifest)/u.test(entry.name)) {
      output.push(relative);
    }
  }
  return output;
}

function resolveTargetPath(value) {
  return path.relative(root, path.resolve(root, "data/fag", value)).split(path.sep).join("/");
}

const failures = [];
const checkedProfiles = [];

for (const file of [
  manifestPath,
  registryPath,
  standardPath,
  normalOpeningPolicyPath,
  legacyStandardPath,
  schemaPath,
  packageSchemaPath
]) {
  if (!(await exists(file))) failures.push({ file, reason: "missing canonical governance file" });
}

let manifest = null;
let registry = null;
let normalOpeningPolicy = null;

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

try {
  normalOpeningPolicy = await readJson(normalOpeningPolicyPath);
} catch (error) {
  failures.push({ file: normalOpeningPolicyPath, reason: `invalid JSON: ${error.message}` });
}

if (normalOpeningPolicy) {
  if (normalOpeningPolicy.status !== "canonical_global_invariant") {
    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy is not canonical_global_invariant" });
  }
  if (normalOpeningPolicy.opening_block?.sets !== 2) {
    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy must require two opening sets" });
  }
  if (normalOpeningPolicy.opening_block?.questions_per_set !== 7) {
    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy must require seven questions per set" });
  }
  if (normalOpeningPolicy.opening_block?.total_questions !== 14) {
    failures.push({ file: normalOpeningPolicyPath, reason: "normal opening policy must require fourteen opening questions" });
  }
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
      failures.push({ categoryId, reason: "quizStandard does not point to canonical production procedure" });
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

    const expectedAuthority = entry.quizProduction
      ? "category_content_and_orchestration"
      : "category_content_only";
    const checks = [
      [profile.status === "canonical_category_profile", "profile status is not canonical_category_profile"],
      [profile.type === "category_quiz_profile", "profile type is not category_quiz_profile"],
      [profile.categoryId === categoryId, "profile categoryId does not match manifest"],
      [profile.governance?.production_standard === standardPath, "profile points to wrong production standard"],
      [profile.governance?.question_schema === schemaPath, "profile points to wrong question schema"],
      [profile.governance?.template_registry === registryPath, "profile points to wrong template registry"],
      [profile.governance?.authority === expectedAuthority, `profile authority is not ${expectedAuthority}`],
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

    if (entry.quizProduction) {
      const requiredInputs = entry.quizProduction.required_inputs;
      if (!Array.isArray(requiredInputs) || requiredInputs.length < 7) {
        failures.push({ categoryId, file: manifestPath, reason: "quizProduction has incomplete required_inputs" });
      } else {
        for (const key of requiredInputs) {
          if (typeof entry[key] !== "string" || !entry[key].trim()) {
            failures.push({ categoryId, file: manifestPath, reason: `required manifest input is missing: ${key}` });
          }
        }
      }
      if (entry.quizPackageSchema !== "../quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json") {
        failures.push({ categoryId, file: manifestPath, reason: "quizPackageSchema does not point to canonical package schema" });
      }
      if (profile.governance?.package_schema !== packageSchemaPath) {
        failures.push({ categoryId, file: profilePath, reason: "profile points to wrong package schema" });
      }
      if (profile.governance?.subject_manifest !== manifestPath) {
        failures.push({ categoryId, file: profilePath, reason: "profile points to wrong subject manifest" });
      }
      const targets = entry.quizProduction.targets;
      if (!targets || typeof targets !== "object" || Array.isArray(targets) || !Object.keys(targets).length) {
        failures.push({ categoryId, file: manifestPath, reason: "quizProduction.targets is missing" });
      } else {
        for (const [targetId, target] of Object.entries(targets)) {
          for (const key of ["source_brief", "context_artifact", "quiz_file"]) {
            if (typeof target?.[key] !== "string" || !target[key].trim()) {
              failures.push({ categoryId, targetId, file: manifestPath, reason: `target is missing ${key}` });
              continue;
            }
            const targetPath = resolveTargetPath(target[key]);
            if (!(await exists(targetPath))) {
              failures.push({ categoryId, targetId, file: targetPath, reason: `target ${key} does not exist` });
            }
          }
        }
      }
    }
  }
}

if (registry) {
  const expectedCanonicalFiles = {
    production_standard: standardPath,
    normal_opening_policy: normalOpeningPolicyPath,
    question_schema: schemaPath,
    package_schema: packageSchemaPath,
    subject_manifest: manifestPath,
    context_builder: "scripts/build-quiz-production-context.mjs",
    production_context_audit: "scripts/audit-quiz-production-context.mjs",
    progression_audit: "scripts/audit-quiz-progression.mjs",
    theory_binding_audit: "scripts/audit-quiz-theory-binding.mjs"
  };
  for (const [key, expected] of Object.entries(expectedCanonicalFiles)) {
    if (registry.canonical_files?.[key] !== expected) {
      failures.push({ file: registryPath, reason: `canonical_files.${key} is wrong`, expected, actual: registry.canonical_files?.[key] });
    }
    if (!(await exists(expected))) {
      failures.push({ file: expected, reason: `registered canonical file is missing (${key})` });
    }
  }
  if (registry.global_invariants?.normal_opening?.policy !== normalOpeningPolicyPath) {
    failures.push({ file: registryPath, reason: "global normal opening invariant is not registered" });
  }
}

if (await exists(legacyStandardPath)) {
  const legacyText = await readFile(abs(legacyStandardPath), "utf8");
  if (!legacyText.includes(standardPath) || !/Status:\s*erstattet/iu.test(legacyText)) {
    failures.push({ file: legacyStandardPath, reason: "legacy standard is not a pure redirect to canonical production" });
  }
}

for (const file of [
  ...await legacyAuthorityCandidates("data/fag"),
  ...await legacyAuthorityCandidates("data/quiz/regler")
]) {
  if (file === legacyStandardPath) continue;
  const text = await readFile(abs(file), "utf8");
  if (text.includes(legacyStandardPath)) {
    failures.push({ file, reason: "legacy authority pointer remains" });
  }
}

const report = {
  status: failures.length === 0 ? "passed" : "failed",
  canonicalStandard: standardPath,
  canonicalNormalOpeningPolicy: normalOpeningPolicyPath,
  canonicalSchema: schemaPath,
  canonicalPackageSchema: packageSchemaPath,
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
