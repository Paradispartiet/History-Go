#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { auditQuizContent } from "../scripts/audit-quiz-content-quality.mjs";

const QUIZ_ROOT = "data/quiz";
const QUIZ_MANIFEST_PATH = "data/quiz/manifest.json";
const QUIZ_ADDITIONS_PATH = "data/quiz/manifest_additions.json";
const FAG_MANIFEST_PATH = "data/fag/fag_manifest.json";
const OPENING_POLICY_PATH = "data/quiz/regler/QUIZ_NORMAL_OPENING_POLICY_V1.json";
const CONTENT_REPORT_PATH = "reports/quiz-content-quality.json";
const INVENTORY_JSON_PATH = "reports/quiz-normal-opening-migration-inventory.json";
const INVENTORY_MD_PATH = "reports/quiz-normal-opening-migration-inventory.md";

const SKIP_DISCOVERY_DIRS = new Set([
  ".git",
  "arkiv",
  "archive",
  "node_modules",
  "production_briefs",
  "production_context",
  "regler",
  "reports"
]);

const OPENING_SURFACE_RULES = [
  ["emne_prompt", /\b(?:passer|relevant)\b.{0,45}\b(?:emnet|temaet|fagfeltet)\b/iu],
  ["place_as_example", /\bhva gjør\b.{0,50}\b(?:til et eksempel på|relevant for)\b|\bkva gjer\b.{0,50}\b(?:til eit døme på|relevant for)\b/iu],
  ["reading_language", /\b(?:faglig lesning|fagleg lesing|leses som|lesast som|tolkes som|tolkast som)\b/iu],
  ["most_precise", /\b(?:mest presise|mest presist|mest treffende|mest treffande)\b/iu],
  ["concept_pick", /\b(?:hvilket|kva) begrep\b.{0,45}\b(?:passer|beskriver|forklarer|høver|skildrar|forklarar)\b/iu],
  ["theory_pick", /\b(?:hvilken|kva) (?:teori|teoretiker|teoretikar|metode|hook)\b/iu],
  ["curriculum_language", /\b(?:fagplan|fagkart|topic hook|emnekart|mapping|generator)\b/iu],
  ["institutional_reading", /\b(?:lese|lesa|lesast)\b.{0,35}\bsom (?:institusjon|byrom|møtested|møtestad|symbol)\b/iu],
  ["player_instruction", /\b(?:hva|kva) bør (?:spilleren|spelaren|du)\b|\b(?:hva|kva) skal (?:spilleren|spelaren|du) (?:se|sjå) etter\b/iu],
  ["question_about_question", /\b(?:hvilket|hvilke|kva|kva for eit) spørsmål\b/iu],
  ["quiz_about_quiz", /\b(?:god|beste|sterk)\b.{0,35}\bquiz\b|\bquiz\b.{0,45}\b(?:trene|trenar|lære|lærer|teste|testar)\b/iu],
  ["history_go_question", /\b(?:history go|history-go)\b.{0,25}\bspørsmål\b|\bspørsmål\b.{0,25}\b(?:history go|history-go)\b/iu],
  ["more_than_place", /\bhva gjør\b.{0,55}\bmer enn\b|\bkva gjer\b.{0,55}\bmeir enn\b/iu],
  ["mechanism_pick", /\b(?:hvilken|kva) mekanisme\b.{0,45}\b(?:forklarer|forklarar|passer|høver)\b/iu],
  ["distinction_pick", /\b(?:hvilken|kva) distinksjon\b|\bhvilket skille\b.{0,35}\b(?:er|passer|forklarer)\b/iu],
  ["illustrates_place", /\bhvordan illustrerer\b.{0,55}\b(?:stedet|staden|bygningen|personen)\b/iu],
  ["what_place_shows", /\bhva viser\b.{0,55}\b(?:stedet|staden|bygningen|personen)\b.{0,35}\bom\b/iu]
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function toPosix(value) {
  return String(value).split(path.sep).join("/");
}

function relativeRepoPath(root, absolutePath) {
  return toPosix(path.relative(root, absolutePath));
}

async function readJson(root, relativePath) {
  return JSON.parse(await fs.readFile(path.join(root, relativePath), "utf8"));
}

async function pathExists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeManifestRelativePath(baseDirectory, relativePath) {
  return toPosix(path.normalize(path.join(baseDirectory, String(relativePath))));
}

function extractSets(parsed) {
  if (Array.isArray(parsed?.sets)) return parsed.sets;
  if (Array.isArray(parsed) && parsed.some((entry) => Array.isArray(entry?.questions))) {
    return parsed.filter((entry) => Array.isArray(entry?.questions));
  }
  if (Array.isArray(parsed?.quiz?.sets)) return parsed.quiz.sets;
  return [];
}

function collectTargetIds(parsed, sets) {
  const ids = new Set();
  for (const value of [parsed?.targetId, parsed?.placeId, parsed?.personId, parsed?.natureId]) {
    if (value) ids.add(String(value));
  }
  for (const set of sets) {
    for (const value of [set?.targetId, set?.placeId, set?.personId, set?.natureId]) {
      if (value) ids.add(String(value));
    }
    for (const question of asArray(set?.questions)) {
      for (const value of [question?.targetId, question?.placeId, question?.personId, question?.natureId]) {
        if (value) ids.add(String(value));
      }
    }
  }
  return [...ids].sort();
}

function openingQuestionProblems(question, policy) {
  const opening = policy.opening_block || {};
  const problems = [];

  for (const field of asArray(opening.forbidden_binding_fields)) {
    if (question?.[field]) problems.push(`forbidden_binding:${field}`);
  }

  const questionType = String(question?.question_type ?? "").trim().toLowerCase();
  if (!questionType) {
    problems.push("missing_question_type");
  } else if (asArray(opening.forbidden_question_types).includes(questionType)) {
    problems.push(`forbidden_question_type:${questionType}`);
  } else {
    const allowedTypes = asArray(opening.allowed_question_types);
    if (allowedTypes.length && !allowedTypes.includes(questionType)) {
      problems.push(`question_type_not_allowed_in_opening:${questionType}`);
    }
  }

  const questionText = String(question?.question ?? "").trim();
  if (!questionText) problems.push("missing_question");
  if (!asArray(question?.source).length) problems.push("missing_source");

  const options = asArray(question?.options);
  if (options.length < 3) problems.push("too_few_options");
  const answer = String(question?.answer ?? "").trim();
  if (!answer) {
    problems.push("missing_answer");
  } else if (options.length && !options.includes(question.answer)) {
    problems.push("answer_not_in_options");
  }

  const enabledSurfaceRules = new Set(asArray(opening.forbidden_surface_rule_ids));
  for (const [ruleId, regex] of OPENING_SURFACE_RULES) {
    if (enabledSurfaceRules.has(ruleId) && regex.test(questionText)) {
      problems.push(`forbidden_surface:${ruleId}`);
    }
  }

  return [...new Set(problems)];
}

function auditOpening(sets, policy) {
  const requiredSets = Number(policy.opening_block?.sets || 2);
  const questionsPerSet = Number(policy.opening_block?.questions_per_set || 7);
  const openingSets = sets.slice(0, requiredSets);
  const violations = [];
  const questionViolations = [];
  const setQuestionCounts = [];

  if (sets.length < requiredSets) {
    violations.push(`missing_opening_sets:${sets.length}/${requiredSets}`);
  }

  for (let setIndex = 0; setIndex < requiredSets; setIndex += 1) {
    const set = openingSets[setIndex];
    const questions = asArray(set?.questions);
    setQuestionCounts.push(questions.length);
    if (!set) {
      violations.push(`missing_set:${setIndex + 1}`);
      continue;
    }
    if (questions.length !== questionsPerSet) {
      violations.push(`wrong_question_count:set_${setIndex + 1}:${questions.length}/${questionsPerSet}`);
    }
    for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
      const question = questions[questionIndex];
      const problems = openingQuestionProblems(question, policy);
      if (problems.length) {
        questionViolations.push({
          setIndex: setIndex + 1,
          questionIndex: questionIndex + 1,
          id: String(question?.quiz_id || question?.id || ""),
          question: String(question?.question || ""),
          problems
        });
      }
    }
  }

  const checkedQuestions = openingSets.reduce((sum, set) => sum + asArray(set?.questions).length, 0);
  return {
    requiredSets,
    questionsPerSet,
    actualSetCount: sets.length,
    setQuestionCounts,
    checkedQuestions,
    structuralViolations: violations,
    questionViolations,
    questionViolationCount: questionViolations.reduce((sum, item) => sum + item.problems.length, 0),
    compliant: sets.length >= requiredSets && violations.length === 0 && questionViolations.length === 0
  };
}

async function discoverSetFiles(root) {
  const absoluteQuizRoot = path.join(root, QUIZ_ROOT);
  const discovered = [];

  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DISCOVERY_DIRS.has(entry.name)) await visit(absolutePath);
        continue;
      }
      if (!entry.isFile() || !/_sets(?:_[^/]*)?\.json$/iu.test(entry.name)) continue;
      discovered.push(relativeRepoPath(root, absolutePath));
    }
  }

  await visit(absoluteQuizRoot);
  return discovered.sort();
}

function createRecord(file) {
  return {
    file,
    registrationSources: new Set(),
    manifestTargetIds: new Set(),
    activeProductionTargets: [],
    discoveredInRepository: false
  };
}

function summarizeContentByFile(contentReport) {
  const fileMap = new Map();
  const ensure = (file) => {
    if (!fileMap.has(file)) {
      fileMap.set(file, {
        scannedQuestions: 0,
        groups: [],
        templateViolations: 0,
        theoryQuestions: 0,
        balanceViolations: 0,
        optionLengthSignals: 0,
        repeatedOpeningSignals: 0
      });
    }
    return fileMap.get(file);
  };

  for (const group of contentReport.groups || []) {
    const entry = ensure(group.file);
    entry.scannedQuestions += Number(group.total || 0);
    entry.groups.push({
      target: group.target,
      total: group.total,
      counts: group.counts,
      ratios: group.ratios,
      violations: group.violations
    });
  }
  for (const item of contentReport.templateViolations || []) ensure(item.file).templateViolations += 1;
  for (const item of contentReport.theoryQuestions || []) ensure(item.file).theoryQuestions += 1;
  for (const item of contentReport.balanceViolations || []) ensure(item.file).balanceViolations += 1;
  for (const item of contentReport.optionLengthSignals || []) ensure(item.file).optionLengthSignals += 1;
  for (const item of contentReport.repeatedOpenings || []) {
    for (const file of item.files || []) ensure(file).repeatedOpeningSignals += 1;
  }
  return fileMap;
}

function determineStatus(record) {
  if (record.activeProductionTargets.length) return "active_production";
  if (record.registrationSources.has("manifest_addition")) return "pending_manifest_addition";
  if (record.registrationSources.has("manifest")) return "manifest_only";
  return "unregistered_set_file";
}

function calculatePriority(item) {
  let score = 0;
  if (!item.exists) score += 1000;
  if (item.parseError) score += 900;
  if (item.status === "active_production" && !item.opening.compliant) score += 700;
  if (item.status === "pending_manifest_addition") score += 80;
  if (item.status === "manifest_only") score += 50;
  if (item.status === "unregistered_set_file") score += 20;
  score += item.opening.structuralViolations.length * 140;
  score += Math.min(item.opening.questionViolationCount, 40) * 15;
  score += item.content.templateViolations * 25;
  score += item.content.optionLengthSignals * 8;
  score += item.content.repeatedOpeningSignals * 4;
  score += item.content.balanceViolations * 2;
  return score;
}

function buildMarkdown(report) {
  const s = report.summary;
  const lines = [
    "# Quiz: migreringskø for global 2 × 7-normalåpning",
    "",
    `Generert: ${report.generatedAt}`,
    "",
    "## Omfang",
    "",
    `- manifestoppføringer: **${s.manifestEntries}**`,
    `- tillegg til manifestet: **${s.manifestAdditionEntries}**`,
    `- unike quizfiler i inventaret: **${s.uniqueFiles}**`,
    `- oppdagede set-filer i repoet: **${s.discoveredSetFiles}**`,
    `- aktive produksjonsmål: **${s.activeProductionTargets}**`,
    `- aktive produksjonsmål som består 2 × 7: **${s.activeProductionCompliant}**`,
    `- manifestregistrerte legacy-filer: **${s.manifestOnlyFiles}**`,
    `- ventende manifesttillegg: **${s.pendingManifestAdditionFiles}**`,
    `- uregistrerte set-filer: **${s.unregisteredSetFiles}**`,
    `- manglende filer: **${s.missingFiles}**`,
    `- JSON-feil: **${s.parseErrors}**`,
    `- fullstendig 2 × 7-kompatible filer: **${s.openingCompliantFiles}**`,
    `- filer som krever åpning-/malreparasjon: **${s.migrationRequiredFiles}**`,
    `- filer som bare trenger videre innholdsgjennomgang: **${s.contentReviewOnlyFiles}**`,
    "",
    "## Tolkning",
    "",
    "`active_production` er allerede under den bindende globale porten. `manifest_only` og `pending_manifest_addition` finnes i quizmanifestet, men mangler full produksjonskontekst. `unregistered_set_file` finnes i repoet uten manifestregistrering og må først avklares som aktiv, legacy, duplikat eller arkiv.",
    "",
    "Balansebrudd fra den eldre 50–60 / 20–30 / 15–25-auditen er beholdt som informasjon, men gir lav prioritet alene. Den absolutte 2 × 7-regelen har forrang.",
    "",
    "## Høyest prioriterte migreringskø",
    "",
    "| # | Poeng | Status | Mål | 2 × 7 | Malbrudd | Balanse | Fil |",
    "|---:|---:|---|---|---:|---:|---:|---|"
  ];

  for (const [index, item] of report.queue.slice(0, 75).entries()) {
    const targets = item.targetIds.length ? item.targetIds.join(", ") : "–";
    lines.push(`| ${index + 1} | ${item.priorityScore} | ${item.status} | ${targets} | ${item.opening.compliant ? "ja" : "nei"} | ${item.content.templateViolations} | ${item.content.balanceViolations} | \`${item.file}\` |`);
  }

  lines.push("", "## Aktive produksjonsmål", "", "| Kategori | Mål | 2 × 7 | Fil |", "|---|---|---:|---|");
  for (const item of report.files.filter((entry) => entry.status === "active_production")) {
    for (const target of item.activeProductionTargets) {
      lines.push(`| ${target.categoryId} | ${target.targetId} | ${item.opening.compliant ? "ja" : "nei"} | \`${item.file}\` |`);
    }
  }

  lines.push("", "## Neste arbeidssteg", "", "Reparer køen i små kildeverifiserte batcher. Behold gode normale spørsmål, erstatt oppkonstruerte åpningsspørsmål, og registrer først en fil som aktivt produksjonsmål når kildebrief og `production_context` finnes.", "");
  return lines.join("\n");
}

export async function buildQuizNormalOpeningMigrationInventory({ root = process.cwd(), writeReports = true } = {}) {
  const [quizManifest, additions, fagManifest, openingPolicy, discoveredFiles, contentReport] = await Promise.all([
    readJson(root, QUIZ_MANIFEST_PATH),
    readJson(root, QUIZ_ADDITIONS_PATH),
    readJson(root, FAG_MANIFEST_PATH),
    readJson(root, OPENING_POLICY_PATH),
    discoverSetFiles(root),
    auditQuizContent({ rootDir: path.join(root, QUIZ_ROOT) })
  ]);

  const records = new Map();
  const ensureRecord = (file) => {
    const normalized = toPosix(path.normalize(file));
    if (!records.has(normalized)) records.set(normalized, createRecord(normalized));
    return records.get(normalized);
  };

  for (const file of discoveredFiles) ensureRecord(file).discoveredInRepository = true;

  for (const entry of asArray(quizManifest.sets)) {
    if (!entry?.file) continue;
    const record = ensureRecord(entry.file);
    record.registrationSources.add("manifest");
    if (entry.targetId) record.manifestTargetIds.add(String(entry.targetId));
  }

  for (const entry of asArray(additions.sets)) {
    if (!entry?.file) continue;
    const record = ensureRecord(entry.file);
    record.registrationSources.add("manifest_addition");
    if (entry.targetId) record.manifestTargetIds.add(String(entry.targetId));
  }

  const activeTargets = [];
  for (const [categoryId, category] of Object.entries(fagManifest)) {
    const targets = category?.quizProduction?.targets;
    if (!targets || typeof targets !== "object" || Array.isArray(targets)) continue;
    for (const [targetId, target] of Object.entries(targets)) {
      if (!target?.quiz_file) continue;
      const file = normalizeManifestRelativePath(path.dirname(FAG_MANIFEST_PATH), target.quiz_file);
      const activeTarget = { categoryId, targetId, file };
      activeTargets.push(activeTarget);
      const record = ensureRecord(file);
      record.registrationSources.add("active_production");
      record.activeProductionTargets.push({ categoryId, targetId });
    }
  }

  const contentByFile = summarizeContentByFile(contentReport);
  const files = [];

  for (const record of [...records.values()].sort((a, b) => a.file.localeCompare(b.file, "nb"))) {
    const absolutePath = path.join(root, record.file);
    const exists = await pathExists(absolutePath);
    let parsed = null;
    let parseError = null;
    let sets = [];
    let discoveredTargetIds = [];

    if (exists) {
      try {
        parsed = JSON.parse(await fs.readFile(absolutePath, "utf8"));
        sets = extractSets(parsed);
        discoveredTargetIds = collectTargetIds(parsed, sets);
      } catch (error) {
        parseError = String(error?.message || error);
      }
    }

    const opening = parseError || !exists
      ? {
          requiredSets: Number(openingPolicy.opening_block?.sets || 2),
          questionsPerSet: Number(openingPolicy.opening_block?.questions_per_set || 7),
          actualSetCount: 0,
          setQuestionCounts: [],
          checkedQuestions: 0,
          structuralViolations: [!exists ? "missing_file" : "parse_error"],
          questionViolations: [],
          questionViolationCount: 0,
          compliant: false
        }
      : auditOpening(sets, openingPolicy);

    const content = contentByFile.get(record.file) || {
      scannedQuestions: 0,
      groups: [],
      templateViolations: 0,
      theoryQuestions: 0,
      balanceViolations: 0,
      optionLengthSignals: 0,
      repeatedOpeningSignals: 0
    };

    const targetIds = [...new Set([
      ...record.manifestTargetIds,
      ...record.activeProductionTargets.map((target) => target.targetId),
      ...discoveredTargetIds
    ])].sort();
    const status = determineStatus(record);
    const migrationRequired = !exists || Boolean(parseError) || !opening.compliant || content.templateViolations > 0;
    const contentReviewRequired = migrationRequired || content.balanceViolations > 0 || content.optionLengthSignals > 0 || content.repeatedOpeningSignals > 0;

    const item = {
      file: record.file,
      status,
      targetIds,
      registrationSources: [...record.registrationSources].sort(),
      activeProductionTargets: record.activeProductionTargets.sort((a, b) => a.categoryId.localeCompare(b.categoryId) || a.targetId.localeCompare(b.targetId)),
      discoveredInRepository: record.discoveredInRepository,
      exists,
      parseError,
      opening,
      content,
      migrationRequired,
      contentReviewRequired
    };
    item.priorityScore = calculatePriority(item);
    files.push(item);
  }

  const queue = files
    .filter((item) => item.migrationRequired || item.contentReviewRequired)
    .sort((a, b) => b.priorityScore - a.priorityScore || a.file.localeCompare(b.file, "nb"));

  const summary = {
    manifestEntries: asArray(quizManifest.sets).length,
    manifestAdditionEntries: asArray(additions.sets).length,
    uniqueFiles: files.length,
    discoveredSetFiles: discoveredFiles.length,
    activeProductionTargets: activeTargets.length,
    activeProductionFiles: files.filter((item) => item.status === "active_production").length,
    activeProductionCompliant: activeTargets.filter((target) => files.find((item) => item.file === target.file)?.opening.compliant).length,
    manifestOnlyFiles: files.filter((item) => item.status === "manifest_only").length,
    pendingManifestAdditionFiles: files.filter((item) => item.status === "pending_manifest_addition").length,
    unregisteredSetFiles: files.filter((item) => item.status === "unregistered_set_file").length,
    missingFiles: files.filter((item) => !item.exists).length,
    parseErrors: files.filter((item) => item.parseError).length,
    openingCompliantFiles: files.filter((item) => item.opening.compliant).length,
    migrationRequiredFiles: files.filter((item) => item.migrationRequired).length,
    contentReviewOnlyFiles: files.filter((item) => !item.migrationRequired && item.contentReviewRequired).length,
    queueSize: queue.length
  };

  const inventory = {
    schema: "history_go_quiz_normal_opening_migration_inventory_v1",
    generatedAt: new Date().toISOString(),
    authority: {
      productionStandard: "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",
      openingPolicy: OPENING_POLICY_PATH,
      quizManifest: QUIZ_MANIFEST_PATH,
      manifestAdditions: QUIZ_ADDITIONS_PATH,
      fagManifest: FAG_MANIFEST_PATH
    },
    summary,
    contentAuditSummary: contentReport.summary,
    queue,
    files
  };

  if (writeReports) {
    await fs.mkdir(path.join(root, "reports"), { recursive: true });
    await fs.writeFile(path.join(root, CONTENT_REPORT_PATH), `${JSON.stringify(contentReport, null, 2)}\n`, "utf8");
    await fs.writeFile(path.join(root, INVENTORY_JSON_PATH), `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
    await fs.writeFile(path.join(root, INVENTORY_MD_PATH), `${buildMarkdown(inventory)}\n`, "utf8");
  }

  return { inventory, contentReport };
}

async function main() {
  const { inventory } = await buildQuizNormalOpeningMigrationInventory();
  const s = inventory.summary;
  console.log("Quiz normal-opening migration inventory");
  console.log(`- unike filer: ${s.uniqueFiles}`);
  console.log(`- aktive produksjonsmål: ${s.activeProductionTargets}`);
  console.log(`- aktive produksjonsmål som består: ${s.activeProductionCompliant}`);
  console.log(`- migrering kreves: ${s.migrationRequiredFiles}`);
  console.log(`- innholdsgjennomgang uten åpningsbrudd: ${s.contentReviewOnlyFiles}`);
  console.log(`- kø: ${s.queueSize}`);
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
