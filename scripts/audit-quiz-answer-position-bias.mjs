#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const root = process.cwd();

function questionOptions(question) {
  return Array.isArray(question?.options)
    ? question.options
    : (Array.isArray(question?.choices) ? question.choices : null);
}

function resolvedAnswerIndex(question, options) {
  if (Number.isInteger(question?.answerIndex)) return question.answerIndex;
  if (question?.answer !== undefined) return options.findIndex((option) => option === question.answer);
  return -1;
}

export function collectQuestions(value, out = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectQuestions(item, out);
    return out;
  }
  if (!value || typeof value !== "object") return out;
  const options = questionOptions(value);
  if (options && (Number.isInteger(value.answerIndex) || value.answer !== undefined)) {
    out.push(value);
    return out;
  }
  for (const child of Object.values(value)) collectQuestions(child, out);
  return out;
}

export function auditQuestionCollection(questions, label = "quiz") {
  const errors = [];
  const indexes = [];

  for (const [offset, question] of questions.entries()) {
    const options = questionOptions(question);
    const id = question.quiz_id || question.quizId || question.id || `#${offset + 1}`;
    if (!options || options.length < 2) {
      errors.push(`${label}: ${id} must have at least two options`);
      continue;
    }

    const idx = resolvedAnswerIndex(question, options);
    if (!Number.isInteger(idx) || idx < 0 || idx >= options.length) {
      errors.push(`${label}: ${id} has invalid or unresolved correct-answer index ${idx}`);
      continue;
    }
    if (question.answer !== undefined && options[idx] !== question.answer) {
      errors.push(`${label}: ${id} answerIndex does not point to answer`);
    }
    indexes.push(idx);
  }

  if (indexes.length >= 4 && new Set(indexes).size < 2) {
    errors.push(`${label}: all ${indexes.length} correct answers use the same stored position (${indexes[0]}); distribute correct-answer positions`);
  }
  if (indexes.length >= 8) {
    const counts = new Map();
    for (const idx of indexes) counts.set(idx, (counts.get(idx) || 0) + 1);
    const max = Math.max(...counts.values());
    if (max / indexes.length > 0.75) {
      errors.push(`${label}: ${max}/${indexes.length} correct answers use one stored position; positional bias exceeds 75%`);
    }
  }
  return errors;
}

function changedQuizFiles(base, head = "HEAD") {
  const output = execFileSync(
    "git",
    ["diff", "--diff-filter=ACMR", "--name-only", `${base}...${head}`],
    { cwd: root, encoding: "utf8" }
  );
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((file) => file.startsWith("data/quiz/") && file.endsWith(".json") && fs.existsSync(path.join(root, file)));
}

export function auditFiles(files) {
  const errors = [];
  let audited = 0;
  for (const file of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    } catch (error) {
      errors.push(`${file}: invalid JSON: ${error.message}`);
      continue;
    }
    const questions = collectQuestions(data);
    if (!questions.length) continue;
    audited += 1;
    errors.push(...auditQuestionCollection(questions, file));
  }
  return { audited, errors };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--base" || token === "--head" || token === "--file") {
      args[token.slice(2)] = argv[++i];
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file && !args.base) throw new Error("Use --base <sha> [--head <sha>] or --file <path>");
  const files = args.file ? [args.file] : changedQuizFiles(args.base, args.head || "HEAD");
  const result = auditFiles(files);
  if (result.errors.length) {
    result.errors.forEach((error) => console.error(`ERROR: ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Quiz answer-position audit PASS (${result.audited} quiz file(s) with questions).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    main();
  } catch (error) {
    console.error(`Quiz answer-position audit failed: ${error.message}`);
    process.exitCode = 1;
  }
}
