#!/usr/bin/env node
// Read-only inventory of quiz delivery, not a substitute for editorial review.
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const QUIZ_ROOT = "data/quiz";
const AUXILIARY_DIRS = new Set(["regler", "production_briefs", "production_context"]);
const asArray = (value) => Array.isArray(value) ? value : [];
const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const slash = (value) => value.split(path.sep).join("/");
const underQuiz = (value) => value.startsWith("data/quiz/") ? value : `data/quiz/${value}`;

async function jsonAt(root, file) {
  return JSON.parse(await readFile(path.join(root, file), "utf8"));
}

async function walk(root, dir, found = []) {
  for (const item of await readdir(path.join(root, dir), { withFileTypes: true })) {
    if (item.name.startsWith(".")) continue;
    const file = slash(path.posix.join(dir, item.name));
    if (item.isDirectory()) {
      if (!AUXILIARY_DIRS.has(item.name)) await walk(root, file, found);
    } else if (item.isFile() && file.endsWith(".json")) {
      found.push(file);
    }
  }
  return found;
}

function questionTargets(q) {
  return [q?.targetId, q?.placeId, q?.personId].filter(hasText);
}

export function inspectQuizPackage(file, data) {
  const blocks = asArray(data?.sets);
  const questions = blocks.flatMap((block) => asArray(block?.questions));
  const legacy = Array.isArray(data) && data.some((item) => hasText(item?.question) && Array.isArray(item?.options));
  const setPackage = blocks.length > 0;
  const trainingPackage = asArray(data?.question_sets).length > 0;
  const issues = [];
  const seen = new Set();
  if (setPackage) {
    if (!hasText(data?.targetId)) issues.push("missing_package_targetId");
    for (const block of blocks) {
      if (!hasText(block?.set_id) || seen.has(block.set_id)) issues.push("missing_or_duplicate_set_id");
      else seen.add(block.set_id);
      if (!asArray(block?.questions).length) issues.push("empty_set");
    }
    for (const q of questions) {
      if (!hasText(q?.id)) issues.push("missing_question_id");
      if (!hasText(q?.categoryId)) issues.push("missing_category");
      if (hasText(data.targetId) && !questionTargets(q).includes(data.targetId)) issues.push("target_mismatch");
      if (hasText(data.categoryId) && q.categoryId !== data.categoryId) issues.push("category_mismatch");
      if (!hasText(q?.question) || asArray(q?.options).length < 2) issues.push("invalid_question");
      const index = Number.isInteger(q?.answerIndex)
        ? q.answerIndex : asArray(q?.options).indexOf(q?.answer);
      if (index < 0 || index >= asArray(q?.options).length ||
        (hasText(q?.answer) && q.answer !== q.options[index])) issues.push("invalid_answer");
    }
  }
  const answerIndices = questions.map((q) => Number.isInteger(q?.answerIndex)
    ? q.answerIndex : asArray(q?.options).indexOf(q?.answer));
  return {
    file,
    targetId: hasText(data?.targetId) ? data.targetId : null,
    categoryId: hasText(data?.categoryId) ? data.categoryId : null,
    kind: setPackage ? "set_package" : legacy ? "legacy_bank" : trainingPackage ? "training_package" : "auxiliary",
    sets: blocks.length,
    questions: setPackage ? questions.length : legacy ? data.length : 0,
    firstTwoSetSizes: blocks.slice(0, 2).map((block) => asArray(block.questions).length),
    allAnswersFirstInSource: answerIndices.length > 0 && answerIndices.every((n) => n === 0),
    missingKnowledge: questions.filter((q) => !hasText(q?.knowledge) &&
      !hasText(q?.explanation) && !hasText(q?.feedback)).length,
    structuralIssues: [...new Set(issues)]
  };
}

export async function auditQuizWiring({ root = process.cwd() } = {}) {
  const manifest = await jsonAt(root, "data/quiz/manifest.json");
  const legacyPaths = new Set(asArray(manifest.files));
  const setPaths = new Set(asArray(manifest.sets).map((entry) => entry.file).filter(hasText));
  const subjectPaths = new Set(asArray(manifest.subjectPackages).map((entry) => entry.file).filter(hasText));
  const metadataPaths = new Set(asArray(manifest.targets).map((entry) => entry.file).filter(hasText));
  for (const section of ["historie", "politikk", "religion"]) {
    for (const file of Object.values(manifest[section] || {})) {
      if (hasText(file)) metadataPaths.add(underQuiz(file));
    }
  }
  const activeSetTargets = new Set(asArray(manifest.sets).map((entry) => entry.targetId).filter(hasText));
  const activeLegacyTargets = new Set();
  const brokenReferences = [];
  for (const file of new Set([...legacyPaths, ...setPaths, ...subjectPaths])) {
    try {
      const data = await jsonAt(root, file);
      if (legacyPaths.has(file)) {
        for (const q of asArray(data)) for (const target of questionTargets(q)) activeLegacyTargets.add(target);
      }
    } catch (error) {
      brokenReferences.push({ file, error: String(error?.message || error) });
    }
  }
  const files = [];
  for (const file of (await walk(root, QUIZ_ROOT)).sort()) {
    let data;
    try {
      data = await jsonAt(root, file);
    } catch (error) {
      files.push({ file, status: "invalid_json", error: String(error?.message || error) });
      continue;
    }
    const item = inspectQuizPackage(file, data);
    const isArchived = file.split("/").includes("arkiv");
    let status = "auxiliary";
    if (legacyPaths.has(file)) status = "active_legacy";
    else if (setPaths.has(file)) status = "active_set";
    else if (subjectPaths.has(file)) status = "subject_package";
    else if (isArchived) status = "archived";
    else if (item.kind === "set_package") {
      if (activeSetTargets.has(item.targetId)) status = "unregistered_set_with_active_sets";
      else if (activeLegacyTargets.has(item.targetId)) status = "unregistered_set_with_legacy";
      else status = "unregistered_set";
    } else if (item.kind === "legacy_bank") status = "unregistered_legacy";
    else if (item.kind === "training_package") status = "training_package";
    else if (metadataPaths.has(file)) status = "metadata_only_not_loaded";
    files.push({ ...item, status, mentionedInNonRuntimeManifestSection: metadataPaths.has(file) });
  }
  const byStatus = {};
  const byCategory = {};
  for (const file of files) {
    byStatus[file.status] = (byStatus[file.status] || 0) + 1;
    const category = file.file.split("/")[2] || "root";
    byCategory[category] ||= {};
    byCategory[category][file.status] = (byCategory[category][file.status] || 0) + 1;
  }
  const unreachableStatuses = new Set([
    "unregistered_set", "unregistered_set_with_active_sets",
    "unregistered_set_with_legacy", "unregistered_legacy"
  ]);
  const candidates = files.filter((item) => unreachableStatuses.has(item.status));
  return {
    schema: "history_go_quiz_wiring_audit_v1",
    scope: "Main QuizEngine reads only manifest.files and manifest.sets; other surfaces are separate.",
    summary: {
      filesScanned: files.length,
      manifestLegacyFiles: legacyPaths.size,
      manifestSetEntries: asArray(manifest.sets).length,
      activeSetTargets: activeSetTargets.size,
      unregisteredPlayableFiles: candidates.length,
      structurallyValidUnregisteredSetFiles: candidates.filter((f) =>
        f.kind === "set_package" && !f.structuralIssues.length).length,
      brokenReferences: brokenReferences.length,
      byStatus,
      byCategory
    },
    brokenReferences,
    candidates,
    files
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const report = await auditQuizWiring();
  if (process.argv.includes("--report")) {
    const output = "reports/quiz-wiring-audit.json";
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(report, null, 2) + "\n");
    console.log("Skrev " + output);
  }
  console.log(JSON.stringify(report.summary, null, 2));
  if (report.brokenReferences.length || (process.argv.includes("--strict") && report.candidates.length)) {
    process.exitCode = 1;
  }
}
