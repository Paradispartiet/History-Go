#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data/quiz/manifest.json");
const REPORT_PATH = path.join(ROOT, "reports/knowledge-contract-audit.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function clean(value) {
  return String(value == null ? "" : value).trim();
}

function list(value) {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
}

function emneIds(question) {
  return Array.from(new Set([
    clean(question?.emne_id),
    ...list(question?.emne_ids),
    ...list(question?.related_emner),
    ...list(question?.related_emners),
    ...list(question?.relatedEmner)
  ].filter(Boolean)));
}

function concepts(question) {
  return Array.from(new Set([
    ...list(question?.concepts),
    ...list(question?.core_concepts),
    ...list(question?.conceptIds),
    ...list(question?.begreper)
  ]));
}

function subjectId(question) {
  return clean(
    question?.fagkart_category_id ||
    question?.subject_id ||
    question?.categoryId ||
    question?.category
  );
}

function targetId(question) {
  return clean(question?.targetId || question?.placeId || question?.personId);
}

function collectQuestions(data, file) {
  const out = [];
  if (Array.isArray(data)) {
    data.forEach((question, index) => out.push({ question, file, location: `array[${index}]` }));
    return out;
  }

  if (Array.isArray(data?.questions)) {
    data.questions.forEach((question, index) => out.push({ question, file, location: `questions[${index}]` }));
  }

  if (Array.isArray(data?.sets)) {
    data.sets.forEach((set, setIndex) => {
      (Array.isArray(set?.questions) ? set.questions : []).forEach((question, questionIndex) => {
        out.push({
          question,
          file,
          location: `sets[${setIndex}](${clean(set?.set_id) || "uten_id"}).questions[${questionIndex}]`
        });
      });
    });
  }

  return out;
}

function normalizeManifestFiles(manifest) {
  const files = new Set();
  (Array.isArray(manifest?.files) ? manifest.files : []).forEach((file) => files.add(clean(file)));
  (Array.isArray(manifest?.sets) ? manifest.sets : []).forEach((entry) => {
    const file = clean(entry?.file);
    if (file) files.add(file);
  });
  return Array.from(files).filter(Boolean);
}

function auditQuestion(row) {
  const q = row.question || {};
  const knowledge = clean(q.knowledge || q.explanation);
  if (!knowledge) return null;

  const errors = [];
  const warnings = [];
  const sid = subjectId(q);
  const eids = emneIds(q);
  const cs = concepts(q);
  const target = targetId(q);

  if (!sid) errors.push("missing_subject");
  if (!knowledge) errors.push("missing_knowledge_text");
  if (!eids.length) errors.push("missing_emne_link");
  if (!cs.length) warnings.push("missing_concepts");
  if (!target) warnings.push("missing_target");
  if (!clean(q.id || q.question_id)) warnings.push("missing_question_id");

  return {
    file: row.file,
    location: row.location,
    question_id: clean(q.id || q.question_id) || null,
    subject_id: sid || null,
    target_id: target || null,
    emne_ids: eids,
    concepts: cs,
    errors,
    warnings
  };
}

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`Knowledge audit: manifest mangler: ${MANIFEST_PATH}`);
  process.exit(2);
}

const manifest = readJson(MANIFEST_PATH);
const manifestFiles = normalizeManifestFiles(manifest);
const rows = [];
const fileErrors = [];

for (const relative of manifestFiles) {
  const file = path.resolve(ROOT, relative);
  if (!fs.existsSync(file)) {
    fileErrors.push({ file: relative, error: "manifest_file_missing" });
    continue;
  }

  try {
    rows.push(...collectQuestions(readJson(file), relative));
  } catch (error) {
    fileErrors.push({ file: relative, error: `invalid_json: ${error.message}` });
  }
}

const audited = rows.map(auditQuestion).filter(Boolean);
const failures = audited.filter((row) => row.errors.length);
const warnings = audited.filter((row) => row.warnings.length);
const report = {
  schema: "history_go_knowledge_contract_audit_v1",
  generated_at: new Date().toISOString(),
  manifest: "data/quiz/manifest.json",
  files_scanned: manifestFiles.length,
  knowledge_questions: audited.length,
  questions_with_errors: failures.length,
  questions_with_warnings: warnings.length,
  file_errors: fileErrors,
  summary: {
    missing_subject: audited.filter((row) => row.errors.includes("missing_subject")).length,
    missing_emne_link: audited.filter((row) => row.errors.includes("missing_emne_link")).length,
    missing_concepts: audited.filter((row) => row.warnings.includes("missing_concepts")).length,
    missing_target: audited.filter((row) => row.warnings.includes("missing_target")).length
  },
  failures,
  warnings
};

fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log(`Knowledge audit: ${audited.length} knowledge-spørsmål, ${failures.length} med feil, ${warnings.length} med varsler.`);
console.log(`Rapport: ${path.relative(ROOT, REPORT_PATH)}`);

if (fileErrors.length || failures.length) process.exitCode = 1;
