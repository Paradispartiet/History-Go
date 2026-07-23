import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { auditQuizProductionContext } from "../scripts/audit-quiz-production-context.mjs";
import { auditQuizProgression } from "../scripts/audit-quiz-progression.mjs";
import { auditQuizTheoryBinding } from "../scripts/audit-quiz-theory-binding.mjs";
import { buildQuizProductionContext } from "../scripts/quiz-production-lib.mjs";

test("builds the full by production context through the manifest", async () => {
  const context = await buildQuizProductionContext({
    categoryId: "by",
    targetId: "deichman_bjorvika"
  });

  assert.equal(context.profile, "rich_5x7");
  assert.equal(context.required_inputs_loaded.length, 7);
  assert.equal(Object.keys(context.resolved_files).length, 7);
  assert.ok(Object.values(context.resolved_files).every((record) => record.bytes > 0 && record.sha256.length === 64));
  assert.equal(context.manifest.category_id, "by");
  assert.equal(context.manifest.target_id, "deichman_bjorvika");
  assert.equal(context.manifest.matches, 1);
  assert.equal(context.considered_curriculum.counts.pensum_modules, 7);
  assert.equal(context.considered_curriculum.counts.emner, 82);
  assert.equal(context.considered_curriculum.counts.topic_hooks, 81);
  assert.equal(context.considered_curriculum.counts.methods, 14);
  assert.equal(context.claim_bank.length, 35);
  assert.equal(context.source_files.brief.path, "data/quiz/production_briefs/by/deichman_bjorvika.json");
  assert.equal(context.source_files.quiz, undefined);
  assert.equal(context.planned_quiz_file, "data/quiz/by/deichman_bjorvika_sets.json");
  assert.deepEqual(context.set_plan.map((set) => set.phase), [
    "opening",
    "middle",
    "middle",
    "bridge",
    "final"
  ]);
  assert.ok(context.set_plan.every((set) => set.planned_questions === 7));
  assert.ok(context.set_plan.every((set) => set.claim_ids.length === 7));

  const savedContext = JSON.parse(await readFile(
    "data/quiz/production_context/by/deichman_bjorvika.json",
    "utf8"
  ));
  assert.deepEqual(savedContext, context);
});

test("builds the full history production context through domain-based curriculum", async () => {
  const context = await buildQuizProductionContext({
    categoryId: "historie",
    targetId: "grindheim_runestein"
  });

  assert.equal(context.profile, "narrow_3x7");
  assert.equal(context.required_inputs_loaded.length, 7);
  assert.equal(Object.keys(context.resolved_files).length, 7);
  assert.ok(Object.values(context.resolved_files).every((record) => record.bytes > 0 && record.sha256.length === 64));
  assert.equal(context.manifest.category_id, "historie");
  assert.equal(context.manifest.target_id, "grindheim_runestein");
  assert.equal(context.manifest.matches, 1);
  assert.equal(context.considered_curriculum.counts.pensum_modules, 12);
  assert.equal(context.considered_curriculum.counts.emner, 45);
  assert.equal(context.considered_curriculum.counts.topic_hooks, 15);
  assert.equal(context.considered_curriculum.counts.methods, 12);
  assert.equal(context.claim_bank.length, 21);
  assert.equal(context.source_files.brief.path, "data/quiz/production_briefs/historie/grindheim_runestein.json");
  assert.equal(context.source_files.quiz, undefined);
  assert.deepEqual(context.source_files.stories.map((record) => record.path), [
    "data/stories/stories_etne_historie_rounds_batch3.json"
  ]);
  assert.ok(context.story_units.some((unit) => unit.id === "st_grindheim_runestein_to_tormodar"));
  assert.equal(context.planned_quiz_file, "data/quiz/historie/grindheim_runestein_sets.json");
  assert.deepEqual(context.set_plan.map((set) => set.phase), [
    "opening",
    "bridge",
    "final"
  ]);
  assert.ok(context.set_plan.every((set) => set.planned_questions === 7));
  assert.ok(context.set_plan.every((set) => set.claim_ids.length === 7));

  const savedContext = JSON.parse(await readFile(
    "data/quiz/production_context/historie/grindheim_runestein.json",
    "utf8"
  ));
  assert.deepEqual(savedContext, context);
});

test("isolates each history target in the manifest proof", async () => {
  const context = await buildQuizProductionContext({
    categoryId: "historie",
    targetId: "grindheim_steinkross"
  });

  assert.equal(context.profile, "narrow_3x7");
  assert.equal(context.required_inputs_loaded.length, 7);
  assert.equal(Object.keys(context.resolved_files).length, 7);
  assert.ok(Object.values(context.resolved_files).every((record) => record.bytes > 0 && record.sha256.length === 64));
  assert.equal(context.manifest.category_id, "historie");
  assert.equal(context.manifest.target_id, "grindheim_steinkross");
  assert.equal(context.manifest.matches, 1);
  assert.equal(context.considered_curriculum.counts.pensum_modules, 12);
  assert.equal(context.considered_curriculum.counts.emner, 45);
  assert.equal(context.considered_curriculum.counts.topic_hooks, 15);
  assert.equal(context.considered_curriculum.counts.methods, 12);
  assert.equal(context.claim_bank.length, 21);
  assert.equal(context.source_files.brief.path, "data/quiz/production_briefs/historie/grindheim_steinkross.json");
  assert.equal(context.source_files.quiz, undefined);
  assert.deepEqual(context.source_files.stories.map((record) => record.path), [
    "data/stories/stories_etne_historie_rounds_batch3.json"
  ]);
  assert.ok(context.story_units.some((unit) => unit.id === "st_grindheim_steinkross_tre_stader"));
  assert.equal(context.planned_quiz_file, "data/quiz/historie/grindheim_steinkross_sets.json");
  assert.deepEqual(context.set_plan.map((set) => set.phase), [
    "opening",
    "bridge",
    "final"
  ]);
  assert.ok(context.set_plan.every((set) => set.planned_questions === 7));
  assert.ok(context.set_plan.every((set) => set.claim_ids.length === 7));

  const savedContext = JSON.parse(await readFile(
    "data/quiz/production_context/historie/grindheim_steinkross.json",
    "utf8"
  ));
  assert.deepEqual(savedContext, context);
});

test("builds the Grindheimsvegen grave-field context before quiz writing", async () => {
  const context = await buildQuizProductionContext({
    categoryId: "historie",
    targetId: "grindheimsveien_nord_gravfelt"
  });

  assert.equal(context.profile, "narrow_3x7");
  assert.equal(context.required_inputs_loaded.length, 7);
  assert.equal(Object.keys(context.resolved_files).length, 7);
  assert.ok(Object.values(context.resolved_files).every((record) => record.bytes > 0 && record.sha256.length === 64));
  assert.equal(context.manifest.category_id, "historie");
  assert.equal(context.manifest.target_id, "grindheimsveien_nord_gravfelt");
  assert.equal(context.manifest.matches, 1);
  assert.equal(context.considered_curriculum.counts.pensum_modules, 12);
  assert.equal(context.considered_curriculum.counts.emner, 45);
  assert.equal(context.considered_curriculum.counts.topic_hooks, 15);
  assert.equal(context.considered_curriculum.counts.methods, 12);
  assert.equal(context.claim_bank.length, 21);
  assert.equal(
    context.source_files.brief.path,
    "data/quiz/production_briefs/historie/grindheimsveien_nord_gravfelt.json"
  );
  assert.equal(context.source_files.quiz, undefined);
  assert.deepEqual(context.source_files.stories.map((record) => record.path), [
    "data/stories/stories_etne_historie_rounds_batch3.json"
  ]);
  assert.ok(context.story_units.some((unit) => unit.id === "st_grindheim_gravfelt_talet_og_restane"));
  assert.equal(
    context.planned_quiz_file,
    "data/quiz/historie/grindheimsveien_nord_gravfelt_sets.json"
  );
  assert.deepEqual(context.set_plan.map((set) => set.phase), [
    "opening",
    "bridge",
    "final"
  ]);
  assert.ok(context.set_plan.every((set) => set.planned_questions === 7));
  assert.ok(context.set_plan.every((set) => set.claim_ids.length === 7));

  const savedContext = JSON.parse(await readFile(
    "data/quiz/production_context/historie/grindheimsveien_nord_gravfelt.json",
    "utf8"
  ));
  assert.deepEqual(savedContext, context);
});

test("passes production-context, progression and theory-binding audits", async () => {
  const reports = await Promise.all([
    auditQuizProductionContext(),
    auditQuizProgression(),
    auditQuizTheoryBinding()
  ]);

  for (const report of reports) {
    assert.equal(report.status, "passed", JSON.stringify(report.failures, null, 2));
    assert.equal(report.quizFilesChecked, 4);
  }
});
