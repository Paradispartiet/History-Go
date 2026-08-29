#!/usr/bin/env bash
set -euo pipefail

mkdir -p js/quiz scripts tests

cat > js/quiz/answer-shuffle.js <<'EOF'
(function (root) {
  "use strict";

  function sourceAnswerIndex(question, options) {
    if (Number.isInteger(question?.answerIndex)) return question.answerIndex;
    return options.findIndex((option) => option === question?.answer);
  }

  function shuffleQuestion(question, rng = Math.random) {
    const sourceOptions = Array.isArray(question?.options)
      ? question.options
      : (Array.isArray(question?.choices) ? question.choices : []);
    const originalOptions = sourceOptions.slice();
    const originalAnswerIndex = sourceAnswerIndex(question, originalOptions);

    if (originalAnswerIndex < 0 || originalAnswerIndex >= originalOptions.length) {
      return { options: originalOptions, answerIndex: originalAnswerIndex };
    }

    const entries = originalOptions.map((option, originalIndex) => ({ option, originalIndex }));
    for (let i = entries.length - 1; i > 0; i -= 1) {
      const raw = Number(rng());
      const bounded = Number.isFinite(raw)
        ? Math.min(Math.max(raw, 0), 0.9999999999999999)
        : 0;
      const j = Math.floor(bounded * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    return {
      options: entries.map((entry) => entry.option),
      answerIndex: entries.findIndex((entry) => entry.originalIndex === originalAnswerIndex)
    };
  }

  root.HGQuizAnswerShuffle = Object.freeze({ shuffleQuestion });
})(typeof window !== "undefined" ? window : globalThis);
EOF

cat > scripts/audit-quiz-answer-position-bias.mjs <<'EOF'
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
EOF

cat > tests/quiz-answer-shuffle-runtime.test.mjs <<'EOF'
import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

await import("../js/quiz/answer-shuffle.js");
const { shuffleQuestion } = globalThis.HGQuizAnswerShuffle;

test("shuffle preserves the correct answer and remaps its displayed index", () => {
  const question = { options: ["Riktig", "B", "C", "D"], answer: "Riktig", answerIndex: 0 };
  const source = structuredClone(question);
  const values = [0, 0, 0];
  const shuffled = shuffleQuestion(question, () => values.shift() ?? 0);
  assert.deepEqual(question, source, "canonical question data must not be mutated");
  assert.deepEqual([...shuffled.options].sort(), [...question.options].sort());
  assert.equal(shuffled.options[shuffled.answerIndex], "Riktig");
  assert.notEqual(shuffled.answerIndex, 0, "controlled shuffle must move a first-slot answer");
});

test("shuffle resolves the correct index from answer text when needed", () => {
  const shuffled = shuffleQuestion({ options: ["A", "B", "C"], answer: "B" }, () => 0);
  assert.equal(shuffled.options[shuffled.answerIndex], "B");
});

test("quiz runtime loads the shuffler before quizzes and uses shuffled presentation", () => {
  const app = fs.readFileSync("js/app.js", "utf8");
  const runtime = fs.readFileSync("js/quizzes.js", "utf8");
  assert.ok(app.indexOf("js/quiz/answer-shuffle.js") < app.indexOf("js/quizzes.js"));
  assert.match(runtime, /HGQuizAnswerShuffle\?\.shuffleQuestion\?\.\(q\)/);
  assert.doesNotMatch(runtime, /const options = arr\(q\.options \|\| q\.choices\);\n\s*const answerIndex/);
});
EOF

cat > tests/quiz-answer-position-governance.test.mjs <<'EOF'
import assert from "node:assert/strict";
import test from "node:test";
import { auditQuestionCollection, collectQuestions } from "../scripts/audit-quiz-answer-position-bias.mjs";

const q = (idx, n = 4) => ({
  id: `q_${idx}`,
  options: Array.from({ length: n }, (_, i) => `o${i}`),
  answerIndex: idx,
  answer: `o${idx}`
});

test("recursive collector finds questions inside sets", () => {
  assert.equal(collectQuestions({ sets: [{ questions: [q(0), q(1)] }] }).length, 2);
});

test("a fixed first-slot quiz is rejected", () => {
  const errors = auditQuestionCollection(Array.from({ length: 7 }, () => q(0)), "fixture");
  assert.ok(errors.some((error) => error.includes("same stored position")));
});

test("distributed correct-answer positions pass", () => {
  const questions = Array.from({ length: 14 }, (_, i) => q(i % 4));
  assert.deepEqual(auditQuestionCollection(questions, "fixture"), []);
});

test("answerIndex integrity remains mandatory", () => {
  const broken = Array.from({ length: 4 }, (_, i) => q(i % 2));
  broken[0].answer = "not-the-indexed-answer";
  assert.ok(auditQuestionCollection(broken, "fixture").some((error) => error.includes("does not point to answer")));
});
EOF

python3 <<'PY'
from pathlib import Path

def replace_once(path, old, new, label):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one anchor, found {count}")
    p.write_text(text.replace(old, new, 1))

replace_once(
    "js/app.js",
    '    await safeRun("loadHGReads", () => loadScriptOnce("js/hgReads.js"));\n    await safeRun("loadQuizzes", () => loadScriptOnce("js/quizzes.js"));',
    '    await safeRun("loadHGReads", () => loadScriptOnce("js/hgReads.js"));\n    await safeRun("loadQuizAnswerShuffle", () => loadScriptOnce("js/quiz/answer-shuffle.js"));\n    await safeRun("loadQuizzes", () => loadScriptOnce("js/quizzes.js"));',
    "app quiz loader order",
)

replace_once(
    "js/quizzes.js",
    '    const options = arr(q.options || q.choices);\n    const answerIndex =\n      typeof q.answerIndex === "number"\n        ? q.answerIndex\n        : options.findIndex((o) => o === q.answer);',
    '    const presentation = window.HGQuizAnswerShuffle?.shuffleQuestion?.(q);\n    if (!presentation) throw new Error("HGQuizAnswerShuffle mangler");\n    const options = presentation.options;\n    const answerIndex = presentation.answerIndex;',
    "quiz runtime option rendering",
)

quiz_path = Path("data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md")
quiz_doc = quiz_path.read_text()
if "**Versjon:** 3.3" not in quiz_doc:
    raise SystemExit("canonical quiz version anchor missing")
quiz_doc = quiz_doc.replace("**Versjon:** 3.3", "**Versjon:** 3.4", 1)
anchor = "\n## 8."
pos = quiz_doc.find(anchor)
if pos < 0:
    raise SystemExit("canonical quiz section 8 anchor missing")
rule = r'''
### 7.1 Svarrekkefølge og posisjonsbias — obligatorisk shuffle

Lagret `answerIndex` dokumenterer hvilket alternativ som er korrekt i canonical data. Det er **ikke** en instruks om hvor det riktige svaret skal vises.

- Quizruntime skal lage en ny kopi av svaralternativene og shuffle dem for hvert vist spørsmål i hvert quizforsøk.
- Når alternativene shuffles, skal korrekt indeks remappes til den nye visningsrekkefølgen før brukerens valg vurderes.
- Runtime skal aldri mutere `options`, `choices`, `answer` eller `answerIndex` i canonical quizdata.
- Nye og reviderte quizfiler skal fordele lagrede korrekt-svar-posisjoner og kan ikke legge alle eller nesten alle riktige svar i samme slot. Første alternativ skal spesielt aldri brukes som systematisk fasitposisjon.
- Det er tillatt at et enkelt spørsmål tilfeldig får samme visningsposisjon som i kildefilen etter shuffle. Kravet gjelder reell randomisering, ikke at én bestemt posisjon forbys.
- Å flytte alle riktige svar til en annen fast posisjon er ikke en løsning; både produksjonsdata og runtime skal være fri for systematisk posisjonsmønster.

CI skal stoppe nye eller endrede quizfiler med fast eller ekstremt konsentrert lagret fasitposisjon, i tillegg til å kontrollere at korrekt indeks faktisk peker på `answer` når begge feltene finnes.
'''
quiz_path.write_text(quiz_doc[:pos] + "\n" + rule.strip() + "\n" + quiz_doc[pos:])

replace_once(
    "scripts/place-production-rule-preflight.mjs",
    '  "docs/PLACE_PRODUCTION_PROFILES.md",\n  "data/places/README_place_rounds.md",',
    '  "docs/PLACE_PRODUCTION_PROFILES.md",\n  "data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md",\n  "data/places/README_place_rounds.md",',
    "READ-FIRST quiz policy registration",
)

data_path = Path(".github/workflows/data-checks.yml")
data = data_path.read_text()
path_anchor = "      - 'data/quiz/**'\n"
if data.count(path_anchor) != 1:
    raise SystemExit(f"data-checks path anchor count {data.count(path_anchor)}")
data = data.replace(
    path_anchor,
    path_anchor
    + "      - 'js/quizzes.js'\n"
    + "      - 'js/quiz/answer-shuffle.js'\n"
    + "      - 'scripts/audit-quiz-answer-position-bias.mjs'\n"
    + "      - 'tests/quiz-answer-shuffle-runtime.test.mjs'\n"
    + "      - 'tests/quiz-answer-position-governance.test.mjs'\n",
    1,
)

scope_old = "              data/quiz/*|scripts/audit-quiz-*|scripts/build-quiz-production-context.mjs|scripts/quiz-production-lib.mjs|tests/quiz-*|tests/quiz-content-quality-audit.test.mjs)"
scope_new = "              data/quiz/*|js/quizzes.js|js/quiz/*|scripts/audit-quiz-*|scripts/build-quiz-production-context.mjs|scripts/quiz-production-lib.mjs|tests/quiz-*|tests/quiz-content-quality-audit.test.mjs)"
if data.count(scope_old) != 1:
    raise SystemExit(f"data-checks quiz scope anchor count {data.count(scope_old)}")
data = data.replace(scope_old, scope_new, 1)

job_old = '''  quiz-governance:
    name: Quiz schema + content integrity
    needs: scope
    if: needs.scope.outputs.quiz == 'true'
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
'''
job_new = '''  quiz-governance:
    name: Quiz schema + content integrity
    needs: scope
    if: needs.scope.outputs.quiz == 'true'
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
'''
if data.count(job_old) != 1:
    raise SystemExit(f"data-checks quiz checkout anchor count {data.count(job_old)}")
data = data.replace(job_old, job_new, 1)

test_old = "          npm run test:quiz-content-audit\n          npm run test:quiz-production\n"
test_new = test_old + '''          node --test tests/quiz-answer-shuffle-runtime.test.mjs tests/quiz-answer-position-governance.test.mjs
          if [ "$GITHUB_EVENT_NAME" = "pull_request" ]; then
            BASE_SHA="$(git merge-base "origin/$GITHUB_BASE_REF" HEAD)"
            node scripts/audit-quiz-answer-position-bias.mjs --base "$BASE_SHA" --head HEAD
          fi
'''
if data.count(test_old) != 1:
    raise SystemExit(f"data-checks quiz test anchor count {data.count(test_old)}")
data = data.replace(test_old, test_new, 1)
data_path.write_text(data)
PY

node --check js/quizzes.js
node --check js/quiz/answer-shuffle.js
node --check scripts/audit-quiz-answer-position-bias.mjs
node --check scripts/place-production-rule-preflight.mjs
node --test tests/quiz-answer-shuffle-runtime.test.mjs tests/quiz-answer-position-governance.test.mjs tests/place-production-rule-preflight.test.mjs

# This legacy fixture is expected to fail the new raw-data bias audit; runtime shuffle fixes its presentation immediately.
if node scripts/audit-quiz-answer-position-bias.mjs --file data/quiz/historie/gamle_radhus_sets.json; then
  echo "Expected legacy fixed-position fixture to fail the bias audit" >&2
  exit 1
fi

git diff --check

rm .github/workflows/temp-materialize-quiz-answer-shuffle.yml tools/temp-materialize-quiz-answer-shuffle.sh

git config user.name "History Go automation"
git config user.email "paradispartiet@gmail.com"
git add js/app.js js/quizzes.js js/quiz/answer-shuffle.js \
  data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md \
  scripts/audit-quiz-answer-position-bias.mjs \
  scripts/place-production-rule-preflight.mjs \
  tests/quiz-answer-shuffle-runtime.test.mjs \
  tests/quiz-answer-position-governance.test.mjs \
  .github/workflows/data-checks.yml \
  .github/workflows/temp-materialize-quiz-answer-shuffle.yml \
  tools/temp-materialize-quiz-answer-shuffle.sh

git commit -m "Shuffle quiz answers and block positional bias"
git push origin HEAD:governance/quiz-answer-shuffle-20260829
