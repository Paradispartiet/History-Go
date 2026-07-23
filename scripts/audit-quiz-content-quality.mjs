#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const THEORY_RULES = [
  ["emne_prompt", /\b(?:passer|relevant)\b.{0,45}\b(?:emnet|temaet|fagfeltet)\b/iu],
  ["place_as_example", /\bhva gjør\b.{0,50}\b(?:til et eksempel på|relevant for)\b/iu],
  ["reading_language", /\b(?:leses|lesningen|faglig lesning|tolkes som)\b/iu],
  ["most_precise", /\bmest presise\b/iu],
  ["concept_pick", /\bhvilket begrep\b.{0,45}\b(?:passer|beskriver|forklarer)\b/iu],
  ["theory_pick", /\bhvilken (?:teori|teoretiker|metode|hook)\b/iu],
  ["curriculum_language", /\b(?:fagplan|fagkart|topic hook|emnekart|mapping)\b/iu],
  ["institutional_reading", /\blese\b.{0,35}\bsom (?:institusjon|byrom|møtested|symbol)\b/iu]
];

const CONTEXT_RULES = [
  /\bhvorfor (?:ble|er|har|fikk|måtte|valgte|oppsto|forsvant|endret)\b/iu,
  /\bhva (?:førte|gjorde|betød|var grunnen|var hensikten)\b/iu,
  /\bhvordan (?:bidrar|påvirket|endret|utviklet|virker|fungerte)\b/iu,
  /\bhvilken betydning\b/iu,
  /\bhva skiller\b/iu
];

const BALANCE_POLICY = Object.freeze({
  minimumFactRatio: 0.5,
  maximumFactRatio: 0.6,
  minimumContextRatio: 0.2,
  maximumContextRatio: 0.3,
  minimumTheoryRatio: 0.15,
  maximumTheoryRatio: 0.25,
  balanceAppliedFromQuestionCount: 10
});

const SKIP_DIRS = new Set([
  "arkiv",
  "regler",
  "reports",
  "report",
  "fixtures",
  "production_briefs",
  "production_context",
  "node_modules",
  ".git"
]);
const SKIP_FILES = [/manifest/iu, /schema/iu, /report/iu, /profile/iu, /mapping/iu, /index/iu];

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function findTheorySignals(question) {
  return THEORY_RULES.filter(([, regex]) => regex.test(question)).map(([id]) => id);
}

function classifyQuestion(item) {
  const question = String(item?.question ?? "");
  const theorySignals = findTheorySignals(question);
  if (theorySignals.length) return { family: "theory", theorySignals };

  if (item?.topic_hook_id || item?.thinker_id || item?.theory_ref || item?.method_id) {
    return { family: "theory", theorySignals: ["declared_method_or_theory_binding"] };
  }

  const declared = normalizeText(item?.question_type);
  if (["concept", "theory", "definition", "begrep"].includes(declared)) {
    return { family: "theory", theorySignals: ["declared_concept_or_theory"] };
  }

  if (CONTEXT_RULES.some((regex) => regex.test(question)) || ["analysis", "cause", "context", "sammenheng"].includes(declared)) {
    return { family: "context", theorySignals: [] };
  }

  return { family: "fact", theorySignals: [] };
}

function openingKey(question, words = 6) {
  return normalizeText(question).split(" ").filter(Boolean).slice(0, words).join(" ");
}

function optionLengthSignal(item) {
  const options = Array.isArray(item?.options) ? item.options.map((x) => String(x ?? "").trim()) : [];
  if (options.length < 3) return null;

  const answerIndex = Number.isInteger(item?.answerIndex) ? item.answerIndex : options.indexOf(String(item?.answer ?? "").trim());
  if (answerIndex < 0 || answerIndex >= options.length) return null;

  const correctLength = options[answerIndex].length;
  const distractors = options.filter((_, index) => index !== answerIndex);
  const meanDistractorLength = distractors.reduce((sum, option) => sum + option.length, 0) / distractors.length;
  const ratio = meanDistractorLength ? correctLength / meanDistractorLength : 0;

  if (correctLength >= 45 && correctLength - meanDistractorLength >= 22 && ratio >= 1.65) {
    return {
      correctLength,
      meanDistractorLength: round(meanDistractorLength),
      ratio: round(ratio)
    };
  }

  return null;
}

function collectQuestions(node, output = []) {
  if (Array.isArray(node)) {
    for (const value of node) collectQuestions(value, output);
    return output;
  }
  if (!node || typeof node !== "object") return output;

  if (typeof node.question === "string" && Array.isArray(node.options)) output.push(node);
  for (const value of Object.values(node)) collectQuestions(value, output);
  return output;
}

async function walkJsonFiles(rootDir) {
  const files = [];

  async function visit(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await visit(fullPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith(".json") || SKIP_FILES.some((regex) => regex.test(entry.name))) continue;
      files.push(fullPath);
    }
  }

  await visit(rootDir);
  return files.sort();
}

function targetKey(item, relativeFile) {
  return String(item?.targetId || item?.placeId || item?.personId || item?.natureId || relativeFile);
}

function assessGroup(group) {
  const total = group.questions.length;
  const counts = { fact: 0, context: 0, theory: 0 };
  for (const question of group.questions) counts[question.family] += 1;

  const ratios = Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, total ? round(value / total) : 0]));
  const violations = [];

  if (total >= BALANCE_POLICY.balanceAppliedFromQuestionCount) {
    if (ratios.fact < BALANCE_POLICY.minimumFactRatio) violations.push(`fact_ratio_below_50_percent:${ratios.fact}`);
    if (ratios.fact > BALANCE_POLICY.maximumFactRatio) violations.push(`fact_ratio_above_60_percent:${ratios.fact}`);
    if (ratios.context < BALANCE_POLICY.minimumContextRatio) violations.push(`context_ratio_below_20_percent:${ratios.context}`);
    if (ratios.context > BALANCE_POLICY.maximumContextRatio) violations.push(`context_ratio_above_30_percent:${ratios.context}`);
    if (ratios.theory < BALANCE_POLICY.minimumTheoryRatio) violations.push(`theory_ratio_below_15_percent:${ratios.theory}`);
    if (ratios.theory > BALANCE_POLICY.maximumTheoryRatio) violations.push(`theory_ratio_above_25_percent:${ratios.theory}`);
  }

  return { ...group, total, counts, ratios, violations };
}

export async function auditQuizContent({ rootDir = "data/quiz" } = {}) {
  const absoluteRoot = path.resolve(rootDir);
  const files = await walkJsonFiles(absoluteRoot);
  const questions = [];
  const parseErrors = [];

  for (const file of files) {
    const relativeFile = path.relative(process.cwd(), file).split(path.sep).join("/");
    try {
      const parsed = JSON.parse(await fs.readFile(file, "utf8"));
      for (const item of collectQuestions(parsed)) {
        const classification = classifyQuestion(item);
        questions.push({
          file: relativeFile,
          target: targetKey(item, relativeFile),
          id: String(item.quiz_id || item.id || ""),
          question: String(item.question),
          opening: openingKey(item.question),
          optionLengthSignal: optionLengthSignal(item),
          ...classification
        });
      }
    } catch (error) {
      parseErrors.push({ file: relativeFile, error: String(error?.message || error) });
    }
  }

  const groupsByKey = new Map();
  for (const question of questions) {
    const key = `${question.file}::${question.target}`;
    if (!groupsByKey.has(key)) groupsByKey.set(key, { file: question.file, target: question.target, questions: [] });
    groupsByKey.get(key).questions.push(question);
  }
  const groups = [...groupsByKey.values()].map(assessGroup).sort((a, b) => b.ratios.theory - a.ratios.theory || b.total - a.total);

  const openings = new Map();
  for (const question of questions) {
    if (!question.opening) continue;
    if (!openings.has(question.opening)) openings.set(question.opening, []);
    openings.get(question.opening).push(question);
  }
  const repeatedOpenings = [...openings.entries()]
    .map(([opening, hits]) => ({ opening, count: hits.length, files: [...new Set(hits.map((hit) => hit.file))], examples: hits.slice(0, 8) }))
    .filter((entry) => entry.count >= 4 && entry.files.length >= 2)
    .sort((a, b) => b.count - a.count || b.files.length - a.files.length);

  const theoryQuestions = questions.filter((question) => question.family === "theory");
  const declaredSignals = new Set(["declared_concept_or_theory", "declared_method_or_theory_binding"]);
  const templateViolations = theoryQuestions.filter((question) => question.theorySignals.some((signal) => !declaredSignals.has(signal)));
  const optionLengthSignals = questions.filter((question) => question.optionLengthSignal);
  const balanceViolations = groups.filter((group) => group.violations.length);

  return {
    generatedAt: new Date().toISOString(),
    rootDir: path.relative(process.cwd(), absoluteRoot).split(path.sep).join("/") || ".",
    summary: {
      filesScanned: files.length,
      questionsScanned: questions.length,
      parseErrors: parseErrors.length,
      theoryQuestions: theoryQuestions.length,
      templateViolations: templateViolations.length,
      optionLengthSignals: optionLengthSignals.length,
      repeatedOpenings: repeatedOpenings.length,
      balanceViolations: balanceViolations.length
    },
    policy: BALANCE_POLICY,
    parseErrors,
    balanceViolations,
    repeatedOpenings,
    theoryQuestions,
    templateViolations,
    optionLengthSignals,
    groups
  };
}

function printHumanReport(report) {
  const { summary } = report;
  console.log("Quizinnholds-audit");
  console.log(`- filer: ${summary.filesScanned}`);
  console.log(`- spørsmål: ${summary.questionsScanned}`);
  console.log(`- balansebrudd: ${summary.balanceViolations}`);
  console.log(`- teori/begrepsspørsmål: ${summary.theoryQuestions}`);
  console.log(`- forbudte teorimaler: ${summary.templateViolations}`);
  console.log(`- gjentatte åpninger: ${summary.repeatedOpenings}`);
  console.log(`- mistenkelig svarlengde: ${summary.optionLengthSignals}`);
  console.log(`- JSON-feil: ${summary.parseErrors}`);

  if (report.balanceViolations.length) {
    console.log("\nVerste balansebrudd:");
    for (const group of report.balanceViolations.slice(0, 25)) {
      console.log(`- ${group.file} [${group.target}]: fakta ${group.ratios.fact}, sammenheng ${group.ratios.context}, teori ${group.ratios.theory}`);
    }
  }

  if (report.repeatedOpenings.length) {
    console.log("\nMest gjentatte spørsmålsåpninger:");
    for (const entry of report.repeatedOpenings.slice(0, 20)) {
      console.log(`- ${entry.count} × «${entry.opening} …» i ${entry.files.length} filer`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const valueAfter = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const rootDir = valueAfter("--root") || "data/quiz";
  const outputPath = valueAfter("--json");
  const strict = args.includes("--strict");
  const report = await auditQuizContent({ rootDir });
  printHumanReport(report);

  if (outputPath) {
    await fs.mkdir(path.dirname(path.resolve(outputPath)), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`\nSkrev ${outputPath}`);
  }

  if (strict && (report.summary.parseErrors || report.summary.balanceViolations || report.summary.templateViolations || report.summary.repeatedOpenings || report.summary.optionLengthSignals)) {
    process.exitCode = 1;
  }
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
