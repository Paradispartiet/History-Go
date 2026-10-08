import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { auditQuizWiring, inspectQuizPackage } from "../scripts/audit-quiz-wiring.mjs";

const question = (id, targetId) => ({
  id, targetId, placeId: targetId, categoryId: "by",
  question: "Hva er riktig?", options: ["Ja", "Nei"], answer: "Ja", answerIndex: 0,
  knowledge: "Ja er riktig."
});
const setFile = (targetId) => ({
  targetId, categoryId: "by",
  sets: [{ set_id: "by_" + targetId + "_1", questions: [question("q_" + targetId, targetId)] }]
});

async function fixture(run) {
  const root = await mkdtemp(path.join(os.tmpdir(), "hg-quiz-wiring-"));
  const save = async (name, data) => {
    const dest = path.join(root, name);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, JSON.stringify(data));
  };
  try {
    await save("data/quiz/manifest.json", {
      files: ["data/quiz/quiz_legacy.json"],
      sets: [{ targetId: "live", file: "data/quiz/by/live_sets.json" }],
      targets: [{ targetId: "missing", file: "data/quiz/by/missing_sets.json" }],
      subjectPackages: [{ subjectId: "by", file: "data/quiz/by/subject.json" }]
    });
    await save("data/quiz/quiz_legacy.json", [question("old", "legacy")]);
    await save("data/quiz/by/live_sets.json", setFile("live"));
    await save("data/quiz/by/missing_sets.json", setFile("missing"));
    await save("data/quiz/by/another_sets.json", setFile("another"));
    await save("data/quiz/by/old_upgrade_sets.json", setFile("legacy"));
    await save("data/quiz/by/live_other_sets.json", setFile("live"));
    await save("data/quiz/by/subject.json", { question_sets: [{ questions: [question("x", "by")] }] });
    await save("data/quiz/by/arkiv/old_sets.json", setFile("archive"));
    await save("data/quiz/regler/schema.json", { type: "object" });
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("runtime sources are only files and sets, not targets metadata", async () => {
  await fixture(async (root) => {
    const report = await auditQuizWiring({ root });
    const statuses = Object.fromEntries(report.files.map((file) => [file.file, file.status]));
    assert.equal(statuses["data/quiz/by/live_sets.json"], "active_set");
    assert.equal(statuses["data/quiz/quiz_legacy.json"], "active_legacy");
    assert.equal(statuses["data/quiz/by/subject.json"], "subject_package");
    assert.equal(statuses["data/quiz/by/missing_sets.json"], "unregistered_set");
    assert.equal(statuses["data/quiz/by/another_sets.json"], "unregistered_set");
    assert.equal(statuses["data/quiz/by/live_other_sets.json"], "unregistered_set_with_active_sets");
    assert.equal(statuses["data/quiz/by/old_upgrade_sets.json"], "unregistered_set_with_legacy");
    assert.equal(statuses["data/quiz/by/arkiv/old_sets.json"], "archived");
    assert.ok(!statuses["data/quiz/regler/schema.json"]);
    assert.equal(report.summary.unregisteredPlayableFiles, 4);
    assert.equal(report.summary.brokenReferences, 0);
    assert.equal(report.files.find((file) => file.targetId === "missing")
      .mentionedInNonRuntimeManifestSection, true);
  });
});

test("flags invalid answers, target mismatch and duplicate set ids", () => {
  const obj = setFile("right");
  obj.sets[0].questions[0].targetId = "wrong";
  obj.sets[0].questions[0].placeId = "wrong";
  obj.sets[0].questions[0].answerIndex = 1;
  obj.sets.push({ ...obj.sets[0], questions: [] });
  const result = inspectQuizPackage("bad.json", obj);
  assert.ok(result.structuralIssues.includes("target_mismatch"));
  assert.ok(result.structuralIssues.includes("invalid_answer"));
  assert.ok(result.structuralIssues.includes("missing_or_duplicate_set_id"));
  assert.ok(result.structuralIssues.includes("empty_set"));
});

test("Ullevål Hageby is wired with valid four-set canonical place quiz", async () => {
  const manifest = JSON.parse(await readFile("data/quiz/manifest.json", "utf8"));
  const file = "data/quiz/by/ullevål_hageby_sets.json";
  const setEntries = manifest.sets.filter((entry) => entry.targetId === "ullevål_hageby");
  assert.equal(setEntries.length, 1);
  assert.equal(setEntries[0].file, file);
  const quiz = JSON.parse(await readFile(file, "utf8"));
  const result = inspectQuizPackage(file, quiz);
  assert.deepEqual(result.structuralIssues, []);
  assert.equal(result.sets, 4);
  assert.equal(result.questions, 28);
  assert.deepEqual(result.firstTwoSetSizes, [7, 7]);
  const place = JSON.parse(await readFile("data/places/by/oslo/places/ullevål_hageby.json", "utf8"));
  assert.equal(place.id, quiz.targetId);
});
