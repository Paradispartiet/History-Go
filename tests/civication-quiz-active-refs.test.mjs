// Validate Civication -> History Go quiz provenance against ACTIVE quiz content.
// IDs in production_context/existing_quiz_audit are historical, not runtime quiz IDs.
// Runs with Node only; intentionally independent of the 698-file Civication suite.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = [
  "data/Civication/roleWorlds",
  "data/Civication/mailFamilies",
  "data/Civication/roleModels"
];
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const manifest = new Set(read("data/quiz/manifest.json").files);
const errors = [];
let files = 0;
const refs = [];
const fail = (message) => errors.push(message);

function scan(dir) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return fail("missing Civication source directory: " + dir);
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const sub = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(sub);
    else if (entry.isFile() && entry.name.endsWith(".json")) {
      files++;
      visit(read(sub), sub, "$");
    }
  }
}

function visit(value, file, pointer) {
  if (typeof value === "string") {
    if (value.startsWith("data/quiz/") && value.includes(".json")) {
      const match = /^(data\/quiz\/[^#?\s]+\.json)(?:#([^\s#]+))?$/.exec(value);
      if (!match) fail(file + " " + pointer + " malformed quiz ref: " + value);
      else refs.push({ from: file, pointer, target: match[1], id: match[2] || null });
    }
    return;
  }
  if (Array.isArray(value)) return value.forEach((v, i) => visit(v, file, pointer + "[" + i + "]"));
  if (value && typeof value === "object") {
    for (const [key, v] of Object.entries(value)) visit(v, file, pointer + "." + key);
  }
}

function activeIds(quiz) {
  const ids = new Set();
  // Restrict the search to live quiz material. Production review metadata,
  // "old_knowledge_ids" and retired/rewritten question IDs never count.
  function collectQuestion(question) {
    if (!question || typeof question !== "object") return;
    for (const key of ["id", "question_id", "quiz_id"]) {
      if (typeof question[key] === "string") ids.add(question[key]);
    }
  }
  const sets = quiz.sets || quiz.quizSets || quiz.quiz_sets || [];
  if (Array.isArray(sets)) for (const set of sets) {
    if (!set || typeof set !== "object") continue;
    for (const key of ["set_id", "id"]) if (typeof set[key] === "string") ids.add(set[key]);
    for (const q of set.questions || []) collectQuestion(q);
  }
  for (const q of quiz.questions || []) collectQuestion(q);
  for (const q of quiz.quizzes || []) collectQuestion(q);
  return ids;
}

dirs.forEach(scan);
const checked = new Map();
for (const ref of refs) {
  const where = ref.from + " " + ref.pointer;
  if (!fs.existsSync(path.join(ROOT, ref.target))) {
    fail(where + " missing quiz file: " + ref.target);
    continue;
  }
  if (!manifest.has(ref.target)) fail(where + " quiz file not in manifest: " + ref.target);
  if (!ref.id) continue; // File-level evidence references do not claim a specific quiz ID.
  if (!checked.has(ref.target)) checked.set(ref.target, activeIds(read(ref.target)));
  if (!checked.get(ref.target).has(ref.id)) {
    fail(where + " retired/unknown active quiz ID " + ref.id + " in " + ref.target);
  }
}

if (errors.length) {
  for (const error of errors) console.error("ERROR:", error);
  console.error("Civication quiz provenance FAILED: " + errors.length + " invalid references");
  process.exitCode = 1;
} else {
  console.log("Civication active quiz references PASS: " + refs.length + " links across "
    + files + " Civication JSON files; " + checked.size + " quiz files with explicit IDs.");
}
