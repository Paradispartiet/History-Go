import assert from "node:assert/strict";
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
const base = "http://127.0.0.1:" + port;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const setData = { targetId: "e2e_place", categoryId: "by", sets: [{ set_id: "set_1", title: "E2E-sett", questions: [
  { quiz_id: "q1", targetId: "e2e_place", categoryId: "by", question: "Når åpnet E2E-stedet?", options: ["2020", "2010"], answer: "2020", knowledge: "E2E-stedet åpnet i 2020.", emne_id: "em_by_e2e", core_concepts: ["byrom"], term_ids: ["åpningsår"] },
  { quiz_id: "q2", targetId: "e2e_place", categoryId: "by", question: "Hvem tegnet E2E-stedet?", options: ["Arkitekt A", "Arkitekt B"], answer: "Arkitekt A", knowledge: "Arkitekt A tegnet E2E-stedet.", emne_id: "em_by_e2e", core_concepts: ["arkitektur"] }
] }] };
await page.route("**/data/quiz/manifest.json", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ files: [], sets: [{ targetId: "e2e_place", file: "tests/fixtures/e2e-set.json", set_id: "set_1", order: 1 }] }) }));
await page.route("**/tests/fixtures/e2e-set.json", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify(setData) }));
await page.goto(base + "/tests/fixtures/knowledge-e2e.html");
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
await page.waitForSelector("#quizKnowledgeMemoryReview");
await page.click("#quizKnowledgeMemoryReview");
await page.waitForFunction(() => document.querySelector("#quizQuestion")?.textContent?.includes("Hvem tegnet"));
assert.match(await page.textContent("#quizProgress"), /1\/1/);
await page.click('#quizChoices button[data-idx="0"]');
await page.waitForSelector("#quizSummaryModal");
await page.waitForFunction(() => {
  const memory = JSON.parse(localStorage.getItem("hg_knowledge_memory_v1"));
  return memory.bundles["e2e_place::set_1"].knowledge_units.every((unit) => unit.assessment.state === "mastered");
});
const reviewed = await page.evaluate(() => JSON.parse(localStorage.getItem("hg_knowledge_memory_v1")).bundles["e2e_place::set_1"]);
assert.equal(reviewed.knowledge_units.length, 2);
assert.equal(reviewed.knowledge_units.filter((unit) => unit.assessment.state === "needs_review").length, 0);
assert.equal(reviewed.review.attempt_count, 1);
await page.reload();
await page.waitForFunction(() => window.hgKnowledgeProfileV2?.subjects?.by?.emner?.length > 0);
const profile = await page.evaluate(() => window.hgKnowledgeProfileV2);
assert.equal(profile.subjects.by.emners, undefined);
assert.equal(profile.subjects.by.emner.find((emne) => emne.emne_id === "em_by_e2e").knowledge_count, 2);
assert.match(await page.textContent("#knowledgeContent"), /Arkitekt A tegnet E2E-stedet/);
assert.equal(profile.quiz_memory.summary.review_count, 0);
assert.equal((await page.textContent("#knowledgeMemoryOverview")).includes("Gjenta feil"), false);
await browser.close(); server.close();
console.log("knowledge browser e2e ok");
