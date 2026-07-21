import fs from "node:fs";

function read(path: string): string { return fs.readFileSync(path, "utf8"); }
function write(path: string, content: string): void { fs.mkdirSync(path.split("/").slice(0, -1).join("/"), { recursive: true }); fs.writeFileSync(path, content); }
function replaceExact(source: string, before: string, after: string, label: string): string {
  if (!source.includes(before)) throw new Error(`Missing ${label}`);
  return source.replace(before, after);
}

let knowledge = read("js/knowledgeV2.ts");
knowledge = replaceExact(knowledge,
  'import claimCore from "./knowledgeClaimCore";',
  'import claimCore from "./knowledgeClaimCore";\nimport { createQuizKnowledgeMemory } from "./knowledgeQuizMemory";',
  "knowledge quiz memory import"
);
knowledge = replaceExact(knowledge,
`function mergeEntry(previous: KnowledgeEntry, incoming: KnowledgeEntry, now: string): KnowledgeEntry {
  return {
    ...previous,
    ...incoming,
    learned_at: previous.learned_at || incoming.learned_at || now,
    last_seen_at: now,
    times_seen: Number(previous.times_seen || 1) + 1,
    emne_ids: unique([...(previous.emne_ids || []), ...(incoming.emne_ids || [])]),
    concepts: unique([...(previous.concepts || []), ...(incoming.concepts || [])]),
    terms: unique([...(previous.terms || []), ...(incoming.terms || [])]),
    tags: unique([...(previous.tags || []), ...(incoming.tags || [])])
  };
}

function upsertEntry(entry: KnowledgeEntry): KnowledgeEntry | null {
  if (!entry?.id || !entry?.text) return null;
  const rows = getEntries();
  const index = rows.findIndex((row) => s(row?.id) === s(entry.id));
  const now = new Date().toISOString();

  if (index >= 0) {
    rows[index] = mergeEntry(rows[index], entry, now);
    saveEntries(rows);
    return rows[index];
  }

  const next: KnowledgeEntry = {
    schema: SCHEMA,
    version: VERSION,
    learned_at: now,
    last_seen_at: now,
    times_seen: 1,
    ...entry
  };
  rows.push(next);
  saveEntries(rows);
  return next;
}`,
`function mergeEntry(previous: KnowledgeEntry, incoming: KnowledgeEntry, now: string, incrementSeen = true): KnowledgeEntry {
  return {
    ...previous,
    ...incoming,
    learned_at: previous.learned_at || incoming.learned_at || now,
    last_seen_at: incrementSeen ? now : (incoming.last_seen_at || previous.last_seen_at || now),
    times_seen: incrementSeen
      ? Number(previous.times_seen || 1) + 1
      : Math.max(Number(previous.times_seen || 1), Number(incoming.times_seen || 1)),
    emne_ids: unique([...(previous.emne_ids || []), ...(incoming.emne_ids || [])]),
    concepts: unique([...(previous.concepts || []), ...(incoming.concepts || [])]),
    terms: unique([...(previous.terms || []), ...(incoming.terms || [])]),
    tags: unique([...(previous.tags || []), ...(incoming.tags || [])]),
    memory_evidence: { ...(previous.memory_evidence || {}), ...(incoming.memory_evidence || {}) }
  };
}

function upsertEntry(entry: KnowledgeEntry, options: { incrementSeen?: boolean } = {}): KnowledgeEntry | null {
  if (!entry?.id || !entry?.text) return null;
  const rows = getEntries();
  const identity = entryIdentity(entry);
  const index = rows.findIndex((row) => s(row?.id) === s(entry.id) || (!!identity && entryIdentity(row) === identity));
  const now = new Date().toISOString();
  const incrementSeen = options.incrementSeen !== false;

  if (index >= 0) {
    rows[index] = mergeEntry(rows[index], entry, now, incrementSeen);
    saveEntries(rows);
    return rows[index];
  }

  const next: KnowledgeEntry = {
    schema: SCHEMA,
    version: VERSION,
    learned_at: entry.learned_at || now,
    last_seen_at: entry.last_seen_at || now,
    times_seen: Number(entry.times_seen || 1),
    ...entry
  };
  rows.push(next);
  saveEntries(rows);
  return next;
}`,
  "identity-aware upsert"
);
knowledge = replaceExact(knowledge,
`function installCaptureBridge(): boolean {
  if (root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__) return false;
  root.saveKnowledgeFromQuiz = (quizItem: unknown, context: unknown) => captureQuizKnowledge(quizItem, context || {});
  root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__ = true;
  return true;
}

async function loadEmner`,
`function installCaptureBridge(): boolean {
  if (root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__) return false;
  root.saveKnowledgeFromQuiz = (quizItem: unknown, context: unknown) => captureQuizKnowledge(quizItem, context || {});
  root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__ = true;
  return true;
}

const quizMemory = createQuizKnowledgeMemory({ root, upsertEntry, normalizeSubjectId });

async function loadEmner`,
  "quiz memory instance"
);
knowledge = replaceExact(knowledge,
`async function buildProfile(options: JsonObject = {}): Promise<JsonObject> {
  sanitizeStoredEntries();
  migrateLegacyKnowledge();
  reconcileEntriesFromLearningLog();

  const entries = getEntries();`,
`async function buildProfile(options: JsonObject = {}): Promise<JsonObject> {
  sanitizeStoredEntries();
  migrateLegacyKnowledge();
  reconcileEntriesFromLearningLog();
  quizMemory.syncMemoryEntries();

  const entries = getEntries();`,
  "profile memory sync"
);
knowledge = replaceExact(knowledge,
`  return {
    schema: "history_go_knowledge_profile_v2",
    version: VERSION,
    generated_at: new Date().toISOString(),
    summary: {
      knowledge_count: visibleSubjects.reduce((sum, subject) => sum + subject.knowledge_count, 0),
      linked_count: visibleSubjects.reduce((sum, subject) => sum + subject.linked_count, 0),
      unresolved_count: visibleSubjects.reduce((sum, subject) => sum + subject.unresolved_count, 0),
      subject_count: visibleSubjects.filter((subject) => subject.knowledge_count > 0).length,
      concept_count: allConcepts.size
    },
    concepts: Array.from(allConcepts.values()).sort((a, b) => b.count - a.count),
    subjects
  };`,
`  const profile = {
    schema: "history_go_knowledge_profile_v2",
    version: VERSION,
    generated_at: new Date().toISOString(),
    summary: {
      knowledge_count: visibleSubjects.reduce((sum, subject) => sum + subject.knowledge_count, 0),
      linked_count: visibleSubjects.reduce((sum, subject) => sum + subject.linked_count, 0),
      unresolved_count: visibleSubjects.reduce((sum, subject) => sum + subject.unresolved_count, 0),
      subject_count: visibleSubjects.filter((subject) => subject.knowledge_count > 0).length,
      concept_count: allConcepts.size
    },
    concepts: Array.from(allConcepts.values()).sort((a, b) => b.count - a.count),
    subjects
  };
  return quizMemory.attachMemoryToProfile(profile);`,
  "profile memory attachment"
);
knowledge = replaceExact(knowledge,
`function boot(): void {
  sanitizeStoredEntries();
  migrateLegacyKnowledge();
  installCaptureBridge();
  reconcileEntriesFromLearningLog();
}`,
`function boot(): void {
  sanitizeStoredEntries();
  migrateLegacyKnowledge();
  installCaptureBridge();
  reconcileEntriesFromLearningLog();
  quizMemory.syncMemoryEntries();
  quizMemory.initBrowserIntegration();
}`,
  "unified boot"
);
knowledge = replaceExact(knowledge,
`  KEYS: { ENTRIES: ENTRY_KEY, LEGACY: LEGACY_KEY, LEARNING_LOG: LEARNING_LOG_KEY },`,
`  KEYS: { ENTRIES: ENTRY_KEY, LEGACY: LEGACY_KEY, LEARNING_LOG: LEARNING_LOG_KEY, MEMORY: quizMemory.STORAGE_KEY },`,
  "memory storage key"
);
knowledge = replaceExact(knowledge,
`  getEntries,
  buildProfile,
  getContractHealth
};

root.HGKnowledgeV2 = api;`,
`  getEntries,
  buildProfile,
  getContractHealth,
  quizMemory,
  renderQuizMemoryOverview: quizMemory.renderOverview
};

root.HGKnowledgeV2 = api;
root.HGQuizKnowledgeMemory = quizMemory;
root.buildQuizKnowledgeBundle = quizMemory.buildQuizKnowledgeBundle;`,
  "unified runtime exports"
);
write("js/knowledgeV2.ts", knowledge);

let page = read("js/knowledgePage.js");
page = replaceExact(page,
`      renderCurrentView();
      bindSearch();
      if (loading) loading.hidden = true;`,
`      renderCurrentView();
      bindSearch();
      window.HGKnowledgeV2.renderQuizMemoryOverview?.(activeProfile);
      if (loading) loading.hidden = true;`,
  "Knowledge page memory overview"
);
write("js/knowledgePage.js", page);

let knowledgeHtml = read("knowledge.html");
knowledgeHtml = knowledgeHtml
  .replace('  <script src="js/quizKnowledgeMemory.js"></script>\n', "")
  .replace('  <script src="js/knowledgeMemoryPageBridge.js"></script>\n', "");
write("knowledge.html", knowledgeHtml);

let psychology = read("js/ui/psychology-room-entry.js");
psychology = psychology.replace(/\n  function loadQuizKnowledgeMemoryLayer\(\) \{[\s\S]*?\n  \}\n\n  function ensureCss/, "\n  function ensureCss");
psychology = psychology.replace("    loadQuizKnowledgeMemoryLayer();\n\n", "");
write("js/ui/psychology-room-entry.js", psychology);

const manifest = JSON.parse(read("data/knowledge/knowledge_manifest.json"));
manifest.runtime.canonicalQuizMemorySource = "../../js/knowledgeQuizMemory.ts";
manifest.runtime.quizMemoryProducer = "../../dist/web/knowledgeV2.js";
delete manifest.runtime.quizMemoryPageBridge;
manifest.runtime.migrationStatus = "v6_single_typescript_knowledge_runtime_active";
manifest.runtime.currentBehavior = "Quizminne, capture, evidenssynkronisering og profilbygging eies av én TypeScript-runtime. hg_knowledge_memory_v1 er evidenslager, hg_knowledge_entries_v2 er den kanoniske lesemodellen, og buildProfile synkroniserer dem idempotent før den bygger fag og emner. Ingen JavaScript-bro monkey-patcher profilen.";
manifest.runtime.nextRuntimeRequirements = [
  "Expand stable canonical knowledge_unit_id, concept_id, term_id and story_id coverage in quiz source data.",
  "Add targeted repetition navigation from needs_review evidence.",
  "Gradually retire knowledge_universe after migration telemetry confirms no active readers remain."
];
write("data/knowledge/knowledge_manifest.json", JSON.stringify(manifest, null, 2) + "\n");

const quizTest = read("tests/quiz-knowledge-memory.test.js")
  .replace('const fs = require("node:fs");\nconst path = require("node:path");\n', "")
  .replace(/\n  const memoryPath = require\.resolve\("\.\.\/js\/quizKnowledgeMemory\.js"\);[\s\S]*?return require\(memoryPath\);/, '\n  return global.HGKnowledgeV2.quizMemory;')
  .replace(/\ntest\("popupen er en oversikt, ikke en manuell lagringsport"[\s\S]*?\n\}\);\n?$/, "\n");
write("tests/quiz-knowledge-memory.test.js", quizTest);

fs.rmSync("tests/knowledge-memory-page-bridge.test.js");
write("tests/knowledge-profile-memory-integration.test.js", `const test = require("node:test");
const assert = require("node:assert/strict");

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return { getItem: (key) => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}

function loadRuntime(seed = {}) {
  global.localStorage = storage(seed);
  global.addEventListener = () => {};
  global.dispatchEvent = () => true;
  global.PLACES = [{ id: "sted" }];
  global.PEOPLE = [];
  global.DataHub = {
    loadEmner: async () => [{ emne_id: "em_by_test", title: "Testemne", core_concepts: ["byrom"] }],
    loadFagManifest: async () => ({ by: {} })
  };
  global.DomainRegistry = { toRuntimeCategoryId: (value) => value };
  delete global.HGKnowledgeV2;
  delete global.HGQuizKnowledgeMemory;
  delete global.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__;
  delete global.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__;
  const runtimePath = require.resolve("../dist/web/knowledgeV2.js");
  delete require.cache[runtimePath];
  require(runtimePath);
  return global.HGKnowledgeV2;
}

test("buildProfile synkroniserer quizminne direkte til den kanoniske emner-kontrakten", async () => {
  const memory = {
    schema: "hg_knowledge_memory_v1",
    bundles: {
      "sted::set_1": {
        bundle_id: "sted::set_1",
        target_id: "sted",
        subject_id: "by",
        set_id: "set_1",
        collected_at: "2026-07-21T00:00:00.000Z",
        updated_at: "2026-07-21T00:00:00.000Z",
        reading: { state: "collected" },
        result: { correct: 1, total: 2 },
        knowledge_units: [
          { unit_id: "u1", text: "Første presise påstand.", topic: "Fakta", emne_ids: ["em_by_test"], concepts: ["byrom"], terms: [], tags: [], assessment: { state: "mastered", correct: true }, reading: { state: "collected" }, quality: { version: 3 } },
          { unit_id: "u2", text: "Andre presise påstand.", topic: "Fakta", emne_ids: ["em_by_test"], concepts: ["byrom"], terms: [], tags: [], assessment: { state: "needs_review", correct: false }, reading: { state: "collected" }, quality: { version: 3 } }
        ],
        fun_facts: [], stories: [], building_stories: [], conflicts: []
      }
    }
  };
  const api = loadRuntime({ hg_knowledge_memory_v1: JSON.stringify(memory) });
  const profile = await api.buildProfile({ subjectId: "by" });
  const subject = profile.subjects.by;
  assert.equal(subject.emners, undefined);
  assert.equal(subject.emner[0].knowledge_count, 2);
  assert.equal(subject.entries.length, 2);
  assert.equal(subject.entries.filter((entry) => entry.memory_evidence.assessment_state === "needs_review").length, 1);
  assert.equal(profile.quiz_memory.summary.bundle_count, 1);
});

test("gjentatt profilbygging er idempotent og øker ikke times_seen", async () => {
  const api = loadRuntime();
  const bundle = api.quizMemory.buildQuizKnowledgeBundle({ targetId: "sted", categoryId: "by", setId: "set_1", questions: [{ id: "q1", knowledge: "En stabil påstand.", emne_id: "em_by_test", categoryId: "by", targetId: "sted" }], result: { correct: 0, total: 1 } });
  api.quizMemory.saveBundle(bundle);
  await api.buildProfile({ subjectId: "by" });
  const first = api.getEntries()[0].times_seen;
  await api.buildProfile({ subjectId: "by" });
  assert.equal(api.getEntries()[0].times_seen, first);
});
`);

write("tests/fixtures/knowledge-e2e.html", `<!doctype html>
<html lang="nb"><head><meta charset="utf-8"><title>Knowledge E2E</title></head><body>
<button id="startQuiz" type="button">Start quiz</button>
<section id="knowledgeSummary"></section><input id="knowledgeSearch"><nav id="knowledgeSubjectNav"></nav><p id="knowledgeLoading"></p><p id="knowledgeError" hidden></p><main id="knowledgeContent"></main>
<script>
window.DEBUG = true;
window.PLACES = [{ id: "e2e_place", name: "E2E-sted" }]; window.PEOPLE = [];
window.DomainRegistry = { toRuntimeCategoryId: (value) => value };
window.DataHub = { loadEmner: async () => [{ emne_id: "em_by_e2e", title: "E2E-emne", core_concepts: ["byrom", "arkitektur"] }], loadFagManifest: async () => ({ by: {} }) };
window.HGCourses = { compute: async () => null };
window.HGLearningLog = { getQuizHistory: () => [] };
</script>
<script src="/dist/web/knowledgeV2.js"></script><script src="/js/quizzes.js"></script><script src="/js/knowledgePage.js"></script>
<script>
window.QuizEngine.init({ getPlaceById: (id) => window.PLACES.find((place) => place.id === id), getPersonById: () => null, getVisited: () => ({}), isTestMode: () => true, showToast: (message) => { window.__lastToast = message; }, dispatchProfileUpdate: () => {}, quizFeedbackMs: 0 });
document.getElementById("startQuiz").addEventListener("click", () => window.QuizEngine.start("e2e_place"));
</script></body></html>
`);

write("tests/knowledge-browser-e2e.test.mjs", `import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const mime = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const file = path.resolve(root, "." + pathname);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { response.writeHead(404); response.end("not found"); return; }
  response.setHeader("content-type", mime[path.extname(file)] || "application/octet-stream"); response.end(fs.readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const base = `http://127.0.0.1:${port}`;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const setData = { targetId: "e2e_place", categoryId: "by", sets: [{ set_id: "set_1", title: "E2E-sett", questions: [
  { quiz_id: "q1", targetId: "e2e_place", categoryId: "by", question: "Når åpnet E2E-stedet?", options: ["2020", "2010"], answer: "2020", knowledge: "E2E-stedet åpnet i 2020.", emne_id: "em_by_e2e", core_concepts: ["byrom"], term_ids: ["åpningsår"] },
  { quiz_id: "q2", targetId: "e2e_place", categoryId: "by", question: "Hvem tegnet E2E-stedet?", options: ["Arkitekt A", "Arkitekt B"], answer: "Arkitekt A", knowledge: "Arkitekt A tegnet E2E-stedet.", emne_id: "em_by_e2e", core_concepts: ["arkitektur"] }
] }] };
await page.route("**/data/quiz/manifest.json", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ files: [], sets: [{ targetId: "e2e_place", file: "tests/fixtures/e2e-set.json", set_id: "set_1", order: 1 }] }) }));
await page.route("**/tests/fixtures/e2e-set.json", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(setData) }));
await page.goto(`${base}/tests/fixtures/knowledge-e2e.html`);
await page.click("#startQuiz");
await page.click('#quizChoices button[data-idx="0"]');
await page.waitForFunction(() => document.querySelector("#quizQuestion")?.textContent?.includes("Hvem tegnet"));
await page.click('#quizChoices button[data-idx="1"]');
await page.waitForSelector("#quizSummaryKnowledge");
const stored = await page.evaluate(() => ({ memory: JSON.parse(localStorage.getItem("hg_knowledge_memory_v1")), entries: JSON.parse(localStorage.getItem("hg_knowledge_entries_v2")) }));
const bundle = stored.memory.bundles["e2e_place::set_1"];
assert.equal(bundle.knowledge_units.length, 2);
assert.equal(bundle.knowledge_units.filter((unit) => unit.assessment.state === "mastered").length, 1);
assert.equal(bundle.knowledge_units.filter((unit) => unit.assessment.state === "needs_review").length, 1);
assert.equal(stored.entries.length, 2);
assert.equal(stored.entries.some((entry) => entry.text.includes("Når åpnet")), false);
await page.click("#quizSummaryKnowledge");
await page.waitForSelector("#quizKnowledgeMemoryModal");
assert.match(await page.textContent("#quizKnowledgeMemoryModal"), /E2E-stedet åpnet i 2020/);
await page.reload();
await page.waitForFunction(() => window.hgKnowledgeProfileV2?.subjects?.by?.emner?.length > 0);
const profile = await page.evaluate(() => window.hgKnowledgeProfileV2);
assert.equal(profile.subjects.by.emners, undefined);
assert.equal(profile.subjects.by.emner.find((emne) => emne.emne_id === "em_by_e2e").knowledge_count, 2);
assert.match(await page.textContent("#knowledgeContent"), /Arkitekt A tegnet E2E-stedet/);
await browser.close(); server.close();
console.log("knowledge browser e2e ok");
`);

let pkg = JSON.parse(read("package.json"));
pkg.scripts["test:knowledge-core"] = "node --test tests/knowledge-v2-model.test.js tests/quiz-knowledge-memory.test.js tests/knowledge-profile-memory-integration.test.js tests/knowledge-profile-restore.test.js";
pkg.scripts["test:knowledge-browser"] = "node tests/knowledge-browser-e2e.test.mjs";
write("package.json", JSON.stringify(pkg, null, 2) + "\n");

let workflow = read(".github/workflows/knowledge-checks.yml");
workflow = workflow.replace("          node --check js/quizKnowledgeMemory.js\n", "");
workflow = workflow.replace("      - name: Audit Knowledge links", `      - name: Install browser for Knowledge E2E\n        run: npx playwright install --with-deps chromium\n\n      - name: Run Knowledge browser E2E\n        run: npm run test:knowledge-browser\n\n      - name: Audit Knowledge links`);
write(".github/workflows/knowledge-checks.yml", workflow);

fs.rmSync("js/quizKnowledgeMemory.js");
fs.rmSync("js/knowledgeMemoryPageBridge.js");
console.log("Knowledge runtime unification applied");
